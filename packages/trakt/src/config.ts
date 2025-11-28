/**
 * Trakt API Configuration
 */

import { Context, Layer } from 'effect'

export interface TraktConfigOptions {
  readonly clientId: string
  readonly clientSecret?: string
  readonly accessToken?: string
  readonly baseUrl: string
}

export class TraktConfig extends Context.Tag('TraktConfig')<TraktConfig, TraktConfigOptions>() {
  static readonly Default = Layer.succeed(
    TraktConfig,
    TraktConfig.of({
      clientId: '',
      baseUrl: 'https://api.trakt.tv/',
    }),
  )
}
