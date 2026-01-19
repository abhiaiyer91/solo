# G78: Hydration Tracking UI

## Overview
Build UI for tracking daily hydration as a rotating quest, allowing users to log water intake throughout the day.

## Context
**Source:** Ideation loop Cycle 8 - UX analysis
**Related Docs:** docs/game-systems/quests.md (rotating quests), docs/frontend/daily-rhythm.md
**Current State:** Hydration is mentioned as rotating quest but no dedicated tracking UI

## Acceptance Criteria
- [ ] Hydration widget showing current glasses/target
- [ ] Quick-add buttons (+1 glass, +2 glasses)
- [ ] Visual progress indicator (glasses filled)
- [ ] Appears when hydration is active rotating quest
- [ ] End-of-day reconciliation prompt for hydration
- [ ] Syncs with quest completion system

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| web/src/components/quest/HydrationTracker.tsx | Create | Hydration widget |
| web/src/hooks/useHydration.ts | Create | Hydration tracking hook |
| server/src/services/hydration.ts | Create | Hydration tracking service |
| mobile/src/components/HydrationWidget.tsx | Create | Mobile hydration widget |

## Implementation Notes
- Default target: 8 glasses (customizable in future)
- Visual metaphor: glasses filling up
- Quick-add should be minimal friction (tap to log)
- Persists across app sessions within the day

## Definition of Done
- [ ] All acceptance criteria met
- [ ] No TypeScript errors
- [ ] Web and mobile implementations
- [ ] Existing tests pass
