/**
 * @movie-effect/trakt - A Trakt API client built with Effect
 *
 * This library provides a fully typed, Effect-based interface to the
 * Trakt API for tracking movies and TV shows.
 *
 * @packageDocumentation
 */

// TODO: Implement Trakt API client
// API Documentation: https://trakt.docs.apiary.io/
// Rate limit: 1,000 requests/5 minutes (OAuth), 10,000 requests/5 minutes (client ID only)

export { TraktConfig, type TraktConfigOptions } from './config.ts'

// Re-export core utilities
export {
  AuthenticationError,
  MovieApiError,
  NetworkError,
  NotFoundError,
  RateLimitError,
  ServerError,
  TimeoutError,
  ValidationError,
} from '@movie-effect/core'
