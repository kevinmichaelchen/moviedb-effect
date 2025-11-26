/**
 * Tests for streaming/pagination utilities
 */

import { Chunk, Effect, Fiber, Stream, TestClock, TestContext } from 'effect'
import { describe, it, expect } from '@effect/vitest'
import {
  collectAllPages,
  mapPaginated,
  mapPaginatedEffect,
  paginatedStream,
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

describe('Streaming', () => {
  it.effect('paginatedStream - fetches all pages', () =>
    Effect.gen(function* () {
      const fetchPage = (page: number) =>
        Effect.succeed(createMockPage(page, 3, 2, (i) => ({ id: i, name: `Item ${i}` })))

      const chunk = yield* paginatedStream(fetchPage).pipe(Stream.runCollect)
      const results = Chunk.toReadonlyArray(chunk)

      expect(results.length).toBe(6) // 3 pages * 2 items
      expect(results[0].id).toBe(0)
      expect(results[5].id).toBe(5)
    }),
  )

  it.effect('paginatedStream - respects maxPages limit', () =>
    Effect.gen(function* () {
      const fetchPage = (page: number) => Effect.succeed(createMockPage(page, 10, 5, (i) => ({ id: i })))

      const chunk = yield* paginatedStream(fetchPage, { maxPages: 2 }).pipe(Stream.runCollect)
      const results = Chunk.toReadonlyArray(chunk)

      expect(results.length).toBe(10) // 2 pages * 5 items
    }),
  )

  it.effect('paginatedStream - respects maxResults limit', () =>
    Effect.gen(function* () {
      const fetchPage = (page: number) => Effect.succeed(createMockPage(page, 10, 5, (i) => ({ id: i })))

      const chunk = yield* paginatedStream(fetchPage, { maxResults: 12 }).pipe(Stream.runCollect)
      const results = Chunk.toReadonlyArray(chunk)

      expect(results.length).toBe(12) // Limited to 12 items
    }),
  )

  it.effect('paginatedStream - supports custom startPage', () =>
    Effect.gen(function* () {
      const fetchPage = (page: number) => Effect.succeed(createMockPage(page, 5, 2, (i) => ({ id: i })))

      const chunk = yield* paginatedStream(fetchPage, {
        startPage: 2,
        maxPages: 2,
      }).pipe(Stream.runCollect)
      const results = Chunk.toReadonlyArray(chunk)

      expect(results.length).toBe(4) // 2 pages * 2 items
      // Starting from page 2 means items start at index 2
      expect(results[0].id).toBe(2)
    }),
  )

  it.effect('paginatedStream - handles single page', () =>
    Effect.gen(function* () {
      const fetchPage = (page: number) => Effect.succeed(createMockPage(page, 1, 3, (i) => ({ id: i })))

      const chunk = yield* paginatedStream(fetchPage).pipe(Stream.runCollect)
      const results = Chunk.toReadonlyArray(chunk)

      expect(results.length).toBe(3)
    }),
  )

  it.effect('paginatedStream - lazy evaluation', () =>
    Effect.gen(function* () {
      let pagesRequested = 0

      const fetchPage = (page: number) => {
        pagesRequested++
        return Effect.succeed(createMockPage(page, 10, 5, (i) => ({ id: i })))
      }

      // Only take 3 items - should only fetch 1 page
      const chunk = yield* paginatedStream(fetchPage).pipe(Stream.take(3), Stream.runCollect)
      const results = Chunk.toReadonlyArray(chunk)

      expect(results.length).toBe(3)
      expect(pagesRequested).toBe(1) // Only 1 page fetched!
    }),
  )

  it.effect('collectAllPages - collects all results', () =>
    Effect.gen(function* () {
      const fetchPage = (page: number) => Effect.succeed(createMockPage(page, 3, 2, (i) => ({ id: i })))

      const results = yield* collectAllPages(fetchPage)

      expect(results.length).toBe(6)
      expect(results[0].id).toBe(0)
      expect(results[5].id).toBe(5)
    }),
  )

  it.effect('collectAllPages - respects maxPages', () =>
    Effect.gen(function* () {
      const fetchPage = (page: number) => Effect.succeed(createMockPage(page, 10, 5, (i) => ({ id: i })))

      const results = yield* collectAllPages(fetchPage, { maxPages: 2 })

      expect(results.length).toBe(10)
    }),
  )

  it.effect('mapPaginated - transforms results', () =>
    Effect.gen(function* () {
      const fetchPage = (page: number) => Effect.succeed(createMockPage(page, 2, 3, (i) => ({ id: i, value: i * 10 })))

      const results = yield* mapPaginated(fetchPage, (item) => item.value)

      expect(results.length).toBe(6)
      expect(results[0]).toBe(0)
      expect(results[5]).toBe(50)
    }),
  )

  it.effect('mapPaginatedEffect - applies effectful function', () =>
    Effect.gen(function* () {
      const fetchPage = (page: number) => Effect.succeed(createMockPage(page, 2, 2, (i) => ({ id: i })))

      const results = yield* mapPaginatedEffect(fetchPage, (item) => Effect.succeed(item.id * 2), { maxResults: 3 })

      expect(results.length).toBe(3)
      expect(results[0]).toBe(0)
      expect(results[1]).toBe(2)
      expect(results[2]).toBe(4)
    }),
  )

  it.effect('mapPaginatedEffect - respects concurrency', () =>
    Effect.gen(function* () {
      let concurrentCount = 0
      let maxConcurrent = 0

      const fetchPage = (page: number) => Effect.succeed(createMockPage(page, 2, 5, (i) => ({ id: i })))

      // Fork the mapPaginatedEffect so we can control time with TestClock
      const fiber = yield* mapPaginatedEffect(
        fetchPage,
        () =>
          Effect.gen(function* () {
            concurrentCount++
            maxConcurrent = Math.max(maxConcurrent, concurrentCount)
            yield* Effect.sleep('10 millis')
            concurrentCount--
            return true
          }),
        { concurrency: 3 },
      ).pipe(Effect.fork)

      // Advance the TestClock to allow all sleeps to complete
      yield* TestClock.adjust('100 millis')

      // Wait for the fiber to complete
      yield* Fiber.join(fiber)

      // With concurrency: 3, should never exceed 3 concurrent operations
      expect(maxConcurrent).toBeLessThanOrEqual(3)
    }).pipe(Effect.provide(TestContext.TestContext)),
  )
})
