# G14: Implement Boss Fight System

## Overview
Implement boss fights - identity checkpoints defeated through sustained compliance over weeks.

## Context
**Source:** docs/game-systems/bosses.md
**Related Docs:** MASTER_SPEC.md (Boss schema), docs/planning/task-decomposition.md (3.1)
**Current State:** Schema has bosses, bossPhases, bossAttempts tables, but no service or endpoints

## Acceptance Criteria
- [ ] Boss model with phases, difficulty, XP reward, title reward
- [ ] GET /api/bosses endpoint (available bosses)
- [ ] GET /api/bosses/:id endpoint (boss details)
- [ ] POST /api/bosses/:id/start endpoint (begin encounter)
- [ ] GET /api/bosses/:id/attempt endpoint (current attempt status)
- [ ] POST /api/bosses/:id/abandon endpoint (abandon encounter)
- [ ] Boss phase progression logic
- [ ] Boss victory/defeat detection
- [ ] Only one boss can be in progress at a time
- [ ] Seed 3 bosses: The Inconsistent One, The Excuse Maker, The Comfortable Self

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| server/src/services/boss.ts | Create | Boss encounter service |
| server/src/index.ts | Modify | Add boss endpoints |
| server/src/db/seed.ts | Modify | Seed bosses and phases |

## Implementation Notes
From bosses.md:
- The Inconsistent One: Level 5, 21 days, 500 XP (3 phases of 7 days each)
- The Excuse Maker: Level 10, 21 days, 1000 XP (phases with perfect day requirements)
- The Comfortable Self: Level 20, 42 days, 2500 XP (requires dungeon clears + streaks)
- Failed phases can be restarted without losing progress
- Boss requirements evaluated daily

## Definition of Done
- [ ] All acceptance criteria met
- [ ] No TypeScript errors
- [ ] Existing tests pass
- [ ] All 3 bosses with phases seeded
