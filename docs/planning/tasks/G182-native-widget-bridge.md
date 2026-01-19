# G182: Native Widget Bridge Implementation

## Overview
Implement native bridges for iOS WidgetKit and Android AppWidget to enable home screen widget updates.

## Context
**Source:** Ideation loop --focus retrospective
**Related TODOs:**
- `mobile/src/lib/widget-data.ts:121` - "Implement native bridge for WidgetCenter.shared.reloadAllTimelines()"
- `mobile/src/lib/widget-data.ts:143` - "Implement native bridge to send broadcast to AppWidgetProvider"
**Current State:** Widget data preparation exists but can't trigger widget refresh
**Blocked By:** G125-mobile-widgets (requires expo eject)

## Acceptance Criteria
- [ ] iOS native module to call WidgetCenter.shared.reloadAllTimelines()
- [ ] Android native module to send broadcast to AppWidgetProvider
- [ ] Expo config plugin for automatic native code injection
- [ ] Widget updates trigger when relevant data changes (quest completion, XP gain)
- [ ] Error handling for failed widget updates

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| mobile/src/lib/widget-data.ts | Modify | Remove TODOs, call native bridges |
| mobile/ios/Modules/WidgetBridge.swift | Create | iOS native module |
| mobile/android/app/src/main/java/.../WidgetBridge.kt | Create | Android native module |
| mobile/plugins/widget-bridge/plugin.js | Create | Expo config plugin |

## Implementation Notes
- Requires Expo development build or ejected project
- iOS needs App Groups for widget-app communication
- Android needs proper intent broadcasting setup
- Consider using expo-modules-core for cleaner native module creation

## Definition of Done
- [ ] All acceptance criteria met
- [ ] Widgets refresh when quest completed
- [ ] TODOs removed from widget-data.ts
- [ ] Works on both iOS and Android
