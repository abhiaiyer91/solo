# G46: Service Test Coverage

## Overview
Add unit tests for services currently without test coverage to improve code reliability and prevent regressions.

## Context
**Source:** Codebase analysis
**Related Docs:** G36-test-infrastructure.md (in progress)
**Current State:** 7 services have tests, 13 services lack tests

## Services Needing Tests
| Service | Priority | Complexity |
|---------|----------|------------|
| xp.ts | P1 | High (core calculation) |
| weekly-quest.ts | P1 | Medium |
| rotating-quest.ts | P1 | Medium |
| debuff.ts | P1 | Medium |
| title.ts | P2 | Medium |
| season.ts | P2 | Medium |
| guild.ts | P2 | High |
| health.ts | P2 | Medium |
| notification.ts | P2 | Medium |
| leaderboard.ts | P2 | Medium |
| progression.ts | P2 | Medium |
| return-protocol.ts | P2 | Medium |
| daily-log.ts | P3 | Medium |

## Acceptance Criteria
- [ ] At least 5 critical services have test files
- [ ] xp.ts has comprehensive tests (XP calculation, bonuses, modifiers)
- [ ] debuff.ts has tests (trigger conditions, duration)
- [ ] rotating-quest.ts has tests (selection algorithm, weighting)
- [ ] weekly-quest.ts has tests (weekly tracking, reset)
- [ ] Each test file covers happy path and edge cases

## Files to Create
| File | Description |
|------|-------------|
| server/src/services/xp.test.ts | XP calculation tests |
| server/src/services/debuff.test.ts | Debuff system tests |
| server/src/services/rotating-quest.test.ts | Rotating quest tests |
| server/src/services/weekly-quest.test.ts | Weekly quest tests |
| server/src/services/title.test.ts | Title system tests |

## Implementation Notes
- Use vitest (already configured)
- Mock database calls using vi.mock
- Test both success and error paths
- Focus on business logic, not framework code

## Definition of Done
- [ ] All acceptance criteria met
- [ ] All new tests pass
- [ ] No regressions in existing tests
