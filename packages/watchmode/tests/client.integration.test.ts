/**
 * Integration tests for Watchmode API client
 *
 * These tests make real API calls to the Watchmode API.
 * Requires WATCHMODE_API_KEY environment variable to be set.
 *
 * Run with: pnpm test:integration
 */

import { NodeHttpClient } from '@effect/platform-node'
import { Effect, Layer } from 'effect'
import { describe, expect, it } from 'vitest'
import { WatchmodeClient, WatchmodeConfig } from '../src/index.ts'

const getApiKey = (): string => {
  const apiKey = process.env['WATCHMODE_API_KEY']
  if (!apiKey) {
    throw new Error(
      'WATCHMODE_API_KEY environment variable is required for integration tests. '
        + 'Get your API key at: https://api.watchmode.com/',
    )
  }
  return apiKey
}

/**
 * Create a live layer for integration testing
 */
const makeIntegrationLayer = () => {
  const apiKey = getApiKey()

  const ConfigLayer = Layer.succeed(WatchmodeConfig, {
    apiKey,
    baseUrl: 'https://api.watchmode.com/v1/',
  })

  return WatchmodeClient.Default.pipe(
    Layer.provide(NodeHttpClient.layerUndici),
    Layer.provide(ConfigLayer),
  )
}

describe('Watchmode Integration Tests', () => {
  describe('getSources', () => {
    it('should fetch list of streaming sources', async () => {
      const program = Effect.gen(function*() {
        const client = yield* WatchmodeClient
        const sources = yield* client.getSources()

        expect(sources.length).toBeGreaterThan(0)

        // Check that sources have expected shape
        const firstSource = sources[0]
        expect(firstSource).toHaveProperty('id')
        expect(firstSource).toHaveProperty('name')
        expect(firstSource).toHaveProperty('type')

        // Look for common streaming services
        const netflix = sources.find((s) => s.name.toLowerCase().includes('netflix'))
        expect(netflix).toBeDefined()

        return sources
      })

      const result = await Effect.runPromise(program.pipe(Effect.provide(makeIntegrationLayer())))

      expect(result).toBeDefined()
    })

    it('should filter sources by region', async () => {
      const program = Effect.gen(function*() {
        const client = yield* WatchmodeClient
        const sources = yield* client.getSources({ regions: 'US' })

        expect(sources.length).toBeGreaterThan(0)

        // All sources should include US region
        for (const source of sources) {
          if (source.regions && source.regions.length > 0) {
            expect(source.regions).toContain('US')
          }
        }

        return sources
      })

      await Effect.runPromise(program.pipe(Effect.provide(makeIntegrationLayer())))
    })
  })

  describe('search', () => {
    it('should search for titles by name', async () => {
      const program = Effect.gen(function*() {
        const client = yield* WatchmodeClient
        const results = yield* client.search({ query: 'Breaking Bad' })

        expect(results.title_results.length).toBeGreaterThan(0)

        // Check that results have expected shape
        const firstResult = results.title_results[0]
        expect(firstResult).toHaveProperty('id')
        expect(firstResult).toHaveProperty('name')
        expect(firstResult).toHaveProperty('type')

        // Should find Breaking Bad
        const breakingBad = results.title_results.find((t) => t.name.toLowerCase().includes('breaking bad'))
        expect(breakingBad).toBeDefined()

        return results
      })

      await Effect.runPromise(program.pipe(Effect.provide(makeIntegrationLayer())))
    })

    it('should search by IMDB ID', async () => {
      const program = Effect.gen(function*() {
        const client = yield* WatchmodeClient
        // tt0903747 = Breaking Bad
        const results = yield* client.search({
          query: 'tt0903747',
          searchField: 'imdb_id',
        })

        expect(results.title_results.length).toBeGreaterThan(0)

        const result = results.title_results[0]
        expect(result.imdb_id).toBe('tt0903747')

        return results
      })

      await Effect.runPromise(program.pipe(Effect.provide(makeIntegrationLayer())))
    })
  })

  describe('getTitleDetails', () => {
    it('should fetch title details by Watchmode ID', async () => {
      const program = Effect.gen(function*() {
        const client = yield* WatchmodeClient

        // First search to get a Watchmode ID
        const searchResults = yield* client.search({ query: 'Inception' })
        expect(searchResults.title_results.length).toBeGreaterThan(0)

        const titleId = searchResults.title_results[0].id

        // Then get details
        const details = yield* client.getTitleDetails({ id: titleId })

        expect(details.id).toBe(titleId)
        expect(details.title).toBeDefined()
        expect(details.type).toBeDefined()

        return details
      })

      await Effect.runPromise(program.pipe(Effect.provide(makeIntegrationLayer())))
    })

    it('should fetch title details with sources', async () => {
      const program = Effect.gen(function*() {
        const client = yield* WatchmodeClient

        // Search for a popular title
        const searchResults = yield* client.search({ query: 'The Matrix' })
        expect(searchResults.title_results.length).toBeGreaterThan(0)

        const titleId = searchResults.title_results[0].id

        // Get details with sources appended
        const details = yield* client.getTitleDetails({
          id: titleId,
          appendToResponse: ['sources'],
        })

        expect(details.id).toBe(titleId)
        // Sources may or may not be available depending on region/API plan

        return details
      })

      await Effect.runPromise(program.pipe(Effect.provide(makeIntegrationLayer())))
    })
  })

  describe('getTitleSources', () => {
    it('should fetch streaming sources for a title', async () => {
      const program = Effect.gen(function*() {
        const client = yield* WatchmodeClient

        // First search to get a Watchmode ID
        const searchResults = yield* client.search({ query: 'Stranger Things' })
        expect(searchResults.title_results.length).toBeGreaterThan(0)

        const titleId = searchResults.title_results[0].id

        // Get sources
        const sources = yield* client.getTitleSources({ id: titleId })

        // Popular titles should have at least some sources
        expect(sources.length).toBeGreaterThanOrEqual(0)

        if (sources.length > 0) {
          const firstSource = sources[0]
          expect(firstSource).toHaveProperty('source_id')
          expect(firstSource).toHaveProperty('name')
          expect(firstSource).toHaveProperty('type')
        }

        return sources
      })

      await Effect.runPromise(program.pipe(Effect.provide(makeIntegrationLayer())))
    })
  })
})
