# @movie-effect/letterboxd-cli

CLI tool for querying the [Letterboxd API][letterboxd-api] from the command
line.

## Installation

```bash
npm install -g @movie-effect/letterboxd-cli
# or run directly with npx
npx @movie-effect/letterboxd-cli
```

## Setup

Set your Letterboxd API credentials:

```bash
export LETTERBOXD_API_KEY=your-api-key
export LETTERBOXD_API_SECRET=your-api-secret
```

## Usage

```bash
# Search for films
letterboxd search "Parasite"

# Get film details
letterboxd film abc123

# Get user profile
letterboxd user johndoe
```

## Commands

| Command           | Description      |
| ----------------- | ---------------- |
| `search <query>`  | Search for films |
| `film <id>`       | Get film details |
| `user <username>` | Get user profile |

## Related Packages

- [@movie-effect/letterboxd][sdk] - The underlying SDK

## License

[MIT][license]

[letterboxd-api]: https://api-docs.letterboxd.com/
[sdk]: https://www.npmjs.com/package/@movie-effect/letterboxd
[license]:
  https://github.com/kevinmichaelchen/moviedb-effect/blob/main/LICENSE.md
