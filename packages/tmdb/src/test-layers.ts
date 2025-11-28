/**
 * Test layers for mocking Effect services
 *
 * Provides mock implementations of services for unit testing.
 */

import { MockRateLimiter, RateLimiter } from '@movie-effect/core'
import { Layer } from 'effect'
import type { TmdbConfigOptions } from './config.ts'
import { TmdbConfig } from './config.ts'

/**
 * Create a test TmdbConfig layer with customizable options
 *
 * @example
 * ```ts
 * import { Console, Effect } from "effect"
 *
 * const testConfig = makeTestConfig({ apiKey: "test-key" })
 * const program = Effect.gen(function* () {
 *   const config = yield* TmdbConfig
 *   yield* Console.log(config.apiKey) // "test-key"
 * }).pipe(Effect.provide(testConfig))
 * ```
 */
export const makeTestConfig = (overrides?: Partial<TmdbConfigOptions>): Layer.Layer<TmdbConfig, never, never> => {
  const config: TmdbConfigOptions = {
    apiKey: 'test-api-key',
    baseUrl: 'https://api.themoviedb.org/3/',
    requestsPerSecond: 50,
    ...overrides,
  }

  return Layer.succeed(TmdbConfig, config)
}

// Re-export MockRateLimiter from core
export { MockRateLimiter }

/**
 * Full test layer combining all mock services
 *
 * @example
 * ```ts
 * const program = Effect.gen(function* () {
 *   const config = yield* TmdbConfig
 *   const limiter = yield* RateLimiter
 *   // ... test code
 * }).pipe(Effect.provide(TestLayer))
 * ```
 */
export const TestLayer: Layer.Layer<TmdbConfig | RateLimiter, never, never> = Layer.mergeAll(
  makeTestConfig(),
  MockRateLimiter,
)

/**
 * Custom test layer with config overrides
 *
 * @example
 * ```ts
 * const layer = makeTestLayer({ apiKey: "custom-key" })
 * const program = myEffect.pipe(Effect.provide(layer))
 * ```
 */
export const makeTestLayer = (
  configOverrides?: Partial<TmdbConfigOptions>,
): Layer.Layer<TmdbConfig | RateLimiter, never, never> =>
  Layer.mergeAll(makeTestConfig(configOverrides), MockRateLimiter)
