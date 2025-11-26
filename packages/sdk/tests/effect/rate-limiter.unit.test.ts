/**
 * Tests for RateLimiter service using Effect's built-in token-bucket limiter
 */

import { describe, it, expect } from '@effect/vitest'
import { Effect } from 'effect'
import { makeRateLimiter } from '../../src/effect/rate-limiter.ts'
import type { MovieDbConfigOptions } from '../../src/effect/config.ts'

const makeTestRateLimiter = (overrides?: Partial<MovieDbConfigOptions>) => {
  const config: MovieDbConfigOptions = {
    apiKey: 'test-key',
    baseUrl: 'https://api.themoviedb.org/4/',
    requestsPerSecond: 10, // 1 request per 100ms
    ...overrides,
  }
  return makeRateLimiter(config)
}

describe('RateLimiter', () => {
  it.effect('executes effects successfully', () =>
    Effect.gen(function* () {
      const limiter = yield* makeTestRateLimiter()
      const result = yield* limiter.execute(Effect.succeed(42))
      expect(result).toBe(42)
    }).pipe(Effect.scoped),
  )

  it.effect('executes multiple effects', () =>
    Effect.gen(function* () {
      const limiter = yield* makeTestRateLimiter({
        requestsPerSecond: 100, // Fast rate for testing
      })

      // Execute multiple tasks through the rate limiter
      const results = []
      for (let i = 0; i < 5; i++) {
        const result = yield* limiter.execute(Effect.succeed(i))
        results.push(result)
      }

      // All tasks should complete successfully
      expect(results).toEqual([0, 1, 2, 3, 4])
    }).pipe(Effect.scoped),
  )

  it.effect('handles errors in rate-limited effects', () =>
    Effect.gen(function* () {
      const limiter = yield* makeTestRateLimiter()

      // Effect that fails
      const failingEffect = Effect.fail(new Error('Test error'))

      const result = yield* limiter.execute(failingEffect).pipe(
        Effect.flip, // Flip to get the error as success
      )

      expect(result.message).toBe('Test error')
    }).pipe(Effect.scoped),
  )

  it.effect('automatic cleanup via Scope', () =>
    Effect.gen(function* () {
      const limiter = yield* makeTestRateLimiter()

      // Execute some work
      const result1 = yield* limiter.execute(Effect.succeed(1))
      const result2 = yield* limiter.execute(Effect.succeed(2))

      expect(result1).toBe(1)
      expect(result2).toBe(2)

      // RateLimiter will be automatically cleaned up when scope ends
    }).pipe(Effect.scoped),
  )
})
