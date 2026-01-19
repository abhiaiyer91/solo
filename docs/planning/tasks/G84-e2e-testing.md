# G84: End-to-End Test Suite

## Overview
Implement end-to-end testing infrastructure and critical path tests for the web application using Playwright.

## Context
**Source:** Ideation loop Cycle 10 - Integration analysis
**Related Docs:** None (new infrastructure)
**Current State:** Unit tests exist, but no E2E tests

## Acceptance Criteria
- [ ] Playwright configured for web app
- [ ] Test database/environment setup
- [ ] Auth flow tests (login, signup, logout)
- [ ] Quest completion flow test
- [ ] Dashboard data loading test
- [ ] Profile settings update test
- [ ] CI integration for E2E tests

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| web/playwright.config.ts | Create | Playwright config |
| web/e2e/auth.spec.ts | Create | Auth flow tests |
| web/e2e/quests.spec.ts | Create | Quest flow tests |
| web/e2e/dashboard.spec.ts | Create | Dashboard tests |
| web/e2e/profile.spec.ts | Create | Profile tests |
| web/e2e/fixtures/index.ts | Create | Test fixtures |
| .github/workflows/e2e.yml | Create | E2E CI workflow |

## Implementation Notes
- Use Playwright Test for cross-browser support
- Set up test database with seed data
- Consider using MSW for API mocking in some tests
- Run E2E tests on PR merge, not every commit

## Definition of Done
- [ ] All acceptance criteria met
- [ ] E2E tests pass locally
- [ ] E2E tests run in CI
- [ ] No flaky tests
