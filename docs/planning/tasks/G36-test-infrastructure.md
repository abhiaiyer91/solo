# G36: Set Up Test Infrastructure

## Overview
Add testing infrastructure for both backend and frontend code.

## Context
**Source:** Ideation Loop analysis - 0 test files found in codebase
**Related Docs:** N/A
**Current State:** No test files, test config, or test scripts exist

## Acceptance Criteria
- [ ] Vitest configured for both server and web packages
- [ ] Test scripts added to package.json
- [ ] At least one test file per critical service
- [ ] CI-ready test configuration

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| server/vitest.config.ts | Create | Vitest config for backend |
| web/vitest.config.ts | Create | Vitest config for frontend |
| server/src/services/level.test.ts | Create | Level calculation tests |
| server/src/services/streak.test.ts | Create | Streak calculation tests |
| server/package.json | Modify | Add test scripts |
| web/package.json | Modify | Add test scripts |

## Implementation Notes
- Vitest chosen for consistency with Vite toolchain
- Start with pure function tests (level, streak calculations)
- Database tests can use in-memory SQLite or test database
- Frontend tests can use @testing-library/react

## Definition of Done
- [ ] All acceptance criteria met
- [ ] Tests pass with `npm test`
- [ ] No TypeScript errors
