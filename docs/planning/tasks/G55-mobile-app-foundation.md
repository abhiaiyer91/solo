# G55: Mobile App Foundation

## Overview

Initialize the React Native + Expo mobile application with the core structure, navigation, and shared components. This is the foundation for all mobile functionality including HealthKit integration.

## Context

**Source:** Retrospection analysis - Mobile app is 0% built
**Design Doc:** docs/mobile/README.md
**Current State:** No mobile directory exists. Backend health sync API is ready.

## Acceptance Criteria

- [ ] Expo project initialized with TypeScript
- [ ] Expo Router configured with tab navigation
- [ ] API client configured (reuse patterns from web)
- [ ] Auth flow working (login, signup, session persistence)
- [ ] Basic SystemWindow component with Journey aesthetic
- [ ] Environment configuration for dev/staging/prod
- [ ] EAS Build configured for iOS

## Files to Create

| File | Description |
|------|-------------|
| `mobile/package.json` | Expo project dependencies |
| `mobile/app.json` | Expo configuration |
| `mobile/app/(tabs)/_layout.tsx` | Tab navigation layout |
| `mobile/app/(tabs)/index.tsx` | Quest board (home) |
| `mobile/app/(tabs)/stats.tsx` | Player stats |
| `mobile/app/(tabs)/profile.tsx` | Settings |
| `mobile/app/login.tsx` | Login screen |
| `mobile/app/signup.tsx` | Signup screen |
| `mobile/src/components/SystemWindow.tsx` | Core UI component |
| `mobile/src/lib/api.ts` | API client |
| `mobile/src/lib/auth.ts` | Auth utilities |
| `mobile/eas.json` | EAS Build configuration |

## Implementation Notes

### Dependencies

```json
{
  "dependencies": {
    "expo": "~50.0.0",
    "expo-router": "~3.0.0",
    "expo-secure-store": "~13.0.0",
    "@tanstack/react-query": "^5.0.0",
    "zustand": "^4.0.0",
    "react-native-reanimated": "~3.6.0"
  }
}
```

### Project Structure

```
mobile/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx
│   │   ├── stats.tsx
│   │   └── profile.tsx
│   ├── login.tsx
│   ├── signup.tsx
│   └── _layout.tsx
├── src/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   └── stores/
├── app.json
├── package.json
├── tsconfig.json
└── eas.json
```

## Definition of Done

- [ ] App runs on iOS simulator
- [ ] Login/signup works with backend
- [ ] Tab navigation functions
- [ ] System aesthetic matches web
- [ ] No TypeScript errors
