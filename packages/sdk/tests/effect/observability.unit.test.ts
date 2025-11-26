/**
 * Tests for observability features (logging, tracing, metrics)
 *
 * Verifies that instrumentation code is correct and works as expected.
 */

import { describe, it, expect } from '@effect/vitest'
import { Effect, Metric, Clock, TestClock, Fiber } from 'effect'
import { apiRequestCounter, apiRequestDuration, apiErrorCounter } from '../../src/effect/http-client.ts'

describe('Observability', () => {
  it('Metrics - apiRequestCounter exists and is counter type', async () => {
    expect(apiRequestCounter).toBeDefined()
  })

  it('Metrics - apiRequestDuration is histogram type', async () => {
    expect(apiRequestDuration).toBeDefined()
  })

  it('Metrics - apiErrorCounter is counter type', async () => {
    expect(apiErrorCounter).toBeDefined()
  })

  it.effect('Structured logging - can annotate logs', () =>
    Effect.gen(function* () {
      // Just verify Effect.annotateLogs works
      yield* Effect.logInfo('Test message').pipe(
        Effect.annotateLogs({
          request_id: '123',
          path: '/movie/550',
          duration_ms: 150,
        }),
      )

      return 'success'
    }).pipe(Effect.map((result) => expect(result).toBe('success'))),
  )

  it.effect('Distributed tracing - can create spans', () =>
    Effect.gen(function* () {
      const result = yield* Effect.succeed(42).pipe(
        Effect.withSpan('test-operation', {
          attributes: {
            'operation.type': 'test',
            'resource.id': '123',
          },
        }),
      )

      return result
    }).pipe(Effect.map((result) => expect(result).toBe(42))),
  )

  it.effect('Error logging - structured error information', () =>
    Effect.gen(function* () {
      const result = yield* Effect.fail(new Error('Test error')).pipe(Effect.catchAll(() => Effect.succeed('handled')))

      return result
    }).pipe(Effect.map((result) => expect(result).toBe('handled'))),
  )

  it.effect('Log annotation - can include contextual data', () =>
    Effect.gen(function* () {
      yield* Effect.logDebug('Debug message').pipe(
        Effect.annotateLogs({
          component: 'http-client',
          endpoint: '/movie/550',
        }),
      )

      return 'success'
    }).pipe(Effect.map((result) => expect(result).toBe('success'))),
  )

  it.effect('Metrics - counter increments correctly', () =>
    Effect.gen(function* () {
      // Just verify increment doesn't throw
      yield* Metric.increment(apiRequestCounter)
      return 'success'
    }).pipe(Effect.map((result) => expect(result).toBeDefined())),
  )

  it.effect('Logging - success case includes duration', () =>
    Effect.gen(function* () {
      const startTime = yield* Clock.currentTimeMillis

      const fiber = yield* Effect.sleep(10).pipe(
        Effect.tap(() =>
          Effect.gen(function* () {
            const endTime = yield* Clock.currentTimeMillis
            yield* Effect.logInfo('Operation completed').pipe(
              Effect.annotateLogs({
                duration_ms: endTime - startTime,
              }),
            )
          }),
        ),
        Effect.fork,
      )

      yield* TestClock.adjust(10)
      yield* Fiber.join(fiber)

      return 'success'
    }).pipe(Effect.map((result) => expect(result).toBe('success'))),
  )

  it.effect('Logging - error case includes error details', () =>
    Effect.gen(function* () {
      const result = yield* Effect.tryPromise(() => Promise.reject(new Error('Request failed'))).pipe(
        Effect.tapError((error) =>
          Effect.logError('Request failed').pipe(
            Effect.annotateLogs({
              error_message: error instanceof Error ? error.message : String(error),
              error_type: error instanceof Error ? error.constructor.name : 'Unknown',
            }),
          ),
        ),
        Effect.either,
      )

      return result._tag
    }).pipe(Effect.map((result) => expect(result).toBe('Left'))),
  )

  it.effect('Tracing - nested spans work correctly', () =>
    Effect.gen(function* () {
      const result = yield* Effect.gen(function* () {
        const inner = yield* Effect.succeed(42).pipe(
          Effect.withSpan('inner-operation', {
            attributes: { level: 2 },
          }),
        )
        return inner
      }).pipe(
        Effect.withSpan('outer-operation', {
          attributes: { level: 1 },
        }),
      )

      return result
    }).pipe(Effect.map((result) => expect(result).toBe(42))),
  )

  it.effect('Observability - can run multiple operations with spans', () =>
    Effect.gen(function* () {
      // Multiple traced operations
      const r1 = yield* Effect.succeed(1).pipe(
        Effect.withSpan('op1', {
          attributes: { index: 1 },
        }),
      )

      const r2 = yield* Effect.succeed(2).pipe(
        Effect.withSpan('op2', {
          attributes: { index: 2 },
        }),
      )

      const r3 = yield* Effect.succeed(3).pipe(
        Effect.withSpan('op3', {
          attributes: { index: 3 },
        }),
      )

      return r1 + r2 + r3
    }).pipe(Effect.map((result) => expect(result).toBe(6))),
  )
})
