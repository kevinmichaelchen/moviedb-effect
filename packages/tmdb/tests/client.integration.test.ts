/**
 * Integration tests for TMDB API client
 *
 * These tests make real API calls to the TMDB API.
 * Requires TMDB_API_KEY environment variable to be set.
 *
 * Run with: pnpm test:integration
 */

import { NodeHttpClient } from '@effect/platform-node'
import { Effect, Layer } from 'effect'
import { describe, expect, it } from 'vitest'
import { Movie, RateLimiterLive, TmdbClient, TmdbConfig } from '../src/index.ts'

const getApiKey = (): string => {
  const apiKey = process.env['TMDB_API_KEY']
  if (!apiKey) {
    throw new Error(
      'TMDB_API_KEY environment variable is required for integration tests. '
        + 'Get your API key at: https://www.themoviedb.org/settings/api',
    )
  }
  return apiKey
}

/**
 * Create a live layer for integration testing
 */
const makeIntegrationLayer = () => {
  const apiKey = getApiKey()

  const ConfigLayer = Layer.succeed(TmdbConfig, {
    apiKey,
    baseUrl: 'https://api.themoviedb.org/3/',
    requestsPerSecond: 50,
  })

  return Movie.Default.pipe(
    Layer.provide(TmdbClient.Default),
    Layer.provide(RateLimiterLive),
    Layer.provide(NodeHttpClient.layerUndici),
    Layer.provide(ConfigLayer),
  )
}

describe('TMDB Integration Tests', () => {
  describe('Movie Service', () => {
    it('should fetch movie details for Fight Club (id: 550)', async () => {
      const program = Effect.gen(function*() {
        const movie = yield* Movie
        const details = yield* movie.getDetails({ id: 550 })

        expect(details.id).toBe(550)
        expect(details.title).toBe('Fight Club')
        expect(details.releaseDate).toBe('1999-10-15')
        expect(details.originalTitle).toBe('Fight Club')

        return details
      })

      const result = await Effect.runPromise(program.pipe(Effect.provide(makeIntegrationLayer()), Effect.scoped))

      expect(result).toBeDefined()
      expect(result.overview).toContain('insomniac')
    })

    it('should fetch movie credits for Fight Club', async () => {
      const program = Effect.gen(function*() {
        const movie = yield* Movie
        const credits = yield* movie.getCredits({ id: 550 })

        expect(credits.id).toBe(550)
        expect(credits.cast.length).toBeGreaterThan(0)
        expect(credits.crew.length).toBeGreaterThan(0)

        // Check for Brad Pitt in cast
        const bradPitt = credits.cast.find((c) => c.name === 'Brad Pitt')
        expect(bradPitt).toBeDefined()
        expect(bradPitt?.character).toBe('Tyler Durden')

        return credits
      })

      await Effect.runPromise(program.pipe(Effect.provide(makeIntegrationLayer()), Effect.scoped))
    })

    it('should fetch popular movies', async () => {
      const program = Effect.gen(function*() {
        const movie = yield* Movie
        const popular = yield* movie.getPopular({ page: 1 })

        expect(popular.page).toBe(1)
        expect(popular.results.length).toBeGreaterThan(0)
        expect(popular.totalPages).toBeGreaterThan(0)
        expect(popular.totalResults).toBeGreaterThan(0)

        // Check that results have expected shape
        const firstMovie = popular.results[0]
        expect(firstMovie).toHaveProperty('id')
        expect(firstMovie).toHaveProperty('title')
        expect(firstMovie).toHaveProperty('voteAverage')

        return popular
      })

      await Effect.runPromise(program.pipe(Effect.provide(makeIntegrationLayer()), Effect.scoped))
    })
  })
})
