# G168: Mobile Profile & Settings Screen

## Overview
Create a comprehensive profile and settings screen for mobile matching web's Profile page with account info, timezone settings, theme options, notification preferences, hard mode toggle, and data privacy features.

## Context
**Source:** Ideation loop --focus "feature parity for web and mobile"
**Related Docs:** `web/src/pages/Profile.tsx`
**Current State:** Mobile has ProfileHeader, NotificationPrefs, QuietHours components but no unified screen

## Web Profile Features to Replicate
| Feature | Web Status | Mobile Status |
|---------|------------|---------------|
| Account info display | ✅ Complete | ⚠️ Has ProfileHeader |
| Timezone selector | ✅ Complete | ❌ Missing |
| Theme selector | ✅ Complete | ❌ Missing |
| Notification settings | ✅ Complete | ⚠️ Has NotificationPrefs |
| Statistics summary | ✅ Complete | ❌ Missing |
| Hard mode toggle | ✅ Complete | ❌ Missing |
| Archived runs history | ✅ Complete | ❌ Missing |
| Data export | ✅ Complete | ❌ Missing |
| Logout | ✅ Complete | ❌ Missing |

## Acceptance Criteria
- [ ] Account info section (name, email, level, XP)
- [ ] Timezone selection with timezone picker
- [ ] Theme toggle (dark/light/system)
- [ ] Notification settings with push permission handling
- [ ] Quiet hours configuration
- [ ] Hard mode toggle (if unlocked)
- [ ] Statistics summary (streaks, level, XP)
- [ ] Archive history section
- [ ] Data export functionality (download JSON)
- [ ] Logout with confirmation

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| `mobile/src/screens/Profile.tsx` | Create | Main profile screen |
| `mobile/src/components/TimezoneSelector.tsx` | Create | Timezone picker |
| `mobile/src/components/ThemeToggle.tsx` | Create | Theme selection UI |
| `mobile/src/components/HardModeToggle.tsx` | Create | Hard mode switch |
| `mobile/src/components/ArchiveHistory.tsx` | Create | Archived runs list |
| `mobile/src/components/DataExport.tsx` | Create | Data export button |
| `mobile/src/hooks/useHardMode.ts` | Create | Hard mode status hook |
| `mobile/src/hooks/useArchives.ts` | Create | Archive history hook |

## Implementation Notes
- Use existing NotificationPrefs and QuietHours components
- Adapt useSettings hook for theme persistence
- Use react-native-share for data export
- Handle iOS/Android differences for notification permissions

## Definition of Done
- [ ] All acceptance criteria met
- [ ] No TypeScript errors
- [ ] Existing tests pass
- [ ] Settings persist across app restarts
