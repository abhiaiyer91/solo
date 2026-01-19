# G73: Mobile App Navigation

## Overview
Implement the full navigation structure for the mobile app including tab navigator, stack navigators, and screen transitions.

## Context
**Source:** Ideation loop Cycle 4 - Mobile completeness analysis
**Related Docs:** docs/mobile/README.md
**Current State:** Mobile app has no navigation setup despite Expo foundation

## Acceptance Criteria
- [ ] Bottom tab navigator with Dashboard, Quests, Stats, Profile tabs
- [ ] Stack navigators for each tab allowing drill-down
- [ ] Authentication flow (Login → Main app)
- [ ] Modal screens for quest input, dungeon entry, etc.
- [ ] Proper back navigation handling
- [ ] Tab bar icons matching app aesthetic

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| mobile/src/navigation/RootNavigator.tsx | Create | Root navigation container |
| mobile/src/navigation/TabNavigator.tsx | Create | Bottom tab navigator |
| mobile/src/navigation/AuthNavigator.tsx | Create | Auth flow stack |
| mobile/src/navigation/DashboardStack.tsx | Create | Dashboard stack |
| mobile/src/navigation/QuestsStack.tsx | Create | Quests stack |
| mobile/src/navigation/types.ts | Create | Navigation type definitions |

## Implementation Notes
- Use @react-navigation/native with @react-navigation/bottom-tabs
- Authentication state from existing auth store
- Consider expo-router as alternative if already scaffolded

## Definition of Done
- [ ] All acceptance criteria met
- [ ] No TypeScript errors
- [ ] Navigation works smoothly on iOS
- [ ] Type-safe navigation with TypeScript
