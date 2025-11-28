#!/usr/bin/env node
import { Args, Command } from '@effect/cli'
import { NodeContext, NodeRuntime } from '@effect/platform-node'
import { NodeHttpClient } from '@effect/platform-node'
import { Movie, Person, RateLimiterLive, Search, TmdbClient, TmdbConfig, Tv } from '@movie-effect/tmdb'
import * as dotenv from 'dotenv'
import { Config, ConfigProvider, Console, Effect, Layer } from 'effect'
import * as fs from 'node:fs'

// === Load .env and create ConfigProvider ===
const loadDotEnv = (): Map<string, string> => {
  const envMap = new Map<string, string>()

  // Try to load .env file
  const envPath = '.env'
  if (fs.existsSync(envPath)) {
    const parsed = dotenv.parse(fs.readFileSync(envPath))
    for (const [key, value] of Object.entries(parsed)) {
      envMap.set(key, value)
    }
  }

  return envMap
}

// Create a ConfigProvider that reads from .env file first, then falls back to environment
const dotEnvProvider = ConfigProvider.fromMap(loadDotEnv())
const envProvider = ConfigProvider.fromEnv()
const configProvider = ConfigProvider.orElse(dotEnvProvider, () => envProvider)

// === Layer Setup ===
const ConfigLayer = Layer.effect(
  TmdbConfig,
  Effect.gen(function*() {
    const apiKey = yield* Config.string('TMDB_API_KEY')
    return {
      apiKey,
      baseUrl: 'https://api.themoviedb.org/3/',
      requestsPerSecond: 50,
    }
  }),
)

const AppLayer = Layer.mergeAll(Movie.Default, Person.Default, Search.Default, Tv.Default).pipe(
  Layer.provide(TmdbClient.Default),
  Layer.provide(RateLimiterLive),
  Layer.provide(NodeHttpClient.layerUndici),
  Layer.provide(ConfigLayer),
)

// === Commands ===

// tmdb search <query>
const searchQuery = Args.text({ name: 'query' })
const searchCommand = Command.make('search', { query: searchQuery }, ({ query }) =>
  Effect.gen(function*() {
    const search = yield* Search
    const results = yield* search.searchMulti({ query })
    yield* Console.log(`Found ${results.totalResults} results for "${query}":\n`)
    for (const result of results.results.slice(0, 10)) {
      if (result.mediaType === 'movie') {
        yield* Console.log(`[Movie] ${result.title} (${result.releaseDate?.slice(0, 4) ?? 'N/A'})`)
      } else if (result.mediaType === 'tv') {
        yield* Console.log(`[TV] ${result.name} (${result.firstAirDate?.slice(0, 4) ?? 'N/A'})`)
      } else if (result.mediaType === 'person') {
        yield* Console.log(`[Person] ${result.name}`)
      }
    }
  }).pipe(Effect.provide(AppLayer), Effect.scoped))

// tmdb movie <id>
const movieId = Args.integer({ name: 'id' })
const movieCommand = Command.make('movie', { id: movieId }, ({ id }) =>
  Effect.gen(function*() {
    const movie = yield* Movie
    const details = yield* movie.getDetails({ id })
    yield* Console.log(`Title: ${details.title}`)
    yield* Console.log(`Release Date: ${details.releaseDate ?? 'N/A'}`)
    yield* Console.log(`Runtime: ${details.runtime ?? 0} minutes`)
    yield* Console.log(`Rating: ${details.voteAverage?.toFixed(1) ?? 'N/A'}/10 (${details.voteCount ?? 0} votes)`)
    yield* Console.log(`Overview: ${details.overview ?? 'No overview available'}`)
    if (details.genres && details.genres.length > 0) {
      yield* Console.log(`Genres: ${details.genres.map((g) => g.name).join(', ')}`)
    }
  }).pipe(Effect.provide(AppLayer), Effect.scoped))

// tmdb person <id>
const personId = Args.integer({ name: 'id' })
const personCommand = Command.make('person', { id: personId }, ({ id }) =>
  Effect.gen(function*() {
    const person = yield* Person
    const details = yield* person.getDetails({ id })
    yield* Console.log(`Name: ${details.name}`)
    yield* Console.log(`Birthday: ${details.birthday ?? 'N/A'}`)
    yield* Console.log(`Place of Birth: ${details.placeOfBirth ?? 'N/A'}`)
    yield* Console.log(`Known For: ${details.knownForDepartment ?? 'N/A'}`)
    yield* Console.log(
      `Biography: ${details.biography?.slice(0, 300) ?? 'No biography available'}${
        (details.biography?.length ?? 0) > 300 ? '...' : ''
      }`,
    )
  }).pipe(Effect.provide(AppLayer), Effect.scoped))

// tmdb tv <id>
const tvId = Args.integer({ name: 'id' })
const tvCommand = Command.make('tv', { id: tvId }, ({ id }) =>
  Effect.gen(function*() {
    const tv = yield* Tv
    const details = yield* tv.getDetails({ id })
    yield* Console.log(`Title: ${details.name}`)
    yield* Console.log(`First Air Date: ${details.firstAirDate ?? 'N/A'}`)
    yield* Console.log(`Seasons: ${details.numberOfSeasons ?? 0}`)
    yield* Console.log(`Episodes: ${details.numberOfEpisodes ?? 0}`)
    yield* Console.log(`Rating: ${details.voteAverage?.toFixed(1) ?? 'N/A'}/10 (${details.voteCount ?? 0} votes)`)
    yield* Console.log(`Overview: ${details.overview ?? 'No overview available'}`)
    if (details.genres && details.genres.length > 0) {
      yield* Console.log(`Genres: ${details.genres.map((g) => g.name).join(', ')}`)
    }
  }).pipe(Effect.provide(AppLayer), Effect.scoped))

// Main tmdb command
const tmdb = Command.make('tmdb', {}, () => Console.log('TMDB CLI - Use --help for available commands'))

// Combine all commands
const command = tmdb.pipe(Command.withSubcommands([searchCommand, movieCommand, personCommand, tvCommand]))

// Initialize and run the CLI
const cli = Command.run(command, {
  name: 'TMDB CLI',
  version: 'v0.1.0',
})

// Run with custom ConfigProvider that loads from .env
cli(process.argv).pipe(
  Effect.withConfigProvider(configProvider),
  Effect.provide(NodeContext.layer),
  NodeRuntime.runMain,
)
