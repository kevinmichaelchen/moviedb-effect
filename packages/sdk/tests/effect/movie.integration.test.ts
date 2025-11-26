/**
 * Tests for Movie service
 */

import { describe, it, expect } from '@effect/vitest'
import { NodeHttpClient } from '@effect/platform-node'
import { Effect } from 'effect'
import { Movie } from '../../src/effect/movie.ts'
import { MovieDbClient } from '../../src/effect/client.ts'
import { makeTestConfig, MockRateLimiter } from '../../src/effect/test-layers.ts'
import { RateLimiterLive } from '../../src/effect/rate-limiter.ts'

const REAL_API_KEY = process.env.MOVIEDB_API_KEY

// Fight Club movie ID for testing
const FIGHT_CLUB_ID = 550

describe('Movie', () => {
  it.skipIf(!REAL_API_KEY)('getDetails returns movie information', () => {
    const program = Effect.gen(function* () {
      const movie = yield* Movie

      const details = yield* movie.getDetails({ id: FIGHT_CLUB_ID })

      // Verify Fight Club metadata
      expect(details.id).toBe(FIGHT_CLUB_ID)
      expect(details.title).toBe('Fight Club')
      expect(details.originalTitle).toBe('Fight Club')
      expect(details.releaseDate).toBe('1999-10-15')
      expect(details.tagline).toBe('Mischief. Mayhem. Soap.')

      // Verify overview contains key plot elements
      expect(details.overview.includes('discontented') || details.overview.includes('insomniac')).toBe(true)

      // Verify genres include Drama
      const genreNames = details.genres.map((g) => g.name)
      expect(genreNames.includes('Drama')).toBe(true)

      // Verify runtime is correct (139 minutes)
      expect(details.runtime).toBe(139)
    }).pipe(
      Effect.provide(Movie.Default),
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
      const movie = yield* Movie

      const credits = yield* movie.getCredits({ id: FIGHT_CLUB_ID })

      // Verify we got valid credits data
      expect(credits.id).toBe(FIGHT_CLUB_ID)
      expect(Array.isArray(credits.cast)).toBe(true)
      expect(Array.isArray(credits.crew)).toBe(true)
      expect(credits.cast.length > 0).toBe(true)
      expect(credits.crew.length > 0).toBe(true)

      // Verify Brad Pitt is in the cast as Tyler Durden
      const bradPitt = credits.cast.find((c) => c.name === 'Brad Pitt')
      expect(bradPitt).toBeDefined()
      expect(bradPitt?.character).toBe('Tyler Durden')

      // Verify Edward Norton is in the cast as Narrator
      const edwardNorton = credits.cast.find((c) => c.name === 'Edward Norton')
      expect(edwardNorton).toBeDefined()
      expect(edwardNorton?.character).toBe('Narrator')

      // Verify David Fincher is in the crew as Director
      const davidFincher = credits.crew.find((c) => c.name === 'David Fincher' && c.job === 'Director')
      expect(davidFincher).toBeDefined()
      expect(davidFincher?.department).toBe('Directing')
    }).pipe(
      Effect.provide(Movie.Default),
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
      const movie = yield* Movie

      const videos = yield* movie.getVideos({ id: FIGHT_CLUB_ID })

      // Verify we got valid videos data
      expect(videos.id).toBe(FIGHT_CLUB_ID)
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
      Effect.provide(Movie.Default),
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
      const movie = yield* Movie

      const images = yield* movie.getImages({ id: FIGHT_CLUB_ID })

      // Verify we got valid images data
      expect(images.id).toBe(FIGHT_CLUB_ID)
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
      Effect.provide(Movie.Default),
      Effect.provide(MovieDbClient.Default),
      Effect.provide(RateLimiterLive),
      Effect.provide(NodeHttpClient.layerUndici),
      Effect.provide(makeTestConfig({ apiKey: REAL_API_KEY! })),
      Effect.scoped,
    )

    return Effect.runPromise(program)
  })

  it.skipIf(!REAL_API_KEY)('getNowPlaying returns paginated results', () => {
    const program = Effect.gen(function* () {
      const movie = yield* Movie

      const nowPlaying = yield* movie.getNowPlaying({ page: 1 })

      // Verify pagination structure
      expect(typeof nowPlaying.page).toBe('number')
      expect(typeof nowPlaying.totalPages).toBe('number')
      expect(typeof nowPlaying.totalResults).toBe('number')
      expect(Array.isArray(nowPlaying.results)).toBe(true)
      expect(nowPlaying.results.length > 0).toBe(true)

      // Verify movie structure
      const firstMovie = nowPlaying.results[0]
      expect(typeof firstMovie.id).toBe('number')
      expect(typeof firstMovie.title).toBe('string')
      expect(typeof firstMovie.overview).toBe('string')
    }).pipe(
      Effect.provide(Movie.Default),
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
      const movie = yield* Movie

      const popular = yield* movie.getPopular({ page: 1 })

      // Verify pagination structure
      expect(typeof popular.page).toBe('number')
      expect(typeof popular.totalPages).toBe('number')
      expect(typeof popular.totalResults).toBe('number')
      expect(Array.isArray(popular.results)).toBe(true)
      expect(popular.results.length > 0).toBe(true)
    }).pipe(
      Effect.provide(Movie.Default),
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
      const movie = yield* Movie

      const topRated = yield* movie.getTopRated({ page: 1 })

      // Verify pagination structure
      expect(typeof topRated.page).toBe('number')
      expect(typeof topRated.totalPages).toBe('number')
      expect(typeof topRated.totalResults).toBe('number')
      expect(Array.isArray(topRated.results)).toBe(true)
      expect(topRated.results.length > 0).toBe(true)
    }).pipe(
      Effect.provide(Movie.Default),
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
      const movie = yield* Movie

      // Verify service methods exist
      expect(typeof movie.getDetails).toBe('function')
      expect(typeof movie.getCredits).toBe('function')
      expect(typeof movie.getVideos).toBe('function')
      expect(typeof movie.getImages).toBe('function')
      expect(typeof movie.getNowPlaying).toBe('function')
      expect(typeof movie.getPopular).toBe('function')
      expect(typeof movie.getTopRated).toBe('function')
    }).pipe(
      Effect.provide(Movie.Default),
      Effect.provide(MovieDbClient.Default),
      Effect.provide(MockRateLimiter),
      Effect.provide(NodeHttpClient.layerUndici),
      Effect.provide(makeTestConfig()),
    ),
  )
})
