/**
 * Watchmode API Configuration
 */

import { Context, Layer } from 'effect'

export interface WatchmodeConfigOptions {
  readonly apiKey: string
  readonly baseUrl: string
}

export class WatchmodeConfig extends Context.Tag('WatchmodeConfig')<WatchmodeConfig, WatchmodeConfigOptions>() {
  static readonly Default = Layer.succeed(
    WatchmodeConfig,
    WatchmodeConfig.of({
      apiKey: '',
      baseUrl: 'https://api.watchmode.com/v1/',
    }),
  )
}
