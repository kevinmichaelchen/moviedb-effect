# @movie-effect/watchmode

[![npm version][npm-badge]][npm-url]
[![License: MIT][license-badge]][license-url]

An [Effect][effect]-based client for the [Watchmode API][watchmode-api].

## Installation

```bash
npm install @movie-effect/watchmode effect @effect/platform @effect/platform-node
# or
pnpm add @movie-effect/watchmode effect @effect/platform @effect/platform-node
```

## Features

- Full TypeScript support with Effect
- Type-safe API responses with Schema validation
- Built-in rate limiting
- Streaming availability data
- Observability with Effect tracing

## Authentication

This library requires a Watchmode API key.

1. Create an account at [api.watchmode.com](https://api.watchmode.com/)
2. Subscribe to a plan (free tier available with limited requests)
3. Copy your API key from the dashboard

For local development, set the `WATCHMODE_API_KEY` environment variable:

```bash
export WATCHMODE_API_KEY="your-api-key"
```

## Quick Start

```typescript
import { NodeHttpClient } from '@effect/platform-node'
import { WatchmodeClient, WatchmodeConfig } from '@movie-effect/watchmode'
import { Console, Effect } from 'effect'

const program = Effect.gen(function*() {
  const client = yield* WatchmodeClient
  const sources = yield* client.getSources()
  yield* Console.log(sources)
})

const runnable = program.pipe(
  Effect.provide(WatchmodeClient.Default),
  Effect.provide(WatchmodeConfig.layer({ apiKey: 'your-api-key' })),
  Effect.provide(NodeHttpClient.layer),
)

Effect.runPromise(runnable)
```

## API Coverage

- Streaming sources and availability
- Title search and details
- Release information

## Related Packages

- [@movie-effect/watchmode-cli][cli] - CLI for Watchmode
- [@movie-effect/core][core] - Shared utilities

## License

[MIT][license-url]

[npm-badge]: https://img.shields.io/npm/v/@movie-effect/watchmode.svg
[npm-url]: https://www.npmjs.com/package/@movie-effect/watchmode
[license-badge]: https://img.shields.io/badge/License-MIT-yellow.svg
[license-url]: https://github.com/kevinmichaelchen/movie-effect/blob/main/LICENSE.md
[effect]: https://effect.website/
[watchmode-api]: https://api.watchmode.com/
[cli]: https://github.com/kevinmichaelchen/movie-effect/tree/main/packages/watchmode-cli
[core]: https://www.npmjs.com/package/@movie-effect/core
