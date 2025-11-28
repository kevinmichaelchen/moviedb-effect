/**
 * Rate limiting service for TMDB API client
 *
 * Uses the core rate limiter with TMDB-specific configuration.
 */

import { makeRateLimiter as coreMakeRateLimiter, RateLimiter, RateLimitPresets } from '@movie-effect/core'
import { Effect, Layer } from 'effect'
import { TmdbConfig } from './config.ts'

// Re-export core rate limiter types
export { RateLimiter, type RateLimiterConfig, type RateLimiterService } from '@movie-effect/core'

/**
 * Create a TMDB-specific RateLimiter from configuration
 *
 * Uses Effect's built-in RateLimiter with token-bucket algorithm:
 * - Spreads requests evenly over the interval
 * - Allows burst capacity naturally via token accumulation
 * - Scoped resource (automatic cleanup)
 */
export const makeRateLimiter = () =>
  Effect.gen(function*() {
    const config = yield* TmdbConfig
    return yield* coreMakeRateLimiter({
      requestsPerSecond: config.requestsPerSecond,
    })
  })

/**
 * Layer that provides the RateLimiter service for TMDB
 *
 * @example
 * ```ts
 * const program = Effect.gen(function* () {
 *   const limiter = yield* RateLimiter
 *   const result = yield* limiter.execute(myEffect)
 * }).pipe(
 *   Effect.provide(RateLimiterLive),
 *   Effect.provide(TmdbConfigLayer),
 *   Effect.scoped
 * )
 * ```
 */
export const RateLimiterLive: Layer.Layer<RateLimiter, never, TmdbConfig> = Layer.scoped(
  RateLimiter,
  Effect.gen(function*() {
    const config = yield* TmdbConfig
    return yield* coreMakeRateLimiter({
      requestsPerSecond: config.requestsPerSecond,
    })
  }),
)

/**
 * Default rate limit for TMDB API (50 requests/second)
 */
export const TmdbRateLimitConfig = RateLimitPresets.tmdb
