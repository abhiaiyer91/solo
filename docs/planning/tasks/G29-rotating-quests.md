# G29: Implement Rotating Quest System

## Overview
Implement the rotating quest system that adds daily variety to the quest board. Documented in `docs/game-systems/quest-variety.md`.

## Context
**Source:** Ideation Loop analysis - documented feature not implemented
**Related Docs:** docs/game-systems/quest-variety.md
**Current State:** Only core quests exist, no rotating quest pool or selection

## Acceptance Criteria
- [ ] Rotating quest pool defined (15+ quest types)
- [ ] Quest selection algorithm based on recency, player stats, day of week
- [ ] Rotating quest slot unlocks at Day 8
- [ ] Rotating quests are optional (don't affect streak)
- [ ] Quest completion awards XP and affects related stats

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| server/src/services/rotating-quest.ts | Create | Rotating quest selection and pool |
| server/src/db/seed-rotating-quests.ts | Create | Seed rotating quest templates |
| server/src/services/quest.ts | Modify | Include rotating quest in daily generation |
| server/src/routes/quests.ts | Modify | Support rotating quest endpoints |

## Implementation Notes
- Quest pool includes: Hydration, Stretch, Alcohol-Free, Screen Sunset, Morning Movement, Meditation, Cold Exposure, etc.
- Selection weights: recency (not in last 3 days), weak stats, day patterns
- Rotating quests have `isCore: false` flag

## Definition of Done
- [ ] All acceptance criteria met
- [ ] No TypeScript errors
- [ ] Existing tests pass
