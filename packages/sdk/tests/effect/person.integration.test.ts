/**
 * Tests for Person service
 */

import { describe, it, expect } from '@effect/vitest'
import { NodeHttpClient } from '@effect/platform-node'
import { Effect } from 'effect'
import { Person } from '../../src/effect/person.ts'
import { MovieDbClient } from '../../src/effect/client.ts'
import { makeTestConfig, MockRateLimiter } from '../../src/effect/test-layers.ts'
import { RateLimiterLive } from '../../src/effect/rate-limiter.ts'

const REAL_API_KEY = process.env.MOVIEDB_API_KEY

// Brad Pitt ID for testing
const BRAD_PITT_ID = 287

describe('Person', () => {
  it.skipIf(!REAL_API_KEY)('getDetails returns person information', () => {
    const program = Effect.gen(function* () {
      const person = yield* Person

      const details = yield* person.getDetails({ id: BRAD_PITT_ID })

      // Verify Brad Pitt metadata
      expect(details.id).toBe(BRAD_PITT_ID)
      expect(details.name).toBe('Brad Pitt')
      expect(details.birthday).toBe('1963-12-18')
      expect(details.placeOfBirth).toBe('Shawnee, Oklahoma, USA')
      expect(details.knownForDepartment).toBe('Acting')
      expect(details.gender).toBe(2) // Male

      // Verify biography exists
      expect(typeof details.biography).toBe('string')
      expect(details.biography.length > 0).toBe(true)

      // Verify IMDb ID
      expect(details.imdbId).toBe('nm0000093')

      // Verify popularity
      expect(typeof details.popularity).toBe('number')
      expect(details.popularity > 0).toBe(true)
    }).pipe(
      Effect.provide(Person.Default),
      Effect.provide(MovieDbClient.Default),
      Effect.provide(RateLimiterLive),
      Effect.provide(NodeHttpClient.layerUndici),
      Effect.provide(makeTestConfig({ apiKey: REAL_API_KEY! })),
      Effect.scoped,
    )

    return Effect.runPromise(program)
  })

  it.skipIf(!REAL_API_KEY)('getMovieCredits returns cast and crew roles', () => {
    const program = Effect.gen(function* () {
      const person = yield* Person

      const credits = yield* person.getMovieCredits({ id: BRAD_PITT_ID })

      // Verify we got valid credits data
      expect(credits.id).toBe(BRAD_PITT_ID)
      expect(Array.isArray(credits.cast)).toBe(true)
      expect(Array.isArray(credits.crew)).toBe(true)
      expect(credits.cast.length > 0).toBe(true)

      // Verify Fight Club is in the cast
      const fightClub = credits.cast.find((c) => c.title === 'Fight Club' && c.character === 'Tyler Durden')
      expect(fightClub).toBeDefined()
      expect(fightClub?.id).toBe(550)

      // Verify Ocean's Eleven is in the cast
      const oceansEleven = credits.cast.find((c) => c.title === "Ocean's Eleven")
      expect(oceansEleven).toBeDefined()

      // Verify crew credits exist (if any)
      if (credits.crew.length > 0) {
        const firstCrew = credits.crew[0]
        expect(typeof firstCrew.job).toBe('string')
        expect(typeof firstCrew.department).toBe('string')
      }
    }).pipe(
      Effect.provide(Person.Default),
      Effect.provide(MovieDbClient.Default),
      Effect.provide(RateLimiterLive),
      Effect.provide(NodeHttpClient.layerUndici),
      Effect.provide(makeTestConfig({ apiKey: REAL_API_KEY! })),
      Effect.scoped,
    )

    return Effect.runPromise(program)
  })

  it.skipIf(!REAL_API_KEY)('getTvCredits returns TV show roles', () => {
    const program = Effect.gen(function* () {
      const person = yield* Person

      const credits = yield* person.getTvCredits({ id: BRAD_PITT_ID })

      // Verify we got valid TV credits data
      expect(credits.id).toBe(BRAD_PITT_ID)
      expect(Array.isArray(credits.cast)).toBe(true)
      expect(Array.isArray(credits.crew)).toBe(true)

      // Brad Pitt has appeared in TV shows
      if (credits.cast.length > 0) {
        const firstCredit = credits.cast[0]
        expect(typeof firstCredit.id).toBe('number')
        expect(typeof firstCredit.name).toBe('string')
        expect(typeof firstCredit.character).toBe('string')
      }
    }).pipe(
      Effect.provide(Person.Default),
      Effect.provide(MovieDbClient.Default),
      Effect.provide(RateLimiterLive),
      Effect.provide(NodeHttpClient.layerUndici),
      Effect.provide(makeTestConfig({ apiKey: REAL_API_KEY! })),
      Effect.scoped,
    )

    return Effect.runPromise(program)
  })

  it.skipIf(!REAL_API_KEY)('getCombinedCredits returns both movie and TV credits', () => {
    const program = Effect.gen(function* () {
      const person = yield* Person

      const credits = yield* person.getCombinedCredits({ id: BRAD_PITT_ID })

      // Verify we got valid combined credits data
      expect(credits.id).toBe(BRAD_PITT_ID)
      expect(Array.isArray(credits.cast)).toBe(true)
      expect(Array.isArray(credits.crew)).toBe(true)
      expect(credits.cast.length > 0).toBe(true)

      // Verify Fight Club is in combined credits with media_type
      const fightClub = credits.cast.find((c) => 'title' in c && c.title === 'Fight Club')
      expect(fightClub).toBeDefined()
      expect(fightClub?.mediaType).toBe('movie')

      // Verify we have media_type for all credits
      credits.cast.forEach((credit) => {
        expect(credit.mediaType === 'movie' || credit.mediaType === 'tv').toBe(true)
      })

      // Verify movie credits have title
      const movieCredits = credits.cast.filter((c) => c.mediaType === 'movie')
      if (movieCredits.length > 0) {
        movieCredits.forEach((credit) => {
          expect('title' in credit).toBe(true)
        })
      }

      // Verify TV credits have name
      const tvCredits = credits.cast.filter((c) => c.mediaType === 'tv')
      if (tvCredits.length > 0) {
        tvCredits.forEach((credit) => {
          expect('name' in credit).toBe(true)
        })
      }
    }).pipe(
      Effect.provide(Person.Default),
      Effect.provide(MovieDbClient.Default),
      Effect.provide(RateLimiterLive),
      Effect.provide(NodeHttpClient.layerUndici),
      Effect.provide(makeTestConfig({ apiKey: REAL_API_KEY! })),
      Effect.scoped,
    )

    return Effect.runPromise(program)
  })

  it.skipIf(!REAL_API_KEY)('getImages returns profile photos', () => {
    const program = Effect.gen(function* () {
      const person = yield* Person

      const images = yield* person.getImages({ id: BRAD_PITT_ID })

      // Verify we got valid images data
      expect(images.id).toBe(BRAD_PITT_ID)
      expect(Array.isArray(images.profiles)).toBe(true)
      expect(images.profiles.length > 0).toBe(true)

      // Verify first image has required fields
      const firstImage = images.profiles[0]
      expect(typeof firstImage.filePath).toBe('string')
      expect(typeof firstImage.width).toBe('number')
      expect(typeof firstImage.height).toBe('number')
      expect(firstImage.width > 0).toBe(true)
      expect(firstImage.height > 0).toBe(true)
    }).pipe(
      Effect.provide(Person.Default),
      Effect.provide(MovieDbClient.Default),
      Effect.provide(RateLimiterLive),
      Effect.provide(NodeHttpClient.layerUndici),
      Effect.provide(makeTestConfig({ apiKey: REAL_API_KEY! })),
      Effect.scoped,
    )

    return Effect.runPromise(program)
  })

  it.skipIf(!REAL_API_KEY)('getPopular returns paginated results', () => {
    const program = Effect.gen(function* () {
      const person = yield* Person

      const popular = yield* person.getPopular({ page: 1 })

      // Verify pagination structure
      expect(typeof popular.page).toBe('number')
      expect(typeof popular.totalPages).toBe('number')
      expect(typeof popular.totalResults).toBe('number')
      expect(Array.isArray(popular.results)).toBe(true)
      expect(popular.results.length > 0).toBe(true)

      // Verify first person has required fields
      const firstPerson = popular.results[0]
      expect(typeof firstPerson.id).toBe('number')
      expect(typeof firstPerson.name).toBe('string')
      expect(typeof firstPerson.knownForDepartment).toBe('string')
      expect(typeof firstPerson.popularity).toBe('number')
      expect(firstPerson.popularity > 0).toBe(true)

      // Verify knownFor exists and has entries
      if (firstPerson.knownFor) {
        expect(Array.isArray(firstPerson.knownFor)).toBe(true)
        if (firstPerson.knownFor.length > 0) {
          const firstKnownFor = firstPerson.knownFor[0]
          expect(typeof firstKnownFor.id).toBe('number')
          expect(firstKnownFor.mediaType === 'movie' || firstKnownFor.mediaType === 'tv').toBe(true)
        }
      }
    }).pipe(
      Effect.provide(Person.Default),
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
      const person = yield* Person

      // Verify service methods exist
      expect(typeof person.getDetails).toBe('function')
      expect(typeof person.getMovieCredits).toBe('function')
      expect(typeof person.getTvCredits).toBe('function')
      expect(typeof person.getCombinedCredits).toBe('function')
      expect(typeof person.getImages).toBe('function')
      expect(typeof person.getPopular).toBe('function')
    }).pipe(
      Effect.provide(Person.Default),
      Effect.provide(MovieDbClient.Default),
      Effect.provide(MockRateLimiter),
      Effect.provide(NodeHttpClient.layerUndici),
      Effect.provide(makeTestConfig()),
    ),
  )
})
