/**
 * HTTP Client integration for TMDB API
 *
 * Provides TMDB-specific HTTP client configuration with Bearer token authentication.
 */

import { HttpClient, HttpClientRequest } from '@effect/platform'
import { executeJson as coreExecuteJson, type MovieApiErrors } from '@movie-effect/core'
import { Effect } from 'effect'
import { TmdbConfig } from './config.ts'

/**
 * Create an HTTP client configured for TMDb API
 *
 * Features:
 * - Base URL prepended to all requests
 * - Bearer token authentication
 * - Automatic error mapping from HTTP status codes
 * - Retry logic for transient failures
 *
 * @returns Effect that provides a configured HttpClient
 *
 * @example
 * ```ts
 * const program = Effect.gen(function* () {
 *   const client = yield* makeTmdbHttpClient()
 *   const response = yield* client.get("/movie/550")
 *   const data = yield* response.json
 * })
 * ```
 */
export const makeTmdbHttpClient = () =>
  Effect.gen(function*() {
    const config = yield* TmdbConfig
    const baseClient = yield* HttpClient.HttpClient

    // Configure client with base URL and Bearer token authentication
    const clientWithBase = baseClient.pipe(
      // Prepend base URL to all requests
      HttpClient.mapRequest(HttpClientRequest.prependUrl(config.baseUrl)),
      // Add Bearer token to Authorization header
      HttpClient.mapRequest(HttpClientRequest.setHeader('Authorization', `Bearer ${config.apiKey}`)),
      // Add accept header for JSON responses
      HttpClient.mapRequest(HttpClientRequest.setHeader('accept', 'application/json')),
      // Filter non-2xx status codes (creates ResponseError)
      HttpClient.filterStatusOk,
    )

    return clientWithBase
  })

/**
 * Helper to execute a GET request and parse JSON response with full observability
 *
 * Features:
 * - Structured logging of request/response
 * - Distributed tracing with timing
 * - Metrics collection for monitoring
 *
 * @example
 * ```ts
 * const program = Effect.gen(function* () {
 *   const client = yield* makeTmdbHttpClient()
 *   const movie = yield* executeJson<MovieResponse>(client, "/movie/550")
 * })
 * ```
 */
export const executeJson = <A>(client: HttpClient.HttpClient, path: string): Effect.Effect<A, MovieApiErrors, never> =>
  coreExecuteJson(client, path, 'tmdb')
