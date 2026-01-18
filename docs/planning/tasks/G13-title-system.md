# G13: Implement Title System

## Overview
Implement the titles and passives system that awards achievement titles with passive bonuses when equipped.

## Context
**Source:** docs/game-systems/titles.md
**Related Docs:** MASTER_SPEC.md (Titles & Passives schema), docs/planning/task-decomposition.md (2.2)
**Current State:** Schema has titles and userTitles tables, but no service or evaluation logic

## Acceptance Criteria
- [ ] Title model with condition types (STREAK_DAYS, CUMULATIVE_COUNT, TIME_WINDOW, etc.)
- [ ] Title condition evaluator service
- [ ] Passive effect types (FLAT_XP_BONUS, PERCENT_XP_BONUS, STAT_BONUS, DEBUFF_REDUCTION)
- [ ] GET /api/player/titles endpoint
- [ ] PUT /api/player/title/active endpoint to equip title
- [ ] Title unlock detection on quest/streak events
- [ ] Title regression for titles that can regress
- [ ] Seed initial titles (The Beginner, The Consistent, Iron Will, Centurion, etc.)

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| server/src/services/title.ts | Create | Title evaluation and management service |
| server/src/services/xp.ts | Modify | Apply title passive bonuses to XP |
| server/src/index.ts | Modify | Add title endpoints |
| server/src/db/seed.ts | Modify | Seed initial titles |

## Implementation Notes
From titles.md:
- Only one title can be active at a time
- Active title's passive effect applies to all XP gains
- Some titles can regress (e.g., The Consistent when streak breaks)
- Rarity: COMMON, UNCOMMON, RARE, EPIC, LEGENDARY

## Definition of Done
- [ ] All acceptance criteria met
- [ ] No TypeScript errors
- [ ] Existing tests pass
- [ ] At least 8 titles seeded
