# G40: Seasonal Quests UI

## Overview
Display seasonal quests in the dashboard and quests page. Seasonal quests are special objectives tied to the current season theme that provide bonus XP and progression.

## Context
**Source:** docs/game-systems/quest-variety.md
**Related Docs:** docs/game-systems/seasons.md
**Current State:** Backend has season system, frontend shows quests but not seasonal slot

## Acceptance Criteria
- [ ] Seasonal quest section displays on Dashboard when season is active
- [ ] Seasonal quest shows season name and theme
- [ ] Progress tracking for weekly seasonal objectives
- [ ] Completion UI with seasonal reward display
- [ ] Empty state when no active season

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| web/src/components/quest/SeasonalQuest.tsx | Create | Seasonal quest card component |
| web/src/hooks/useSeasonalQuests.ts | Create | Hook for seasonal quest data |
| web/src/pages/Dashboard.tsx | Modify | Add seasonal quest section |
| server/src/routes/seasons.ts | Modify | Add seasonal quest endpoint if needed |

## Implementation Notes
From quest-variety.md:
- Seasonal quests unlock in Season 2+
- They have weekly frequency (e.g., "Morning Dominance 3x this week")
- Show progress like "1/3 early workouts"
- Reward includes XP + season-specific badges

## Definition of Done
- [ ] All acceptance criteria met
- [ ] No TypeScript errors
- [ ] Existing tests pass
