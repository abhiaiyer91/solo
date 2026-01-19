# G80: Extended Service Test Coverage

## Overview
Add unit tests for backend services that currently lack test coverage, building on the existing Vitest infrastructure.

## Context
**Source:** Ideation loop Cycle 3 - Test coverage analysis
**Related Docs:** server/src/services/*.test.ts (existing patterns)
**Current State:** 16 test files exist, but ~20 services lack tests

## Acceptance Criteria
- [ ] Tests for guild.ts service
- [ ] Tests for accountability.ts service
- [ ] Tests for notification.ts service
- [ ] Tests for return-protocol.ts service
- [ ] Tests for archive.ts service
- [ ] Tests for psychology.ts service
- [ ] Tests for raid.ts service
- [ ] Tests for hard-mode.ts service
- [ ] Tests for daily-log.ts service
- [ ] Tests for progression.ts service
- [ ] All tests achieve 70%+ coverage for their service

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| server/src/services/guild.test.ts | Create | Guild service tests |
| server/src/services/accountability.test.ts | Create | Accountability tests |
| server/src/services/notification.test.ts | Create | Notification tests |
| server/src/services/return-protocol.test.ts | Create | Return protocol tests |
| server/src/services/archive.test.ts | Create | Archive service tests |
| server/src/services/psychology.test.ts | Create | Psychology tests |
| server/src/services/raid.test.ts | Create | Raid service tests |
| server/src/services/hard-mode.test.ts | Create | Hard mode tests |
| server/src/services/daily-log.test.ts | Create | Daily log tests |
| server/src/services/progression.test.ts | Create | Progression tests |

## Implementation Notes
- Follow existing test patterns (mock db, test edge cases)
- Focus on business logic, not database queries
- Test error cases and boundary conditions
- Use describe/it structure for clarity

## Definition of Done
- [ ] All acceptance criteria met
- [ ] All new tests pass
- [ ] Coverage report shows improvement
- [ ] No TypeScript errors
