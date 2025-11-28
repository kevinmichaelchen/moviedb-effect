# @movie-effect/tmdb

[![npm version][npm-badge]][npm-url]
[![License: MIT][license-badge]][license-url]

An [Effect][effect]-based client for [The Movie Database (TMDB) API][tmdb-api].

## Installation

```bash
npm install @movie-effect/tmdb effect @effect/platform @effect/platform-node
# or
pnpm add @movie-effect/tmdb effect @effect/platform @effect/platform-node
```

## Features

- Full TypeScript support with Effect
- Type-safe API responses with Schema validation
- Built-in rate limiting
- Streaming support for paginated results
- Observability with Effect tracing

## Authentication

This library requires a TMDB API Bearer token (v4 API).

1. Create a free account at [themoviedb.org](https://www.themoviedb.org/signup)
2. Go to [Settings > API](https://www.themoviedb.org/settings/api)
3. Request an API key (choose "Developer" for personal use)
4. Copy the **API Read Access Token** (Bearer token)

For local development, set the `TMDB_API_KEY` environment variable:

```bash
export TMDB_API_KEY="your-bearer-token"
```

## Quick Start

```typescript
import { NodeHttpClient } from "@effect/platform-node";
import { TmdbClient, TmdbConfig } from "@movie-effect/tmdb";
import { Console, Effect } from "effect";

const program = Effect.gen(function* () {
  const client = yield* TmdbClient;
  const movie = yield* client.movie.getDetails(550); // Fight Club
  yield* Console.log(movie.title);
});

const runnable = program.pipe(
  Effect.provide(TmdbClient.Default),
  Effect.provide(TmdbConfig.layer({ apiKey: "your-api-key" })),
  Effect.provide(NodeHttpClient.layer),
);

Effect.runPromise(runnable);
```

## API Coverage

- Movies (search, details, credits, recommendations)
- TV Shows (search, details, seasons, episodes)
- People (search, details, credits)
- Search (multi-search across all types)

## Related Packages

- [@movie-effect/tmdb-cli][cli] - CLI for TMDB
- [@movie-effect/core][core] - Shared utilities

## License

[MIT][license-url]

[npm-badge]: https://img.shields.io/npm/v/@movie-effect/tmdb.svg
[npm-url]: https://www.npmjs.com/package/@movie-effect/tmdb
[license-badge]: https://img.shields.io/badge/License-MIT-yellow.svg
[license-url]:
  https://github.com/kevinmichaelchen/moviedb-effect/blob/main/LICENSE.md
[effect]: https://effect.website/
[tmdb-api]: https://developer.themoviedb.org/
[cli]:
  https://github.com/kevinmichaelchen/moviedb-effect/tree/main/packages/tmdb-cli
[core]: https://www.npmjs.com/package/@movie-effect/core
