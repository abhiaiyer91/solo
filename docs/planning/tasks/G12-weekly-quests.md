# G12: Implement Weekly Quests System

## Overview
Implement weekly quest functionality that tracks 7-day challenges and awards bonus XP for sustained effort.

## Context
**Source:** docs/game-systems/quests.md
**Related Docs:** MASTER_SPEC.md (Quest Types - Weekly)
**Current State:** Quest system only supports daily quests, no weekly tracking

## Acceptance Criteria
- [ ] Weekly quest templates can be created (type: 'WEEKLY')
- [ ] Weekly quests track cumulative progress over 7 days
- [ ] Weekly quest generation logic runs at week start
- [ ] Movement Week: Hit step goal 5/7 days = 75 XP
- [ ] Perfect Movement: Hit step goal 7/7 days = 150 XP
- [ ] Strength Consistency: 3 workouts minimum = 50 XP
- [ ] Recovery Focus: Hit protein 5/7 days = 50 XP
- [ ] GET /api/quests/weekly endpoint returns weekly quests

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| server/src/services/weekly-quest.ts | Create | Weekly quest tracking service |
| server/src/db/schema/game.ts | Modify | Add weekly quest tracking table if needed |
| server/src/index.ts | Modify | Add weekly quest endpoints |
| server/src/db/seed.ts | Modify | Add weekly quest templates |

## Implementation Notes
From quests.md:
- Weekly quests run Monday-Sunday
- Progress accumulates from daily quest completions
- Rewards awarded at week end or when requirements met

## Definition of Done
- [ ] All acceptance criteria met
- [ ] No TypeScript errors
- [ ] Existing tests pass
- [ ] Weekly quests appear in API response
