/**
 * Tests for Effect Schema validation and camelCase transformation
 *
 * Verifies that API responses are correctly validated and transformed.
 */

import { describe, it, expect } from '@effect/vitest'
import { Effect, Schema, ParseResult } from 'effect'
import { MovieDetails } from '../../src/effect/schemas/movie'
import { TvShowDetails } from '../../src/effect/schemas/tv'
import { PersonDetails } from '../../src/effect/schemas/person'

describe('Schema Validation', () => {
  it.effect('MovieDetails schema transforms snake_case to camelCase', () =>
    Effect.gen(function* () {
      const apiResponse = {
        id: 550,
        title: 'Fight Club',
        original_title: 'Fight Club',
        overview: 'An insomniac office worker...',
        poster_path: '/path/to/poster.jpg',
        backdrop_path: '/path/to/backdrop.jpg',
        release_date: '1999-10-15',
        runtime: 139,
        vote_average: 8.8,
        vote_count: 17_000,
        popularity: 25.5,
        budget: 63_000_000,
        revenue: 100_853_753,
        tagline: 'Mischief. Mayhem. Soap.',
        status: 'Released',
        genres: [
          { id: 28, name: 'Action' },
          { id: 18, name: 'Drama' },
        ],
      }

      const result = yield* Schema.decodeUnknown(MovieDetails)(apiResponse)

      expect(result.id).toBe(550)
      expect(result.title).toBe('Fight Club')
      expect(result.originalTitle).toBe('Fight Club')
      expect(result.posterPath).toBe('/path/to/poster.jpg')
      expect(result.backdropPath).toBe('/path/to/backdrop.jpg')
      expect(result.releaseDate).toBe('1999-10-15')
      expect(result.voteAverage).toBe(8.8)
      expect(result.voteCount).toBe(17_000)
    }),
  )

  it.effect('MovieDetails schema handles null nullable fields', () =>
    Effect.gen(function* () {
      const apiResponse = {
        id: 550,
        title: 'Fight Club',
        original_title: 'Fight Club',
        overview: '...',
        poster_path: null,
        backdrop_path: null,
        release_date: '1999-10-15',
        runtime: 139,
        vote_average: 8.8,
        vote_count: 17_000,
        popularity: 25.5,
        budget: 0,
        revenue: 0,
        tagline: null,
        status: 'Released',
        genres: [],
      }

      const result = yield* Schema.decodeUnknown(MovieDetails)(apiResponse)

      expect(result.posterPath).toBeNull()
      expect(result.backdropPath).toBeNull()
      expect(result.tagline).toBeNull()
    }),
  )

  it.effect('MovieDetails schema rejects missing required fields', () =>
    Effect.gen(function* () {
      const invalidResponse = {
        id: 550,
        title: 'Fight Club',
        overview: '...',
        poster_path: '/path.jpg',
        backdrop_path: '/path.jpg',
        release_date: '1999-10-15',
        runtime: 139,
        vote_average: 8.8,
        vote_count: 1000,
        popularity: 25.5,
        budget: 0,
        revenue: 0,
        tagline: '...',
        status: 'Released',
        genres: [],
      }

      const result = yield* Schema.decodeUnknown(MovieDetails)(invalidResponse).pipe(Effect.either)

      expect(result._tag).toBe('Left')
      if (result._tag === 'Left' && result.left instanceof ParseResult.ParseError) {
        expect(result.left._tag).toBe('ParseError')
      }
    }),
  )

  it.effect('MovieDetails schema validates genres array structure', () =>
    Effect.gen(function* () {
      const apiResponse = {
        id: 550,
        title: 'Fight Club',
        original_title: 'Fight Club',
        overview: '...',
        poster_path: '/path.jpg',
        backdrop_path: '/path.jpg',
        release_date: '1999-10-15',
        runtime: 139,
        vote_average: 8.8,
        vote_count: 1000,
        popularity: 25.5,
        budget: 0,
        revenue: 0,
        tagline: '...',
        status: 'Released',
        genres: [
          { id: 28, name: 'Action' },
          { id: 18, name: 'Drama' },
          { id: 53, name: 'Thriller' },
        ],
      }

      const result = yield* Schema.decodeUnknown(MovieDetails)(apiResponse)

      expect(result.genres.length).toBe(3)
      expect(result.genres[0].name).toBe('Action')
      expect(result.genres[1].name).toBe('Drama')
      expect(result.genres[2].name).toBe('Thriller')
    }),
  )

  it.effect('PersonDetails schema transforms snake_case fields', () =>
    Effect.gen(function* () {
      const apiResponse = {
        id: 287,
        name: 'Brad Pitt',
        profile_path: '/path/to/profile.jpg',
        biography: 'Born William Bradley Pitt...',
        place_of_birth: 'Springfield, Missouri, USA',
        birthday: '1963-12-18',
        deathday: null,
        also_known_as: ['B. Pitt', 'Bradley Pitt'],
        known_for_department: 'Acting',
        popularity: 35.5,
        gender: 2,
        adult: false,
        imdb_id: 'nm0000093',
      }

      const result = yield* Schema.decodeUnknown(PersonDetails)(apiResponse)

      expect(result.id).toBe(287)
      expect(result.name).toBe('Brad Pitt')
      expect(result.profilePath).toBe('/path/to/profile.jpg')
      expect(result.placeOfBirth).toBe('Springfield, Missouri, USA')
      expect(result.birthday).toBe('1963-12-18')
      expect(result.alsoKnownAs.length).toBe(2)
      expect(result.knownForDepartment).toBe('Acting')
    }),
  )

  it.effect('TvDetails schema transforms snake_case fields', () =>
    Effect.gen(function* () {
      const apiResponse = {
        id: 1396,
        name: 'Breaking Bad',
        original_name: 'Breaking Bad',
        overview: 'A high school chemistry teacher...',
        poster_path: '/path/to/poster.jpg',
        backdrop_path: '/path/to/backdrop.jpg',
        first_air_date: '2008-01-20',
        last_air_date: '2013-09-29',
        episode_run_time: [47, 48],
        vote_average: 9.5,
        vote_count: 13_000,
        popularity: 35.5,
        in_production: false,
        number_of_episodes: 62,
        number_of_seasons: 5,
        status: 'Ended',
        type: 'Scripted',
        tagline: 'Remember my name',
        genres: [
          { id: 18, name: 'Drama' },
          { id: 80, name: 'Crime' },
        ],
        networks: [
          {
            id: 20,
            name: 'AMC',
            logo_path: '/path/to/logo.png',
            origin_country: 'US',
          },
        ],
      }

      const result = yield* Schema.decodeUnknown(TvShowDetails)(apiResponse)

      expect(result.id).toBe(1396)
      expect(result.name).toBe('Breaking Bad')
      expect(result.originalName).toBe('Breaking Bad')
      expect(result.firstAirDate).toBe('2008-01-20')
      expect(result.lastAirDate).toBe('2013-09-29')
      expect(result.voteAverage).toBe(9.5)
      expect(result.numberOfEpisodes).toBe(62)
      expect(result.numberOfSeasons).toBe(5)
    }),
  )

  it.effect('Schema validation preserves data integrity', () =>
    Effect.gen(function* () {
      const apiResponse = {
        id: 550,
        title: 'Fight Club',
        original_title: 'Fight Club',
        overview: 'An insomniac office worker and a devil-may-care soapmaker...',
        poster_path: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PEIm.jpg',
        backdrop_path: '/fCayJrkfRaCGlxjTl1dLDG1nNZh.jpg',
        release_date: '1999-10-15',
        runtime: 139,
        vote_average: 8.8,
        vote_count: 17_431,
        popularity: 25.505,
        budget: 63_000_000,
        revenue: 100_853_753,
        tagline: 'Mischief. Mayhem. Soap.',
        status: 'Released',
        genres: [
          { id: 28, name: 'Action' },
          { id: 18, name: 'Drama' },
        ],
      }

      const decoded = yield* Schema.decodeUnknown(MovieDetails)(apiResponse)

      expect(decoded.id).toBe(apiResponse.id)
      expect(decoded.title).toBe(apiResponse.title)
      expect(decoded.runtime).toBe(apiResponse.runtime)
      expect(decoded.popularity).toBe(apiResponse.popularity)
      expect(decoded.budget).toBe(apiResponse.budget)
      expect(decoded.revenue).toBe(apiResponse.revenue)
    }),
  )

  it.effect('Schema validation rejects wrong types', () =>
    Effect.gen(function* () {
      const invalidResponse = {
        id: 'not-a-number',
        title: 'Fight Club',
        original_title: 'Fight Club',
        overview: '...',
        poster_path: '/path.jpg',
        backdrop_path: '/path.jpg',
        release_date: '1999-10-15',
        runtime: 139,
        vote_average: 8.8,
        vote_count: 1000,
        popularity: 25.5,
        budget: 0,
        revenue: 0,
        tagline: '...',
        status: 'Released',
        genres: [],
      }

      const result = yield* Schema.decodeUnknown(MovieDetails)(invalidResponse).pipe(Effect.either)

      expect(result._tag).toBe('Left')
    }),
  )
})
