/**
 * Base configuration types for Movie API clients
 *
 * Provides common configuration patterns used across all API implementations.
 */

/**
 * Base configuration interface that all API configs can extend
 *
 * Note: Not all APIs require all fields. For example:
 * - Some APIs use `apiKey`, others use `clientId` or OAuth tokens
 * - `requestsPerSecond` is optional since rate limits vary by API
 */
export interface BaseApiConfig {
  /**
   * API key or token for authentication
   */
  readonly apiKey: string

  /**
   * Base URL for the API
   */
  readonly baseUrl: string

  /**
   * Maximum number of requests per second for rate limiting.
   * Optional since not all APIs need client-side rate limiting.
   */
  readonly requestsPerSecond?: number
}
