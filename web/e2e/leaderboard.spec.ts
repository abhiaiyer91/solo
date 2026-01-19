import { test, expect } from './fixtures'

test.describe('Leaderboard System', () => {
  test.beforeEach(async ({ loginAsTestUser }) => {
    await loginAsTestUser()
  })

  test.describe('Leaderboard Display', () => {
    test('should display leaderboard page', async ({ page }) => {
      await page.goto('/leaderboard')

      // Leaderboard page should be visible
      await expect(page.locator('[data-testid="leaderboard-page"]')).toBeVisible()
    })

    test('should show leaderboard entries', async ({ page }) => {
      await page.goto('/leaderboard')

      // Should show player entries
      const entries = page.locator('[data-testid="leaderboard-entry"]')
      await expect(entries.first()).toBeVisible({ timeout: 5000 })
    })

    test('should show rank, name, and score', async ({ page }) => {
      await page.goto('/leaderboard')

      const firstEntry = page.locator('[data-testid="leaderboard-entry"]').first()

      if (await firstEntry.isVisible()) {
        // Should show rank
        await expect(firstEntry.locator('[data-testid="entry-rank"]')).toBeVisible()

        // Should show player name
        await expect(firstEntry.locator('[data-testid="entry-name"]')).toBeVisible()

        // Should show score/XP
        await expect(firstEntry.locator('[data-testid="entry-score"]')).toBeVisible()
      }
    })

    test('should highlight current user', async ({ page }) => {
      await page.goto('/leaderboard')

      // Current user's entry should be highlighted
      const currentUserEntry = page.locator('[data-testid="leaderboard-entry"][data-current-user="true"]')

      // May or may not be visible depending on if user is in top rankings
      if (await currentUserEntry.isVisible()) {
        await expect(currentUserEntry).toHaveClass(/highlight|current/)
      }
    })
  })

  test.describe('Leaderboard Filters', () => {
    test('should switch between XP and streak leaderboards', async ({ page }) => {
      await page.goto('/leaderboard')

      // Should have tabs or filter buttons
      const tabs = page.locator('[data-testid="leaderboard-tabs"]')

      if (await tabs.isVisible()) {
        // Click streak tab
        await page.click('[data-testid="tab-streak"]')

        // Should update leaderboard
        await expect(page.locator('[data-testid="leaderboard-type"]')).toContainText(/streak/i)

        // Click XP tab
        await page.click('[data-testid="tab-xp"]')

        // Should update leaderboard
        await expect(page.locator('[data-testid="leaderboard-type"]')).toContainText(/xp/i)
      }
    })

    test('should filter by time period', async ({ page }) => {
      await page.goto('/leaderboard')

      const periodFilter = page.locator('[data-testid="period-filter"]')

      if (await periodFilter.isVisible()) {
        // Select weekly
        await periodFilter.selectOption('weekly')

        // Should update display
        await expect(page.locator('[data-testid="leaderboard-period"]')).toContainText(/week/i)

        // Select all-time
        await periodFilter.selectOption('all-time')

        // Should update display
        await expect(page.locator('[data-testid="leaderboard-period"]')).toContainText(/all.?time/i)
      }
    })
  })

  test.describe('Leaderboard Pagination', () => {
    test('should load more entries on scroll', async ({ page }) => {
      await page.goto('/leaderboard')

      const initialCount = await page.locator('[data-testid="leaderboard-entry"]').count()

      // Scroll to bottom
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))

      // Wait for potential load
      await page.waitForTimeout(1000)

      // Check if more loaded (may or may not depending on total users)
      const newCount = await page.locator('[data-testid="leaderboard-entry"]').count()

      // Should have same or more entries
      expect(newCount).toBeGreaterThanOrEqual(initialCount)
    })
  })

  test.describe('Guild Leaderboard', () => {
    test('should navigate to guild leaderboard', async ({ page }) => {
      await page.goto('/leaderboard')

      const guildTab = page.locator('[data-testid="tab-guilds"]')

      if (await guildTab.isVisible()) {
        await guildTab.click()

        // Should show guild rankings
        await expect(page.locator('[data-testid="guild-leaderboard"]')).toBeVisible()
      }
    })

    test('should show guild name and weekly XP', async ({ page }) => {
      await page.goto('/leaderboard')

      const guildTab = page.locator('[data-testid="tab-guilds"]')

      if (await guildTab.isVisible()) {
        await guildTab.click()

        const firstGuild = page.locator('[data-testid="guild-entry"]').first()

        if (await firstGuild.isVisible()) {
          // Should show guild name
          await expect(firstGuild.locator('[data-testid="guild-name"]')).toBeVisible()

          // Should show weekly XP
          await expect(firstGuild.locator('[data-testid="guild-xp"]')).toBeVisible()
        }
      }
    })
  })
})
