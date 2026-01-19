# G83: Android Health Connect Integration

## Overview
Implement Android Health Connect integration to sync health data (steps, workouts, sleep) from Android devices, providing parity with iOS HealthKit.

## Context
**Source:** Ideation loop Cycle 10 - Integration analysis
**Related Docs:** docs/mobile/healthkit-integration.md (parallel implementation)
**Current State:** Only iOS HealthKit implemented; no Android support

## Acceptance Criteria
- [ ] Health Connect library integrated in Expo project
- [ ] Read permissions for steps, exercise, sleep
- [ ] Query and aggregate health data
- [ ] Sync data to backend `/api/health/sync`
- [ ] Background sync capability
- [ ] Permission screen for Android onboarding
- [ ] Graceful fallback if Health Connect unavailable

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| mobile/src/health/providers/healthconnect.ts | Create | Health Connect provider |
| mobile/src/health/hooks/useHealthConnectAuth.ts | Create | HC permissions hook |
| mobile/app.json | Modify | Add Health Connect config |
| mobile/src/health/index.ts | Modify | Platform-aware export |

## Implementation Notes
- Use react-native-health-connect library
- Health Connect requires Android 14+ or Google Play update
- Data types differ from HealthKit - need mapping layer
- Consider using same interface as HealthKit for code reuse

## Definition of Done
- [ ] All acceptance criteria met
- [ ] No TypeScript errors
- [ ] Works on Android emulator with Health Connect
- [ ] Backend receives data correctly
