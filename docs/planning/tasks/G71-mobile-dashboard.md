# G71: Mobile Dashboard Screen

## Overview
Build the main dashboard screen for the mobile app that displays today's quests, progress, streak status, and XP information.

## Context
**Source:** Ideation loop Cycle 4 - Mobile completeness analysis
**Related Docs:** docs/frontend/daily-rhythm.md, docs/game-systems/quests.md
**Current State:** Mobile app has foundation, hooks, and 3 basic components but no Dashboard screen

## Acceptance Criteria
- [ ] Dashboard displays today's quests with completion status
- [ ] Shows XP progress bar toward next level
- [ ] Displays current streak with fire animation
- [ ] Shows debuff status if active
- [ ] Pulls data from existing `/api/quests` and `/api/player/me` endpoints
- [ ] Implements pull-to-refresh for manual sync
- [ ] Matches System aesthetic (dark theme, cold but not cruel)

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| mobile/src/screens/Dashboard.tsx | Create | Main dashboard screen |
| mobile/src/components/QuestList.tsx | Create | Quest list component |
| mobile/src/components/ProgressBar.tsx | Create | XP progress bar |
| mobile/src/components/StreakBadge.tsx | Create | Streak display with animation |
| mobile/src/hooks/useDashboard.ts | Create | Dashboard data hook |

## Implementation Notes
- Reuse useQuests and usePlayer hooks
- Use React Native's RefreshControl for pull-to-refresh
- Match styling from web dashboard components
- Consider time-of-day based greeting from daily-rhythm.md

## Definition of Done
- [ ] All acceptance criteria met
- [ ] No TypeScript errors
- [ ] Works on iOS simulator
- [ ] Existing tests pass
