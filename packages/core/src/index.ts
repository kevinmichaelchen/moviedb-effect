/**
 * @movie-effect/core
 *
 * Shared utilities for movie API Effect SDKs.
 * Provides common error types, rate limiting, HTTP client utilities,
 * pagination streaming, and testing helpers.
 */

// Error types
export {
  AuthenticationError,
  fromHttpStatus,
  MovieApiError,
  type MovieApiErrors,
  NetworkError,
  NotFoundError,
  RateLimitError,
  ServerError,
  TimeoutError,
  toNetworkError,
  ValidationError,
} from './errors.ts'

// Rate limiting
export {
  makeRateLimiter,
  makeRateLimiterLayer,
  RateLimiter,
  type RateLimiterConfig,
  type RateLimiterService,
  RateLimitPresets,
} from './rate-limiter.ts'

// Streaming/pagination
export {
  collectAllPages,
  mapPaginated,
  mapPaginatedEffect,
  type PaginatedResponse,
  paginatedStream,
  type PaginationOptions,
} from './streaming.ts'

// HTTP client utilities
export {
  apiErrorCounter,
  apiRequestCounter,
  apiRequestDuration,
  applyAuth,
  type AuthStrategy,
  executeJson,
  type HttpClientConfig,
  makeApiHttpClient,
  withRetry,
} from './http-client.ts'

// Configuration
export { type BaseApiConfig } from './config.ts'

// Testing utilities
export { makeMockRateLimiterService, MockRateLimiter } from './testing.ts'
