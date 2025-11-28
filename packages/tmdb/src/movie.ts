/**
 * Movie service for TMDb API
 *
 * Provides Effect-based methods for movie-related endpoints.
 * All responses are validated and transformed from snake_case to camelCase.
 * Includes streaming methods for efficient pagination.
 */

import { paginatedStream, type PaginationOptions } from '@movie-effect/core'
import { Effect, Schema, Stream } from 'effect'
import { TmdbClient } from './client.ts'
import type { TmdbErrors } from './errors.ts'
import * as MovieSchemas from './schemas/movie.ts'

/**
 * Re-export schema types for external use
 */
export type MovieDetails = typeof MovieSchemas.MovieDetails.Type
export type MovieCastMember = typeof MovieSchemas.MovieCastMember.Type
export type MovieCrewMember = typeof MovieSchemas.MovieCrewMember.Type
export type MovieCredits = typeof MovieSchemas.MovieCredits.Type
export type MovieVideo = typeof MovieSchemas.MovieVideo.Type
export type MovieVideos = typeof MovieSchemas.MovieVideos.Type
export type MovieImage = typeof MovieSchemas.MovieImage.Type
export type MovieImages = typeof MovieSchemas.MovieImages.Type
export type MovieListResult = typeof MovieSchemas.MovieListResult.Type
export type MovieListResponse = typeof MovieSchemas.MovieListResponse.Type

/**
 * Common request parameters
 */
export interface MovieIdRequest {
  /** Movie ID */
  readonly id: number
  /** ISO 639-1 language code (e.g., "en-US") */
  readonly language?: string
}

export interface MovieImagesRequest extends MovieIdRequest {
  /** Include image language (e.g., "en,null") */
  readonly include_image_language?: string
}

export interface MovieListRequest {
  /** ISO 639-1 language code (e.g., "en-US") */
  readonly language?: string
  /** Page number */
  readonly page?: number
  /** ISO 3166-1 region code (e.g., "US") */
  readonly region?: string
}

/**
 * Movie service
 *
 * Provides methods for interacting with TMDb movie endpoints.
 * All responses are validated using Effect Schema and transformed to camelCase.
 *
 * @example
 * ```ts
 * import { Console, Effect } from "effect"
 *
 * const program = Effect.gen(function* () {
 *   const movie = yield* Movie
 *   const details = yield* movie.getDetails({ id: 550 })
 *   yield* Console.log(details.title) // "Fight Club"
 *   yield* Console.log(details.releaseDate) // "1999-10-15" - note camelCase!
 * })
 * ```
 */
export class Movie extends Effect.Service<Movie>()('Movie', {
  effect: Effect.gen(function*() {
    const client = yield* TmdbClient

    return {
      /**
       * Get movie details
       */
      getDetails: (request: MovieIdRequest): Effect.Effect<MovieDetails, TmdbErrors, never> => {
        const { id, language } = request
        const params = language ? `?language=${language}` : ''
        return client.get(`/movie/${id}${params}`).pipe(Effect.flatMap(Schema.decodeUnknown(MovieSchemas.MovieDetails)))
      },

      /**
       * Get movie credits (cast and crew)
       */
      getCredits: (request: MovieIdRequest): Effect.Effect<MovieCredits, TmdbErrors, never> => {
        const { id, language } = request
        const params = language ? `?language=${language}` : ''
        return client
          .get(`/movie/${id}/credits${params}`)
          .pipe(Effect.flatMap(Schema.decodeUnknown(MovieSchemas.MovieCredits)))
      },

      /**
       * Get movie videos (trailers, teasers, clips)
       */
      getVideos: (request: MovieIdRequest): Effect.Effect<MovieVideos, TmdbErrors, never> => {
        const { id, language } = request
        const params = language ? `?language=${language}` : ''
        return client
          .get(`/movie/${id}/videos${params}`)
          .pipe(Effect.flatMap(Schema.decodeUnknown(MovieSchemas.MovieVideos)))
      },

      /**
       * Get movie images (posters, backdrops, logos)
       */
      getImages: (request: MovieImagesRequest): Effect.Effect<MovieImages, TmdbErrors, never> => {
        const { id, language, include_image_language } = request
        const params = new URLSearchParams()
        if (language) params.set('language', language)
        if (include_image_language) {
          params.set('include_image_language', include_image_language)
        }
        const query = params.toString()
        return client
          .get(`/movie/${id}/images${query ? `?${query}` : ''}`)
          .pipe(Effect.flatMap(Schema.decodeUnknown(MovieSchemas.MovieImages)))
      },

      /**
       * Get movies now playing in theaters
       */
      getNowPlaying: (request?: MovieListRequest): Effect.Effect<MovieListResponse, TmdbErrors, never> => {
        const params = new URLSearchParams()
        if (request?.language) params.set('language', request.language)
        if (request?.page) params.set('page', String(request.page))
        if (request?.region) params.set('region', request.region)
        const query = params.toString()
        return client
          .get(`/movie/now_playing${query ? `?${query}` : ''}`)
          .pipe(Effect.flatMap(Schema.decodeUnknown(MovieSchemas.MovieListResponse)))
      },

      /**
       * Get popular movies
       */
      getPopular: (request?: MovieListRequest): Effect.Effect<MovieListResponse, TmdbErrors, never> => {
        const params = new URLSearchParams()
        if (request?.language) params.set('language', request.language)
        if (request?.page) params.set('page', String(request.page))
        if (request?.region) params.set('region', request.region)
        const query = params.toString()
        return client
          .get(`/movie/popular${query ? `?${query}` : ''}`)
          .pipe(Effect.flatMap(Schema.decodeUnknown(MovieSchemas.MovieListResponse)))
      },

      /**
       * Get top rated movies
       */
      getTopRated: (request?: MovieListRequest): Effect.Effect<MovieListResponse, TmdbErrors, never> => {
        const params = new URLSearchParams()
        if (request?.language) params.set('language', request.language)
        if (request?.page) params.set('page', String(request.page))
        if (request?.region) params.set('region', request.region)
        const query = params.toString()
        return client
          .get(`/movie/top_rated${query ? `?${query}` : ''}`)
          .pipe(Effect.flatMap(Schema.decodeUnknown(MovieSchemas.MovieListResponse)))
      },

      /**
       * Stream now playing movies across all pages
       */
      streamNowPlaying: (
        request?: Omit<MovieListRequest, 'page'>,
        options?: PaginationOptions,
      ): Stream.Stream<MovieListResult, TmdbErrors, never> =>
        paginatedStream((page) => {
          const params = new URLSearchParams()
          if (request?.language) params.set('language', request.language)
          params.set('page', String(page))
          if (request?.region) params.set('region', request.region)
          const query = params.toString()
          return client.get(`/movie/now_playing${query ? `?${query}` : ''}`).pipe(
            Effect.flatMap(Schema.decodeUnknown(MovieSchemas.MovieListResponse)),
            Effect.withSpan('movie.stream.now_playing', {
              attributes: { 'pagination.page': page },
            }),
          )
        }, options),

      /**
       * Stream popular movies across all pages
       */
      streamPopular: (
        request?: Omit<MovieListRequest, 'page'>,
        options?: PaginationOptions,
      ): Stream.Stream<MovieListResult, TmdbErrors, never> =>
        paginatedStream((page) => {
          const params = new URLSearchParams()
          if (request?.language) params.set('language', request.language)
          params.set('page', String(page))
          if (request?.region) params.set('region', request.region)
          const query = params.toString()
          return client
            .get(`/movie/popular${query ? `?${query}` : ''}`)
            .pipe(Effect.flatMap(Schema.decodeUnknown(MovieSchemas.MovieListResponse)))
        }, options),

      /**
       * Stream top rated movies across all pages
       */
      streamTopRated: (
        request?: Omit<MovieListRequest, 'page'>,
        options?: PaginationOptions,
      ): Stream.Stream<MovieListResult, TmdbErrors, never> =>
        paginatedStream((page) => {
          const params = new URLSearchParams()
          if (request?.language) params.set('language', request.language)
          params.set('page', String(page))
          if (request?.region) params.set('region', request.region)
          const query = params.toString()
          return client
            .get(`/movie/top_rated${query ? `?${query}` : ''}`)
            .pipe(Effect.flatMap(Schema.decodeUnknown(MovieSchemas.MovieListResponse)))
        }, options),
    }
  }),
}) {}
