# @movie-effect/letterboxd

[![npm version][npm-badge]][npm-url]
[![License: MIT][license-badge]][license-url]

An [Effect][effect]-based client for the [Letterboxd API][letterboxd-api].

## Installation

```bash
npm install @movie-effect/letterboxd effect @effect/platform @effect/platform-node
# or
pnpm add @movie-effect/letterboxd effect @effect/platform @effect/platform-node
```

## Features

- Full TypeScript support with Effect
- Type-safe API responses with Schema validation
- Built-in rate limiting
- OAuth2 authentication support
- Observability with Effect tracing

## Authentication

This library requires approved Letterboxd API access.

> **Note:** The Letterboxd API is currently in private beta. Access requires approval.

1. Apply for API access at [letterboxd.com/api-beta/](https://letterboxd.com/api-beta/)
2. Wait for approval (may take some time)
3. Once approved, you'll receive an **API Key** and **API Secret**

For local development, set the environment variables:

```bash
export LETTERBOXD_API_KEY="your-api-key"
export LETTERBOXD_API_SECRET="your-api-secret"
```

## Quick Start

```typescript
import { NodeHttpClient } from "@effect/platform-node";
import { LetterboxdClient, LetterboxdConfig } from "@movie-effect/letterboxd";
import { Console, Effect } from "effect";

const program = Effect.gen(function* () {
  const client = yield* LetterboxdClient;
  const films = yield* client.films.search("Parasite");
  yield* Console.log(films);
});

const runnable = program.pipe(
  Effect.provide(LetterboxdClient.Default),
  Effect.provide(LetterboxdConfig.layer({ apiKey: "your-api-key" })),
  Effect.provide(NodeHttpClient.layer),
);

Effect.runPromise(runnable);
```

## API Coverage

- Film search and details
- User profiles and activity
- Lists and reviews

## Related Packages

- [@movie-effect/letterboxd-cli][cli] - CLI for Letterboxd
- [@movie-effect/core][core] - Shared utilities

## License

[MIT][license-url]

[npm-badge]: https://img.shields.io/npm/v/@movie-effect/letterboxd.svg
[npm-url]: https://www.npmjs.com/package/@movie-effect/letterboxd
[license-badge]: https://img.shields.io/badge/License-MIT-yellow.svg
[license-url]:
  https://github.com/kevinmichaelchen/moviedb-effect/blob/main/LICENSE.md
[effect]: https://effect.website/
[letterboxd-api]: https://api-docs.letterboxd.com/
[cli]:
  https://github.com/kevinmichaelchen/moviedb-effect/tree/main/packages/letterboxd-cli
[core]: https://www.npmjs.com/package/@movie-effect/core
