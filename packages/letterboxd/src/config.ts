/**
 * Letterboxd API Configuration
 */

import { Context, Layer } from 'effect'

export interface LetterboxdConfigOptions {
  readonly apiKey: string
  readonly apiSecret: string
  readonly baseUrl: string
}

export class LetterboxdConfig extends Context.Tag('LetterboxdConfig')<LetterboxdConfig, LetterboxdConfigOptions>() {
  static readonly Default = Layer.succeed(
    LetterboxdConfig,
    LetterboxdConfig.of({
      apiKey: '',
      apiSecret: '',
      baseUrl: 'https://api.letterboxd.com/api/v0/',
    }),
  )
}
