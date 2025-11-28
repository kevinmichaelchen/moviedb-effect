# @movie-effect/trakt

[![npm version][npm-badge]][npm-url]
[![License: MIT][license-badge]][license-url]

An [Effect][effect]-based client for the [Trakt API][trakt-api].

## Installation

```bash
npm install @movie-effect/trakt effect @effect/platform @effect/platform-node
# or
pnpm add @movie-effect/trakt effect @effect/platform @effect/platform-node
```

## Features

- Full TypeScript support with Effect
- Type-safe API responses with Schema validation
- Built-in rate limiting
- OAuth2 authentication support
- Observability with Effect tracing

## Authentication

This library requires a Trakt API application.

1. Create an account at [trakt.tv](https://trakt.tv/join)
2. Go to [Your API Apps](https://trakt.tv/oauth/applications)
3. Create a new application
4. Copy the **Client ID** (required) and **Client Secret** (for OAuth flows)

For local development, set the environment variables:

```bash
export TRAKT_CLIENT_ID="your-client-id"
export TRAKT_CLIENT_SECRET="your-client-secret"  # Optional, for OAuth
```

**Rate Limits:**

- Client ID only: 10,000 requests per 5 minutes
- With OAuth: 1,000 requests per 5 minutes

## Quick Start

```typescript
import { NodeHttpClient } from "@effect/platform-node";
import { TraktClient, TraktConfig } from "@movie-effect/trakt";
import { Console, Effect } from "effect";

const program = Effect.gen(function* () {
  const client = yield* TraktClient;
  const trending = yield* client.movies.trending();
  yield* Console.log(trending);
});

const runnable = program.pipe(
  Effect.provide(TraktClient.Default),
  Effect.provide(TraktConfig.layer({ clientId: "your-client-id" })),
  Effect.provide(NodeHttpClient.layer),
);

Effect.runPromise(runnable);
```

## API Coverage

- Movies (trending, popular, details)
- TV Shows (trending, popular, details)
- User activity and history
- Lists and watchlists

## Related Packages

- [@movie-effect/trakt-cli][cli] - CLI for Trakt
- [@movie-effect/core][core] - Shared utilities

## License

[MIT][license-url]

[npm-badge]: https://img.shields.io/npm/v/@movie-effect/trakt.svg
[npm-url]: https://www.npmjs.com/package/@movie-effect/trakt
[license-badge]: https://img.shields.io/badge/License-MIT-yellow.svg
[license-url]:
  https://github.com/kevinmichaelchen/moviedb-effect/blob/main/LICENSE.md
[effect]: https://effect.website/
[trakt-api]: https://trakt.docs.apiary.io/
[cli]:
  https://github.com/kevinmichaelchen/moviedb-effect/tree/main/packages/trakt-cli
[core]: https://www.npmjs.com/package/@movie-effect/core
