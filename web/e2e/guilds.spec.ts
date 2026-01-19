import { test, expect } from './fixtures'

test.describe('Guild System', () => {
  test.beforeEach(async ({ loginAsTestUser }) => {
    await loginAsTestUser()
  })

  test.describe('Guild Browsing', () => {
    test('should display guilds list', async ({ page }) => {
      await page.goto('/guilds')

      // Guild list should be visible
      await expect(page.locator('[data-testid="guilds-page"]')).toBeVisible()

      // Should show guild cards or empty state
      const guildCards = page.locator('[data-testid="guild-card"]')
      const emptyState = page.locator('[data-testid="no-guilds"]')

      await expect(guildCards.first().or(emptyState)).toBeVisible()
    })

    test('should show guild details on card', async ({ page }) => {
      await page.goto('/guilds')

      const firstGuild = page.locator('[data-testid="guild-card"]').first()

      if (await firstGuild.isVisible()) {
        // Should show guild name
        await expect(firstGuild.locator('[data-testid="guild-name"]')).toBeVisible()

        // Should show member count
        await expect(firstGuild.locator('[data-testid="member-count"]')).toBeVisible()
      }
    })

    test('should navigate to guild detail page', async ({ page }) => {
      await page.goto('/guilds')

      const firstGuild = page.locator('[data-testid="guild-card"]').first()

      if (await firstGuild.isVisible()) {
        await firstGuild.click()

        // Should navigate to guild detail
        await expect(page).toHaveURL(/\/guilds\//)
        await expect(page.locator('[data-testid="guild-detail"]')).toBeVisible()
      }
    })
  })

  test.describe('Guild Creation', () => {
    test('should open create guild modal', async ({ page }) => {
      await page.goto('/guilds')

      await page.click('[data-testid="create-guild-button"]')

      // Modal should appear
      await expect(page.locator('[data-testid="create-guild-modal"]')).toBeVisible()
    })

    test('should validate guild name input', async ({ page }) => {
      await page.goto('/guilds')

      await page.click('[data-testid="create-guild-button"]')

      // Try to submit with empty name
      await page.click('[data-testid="submit-guild"]')

      // Should show validation error
      await expect(page.locator('[data-testid="name-error"]')).toBeVisible()
    })

    test('should create a guild with valid input', async ({ page }) => {
      await page.goto('/guilds')

      await page.click('[data-testid="create-guild-button"]')

      // Fill in guild details
      const guildName = `Test Guild ${Date.now()}`
      await page.fill('[data-testid="guild-name-input"]', guildName)
      await page.fill('[data-testid="guild-description-input"]', 'A test guild for E2E testing')

      // Submit
      await page.click('[data-testid="submit-guild"]')

      // Should show success or redirect to new guild
      await expect(page.locator(`text=${guildName}`)).toBeVisible({ timeout: 5000 })
    })
  })

  test.describe('Guild Membership', () => {
    test('should join a public guild', async ({ page }) => {
      await page.goto('/guilds')

      // Find a public guild with join button
      const joinButton = page.locator('[data-testid="join-guild-button"]').first()

      if (await joinButton.isVisible()) {
        await joinButton.click()

        // Should show success notification
        await expect(page.locator('[data-testid="toast"]').or(page.locator('.toast'))).toContainText(
          /joined|success/i
        )
      }
    })

    test('should leave a guild', async ({ page }) => {
      // Navigate to a guild the user is part of
      await page.goto('/guilds/my')

      const leaveButton = page.locator('[data-testid="leave-guild-button"]')

      if (await leaveButton.isVisible()) {
        await leaveButton.click()

        // Confirm leave
        await page.click('[data-testid="confirm-leave"]')

        // Should show left notification
        await expect(page.locator('[data-testid="toast"]').or(page.locator('.toast'))).toContainText(
          /left|removed/i
        )
      }
    })

    test('should view guild members', async ({ page }) => {
      await page.goto('/guilds')

      const firstGuild = page.locator('[data-testid="guild-card"]').first()

      if (await firstGuild.isVisible()) {
        await firstGuild.click()

        // Should see members section
        await expect(page.locator('[data-testid="guild-members"]')).toBeVisible()

        // Should see at least the leader
        await expect(page.locator('[data-testid="member-row"]').first()).toBeVisible()
      }
    })
  })
})
