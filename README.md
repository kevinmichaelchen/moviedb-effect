# moviedb-effect

[![npm](https://img.shields.io/npm/dw/moviedb-effect.svg?style=for-the-badge)](https://www.npmjs.com/package/moviedb-effect)

A modern, type-safe TypeScript client for [The Movie Database (TMDb) API][tmdb], built with [Effect].

[Effect]: https://effect.website/
[tmdb]: https://www.themoviedb.org/

## Why moviedb-effect?

**✨ Built for modern TypeScript applications**

- 🎯 **Fully type-safe** - End-to-end type safety with Effect Schema
- 🔄 **Automatic retry** - Resilient API calls with smart retry logic
- 🚦 **Built-in rate limiting** - Stay within API limits automatically
- 📊 **Streaming pagination** - Memory-efficient data processing with backpressure
- 🔍 **Observability** - Built-in logging, tracing, and metrics
- 🧪 **Easy to test** - Dependency injection makes testing simple
- 🛡️ **Structured error handling** - Type-safe error channels
- 🐪 **CamelCase transforms** - Automatic snake_case → camelCase conversion

## Quick Start

### Installation

```bash
npm install moviedb-effect effect @effect/platform @effect/platform-node
```

Requires `effect@^3.19` and `@effect/platform@^0.93`.

### With Effect

```typescript
import { NodeHttpClient } from '@effect/platform-node'
import { Effect, Layer } from 'effect'
import { Movie, MovieDbClient, MovieDbConfig, RateLimiterLive } from 'moviedb-effect'

const ConfigLive = Layer.succeed(MovieDbConfig, {
  apiKey: 'your-api-key',
  baseUrl: 'https://api.themoviedb.org/3',
})

const program = Effect.gen(function* () {
  const movie = yield* Movie
  const details = yield* movie.getDetails({ id: 550 })

  yield* Effect.log(`${details.title} (${details.releaseDate})`)
  // => Fight Club (1999-10-15)
})

const main = program.pipe(
  Effect.provide(Movie.Default),
  Effect.provide(MovieDbClient.Default),
  Effect.provide(RateLimiterLive),
  Effect.provide(NodeHttpClient.layerUndici),
  Effect.provide(ConfigLive),
  Effect.scoped,
)

await Effect.runPromise(main)
```

### Without Effect (Promise API)

Not using Effect? Use the `MovieDbCompat` class for a simple Promise-based API:

```typescript
import { MovieDbCompat } from 'moviedb-effect'

const client = new MovieDbCompat({ apiKey: 'your-api-key' })

const movie = await client.movieInfo(550)
console.log(movie.title) // "Fight Club"

const results = await client.searchMovie({ query: 'inception' })
```

## Services

Four services cover the TMDb API: `Movie`, `Tv`, `Search`, and `Person`.

```typescript
const program = Effect.gen(function* () {
  const movie = yield* Movie
  const tv = yield* Tv
  const search = yield* Search
  const person = yield* Person

  // Movies: details, credits, videos, images
  const fightClub = yield* movie.getDetails({ id: 550 })
  const credits = yield* movie.getCredits({ id: 550 })

  // TV: same pattern
  const breakingBad = yield* tv.getDetails({ id: 1396 })

  // Search: movies, TV, people, or everything
  const results = yield* search.searchMovie({ query: 'inception' })
  const all = yield* search.searchMulti({ query: 'nolan' })

  // People: details and filmography
  const bradPitt = yield* person.getDetails({ id: 287 })
  const filmography = yield* person.getCombinedCredits({ id: 287 })
})
```

All methods are fully typed - explore available methods via autocomplete.

## Advanced Features

### Streaming Pagination

Efficiently process large datasets with automatic pagination and backpressure:

```typescript
const program = Effect.gen(function* () {
  const movie = yield* Movie

  // Get first 100 popular movies
  const movies = yield* movie.streamPopular({}, { maxResults: 100 }).pipe(Stream.runCollect)

  // Process with controlled concurrency
  yield* movie.streamNowPlaying({}, { maxPages: 5 }).pipe(
    Stream.mapEffect((m) => processMovie(m), { concurrency: 10 }),
    Stream.runDrain,
  )

  // Lazy evaluation - stops fetching when found
  const found = yield* movie.streamTopRated().pipe(
    Stream.filter((m) => m.voteAverage > 9.0),
    Stream.take(1),
    Stream.runCollect,
  )
})
```

See [streaming-basic.ts](examples/effect/streaming-basic.ts) and
[streaming-advanced.ts](examples/effect/streaming-advanced.ts) for more examples.

### Error Handling

All errors are typed and can be handled exhaustively:

```typescript
const program = movie.getDetails({ id: 999999 }).pipe(
  Effect.catchTags({
    NotFoundError: () => Effect.succeed(null),
    AuthenticationError: () => Effect.fail('Invalid API key'),
    RateLimitError: () => Effect.fail('Rate limited'),
    NetworkError: () => Effect.fail('Network issue'),
  }),
)
```

Error types: `NotFoundError`, `AuthenticationError`, `RateLimitError`, `ValidationError`, `ServerError`, `NetworkError`.

### Built-in Resilience

- **Automatic retry** - Retries on network errors, rate limits (429), and server errors (5xx) with exponential backoff
- **Rate limiting** - Stays within TMDb's 40 req/s limit automatically
- **Observability** - Structured logs, distributed tracing spans, and metrics on every request

## Configuration

```typescript
import { Layer } from 'effect'
import { MovieDbConfig } from 'moviedb-effect'

const ConfigLive = Layer.succeed(MovieDbConfig, {
  apiKey: process.env.TMDB_API_KEY!,
  baseUrl: 'https://api.themoviedb.org/3',
})
```

Rate limiting is automatic with sensible defaults (40 req/s). See `MovieDbConfig` type for advanced options.

## Contributing

```bash
pnpm test        # Run tests
pnpm format      # Format code
```

## License

[MIT](LICENSE.md)

---

Get your free TMDb API key at https://www.themoviedb.org/settings/api
