/**
 * Edge case tests for streaming and pagination
 *
 * Tests backpressure, error handling, concurrency, and early termination.
 */

import { describe, it, expect } from '@effect/vitest'
import { Chunk, Effect, Fiber, Stream, TestClock, TestContext } from 'effect'
import {
  paginatedStream,
  collectAllPages,
  mapPaginated,
  mapPaginatedEffect,
  type PaginatedResponse,
} from '../../src/effect/streaming.ts'

// Mock paginated response factory
const createMockPage = <T>(
  page: number,
  totalPages: number,
  itemsPerPage: number,
  itemFactory: (index: number) => T,
): PaginatedResponse<T> => {
  const startIndex = (page - 1) * itemsPerPage
  const results = Array.from({ length: itemsPerPage }, (_, i) => itemFactory(startIndex + i))

  return {
    page,
    results,
    totalPages,
    totalResults: totalPages * itemsPerPage,
  }
}

describe('Streaming Edge Cases', () => {
  it.effect('paginatedStream - handles single page', () =>
    Effect.gen(function* () {
      const fetchPage = (page: number) => Effect.succeed(createMockPage(page, 1, 5, (i) => ({ id: i })))

      const chunk = yield* paginatedStream(fetchPage).pipe(Stream.runCollect)
      const results = Chunk.toReadonlyArray(chunk)

      expect(results.length).toBe(5)
      expect(results[0].id).toBe(0)
      expect(results[4].id).toBe(4)
    }),
  )

  it.effect('paginatedStream - handles empty results', () =>
    Effect.gen(function* () {
      const fetchPage = (page: number) => Effect.succeed(createMockPage(page, 0, 0, (i) => ({ id: i })))

      const chunk = yield* paginatedStream(fetchPage).pipe(Stream.runCollect)
      const results = Chunk.toReadonlyArray(chunk)

      expect(results.length).toBe(0)
    }),
  )

  it.effect('paginatedStream - respects startPage option', () =>
    Effect.gen(function* () {
      const fetchedPages: number[] = []
      const fetchPage = (page: number) => {
        fetchedPages.push(page)
        return Effect.succeed(createMockPage(page, 5, 2, (i) => ({ id: i })))
      }

      yield* paginatedStream(fetchPage, { startPage: 3 }).pipe(Stream.runDrain)

      // Should start at page 3, go through page 5
      expect(fetchedPages[0]).toBe(3)
      expect(fetchedPages[fetchedPages.length - 1]).toBe(5)
    }),
  )

  it.effect("paginatedStream - lazy evaluation (doesn't fetch if not consumed)", () =>
    Effect.gen(function* () {
      let fetchCount = 0
      const fetchPage = (page: number) => {
        fetchCount++
        return Effect.succeed(createMockPage(page, 10, 5, (i) => ({ id: i })))
      }

      // No fetches should happen before consuming
      expect(fetchCount).toBe(0)

      // Now consume first page
      const chunk = yield* paginatedStream(fetchPage).pipe(Stream.take(5), Stream.runCollect)

      // Should have fetched exactly once (for first page)
      expect(fetchCount).toBe(1)
      expect(Chunk.toReadonlyArray(chunk).length).toBe(5)
    }),
  )

  it.effect('paginatedStream - early termination with Stream.take', () =>
    Effect.gen(function* () {
      const fetchedPages: number[] = []
      const fetchPage = (page: number) => {
        fetchedPages.push(page)
        return Effect.succeed(createMockPage(page, 100, 10, (i) => ({ id: i })))
      }

      // Only take 15 items - should fetch 2 pages
      const chunk = yield* paginatedStream(fetchPage).pipe(Stream.take(15), Stream.runCollect)
      const results = Chunk.toReadonlyArray(chunk)

      expect(results.length).toBe(15)
      expect(fetchedPages.length).toBe(2) // Page 1 and 2
    }),
  )

  it.effect('paginatedStream - maxPages with startPage combination', () =>
    Effect.gen(function* () {
      const fetchedPages: number[] = []
      const fetchPage = (page: number) => {
        fetchedPages.push(page)
        return Effect.succeed(createMockPage(page, 20, 5, (i) => ({ id: i })))
      }

      yield* paginatedStream(fetchPage, {
        startPage: 5,
        maxPages: 3,
      }).pipe(Stream.runDrain)

      expect(fetchedPages).toEqual([5, 6, 7]) // 3 pages starting from 5
    }),
  )

  it.effect('paginatedStream - maxResults with uneven page sizes', () =>
    Effect.gen(function* () {
      const fetchPage = (page: number) => Effect.succeed(createMockPage(page, 10, 3, (i) => ({ id: i })))

      const chunk = yield* paginatedStream(fetchPage, {
        maxResults: 7,
      }).pipe(Stream.runCollect)
      const results = Chunk.toReadonlyArray(chunk)

      // Should get exactly 7 results
      expect(results.length).toBe(7)
    }),
  )

  it.effect('paginatedStream - handles errors in page fetch', () =>
    Effect.gen(function* () {
      let pageAttempted = 0
      const fetchPage = (page: number) => {
        pageAttempted = page
        if (page === 2) {
          return Effect.fail(new Error('Network error on page 2'))
        }
        return Effect.succeed(createMockPage(page, 5, 3, (i) => ({ id: i })))
      }

      const result = yield* paginatedStream(fetchPage).pipe(Stream.runCollect, Effect.either)

      expect(result._tag).toBe('Left')
      expect(pageAttempted).toBe(2)
    }),
  )

  it.effect('mapPaginated - transforms all results correctly', () =>
    Effect.gen(function* () {
      const fetchPage = (page: number) =>
        Effect.succeed(createMockPage(page, 3, 2, (i) => ({ id: i, name: `Item ${i}` })))

      const results = yield* mapPaginated(fetchPage, (item) => item.name.toUpperCase())

      expect(results.length).toBe(6) // 3 pages * 2 items
      expect(results[0]).toBe('ITEM 0')
      expect(results[5]).toBe('ITEM 5')
    }),
  )

  it.effect('mapPaginatedEffect - processes with concurrency', () =>
    Effect.gen(function* () {
      const fetchPage = (page: number) => Effect.succeed(createMockPage(page, 2, 3, (i) => ({ id: i })))

      let processedCount = 0

      // Fork the mapPaginatedEffect so we can control time with TestClock
      const fiber = yield* mapPaginatedEffect(
        fetchPage,
        (item) =>
          Effect.gen(function* () {
            // Simulate async work
            yield* Effect.sleep('10 millis')
            processedCount++
            return item.id * 2
          }),
        { concurrency: 2 },
      ).pipe(Effect.fork)

      // Advance the TestClock to allow all sleeps to complete
      yield* TestClock.adjust('100 millis')

      // Wait for the fiber to complete
      const results = yield* Fiber.join(fiber)

      expect(results.length).toBe(6)
      expect(results[0]).toBe(0)
      expect(results[5]).toBe(10)
      expect(processedCount).toBe(6)
    }).pipe(Effect.provide(TestContext.TestContext)),
  )

  it.effect('mapPaginatedEffect - respects maxResults', () =>
    Effect.gen(function* () {
      let processingCount = 0
      const fetchPage = (page: number) => Effect.succeed(createMockPage(page, 10, 10, (i) => ({ id: i })))

      const results = yield* mapPaginatedEffect(
        fetchPage,
        (item) => {
          processingCount++
          return Effect.succeed(item.id)
        },
        { maxResults: 15 },
      )

      expect(results.length).toBe(15)
      expect(processingCount).toBe(15) // Should only process 15 items
    }),
  )

  it.effect('collectAllPages - memory warning prevention', () =>
    Effect.gen(function* () {
      const fetchPage = (page: number) =>
        Effect.succeed(createMockPage(page, 5, 10, (i) => ({ id: i, data: 'x'.repeat(100) })))

      // Use maxResults to prevent loading all pages
      const results = yield* collectAllPages(fetchPage, { maxPages: 2 })

      expect(results.length).toBe(20) // 2 pages * 10 items
    }),
  )

  it.effect('paginatedStream - filter while streaming', () =>
    Effect.gen(function* () {
      const fetchPage = (page: number) =>
        Effect.succeed(createMockPage(page, 5, 5, (i) => ({ id: i, score: Math.floor(Math.random() * 100) })))

      const chunk = yield* paginatedStream(fetchPage).pipe(
        Stream.filter((item) => item.score > 50),
        Stream.runCollect,
      )
      const results = Chunk.toReadonlyArray(chunk)

      // All results should have score > 50 (or we got none if random was unlucky)
      for (const item of results) {
        expect(item.score).toBeGreaterThan(50)
      }
    }),
  )

  it.effect('paginatedStream - map while streaming', () =>
    Effect.gen(function* () {
      const fetchPage = (page: number) =>
        Effect.succeed(createMockPage(page, 2, 3, (i) => ({ id: i, name: `Movie ${i}` })))

      const chunk = yield* paginatedStream(fetchPage).pipe(
        Stream.map((item) => item.name),
        Stream.runCollect,
      )
      const results = Chunk.toReadonlyArray(chunk)

      expect(results.length).toBe(6)
      expect(results[0]).toBe('Movie 0')
      expect(results[5]).toBe('Movie 5')
    }),
  )

  it.effect('paginatedStream - batch processing', () =>
    Effect.gen(function* () {
      const fetchPage = (page: number) => Effect.succeed(createMockPage(page, 3, 2, (i) => ({ id: i })))

      const batches = yield* paginatedStream(fetchPage).pipe(
        Stream.grouped(3), // Group by 3 items
        Stream.runCollect,
      )

      const batchArray = Chunk.toReadonlyArray(batches)
      // Should have 2 batches: [0,1,2] and [3,4,5]
      expect(batchArray.length).toBe(2)
    }),
  )
})
