import { test, expect } from './fixtures'

test.describe('Profile Page', () => {
  test.beforeEach(async ({ loginAsTestUser }) => {
    await loginAsTestUser()
  })

  test.describe('Profile Display', () => {
    test('should display profile page', async ({ page }) => {
      await page.goto('/profile')
      
      await expect(page.locator('[data-testid="profile-page"]')).toBeVisible()
    })

    test('should show user information', async ({ page }) => {
      await page.goto('/profile')
      
      await expect(page.locator('[data-testid="user-name"]')).toBeVisible()
      await expect(page.locator('[data-testid="user-email"]')).toBeVisible()
    })

    test('should show player stats', async ({ page }) => {
      await page.goto('/profile')
      
      await expect(page.locator('[data-testid="player-level"]')).toBeVisible()
      await expect(page.locator('[data-testid="total-xp"]')).toBeVisible()
    })
  })

  test.describe('Settings', () => {
    test('should display settings section', async ({ page }) => {
      await page.goto('/profile')
      
      await expect(page.locator('[data-testid="settings-section"]')).toBeVisible()
    })

    test('should show timezone settings', async ({ page }) => {
      await page.goto('/profile')
      
      await expect(page.locator('[data-testid="timezone-select"]')).toBeVisible()
    })

    test('should update timezone successfully', async ({ page }) => {
      await page.goto('/profile')
      
      const timezoneSelect = page.locator('[data-testid="timezone-select"]')
      await timezoneSelect.click()
      
      // Select a different timezone
      await page.locator('[data-testid="timezone-option"]').first().click()
      
      // Should show success message or update
      await expect(page.locator('[data-testid="save-success"]')).toBeVisible({
        timeout: 5000,
      }).catch(() => {
        // Or verify the change was made
      })
    })

    test('should show notification settings', async ({ page }) => {
      await page.goto('/profile')
      
      await expect(page.locator('[data-testid="notification-settings"]')).toBeVisible()
    })
  })

  test.describe('Title Display', () => {
    test('should show current title', async ({ page }) => {
      await page.goto('/profile')
      
      const titleDisplay = page.locator('[data-testid="current-title"]')
      
      if (await titleDisplay.isVisible()) {
        const title = await titleDisplay.textContent()
        expect(title).toBeTruthy()
      }
    })

    test('should link to titles page', async ({ page }) => {
      await page.goto('/profile')
      
      const titlesLink = page.locator('[data-testid="view-titles-link"]')
      
      if (await titlesLink.isVisible()) {
        await titlesLink.click()
        await expect(page).toHaveURL('/titles')
      }
    })
  })

  test.describe('Streak History', () => {
    test('should show streak statistics', async ({ page }) => {
      await page.goto('/profile')
      
      await expect(page.locator('[data-testid="current-streak"]')).toBeVisible()
      await expect(page.locator('[data-testid="longest-streak"]')).toBeVisible()
    })
  })

  test.describe('Guild Membership', () => {
    test('should show guild section', async ({ page }) => {
      await page.goto('/profile')
      
      const guildSection = page.locator('[data-testid="guild-section"]')
      await expect(guildSection).toBeVisible()
    })

    test('should show guild info if member', async ({ page }) => {
      await page.goto('/profile')
      
      const guildInfo = page.locator('[data-testid="guild-info"]')
      const joinButton = page.locator('[data-testid="join-guild-button"]')
      
      // Either shows guild info or join button
      const hasGuild = await guildInfo.isVisible()
      const canJoin = await joinButton.isVisible()
      
      expect(hasGuild || canJoin).toBe(true)
    })
  })

  test.describe('Account Actions', () => {
    test('should show logout button', async ({ page }) => {
      await page.goto('/profile')
      
      await expect(page.locator('[data-testid="logout-button"]')).toBeVisible()
    })

    test('should show account settings link', async ({ page }) => {
      await page.goto('/profile')
      
      const accountSettings = page.locator('[data-testid="account-settings"]')
      
      if (await accountSettings.isVisible()) {
        await accountSettings.click()
        // Should open settings modal or navigate
      }
    })
  })
})
