# G75: Accountability Partners UI

## Overview
Build the frontend UI for managing accountability partners - sending requests, viewing partner status, and sending nudges.

## Context
**Source:** Ideation loop Cycle 6 - Frontend pages analysis
**Related Docs:** docs/game-systems/social.md (section 2: Accountability Partners)
**Current State:** Backend has accountability routes but no UI

## Acceptance Criteria
- [ ] View current partners (up to 3) with daily completion status
- [ ] Send partner request via username or invite link
- [ ] Accept/decline incoming requests
- [ ] View partner's weekly completion grid (Mon-Sun)
- [ ] Send daily nudge (one per day per partner)
- [ ] Disconnect partner with confirmation
- [ ] Respect 7-day cooldown for re-connecting

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| web/src/pages/Accountability.tsx | Create | Accountability partners page |
| web/src/components/AccountabilityCard.tsx | Create | Partner status card |
| web/src/components/PartnerRequest.tsx | Create | Request/accept UI |
| web/src/components/NudgeButton.tsx | Create | Daily nudge button |
| web/src/hooks/useAccountability.ts | Create | Accountability hooks |

## Implementation Notes
- Per social.md: Partners see completion % only, not specific metrics
- Nudge is acknowledgment, not encouragement (System voice)
- Weekly grid shows ✓/✗ per day, not details
- Limit to 3 partners maximum

## Definition of Done
- [ ] All acceptance criteria met
- [ ] No TypeScript errors
- [ ] Privacy respected (no specific data shown)
- [ ] Existing tests pass
