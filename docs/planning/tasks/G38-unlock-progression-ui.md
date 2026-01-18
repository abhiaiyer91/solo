# G38: Implement Unlock Progression UI

## Overview
Build the visual system that shows players what content is locked and the requirements to unlock it, plus celebrations when new systems become available.

## Context
**Source:** docs/overview/player-journey.md (Phase 1 shows locked systems)
**Related Docs:** docs/game-systems/README.md
**Current State:** No UI indicates locked content or progress towards unlocks

## Acceptance Criteria
- [ ] API endpoint returns unlock status for all systems
- [ ] Show locked systems with requirements (level, days, etc.)
- [ ] Show progress towards next unlock (e.g., "Level 3/5 for Boss Fights")
- [ ] Celebration modal when content unlocks
- [ ] Unlock celebrations include narrative text
- [ ] Profile/Settings shows full unlock progression

## Unlock Requirements (from player-journey.md)
| Milestone | Unlocks |
|-----------|---------|
| Account Creation | Daily quests, basic stats, XP |
| Day 7 | Weekly quests, 7-day streak bonus |
| Level 3 | E-Rank dungeons |
| Level 5 | Boss fights, first titles |
| Level 6 | D-Rank dungeons |
| Day 14 | 14-day streak bonus |
| Level 10 | C-Rank dungeons, Boss 2 |
| Day 30 | 30-day streak bonus |
| Level 15 | B-Rank dungeons |
| Season 2 | Leaderboards, harder content |
| Level 20 | A-Rank dungeons, Boss 3 |
| Season 3 | S-Rank dungeons, legacy titles |

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| server/src/services/progression.ts | Create | Calculate unlock status |
| server/src/routes/player.ts | Modify | Add /api/player/unlocks endpoint |
| web/src/hooks/useUnlocks.ts | Create | Hook for unlock data |
| web/src/components/UnlockProgress.tsx | Create | Progress towards unlocks |
| web/src/components/UnlockCelebration.tsx | Create | Modal for new unlocks |
| web/src/pages/Dashboard.tsx | Modify | Show locked systems indicator |

## Implementation Notes
- Track `lastSeenUnlocks` on user to detect new unlocks
- Compare current unlocks vs lastSeen to trigger celebration
- Show next 2-3 upcoming unlocks in progression view
- Narrative examples:
  - Dungeon unlock: "UNSTABLE ZONE DETECTED - You have reached sufficient level to enter E-Rank dungeons."
  - Boss unlock: "THREAT DETECTED - A pattern has been identified in your history."

## Definition of Done
- [ ] All acceptance criteria met
- [ ] No TypeScript errors
- [ ] Locked content is clearly indicated
- [ ] Unlock celebrations are satisfying
