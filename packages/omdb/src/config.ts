/**
 * OMDb API Configuration
 */

import { Context, Layer } from 'effect'

export interface OmdbConfigOptions {
  readonly apiKey: string
  readonly baseUrl: string
}

export class OmdbConfig extends Context.Tag('OmdbConfig')<OmdbConfig, OmdbConfigOptions>() {
  static readonly Default = Layer.succeed(
    OmdbConfig,
    OmdbConfig.of({
      apiKey: '',
      baseUrl: 'https://www.omdbapi.com/',
    }),
  )
}
