/**
 * OMDb API response schemas
 */

import { Schema } from 'effect'

/**
 * Rating from a source (e.g., Internet Movie Database, Rotten Tomatoes)
 */
export class Rating extends Schema.Class<Rating>('Rating')({
  Source: Schema.String,
  Value: Schema.String,
}) {}

/**
 * Movie/Series details response
 */
export class OmdbItem extends Schema.Class<OmdbItem>('OmdbItem')({
  Title: Schema.String,
  Year: Schema.String,
  Rated: Schema.optional(Schema.String),
  Released: Schema.optional(Schema.String),
  Runtime: Schema.optional(Schema.String),
  Genre: Schema.optional(Schema.String),
  Director: Schema.optional(Schema.String),
  Writer: Schema.optional(Schema.String),
  Actors: Schema.optional(Schema.String),
  Plot: Schema.optional(Schema.String),
  Language: Schema.optional(Schema.String),
  Country: Schema.optional(Schema.String),
  Awards: Schema.optional(Schema.String),
  Poster: Schema.optional(Schema.String),
  Ratings: Schema.optional(Schema.Array(Rating)),
  Metascore: Schema.optional(Schema.String),
  imdbRating: Schema.optional(Schema.String),
  imdbVotes: Schema.optional(Schema.String),
  imdbID: Schema.String,
  Type: Schema.String,
  DVD: Schema.optional(Schema.String),
  BoxOffice: Schema.optional(Schema.String),
  Production: Schema.optional(Schema.String),
  Website: Schema.optional(Schema.String),
  Response: Schema.Literal('True'),
}) {}

/**
 * Search result item (abbreviated info)
 */
export class SearchResultItem extends Schema.Class<SearchResultItem>('SearchResultItem')({
  Title: Schema.String,
  Year: Schema.String,
  imdbID: Schema.String,
  Type: Schema.String,
  Poster: Schema.optional(Schema.String),
}) {}

/**
 * Search response with pagination
 */
export class SearchResponse extends Schema.Class<SearchResponse>('SearchResponse')({
  Search: Schema.Array(SearchResultItem),
  totalResults: Schema.String,
  Response: Schema.Literal('True'),
}) {}

/**
 * Error response from OMDb
 */
export class OmdbErrorResponse extends Schema.Class<OmdbErrorResponse>('OmdbErrorResponse')({
  Response: Schema.Literal('False'),
  Error: Schema.String,
}) {}

/**
 * Union of success or error response for item lookup
 */
export const ItemResponse = Schema.Union(OmdbItem, OmdbErrorResponse)

/**
 * Union of success or error response for search
 */
export const SearchResultResponse = Schema.Union(SearchResponse, OmdbErrorResponse)
