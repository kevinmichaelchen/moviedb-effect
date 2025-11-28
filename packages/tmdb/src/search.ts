/**
 * Search service for TMDb API
 *
 * Provides Effect-based methods for search endpoints.
 * All responses are validated and transformed from snake_case to camelCase.
 */

import { paginatedStream, type PaginationOptions } from '@movie-effect/core'
import { Effect, Schema, Stream } from 'effect'
import { TmdbClient } from './client.ts'
import type { TmdbErrors } from './errors.ts'
import * as SearchSchemas from './schemas/search.ts'

/**
 * Re-export schema types for external use
 */
export type MovieSearchResult = typeof SearchSchemas.MovieSearchResult.Type
export type TvSearchResult = typeof SearchSchemas.TvSearchResult.Type
export type PersonSearchResult = typeof SearchSchemas.PersonSearchResult.Type
export type MultiSearchResult = SearchSchemas.MultiSearchResult
export type SearchMovieResponse = typeof SearchSchemas.SearchMovieResponse.Type
export type SearchTvResponse = typeof SearchSchemas.SearchTvResponse.Type
export type SearchPersonResponse = typeof SearchSchemas.SearchPersonResponse.Type
export type SearchMultiResponse = typeof SearchSchemas.SearchMultiResponse.Type

/**
 * Common search request parameters
 */
export interface SearchRequest {
  /** Search query string */
  readonly query: string
  /** ISO 639-1 language code (e.g., "en-US") */
  readonly language?: string
  /** Page number */
  readonly page?: number
  /** Include adult content */
  readonly include_adult?: boolean
}

export interface SearchMovieRequest extends SearchRequest {
  /** ISO 3166-1 region code (e.g., "US") */
  readonly region?: string
  /** Filter by year */
  readonly year?: number
  /** Filter by primary release year */
  readonly primary_release_year?: number
}

export interface SearchTvRequest extends SearchRequest {
  /** Filter by first air date year */
  readonly first_air_date_year?: number
}

export type SearchPersonRequest = SearchRequest

export type SearchMultiRequest = SearchRequest

/**
 * Search service
 *
 * Provides methods for searching movies, TV shows, and people.
 * All responses are validated using Effect Schema and transformed to camelCase.
 */
export class Search extends Effect.Service<Search>()('Search', {
  effect: Effect.gen(function*() {
    const client = yield* TmdbClient

    return {
      searchMovie: (request: SearchMovieRequest): Effect.Effect<SearchMovieResponse, TmdbErrors, never> => {
        const params = new URLSearchParams()
        params.set('query', request.query)
        if (request.language) params.set('language', request.language)
        if (request.page) params.set('page', String(request.page))
        if (request.include_adult !== undefined) {
          params.set('include_adult', String(request.include_adult))
        }
        if (request.region) params.set('region', request.region)
        if (request.year) params.set('year', String(request.year))
        if (request.primary_release_year) {
          params.set('primary_release_year', String(request.primary_release_year))
        }

        return client
          .get(`/search/movie?${params.toString()}`)
          .pipe(Effect.flatMap(Schema.decodeUnknown(SearchSchemas.SearchMovieResponse)))
      },

      searchTv: (request: SearchTvRequest): Effect.Effect<SearchTvResponse, TmdbErrors, never> => {
        const params = new URLSearchParams()
        params.set('query', request.query)
        if (request.language) params.set('language', request.language)
        if (request.page) params.set('page', String(request.page))
        if (request.include_adult !== undefined) {
          params.set('include_adult', String(request.include_adult))
        }
        if (request.first_air_date_year) {
          params.set('first_air_date_year', String(request.first_air_date_year))
        }

        return client
          .get(`/search/tv?${params.toString()}`)
          .pipe(Effect.flatMap(Schema.decodeUnknown(SearchSchemas.SearchTvResponse)))
      },

      searchPerson: (request: SearchPersonRequest): Effect.Effect<SearchPersonResponse, TmdbErrors, never> => {
        const params = new URLSearchParams()
        params.set('query', request.query)
        if (request.language) params.set('language', request.language)
        if (request.page) params.set('page', String(request.page))
        if (request.include_adult !== undefined) {
          params.set('include_adult', String(request.include_adult))
        }

        return client
          .get(`/search/person?${params.toString()}`)
          .pipe(Effect.flatMap(Schema.decodeUnknown(SearchSchemas.SearchPersonResponse)))
      },

      searchMulti: (request: SearchMultiRequest): Effect.Effect<SearchMultiResponse, TmdbErrors, never> => {
        const params = new URLSearchParams()
        params.set('query', request.query)
        if (request.language) params.set('language', request.language)
        if (request.page) params.set('page', String(request.page))
        if (request.include_adult !== undefined) {
          params.set('include_adult', String(request.include_adult))
        }

        return client
          .get(`/search/multi?${params.toString()}`)
          .pipe(Effect.flatMap(Schema.decodeUnknown(SearchSchemas.SearchMultiResponse)))
      },

      streamSearchMovie: (
        request: Omit<SearchMovieRequest, 'page'>,
        options?: PaginationOptions,
      ): Stream.Stream<MovieSearchResult, TmdbErrors, never> =>
        paginatedStream((page) => {
          const params = new URLSearchParams()
          params.set('query', request.query)
          if (request.language) params.set('language', request.language)
          params.set('page', String(page))
          if (request.include_adult !== undefined) {
            params.set('include_adult', String(request.include_adult))
          }
          if (request.region) params.set('region', request.region)
          if (request.year) params.set('year', String(request.year))
          if (request.primary_release_year) {
            params.set('primary_release_year', String(request.primary_release_year))
          }

          return client.get(`/search/movie?${params.toString()}`).pipe(
            Effect.flatMap(Schema.decodeUnknown(SearchSchemas.SearchMovieResponse)),
            Effect.withSpan('search.stream.movie', { attributes: { 'pagination.page': page, query: request.query } }),
          )
        }, options),

      streamSearchTv: (
        request: Omit<SearchTvRequest, 'page'>,
        options?: PaginationOptions,
      ): Stream.Stream<TvSearchResult, TmdbErrors, never> =>
        paginatedStream((page) => {
          const params = new URLSearchParams()
          params.set('query', request.query)
          if (request.language) params.set('language', request.language)
          params.set('page', String(page))
          if (request.include_adult !== undefined) {
            params.set('include_adult', String(request.include_adult))
          }
          if (request.first_air_date_year) {
            params.set('first_air_date_year', String(request.first_air_date_year))
          }

          return client.get(`/search/tv?${params.toString()}`).pipe(
            Effect.flatMap(Schema.decodeUnknown(SearchSchemas.SearchTvResponse)),
            Effect.withSpan('search.stream.tv', { attributes: { 'pagination.page': page, query: request.query } }),
          )
        }, options),

      streamSearchPerson: (
        request: Omit<SearchPersonRequest, 'page'>,
        options?: PaginationOptions,
      ): Stream.Stream<PersonSearchResult, TmdbErrors, never> =>
        paginatedStream((page) => {
          const params = new URLSearchParams()
          params.set('query', request.query)
          if (request.language) params.set('language', request.language)
          params.set('page', String(page))
          if (request.include_adult !== undefined) {
            params.set('include_adult', String(request.include_adult))
          }

          return client.get(`/search/person?${params.toString()}`).pipe(
            Effect.flatMap(Schema.decodeUnknown(SearchSchemas.SearchPersonResponse)),
            Effect.withSpan('search.stream.person', { attributes: { 'pagination.page': page, query: request.query } }),
          )
        }, options),

      streamSearchMulti: (
        request: Omit<SearchMultiRequest, 'page'>,
        options?: PaginationOptions,
      ): Stream.Stream<MultiSearchResult, TmdbErrors, never> =>
        paginatedStream((page) => {
          const params = new URLSearchParams()
          params.set('query', request.query)
          if (request.language) params.set('language', request.language)
          params.set('page', String(page))
          if (request.include_adult !== undefined) {
            params.set('include_adult', String(request.include_adult))
          }

          return client.get(`/search/multi?${params.toString()}`).pipe(
            Effect.flatMap(Schema.decodeUnknown(SearchSchemas.SearchMultiResponse)),
            Effect.withSpan('search.stream.multi', { attributes: { 'pagination.page': page, query: request.query } }),
          )
        }, options),
    }
  }),
}) {}
