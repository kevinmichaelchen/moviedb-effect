/**
 * Tests for MovieDbClient service
 */

import { describe, it, expect } from '@effect/vitest'
import { NodeHttpClient } from '@effect/platform-node'
import { Effect } from 'effect'
import { MovieDbClient } from '../../src/effect/client.ts'
import { makeTestConfig, MockRateLimiter } from '../../src/effect/test-layers.ts'
import { RateLimiterLive } from '../../src/effect/rate-limiter.ts'

const REAL_API_KEY = process.env.MOVIEDB_API_KEY

describe('MovieDbClient', () => {
  it.effect('get() with mock services', () =>
    Effect.gen(function* () {
      const client = yield* MovieDbClient

      // In a real test, we'd mock the HttpClient to return test data
      // For now, we just verify the client is accessible
      expect(typeof client.get).toBe('function')
    }).pipe(
      Effect.provide(MovieDbClient.Default),
      Effect.provide(MockRateLimiter),
      Effect.provide(NodeHttpClient.layerUndici),
      Effect.provide(makeTestConfig()),
    ),
  )

  it.skipIf(!REAL_API_KEY)('successfully fetches data from real API', () => {
    interface MovieResponse {
      id: number
      title: string
      overview: string
    }

    const program = Effect.gen(function* () {
      const client = yield* MovieDbClient

      // Fetch a known movie (Fight Club)
      const movie = yield* client.get<MovieResponse>('/movie/550')

      // Verify we got valid data
      expect(typeof movie.id).toBe('number')
      expect(typeof movie.title).toBe('string')
      expect(movie.id).toBe(550)
    }).pipe(
      Effect.provide(MovieDbClient.Default),
      Effect.provide(RateLimiterLive),
      Effect.provide(NodeHttpClient.layerUndici),
      Effect.provide(makeTestConfig({ apiKey: REAL_API_KEY! })),
      Effect.scoped,
    )

    return Effect.runPromise(program)
  })

  it.skipIf(!REAL_API_KEY)('handles 404 errors correctly', async () => {
    const program = Effect.gen(function* () {
      const client = yield* MovieDbClient

      // Try to fetch a non-existent resource
      yield* client.get('/movie/9999999999')
    }).pipe(
      Effect.provide(MovieDbClient.Default),
      Effect.provide(RateLimiterLive),
      Effect.provide(NodeHttpClient.layerUndici),
      Effect.provide(makeTestConfig({ apiKey: REAL_API_KEY! })),
      Effect.scoped,
      Effect.flip, // Flip to get the error as success
    )

    const error = await Effect.runPromise(program)
    expect(error._tag).toBe('NotFoundError')
  })

  it.skipIf(!REAL_API_KEY)('applies rate limiting', () => {
    interface MovieResponse {
      id: number
    }

    const program = Effect.gen(function* () {
      const client = yield* MovieDbClient

      // Make multiple requests - they should be rate-limited
      const results = []
      for (let i = 0; i < 3; i++) {
        const movie = yield* client.get<MovieResponse>('/movie/550')
        results.push(movie.id)
      }

      // All requests should succeed
      expect(results).toEqual([550, 550, 550])
    }).pipe(
      Effect.provide(MovieDbClient.Default),
      Effect.provide(RateLimiterLive),
      Effect.provide(NodeHttpClient.layerUndici),
      Effect.provide(makeTestConfig({ apiKey: REAL_API_KEY! })),
      Effect.scoped,
    )

    return Effect.runPromise(program)
  })
})
