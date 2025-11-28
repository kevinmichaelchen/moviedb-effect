/**
 * Test utilities for Movie API clients
 *
 * Provides mock implementations of services for unit testing.
 */

import { Effect, Layer } from 'effect'
import type { RateLimiterService } from './rate-limiter.ts'
import { RateLimiter } from './rate-limiter.ts'

/**
 * Mock RateLimiter that executes effects immediately without rate limiting
 *
 * Useful for testing without dealing with timing concerns.
 *
 * @example
 * ```ts
 * import { Console, Effect } from "effect"
 *
 * const program = Effect.gen(function* () {
 *   const limiter = yield* RateLimiter
 *   const result = yield* limiter.execute(Effect.succeed(42))
 *   yield* Console.log(result) // 42
 * }).pipe(Effect.provide(MockRateLimiter))
 * ```
 */
export const MockRateLimiter: Layer.Layer<RateLimiter, never, never> = Layer.succeed(
  RateLimiter,
  RateLimiter.of({
    // Execute immediately without rate limiting
    execute: <A, E, R>(effect: Effect.Effect<A, E, R>) => effect,
  }),
)

/**
 * Create a mock rate limiter service instance
 *
 * @example
 * ```ts
 * const mockLimiter = makeMockRateLimiterService()
 * ```
 */
export const makeMockRateLimiterService = (): RateLimiterService => ({
  execute: <A, E, R>(effect: Effect.Effect<A, E, R>) => effect,
})
