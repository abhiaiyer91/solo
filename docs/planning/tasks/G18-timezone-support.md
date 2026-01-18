# G18: Implement Proper Timezone Support

## Overview
Implement proper timezone handling for quest generation and daily log evaluation.

## Context
**Source:** TODO comment in server/src/services/quest.ts:29
**Related Docs:** User model has timezone field
**Current State:** getTodayDate function ignores timezone parameter, uses UTC

## Acceptance Criteria
- [ ] getTodayDate properly converts to user's timezone
- [ ] Quest generation uses user's local date
- [ ] Daily log evaluation uses user's local date
- [ ] End-of-day evaluation respects user timezone
- [ ] All date comparisons use consistent timezone handling

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| server/src/lib/timezone.ts | Create | Timezone utility functions |
| server/src/services/quest.ts | Modify | Use proper timezone in getTodayDate |
| server/src/services/xp.ts | Modify | Timezone-aware date handling |

## Implementation Notes
- Consider using date-fns-tz or luxon for timezone handling
- User timezone stored in users table as text (e.g., 'America/Los_Angeles')
- Default to UTC if no timezone set
- Important for streak calculations and debuff timing

## Definition of Done
- [ ] All acceptance criteria met
- [ ] No TypeScript errors
- [ ] Existing tests pass
- [ ] TODO comment removed from quest.ts
