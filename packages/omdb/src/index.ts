/**
 * @movie-effect/omdb - An OMDb API client built with Effect
 *
 * This library provides a fully typed, Effect-based interface to the
 * Open Movie Database (OMDb) API.
 *
 * @packageDocumentation
 */

// Client
export { type GetByIdRequest, type GetByTitleRequest, OmdbClient, type SearchRequest } from './client.ts'

// Config
export { OmdbConfig, type OmdbConfigOptions } from './config.ts'

// Schemas
export { OmdbErrorResponse, OmdbItem, Rating, SearchResponse, SearchResultItem } from './schemas.ts'

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
