/**
 * @movie-effect/letterboxd - A Letterboxd API client built with Effect
 *
 * This library provides a fully typed, Effect-based interface to the
 * Letterboxd API for film discovery and social features.
 *
 * @packageDocumentation
 */

// TODO: Implement Letterboxd API client
// API Documentation: https://api-docs.letterboxd.com/
// Note: Letterboxd API requires approved access

export { LetterboxdConfig, type LetterboxdConfigOptions } from './config.ts'

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
