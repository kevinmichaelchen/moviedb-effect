# @movie-effect/core

Shared utilities and types for movie API Effect SDKs.

## Installation

```bash
npm install @movie-effect/core
# or
pnpm add @movie-effect/core
```

## Overview

This package provides common utilities used across the movie-effect SDK
packages:

- Shared error types
- Common HTTP client utilities
- Rate limiting helpers
- Type definitions

## Usage

This package is primarily used internally by other `@movie-effect/*` packages.
You typically won't need to install it directly unless you're building custom
integrations.

```typescript
import { ... } from '@movie-effect/core'
```

## Related Packages

- [@movie-effect/tmdb][tmdb] - TMDB API client
- [@movie-effect/omdb][omdb] - OMDB API client
- [@movie-effect/trakt][trakt] - Trakt API client
- [@movie-effect/watchmode][watchmode] - Watchmode API client
- [@movie-effect/letterboxd][letterboxd] - Letterboxd API client

## License

[MIT][license]

[tmdb]: https://www.npmjs.com/package/@movie-effect/tmdb
[omdb]: https://www.npmjs.com/package/@movie-effect/omdb
[trakt]: https://www.npmjs.com/package/@movie-effect/trakt
[watchmode]: https://www.npmjs.com/package/@movie-effect/watchmode
[letterboxd]: https://www.npmjs.com/package/@movie-effect/letterboxd
[license]:
  https://github.com/kevinmichaelchen/moviedb-effect/blob/main/LICENSE.md
