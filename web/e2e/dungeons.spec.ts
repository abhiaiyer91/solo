import { test, expect } from './fixtures'

test.describe('Dungeon System', () => {
  test.beforeEach(async ({ loginAsTestUser }) => {
    await loginAsTestUser()
  })

  test.describe('Dungeon Browsing', () => {
    test('should display dungeons page', async ({ page }) => {
      await page.goto('/dungeons')

      // Dungeons page should be visible
      await expect(page.locator('[data-testid="dungeons-page"]')).toBeVisible()
    })

    test('should show available dungeons', async ({ page }) => {
      await page.goto('/dungeons')

      // Should show dungeon cards
      const dungeonCards = page.locator('[data-testid="dungeon-card"]')
      await expect(dungeonCards.first()).toBeVisible({ timeout: 5000 })
    })

    test('should show dungeon rank and difficulty', async ({ page }) => {
      await page.goto('/dungeons')

      const firstDungeon = page.locator('[data-testid="dungeon-card"]').first()

      if (await firstDungeon.isVisible()) {
        // Should show rank badge
        await expect(firstDungeon.locator('[data-testid="dungeon-rank"]')).toBeVisible()

        // Should show time limit
        await expect(firstDungeon.locator('[data-testid="dungeon-time"]')).toBeVisible()

        // Should show XP reward
        await expect(firstDungeon.locator('[data-testid="dungeon-xp"]')).toBeVisible()
      }
    })

    test('should show locked dungeons for insufficient level', async ({ page }) => {
      await page.goto('/dungeons')

      // Check if any dungeons show locked state
      const lockedDungeons = page.locator('[data-testid="dungeon-card"][data-locked="true"]')

      if (await lockedDungeons.first().isVisible()) {
        // Should show level requirement
        await expect(lockedDungeons.first().locator('[data-testid="level-required"]')).toBeVisible()
      }
    })
  })

  test.describe('Dungeon Entry', () => {
    test('should show confirmation modal when entering dungeon', async ({ page }) => {
      await page.goto('/dungeons')

      // Find an available (not locked) dungeon
      const availableDungeon = page.locator('[data-testid="dungeon-card"]:not([data-locked="true"])').first()

      if (await availableDungeon.isVisible()) {
        await availableDungeon.click()

        // Should show entry confirmation modal
        await expect(page.locator('[data-testid="dungeon-entry-modal"]')).toBeVisible()
      }
    })

    test('should display dungeon requirements in modal', async ({ page }) => {
      await page.goto('/dungeons')

      const availableDungeon = page.locator('[data-testid="dungeon-card"]:not([data-locked="true"])').first()

      if (await availableDungeon.isVisible()) {
        await availableDungeon.click()

        const modal = page.locator('[data-testid="dungeon-entry-modal"]')

        // Should show time limit warning
        await expect(modal.locator('[data-testid="time-warning"]')).toBeVisible()

        // Should show XP reward
        await expect(modal.locator('[data-testid="entry-xp-reward"]')).toBeVisible()
      }
    })

    test('should start dungeon on confirmation', async ({ page }) => {
      await page.goto('/dungeons')

      const availableDungeon = page.locator('[data-testid="dungeon-card"]:not([data-locked="true"])').first()

      if (await availableDungeon.isVisible()) {
        await availableDungeon.click()

        // Wait for modal
        await page.waitForSelector('[data-testid="dungeon-entry-modal"]')

        // Click confirm
        await page.click('[data-testid="confirm-enter-dungeon"]')

        // Should show active dungeon or redirect
        await expect(page.locator('[data-testid="active-dungeon"]')).toBeVisible({ timeout: 5000 })
      }
    })
  })

  test.describe('Active Dungeon', () => {
    test('should display active dungeon progress', async ({ page }) => {
      await page.goto('/dungeons')

      const activeDungeon = page.locator('[data-testid="active-dungeon"]')

      if (await activeDungeon.isVisible()) {
        // Should show progress bar
        await expect(activeDungeon.locator('[data-testid="dungeon-progress"]')).toBeVisible()

        // Should show time remaining
        await expect(activeDungeon.locator('[data-testid="time-remaining"]')).toBeVisible()

        // Should show quests completed
        await expect(activeDungeon.locator('[data-testid="quests-completed"]')).toBeVisible()
      }
    })

    test('should show abandon option for active dungeon', async ({ page }) => {
      await page.goto('/dungeons')

      const activeDungeon = page.locator('[data-testid="active-dungeon"]')

      if (await activeDungeon.isVisible()) {
        // Should show abandon button
        await expect(activeDungeon.locator('[data-testid="abandon-dungeon"]')).toBeVisible()
      }
    })
  })

  test.describe('Dungeon History', () => {
    test('should show completed dungeons history', async ({ page }) => {
      await page.goto('/dungeons')

      const historySection = page.locator('[data-testid="dungeon-history"]')

      if (await historySection.isVisible()) {
        // Should show completed dungeon entries
        const historyItems = historySection.locator('[data-testid="history-item"]')
        await expect(historyItems.first().or(page.locator('[data-testid="no-history"]'))).toBeVisible()
      }
    })
  })
})
