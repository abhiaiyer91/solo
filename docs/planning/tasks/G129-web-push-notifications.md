# G129: Web Push Notification Integration

## Overview

Implement browser push notifications to re-engage users with quest reminders, streak warnings, and achievement celebrations.

## Context

**Source:** User engagement and retention analysis
**Current State:** Backend notification service exists; no push delivery
**Related:** G32-notification-system, DEBT-004

## Acceptance Criteria

- [ ] Service worker for push notification handling
- [ ] Push subscription management (subscribe/unsubscribe)
- [ ] Firebase Cloud Messaging or Web Push API integration
- [ ] Permission request flow with explanation
- [ ] Notification types: quest reminder, streak warning, level up, boss available
- [ ] Notification preferences in profile settings
- [ ] Quiet hours respect (no notifications during set hours)
- [ ] Deep link to relevant app section when clicked

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| web/public/sw.js | Create | Service worker for push |
| web/src/lib/push.ts | Create | Push subscription manager |
| server/src/services/push.ts | Modify | Complete push delivery implementation |
| server/src/routes/notifications.ts | Modify | Add subscription endpoints |
| web/src/components/profile/NotificationSettings.tsx | Modify | Add push preferences |
| web/src/hooks/usePushNotifications.ts | Create | Push hook for components |

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Notifications appear on desktop browsers
- [ ] Permission request is user-friendly
- [ ] Quiet hours are respected
- [ ] Deep links work correctly
- [ ] No TypeScript errors
