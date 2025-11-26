/**
 * Tests for backward compatibility layer
 */

import { expect, it } from '@effect/vitest'
import { MovieDbCompat } from '../../src/effect/compat.ts'

const REAL_API_KEY = process.env.MOVIEDB_API_KEY

// Test IDs
const FIGHT_CLUB_ID = 550
const BREAKING_BAD_ID = 1396
const BRAD_PITT_ID = 287

it.skipIf(!REAL_API_KEY)('Compat - movieInfo accepts number ID', async () => {
  const movieDb = new MovieDbCompat({ apiKey: REAL_API_KEY! })

  const movie = await movieDb.movieInfo(FIGHT_CLUB_ID)

  // Verify Fight Club metadata
  expect(movie.id).toBe(FIGHT_CLUB_ID)
  expect(movie.title).toBe('Fight Club')
  expect(movie.releaseDate).toBe('1999-10-15')
})

it.skipIf(!REAL_API_KEY)('Compat - movieInfo accepts string ID', async () => {
  const movieDb = new MovieDbCompat({ apiKey: REAL_API_KEY! })

  const movie = await movieDb.movieInfo(String(FIGHT_CLUB_ID))

  // Verify Fight Club metadata
  expect(movie.id).toBe(FIGHT_CLUB_ID)
  expect(movie.title).toBe('Fight Club')
})

it.skipIf(!REAL_API_KEY)('Compat - movieInfo accepts object params', async () => {
  const movieDb = new MovieDbCompat({ apiKey: REAL_API_KEY! })

  const movie = await movieDb.movieInfo({ id: FIGHT_CLUB_ID })

  // Verify Fight Club metadata
  expect(movie.id).toBe(FIGHT_CLUB_ID)
  expect(movie.title).toBe('Fight Club')
})

it.skipIf(!REAL_API_KEY)('Compat - movieCredits returns cast and crew', async () => {
  const movieDb = new MovieDbCompat({ apiKey: REAL_API_KEY! })

  const credits = await movieDb.movieCredits(FIGHT_CLUB_ID)

  // Verify Brad Pitt is in the cast
  const bradPitt = credits.cast.find((c) => c.name === 'Brad Pitt')
  expect(bradPitt?.character).toBe('Tyler Durden')
})

it.skipIf(!REAL_API_KEY)('Compat - moviePopular returns paginated results', async () => {
  const movieDb = new MovieDbCompat({ apiKey: REAL_API_KEY! })

  const popular = await movieDb.moviePopular({ page: 1 })

  // Verify pagination structure
  expect(typeof popular.page).toBe('number')
  expect(typeof popular.totalPages).toBe('number')
  expect(Array.isArray(popular.results)).toBe(true)
  expect(popular.results.length > 0).toBe(true)
})

it.skipIf(!REAL_API_KEY)('Compat - tvInfo accepts number ID', async () => {
  const movieDb = new MovieDbCompat({ apiKey: REAL_API_KEY! })

  const tv = await movieDb.tvInfo(BREAKING_BAD_ID)

  // Verify Breaking Bad metadata
  expect(tv.id).toBe(BREAKING_BAD_ID)
  expect(tv.name).toBe('Breaking Bad')
  expect(tv.numberOfSeasons).toBe(5)
})

it.skipIf(!REAL_API_KEY)('Compat - tvCredits returns cast and crew', async () => {
  const movieDb = new MovieDbCompat({ apiKey: REAL_API_KEY! })

  const credits = await movieDb.tvCredits(BREAKING_BAD_ID)

  // Verify Bryan Cranston is in the cast
  const bryanCranston = credits.cast.find((c) => c.name === 'Bryan Cranston')
  expect(bryanCranston?.character).toBe('Walter White')
})

it.skipIf(!REAL_API_KEY)('Compat - tvPopular returns paginated results', async () => {
  const movieDb = new MovieDbCompat({ apiKey: REAL_API_KEY! })

  const popular = await movieDb.tvPopular({ page: 1 })

  // Verify pagination structure
  expect(typeof popular.page).toBe('number')
  expect(typeof popular.totalPages).toBe('number')
  expect(Array.isArray(popular.results)).toBe(true)
  expect(popular.results.length > 0).toBe(true)
})

it.skipIf(!REAL_API_KEY)('Compat - searchMovie finds Fight Club', async () => {
  const movieDb = new MovieDbCompat({ apiKey: REAL_API_KEY! })

  const results = await movieDb.searchMovie({
    query: 'fight club',
    page: 1,
  })

  // Find Fight Club in results
  const fightClub = results.results.find((m) => m.title === 'Fight Club' && m.releaseDate === '1999-10-15')
  expect(fightClub !== undefined).toBe(true)
  expect(fightClub?.id).toBe(FIGHT_CLUB_ID)
})

it.skipIf(!REAL_API_KEY)('Compat - searchTv finds Breaking Bad', async () => {
  const movieDb = new MovieDbCompat({ apiKey: REAL_API_KEY! })

  const results = await movieDb.searchTv({
    query: 'breaking bad',
    page: 1,
  })

  // Find Breaking Bad in results
  const breakingBad = results.results.find((show) => show.name === 'Breaking Bad' && show.firstAirDate === '2008-01-20')
  expect(breakingBad !== undefined).toBe(true)
  expect(breakingBad?.id).toBe(BREAKING_BAD_ID)
})

it.skipIf(!REAL_API_KEY)('Compat - searchPerson finds Brad Pitt', async () => {
  const movieDb = new MovieDbCompat({ apiKey: REAL_API_KEY! })

  const results = await movieDb.searchPerson({
    query: 'brad pitt',
    page: 1,
  })

  // Find Brad Pitt in results
  const bradPitt = results.results.find((person) => person.name === 'Brad Pitt')
  expect(bradPitt !== undefined).toBe(true)
  expect(bradPitt?.id).toBe(BRAD_PITT_ID)
})

it.skipIf(!REAL_API_KEY)('Compat - personInfo accepts number ID', async () => {
  const movieDb = new MovieDbCompat({ apiKey: REAL_API_KEY! })

  const person = await movieDb.personInfo(BRAD_PITT_ID)

  // Verify Brad Pitt metadata
  expect(person.id).toBe(BRAD_PITT_ID)
  expect(person.name).toBe('Brad Pitt')
  expect(person.birthday).toBe('1963-12-18')
})

it.skipIf(!REAL_API_KEY)('Compat - personMovieCredits returns cast and crew', async () => {
  const movieDb = new MovieDbCompat({ apiKey: REAL_API_KEY! })

  const credits = await movieDb.personMovieCredits(BRAD_PITT_ID)

  // Verify Fight Club is in the cast
  const fightClub = credits.cast.find((c) => c.title === 'Fight Club' && c.character === 'Tyler Durden')
  expect(fightClub !== undefined).toBe(true)
  expect(fightClub?.id).toBe(FIGHT_CLUB_ID)
})

it.skipIf(!REAL_API_KEY)('Compat - personPopular returns paginated results', async () => {
  const movieDb = new MovieDbCompat({ apiKey: REAL_API_KEY! })

  const popular = await movieDb.personPopular({ page: 1 })

  // Verify pagination structure
  expect(typeof popular.page).toBe('number')
  expect(typeof popular.totalPages).toBe('number')
  expect(Array.isArray(popular.results)).toBe(true)
  expect(popular.results.length > 0).toBe(true)
})

it.skipIf(!REAL_API_KEY)('Compat - constructor accepts custom baseUrl', async () => {
  const movieDb = new MovieDbCompat({
    apiKey: REAL_API_KEY!,
    baseUrl: 'https://api.themoviedb.org/3/',
    requestsPerSecondLimit: 50,
  })

  const movie = await movieDb.movieInfo(FIGHT_CLUB_ID)
  expect(movie.id).toBe(FIGHT_CLUB_ID)
})

it.skipIf(!REAL_API_KEY)('Compat - multiple instances can coexist', async () => {
  const movieDb1 = new MovieDbCompat({ apiKey: REAL_API_KEY! })
  const movieDb2 = new MovieDbCompat({ apiKey: REAL_API_KEY! })

  const [movie1, movie2] = await Promise.all([movieDb1.movieInfo(FIGHT_CLUB_ID), movieDb2.tvInfo(BREAKING_BAD_ID)])

  expect(movie1.id).toBe(FIGHT_CLUB_ID)
  expect(movie2.id).toBe(BREAKING_BAD_ID)
})
