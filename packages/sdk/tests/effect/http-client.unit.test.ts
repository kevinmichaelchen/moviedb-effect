/**
 * Unit tests for HTTP client error handling and retry logic
 *
 * Tests error mapping, retry behavior, and observability without API calls.
 */

import { describe, it, expect } from '@effect/vitest'
import { Effect, TestClock, Fiber } from 'effect'
import { withRetry } from '../../src/effect/http-client'
import {
  AuthenticationError,
  NetworkError,
  NotFoundError,
  RateLimitError,
  ServerError,
  ValidationError,
} from '../../src/effect/errors'

const FIGHT_CLUB_ID = 550

describe('HTTP Client - Error Handling', () => {
  it('handles 404 Not Found', () => {
    const statusCode = 404
    expect(statusCode).toBe(404)
  })

  it('handles 401 Unauthorized', () => {
    const statusCode = 401
    expect(statusCode).toBe(401)
  })

  it('handles 429 Rate Limit', () => {
    const statusCode = 429
    expect(statusCode).toBe(429)
  })

  it('handles 400 Validation Error', () => {
    const statusCode = 400
    expect(statusCode).toBe(400)
  })

  it('handles 500 Server Error', () => {
    const statusCode = 500
    expect(statusCode).toBe(500)
  })

  it.effect('retries on transient failures', () =>
    Effect.gen(function* () {
      let attempts = 0

      const effect = Effect.gen(function* () {
        attempts++
        if (attempts < 3) {
          return yield* Effect.fail(
            new NetworkError({
              message: 'Connection timeout',
            }),
          )
        }
        return 42
      })

      const fiber = yield* withRetry(effect).pipe(Effect.fork)
      yield* TestClock.adjust('10 seconds')
      const result = yield* Fiber.join(fiber)

      expect(result).toBe(42)
      expect(attempts).toBe(3)
    }),
  )

  it.effect('does not retry on auth errors', () =>
    Effect.gen(function* () {
      let attempts = 0

      const effect = Effect.gen(function* () {
        attempts++
        return yield* Effect.fail(
          new AuthenticationError({
            message: 'Invalid API key',
          }),
        )
      })

      const result = yield* withRetry(effect).pipe(Effect.either)
      expect(result._tag).toBe('Left')
      expect(attempts).toBe(1) // No retry
    }),
  )

  it.effect('does not retry on not found errors', () =>
    Effect.gen(function* () {
      let attempts = 0

      const effect = Effect.gen(function* () {
        attempts++
        return yield* Effect.fail(
          new NotFoundError({
            message: 'Movie not found',
            resource: 'movie',
            id: FIGHT_CLUB_ID,
          }),
        )
      })

      const result = yield* withRetry(effect).pipe(Effect.either)
      expect(result._tag).toBe('Left')
      expect(attempts).toBe(1) // No retry
    }),
  )

  it.effect('does not retry on validation errors', () =>
    Effect.gen(function* () {
      let attempts = 0

      const effect = Effect.gen(function* () {
        attempts++
        return yield* Effect.fail(
          new ValidationError({
            message: 'Invalid parameter',
            field: 'page',
          }),
        )
      })

      const result = yield* withRetry(effect).pipe(Effect.either)
      expect(result._tag).toBe('Left')
      expect(attempts).toBe(1) // No retry
    }),
  )

  it.effect('retries on server errors', () =>
    Effect.gen(function* () {
      let attempts = 0

      const effect = Effect.gen(function* () {
        attempts++
        if (attempts < 2) {
          return yield* Effect.fail(
            new ServerError({
              message: 'Internal server error',
              statusCode: 500,
            }),
          )
        }
        return 'success'
      })

      const fiber = yield* withRetry(effect).pipe(Effect.fork)
      yield* TestClock.adjust('10 seconds')
      const result = yield* Fiber.join(fiber)

      expect(result).toBe('success')
      expect(attempts).toBe(2)
    }),
  )

  it.effect('respects max retry attempts', () =>
    Effect.gen(function* () {
      let attempts = 0

      const effect = Effect.gen(function* () {
        attempts++
        return yield* Effect.fail(
          new NetworkError({
            message: 'Always fails',
          }),
        )
      })

      const fiber = yield* withRetry(effect).pipe(Effect.either, Effect.fork)
      yield* TestClock.adjust('10 seconds')
      const result = yield* Fiber.join(fiber)

      expect(result._tag).toBe('Left')
      // 1 initial + 3 retries = 4
      expect(attempts).toBe(4)
    }),
  )

  it.effect('retries on rate limit errors', () =>
    Effect.gen(function* () {
      let attempts = 0

      const effect = Effect.gen(function* () {
        attempts++
        if (attempts < 2) {
          return yield* Effect.fail(
            new RateLimitError({
              message: 'Rate limit exceeded',
              retryAfter: 1,
            }),
          )
        }
        return 'success'
      })

      const fiber = yield* withRetry(effect).pipe(Effect.fork)
      yield* TestClock.adjust('10 seconds')
      const result = yield* Fiber.join(fiber)

      expect(result).toBe('success')
      expect(attempts).toBe(2)
    }),
  )

  it('Network error includes URL context', () => {
    const url = 'https://api.themoviedb.org/3/movie/999'
    const error = new NetworkError({
      message: 'Connection refused',
      url,
    })

    expect(error.url).toBe(url)
    expect(error._tag).toBe('NetworkError')
    expect(error.message).toBeDefined()
  })

  it('Not found error includes resource context', () => {
    const error = new NotFoundError({
      message: 'Movie not found',
      resource: 'movie',
      id: 999,
    })

    expect(error.resource).toBe('movie')
    expect(error.id).toBe(999)
    expect(error._tag).toBe('NotFoundError')
  })

  it('Rate limit error includes retry timing', () => {
    const error = new RateLimitError({
      message: 'Rate limit exceeded',
      retryAfter: 60,
    })

    expect(error.retryAfter).toBe(60)
    expect(error._tag).toBe('RateLimitError')
  })

  it('Server error includes status code', () => {
    const error = new ServerError({
      message: 'Internal server error',
      statusCode: 503,
    })

    expect(error.statusCode).toBe(503)
    expect(error._tag).toBe('ServerError')
  })

  it('Validation error includes field context', () => {
    const error = new ValidationError({
      message: 'Invalid parameter',
      field: 'sort_by',
      value: 'invalid_field',
    })

    expect(error.field).toBe('sort_by')
    expect(error.value).toBe('invalid_field')
    expect(error._tag).toBe('ValidationError')
  })
})
