/**
 * Tests for TV service
 */

import { describe, it, expect } from '@effect/vitest'
import { NodeHttpClient } from '@effect/platform-node'
import { Effect } from 'effect'
import { Tv } from '../../src/effect/tv.ts'
import { MovieDbClient } from '../../src/effect/client.ts'
import { makeTestConfig, MockRateLimiter } from '../../src/effect/test-layers.ts'
import { RateLimiterLive } from '../../src/effect/rate-limiter.ts'

const REAL_API_KEY = process.env.MOVIEDB_API_KEY

// Breaking Bad TV show ID for testing
const BREAKING_BAD_ID = 1396

describe('Tv', () => {
  it.skipIf(!REAL_API_KEY)('getDetails returns TV show information', () => {
    const program = Effect.gen(function* () {
      const tv = yield* Tv

      const details = yield* tv.getDetails({ id: BREAKING_BAD_ID })

      // Verify Breaking Bad metadata
      expect(details.id).toBe(BREAKING_BAD_ID)
      expect(details.name).toBe('Breaking Bad')
      expect(details.originalName).toBe('Breaking Bad')
      expect(details.firstAirDate).toBe('2008-01-20')
      expect(details.lastAirDate).toBe('2013-09-29')

      // Verify tagline exists
      expect(typeof details.tagline).toBe('string')

      // Verify overview mentions key elements
      expect(details.overview.includes('chemistry') || details.overview.includes('teacher')).toBe(true)

      // Verify genres include Drama
      const genreNames = details.genres.map((g) => g.name)
      expect(genreNames.includes('Drama')).toBe(true)

      // Verify season/episode counts
      expect(details.numberOfSeasons).toBe(5)
      expect(details.numberOfEpisodes).toBe(62)

      // Verify show is completed
      expect(details.status).toBe('Ended')
      expect(details.inProduction).toBe(false)
    }).pipe(
      Effect.provide(Tv.Default),
      Effect.provide(MovieDbClient.Default),
      Effect.provide(RateLimiterLive),
      Effect.provide(NodeHttpClient.layerUndici),
      Effect.provide(makeTestConfig({ apiKey: REAL_API_KEY! })),
      Effect.scoped,
    )

    return Effect.runPromise(program)
  })

  it.skipIf(!REAL_API_KEY)('getCredits returns cast and crew', () => {
    const program = Effect.gen(function* () {
      const tv = yield* Tv

      const credits = yield* tv.getCredits({ id: BREAKING_BAD_ID })

      // Verify we got valid credits data
      expect(credits.id).toBe(BREAKING_BAD_ID)
      expect(Array.isArray(credits.cast)).toBe(true)
      expect(Array.isArray(credits.crew)).toBe(true)
      expect(credits.cast.length > 0).toBe(true)
      expect(credits.crew.length > 0).toBe(true)

      // Verify Bryan Cranston is in the cast as Walter White
      const bryanCranston = credits.cast.find((c) => c.name === 'Bryan Cranston')
      expect(bryanCranston).toBeDefined()
      expect(bryanCranston?.character).toBe('Walter White')

      // Verify Aaron Paul is in the cast as Jesse Pinkman
      const aaronPaul = credits.cast.find((c) => c.name === 'Aaron Paul')
      expect(aaronPaul).toBeDefined()
      expect(aaronPaul?.character).toBe('Jesse Pinkman')

      // Verify Vince Gilligan is in the crew
      const vinceGilligan = credits.crew.find((c) => c.name === 'Vince Gilligan')
      expect(vinceGilligan).toBeDefined()
    }).pipe(
      Effect.provide(Tv.Default),
      Effect.provide(MovieDbClient.Default),
      Effect.provide(RateLimiterLive),
      Effect.provide(NodeHttpClient.layerUndici),
      Effect.provide(makeTestConfig({ apiKey: REAL_API_KEY! })),
      Effect.scoped,
    )

    return Effect.runPromise(program)
  })

  it.skipIf(!REAL_API_KEY)('getVideos returns trailers and clips', () => {
    const program = Effect.gen(function* () {
      const tv = yield* Tv

      const videos = yield* tv.getVideos({ id: BREAKING_BAD_ID })

      // Verify we got valid videos data
      expect(videos.id).toBe(BREAKING_BAD_ID)
      expect(Array.isArray(videos.results)).toBe(true)

      if (videos.results.length > 0) {
        const firstVideo = videos.results[0]
        expect(typeof firstVideo.id).toBe('string')
        expect(typeof firstVideo.key).toBe('string')
        expect(typeof firstVideo.name).toBe('string')
        expect(typeof firstVideo.site).toBe('string')
        expect(typeof firstVideo.type).toBe('string')
      }
    }).pipe(
      Effect.provide(Tv.Default),
      Effect.provide(MovieDbClient.Default),
      Effect.provide(RateLimiterLive),
      Effect.provide(NodeHttpClient.layerUndici),
      Effect.provide(makeTestConfig({ apiKey: REAL_API_KEY! })),
      Effect.scoped,
    )

    return Effect.runPromise(program)
  })

  it.skipIf(!REAL_API_KEY)('getImages returns posters and backdrops', () => {
    const program = Effect.gen(function* () {
      const tv = yield* Tv

      const images = yield* tv.getImages({ id: BREAKING_BAD_ID })

      // Verify we got valid images data
      expect(images.id).toBe(BREAKING_BAD_ID)
      expect(Array.isArray(images.backdrops)).toBe(true)
      expect(Array.isArray(images.posters)).toBe(true)
      expect(Array.isArray(images.logos)).toBe(true)

      // Verify we have at least some images
      expect(images.posters.length > 0).toBe(true)

      if (images.posters.length > 0) {
        const firstPoster = images.posters[0]
        expect(typeof firstPoster.filePath).toBe('string')
        expect(typeof firstPoster.width).toBe('number')
        expect(typeof firstPoster.height).toBe('number')
      }
    }).pipe(
      Effect.provide(Tv.Default),
      Effect.provide(MovieDbClient.Default),
      Effect.provide(RateLimiterLive),
      Effect.provide(NodeHttpClient.layerUndici),
      Effect.provide(makeTestConfig({ apiKey: REAL_API_KEY! })),
      Effect.scoped,
    )

    return Effect.runPromise(program)
  })

  it.skipIf(!REAL_API_KEY)('getAiringToday returns paginated results', () => {
    const program = Effect.gen(function* () {
      const tv = yield* Tv

      const airingToday = yield* tv.getAiringToday({ page: 1 })

      // Verify pagination structure
      expect(typeof airingToday.page).toBe('number')
      expect(typeof airingToday.totalPages).toBe('number')
      expect(typeof airingToday.totalResults).toBe('number')
      expect(Array.isArray(airingToday.results)).toBe(true)

      // Results might be empty depending on the day
      if (airingToday.results.length > 0) {
        const firstShow = airingToday.results[0]
        expect(typeof firstShow.id).toBe('number')
        expect(typeof firstShow.name).toBe('string')
        expect(typeof firstShow.overview).toBe('string')
      }
    }).pipe(
      Effect.provide(Tv.Default),
      Effect.provide(MovieDbClient.Default),
      Effect.provide(RateLimiterLive),
      Effect.provide(NodeHttpClient.layerUndici),
      Effect.provide(makeTestConfig({ apiKey: REAL_API_KEY! })),
      Effect.scoped,
    )

    return Effect.runPromise(program)
  })

  it.skipIf(!REAL_API_KEY)('getOnTheAir returns paginated results', () => {
    const program = Effect.gen(function* () {
      const tv = yield* Tv

      const onTheAir = yield* tv.getOnTheAir({ page: 1 })

      // Verify pagination structure
      expect(typeof onTheAir.page).toBe('number')
      expect(typeof onTheAir.totalPages).toBe('number')
      expect(typeof onTheAir.totalResults).toBe('number')
      expect(Array.isArray(onTheAir.results)).toBe(true)
      expect(onTheAir.results.length > 0).toBe(true)
    }).pipe(
      Effect.provide(Tv.Default),
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
      const tv = yield* Tv

      const popular = yield* tv.getPopular({ page: 1 })

      // Verify pagination structure
      expect(typeof popular.page).toBe('number')
      expect(typeof popular.totalPages).toBe('number')
      expect(typeof popular.totalResults).toBe('number')
      expect(Array.isArray(popular.results)).toBe(true)
      expect(popular.results.length > 0).toBe(true)
    }).pipe(
      Effect.provide(Tv.Default),
      Effect.provide(MovieDbClient.Default),
      Effect.provide(RateLimiterLive),
      Effect.provide(NodeHttpClient.layerUndici),
      Effect.provide(makeTestConfig({ apiKey: REAL_API_KEY! })),
      Effect.scoped,
    )

    return Effect.runPromise(program)
  })

  it.skipIf(!REAL_API_KEY)('getTopRated returns paginated results', () => {
    const program = Effect.gen(function* () {
      const tv = yield* Tv

      const topRated = yield* tv.getTopRated({ page: 1 })

      // Verify pagination structure
      expect(typeof topRated.page).toBe('number')
      expect(typeof topRated.totalPages).toBe('number')
      expect(typeof topRated.totalResults).toBe('number')
      expect(Array.isArray(topRated.results)).toBe(true)
      expect(topRated.results.length > 0).toBe(true)
    }).pipe(
      Effect.provide(Tv.Default),
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
      const tv = yield* Tv

      // Verify service methods exist
      expect(typeof tv.getDetails).toBe('function')
      expect(typeof tv.getCredits).toBe('function')
      expect(typeof tv.getVideos).toBe('function')
      expect(typeof tv.getImages).toBe('function')
      expect(typeof tv.getAiringToday).toBe('function')
      expect(typeof tv.getOnTheAir).toBe('function')
      expect(typeof tv.getPopular).toBe('function')
      expect(typeof tv.getTopRated).toBe('function')
    }).pipe(
      Effect.provide(Tv.Default),
      Effect.provide(MovieDbClient.Default),
      Effect.provide(MockRateLimiter),
      Effect.provide(NodeHttpClient.layerUndici),
      Effect.provide(makeTestConfig()),
    ),
  )
})
