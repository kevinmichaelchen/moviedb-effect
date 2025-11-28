/**
 * Watchmode API response schemas
 *
 * Note: The API returns null for missing optional fields, so we use Schema.NullishOr
 */

import { Schema } from 'effect'

/**
 * Streaming source/service
 */
export class Source extends Schema.Class<Source>('Source')({
  id: Schema.Number,
  name: Schema.String,
  type: Schema.String,
  logo_100px: Schema.NullishOr(Schema.String),
  ios_appstore_url: Schema.NullishOr(Schema.String),
  android_playstore_url: Schema.NullishOr(Schema.String),
  android_scheme: Schema.NullishOr(Schema.String),
  ios_scheme: Schema.NullishOr(Schema.String),
  regions: Schema.NullishOr(Schema.Array(Schema.String)),
}) {}

/**
 * Title search result
 */
export class SearchResult extends Schema.Class<SearchResult>('SearchResult')({
  id: Schema.Number,
  name: Schema.String,
  type: Schema.String,
  year: Schema.NullishOr(Schema.Number),
  imdb_id: Schema.NullishOr(Schema.String),
  tmdb_id: Schema.NullishOr(Schema.Number),
  tmdb_type: Schema.NullishOr(Schema.String),
}) {}

/**
 * Search response
 */
export class SearchResponse extends Schema.Class<SearchResponse>('SearchResponse')({
  title_results: Schema.Array(SearchResult),
  people_results: Schema.NullishOr(Schema.Array(Schema.Unknown)),
}) {}

/**
 * Title streaming source availability
 */
export class TitleSource extends Schema.Class<TitleSource>('TitleSource')({
  source_id: Schema.Number,
  name: Schema.String,
  type: Schema.String,
  region: Schema.String,
  ios_url: Schema.NullishOr(Schema.String),
  android_url: Schema.NullishOr(Schema.String),
  web_url: Schema.NullishOr(Schema.String),
  format: Schema.NullishOr(Schema.String),
  price: Schema.NullishOr(Schema.Number),
  seasons: Schema.NullishOr(Schema.Number),
  episodes: Schema.NullishOr(Schema.Number),
}) {}

/**
 * Title details
 */
export class TitleDetails extends Schema.Class<TitleDetails>('TitleDetails')({
  id: Schema.Number,
  title: Schema.String,
  original_title: Schema.NullishOr(Schema.String),
  plot_overview: Schema.NullishOr(Schema.String),
  type: Schema.String,
  runtime_minutes: Schema.NullishOr(Schema.Number),
  year: Schema.NullishOr(Schema.Number),
  end_year: Schema.NullishOr(Schema.Number),
  release_date: Schema.NullishOr(Schema.String),
  imdb_id: Schema.NullishOr(Schema.String),
  tmdb_id: Schema.NullishOr(Schema.Number),
  tmdb_type: Schema.NullishOr(Schema.String),
  genres: Schema.NullishOr(Schema.Array(Schema.Number)),
  genre_names: Schema.NullishOr(Schema.Array(Schema.String)),
  user_rating: Schema.NullishOr(Schema.Number),
  critic_score: Schema.NullishOr(Schema.Number),
  us_rating: Schema.NullishOr(Schema.String),
  poster: Schema.NullishOr(Schema.String),
  backdrop: Schema.NullishOr(Schema.String),
  original_language: Schema.NullishOr(Schema.String),
  similar_titles: Schema.NullishOr(Schema.Array(Schema.Number)),
  networks: Schema.NullishOr(Schema.Array(Schema.Number)),
  network_names: Schema.NullishOr(Schema.Array(Schema.String)),
  trailer: Schema.NullishOr(Schema.String),
  trailer_thumbnail: Schema.NullishOr(Schema.String),
  relevance_percentile: Schema.NullishOr(Schema.Number),
  sources: Schema.NullishOr(Schema.Array(TitleSource)),
}) {}

/**
 * List titles response
 */
export class ListTitlesResponse extends Schema.Class<ListTitlesResponse>('ListTitlesResponse')({
  titles: Schema.Array(TitleDetails),
  page: Schema.Number,
  total_results: Schema.Number,
  total_pages: Schema.Number,
}) {}
