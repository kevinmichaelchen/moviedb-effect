# @movie-effect/omdb-cli

CLI tool for querying the [OMDb API][omdb-api] from the command line.

## Installation

```bash
npm install -g @movie-effect/omdb-cli
# or run directly with npx
npx @movie-effect/omdb-cli
```

## Setup

Set your OMDb API key:

```bash
export OMDB_API_KEY=your-api-key
```

## Usage

```bash
# Search by title
omdb search "Inception"

# Get by IMDb ID
omdb get tt1375666

# Get by title with year
omdb title "The Dark Knight" --year 2008
```

## Commands

| Command          | Description              |
| ---------------- | ------------------------ |
| `search <query>` | Search for movies/series |
| `get <imdbId>`   | Get by IMDb ID           |
| `title <title>`  | Get by exact title       |

## Related Packages

- [@movie-effect/omdb][sdk] - The underlying SDK

## License

[MIT][license]

[omdb-api]: https://www.omdbapi.com/
[sdk]: https://www.npmjs.com/package/@movie-effect/omdb
[license]: https://github.com/kevinmichaelchen/movie-effect/blob/main/LICENSE.md
