# G181: Push Notification Integration

## Overview
Implement actual push notification delivery. Backend notification service exists but TODO indicates integration with push service is incomplete.

## Context
**Source:** Ideation loop --focus retrospective
**Related TODO:** `server/src/services/notification.ts:291` - "Integrate with push notification service"
**Current State:** Notification service creates records but doesn't send to devices

## Acceptance Criteria
- [ ] Integrate with push notification provider (Expo Push or Firebase)
- [ ] Store device push tokens in database
- [ ] Send push notifications when `notification.service.send()` is called
- [ ] Handle notification delivery errors gracefully
- [ ] Support both iOS and Android push formats
- [ ] Respect user notification preferences

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| server/src/services/notification.ts | Modify | Add push delivery logic |
| server/src/services/push-provider.ts | Create | Abstract push provider interface |
| server/src/db/schema/devices.ts | Create | Device token storage |
| mobile/src/hooks/usePushNotifications.ts | Create | Register for push tokens |
| mobile/src/lib/notifications.ts | Create | Handle notification receipt |

## Implementation Notes
- **Expo Push:** Free, simple integration with Expo apps
- **Firebase (FCM):** More control, works with bare React Native
- Device tokens must be refreshed periodically
- Consider notification categories for actionable notifications

## Definition of Done
- [ ] All acceptance criteria met
- [ ] No TypeScript errors
- [ ] Push notifications delivered to test devices
- [ ] TODO removed from notification.ts
