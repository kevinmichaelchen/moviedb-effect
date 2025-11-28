/**
 * Rate limiting service for Movie API clients
 *
 * Uses Effect's built-in RateLimiter with token-bucket algorithm.
 */

import { Context, Effect, Layer, RateLimiter as EffectRateLimiter, Scope } from 'effect'

/**
 * Configuration for rate limiting
 */
export interface RateLimiterConfig {
  /**
   * Maximum number of requests per second
   */
  readonly requestsPerSecond: number
}

/**
 * RateLimiter service interface
 *
 * Provides rate-limited execution of Effect programs using Effect's built-in
 * token-bucket rate limiter.
 *
 * @example
 * ```ts
 * const program = Effect.gen(function* () {
 *   const limiter = yield* RateLimiter
 *   const result = yield* limiter.execute(
 *     Effect.tryPromise(() => fetch("https://api.example.com/movie/550"))
 *   )
 * })
 * ```
 */
export interface RateLimiterService {
  /**
   * Execute an Effect with rate limiting
   *
   * Applies token-bucket rate limiting to the effect. The effect will wait
   * for a token before starting execution.
   *
   * @param effect - The Effect to execute with rate limiting
   * @returns The result of the effect, rate-limited
   */
  readonly execute: <A, E, R>(effect: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>
}

/**
 * RateLimiter service tag
 */
export class RateLimiter extends Context.Tag('RateLimiter')<RateLimiter, RateLimiterService>() {}

/**
 * Create a RateLimiter from configuration
 *
 * Uses Effect's built-in RateLimiter with token-bucket algorithm:
 * - Spreads requests evenly over the interval
 * - Allows burst capacity naturally via token accumulation
 * - Scoped resource (automatic cleanup)
 *
 * @example
 * ```ts
 * const program = Effect.gen(function* () {
 *   const limiter = yield* makeRateLimiter({ requestsPerSecond: 50 })
 *   // ... use limiter
 * }).pipe(Effect.scoped)
 * ```
 */
export const makeRateLimiter = (config: RateLimiterConfig): Effect.Effect<RateLimiterService, never, Scope.Scope> =>
  Effect.gen(function*() {
    // Create the Effect RateLimiter with token-bucket algorithm
    const rateLimiter = yield* EffectRateLimiter.make({
      limit: config.requestsPerSecond,
      interval: '1 seconds',
      algorithm: 'token-bucket',
    })

    return {
      execute: <A, E, R>(effect: Effect.Effect<A, E, R>) => rateLimiter(effect),
    }
  })

/**
 * Create a RateLimiter layer from a config tag
 *
 * @example
 * ```ts
 * const RateLimiterLive = makeRateLimiterLayer(MyApiConfig)
 * ```
 */
export const makeRateLimiterLayer = <T extends RateLimiterConfig, I>(
  configTag: Context.Tag<I, T>,
): Layer.Layer<RateLimiter, never, I> =>
  Layer.scoped(
    RateLimiter,
    Effect.gen(function*() {
      const config = yield* configTag
      return yield* makeRateLimiter(config)
    }),
  )

/**
 * Preset rate limit configurations for different APIs
 */
export const RateLimitPresets = {
  /** TMDB: ~50 requests per second */
  tmdb: { requestsPerSecond: 50 },
  /** OMDB: 1000 requests per day (conservative: ~1 per 90s) */
  omdb: { requestsPerSecond: 1 },
  /** Trakt: 1000 requests per 5 minutes (~3 per second) */
  trakt: { requestsPerSecond: 3 },
  /** WatchMode: varies by plan, default conservative */
  watchmode: { requestsPerSecond: 1 },
  /** Letterboxd: unknown, conservative default */
  letterboxd: { requestsPerSecond: 1 },
} as const satisfies Record<string, RateLimiterConfig>
