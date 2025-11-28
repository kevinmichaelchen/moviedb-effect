/**
 * @movie-effect/tmdb - A TMDb API client built with Effect
 *
 * This library provides a fully typed, Effect-based interface to the
 * The Movie Database (TMDb) API with:
 *
 * - Type-safe API responses using Effect Schema
 * - Automatic snake_case to camelCase transformation
 * - Built-in rate limiting with token-bucket algorithm
 * - Streaming pagination for efficient data retrieval
 * - Structured error handling with exhaustive error types
 * - Promise-based compatibility layer for easy migration
 *
 * @example Using Effect services (recommended)
 * ```ts
 * import { Console, Effect, Layer } from "effect";
 * import { NodeHttpClient } from "@effect/platform-node";
 * import { Movie, TmdbClient, TmdbConfig, RateLimiterLive } from "@movie-effect/tmdb";
 *
 * const program = Effect.gen(function* () {
 *   const movie = yield* Movie;
 *   const details = yield* movie.getDetails({ id: 550 });
 *   yield* Console.log(details.title); // "Fight Club"
 * });
 *
 * const ConfigLayer = Layer.succeed(TmdbConfig, {
 *   apiKey: "your-api-key",
 *   baseUrl: "https://api.themoviedb.org/3/",
 *   requestsPerSecond: 50,
 * });
 *
 * const AppLayer = Movie.Default.pipe(
 *   Layer.provide(TmdbClient.Default),
 *   Layer.provide(RateLimiterLive),
 *   Layer.provide(NodeHttpClient.layerUndici),
 *   Layer.provide(ConfigLayer),
 * );
 *
 * Effect.runPromise(program.pipe(Effect.provide(AppLayer), Effect.scoped));
 * ```
 *
 * @example Using Promise-based compatibility layer
 * ```ts
 * import { Console, Effect } from "effect";
 * import { TmdbCompat } from "@movie-effect/tmdb";
 *
 * const program = Effect.gen(function* () {
 *   const tmdb = new TmdbCompat({ apiKey: "your-api-key" });
 *   const movie = yield* Effect.promise(() => tmdb.movieInfo(550));
 *   yield* Console.log(movie.title); // "Fight Club"
 * });
 * ```
 *
 * @packageDocumentation
 */

// ===== Core Services =====
export { TmdbClient } from './client.ts'
export { createConfig, defaultConfig, TmdbConfig, type TmdbConfigOptions } from './config.ts'
export { makeRateLimiter, RateLimiter, RateLimiterLive, TmdbRateLimitConfig } from './rate-limiter.ts'

// ===== Domain Services =====
export {
  Movie,
  type MovieCastMember,
  type MovieCredits,
  type MovieCrewMember,
  type MovieDetails,
  type MovieIdRequest,
  type MovieImage,
  type MovieImages,
  type MovieImagesRequest,
  type MovieListRequest,
  type MovieListResponse,
  type MovieListResult,
  type MovieVideo,
  type MovieVideos,
} from './movie.ts'

export {
  type CombinedCreditCast,
  type CombinedCreditCrew,
  type MovieCreditCast,
  type MovieCreditCrew,
  Person,
  type PersonCombinedCredits,
  type PersonDetails,
  type PersonIdRequest,
  type PersonImage,
  type PersonImages,
  type PersonMovieCredits,
  type PersonPopularRequest,
  type PersonPopularResponse,
  type PersonPopularResult,
  type PersonTvCredits,
  type TvCreditCast,
  type TvCreditCrew,
} from './person.ts'

export {
  type MovieSearchResult,
  type MultiSearchResult,
  type PersonSearchResult,
  Search,
  type SearchMovieRequest,
  type SearchMovieResponse,
  type SearchMultiRequest,
  type SearchMultiResponse,
  type SearchPersonRequest,
  type SearchPersonResponse,
  type SearchRequest,
  type SearchTvRequest,
  type SearchTvResponse,
  type TvSearchResult,
} from './search.ts'

export {
  Tv,
  type TvCastMember,
  type TvCredits,
  type TvCrewMember,
  type TvIdRequest,
  type TvImage,
  type TvImages,
  type TvImagesRequest,
  type TvListRequest,
  type TvShowDetails,
  type TvShowListResponse,
  type TvShowListResult,
  type TvVideo,
  type TvVideos,
} from './tv.ts'

// ===== Errors =====
export {
  AuthenticationError,
  fromHttpStatus,
  MovieApiError,
  NetworkError,
  NotFoundError,
  RateLimitError,
  ServerError,
  TimeoutError,
  type TmdbErrors,
  toNetworkError,
  ValidationError,
} from './errors.ts'

// ===== Streaming Utilities (from core) =====
export {
  collectAllPages,
  mapPaginated,
  mapPaginatedEffect,
  type PaginatedResponse,
  paginatedStream,
  type PaginationOptions,
} from '@movie-effect/core'

// ===== Compatibility Layer =====
export { TmdbCompat, type TmdbCompatConfig } from './compat.ts'

// ===== Test Utilities =====
export { makeTestConfig, makeTestLayer, MockRateLimiter, TestLayer } from './test-layers.ts'
