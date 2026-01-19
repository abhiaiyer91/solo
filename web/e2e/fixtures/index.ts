import { test as base, expect } from '@playwright/test'

/**
 * E2E Test Fixtures
 * 
 * Provides common test utilities and authenticated contexts.
 */

// Test user credentials (use test database)
export const TEST_USER = {
  email: 'e2e-test@journey.app',
  password: 'TestPassword123!',
  name: 'E2E Test User',
}

export const TEST_USER_2 = {
  email: 'e2e-test-2@journey.app',
  password: 'TestPassword456!',
  name: 'E2E Test User 2',
}

// API endpoints
export const API_BASE = process.env.E2E_API_URL || 'http://localhost:3000'

/**
 * Extended test fixture with authentication helpers
 */
export const test = base.extend<{
  /** Login as test user */
  loginAsTestUser: () => Promise<void>
  
  /** Logout current user */
  logout: () => Promise<void>
  
  /** Wait for page to be fully loaded */
  waitForPageLoad: () => Promise<void>
  
  /** Get auth token from storage */
  getAuthToken: () => Promise<string | null>
}>({
  loginAsTestUser: async ({ page }, use) => {
    const login = async () => {
      await page.goto('/login')
      await page.fill('input[name="email"]', TEST_USER.email)
      await page.fill('input[name="password"]', TEST_USER.password)
      await page.click('button[type="submit"]')
      
      // Wait for redirect to dashboard
      await page.waitForURL('/', { timeout: 10000 })
    }
    
    await use(login)
  },
  
  logout: async ({ page }, use) => {
    const logout = async () => {
      // Click profile menu and logout
      await page.click('[data-testid="profile-menu"]')
      await page.click('[data-testid="logout-button"]')
      
      // Wait for redirect to login
      await page.waitForURL('/login', { timeout: 5000 })
    }
    
    await use(logout)
  },
  
  waitForPageLoad: async ({ page }, use) => {
    const waitForLoad = async () => {
      // Wait for main content to be visible
      await page.waitForSelector('[data-testid="main-content"]', {
        state: 'visible',
        timeout: 10000,
      })
      
      // Wait for any loading spinners to disappear
      await page.waitForSelector('[data-testid="loading-spinner"]', {
        state: 'hidden',
        timeout: 10000,
      }).catch(() => {
        // Loading spinner might not exist, that's ok
      })
    }
    
    await use(waitForLoad)
  },
  
  getAuthToken: async ({ page }, use) => {
    const getToken = async () => {
      const token = await page.evaluate(() => {
        return localStorage.getItem('auth-token')
      })
      return token
    }
    
    await use(getToken)
  },
})

export { expect }

/**
 * Helper to create a unique test user
 */
export function generateTestUser() {
  const timestamp = Date.now()
  return {
    email: `e2e-test-${timestamp}@journey.app`,
    password: 'TestPassword123!',
    name: `Test User ${timestamp}`,
  }
}

/**
 * Helper to seed test data via API
 */
export async function seedTestData(apiBase: string, authToken: string) {
  // This would call API endpoints to set up test data
  // For now, just a placeholder
  console.log('Seeding test data...')
}

/**
 * Helper to clean up test data via API
 */
export async function cleanupTestData(apiBase: string, authToken: string) {
  // This would call API endpoints to clean up test data
  console.log('Cleaning up test data...')
}
