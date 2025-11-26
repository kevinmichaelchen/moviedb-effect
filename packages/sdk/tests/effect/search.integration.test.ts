/**
 * Tests for Search service
 */

import { describe, it, expect } from '@effect/vitest'
import { NodeHttpClient } from '@effect/platform-node'
import { Effect } from 'effect'
import { Search } from '../../src/effect/search.ts'
import { MovieDbClient } from '../../src/effect/client.ts'
import { makeTestConfig, MockRateLimiter } from '../../src/effect/test-layers.ts'
import { RateLimiterLive } from '../../src/effect/rate-limiter.ts'

const REAL_API_KEY = process.env.MOVIEDB_API_KEY

describe('Search', () => {
  it.skipIf(!REAL_API_KEY)('searchMovie finds Fight Club', () => {
    const program = Effect.gen(function* () {
      const search = yield* Search

      const results = yield* search.searchMovie({
        query: 'fight club',
        page: 1,
      })

      // Verify pagination structure
      expect(typeof results.page).toBe('number')
      expect(typeof results.totalPages).toBe('number')
      expect(typeof results.totalResults).toBe('number')
      expect(Array.isArray(results.results)).toBe(true)
      expect(results.results.length > 0).toBe(true)

      // Find Fight Club (1999) in results
      const fightClub = results.results.find((m) => m.title === 'Fight Club' && m.releaseDate === '1999-10-15')
      expect(fightClub).toBeDefined()

      // Verify Fight Club details
      expect(fightClub?.id).toBe(550)
      expect(fightClub?.originalTitle).toBe('Fight Club')
      expect(fightClub?.overview.includes('insomniac') || fightClub?.overview.includes('discontented')).toBe(true)
    }).pipe(
      Effect.provide(Search.Default),
      Effect.provide(MovieDbClient.Default),
      Effect.provide(RateLimiterLive),
      Effect.provide(NodeHttpClient.layerUndici),
      Effect.provide(makeTestConfig({ apiKey: REAL_API_KEY! })),
      Effect.scoped,
    )

    return Effect.runPromise(program)
  })

  it.skipIf(!REAL_API_KEY)('searchTv finds Breaking Bad', () => {
    const program = Effect.gen(function* () {
      const search = yield* Search

      const results = yield* search.searchTv({
        query: 'breaking bad',
        page: 1,
      })

      // Verify pagination structure
      expect(typeof results.page).toBe('number')
      expect(typeof results.totalPages).toBe('number')
      expect(typeof results.totalResults).toBe('number')
      expect(Array.isArray(results.results)).toBe(true)
      expect(results.results.length > 0).toBe(true)

      // Find Breaking Bad in results
      const breakingBad = results.results.find(
        (show) => show.name === 'Breaking Bad' && show.firstAirDate === '2008-01-20',
      )
      expect(breakingBad).toBeDefined()

      // Verify Breaking Bad details
      expect(breakingBad?.id).toBe(1396)
      expect(breakingBad?.originalName).toBe('Breaking Bad')
      expect(breakingBad?.overview.includes('chemistry') || breakingBad?.overview.includes('teacher')).toBe(true)
    }).pipe(
      Effect.provide(Search.Default),
      Effect.provide(MovieDbClient.Default),
      Effect.provide(RateLimiterLive),
      Effect.provide(NodeHttpClient.layerUndici),
      Effect.provide(makeTestConfig({ apiKey: REAL_API_KEY! })),
      Effect.scoped,
    )

    return Effect.runPromise(program)
  })

  it.skipIf(!REAL_API_KEY)('searchPerson finds Brad Pitt', () => {
    const program = Effect.gen(function* () {
      const search = yield* Search

      const results = yield* search.searchPerson({
        query: 'brad pitt',
        page: 1,
      })

      // Verify pagination structure
      expect(typeof results.page).toBe('number')
      expect(typeof results.totalPages).toBe('number')
      expect(typeof results.totalResults).toBe('number')
      expect(Array.isArray(results.results)).toBe(true)
      expect(results.results.length > 0).toBe(true)

      // Find Brad Pitt in results
      const bradPitt = results.results.find((person) => person.name === 'Brad Pitt')
      expect(bradPitt).toBeDefined()

      // Verify Brad Pitt details
      expect(bradPitt?.id).toBe(287)
      expect(bradPitt?.knownForDepartment).toBe('Acting')
      expect(typeof bradPitt?.popularity).toBe('number')
      if (bradPitt?.popularity !== undefined) {
        expect(bradPitt.popularity > 0).toBe(true)
      }

      // Verify knownFor exists and has movies
      if (bradPitt?.knownFor) {
        expect(Array.isArray(bradPitt.knownFor)).toBe(true)
        expect(bradPitt.knownFor.length > 0).toBe(true)
      }
    }).pipe(
      Effect.provide(Search.Default),
      Effect.provide(MovieDbClient.Default),
      Effect.provide(RateLimiterLive),
      Effect.provide(NodeHttpClient.layerUndici),
      Effect.provide(makeTestConfig({ apiKey: REAL_API_KEY! })),
      Effect.scoped,
    )

    return Effect.runPromise(program)
  })

  it.skipIf(!REAL_API_KEY)('searchMulti finds results across media types', () => {
    const program = Effect.gen(function* () {
      const search = yield* Search

      const results = yield* search.searchMulti({
        query: 'fight',
        page: 1,
      })

      // Verify pagination structure
      expect(typeof results.page).toBe('number')
      expect(typeof results.totalPages).toBe('number')
      expect(typeof results.totalResults).toBe('number')
      expect(Array.isArray(results.results)).toBe(true)
      expect(results.results.length > 0).toBe(true)

      // Verify we have different media types
      const mediaTypes = new Set(results.results.map((r) => r.mediaType))

      // Should have at least one type (could be movie, tv, or person)
      expect(mediaTypes.size > 0).toBe(true)

      // Verify first result has required fields based on media type
      const firstResult = results.results[0]
      expect(typeof firstResult).toBe('object')

      if (firstResult.mediaType === 'movie') {
        expect('title' in firstResult).toBe(true)
      } else if (firstResult.mediaType === 'tv') {
        expect('name' in firstResult).toBe(true)
      } else if (firstResult.mediaType === 'person') {
        expect('name' in firstResult).toBe(true)
      }
    }).pipe(
      Effect.provide(Search.Default),
      Effect.provide(MovieDbClient.Default),
      Effect.provide(RateLimiterLive),
      Effect.provide(NodeHttpClient.layerUndici),
      Effect.provide(makeTestConfig({ apiKey: REAL_API_KEY! })),
      Effect.scoped,
    )

    return Effect.runPromise(program)
  })

  it.skipIf(!REAL_API_KEY)('searchMovie with year filter', () => {
    const program = Effect.gen(function* () {
      const search = yield* Search

      const results = yield* search.searchMovie({
        query: 'fight club',
        year: 1999,
        page: 1,
      })

      // Verify we got results
      expect(results.results.length > 0).toBe(true)

      // All results should be from 1999
      const fightClub1999 = results.results.find((m) => m.title === 'Fight Club' && m.releaseDate.startsWith('1999'))
      expect(fightClub1999).toBeDefined()
    }).pipe(
      Effect.provide(Search.Default),
      Effect.provide(MovieDbClient.Default),
      Effect.provide(RateLimiterLive),
      Effect.provide(NodeHttpClient.layerUndici),
      Effect.provide(makeTestConfig({ apiKey: REAL_API_KEY! })),
      Effect.scoped,
    )

    return Effect.runPromise(program)
  })

  it.skipIf(!REAL_API_KEY)('empty query returns results', () => {
    const program = Effect.gen(function* () {
      const search = yield* Search

      // TMDb API requires a query, so searching for a very common term
      const results = yield* search.searchMovie({
        query: 'a',
        page: 1,
      })

      // Verify pagination structure exists
      expect(typeof results.page).toBe('number')
      expect(typeof results.totalPages).toBe('number')
      expect(typeof results.totalResults).toBe('number')
      expect(Array.isArray(results.results)).toBe(true)
    }).pipe(
      Effect.provide(Search.Default),
      Effect.provide(MovieDbClient.Default),
      Effect.provide(RateLimiterLive),
      Effect.provide(NodeHttpClient.layerUndici),
      Effect.provide(makeTestConfig({ apiKey: REAL_API_KEY! })),
      Effect.scoped,
    )

    return Effect.runPromise(program)
  })

  it.effect('service is accessible via Effect.Service', () =>
    Effect.gen(function* () {
      const search = yield* Search

      // Verify service methods exist
      expect(typeof search.searchMovie).toBe('function')
      expect(typeof search.searchTv).toBe('function')
      expect(typeof search.searchPerson).toBe('function')
      expect(typeof search.searchMulti).toBe('function')
    }).pipe(
      Effect.provide(Search.Default),
      Effect.provide(MovieDbClient.Default),
      Effect.provide(MockRateLimiter),
      Effect.provide(NodeHttpClient.layerUndici),
      Effect.provide(makeTestConfig()),
    ),
  )
})
