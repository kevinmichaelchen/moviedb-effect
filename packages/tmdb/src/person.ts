/**
 * Person service for TMDb API
 *
 * Provides Effect-based methods for person-related endpoints.
 * All responses are validated and transformed from snake_case to camelCase.
 */

import { paginatedStream, type PaginationOptions } from '@movie-effect/core'
import { Effect, Schema, Stream } from 'effect'
import { TmdbClient } from './client.ts'
import type { TmdbErrors } from './errors.ts'
import * as PersonSchemas from './schemas/person.ts'

/**
 * Re-export schema types for external use
 */
export type PersonDetails = typeof PersonSchemas.PersonDetails.Type
export type MovieCreditCast = typeof PersonSchemas.MovieCreditCast.Type
export type MovieCreditCrew = typeof PersonSchemas.MovieCreditCrew.Type
export type PersonMovieCredits = typeof PersonSchemas.PersonMovieCredits.Type
export type TvCreditCast = typeof PersonSchemas.TvCreditCast.Type
export type TvCreditCrew = typeof PersonSchemas.TvCreditCrew.Type
export type PersonTvCredits = typeof PersonSchemas.PersonTvCredits.Type
export type CombinedCreditCast = PersonSchemas.CombinedCreditCast
export type CombinedCreditCrew = PersonSchemas.CombinedCreditCrew
export type PersonCombinedCredits = typeof PersonSchemas.PersonCombinedCredits.Type
export type PersonImage = typeof PersonSchemas.PersonImage.Type
export type PersonImages = typeof PersonSchemas.PersonImages.Type
export type PersonPopularResult = typeof PersonSchemas.PersonPopularResult.Type
export type PersonPopularResponse = typeof PersonSchemas.PersonPopularResponse.Type

/**
 * Common request parameters
 */
export interface PersonIdRequest {
  /** Person ID */
  readonly id: number
  /** ISO 639-1 language code (e.g., "en-US") */
  readonly language?: string
}

export interface PersonPopularRequest {
  /** ISO 639-1 language code (e.g., "en-US") */
  readonly language?: string
  /** Page number */
  readonly page?: number
}

/**
 * Person service
 *
 * Provides methods for interacting with TMDb person endpoints.
 * All responses are validated using Effect Schema and transformed to camelCase.
 */
export class Person extends Effect.Service<Person>()('Person', {
  effect: Effect.gen(function*() {
    const client = yield* TmdbClient

    return {
      getDetails: (request: PersonIdRequest): Effect.Effect<PersonDetails, TmdbErrors, never> => {
        const { id, language } = request
        const params = language ? `?language=${language}` : ''
        return client
          .get(`/person/${id}${params}`)
          .pipe(Effect.flatMap(Schema.decodeUnknown(PersonSchemas.PersonDetails)))
      },

      getMovieCredits: (request: PersonIdRequest): Effect.Effect<PersonMovieCredits, TmdbErrors, never> => {
        const { id, language } = request
        const params = language ? `?language=${language}` : ''
        return client
          .get(`/person/${id}/movie_credits${params}`)
          .pipe(Effect.flatMap(Schema.decodeUnknown(PersonSchemas.PersonMovieCredits)))
      },

      getTvCredits: (request: PersonIdRequest): Effect.Effect<PersonTvCredits, TmdbErrors, never> => {
        const { id, language } = request
        const params = language ? `?language=${language}` : ''
        return client
          .get(`/person/${id}/tv_credits${params}`)
          .pipe(Effect.flatMap(Schema.decodeUnknown(PersonSchemas.PersonTvCredits)))
      },

      getCombinedCredits: (request: PersonIdRequest): Effect.Effect<PersonCombinedCredits, TmdbErrors, never> => {
        const { id, language } = request
        const params = language ? `?language=${language}` : ''
        return client
          .get(`/person/${id}/combined_credits${params}`)
          .pipe(Effect.flatMap(Schema.decodeUnknown(PersonSchemas.PersonCombinedCredits)))
      },

      getImages: (request: PersonIdRequest): Effect.Effect<PersonImages, TmdbErrors, never> => {
        const { id } = request
        return client.get(`/person/${id}/images`).pipe(Effect.flatMap(Schema.decodeUnknown(PersonSchemas.PersonImages)))
      },

      getPopular: (request?: PersonPopularRequest): Effect.Effect<PersonPopularResponse, TmdbErrors, never> => {
        const params = new URLSearchParams()
        if (request?.language) params.set('language', request.language)
        if (request?.page) params.set('page', String(request.page))
        const query = params.toString()
        return client
          .get(`/person/popular${query ? `?${query}` : ''}`)
          .pipe(Effect.flatMap(Schema.decodeUnknown(PersonSchemas.PersonPopularResponse)))
      },

      streamPopular: (
        request?: Omit<PersonPopularRequest, 'page'>,
        options?: PaginationOptions,
      ): Stream.Stream<PersonPopularResult, TmdbErrors, never> =>
        paginatedStream((page) => {
          const params = new URLSearchParams()
          if (request?.language) params.set('language', request.language)
          params.set('page', String(page))
          const query = params.toString()
          return client.get(`/person/popular${query ? `?${query}` : ''}`).pipe(
            Effect.flatMap(Schema.decodeUnknown(PersonSchemas.PersonPopularResponse)),
            Effect.withSpan('person.stream.popular', { attributes: { 'pagination.page': page } }),
          )
        }, options),
    }
  }),
}) {}
