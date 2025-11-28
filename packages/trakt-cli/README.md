# @movie-effect/trakt-cli

CLI tool for querying the [Trakt API][trakt-api] from the command line.

## Installation

```bash
npm install -g @movie-effect/trakt-cli
# or run directly with npx
npx @movie-effect/trakt-cli
```

## Setup

Set your Trakt client ID:

```bash
export TRAKT_CLIENT_ID=your-client-id
```

## Usage

```bash
# Get trending movies
trakt movies trending

# Get popular TV shows
trakt shows popular

# Search for content
trakt search "Breaking Bad"
```

## Commands

| Command           | Description               |
| ----------------- | ------------------------- |
| `movies trending` | Get trending movies       |
| `movies popular`  | Get popular movies        |
| `shows trending`  | Get trending TV shows     |
| `shows popular`   | Get popular TV shows      |
| `search <query>`  | Search across all content |

## Related Packages

- [@movie-effect/trakt][sdk] - The underlying SDK

## License

[MIT][license]

[trakt-api]: https://trakt.docs.apiary.io/
[sdk]: https://www.npmjs.com/package/@movie-effect/trakt
[license]:
  https://github.com/kevinmichaelchen/moviedb-effect/blob/main/LICENSE.md
