# @movie-effect/omdb

[![npm version][npm-badge]][npm-url]
[![License: MIT][license-badge]][license-url]

An [Effect][effect]-based client for the [OMDb API][omdb-api].

## Installation

```bash
npm install @movie-effect/omdb effect @effect/platform @effect/platform-node
# or
pnpm add @movie-effect/omdb effect @effect/platform @effect/platform-node
```

## Features

- Full TypeScript support with Effect
- Type-safe API responses with Schema validation
- Built-in rate limiting
- Observability with Effect tracing

## Authentication

This library requires an OMDb API key.

1. Go to [omdbapi.com/apikey.aspx](http://www.omdbapi.com/apikey.aspx)
2. Choose a plan (free tier: 1,000 requests/day)
3. Enter your email and submit
4. Check your email and activate your API key

For local development, set the `OMDB_API_KEY` environment variable:

```bash
export OMDB_API_KEY="your-api-key"
```

The key should be appended as a URL param to all requests, e.g.,

```
http://www.omdbapi.com/?i=tt3896198&apikey=MY_API_KEY
```

## Quick Start

```typescript
import { NodeHttpClient } from "@effect/platform-node";
import { OmdbClient, OmdbConfig } from "@movie-effect/omdb";
import { Console, Effect } from "effect";

const program = Effect.gen(function* () {
  const client = yield* OmdbClient;
  const movie = yield* client.getByTitle("Inception");
  yield* Console.log(movie.Title, movie.Year);
});

const runnable = program.pipe(
  Effect.provide(OmdbClient.Default),
  Effect.provide(OmdbConfig.layer({ apiKey: "your-api-key" })),
  Effect.provide(NodeHttpClient.layer),
);

Effect.runPromise(runnable);
```

## API Coverage

- Search by title or IMDb ID
- Detailed movie/series information
- Season and episode details

## Related Packages

- [@movie-effect/omdb-cli][cli] - CLI for OMDb
- [@movie-effect/core][core] - Shared utilities

## License

[MIT][license-url]

[npm-badge]: https://img.shields.io/npm/v/@movie-effect/omdb.svg
[npm-url]: https://www.npmjs.com/package/@movie-effect/omdb
[license-badge]: https://img.shields.io/badge/License-MIT-yellow.svg
[license-url]:
  https://github.com/kevinmichaelchen/moviedb-effect/blob/main/LICENSE.md
[effect]: https://effect.website/
[omdb-api]: https://www.omdbapi.com/
[cli]:
  https://github.com/kevinmichaelchen/moviedb-effect/tree/main/packages/omdb-cli
[core]: https://www.npmjs.com/package/@movie-effect/core
