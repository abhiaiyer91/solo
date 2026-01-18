# G32: Implement Notification System

## Overview
Implement the notification system with opt-in push notifications and in-app alerts. Documented in `docs/frontend/daily-rhythm.md`.

## Context
**Source:** Ideation Loop analysis - documented feature not implemented
**Related Docs:** docs/frontend/daily-rhythm.md
**Current State:** No notification preferences or delivery system exists

## Acceptance Criteria
- [ ] Notification preferences stored per user
- [ ] Opt-in only (notifications off by default)
- [ ] Notification types: Morning quests, Milestones, Afternoon status, Reconciliation, Streaks, Level-up, Boss
- [ ] Quiet hours configurable (default 10 PM - 7 AM)
- [ ] Push notification integration (web and mobile-ready)

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| server/src/db/schema/auth.ts | Modify | Add notification preferences to users |
| server/src/services/notification.ts | Create | Notification delivery service |
| server/src/routes/notifications.ts | Create | Preferences endpoints |
| web/src/components/profile/NotificationSettings.tsx | Create | Settings UI |
| web/src/pages/Profile.tsx | Modify | Add notification settings section |

## Implementation Notes
- Notifications are data-only, never motivational
- Max 2-3 notifications per day if fully enabled
- Push notification text examples: "Movement: 6,847/10,000. The System is recording."
- Never guilt or "We missed you!" messaging

## Definition of Done
- [ ] All acceptance criteria met
- [ ] No TypeScript errors
- [ ] Existing tests pass
