import { test, expect } from './fixtures'

test.describe('Error Handling', () => {
  test.beforeEach(async ({ loginAsTestUser }) => {
    await loginAsTestUser()
  })

  test.describe('API Errors', () => {
    test('should show error state when API fails', async ({ page }) => {
      // Intercept API and return error
      await page.route('/api/quests*', (route) => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal server error' }),
        })
      })

      await page.goto('/')

      // Should show error state
      await expect(
        page.locator('[data-testid="error-message"]').or(page.locator('text=/error|failed/i'))
      ).toBeVisible({ timeout: 5000 })
    })

    test('should show retry button on failure', async ({ page }) => {
      // Intercept API and return error
      await page.route('/api/quests*', (route) => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal server error' }),
        })
      })

      await page.goto('/')

      // Should show retry option
      await expect(page.locator('[data-testid="retry-button"]').or(page.locator('button:has-text("Retry")')))
        .toBeVisible({ timeout: 5000 })
    })

    test('should recover after successful retry', async ({ page }) => {
      let requestCount = 0

      // First request fails, second succeeds
      await page.route('/api/quests*', (route) => {
        requestCount++
        if (requestCount === 1) {
          route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({ error: 'Internal server error' }),
          })
        } else {
          route.continue()
        }
      })

      await page.goto('/')

      // Wait for error
      await page.waitForSelector('[data-testid="retry-button"], button:has-text("Retry")')

      // Click retry
      await page.click('[data-testid="retry-button"], button:has-text("Retry")')

      // Should recover and show content
      await expect(page.locator('[data-testid="quest-list"]')).toBeVisible({ timeout: 5000 })
    })
  })

  test.describe('Session Expiry', () => {
    test('should handle 401 unauthorized response', async ({ page }) => {
      await page.goto('/')

      // Wait for initial load
      await page.waitForSelector('[data-testid="quest-list"]')

      // Now intercept all API calls with 401
      await page.route('/api/*', (route) => {
        route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Unauthorized' }),
        })
      })

      // Trigger an action that makes an API call
      await page.click('[data-testid="refresh-button"]').catch(() => {})

      // Should redirect to login or show auth error
      await expect(
        page.locator('text=/session expired|log in|unauthorized/i')
          .or(page)
      ).toHaveURL(/login/, { timeout: 5000 }).catch(() => {
        // Alternative: check for auth error message
        return expect(page.locator('text=/unauthorized|session/i')).toBeVisible()
      })
    })
  })

  test.describe('Network Errors', () => {
    test('should handle network offline', async ({ page }) => {
      await page.goto('/')

      // Wait for initial load
      await page.waitForSelector('[data-testid="quest-list"]')

      // Go offline
      await page.context().setOffline(true)

      // Try to trigger a network request
      await page.click('[data-testid="refresh-button"]').catch(() => {})

      // Should show offline indicator or error
      await expect(
        page.locator('[data-testid="offline-indicator"]')
          .or(page.locator('text=/offline|connection/i'))
      ).toBeVisible({ timeout: 5000 })

      // Go back online
      await page.context().setOffline(false)
    })

    test('should recover from network errors', async ({ page }) => {
      await page.goto('/')

      // Wait for initial load
      await page.waitForSelector('[data-testid="quest-list"]')

      // Go offline briefly
      await page.context().setOffline(true)
      await page.waitForTimeout(1000)
      await page.context().setOffline(false)

      // Refresh should work
      await page.reload()

      // Should recover
      await expect(page.locator('[data-testid="quest-list"]')).toBeVisible({ timeout: 5000 })
    })
  })

  test.describe('Validation Errors', () => {
    test('should show validation errors on form submission', async ({ page }) => {
      await page.goto('/guilds')

      // Try to create guild with invalid data
      await page.click('[data-testid="create-guild-button"]')

      // Submit empty form
      await page.click('[data-testid="submit-guild"]')

      // Should show validation errors
      await expect(page.locator('[data-testid="validation-error"]').or(page.locator('.error'))).toBeVisible()
    })
  })

  test.describe('404 Not Found', () => {
    test('should show 404 page for unknown routes', async ({ page }) => {
      await page.goto('/this-page-does-not-exist-12345')

      // Should show 404 page
      await expect(page.locator('text=/not found|404/i')).toBeVisible()
    })

    test('should provide navigation from 404', async ({ page }) => {
      await page.goto('/this-page-does-not-exist-12345')

      // Should have a link back to home
      await expect(
        page.locator('a:has-text("Home")').or(page.locator('a:has-text("Dashboard")'))
      ).toBeVisible()
    })
  })
})
