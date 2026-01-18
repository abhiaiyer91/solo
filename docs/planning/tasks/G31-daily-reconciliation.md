# G31: Implement Daily Reconciliation Flow

## Overview
Implement the end-of-day reconciliation flow that prompts users to confirm remaining items and closes the day. Documented in `docs/frontend/daily-rhythm.md`.

## Context
**Source:** Ideation Loop analysis - documented feature not implemented
**Related Docs:** docs/frontend/daily-rhythm.md
**Current State:** No reconciliation UI or day closing logic exists

## Acceptance Criteria
- [ ] Reconciliation prompt at user-configured time (default 10 PM)
- [ ] UI to confirm/correct remaining quest items
- [ ] Day summary shown after reconciliation
- [ ] Day officially "closes" preventing further quest completion
- [ ] Next day quests available at midnight

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| web/src/components/daily/Reconciliation.tsx | Create | Reconciliation prompt UI |
| web/src/components/daily/DaySummary.tsx | Create | End-of-day summary |
| server/src/services/daily-log.ts | Create | Day closing logic |
| server/src/routes/player.ts | Modify | Add reconciliation endpoints |
| web/src/pages/Dashboard.tsx | Modify | Show reconciliation at appropriate time |

## Implementation Notes
- Evening mode UI (darker, calmer) after 8 PM
- Reconciliation confirms: protein target, hydration, any boolean quests
- Shows XP earned, multipliers applied, streak status
- Late night mode (after day close) shows countdown to new day

## Definition of Done
- [ ] All acceptance criteria met
- [ ] No TypeScript errors
- [ ] Existing tests pass
