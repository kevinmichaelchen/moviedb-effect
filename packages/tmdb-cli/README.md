# @movie-effect/tmdb-cli

CLI tool for querying [The Movie Database (TMDB)][tmdb-api] from the command
line.

## Installation

```bash
npm install -g @movie-effect/tmdb-cli
# or run directly with npx
npx @movie-effect/tmdb-cli
```

## Setup

Set your TMDB API key:

```bash
export TMDB_API_KEY=your-api-key
```

## Usage

```bash
# Search for movies
tmdb search movie "The Matrix"

# Get movie details
tmdb movie 603

# Search for TV shows
tmdb search tv "Breaking Bad"

# Get person details
tmdb person 17419
```

## Commands

| Command                 | Description         |
| ----------------------- | ------------------- |
| `search movie <query>`  | Search for movies   |
| `search tv <query>`     | Search for TV shows |
| `search person <query>` | Search for people   |
| `movie <id>`            | Get movie details   |
| `tv <id>`               | Get TV show details |
| `person <id>`           | Get person details  |

## Related Packages

- [@movie-effect/tmdb][sdk] - The underlying SDK

## License

[MIT][license]

[tmdb-api]: https://developer.themoviedb.org/
[sdk]: https://www.npmjs.com/package/@movie-effect/tmdb
[license]:
  https://github.com/kevinmichaelchen/moviedb-effect/blob/main/LICENSE.md
