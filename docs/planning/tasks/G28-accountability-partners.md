# G28: Implement Accountability Partners

## Overview
Implement the 1-on-1 accountability partner system that allows players to see each other's daily completion status and send nudges. Documented in `docs/game-systems/social.md`.

## Context
**Source:** Ideation Loop analysis - documented feature not implemented
**Related Docs:** docs/game-systems/social.md
**Current State:** No accountability partner schema or services exist

## Acceptance Criteria
- [ ] Accountability pairs schema table created
- [ ] Service for request/accept/decline/disconnect partnership
- [ ] Daily nudge functionality (max 1 per day)
- [ ] API endpoints for partner management
- [ ] Partners can see daily completion % (not specific metrics)

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| server/src/db/schema/social.ts | Modify | Add accountabilityPairs table |
| server/src/services/accountability.ts | Create | Partner management service |
| server/src/routes/accountability.ts | Create | API endpoints |
| server/src/index.ts | Modify | Register accountability routes |

## Implementation Notes
- Max 3 accountability partners per user
- 7-day cooldown before reconnecting with same partner
- Nudges are simple notifications, not messages
- Partners only see completion status, not specific data

## Definition of Done
- [ ] All acceptance criteria met
- [ ] No TypeScript errors
- [ ] Existing tests pass
