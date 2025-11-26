/**
 * Configuration service for MovieDb API client
 *
 * Provides centralized configuration management using Effect's Context system.
 */

import { Context } from 'effect'

/**
 * Configuration options for the MovieDb API client
 */
export interface MovieDbConfigOptions {
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
 * MovieDb configuration service tag
 *
 * Use this to access configuration in your Effect programs:
 *
 * @example
 * ```ts
 * import { Console, Effect } from "effect"
 *
 * const program = Effect.gen(function* () {
 *   const config = yield* MovieDbConfig
 *   yield* Console.log(config.apiKey)
 * })
 * ```
 */
export class MovieDbConfig extends Context.Tag('MovieDbConfig')<MovieDbConfig, MovieDbConfigOptions>() {}

/**
 * Default configuration values
 */
export const defaultConfig: Omit<MovieDbConfigOptions, 'apiKey'> = {
  baseUrl: 'https://api.themoviedb.org/3/',
  requestsPerSecond: 50,
}

/**
 * Create a MovieDbConfig from partial options
 *
 * @example
 * ```ts
 * const config = createConfig({ apiKey: "your-api-key" })
 * ```
 */
export const createConfig = (
  options: Pick<MovieDbConfigOptions, 'apiKey'> & Partial<Omit<MovieDbConfigOptions, 'apiKey'>>,
): MovieDbConfigOptions => ({
  ...defaultConfig,
  ...options,
})
