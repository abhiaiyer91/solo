# G125: iOS/Android Home Screen Widgets

## Overview

Create home screen widgets for iOS and Android that display key information like daily quest progress, streak, and XP without opening the app.

## Context

**Source:** Mobile engagement and accessibility
**Current State:** No widget support
**Dependencies:** G55-mobile-app-foundation

## Acceptance Criteria

- [ ] iOS widget using WidgetKit (small, medium sizes)
- [ ] Android widget using Glance (small, medium sizes)
- [ ] Display: current streak, quests completed today, XP progress
- [ ] Tap widget to open app to relevant section
- [ ] Widget updates on app background/foreground
- [ ] Deep link support for specific screens
- [ ] Offline data display from cached state

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| mobile/ios/Widgets/ | Create | iOS WidgetKit extension |
| mobile/ios/Widgets/JourneyWidget.swift | Create | Widget implementation |
| mobile/android/app/src/main/java/widgets/ | Create | Android widget package |
| mobile/android/app/src/main/java/widgets/JourneyWidget.kt | Create | Widget implementation |
| mobile/src/lib/widget-data.ts | Create | Shared data provider for widgets |
| mobile/app.json | Modify | Add widget configuration |

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Widgets render correctly on both platforms
- [ ] Data updates reliably
- [ ] Deep links work correctly
- [ ] No performance issues
