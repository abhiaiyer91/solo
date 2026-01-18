# G44: Push Notification Integration

## Overview
Integrate push notification delivery using a service like Firebase Cloud Messaging or similar, completing the notification system.

## Context
**Source:** TODO in server/src/services/notification.ts:291
**Related Docs:** docs/frontend/daily-rhythm.md, G32-notification-system.md (completed)
**Current State:** Notification preferences and queuing exist, actual push delivery not implemented

## Acceptance Criteria
- [ ] Push notification service integrated (FCM or alternative)
- [ ] Web push notifications work in browser
- [ ] Service worker for background notifications
- [ ] Subscription management (subscribe/unsubscribe)
- [ ] Notification payload formatting
- [ ] Quiet hours respected (no sends during quiet period)
- [ ] Notification click handling (deep link to app)

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| server/src/services/push.ts | Create | Push notification delivery service |
| server/src/services/notification.ts | Modify | Integrate push delivery |
| web/public/sw.js | Create | Service worker for push |
| web/src/lib/push.ts | Create | Client-side push subscription |
| web/src/components/profile/NotificationSettings.tsx | Modify | Add push subscription UI |
| server/src/routes/notifications.ts | Modify | Add subscription endpoints |

## Implementation Notes
- Use Web Push API for browser notifications
- FCM can handle cross-platform (web + future mobile)
- Store push subscriptions in database
- Batch notifications to prevent spam
- Test quiet hours enforcement

## Environment Variables Needed
- VAPID_PUBLIC_KEY
- VAPID_PRIVATE_KEY
- FCM_SERVER_KEY (if using FCM)

## Definition of Done
- [ ] All acceptance criteria met
- [ ] No TypeScript errors
- [ ] Existing tests pass
- [ ] Push notifications deliverable in production
