# G16: Implement Season System

## Overview
Implement seasons that represent phases of becoming with XP multipliers and seasonal leaderboards.

## Context
**Source:** docs/game-systems/seasons.md
**Related Docs:** MASTER_SPEC.md (Season schema), docs/planning/task-decomposition.md (3.3)
**Current State:** Schema has seasons, seasonParticipations, seasonLeaderboards tables, but no service

## Acceptance Criteria
- [ ] Season model with status (UPCOMING, ACTIVE, ENDED), XP multiplier
- [ ] GET /api/seasons/current endpoint
- [ ] GET /api/seasons/:id/leaderboard endpoint
- [ ] GET /api/seasons/history endpoint
- [ ] Season XP multiplier applied to all XP gains
- [ ] Seasonal XP tracked separately from total XP
- [ ] Season transitions based on level or days
- [ ] Seed 3 seasons: Awakening (1.0x), The Contender (1.1x), The Monarch (1.2x)

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| server/src/services/season.ts | Create | Season management service |
| server/src/services/xp.ts | Modify | Apply season multiplier |
| server/src/index.ts | Modify | Add season endpoints |
| server/src/db/seed.ts | Modify | Seed initial seasons |

## Implementation Notes
From seasons.md:
- Season 1 Awakening: Foundation, 1.0x XP, E-D rank dungeons
- Season 2 The Contender: Challenge, 1.1x XP, C-B rank dungeons, Boss 1-2
- Season 3 The Monarch: Mastery, 1.2x XP, A-S rank dungeons, Boss 3
- Transition: Level 15 or Day 60 (S1→S2), Level 25 or Day 120 (S2→S3)
- Stats persist across seasons, only challenges change

## Definition of Done
- [ ] All acceptance criteria met
- [ ] No TypeScript errors
- [ ] Existing tests pass
- [ ] All 3 seasons seeded
