# G130: Mobile Leaderboard Screen

## Overview

Build mobile leaderboard screen with weekly/all-time rankings, friend leaderboards, and guild comparisons.

## Context

**Source:** Mobile parity analysis
**Current State:** Web has full leaderboard; mobile has none
**Dependencies:** Backend leaderboard already complete

## Acceptance Criteria

- [ ] Weekly and all-time leaderboard tabs
- [ ] Player ranking with position indicator
- [ ] Friend leaderboard filter (if accountability partners exist)
- [ ] Guild leaderboard view
- [ ] Pull-to-refresh
- [ ] Your position highlighted/pinned
- [ ] Tap user to view mini-profile
- [ ] Privacy indicator for opted-out users

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| mobile/src/screens/Leaderboard.tsx | Create | Main leaderboard screen |
| mobile/src/components/LeaderboardRow.tsx | Create | Individual ranking row |
| mobile/src/components/LeaderboardTabs.tsx | Create | Tab navigation |
| mobile/src/hooks/useLeaderboard.ts | Create | Leaderboard data hook |
| mobile/src/navigation/index.tsx | Modify | Add leaderboard to navigation |

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Smooth scrolling with large lists
- [ ] Loading and error states
- [ ] Consistent with app design language
- [ ] No TypeScript errors
