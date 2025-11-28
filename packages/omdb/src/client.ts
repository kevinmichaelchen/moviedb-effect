/**
 * OMDb API client service
 */

import { HttpClient, HttpClientRequest } from '@effect/platform'
import { NetworkError, NotFoundError, ValidationError } from '@movie-effect/core'
import { Effect, Schema } from 'effect'
import { OmdbConfig } from './config.ts'
import { ItemResponse, OmdbErrorResponse, OmdbItem, SearchResponse, SearchResultResponse } from './schemas.ts'

/**
 * Request parameters for getting a movie/series by title
 */
export interface GetByTitleRequest {
  /** Movie/series title */
  readonly title: string
  /** Type filter: movie, series, or episode */
  readonly type?: 'movie' | 'series' | 'episode'
  /** Year of release */
  readonly year?: number
  /** Plot length: short or full */
  readonly plot?: 'short' | 'full'
}

/**
 * Request parameters for getting a movie/series by IMDb ID
 */
export interface GetByIdRequest {
  /** IMDb ID (e.g., tt1285016) */
  readonly imdbId: string
  /** Plot length: short or full */
  readonly plot?: 'short' | 'full'
}

/**
 * Request parameters for searching movies/series
 */
export interface SearchRequest {
  /** Search query */
  readonly query: string
  /** Type filter: movie, series, or episode */
  readonly type?: 'movie' | 'series' | 'episode'
  /** Year of release */
  readonly year?: number
  /** Page number (1-100) */
  readonly page?: number
}

/**
 * OMDb API client
 */
export class OmdbClient extends Effect.Service<OmdbClient>()('OmdbClient', {
  effect: Effect.gen(function*() {
    const config = yield* OmdbConfig
    const httpClient = yield* HttpClient.HttpClient

    const makeRequest = (params: Record<string, string | undefined>) => {
      const searchParams = new URLSearchParams()
      searchParams.set('apikey', config.apiKey)

      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) {
          searchParams.set(key, value)
        }
      }

      return HttpClientRequest.get(`${config.baseUrl}?${searchParams.toString()}`)
    }

    const executeRequest = <A, I>(request: HttpClientRequest.HttpClientRequest, schema: Schema.Schema<A, I>) =>
      httpClient.execute(request).pipe(
        Effect.flatMap((response) => response.json),
        Effect.scoped,
        Effect.flatMap(Schema.decodeUnknown(schema)),
        Effect.catchTags({
          ResponseError: (error) =>
            Effect.fail(
              new NetworkError({
                message: `OMDb API request failed: ${error.message}`,
                cause: error,
              }),
            ),
          RequestError: (error) =>
            Effect.fail(
              new NetworkError({
                message: `OMDb API request failed: ${error.message}`,
                cause: error,
              }),
            ),
        }),
      )

    const handleItemResponse = (response: typeof ItemResponse.Type) => {
      if (response.Response === 'False') {
        const errorResponse = response as typeof OmdbErrorResponse.Type
        if (errorResponse.Error === 'Movie not found!' || errorResponse.Error === 'Series not found!') {
          return Effect.fail(
            new NotFoundError({
              message: errorResponse.Error,
              resource: 'item',
              id: 'unknown',
            }),
          )
        }
        return Effect.fail(
          new ValidationError({
            message: errorResponse.Error,
          }),
        )
      }
      return Effect.succeed(response as typeof OmdbItem.Type)
    }

    return {
      /**
       * Get movie/series details by title
       */
      getByTitle: (request: GetByTitleRequest) => {
        const params: Record<string, string | undefined> = {
          t: request.title,
          type: request.type,
          y: request.year?.toString(),
          plot: request.plot,
        }

        return executeRequest(makeRequest(params), ItemResponse).pipe(Effect.flatMap(handleItemResponse))
      },

      /**
       * Get movie/series details by IMDb ID
       */
      getById: (request: GetByIdRequest) => {
        const params: Record<string, string | undefined> = {
          i: request.imdbId,
          plot: request.plot,
        }

        return executeRequest(makeRequest(params), ItemResponse).pipe(Effect.flatMap(handleItemResponse))
      },

      /**
       * Search for movies/series
       */
      search: (request: SearchRequest) => {
        const params: Record<string, string | undefined> = {
          s: request.query,
          type: request.type,
          y: request.year?.toString(),
          page: request.page?.toString(),
        }

        return executeRequest(makeRequest(params), SearchResultResponse).pipe(
          Effect.flatMap((response) => {
            if (response.Response === 'False') {
              const errorResponse = response as typeof OmdbErrorResponse.Type
              if (errorResponse.Error === 'Movie not found!' || errorResponse.Error === 'Too many results.') {
                return Effect.succeed(
                  {
                    Search: [],
                    totalResults: '0',
                    Response: 'True' as const,
                  } as typeof SearchResponse.Type,
                )
              }
              return Effect.fail(
                new ValidationError({
                  message: errorResponse.Error,
                }),
              )
            }
            return Effect.succeed(response as typeof SearchResponse.Type)
          }),
        )
      },
    }
  }),
}) {}
