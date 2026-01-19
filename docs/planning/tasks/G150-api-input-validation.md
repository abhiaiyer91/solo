# G150: API Input Validation with Zod

## Overview
Add comprehensive input validation using Zod schemas to all POST/PUT API routes. Currently only 1 of 21 routes has proper validation (5% coverage). This is critical for security and stability.

## Context
**Source:** Ideation loop --focus testing/stability
**Related Docs:** `server/src/routes/*.ts`
**Current State:** Most routes lack input validation, accepting any request body

## Acceptance Criteria
- [ ] Zod schemas for all quest-related endpoints
- [ ] Zod schemas for all health sync endpoints
- [ ] Zod schemas for all guild endpoints
- [ ] Zod schemas for all notification endpoints
- [ ] Zod schemas for all profile/settings endpoints
- [ ] Validation middleware that returns consistent 400 errors
- [ ] Path parameters validated (IDs as UUIDs)
- [ ] Query parameters validated with defaults

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| server/src/lib/validation.ts | Create | Shared Zod schemas and utilities |
| server/src/middleware/validate.ts | Create | Validation middleware |
| server/src/routes/quests.ts | Modify | Add request validation |
| server/src/routes/health.ts | Modify | Add request validation |
| server/src/routes/guilds.ts | Modify | Add request validation |
| server/src/routes/notifications.ts | Modify | Add request validation |
| server/src/routes/player.ts | Modify | Add request validation |
| server/src/routes/onboarding.ts | Modify | Add request validation |
| server/src/routes/body.ts | Modify | Add request validation |
| server/src/routes/stats.ts | Modify | Add request validation |
| server/src/routes/seasons.ts | Modify | Add request validation |
| server/src/routes/accountability.ts | Modify | Add request validation |

## Implementation Notes

### Validation Middleware Pattern
```typescript
import { z } from 'zod'

export function validate<T extends z.ZodType>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: result.error.flatten()
      })
    }
    req.body = result.data
    next()
  }
}
```

### Schema Organization
- Group schemas by domain (quest schemas, health schemas, etc.)
- Export inferred types for use in route handlers
- Use `.strict()` to reject unknown fields
- Add `.transform()` for date string parsing

### Common Validations
- UUIDs: `z.string().uuid()`
- Dates: `z.string().datetime()` or `z.coerce.date()`
- Enums: `z.enum(['daily', 'weekly', 'rotating'])`
- Pagination: `z.object({ limit: z.number().max(100), offset: z.number() })`

## Definition of Done
- [ ] All acceptance criteria met
- [ ] No TypeScript errors
- [ ] Invalid requests return 400 with clear error messages
- [ ] Valid requests pass through unchanged
- [ ] No breaking changes to existing API contracts
