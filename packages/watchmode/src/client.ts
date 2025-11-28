/**
 * Watchmode API client service
 */

import { HttpClient, HttpClientRequest } from '@effect/platform'
import { NetworkError, NotFoundError } from '@movie-effect/core'
import { Effect, Schema } from 'effect'
import { WatchmodeConfig } from './config.ts'
import { SearchResponse, Source, TitleDetails, TitleSource } from './schemas.ts'

/**
 * Request parameters for searching titles
 */
export interface SearchRequest {
  /** Search query (title name, IMDB ID, or TMDB ID) */
  readonly query: string
  /** Search field: name, imdb_id, or tmdb_id */
  readonly searchField?: 'name' | 'imdb_id' | 'tmdb_id'
  /** Type filter: movie, tv_movie, tv_series, tv_special, tv_miniseries, short_film */
  readonly types?: string
}

/**
 * Request parameters for getting title details
 */
export interface TitleDetailsRequest {
  /** Watchmode title ID */
  readonly id: number
  /** Append additional data to response */
  readonly appendToResponse?: ('sources')[]
}

/**
 * Request parameters for getting title sources
 */
export interface TitleSourcesRequest {
  /** Watchmode title ID */
  readonly id: number
  /** Region code (e.g., US, GB, CA) */
  readonly regions?: string
}

/**
 * Request parameters for getting sources list
 */
export interface SourcesRequest {
  /** Region code filter (e.g., US, GB, CA) */
  readonly regions?: string
}

/**
 * Watchmode API client
 */
export class WatchmodeClient extends Effect.Service<WatchmodeClient>()('WatchmodeClient', {
  effect: Effect.gen(function*() {
    const config = yield* WatchmodeConfig
    const httpClient = yield* HttpClient.HttpClient

    const makeRequest = (path: string, params?: Record<string, string | undefined>) => {
      const searchParams = new URLSearchParams()
      searchParams.set('apiKey', config.apiKey)

      if (params) {
        for (const [key, value] of Object.entries(params)) {
          if (value !== undefined) {
            searchParams.set(key, value)
          }
        }
      }

      return HttpClientRequest.get(`${config.baseUrl}${path}?${searchParams.toString()}`)
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
                message: `Watchmode API request failed: ${error.message}`,
                cause: error,
              }),
            ),
          RequestError: (error) =>
            Effect.fail(
              new NetworkError({
                message: `Watchmode API request failed: ${error.message}`,
                cause: error,
              }),
            ),
        }),
      )

    return {
      /**
       * Get list of all streaming sources/services
       */
      getSources: (request?: SourcesRequest) => {
        const params: Record<string, string | undefined> = {
          regions: request?.regions,
        }

        return executeRequest(makeRequest('sources/', params), Schema.Array(Source))
      },

      /**
       * Search for titles by name, IMDB ID, or TMDB ID
       */
      search: (request: SearchRequest) => {
        const params: Record<string, string | undefined> = {
          search_value: request.query,
          search_field: request.searchField ?? 'name',
          types: request.types,
        }

        return executeRequest(makeRequest('search/', params), SearchResponse)
      },

      /**
       * Get title details by Watchmode ID
       */
      getTitleDetails: (request: TitleDetailsRequest) => {
        const params: Record<string, string | undefined> = {
          append_to_response: request.appendToResponse?.join(','),
        }

        return executeRequest(makeRequest(`title/${request.id}/details/`, params), TitleDetails).pipe(
          Effect.catchTag('ParseError', () =>
            Effect.fail(
              new NotFoundError({
                message: `Title with ID ${request.id} not found`,
                resource: 'title',
                id: request.id,
              }),
            )),
        )
      },

      /**
       * Get streaming sources for a title
       */
      getTitleSources: (request: TitleSourcesRequest) => {
        const params: Record<string, string | undefined> = {
          regions: request.regions,
        }

        return executeRequest(makeRequest(`title/${request.id}/sources/`, params), Schema.Array(TitleSource))
      },
    }
  }),
}) {}
