/**
 * TV service for TMDb API
 *
 * Provides Effect-based methods for TV show-related endpoints.
 * All responses are validated and transformed from snake_case to camelCase.
 */

import { paginatedStream, type PaginationOptions } from '@movie-effect/core'
import { Effect, Schema, Stream } from 'effect'
import { TmdbClient } from './client.ts'
import type { TmdbErrors } from './errors.ts'
import * as TvSchemas from './schemas/tv.ts'

/**
 * Re-export schema types for external use
 */
export type TvShowDetails = typeof TvSchemas.TvShowDetails.Type
export type TvCastMember = typeof TvSchemas.TvCastMember.Type
export type TvCrewMember = typeof TvSchemas.TvCrewMember.Type
export type TvCredits = typeof TvSchemas.TvCredits.Type
export type TvVideo = typeof TvSchemas.TvVideo.Type
export type TvVideos = typeof TvSchemas.TvVideos.Type
export type TvImage = typeof TvSchemas.TvImage.Type
export type TvImages = typeof TvSchemas.TvImages.Type
export type TvShowListResult = typeof TvSchemas.TvShowListResult.Type
export type TvShowListResponse = typeof TvSchemas.TvShowListResponse.Type

/**
 * Common request parameters
 */
export interface TvIdRequest {
  /** TV show ID */
  readonly id: number
  /** ISO 639-1 language code (e.g., "en-US") */
  readonly language?: string
}

export interface TvImagesRequest extends TvIdRequest {
  /** Include image language (e.g., "en,null") */
  readonly include_image_language?: string
}

export interface TvListRequest {
  /** ISO 639-1 language code (e.g., "en-US") */
  readonly language?: string
  /** Page number */
  readonly page?: number
  /** ISO 3166-1 region code (e.g., "US") */
  readonly timezone?: string
}

/**
 * TV service
 *
 * Provides methods for interacting with TMDb TV show endpoints.
 * All responses are validated using Effect Schema and transformed to camelCase.
 */
export class Tv extends Effect.Service<Tv>()('Tv', {
  effect: Effect.gen(function*() {
    const client = yield* TmdbClient

    return {
      getDetails: (request: TvIdRequest): Effect.Effect<TvShowDetails, TmdbErrors, never> => {
        const { id, language } = request
        const params = language ? `?language=${language}` : ''
        return client.get(`/tv/${id}${params}`).pipe(Effect.flatMap(Schema.decodeUnknown(TvSchemas.TvShowDetails)))
      },

      getCredits: (request: TvIdRequest): Effect.Effect<TvCredits, TmdbErrors, never> => {
        const { id, language } = request
        const params = language ? `?language=${language}` : ''
        return client.get(`/tv/${id}/credits${params}`).pipe(Effect.flatMap(Schema.decodeUnknown(TvSchemas.TvCredits)))
      },

      getVideos: (request: TvIdRequest): Effect.Effect<TvVideos, TmdbErrors, never> => {
        const { id, language } = request
        const params = language ? `?language=${language}` : ''
        return client.get(`/tv/${id}/videos${params}`).pipe(Effect.flatMap(Schema.decodeUnknown(TvSchemas.TvVideos)))
      },

      getImages: (request: TvImagesRequest): Effect.Effect<TvImages, TmdbErrors, never> => {
        const { id, language, include_image_language } = request
        const params = new URLSearchParams()
        if (language) params.set('language', language)
        if (include_image_language) {
          params.set('include_image_language', include_image_language)
        }
        const query = params.toString()
        return client
          .get(`/tv/${id}/images${query ? `?${query}` : ''}`)
          .pipe(Effect.flatMap(Schema.decodeUnknown(TvSchemas.TvImages)))
      },

      getAiringToday: (request?: TvListRequest): Effect.Effect<TvShowListResponse, TmdbErrors, never> => {
        const params = new URLSearchParams()
        if (request?.language) params.set('language', request.language)
        if (request?.page) params.set('page', String(request.page))
        if (request?.timezone) params.set('timezone', request.timezone)
        const query = params.toString()
        return client
          .get(`/tv/airing_today${query ? `?${query}` : ''}`)
          .pipe(Effect.flatMap(Schema.decodeUnknown(TvSchemas.TvShowListResponse)))
      },

      getOnTheAir: (request?: TvListRequest): Effect.Effect<TvShowListResponse, TmdbErrors, never> => {
        const params = new URLSearchParams()
        if (request?.language) params.set('language', request.language)
        if (request?.page) params.set('page', String(request.page))
        if (request?.timezone) params.set('timezone', request.timezone)
        const query = params.toString()
        return client
          .get(`/tv/on_the_air${query ? `?${query}` : ''}`)
          .pipe(Effect.flatMap(Schema.decodeUnknown(TvSchemas.TvShowListResponse)))
      },

      getPopular: (request?: TvListRequest): Effect.Effect<TvShowListResponse, TmdbErrors, never> => {
        const params = new URLSearchParams()
        if (request?.language) params.set('language', request.language)
        if (request?.page) params.set('page', String(request.page))
        const query = params.toString()
        return client
          .get(`/tv/popular${query ? `?${query}` : ''}`)
          .pipe(Effect.flatMap(Schema.decodeUnknown(TvSchemas.TvShowListResponse)))
      },

      getTopRated: (request?: TvListRequest): Effect.Effect<TvShowListResponse, TmdbErrors, never> => {
        const params = new URLSearchParams()
        if (request?.language) params.set('language', request.language)
        if (request?.page) params.set('page', String(request.page))
        const query = params.toString()
        return client
          .get(`/tv/top_rated${query ? `?${query}` : ''}`)
          .pipe(Effect.flatMap(Schema.decodeUnknown(TvSchemas.TvShowListResponse)))
      },

      streamAiringToday: (
        request?: Omit<TvListRequest, 'page'>,
        options?: PaginationOptions,
      ): Stream.Stream<TvShowListResult, TmdbErrors, never> =>
        paginatedStream((page) => {
          const params = new URLSearchParams()
          if (request?.language) params.set('language', request.language)
          params.set('page', String(page))
          if (request?.timezone) params.set('timezone', request.timezone)
          const query = params.toString()
          return client.get(`/tv/airing_today${query ? `?${query}` : ''}`).pipe(
            Effect.flatMap(Schema.decodeUnknown(TvSchemas.TvShowListResponse)),
            Effect.withSpan('tv.stream.airing_today', { attributes: { 'pagination.page': page } }),
          )
        }, options),

      streamOnTheAir: (
        request?: Omit<TvListRequest, 'page'>,
        options?: PaginationOptions,
      ): Stream.Stream<TvShowListResult, TmdbErrors, never> =>
        paginatedStream((page) => {
          const params = new URLSearchParams()
          if (request?.language) params.set('language', request.language)
          params.set('page', String(page))
          if (request?.timezone) params.set('timezone', request.timezone)
          const query = params.toString()
          return client.get(`/tv/on_the_air${query ? `?${query}` : ''}`).pipe(
            Effect.flatMap(Schema.decodeUnknown(TvSchemas.TvShowListResponse)),
            Effect.withSpan('tv.stream.on_the_air', { attributes: { 'pagination.page': page } }),
          )
        }, options),

      streamPopular: (
        request?: Omit<TvListRequest, 'page'>,
        options?: PaginationOptions,
      ): Stream.Stream<TvShowListResult, TmdbErrors, never> =>
        paginatedStream((page) => {
          const params = new URLSearchParams()
          if (request?.language) params.set('language', request.language)
          params.set('page', String(page))
          const query = params.toString()
          return client.get(`/tv/popular${query ? `?${query}` : ''}`).pipe(
            Effect.flatMap(Schema.decodeUnknown(TvSchemas.TvShowListResponse)),
            Effect.withSpan('tv.stream.popular', { attributes: { 'pagination.page': page } }),
          )
        }, options),

      streamTopRated: (
        request?: Omit<TvListRequest, 'page'>,
        options?: PaginationOptions,
      ): Stream.Stream<TvShowListResult, TmdbErrors, never> =>
        paginatedStream((page) => {
          const params = new URLSearchParams()
          if (request?.language) params.set('language', request.language)
          params.set('page', String(page))
          const query = params.toString()
          return client.get(`/tv/top_rated${query ? `?${query}` : ''}`).pipe(
            Effect.flatMap(Schema.decodeUnknown(TvSchemas.TvShowListResponse)),
            Effect.withSpan('tv.stream.top_rated', { attributes: { 'pagination.page': page } }),
          )
        }, options),
    }
  }),
}) {}
