# G85: Quiet Hours Mode

## Overview
Implement quiet hours functionality that suppresses notifications and shows a calming late-night UI after the configured quiet hours start time.

## Context
**Source:** Ideation loop Cycle 8 - UX analysis
**Related Docs:** docs/frontend/daily-rhythm.md (Night Phase, Quiet Hours)
**Current State:** No quiet hours implementation

## Acceptance Criteria
- [ ] User can configure quiet hours (default 10 PM - 7 AM)
- [ ] No push notifications during quiet hours
- [ ] In-app notifications suppressed during quiet hours
- [ ] Late-night UI when app opened after day close
- [ ] "Day X is closed. Day X+1 begins at midnight." message
- [ ] Respect user's timezone for quiet hours
- [ ] Sleep encouragement messaging (per daily-rhythm.md)

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| web/src/hooks/useQuietHours.ts | Create | Quiet hours detection |
| web/src/components/LateNightView.tsx | Create | Post-day-close UI |
| server/src/services/notification.ts | Modify | Respect quiet hours |
| mobile/src/hooks/useQuietHours.ts | Create | Mobile quiet hours |
| server/src/db/schema/auth.ts | Modify | Store quiet hours prefs |

## Implementation Notes
- Per daily-rhythm.md: After 10 PM, no notifications
- If app opened after day close: show summary, encourage sleep
- Quiet hours are user-configurable
- Consider do-not-disturb system integration on mobile

## Definition of Done
- [ ] All acceptance criteria met
- [ ] No TypeScript errors
- [ ] Notifications respect quiet hours
- [ ] Existing tests pass
