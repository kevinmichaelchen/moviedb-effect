/**
 * Configuration service for TMDB API client
 *
 * Provides centralized configuration management using Effect's Context system.
 */

import type { BaseApiConfig } from '@movie-effect/core'
import { Context } from 'effect'

/**
 * Configuration options for the TMDB API client
 */
export interface TmdbConfigOptions extends BaseApiConfig {
  /**
   * The Movie Database API Bearer token (v4 API)
   * @see https://developer.themoviedb.org/docs/authentication-application
   */
  readonly apiKey: string

  /**
   * Base URL for the TMDb API
   * @default "https://api.themoviedb.org/3/"
   */
  readonly baseUrl: string

  /**
   * Maximum number of requests per second
   * TMDb's soft limit is around 50 req/s
   * @default 50
   */
  readonly requestsPerSecond: number
}

/**
 * TMDB configuration service tag
 *
 * Use this to access configuration in your Effect programs:
 *
 * @example
 * ```ts
 * import { Console, Effect } from "effect"
 *
 * const program = Effect.gen(function* () {
 *   const config = yield* TmdbConfig
 *   yield* Console.log(config.apiKey)
 * })
 * ```
 */
export class TmdbConfig extends Context.Tag('TmdbConfig')<TmdbConfig, TmdbConfigOptions>() {}

/**
 * Default configuration values
 */
export const defaultConfig: Omit<TmdbConfigOptions, 'apiKey'> = {
  baseUrl: 'https://api.themoviedb.org/3/',
  requestsPerSecond: 50,
}

/**
 * Create a TmdbConfig from partial options
 *
 * @example
 * ```ts
 * const config = createConfig({ apiKey: "your-api-key" })
 * ```
 */
export const createConfig = (
  options: Pick<TmdbConfigOptions, 'apiKey'> & Partial<Omit<TmdbConfigOptions, 'apiKey'>>,
): TmdbConfigOptions => ({
  ...defaultConfig,
  ...options,
})
