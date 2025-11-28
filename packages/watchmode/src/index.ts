/**
 * @movie-effect/watchmode - A Watchmode API client built with Effect
 *
 * This library provides a fully typed, Effect-based interface to the
 * Watchmode API for streaming availability data.
 *
 * @packageDocumentation
 */

// Client
export {
  type SearchRequest,
  type SourcesRequest,
  type TitleDetailsRequest,
  type TitleSourcesRequest,
  WatchmodeClient,
} from './client.ts'

// Config
export { WatchmodeConfig, type WatchmodeConfigOptions } from './config.ts'

// Schemas
export { ListTitlesResponse, SearchResponse, SearchResult, Source, TitleDetails, TitleSource } from './schemas.ts'

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
