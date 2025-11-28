/**
 * Integration tests for OMDb API client
 *
 * These tests make real API calls to the OMDb API.
 * Requires OMDB_API_KEY environment variable to be set.
 *
 * Run with: pnpm test:integration
 */

import { NodeHttpClient } from '@effect/platform-node'
import { Effect, Layer } from 'effect'
import { describe, expect, it } from 'vitest'
import { OmdbClient, OmdbConfig } from '../src/index.ts'

const getApiKey = (): string => {
  const apiKey = process.env['OMDB_API_KEY']
  if (!apiKey) {
    throw new Error(
      'OMDB_API_KEY environment variable is required for integration tests. '
        + 'Get your API key at: http://www.omdbapi.com/apikey.aspx',
    )
  }
  return apiKey
}

/**
 * Create a live layer for integration testing
 */
const makeIntegrationLayer = () => {
  const apiKey = getApiKey()

  const ConfigLayer = Layer.succeed(OmdbConfig, {
    apiKey,
    baseUrl: 'https://www.omdbapi.com/',
  })

  return OmdbClient.Default.pipe(
    Layer.provide(NodeHttpClient.layerUndici),
    Layer.provide(ConfigLayer),
  )
}

describe('OMDb Integration Tests', () => {
  describe('getByTitle', () => {
    it('should fetch movie details by title', async () => {
      const program = Effect.gen(function*() {
        const client = yield* OmdbClient
        const movie = yield* client.getByTitle({ title: 'Inception' })

        expect(movie.Title).toBe('Inception')
        expect(movie.Year).toBe('2010')
        expect(movie.Director).toBe('Christopher Nolan')
        expect(movie.imdbID).toBe('tt1375666')
        expect(movie.Type).toBe('movie')

        return movie
      })

      const result = await Effect.runPromise(program.pipe(Effect.provide(makeIntegrationLayer())))

      expect(result).toBeDefined()
      expect(result.Plot).toBeDefined()
    })

    it('should fetch movie with full plot', async () => {
      const program = Effect.gen(function*() {
        const client = yield* OmdbClient
        const movie = yield* client.getByTitle({
          title: 'The Matrix',
          plot: 'full',
        })

        expect(movie.Title).toBe('The Matrix')
        expect(movie.Plot).toBeDefined()
        // Full plot should be longer than short plot
        expect(movie.Plot!.length).toBeGreaterThan(100)

        return movie
      })

      await Effect.runPromise(program.pipe(Effect.provide(makeIntegrationLayer())))
    })

    it('should filter by type', async () => {
      const program = Effect.gen(function*() {
        const client = yield* OmdbClient
        const series = yield* client.getByTitle({
          title: 'Breaking Bad',
          type: 'series',
        })

        expect(series.Title).toBe('Breaking Bad')
        expect(series.Type).toBe('series')

        return series
      })

      await Effect.runPromise(program.pipe(Effect.provide(makeIntegrationLayer())))
    })
  })

  describe('getById', () => {
    it('should fetch movie details by IMDb ID', async () => {
      const program = Effect.gen(function*() {
        const client = yield* OmdbClient
        // tt0133093 = The Matrix
        const movie = yield* client.getById({ imdbId: 'tt0133093' })

        expect(movie.Title).toBe('The Matrix')
        expect(movie.imdbID).toBe('tt0133093')
        expect(movie.Year).toBe('1999')

        return movie
      })

      await Effect.runPromise(program.pipe(Effect.provide(makeIntegrationLayer())))
    })
  })

  describe('search', () => {
    it('should search for movies', async () => {
      const program = Effect.gen(function*() {
        const client = yield* OmdbClient
        const results = yield* client.search({ query: 'Batman' })

        expect(results.Search.length).toBeGreaterThan(0)
        expect(Number.parseInt(results.totalResults)).toBeGreaterThan(0)

        // Check that results have expected shape
        const firstResult = results.Search[0]
        expect(firstResult).toHaveProperty('Title')
        expect(firstResult).toHaveProperty('imdbID')
        expect(firstResult).toHaveProperty('Type')

        return results
      })

      await Effect.runPromise(program.pipe(Effect.provide(makeIntegrationLayer())))
    })

    it('should filter search by type', async () => {
      const program = Effect.gen(function*() {
        const client = yield* OmdbClient
        const results = yield* client.search({
          query: 'Star Trek',
          type: 'series',
        })

        expect(results.Search.length).toBeGreaterThan(0)
        // All results should be series
        for (const item of results.Search) {
          expect(item.Type).toBe('series')
        }

        return results
      })

      await Effect.runPromise(program.pipe(Effect.provide(makeIntegrationLayer())))
    })

    it('should return empty results for no matches', async () => {
      const program = Effect.gen(function*() {
        const client = yield* OmdbClient
        const results = yield* client.search({
          query: 'xyznonexistentmovie123456',
        })

        expect(results.Search).toHaveLength(0)
        expect(results.totalResults).toBe('0')

        return results
      })

      await Effect.runPromise(program.pipe(Effect.provide(makeIntegrationLayer())))
    })
  })
})
