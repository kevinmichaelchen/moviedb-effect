# moviedb-effect - AI Agent Instructions

**Project**: A modern, type-safe TypeScript client for The Movie Database (TMDb) API, built with Effect.

**Core Stack**:

- **Language**: TypeScript (strict mode, full type safety)
- **Runtime**: Node.js with PNPM package manager (NOT npm, NOT bun, NOT deno)
- **Framework**: Effect (see: https://effect.website/)
- **Testing**: Mocha + Chai (NOT Deno test, NOT Vitest)
- **Build**: tsdown (TypeScript bundler)
- **Quality**: ESLint + Prettier + TypeScript strict mode

## Project Overview

### Key Files & Structure

```
src/
├── effect/              # Core Effect-based implementation
│   ├── movie.ts        # Movie service
│   ├── tv.ts           # TV service
│   ├── search.ts       # Search service
│   ├── person.ts       # Person service
│   ├── client.ts       # HTTP client (with rate limiting & retries)
│   ├── http-client.ts  # Low-level HTTP + observability
│   ├── errors.ts       # Typed error hierarchy
│   ├── config.ts       # Configuration management
│   ├── rate-limiter.ts # Rate limiting service
│   ├── streaming.ts    # Pagination utilities
│   ├── test-layers.ts  # Mock layers for testing
│   └── schemas/        # Effect Schema definitions
├── types.ts            # Public type exports
├── request-types.ts    # Request parameter types
└── index.ts            # Public API

tests/effect/
├── http-client-unit.test.ts     # Error handling, retry logic (NO API KEY NEEDED)
├── schema-validation.test.ts    # Schema & transformation validation (NO API KEY NEEDED)
├── streaming-edge-cases.test.ts # Pagination, lazy eval, backpressure (NO API KEY NEEDED)
├── observability.test.ts        # Metrics, logging, tracing (NO API KEY NEEDED)
├── movie.test.ts                # Movie service (REQUIRES MOVIEDB_API_KEY)
├── tv.test.ts                   # TV service (REQUIRES MOVIEDB_API_KEY)
├── search.test.ts               # Search service (REQUIRES MOVIEDB_API_KEY)
├── person.test.ts               # Person service (REQUIRES MOVIEDB_API_KEY)
├── client.test.ts               # Client integration (REQUIRES MOVIEDB_API_KEY)
├── rate-limiter.test.ts         # Rate limiting tests
├── streaming.test.ts            # Basic pagination tests
├── compat.test.ts               # Compatibility tests
└── test-utils.ts                # Shared test utilities & mocks
```

### Key Concepts

#### Effect Services

All major components are implemented as Effect Services with dependency injection:

- `Movie.Service<Movie>()` - Provides movie operations
- `Tv.Service<Tv>()` - Provides TV operations
- `Search.Service<Search>()` - Provides search operations
- `Person.Service<Person>()` - Provides person operations
- `MovieDbClient` - HTTP client with rate limiting
- `RateLimiter` - Token-bucket rate limiter

#### Error Handling

Typed error hierarchy using `Data.TaggedError`:

- `NotFoundError` - 404 responses
- `AuthenticationError` - 401/403 responses
- `RateLimitError` - 429 responses with retry-after
- `ValidationError` - 400/422 responses
- `ServerError` - 5xx responses
- `NetworkError` - Connection/timeout errors

Pattern matching with `Effect.catchTags()` enables exhaustive error handling.

#### Streaming & Pagination

All list endpoints provide:

- `getPopular()` - Single page results
- `streamPopular()` - Stream all pages with lazy evaluation
  Streaming utilities:
- `paginatedStream()` - Basic pagination
- `mapPaginated()` - Map over all pages
- `mapPaginatedEffect()` - Concurrent mapping

#### Observability

Built-in instrumentation:

- **Metrics**: `apiRequestCounter`, `apiRequestDuration`, `apiErrorCounter`
- **Logging**: Structured logs with annotations (path, duration, error context)
- **Tracing**: Distributed tracing with `Effect.withSpan()`
- **Retry tracking**: Automatic retry logging on failures

## Development Guidelines

### Code Style

1. **Use TypeScript strict mode** - All code must be type-safe
2. **Use Effect patterns**:
   - `Effect.gen()` for composing effects
   - `Effect.Service<T>()` for services
   - `Layer` for dependency injection
   - `Stream` for lazy pagination
   - Typed errors with `Data.TaggedError`
3. **Export types explicitly** - `export type X = typeof Y.Type`
4. **Use camelCase** - File names, variables, methods
5. **Comment Effect code** - JSDoc for public APIs

### Avoid

- ❌ `npm` - Use `pnpm` only
- ❌ `bun` - Use `pnpm` only
- ❌ `deno` - Use Node.js with `pnpm` only
- ❌ `.ts` extensions in imports - Use `import { X } from "./file"` not `"./file.ts"`
- ❌ `Deno.test()` - Use Mocha `it()` in describe blocks
- ❌ `@std/assert` - Use Chai `expect()` assertions
- ❌ Promise chains - Use `Effect.gen()` instead
- ❌ Try/catch for business logic - Use Effect error handling
- ❌ Manual resource management - Use Effect scopes

### Testing Best Practices

1. **Unit tests** - No network, use mocks (test-utils.ts)
2. **Test error cases** - Use `expectError()` from test-utils
3. **Test streaming** - Verify lazy evaluation with Stream.take
4. **Integration tests** - Skip when API key missing with `ignore: !REAL_API_KEY`
5. **Assertions** - Use Chai `expect()` with `.to.equal()`, `.to.be.null`, etc.

### Running Tests

```bash
pnpm test:unit       # Fast: error handling, schemas, observability (<1s)
pnpm test:streaming  # Pagination tests (<2s)
pnpm test:all        # Everything with API key (1-2 min)
MOVIEDB_API_KEY=xxx pnpm test
```

### Linting & Format

```bash
pnpm lint            # Check ESLint + @effect/eslint-plugin
pnpm lint:fix        # Auto-fix issues
pnpm format          # Run Prettier
```

## API Key Setup

1. Get free API key at: https://www.themoviedb.org/settings/api
2. Set environment variable: `export MOVIEDB_API_KEY=your_key`
3. Or create `.env` file: `echo "MOVIEDB_API_KEY=xxx" > .env`
4. Run integration tests: `pnpm test:integration`

## Common Patterns

### Service Usage

```typescript
const program = Effect.gen(function*() {
  const movie = yield* Movie
  const details = yield* movie.getDetails({ id: 550 })
  console.log(details.title) // "Fight Club"
})
```

### Error Handling

```typescript
const program = Effect.gen(function*() {
  const movie = yield* Movie
  yield* movie.getDetails({ id: 999 }).pipe(
    Effect.catchTags({
      NotFoundError: () => Console.log('Not found'),
      RateLimitError: (e) => Effect.sleep(e.retryAfter || 5000),
    }),
  )
})
```

### Streaming with Pagination

```typescript
const program = Effect.gen(function*() {
  const movie = yield* Movie
  const results = yield* movie.streamPopular({ language: 'en-US' }, { maxResults: 100 }).pipe(
    Stream.runCollect,
  )
})
```

### Testing with Mocks

```typescript
const program = Effect.gen(function*() {
  // Test code with mocks
}).pipe(
  Effect.provide(Movie.Default),
  Effect.provide(MovieDbClient.Default),
  Effect.provide(MockRateLimiter),
  Effect.provide(makeTestConfig({ apiKey: 'test-key' })),
)
```

## Important Links

- Effect Docs: https://effect.website/
- Ruler Docs: https://github.com/intellectronica/ruler
- TMDb API: https://developer.themoviedb.org/docs
- Project Repo: https://github.com/kevinmichaelchen/moviedb-effect

## Recent Improvements

- Migrated from Deno test to Mocha (PNPM standard)
- Removed all `.ts` extensions from imports (Node.js standard)
- Added 55 new unit tests (error handling, schema validation, observability)
- Improved streaming tests with edge cases
- Shared test utilities to reduce duplication
- Comprehensive documentation (TESTING.md, etc.)
