# G15: Implement Dungeon System

## Overview
Implement dungeons - optional time-limited challenges with XP multipliers and cooldowns.

## Context
**Source:** docs/game-systems/dungeons.md
**Related Docs:** MASTER_SPEC.md (Dungeon schema), docs/planning/task-decomposition.md (3.2)
**Current State:** Schema has dungeons and dungeonAttempts tables, but no service or endpoints

## Acceptance Criteria
- [ ] Dungeon model with difficulty ranks (E through S), XP multiplier, duration, cooldown
- [ ] GET /api/dungeons endpoint (available dungeons)
- [ ] GET /api/dungeons/:id endpoint (dungeon details)
- [ ] POST /api/dungeons/:id/enter endpoint (start attempt)
- [ ] POST /api/dungeons/:id/progress endpoint (update progress)
- [ ] Dungeon timer logic (track time limit)
- [ ] Dungeon completion/failure detection
- [ ] XP multiplier applied to dungeon rewards (1.5x - 3.0x)
- [ ] Cooldown enforcement (default 24 hours)
- [ ] Dungeon bonuses disabled during debuff
- [ ] Seed E-Rank dungeons: Morning Protocol, Step Surge, Clean Fuel

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| server/src/services/dungeon.ts | Create | Dungeon encounter service |
| server/src/index.ts | Modify | Add dungeon endpoints |
| server/src/db/seed.ts | Modify | Seed initial dungeons |

## Implementation Notes
From dungeons.md:
- E-Rank: Level 3, 1.5x XP
- D-Rank: Level 6, 1.75x XP
- C-Rank: Level 10, 2.0x XP
- B-Rank: Level 15, 2.25x XP
- A-Rank: Level 20, 2.5x XP
- S-Rank: Level 25+, 3.0x XP

## Definition of Done
- [ ] All acceptance criteria met
- [ ] No TypeScript errors
- [ ] Existing tests pass
- [ ] At least 3 E-Rank dungeons seeded
