# G176: Mobile Tab Navigation

## Overview
Create a complete tab navigation system for mobile matching web's navigation with access to all major screens.

## Context
**Source:** Ideation loop --focus "feature parity for web and mobile"
**Related Docs:** `web/src/components/layout/Navbar.tsx`, `web/src/components/layout/MobileNav.tsx`
**Current State:** Mobile has minimal navigation structure

## Web Navigation Features to Replicate
| Feature | Web Status | Mobile Status |
|---------|------------|---------------|
| Dashboard link | ✅ Complete | ⚠️ Partial |
| Quests link | ✅ Complete | ❌ Missing |
| Stats link | ✅ Complete | ❌ Missing |
| Dungeons link | ✅ Complete | ⚠️ Partial |
| Titles link | ✅ Complete | ⚠️ Partial |
| Leaderboard link | ✅ Complete | ⚠️ Partial |
| Guild link | ✅ Complete | ⚠️ Partial |
| Profile link | ✅ Complete | ❌ Missing |
| Analytics link | ✅ Complete | ❌ Missing |
| Level/XP display in nav | ✅ Complete | ❌ Missing |

## Acceptance Criteria
- [ ] Bottom tab navigation with icons
- [ ] Tabs: Dashboard, Quests, Dungeons, Social, Profile
- [ ] Stack navigation within each tab
- [ ] Deep linking support
- [ ] Badge indicators (notifications, pending quests)
- [ ] Active tab highlighting
- [ ] Player level/XP in header

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| `mobile/src/navigation/TabNavigator.tsx` | Create | Bottom tab navigation |
| `mobile/src/navigation/DashboardStack.tsx` | Create | Dashboard tab stack |
| `mobile/src/navigation/QuestsStack.tsx` | Create | Quests tab stack |
| `mobile/src/navigation/SocialStack.tsx` | Create | Guild/Leaderboard stack |
| `mobile/src/navigation/ProfileStack.tsx` | Create | Profile/Settings stack |
| `mobile/src/components/TabIcon.tsx` | Create | Custom tab icons |
| `mobile/src/components/HeaderBar.tsx` | Create | Screen header with player info |

## Implementation Notes
- Use @react-navigation/bottom-tabs
- Consider gesture navigation between tabs
- Handle safe area insets
- Support iOS and Android back button behavior

## Definition of Done
- [ ] All acceptance criteria met
- [ ] No TypeScript errors
- [ ] Existing tests pass
- [ ] Navigation is intuitive and consistent
