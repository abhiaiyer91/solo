# G37: Implement Weekend XP Bonus

## Overview
Implement the +10% XP bonus for quest completions on Saturday and Sunday. The modifier type `WEEKEND_BONUS` already exists in the schema but needs service-level implementation.

## Context
**Source:** docs/overview/player-journey.md (Day 6-7), docs/frontend/daily-rhythm.md
**Related Docs:** docs/game-systems/xp-leveling.md
**Current State:** `WEEKEND_BONUS` modifier type exists in schema, but no logic applies it

## Acceptance Criteria
- [ ] Detect if current day is Saturday or Sunday (user's timezone)
- [ ] Apply +10% XP bonus to all quest completions on weekends
- [ ] Show weekend bonus indicator in UI
- [ ] Include `WEEKEND_BONUS` modifier in XP breakdown
- [ ] Weekend bonus stacks with streak bonus

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| server/src/services/xp.ts | Modify | Apply weekend bonus modifier |
| server/src/lib/timezone.ts | Modify | Add `isWeekend` helper |
| web/src/components/Dashboard.tsx | Modify | Show weekend bonus active indicator |

## Implementation Notes
- Use user's timezone to determine if it's weekend (not server time)
- Weekend bonus is 1.10x multiplier (10% boost)
- Stacks multiplicatively with other bonuses:
  - Base 100 XP + 10% weekend + 10% streak = 100 * 1.10 * 1.10 = 121 XP
- Show narrative message: "Weekend Bonus Active: +10% XP on all completions"

## Definition of Done
- [ ] All acceptance criteria met
- [ ] No TypeScript errors
- [ ] Weekend bonus appears in XP breakdown
- [ ] Works correctly with user timezone
