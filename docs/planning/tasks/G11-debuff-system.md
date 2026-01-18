# G11: Implement Debuff System

## Overview
Implement the debuff system that applies a -10% XP penalty when a player misses 2+ core dailies in a single day.

## Context
**Source:** docs/game-systems/streaks-debuffs.md
**Related Docs:** MASTER_SPEC.md (Section 1 - Debuff Day)
**Current State:** User model has `debuffActiveUntil` field, but no service triggers or evaluates debuffs

## Acceptance Criteria
- [ ] Debuff triggers when player misses 2+ core dailies in a day
- [ ] Debuff lasts exactly 24 hours
- [ ] -10% XP modifier applied during debuff period
- [ ] Dungeon bonuses disabled while debuff is active
- [ ] Debuff status visible in player data
- [ ] Debuff expiration handled automatically

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| server/src/services/debuff.ts | Create | Debuff trigger and check service |
| server/src/services/xp.ts | Modify | Add debuff modifier to XP calculation |
| server/src/index.ts | Modify | Add debuff status to player endpoint |

## Implementation Notes
From streaks-debuffs.md:
- Trigger: Miss 2+ core dailies
- Effect: -10% XP for 24 hours, dungeon bonuses disabled
- Duration: Automatically expires after 24 hours
- Completing all dailies the next day doesn't remove it early

## Definition of Done
- [ ] All acceptance criteria met
- [ ] No TypeScript errors
- [ ] Existing tests pass
- [ ] Debuff modifier appears in XP breakdown
