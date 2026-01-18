# G33: Implement Raid Boss System

## Overview
Implement collaborative raid bosses that require multiple players to defeat. Documented in `docs/game-systems/social.md`.

## Context
**Source:** Ideation Loop analysis - documented feature not implemented
**Related Docs:** docs/game-systems/social.md
**Current State:** No raid system exists, only solo boss fights

## Acceptance Criteria
- [ ] Raid schema tables (raids, raidMembers)
- [ ] Raid formation and joining logic
- [ ] Raid phases with collective requirements
- [ ] If ANY raider fails ANY phase, raid fails for everyone
- [ ] Raid completion awards XP and title to all participants

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| server/src/db/schema/social.ts | Modify | Add raids, raidMembers tables |
| server/src/services/raid.ts | Create | Raid formation and progress |
| server/src/routes/raids.ts | Create | Raid API endpoints |
| server/src/db/seed-raid-bosses.ts | Create | Seed raid boss content |

## Implementation Notes
- 3-5 players per raid
- All must be Level 10+ and have defeated Boss 1
- Phases: Coordination (3 days), Surge (1 day), Endurance (5 days), Finisher (1 day)
- Reward: 500 XP per member + "Raid Survivor" title

## Definition of Done
- [ ] All acceptance criteria met
- [ ] No TypeScript errors
- [ ] Existing tests pass
