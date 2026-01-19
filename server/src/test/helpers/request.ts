/**
 * Test Request Helpers
 * Utilities for creating mock requests and auth middleware in route tests
 */

import type { Context, Next } from 'hono'

export interface MockUser {
  id: string
  name: string
  email: string
  level: number
  totalXP: number
  timezone: string
  currentStreak?: number
  onboardingCompleted?: boolean
}

/**
 * Create a mock auth middleware for testing
 */
export function createMockAuthMiddleware(user: MockUser | null) {
  return async (c: Context, next: Next) => {
    c.set('user', user as never)
    c.set('session', (user ? { id: `session-${user.id}` } : null) as never)
    return next()
  }
}

/**
 * Mock requireAuth middleware that checks for user
 */
export async function mockRequireAuth(c: Context, next: Next) {
  const user = c.get('user')
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  return next()
}

/**
 * Default mock user for testing
 */
export const mockUser: MockUser = {
  id: 'user-123',
  name: 'Test Hunter',
  email: 'test@example.com',
  level: 5,
  totalXP: 500,
  timezone: 'America/New_York',
  currentStreak: 3,
  onboardingCompleted: true,
}

/**
 * Create a custom mock user
 */
export function createMockUser(overrides: Partial<MockUser> = {}): MockUser {
  return { ...mockUser, ...overrides }
}

/**
 * Create JSON request options
 */
export function jsonRequest(body: unknown, method: string = 'POST'): RequestInit {
  return {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }
}
