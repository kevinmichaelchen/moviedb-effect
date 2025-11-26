/**
 * Integration tests for MovieDb HttpClient
 */

import { NodeHttpClient } from '@effect/platform-node'
import { describe, it, expect } from '@effect/vitest'
import { Effect } from 'effect'
import { executeJson, makeMovieDbHttpClient } from '../../src/effect/http-client.ts'
import { fromHttpStatus, toNetworkError } from '../../src/effect/errors.ts'
import { makeTestConfig } from '../../src/effect/test-layers.ts'

// Get real API key from environment for integration tests
const REAL_API_KEY = process.env.MOVIEDB_API_KEY

describe('HttpClient', () => {
  it.effect.skipIf(!REAL_API_KEY)('successfully fetches and parses JSON', () =>
    Effect.gen(function* () {
      const client = yield* makeMovieDbHttpClient()

      // Make a simple request to get movie details (v3 API endpoint)
      const response = yield* client.get('/movie/550')
      const data = yield* response.json

      // Verify we got a valid response with expected fields
      expect(typeof data).toBe('object')
      expect(data).not.toBeNull()
    }).pipe(
      Effect.provide(NodeHttpClient.layerUndici),
      Effect.provide(makeTestConfig({ apiKey: REAL_API_KEY! })),
      Effect.scoped,
    ),
  )

  it.effect.skipIf(!REAL_API_KEY)('maps 404 to NotFoundError', () =>
    Effect.gen(function* () {
      const client = yield* makeMovieDbHttpClient()

      // Try to fetch a non-existent movie - should map 404 to NotFoundError
      yield* executeJson(client, '/movie/9999999999')
    }).pipe(
      Effect.provide(NodeHttpClient.layerUndici),
      Effect.provide(makeTestConfig({ apiKey: REAL_API_KEY! })),
      Effect.scoped,
      Effect.flip, // Flip error to success channel
      Effect.map((error) => {
        expect(error._tag).toBe('NotFoundError')
      }),
    ),
  )

  it.effect('maps 401 to AuthenticationError via executeJson', () =>
    Effect.gen(function* () {
      const client = yield* makeMovieDbHttpClient()

      // Use an invalid API key to trigger 401
      yield* executeJson(client, '/movie/550')
    }).pipe(
      Effect.provide(NodeHttpClient.layerUndici),
      Effect.provide(
        makeTestConfig({
          apiKey: 'invalid-key',
        }),
      ),
      Effect.scoped,
      Effect.flip, // Flip error to success channel
      Effect.map((error) => {
        expect(error._tag).toBe('AuthenticationError')
      }),
    ),
  )

  it.effect(
    'handles network errors',
    () =>
      Effect.gen(function* () {
        const client = yield* makeMovieDbHttpClient()

        // Make direct request without retry wrapper to test error mapping
        // (executeJson includes retries which would make this test too slow)
        yield* client.get('/movie/550').pipe(
          Effect.flatMap((response) => response.json),
          Effect.scoped,
          // Map HttpClientError to MovieDbErrors (same as executeJson)
          Effect.catchTags({
            ResponseError: (error) => Effect.fail(fromHttpStatus(error.response.status, error.message)),
            RequestError: (error) => Effect.fail(toNetworkError(error.cause ?? error, error.request.url)),
          }),
        )
      }).pipe(
        Effect.provide(NodeHttpClient.layerUndici),
        Effect.provide(
          makeTestConfig({
            baseUrl: 'https://localhost:1/', // Use localhost with invalid port for faster failure
          }),
        ),
        Effect.scoped,
        Effect.timeout('5 seconds'), // Add timeout to avoid hanging
        Effect.flip, // Flip error to success channel
        Effect.map((error) => {
          expect(error._tag).toBe('NetworkError')
        }),
      ),
    { timeout: 10000 }, // 10 second test timeout
  )
})
