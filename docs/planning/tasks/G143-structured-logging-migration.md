# G143: Migrate console.log to Structured Logger

## Overview
Replace 263 console.log/error/warn statements in the server with the structured logger, enabling proper log levels, JSON output, and production-grade logging.

## Context
**Source:** Debt manifest DEBT-007, retrospective analysis
**Current State:** 263 console statements across 34 files
**Rationale:** console.log is unusable in production; need structured, filterable logs

## Acceptance Criteria
- [ ] All console.log replaced with logger.info/debug
- [ ] All console.error replaced with logger.error
- [ ] All console.warn replaced with logger.warn
- [ ] Log levels used appropriately
- [ ] Context objects passed for structured data
- [ ] No console statements in production code (seed files excepted)

## Files to Modify
| File | Console Count | Priority |
|------|---------------|----------|
| server/src/routes/player.ts | 32 | High |
| server/src/routes/quests.ts | 26 | High |
| server/src/routes/notifications.ts | 13 | High |
| server/src/db/seed.ts | 38 | Low (keep) |
| Other routes | ~50 | Medium |
| Services | ~100 | Medium |

## Implementation Notes

### Logger Already Exists
```typescript
// server/src/lib/logger.ts
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV !== 'production'
    ? { target: 'pino-pretty' }
    : undefined,
});
```

### Migration Patterns

**Before:**
```typescript
console.log('Processing quest completion', questId, userId);
```

**After:**
```typescript
import { logger } from '@/lib/logger';

logger.info({ questId, userId }, 'Processing quest completion');
```

**Error Logging Before:**
```typescript
console.error('Failed to process:', error);
```

**Error Logging After:**
```typescript
logger.error({ err: error, questId }, 'Failed to process quest');
```

### Log Level Guidelines
| Level | Use Case |
|-------|----------|
| debug | Detailed debugging, development only |
| info | Normal operations, key events |
| warn | Unexpected but handled situations |
| error | Failures requiring attention |

### Context Object Best Practices
```typescript
// Good - structured data
logger.info({ userId, questId, xpAwarded: 50 }, 'Quest completed');

// Bad - concatenated strings
logger.info('Quest ' + questId + ' completed by ' + userId);

// Good - error with context
logger.error({ err: error, userId, action: 'quest-complete' }, 'Failed to complete quest');

// Bad - error as string
logger.error('Error: ' + error.message);
```

### Automated Migration Script
```bash
# Find all console statements (for tracking progress)
grep -rn "console\." server/src --include="*.ts" | grep -v node_modules | grep -v ".test.ts" | wc -l

# After each file, verify no console remaining
grep -n "console\." server/src/routes/player.ts
```

### Files to Skip
- `server/src/db/seed*.ts` - Seed files can use console for CLI output
- Test files - Can use console for test debugging
- Generated files - Don't modify

### Priority Order
1. Routes (user-facing, highest traffic)
2. Services (business logic)
3. Middleware (cross-cutting)
4. Utilities (less critical)

## Definition of Done
- [ ] < 50 console statements remaining (seed files only)
- [ ] All routes using logger
- [ ] All services using logger
- [ ] Log levels used appropriately
- [ ] Structured context in all log calls
- [ ] No runtime errors from migration
- [ ] DEBT-007 marked as resolved
