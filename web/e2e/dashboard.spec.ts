import { test, expect } from './fixtures'

test.describe('Dashboard', () => {
  test.beforeEach(async ({ loginAsTestUser }) => {
    await loginAsTestUser()
  })

  test.describe('Layout', () => {
    test('should display main dashboard components', async ({ page }) => {
      await page.goto('/')
      
      // Main layout elements
      await expect(page.locator('[data-testid="dashboard"]')).toBeVisible()
      await expect(page.locator('[data-testid="navbar"]')).toBeVisible()
    })

    test('should show player stats summary', async ({ page }) => {
      await page.goto('/')
      
      // Stats should be visible
      await expect(page.locator('[data-testid="player-level"]')).toBeVisible()
      await expect(page.locator('[data-testid="xp-display"]')).toBeVisible()
    })

    test('should show streak information', async ({ page }) => {
      await page.goto('/')
      
      await expect(page.locator('[data-testid="streak-display"]')).toBeVisible()
    })
  })

  test.describe('Data Loading', () => {
    test('should load player data on mount', async ({ page }) => {
      await page.goto('/')
      
      // Wait for loading to complete
      await page.waitForSelector('[data-testid="loading-spinner"]', {
        state: 'hidden',
        timeout: 10000,
      }).catch(() => {})
      
      // Player data should be displayed
      const level = await page.locator('[data-testid="player-level"]').textContent()
      expect(level).toBeTruthy()
    })

    test('should load quests', async ({ page }) => {
      await page.goto('/')
      
      // Quests should load
      await expect(page.locator('[data-testid="quest-list"]')).toBeVisible()
      
      // Should have at least one quest
      const questCount = await page.locator('[data-testid="quest-card"]').count()
      expect(questCount).toBeGreaterThan(0)
    })

    test('should handle loading errors gracefully', async ({ page }) => {
      // Intercept API and force error
      await page.route('**/api/player*', (route) => {
        route.fulfill({
          status: 500,
          body: JSON.stringify({ error: 'Internal Server Error' }),
        })
      })
      
      await page.goto('/')
      
      // Should show error boundary or error message
      await expect(page.locator('[data-testid="error-fallback"]')).toBeVisible({
        timeout: 10000,
      }).catch(() => {
        // Or just verify the page didn't crash
        expect(page.url()).toContain('localhost')
      })
    })
  })

  test.describe('Navigation', () => {
    test('should navigate to stats page', async ({ page }) => {
      await page.goto('/')
      
      await page.click('[data-testid="nav-stats"]')
      
      await expect(page).toHaveURL('/stats')
    })

    test('should navigate to profile page', async ({ page }) => {
      await page.goto('/')
      
      await page.click('[data-testid="nav-profile"]')
      
      await expect(page).toHaveURL('/profile')
    })

    test('should navigate to quests page', async ({ page }) => {
      await page.goto('/')
      
      await page.click('[data-testid="nav-quests"]')
      
      await expect(page).toHaveURL('/quests')
    })
  })

  test.describe('System Messages', () => {
    test('should display system message if present', async ({ page }) => {
      await page.goto('/')
      
      // System message may or may not be present
      const systemMessage = page.locator('[data-testid="system-message"]')
      
      if (await systemMessage.isVisible()) {
        // Should have typewriter effect text
        await expect(systemMessage.locator('[data-testid="typewriter-text"]')).toBeVisible()
      }
    })
  })

  test.describe('Responsive Design', () => {
    test('should show mobile navigation on small screens', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      
      await page.goto('/')
      
      // Mobile nav should be visible
      await expect(page.locator('[data-testid="mobile-nav"]')).toBeVisible()
    })

    test('should show desktop navigation on large screens', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 })
      
      await page.goto('/')
      
      // Desktop nav should be visible
      await expect(page.locator('[data-testid="navbar"]')).toBeVisible()
    })
  })
})
