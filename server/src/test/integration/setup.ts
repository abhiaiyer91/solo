/**
 * Integration Test Setup
 * Configures test database and provides utilities for integration tests
 */

import { beforeEach, afterEach, vi } from 'vitest'

// Track if we're in an integration test
export let isIntegrationTest = false

/**
 * Setup integration test environment
 * Uses transaction rollback for clean test isolation
 */
export function setupIntegrationTest() {
  beforeEach(async () => {
    isIntegrationTest = true
    // In a real setup, you'd begin a transaction here
    // await db.execute('BEGIN')
  })

  afterEach(async () => {
    isIntegrationTest = false
    // Rollback to clean state
    // await db.execute('ROLLBACK')
    vi.clearAllMocks()
  })
}

/**
 * Create a unique ID for test entities
 */
export function createTestId(prefix: string = 'test'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Wait for async operations to settle
 */
export async function waitForSettled(ms: number = 10): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Assert that an async operation completes within timeout
 */
export async function assertWithinTimeout<T>(
  operation: () => Promise<T>,
  timeoutMs: number = 5000,
  message: string = 'Operation timed out'
): Promise<T> {
  return Promise.race([
    operation(),
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(message)), timeoutMs)
    ),
  ])
}
