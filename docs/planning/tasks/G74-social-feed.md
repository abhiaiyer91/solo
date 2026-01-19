# G74: Social Activity Feed

## Overview
Implement the optional social activity feed showing boss defeats, title unlocks, streak milestones, and high-rank dungeon completions from other players.

## Context
**Source:** Ideation loop Cycle 6 - Frontend pages analysis
**Related Docs:** docs/game-systems/social.md (section 6: Social Feed)
**Current State:** Backend has leaderboard/shadows but no activity feed

## Acceptance Criteria
- [ ] Activity feed page showing recent achievements
- [ ] Feed shows: boss defeats, title unlocks, streak milestones (30/60/90/365), dungeon B+ completions
- [ ] Feed does NOT show: daily completions, XP gains, failures, streak breaks
- [ ] User can toggle "show mine" / "hide mine" visibility
- [ ] User can enable/disable viewing the feed
- [ ] Infinite scroll for loading more entries
- [ ] Anonymous display for users without public username

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| server/src/routes/feed.ts | Create | Activity feed endpoints |
| server/src/services/feed.ts | Create | Feed aggregation service |
| server/src/db/schema/social.ts | Modify | Add activity_feed table if needed |
| web/src/pages/Feed.tsx | Create | Activity feed page |
| web/src/components/feed/FeedItem.tsx | Create | Individual feed item |
| web/src/hooks/useFeed.ts | Create | Feed data hook |

## Implementation Notes
- Per social.md: Feed is opt-in, not default
- Use leaderboard preferences for visibility settings
- Consider caching for performance
- System narrative voice for feed items (cold, observational)

## Definition of Done
- [ ] All acceptance criteria met
- [ ] No TypeScript errors
- [ ] Feed respects privacy settings
- [ ] Existing tests pass
