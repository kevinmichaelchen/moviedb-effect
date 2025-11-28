# @movie-effect/watchmode-cli

CLI tool for querying the [Watchmode API][watchmode-api] from the command line.

## Installation

```bash
npm install -g @movie-effect/watchmode-cli
# or run directly with npx
npx @movie-effect/watchmode-cli
```

## Setup

Set your Watchmode API key:

```bash
export WATCHMODE_API_KEY=your-api-key
```

## Usage

```bash
# List streaming sources
watchmode sources

# Search for titles
watchmode search "Stranger Things"

# Get title availability
watchmode title 1234
```

## Commands

| Command          | Description                      |
| ---------------- | -------------------------------- |
| `sources`        | List available streaming sources |
| `search <query>` | Search for titles                |
| `title <id>`     | Get title streaming availability |

## Related Packages

- [@movie-effect/watchmode][sdk] - The underlying SDK

## License

[MIT][license]

[watchmode-api]: https://api.watchmode.com/
[sdk]: https://www.npmjs.com/package/@movie-effect/watchmode
[license]:
  https://github.com/kevinmichaelchen/moviedb-effect/blob/main/LICENSE.md
