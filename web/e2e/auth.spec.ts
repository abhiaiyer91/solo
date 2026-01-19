import { test, expect, generateTestUser, TEST_USER } from './fixtures'

test.describe('Authentication Flow', () => {
  test.describe('Login', () => {
    test('should display login form', async ({ page }) => {
      await page.goto('/login')
      
      await expect(page.locator('input[name="email"]')).toBeVisible()
      await expect(page.locator('input[name="password"]')).toBeVisible()
      await expect(page.locator('button[type="submit"]')).toBeVisible()
    })

    test('should show error for invalid credentials', async ({ page }) => {
      await page.goto('/login')
      
      await page.fill('input[name="email"]', 'invalid@example.com')
      await page.fill('input[name="password"]', 'wrongpassword')
      await page.click('button[type="submit"]')
      
      // Should show error message
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible()
    })

    test('should login successfully with valid credentials', async ({ page, loginAsTestUser }) => {
      await loginAsTestUser()
      
      // Should be on dashboard
      await expect(page).toHaveURL('/')
      
      // Should show user greeting or dashboard content
      await expect(page.locator('[data-testid="dashboard"]')).toBeVisible()
    })

    test('should persist session after page refresh', async ({ page, loginAsTestUser }) => {
      await loginAsTestUser()
      
      // Refresh the page
      await page.reload()
      
      // Should still be on dashboard
      await expect(page).toHaveURL('/')
      await expect(page.locator('[data-testid="dashboard"]')).toBeVisible()
    })
  })

  test.describe('Signup', () => {
    test('should display signup form', async ({ page }) => {
      await page.goto('/signup')
      
      await expect(page.locator('input[name="name"]')).toBeVisible()
      await expect(page.locator('input[name="email"]')).toBeVisible()
      await expect(page.locator('input[name="password"]')).toBeVisible()
      await expect(page.locator('button[type="submit"]')).toBeVisible()
    })

    test('should show validation errors for invalid input', async ({ page }) => {
      await page.goto('/signup')
      
      // Submit with empty fields
      await page.click('button[type="submit"]')
      
      // Should show validation errors
      await expect(page.locator('[data-testid="validation-error"]').first()).toBeVisible()
    })

    test('should show error for existing email', async ({ page }) => {
      await page.goto('/signup')
      
      await page.fill('input[name="name"]', 'Test User')
      await page.fill('input[name="email"]', TEST_USER.email)
      await page.fill('input[name="password"]', 'Password123!')
      await page.click('button[type="submit"]')
      
      // Should show error about existing email
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible()
    })

    test('should create account and redirect to onboarding', async ({ page }) => {
      const newUser = generateTestUser()
      
      await page.goto('/signup')
      
      await page.fill('input[name="name"]', newUser.name)
      await page.fill('input[name="email"]', newUser.email)
      await page.fill('input[name="password"]', newUser.password)
      await page.click('button[type="submit"]')
      
      // Should redirect to onboarding
      await expect(page).toHaveURL('/onboarding', { timeout: 10000 })
    })
  })

  test.describe('Logout', () => {
    test('should logout successfully', async ({ page, loginAsTestUser, logout }) => {
      await loginAsTestUser()
      
      await logout()
      
      // Should be on login page
      await expect(page).toHaveURL('/login')
    })

    test('should clear session on logout', async ({ page, loginAsTestUser, logout, getAuthToken }) => {
      await loginAsTestUser()
      
      // Verify token exists
      const tokenBefore = await getAuthToken()
      expect(tokenBefore).toBeTruthy()
      
      await logout()
      
      // Token should be cleared
      const tokenAfter = await getAuthToken()
      expect(tokenAfter).toBeNull()
    })
  })

  test.describe('Protected Routes', () => {
    test('should redirect to login when not authenticated', async ({ page }) => {
      await page.goto('/')
      
      // Should redirect to login
      await expect(page).toHaveURL('/login')
    })

    test('should redirect to login when accessing profile', async ({ page }) => {
      await page.goto('/profile')
      
      // Should redirect to login
      await expect(page).toHaveURL('/login')
    })

    test('should redirect to login when accessing stats', async ({ page }) => {
      await page.goto('/stats')
      
      // Should redirect to login
      await expect(page).toHaveURL('/login')
    })
  })
})
