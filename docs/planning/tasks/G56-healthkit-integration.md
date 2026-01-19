# G56: HealthKit Integration - Core Setup

## Overview

Install and configure the HealthKit library in the Expo mobile app. This is the foundation for all health data sync functionality.

## Context

**Source:** Ideation loop --topic "HealthKit integration"
**Design Doc:** docs/mobile/healthkit-integration.md
**Current State:** Mobile app foundation exists (G55 complete). Backend health sync API ready.

## Acceptance Criteria

- [ ] `@kingstinct/react-native-healthkit` installed
- [ ] Expo config plugin configured in app.json
- [ ] iOS entitlements set (HealthKit, background delivery)
- [ ] Info.plist descriptions added
- [ ] HealthKit types defined in TypeScript
- [ ] Basic authorization hook working
- [ ] EAS Build configured for HealthKit capability

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `mobile/package.json` | Modify | Add healthkit dependency |
| `mobile/app.json` | Modify | Add config plugin + entitlements |
| `mobile/src/health/index.ts` | Create | Module exports |
| `mobile/src/health/types.ts` | Create | TypeScript interfaces |
| `mobile/src/health/providers/healthkit.ts` | Create | HealthKit wrapper functions |
| `mobile/src/health/hooks/useHealthAuth.ts` | Create | Authorization hook |

## Implementation Notes

### Dependencies to Install

```bash
cd mobile
npx expo install @kingstinct/react-native-healthkit
```

### app.json Configuration

```json
{
  "expo": {
    "plugins": [
      ["@kingstinct/react-native-healthkit", {
        "NSHealthShareUsageDescription": "Journey uses your health data to track quest progress and calculate your fitness stats.",
        "NSHealthUpdateUsageDescription": "Journey can save your completed workouts to Apple Health.",
        "background": true
      }]
    ],
    "ios": {
      "entitlements": {
        "com.apple.developer.healthkit": true,
        "com.apple.developer.healthkit.background-delivery": true
      }
    }
  }
}
```

### Health Types to Support

```typescript
// mobile/src/health/types.ts
export const HEALTH_READ_TYPES = [
  'HKQuantityTypeIdentifierStepCount',
  'HKQuantityTypeIdentifierActiveEnergyBurned',
  'HKQuantityTypeIdentifierAppleExerciseTime',
  'HKCategoryTypeIdentifierSleepAnalysis',
  'HKWorkoutType',
] as const;

export interface HealthData {
  steps: number;
  activeCalories: number;
  exerciseMinutes: number;
  sleepMinutes: number;
  workouts: Workout[];
}

export interface Workout {
  id: string;
  type: string;
  durationMinutes: number;
  calories?: number;
  distance?: number;
  startTime: Date;
  endTime?: Date;
}
```

### Authorization Hook

```typescript
// mobile/src/health/hooks/useHealthAuth.ts
import { useHealthkitAuthorization } from '@kingstinct/react-native-healthkit';
import { HEALTH_READ_TYPES } from '../types';

export function useHealthAuth() {
  const [status, requestAuth] = useHealthkitAuthorization({
    toRead: HEALTH_READ_TYPES,
  });

  return {
    status,  // 'notDetermined' | 'sharingDenied' | 'sharingAuthorized'
    requestAuth,
    isAuthorized: status === 'sharingAuthorized',
    isDenied: status === 'sharingDenied',
    needsRequest: status === 'notDetermined',
  };
}
```

## Testing

- Must test on physical iOS device (simulator has no HealthKit)
- Use EAS development build: `eas build --profile development --platform ios`
- Add test data via Health app on device

## Definition of Done

- [ ] Library installed and configured
- [ ] Config plugin working (prebuild generates correct iOS config)
- [ ] Authorization can be requested
- [ ] EAS Build succeeds with HealthKit entitlement
- [ ] No TypeScript errors
