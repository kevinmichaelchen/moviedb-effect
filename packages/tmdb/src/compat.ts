/**
 * Backward compatibility layer for Effect services
 *
 * Provides a Promise-based API that wraps the Effect services,
 * maintaining compatibility with the original MovieDb class API.
 */

import { NodeHttpClient } from '@effect/platform-node'
import { Effect, Layer } from 'effect'
import { TmdbClient } from './client.ts'
import { TmdbConfig, type TmdbConfigOptions } from './config.ts'
import {
  Movie,
  type MovieCredits,
  type MovieDetails,
  type MovieImages,
  type MovieListResponse,
  type MovieVideos,
} from './movie.ts'
import {
  Person,
  type PersonCombinedCredits,
  type PersonDetails,
  type PersonImages,
  type PersonMovieCredits,
  type PersonPopularResponse,
  type PersonTvCredits,
} from './person.ts'
import { RateLimiterLive } from './rate-limiter.ts'
import {
  Search,
  type SearchMovieResponse,
  type SearchMultiResponse,
  type SearchPersonResponse,
  type SearchTvResponse,
} from './search.ts'
import { Tv, type TvCredits, type TvImages, type TvShowDetails, type TvShowListResponse, type TvVideos } from './tv.ts'

/**
 * Configuration options for TmdbCompat
 */
export interface TmdbCompatConfig {
  /** TMDb API key */
  readonly apiKey: string
  /** Base URL for TMDb API (defaults to v3) */
  readonly baseUrl?: string
  /** Requests per second limit (defaults to 50) */
  readonly requestsPerSecondLimit?: number
}

/**
 * Backward-compatible TMDB client
 *
 * Wraps Effect-based services with a Promise-based API that matches
 * the original MovieDb class interface.
 *
 * @example
 * ```ts
 * import { Console, Effect } from "effect"
 *
 * const program = Effect.gen(function* () {
 *   const tmdb = new TmdbCompat({ apiKey: "your-api-key" });
 *   const movie = yield* Effect.promise(() => tmdb.movieInfo(550));
 *   yield* Console.log(movie.title); // "Fight Club"
 * });
 * ```
 */
export class TmdbCompat {
  private appLayer: Layer.Layer<Movie | Tv | Search | Person, never, never>

  constructor(config: TmdbCompatConfig) {
    const fullConfig: TmdbConfigOptions = {
      apiKey: config.apiKey,
      baseUrl: config.baseUrl ?? 'https://api.themoviedb.org/3/',
      requestsPerSecond: config.requestsPerSecondLimit ?? 50,
    }

    const ConfigLayer = Layer.succeed(TmdbConfig, fullConfig)

    this.appLayer = Layer.mergeAll(Movie.Default, Tv.Default, Search.Default, Person.Default).pipe(
      Layer.provide(TmdbClient.Default),
      Layer.provide(RateLimiterLive),
      Layer.provide(NodeHttpClient.layerUndici),
      Layer.provide(ConfigLayer),
    )
  }

  /**
   * Helper to run an Effect program and return a Promise
   */
  private runEffect<A, E>(effect: Effect.Effect<A, E, Movie | Tv | Search | Person>): Promise<A> {
    return Effect.runPromise(effect.pipe(Effect.provide(this.appLayer), Effect.scoped))
  }

  /**
   * Helper to normalize params from string/number to object
   */
  private normalizeIdParams(params: string | number | { id: number; language?: string }): {
    id: number
    language?: string
  } {
    if (typeof params === 'string' || typeof params === 'number') {
      return { id: Number(params) }
    }
    return params
  }

  // ===== Movie Methods =====

  movieInfo(params: string | number | { id: number; language?: string }): Promise<MovieDetails> {
    const normalized = this.normalizeIdParams(params)
    return this.runEffect(
      Effect.gen(function*() {
        const movie = yield* Movie
        return yield* movie.getDetails(normalized)
      }),
    )
  }

  movieCredits(params: string | number | { id: number; language?: string }): Promise<MovieCredits> {
    const normalized = this.normalizeIdParams(params)
    return this.runEffect(
      Effect.gen(function*() {
        const movie = yield* Movie
        return yield* movie.getCredits(normalized)
      }),
    )
  }

  movieVideos(params: string | number | { id: number; language?: string }): Promise<MovieVideos> {
    const normalized = this.normalizeIdParams(params)
    return this.runEffect(
      Effect.gen(function*() {
        const movie = yield* Movie
        return yield* movie.getVideos(normalized)
      }),
    )
  }

  movieImages(
    params: string | number | { id: number; language?: string; include_image_language?: string },
  ): Promise<MovieImages> {
    const normalized = this.normalizeIdParams(params)
    return this.runEffect(
      Effect.gen(function*() {
        const movie = yield* Movie
        return yield* movie.getImages(normalized)
      }),
    )
  }

  movieNowPlaying(params?: { language?: string; page?: number; region?: string }): Promise<MovieListResponse> {
    return this.runEffect(
      Effect.gen(function*() {
        const movie = yield* Movie
        return yield* movie.getNowPlaying(params)
      }),
    )
  }

  moviePopular(params?: { language?: string; page?: number; region?: string }): Promise<MovieListResponse> {
    return this.runEffect(
      Effect.gen(function*() {
        const movie = yield* Movie
        return yield* movie.getPopular(params)
      }),
    )
  }

  movieTopRated(params?: { language?: string; page?: number; region?: string }): Promise<MovieListResponse> {
    return this.runEffect(
      Effect.gen(function*() {
        const movie = yield* Movie
        return yield* movie.getTopRated(params)
      }),
    )
  }

  // ===== TV Methods =====

  tvInfo(params: string | number | { id: number; language?: string }): Promise<TvShowDetails> {
    const normalized = this.normalizeIdParams(params)
    return this.runEffect(
      Effect.gen(function*() {
        const tv = yield* Tv
        return yield* tv.getDetails(normalized)
      }),
    )
  }

  tvCredits(params: string | number | { id: number; language?: string }): Promise<TvCredits> {
    const normalized = this.normalizeIdParams(params)
    return this.runEffect(
      Effect.gen(function*() {
        const tv = yield* Tv
        return yield* tv.getCredits(normalized)
      }),
    )
  }

  tvVideos(params: string | number | { id: number; language?: string }): Promise<TvVideos> {
    const normalized = this.normalizeIdParams(params)
    return this.runEffect(
      Effect.gen(function*() {
        const tv = yield* Tv
        return yield* tv.getVideos(normalized)
      }),
    )
  }

  tvImages(
    params: string | number | { id: number; language?: string; include_image_language?: string },
  ): Promise<TvImages> {
    const normalized = this.normalizeIdParams(params)
    return this.runEffect(
      Effect.gen(function*() {
        const tv = yield* Tv
        return yield* tv.getImages(normalized)
      }),
    )
  }

  tvAiringToday(params?: { language?: string; page?: number; timezone?: string }): Promise<TvShowListResponse> {
    return this.runEffect(
      Effect.gen(function*() {
        const tv = yield* Tv
        return yield* tv.getAiringToday(params)
      }),
    )
  }

  tvOnTheAir(params?: { language?: string; page?: number; timezone?: string }): Promise<TvShowListResponse> {
    return this.runEffect(
      Effect.gen(function*() {
        const tv = yield* Tv
        return yield* tv.getOnTheAir(params)
      }),
    )
  }

  tvPopular(params?: { language?: string; page?: number }): Promise<TvShowListResponse> {
    return this.runEffect(
      Effect.gen(function*() {
        const tv = yield* Tv
        return yield* tv.getPopular(params)
      }),
    )
  }

  tvTopRated(params?: { language?: string; page?: number }): Promise<TvShowListResponse> {
    return this.runEffect(
      Effect.gen(function*() {
        const tv = yield* Tv
        return yield* tv.getTopRated(params)
      }),
    )
  }

  // ===== Search Methods =====

  searchMovie(params: {
    query: string
    language?: string
    page?: number
    include_adult?: boolean
    region?: string
    year?: number
    primary_release_year?: number
  }): Promise<SearchMovieResponse> {
    return this.runEffect(
      Effect.gen(function*() {
        const search = yield* Search
        return yield* search.searchMovie(params)
      }),
    )
  }

  searchTv(params: {
    query: string
    language?: string
    page?: number
    include_adult?: boolean
    first_air_date_year?: number
  }): Promise<SearchTvResponse> {
    return this.runEffect(
      Effect.gen(function*() {
        const search = yield* Search
        return yield* search.searchTv(params)
      }),
    )
  }

  searchPerson(params: {
    query: string
    language?: string
    page?: number
    include_adult?: boolean
  }): Promise<SearchPersonResponse> {
    return this.runEffect(
      Effect.gen(function*() {
        const search = yield* Search
        return yield* search.searchPerson(params)
      }),
    )
  }

  searchMulti(params: {
    query: string
    language?: string
    page?: number
    include_adult?: boolean
  }): Promise<SearchMultiResponse> {
    return this.runEffect(
      Effect.gen(function*() {
        const search = yield* Search
        return yield* search.searchMulti(params)
      }),
    )
  }

  // ===== Person Methods =====

  personInfo(params: string | number | { id: number; language?: string }): Promise<PersonDetails> {
    const normalized = this.normalizeIdParams(params)
    return this.runEffect(
      Effect.gen(function*() {
        const person = yield* Person
        return yield* person.getDetails(normalized)
      }),
    )
  }

  personMovieCredits(params: string | number | { id: number; language?: string }): Promise<PersonMovieCredits> {
    const normalized = this.normalizeIdParams(params)
    return this.runEffect(
      Effect.gen(function*() {
        const person = yield* Person
        return yield* person.getMovieCredits(normalized)
      }),
    )
  }

  personTvCredits(params: string | number | { id: number; language?: string }): Promise<PersonTvCredits> {
    const normalized = this.normalizeIdParams(params)
    return this.runEffect(
      Effect.gen(function*() {
        const person = yield* Person
        return yield* person.getTvCredits(normalized)
      }),
    )
  }

  personCombinedCredits(params: string | number | { id: number; language?: string }): Promise<PersonCombinedCredits> {
    const normalized = this.normalizeIdParams(params)
    return this.runEffect(
      Effect.gen(function*() {
        const person = yield* Person
        return yield* person.getCombinedCredits(normalized)
      }),
    )
  }

  personImages(params: string | number | { id: number; language?: string }): Promise<PersonImages> {
    const normalized = this.normalizeIdParams(params)
    return this.runEffect(
      Effect.gen(function*() {
        const person = yield* Person
        return yield* person.getImages(normalized)
      }),
    )
  }

  personPopular(params?: { language?: string; page?: number }): Promise<PersonPopularResponse> {
    return this.runEffect(
      Effect.gen(function*() {
        const person = yield* Person
        return yield* person.getPopular(params)
      }),
    )
  }
}
