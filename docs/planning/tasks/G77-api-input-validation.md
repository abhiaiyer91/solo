# G77: API Input Validation

## Overview
Add comprehensive input validation using Zod to all API routes that currently lack validation, ensuring robust error handling and security.

## Context
**Source:** Ideation loop Cycle 7 - Security analysis
**Related Docs:** server/src/middleware/validation.ts
**Current State:** Only nutrition.ts has Zod validation; other routes lack systematic validation

## Acceptance Criteria
- [ ] All POST/PUT/PATCH routes have request body validation
- [ ] All routes with params have parameter validation
- [ ] All routes with query strings have query validation
- [ ] Validation errors return 400 with clear error messages
- [ ] Reusable schema definitions for common types
- [ ] Type inference from Zod schemas

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| server/src/lib/validation/schemas.ts | Create | Shared Zod schemas |
| server/src/routes/guilds.ts | Modify | Add validation |
| server/src/routes/accountability.ts | Modify | Add validation |
| server/src/routes/raids.ts | Modify | Add validation |
| server/src/routes/seasons.ts | Modify | Add validation |
| server/src/routes/body.ts | Modify | Add validation |
| server/src/routes/onboarding.ts | Modify | Add validation |
| server/src/routes/notifications.ts | Modify | Add validation |
| server/src/routes/health.ts | Modify | Add validation |
| server/src/routes/player.ts | Modify | Add validation |
| server/src/routes/quests.ts | Modify | Add validation |

## Implementation Notes
- Create shared schemas for: pagination, date ranges, IDs, etc.
- Use validateBody middleware pattern from nutrition.ts
- Consider OpenAPI schema generation from Zod
- Don't over-validate internal routes with trusted data

## Definition of Done
- [ ] All acceptance criteria met
- [ ] No TypeScript errors
- [ ] Invalid requests return proper 400 errors
- [ ] Existing tests pass
