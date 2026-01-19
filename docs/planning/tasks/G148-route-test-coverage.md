# G148: API Route Test Coverage

## Overview
Add comprehensive unit tests for high-traffic API routes to ensure stability and catch regressions early. Currently only 2 of 21 routes have tests (10% coverage).

## Context
**Source:** Ideation loop --focus testing/stability
**Related Docs:** `server/src/routes/*.ts`, `server/vitest.config.ts`
**Current State:** Only `quests.test.ts` and `player.test.ts` exist

## Acceptance Criteria
- [ ] Tests for `health.ts` routes (sync, today, history)
- [ ] Tests for `stats.ts` routes (player stats, leaderboard)
- [ ] Tests for `guilds.ts` routes (CRUD, membership)
- [ ] Tests for `notifications.ts` routes (preferences, send)
- [ ] Tests for `onboarding.ts` routes (baseline, progress)
- [ ] Tests for `seasons.ts` routes (current, history)
- [ ] Each route file has >80% line coverage
- [ ] Mock database and external services appropriately
- [ ] Include both success and error scenarios

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| server/src/routes/health.test.ts | Create | Health sync route tests |
| server/src/routes/stats.test.ts | Create | Stats route tests |
| server/src/routes/guilds.test.ts | Create | Guild route tests |
| server/src/routes/notifications.test.ts | Create | Notification route tests |
| server/src/routes/onboarding.test.ts | Create | Onboarding route tests |
| server/src/routes/seasons.test.ts | Create | Season route tests |
| server/src/test/fixtures/routes.ts | Create | Shared route test fixtures |
| server/src/test/helpers/request.ts | Create | Request helper utilities |

## Implementation Notes
- Use `supertest` for HTTP request testing
- Mock Drizzle database with `vitest` mocks
- Create shared fixtures for common test data (users, quests, etc.)
- Test authentication middleware integration
- Test rate limiting behavior
- Verify response shapes match expected types

## Testing Priorities
1. **Health routes** - Core data flow for HealthKit integration
2. **Stats routes** - User-facing data accuracy
3. **Guild routes** - Social feature stability
4. **Notification routes** - Push delivery reliability

## Definition of Done
- [ ] All acceptance criteria met
- [ ] No TypeScript errors
- [ ] All tests pass
- [ ] Coverage report shows >80% for tested routes
- [ ] PR includes coverage diff
