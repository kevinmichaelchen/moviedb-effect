# @moviedb-effect/cli

A CLI for interacting with [The Movie Database (TMDb)](https://www.themoviedb.org/) API, built with
[Effect](https://effect.website/) and the `moviedb-effect` SDK.

## Setup

Create a `.env` file in the repository root with your TMDb API key:

```
MOVIEDB_API_KEY=your_api_key_here
```

You can get an API key by creating an account at [themoviedb.org](https://www.themoviedb.org/settings/api).

## Usage

### Movie Details

Get details about a movie by its TMDb ID:

```bash
pnpm nx dev @moviedb-effect/cli -- movie 603
```

Output:

```
Title: The Matrix
Release Date: 1999-03-30
Runtime: 136 minutes
Rating: 8.2/10 (25000 votes)
Overview: Set in the 22nd century, The Matrix tells the story of a computer hacker...
Genres: Action, Science Fiction
```

### TV Show Details

Get details about a TV show by its TMDb ID:

```bash
pnpm nx dev @moviedb-effect/cli -- tv 1399
```

Output:

```
Title: Game of Thrones
First Air Date: 2011-04-17
Seasons: 8
Episodes: 73
Rating: 8.5/10 (25811 votes)
Overview: Seven noble families fight for control of the mythical land of Westeros...
Genres: Sci-Fi & Fantasy, Drama, Action & Adventure
```

### Person Details

Get details about a person (actor, director, etc.) by their TMDb ID:

```bash
pnpm nx dev @moviedb-effect/cli -- person 287
```

Output:

```
Name: Brad Pitt
Birthday: 1963-12-18
Place of Birth: Shawnee, Oklahoma, USA
Known For: Acting
Biography: William Bradley Pitt (born December 18, 1963) is an American actor...
```

### Search

Search across movies, TV shows, and people:

```bash
pnpm nx dev @moviedb-effect/cli -- search "the matrix"
```

Output:

```
Found 74 results for "the matrix":

[Movie] The Matrix (1999)
[Movie] The Matrix Resurrections (2021)
[Movie] The Matrix Reloaded (2003)
[Movie] The Matrix Revolutions (2003)
[TV] The Matrix (2004)
[Person] Carrie-Anne Moss
...
```

### Help

View all available commands and options:

```bash
pnpm nx dev @moviedb-effect/cli -- --help
```

## Commands Reference

| Command            | Description                         |
| ------------------ | ----------------------------------- |
| `movie <id>`       | Get movie details by TMDb ID        |
| `tv <id>`          | Get TV show details by TMDb ID      |
| `person <id>`      | Get person details by TMDb ID       |
| `search "<query>"` | Search movies, TV shows, and people |
