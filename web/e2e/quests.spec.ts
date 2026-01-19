import { test, expect } from './fixtures'

test.describe('Quest System', () => {
  test.beforeEach(async ({ loginAsTestUser }) => {
    await loginAsTestUser()
  })

  test.describe('Quest Display', () => {
    test('should display daily quests on dashboard', async ({ page }) => {
      await page.goto('/')
      
      // Quest list should be visible
      await expect(page.locator('[data-testid="quest-list"]')).toBeVisible()
      
      // Should have at least one quest
      const quests = page.locator('[data-testid="quest-card"]')
      await expect(quests.first()).toBeVisible()
    })

    test('should show quest details', async ({ page }) => {
      await page.goto('/')
      
      const firstQuest = page.locator('[data-testid="quest-card"]').first()
      
      // Should show quest name
      await expect(firstQuest.locator('[data-testid="quest-name"]')).toBeVisible()
      
      // Should show XP reward
      await expect(firstQuest.locator('[data-testid="quest-xp"]')).toBeVisible()
      
      // Should show progress or completion state
      await expect(firstQuest.locator('[data-testid="quest-progress"]')).toBeVisible()
    })

    test('should navigate to quests page', async ({ page }) => {
      await page.goto('/')
      
      await page.click('[data-testid="nav-quests"]')
      
      await expect(page).toHaveURL('/quests')
      await expect(page.locator('[data-testid="quests-page"]')).toBeVisible()
    })
  })

  test.describe('Quest Completion', () => {
    test('should complete a manual quest', async ({ page }) => {
      await page.goto('/quests')
      
      // Find an incomplete manual quest
      const incompleteQuest = page.locator('[data-testid="quest-card"]:not([data-completed="true"])').first()
      
      // Click to complete
      await incompleteQuest.locator('[data-testid="complete-button"]').click()
      
      // Should show completion animation or update
      await expect(incompleteQuest.locator('[data-testid="quest-completed"]')).toBeVisible({
        timeout: 5000,
      })
    })

    test('should update XP after quest completion', async ({ page }) => {
      await page.goto('/')
      
      // Get initial XP
      const xpDisplay = page.locator('[data-testid="xp-display"]')
      const initialXP = await xpDisplay.textContent()
      
      // Complete a quest
      const incompleteQuest = page.locator('[data-testid="quest-card"]:not([data-completed="true"])').first()
      await incompleteQuest.locator('[data-testid="complete-button"]').click()
      
      // Wait for XP update
      await page.waitForTimeout(1000)
      
      // XP should have increased
      const newXP = await xpDisplay.textContent()
      expect(newXP).not.toBe(initialXP)
    })

    test('should show quest input modal for quests with input', async ({ page }) => {
      await page.goto('/quests')
      
      // Find a quest that requires input (e.g., hydration, steps)
      const inputQuest = page.locator('[data-testid="quest-card"][data-requires-input="true"]').first()
      
      if (await inputQuest.isVisible()) {
        await inputQuest.click()
        
        // Should show input modal
        await expect(page.locator('[data-testid="quest-input-modal"]')).toBeVisible()
      }
    })
  })

  test.describe('Quest Progress', () => {
    test('should show progress bar for progressive quests', async ({ page }) => {
      await page.goto('/quests')
      
      // Find a progressive quest (steps, calories, etc.)
      const progressiveQuest = page.locator('[data-testid="quest-card"][data-type="progressive"]').first()
      
      if (await progressiveQuest.isVisible()) {
        await expect(progressiveQuest.locator('[data-testid="progress-bar"]')).toBeVisible()
      }
    })

    test('should update progress when health data syncs', async ({ page }) => {
      // This test would require mocking health data sync
      // For now, just verify the progress elements exist
      await page.goto('/quests')
      
      const progressiveQuest = page.locator('[data-testid="quest-card"][data-type="progressive"]').first()
      
      if (await progressiveQuest.isVisible()) {
        const progressText = await progressiveQuest.locator('[data-testid="progress-text"]').textContent()
        expect(progressText).toMatch(/\d+\s*\/\s*\d+/)
      }
    })
  })

  test.describe('Weekly Quests', () => {
    test('should display weekly quests section', async ({ page }) => {
      await page.goto('/quests')
      
      // Weekly quests section should exist
      await expect(page.locator('[data-testid="weekly-quests"]')).toBeVisible()
    })

    test('should show weekly quest progress', async ({ page }) => {
      await page.goto('/quests')
      
      const weeklySection = page.locator('[data-testid="weekly-quests"]')
      
      if (await weeklySection.isVisible()) {
        const weeklyQuest = weeklySection.locator('[data-testid="quest-card"]').first()
        await expect(weeklyQuest.locator('[data-testid="progress-bar"]')).toBeVisible()
      }
    })
  })
})
