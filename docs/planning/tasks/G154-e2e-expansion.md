# G154: E2E Test Expansion

## Overview
Expand Playwright end-to-end test coverage to cover more user flows. Currently only 4 E2E specs exist covering basic flows.

## Context
**Source:** Ideation loop --focus testing/stability
**Related Docs:** `web/e2e/*.spec.ts`, `web/playwright.config.ts`
**Current State:** auth, dashboard, quests, profile specs exist

## Acceptance Criteria
- [ ] Guild flows: Create, join, leave, view members
- [ ] Dungeon flows: Browse, enter, complete
- [ ] Title flows: View collection, equip title
- [ ] Leaderboard flows: View rankings, filter by type
- [ ] Error scenarios: Network failure, auth expiry
- [ ] Mobile viewport tests for responsive behavior
- [ ] All specs run in CI without flakiness

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| web/e2e/guilds.spec.ts | Create | Guild interaction tests |
| web/e2e/dungeons.spec.ts | Create | Dungeon flow tests |
| web/e2e/titles.spec.ts | Create | Title collection tests |
| web/e2e/leaderboard.spec.ts | Create | Leaderboard tests |
| web/e2e/errors.spec.ts | Create | Error handling tests |
| web/e2e/mobile.spec.ts | Create | Mobile viewport tests |
| web/e2e/fixtures/test-data.ts | Create | Shared test data |
| web/playwright.config.ts | Modify | Add mobile viewport projects |

## Implementation Notes

### Guild Flow Test
```typescript
test.describe('Guild Management', () => {
  test('user can create and manage a guild', async ({ page }) => {
    await page.goto('/guilds')

    // Create guild
    await page.click('button:has-text("Create Guild")')
    await page.fill('input[name="name"]', 'Test Warriors')
    await page.fill('textarea[name="description"]', 'A test guild')
    await page.click('button:has-text("Create")')

    // Verify guild created
    await expect(page.locator('h1')).toContainText('Test Warriors')

    // Invite member
    await page.click('button:has-text("Invite")')
    await page.fill('input[name="username"]', 'testuser2')
    await page.click('button:has-text("Send Invite")')

    // Verify invite sent
    await expect(page.locator('.toast')).toContainText('Invite sent')
  })
})
```

### Error Scenario Test
```typescript
test.describe('Error Handling', () => {
  test('shows error state when API fails', async ({ page }) => {
    // Intercept API and return error
    await page.route('/api/quests', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal server error' })
      })
    })

    await page.goto('/dashboard')

    // Verify error state shown
    await expect(page.locator('[data-testid="error-message"]'))
      .toContainText('Failed to load quests')

    // Verify retry button exists
    await expect(page.locator('button:has-text("Retry")')).toBeVisible()
  })

  test('handles session expiry gracefully', async ({ page }) => {
    await page.goto('/dashboard')

    // Simulate session expiry
    await page.route('/api/*', route => {
      route.fulfill({ status: 401 })
    })

    // Trigger an action
    await page.click('button:has-text("Complete Quest")')

    // Verify redirect to login
    await expect(page).toHaveURL('/login')
    await expect(page.locator('.toast')).toContainText('Session expired')
  })
})
```

### Mobile Viewport Config
```typescript
// playwright.config.ts
export default defineConfig({
  projects: [
    { name: 'Desktop Chrome', use: { ...devices['Desktop Chrome'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 13'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
  ]
})
```

## Definition of Done
- [ ] All acceptance criteria met
- [ ] Tests pass consistently (no flaky tests)
- [ ] Tests complete in under 2 minutes total
- [ ] Mobile viewport tests verify responsive behavior
- [ ] Error scenarios properly test recovery flows
