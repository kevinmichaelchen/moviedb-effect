/**
 * Integration tests for Trakt API client
 *
 * These tests make real API calls to the Trakt API.
 * Requires TRAKT_CLIENT_ID environment variable to be set.
 *
 * Run with: pnpm test:integration
 */

import { Effect, Layer } from 'effect'
import { describe, expect, it } from 'vitest'
import { TraktConfig } from '../src/index.ts'

const getClientId = (): string => {
  const clientId = process.env['TRAKT_CLIENT_ID']
  if (!clientId) {
    throw new Error(
      'TRAKT_CLIENT_ID environment variable is required for integration tests. '
        + 'Get your client ID at: https://trakt.tv/oauth/applications',
    )
  }
  return clientId
}

describe('Trakt Integration Tests', () => {
  describe('Config', () => {
    it('should create config layer with client ID', async () => {
      const clientId = getClientId()

      const ConfigLayer = Layer.succeed(TraktConfig, {
        clientId,
        baseUrl: 'https://api.trakt.tv/',
      })

      const program = Effect.gen(function*() {
        const config = yield* TraktConfig
        expect(config.clientId).toBe(clientId)
        expect(config.baseUrl).toBe('https://api.trakt.tv/')
        return config
      })

      await Effect.runPromise(program.pipe(Effect.provide(ConfigLayer)))
    })
  })

  // TODO: Add client integration tests once TraktClient is implemented
  // describe('Client', () => {
  //   it('should fetch trending movies', async () => {
  //     const program = Effect.gen(function* () {
  //       const client = yield* TraktClient
  //       const trending = yield* client.movies.trending()
  //       expect(trending.length).toBeGreaterThan(0)
  //     })
  //   })
  // })
})
