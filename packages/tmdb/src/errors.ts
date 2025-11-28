/**
 * TMDB-specific error types
 *
 * Re-exports core error types and provides TMDB-specific type aliases.
 */

import {
  type AuthenticationError,
  type MovieApiError,
  type NetworkError,
  type NotFoundError,
  type RateLimitError,
  type ServerError,
  type TimeoutError,
  type ValidationError,
} from '@movie-effect/core'
import type { ParseResult } from 'effect'

// Re-export all error types from core
export {
  AuthenticationError,
  fromHttpStatus,
  MovieApiError,
  NetworkError,
  NotFoundError,
  RateLimitError,
  ServerError,
  TimeoutError,
  toNetworkError,
  ValidationError,
} from '@movie-effect/core'

/**
 * Union of all possible TMDB errors
 *
 * Use this for exhaustive error handling:
 *
 * @example
 * ```ts
 * Effect.catchTags({
 *   NotFoundError: (error) => Effect.succeed(null),
 *   RateLimitError: (error) => Effect.sleep(error.retryAfter ?? 5000),
 *   NetworkError: (error) => Effect.retry(...),
 *   ParseError: (error) => Effect.fail(new ValidationError({ message: error.message }))
 * })
 * ```
 */
export type TmdbErrors =
  | MovieApiError
  | NetworkError
  | AuthenticationError
  | RateLimitError
  | NotFoundError
  | ValidationError
  | ServerError
  | TimeoutError
  | ParseResult.ParseError
