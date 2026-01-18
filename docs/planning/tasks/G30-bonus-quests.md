# G30: Implement Bonus Quest System

## Overview
Implement the optional bonus quest system for high-difficulty challenges. Documented in `docs/game-systems/quest-variety.md`.

## Context
**Source:** Ideation Loop analysis - documented feature not implemented
**Related Docs:** docs/game-systems/quest-variety.md
**Current State:** No bonus quest system exists

## Acceptance Criteria
- [ ] Bonus quest types: Stretch Goal (+50%), Time Challenge (+75%), Stack (+100%)
- [ ] Bonus quest slot unlocks at Level 5
- [ ] Daily bonus quest generation with reroll option
- [ ] Bonus quests are completely optional
- [ ] Weekend bonus quests are harder with higher rewards

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| server/src/services/bonus-quest.ts | Create | Bonus quest generation and types |
| server/src/db/seed-bonus-quests.ts | Create | Seed bonus quest templates |
| server/src/services/quest.ts | Modify | Include bonus quest in daily board |
| server/src/routes/quests.ts | Modify | Add reroll endpoint |

## Implementation Notes
- Stretch Goals: Exceed core quest targets (e.g., 15k steps vs 10k)
- Time Challenges: Complete with time constraint (e.g., workout before 7am)
- Stacks: Combine multiple quest completions
- Reroll costs nothing, available once per day

## Definition of Done
- [ ] All acceptance criteria met
- [ ] No TypeScript errors
- [ ] Existing tests pass
