# G131: Structured Logging Migration

## Overview

Replace console.log statements across the codebase with structured logging using the existing logger.ts, improving production debugging and observability.

## Context

**Source:** Debt manifest DEBT-007
**Current State:** 263 console statements across 34 server files
**Related:** server/src/lib/logger.ts exists but underutilized

## Acceptance Criteria

- [ ] All console.log replaced with logger.info
- [ ] All console.error replaced with logger.error
- [ ] All console.warn replaced with logger.warn
- [ ] Add contextual metadata to log calls (userId, requestId, etc.)
- [ ] Remove debug logs or convert to logger.debug
- [ ] Ensure sensitive data is not logged (passwords, tokens)
- [ ] Add request ID middleware for tracing
- [ ] Log format suitable for production aggregation

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| server/src/lib/logger.ts | Modify | Enhance logger with context support |
| server/src/middleware/request-id.ts | Create | Request ID injection middleware |
| server/src/routes/player.ts | Modify | Replace 32 console statements |
| server/src/routes/quests.ts | Modify | Replace 26 console statements |
| server/src/db/seed.ts | Modify | Replace 38 console statements |
| server/src/routes/notifications.ts | Modify | Replace 13 console statements |
| (all other route/service files) | Modify | Replace remaining statements |

## Definition of Done

- [ ] Zero console.* statements in production code
- [ ] All logs include appropriate context
- [ ] No sensitive data in logs
- [ ] Logs are machine-parseable (JSON format)
- [ ] No TypeScript errors
