# G23: Implement Leaderboards System

## Overview
Create global, regional, and seasonal leaderboards with anonymous-by-default rankings.

## Context
**Source:** docs/game-systems/social.md (Rankings section)
**Related Docs:** docs/planning/task-decomposition.md (3.5)
**Current State:** No leaderboard tables or endpoints exist

## Acceptance Criteria
- [ ] Add leaderboard-related fields to user model (opt-in display name)
- [ ] GET /api/leaderboards/global endpoint (top 100 by total XP)
- [ ] GET /api/leaderboards/weekly endpoint (top by weekly XP)
- [ ] GET /api/leaderboards/seasonal endpoint (top by seasonal XP)
- [ ] GET /api/leaderboards/me endpoint (player's rank in each board)
- [ ] Anonymous display by default (show "Player #12847")
- [ ] Opt-in to show username
- [ ] Pagination support
- [ ] Build LeaderboardPage component
- [ ] Add leaderboard link to navigation

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| server/src/db/schema/game.ts | Modify | Add display preferences |
| server/src/services/leaderboard.ts | Create | Leaderboard queries |
| server/src/index.ts | Modify | Add leaderboard endpoints |
| web/src/pages/Leaderboard.tsx | Create | Leaderboard page |
| web/src/components/LeaderboardTable.tsx | Create | Ranking table component |

## Implementation Notes
From social.md:
- Rankings are anonymous by default for privacy
- Players can opt-in to show their username
- Show "You are ranked #X" indicator
- Seasonal leaderboards reset each season

## Definition of Done
- [ ] All acceptance criteria met
- [ ] No TypeScript errors
- [ ] Leaderboard accessible from navigation
- [ ] Player can see their rank
