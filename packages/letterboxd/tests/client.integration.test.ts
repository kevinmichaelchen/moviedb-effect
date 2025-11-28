/**
 * Integration tests for Letterboxd API client
 *
 * These tests make real API calls to the Letterboxd API.
 * Requires LETTERBOXD_API_KEY and LETTERBOXD_API_SECRET environment variables.
 *
 * Note: The Letterboxd API is in private beta and requires approved access.
 *
 * Run with: pnpm test:integration
 */

import { Effect, Layer } from 'effect'
import { describe, expect, it } from 'vitest'
import { LetterboxdConfig } from '../src/index.ts'

const getCredentials = (): { apiKey: string; apiSecret: string } => {
  const apiKey = process.env['LETTERBOXD_API_KEY']
  const apiSecret = process.env['LETTERBOXD_API_SECRET']
  if (!apiKey || !apiSecret) {
    throw new Error(
      'LETTERBOXD_API_KEY and LETTERBOXD_API_SECRET environment variables are required for integration tests. '
        + 'Apply for API access at: https://letterboxd.com/api-beta/',
    )
  }
  return { apiKey, apiSecret }
}

describe('Letterboxd Integration Tests', () => {
  describe('Config', () => {
    it('should create config layer with API credentials', async () => {
      const { apiKey, apiSecret } = getCredentials()

      const ConfigLayer = Layer.succeed(LetterboxdConfig, {
        apiKey,
        apiSecret,
        baseUrl: 'https://api.letterboxd.com/api/v0/',
      })

      const program = Effect.gen(function*() {
        const config = yield* LetterboxdConfig
        expect(config.apiKey).toBe(apiKey)
        expect(config.apiSecret).toBe(apiSecret)
        expect(config.baseUrl).toBe('https://api.letterboxd.com/api/v0/')
        return config
      })

      await Effect.runPromise(program.pipe(Effect.provide(ConfigLayer)))
    })
  })

  // TODO: Add client integration tests once LetterboxdClient is implemented
  // describe('Client', () => {
  //   it('should search for films', async () => {
  //     const program = Effect.gen(function* () {
  //       const client = yield* LetterboxdClient
  //       const films = yield* client.films.search('Parasite')
  //       expect(films.length).toBeGreaterThan(0)
  //     })
  //   })
  // })
})
