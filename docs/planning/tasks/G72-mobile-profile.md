# G72: Mobile Profile & Settings Screen

## Overview
Build the profile and settings screen for the mobile app including account info, notification preferences, timezone settings, and data management options.

## Context
**Source:** Ideation loop Cycle 4 - Mobile completeness analysis
**Related Docs:** docs/frontend/daily-rhythm.md (notification settings UI)
**Current State:** No profile or settings screens in mobile app

## Acceptance Criteria
- [ ] Displays player level, XP, streak, and account info
- [ ] Notification preferences toggle (matching daily-rhythm.md spec)
- [ ] Timezone display and change option
- [ ] Quiet hours configuration
- [ ] Health data source status (HealthKit connection status)
- [ ] Logout button with confirmation
- [ ] Privacy/data management links

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| mobile/src/screens/Profile.tsx | Create | Main profile screen |
| mobile/src/screens/Settings.tsx | Create | Settings screen |
| mobile/src/components/NotificationPrefs.tsx | Create | Notification toggles |
| mobile/src/components/QuietHours.tsx | Create | Quiet hours picker |
| mobile/src/hooks/useSettings.ts | Create | Settings management hook |

## Implementation Notes
- Notification preferences should match the documented settings in daily-rhythm.md
- Quiet hours picker needs time range selection (e.g., 10 PM - 7 AM)
- Consider using existing notification routes on backend

## Definition of Done
- [ ] All acceptance criteria met
- [ ] No TypeScript errors
- [ ] Works on iOS simulator
- [ ] Existing tests pass
