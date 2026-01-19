# Apple HealthKit Integration

## Overview

This document details the implementation plan for Apple HealthKit integration in the Journey mobile app. The primary goal is to automatically sync health data (steps, workouts, sleep, exercise minutes) from the user's device to our backend database, enabling automatic quest completion and accurate stat tracking.

---

## Goals

- **Primary:** Get health stats into the database automatically
- **Secondary:** Enable automatic quest completion based on health data
- **Tertiary:** Support background sync for up-to-date data

---

## Current State

### Backend (Complete ✅)

The backend is fully ready to receive health data:

| Component | Status | Description |
|-----------|--------|-------------|
| `health_snapshots` table | ✅ | Daily health data with verification levels |
| `workout_records` table | ✅ | Individual workout sessions |
| `POST /api/health/sync` | ✅ | Receives health data, triggers quest evaluation |
| `GET /api/health/today` | ✅ | Returns today's health snapshot |
| `GET /api/health/:date` | ✅ | Returns health snapshot for specific date |
| Auto-quest evaluation | ✅ | Quests auto-complete when health data meets requirements |

### Mobile (Foundation Only)

| Component | Status | Description |
|-----------|--------|-------------|
| Expo project | ✅ | React Native + Expo initialized |
| API client | ✅ | `mobile/src/lib/api.ts` ready |
| Auth flow | ✅ | Login/signup working |
| HealthKit library | ❌ | Not installed |
| HealthKit permissions | ❌ | Not configured |
| Sync service | ❌ | Not implemented |

---

## Technical Design

### Library Choice

**`@kingstinct/react-native-healthkit`** (recommended)

- Expo config plugin support (managed workflow compatible)
- TypeScript types included
- React hooks (`useMostRecentQuantitySample`, etc.)
- Imperative methods for complex queries
- Background delivery support
- Actively maintained

### HealthKit Data Types

```typescript
const HEALTH_TYPES = {
  // Quantity Types (numeric values)
  steps: 'HKQuantityTypeIdentifierStepCount',
  activeCalories: 'HKQuantityTypeIdentifierActiveEnergyBurned',
  exerciseMinutes: 'HKQuantityTypeIdentifierAppleExerciseTime',
  
  // Category Types (categorical data)
  sleepAnalysis: 'HKCategoryTypeIdentifierSleepAnalysis',
  
  // Workout Type
  workouts: 'HKWorkoutType',
}
```

### App Configuration

**app.json additions:**

```json
{
  "expo": {
    "plugins": [
      ["@kingstinct/react-native-healthkit", {
        "NSHealthShareUsageDescription": "Journey uses your health data to track quest progress and calculate your fitness stats. We read steps, workouts, sleep, and exercise minutes.",
        "NSHealthUpdateUsageDescription": "Journey can save your completed workouts to Apple Health.",
        "background": true
      }]
    ],
    "ios": {
      "entitlements": {
        "com.apple.developer.healthkit": true,
        "com.apple.developer.healthkit.background-delivery": true
      },
      "infoPlist": {
        "NSHealthShareUsageDescription": "Journey uses your health data to track quest progress and calculate your fitness stats.",
        "NSHealthUpdateUsageDescription": "Journey can save your completed workouts to Apple Health."
      }
    }
  }
}
```

### Data Flow Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                         MOBILE APP                                │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────┐      ┌─────────────────────────────────┐   │
│  │   Apple Health  │◀────▶│  HealthKit Provider              │   │
│  │   (on device)   │      │  @kingstinct/react-native-       │   │
│  └─────────────────┘      │  healthkit                       │   │
│                            └───────────────┬─────────────────┘   │
│                                            │                      │
│                                            ▼                      │
│                            ┌─────────────────────────────────┐   │
│                            │  Health Sync Service             │   │
│                            │  mobile/src/health/sync.ts       │   │
│                            │                                   │   │
│                            │  • Query today's data            │   │
│                            │  • Format for API                │   │
│                            │  • POST to /api/health/sync      │   │
│                            └───────────────┬─────────────────┘   │
│                                            │                      │
└────────────────────────────────────────────┼──────────────────────┘
                                             │
                                             ▼
┌──────────────────────────────────────────────────────────────────┐
│                         BACKEND                                   │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────┐      ┌─────────────────────────────────┐   │
│  │  POST /api/     │─────▶│  Health Service                  │   │
│  │  health/sync    │      │  server/src/services/health.ts   │   │
│  └─────────────────┘      └───────────────┬─────────────────┘   │
│                                            │                      │
│                                            ▼                      │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                     DATABASE                                 │ │
│  │  ┌───────────────────┐   ┌───────────────────┐              │ │
│  │  │  health_snapshots │   │  workout_records  │              │ │
│  │  │  • steps          │   │  • workout_type   │              │ │
│  │  │  • exercise_mins  │   │  • duration       │              │ │
│  │  │  • sleep_mins     │   │  • calories       │              │ │
│  │  │  • active_cals    │   │  • start/end time │              │ │
│  │  └───────────────────┘   └───────────────────┘              │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  Quest Auto-Evaluation                                       │ │
│  │  Quests with health metrics auto-complete when data synced  │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

### Sync Strategy

| Trigger | Description | Priority |
|---------|-------------|----------|
| App Foreground | Sync when app opens | P0 |
| Pull-to-Refresh | Manual sync from quest board | P0 |
| After Workout | Sync when workout detected | P1 |
| Background Fetch | Every 15-30 minutes | P1 |
| Observer Query | Real-time step updates | P2 |

### Mobile File Structure

```
mobile/
├── src/
│   └── health/
│       ├── index.ts              # Exports
│       ├── types.ts              # TypeScript interfaces
│       ├── providers/
│       │   └── healthkit.ts      # HealthKit API wrapper
│       ├── sync.ts               # Sync service (queries + API calls)
│       └── hooks/
│           └── useHealth.ts      # React hook for components
├── app/
│   └── onboarding/
│       └── health.tsx            # Permissions request screen
└── app.json                      # Config plugin + entitlements
```

---

## API Contract

### Sync Request (Mobile → Backend)

```typescript
// POST /api/health/sync
interface HealthSyncRequest {
  date?: string;  // YYYY-MM-DD, defaults to today
  source: 'HEALTHKIT' | 'GOOGLE_FIT' | 'MANUAL';
  data: {
    steps?: number;
    exerciseMinutes?: number;
    sleepMinutes?: number;
    activeCalories?: number;
    proteinLogged?: boolean;
    workouts?: Array<{
      type: string;
      durationMinutes: number;
      calories?: number;
      distance?: number;
      startTime: string;
      endTime?: string;
      externalId?: string;  // HealthKit UUID for deduplication
    }>;
  };
  rawData?: {
    healthkit?: {
      stepCount?: number;
      activeEnergyBurned?: number;
      appleExerciseTime?: number;
      sleepAnalysis?: { asleep?: number; inBed?: number };
      workouts?: Array<{...}>;
    };
  };
}
```

### Sync Response (Backend → Mobile)

```typescript
interface HealthSyncResponse {
  snapshot: HealthSnapshot;
  questsEvaluated: number;
  questsCompleted: number;
  questResults: Array<{
    questId: string;
    title: string;
    wasCompleted: boolean;
  }>;
  message: string;
}
```

---

## Permission Flow

### Step 1: Explain Why

Before requesting HealthKit permissions, show an explanation screen:

```
┌─────────────────────────────────────────────────────────────────┐
│  [THE SYSTEM]                                                    │
│                                                                  │
│  HEALTH DATA ACCESS                                              │
│                                                                  │
│  The System requires access to your health data                 │
│  to track your progress automatically.                          │
│                                                                  │
│  What we read:                                                  │
│  • Steps                  (Movement quests)                     │
│  • Workouts               (Strength quests)                     │
│  • Exercise minutes       (Activity tracking)                   │
│  • Sleep                  (Recovery tracking)                   │
│                                                                  │
│  Your data stays on your device.                                │
│  We only sync daily totals to calculate quests.                 │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  [GRANT ACCESS]                    [SKIP — USE MANUAL]          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Step 2: System Request

iOS presents the standard HealthKit permission dialog.

### Step 3: Handle Response

| Result | Action |
|--------|--------|
| Authorized | Start syncing, show success |
| Denied | Enable manual mode, explain limitations |
| Partial | Sync available data, note missing permissions |

---

## Requirements

### Must Have (P0)

- [ ] HealthKit library installed and configured
- [ ] Permission request flow in onboarding
- [ ] Query steps, workouts, sleep, exercise minutes
- [ ] Sync to backend on app open
- [ ] Manual "Sync Now" button
- [ ] Handle permission denial gracefully

### Should Have (P1)

- [ ] Background sync every 15 minutes
- [ ] Sync status indicator in UI
- [ ] Retry logic for failed syncs
- [ ] Local caching of last sync time

### Nice to Have (P2)

- [ ] Observer queries for real-time updates
- [ ] Write workouts back to HealthKit
- [ ] Historical data import (past 7 days)

---

## Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
| `@kingstinct/react-native-healthkit` | ^7.0.0 | HealthKit API access |
| `expo-background-fetch` | ~12.0.0 | Background sync |
| `expo-task-manager` | ~12.0.0 | Background task registration |

---

## Testing Notes

- **Simulator**: Cannot test HealthKit (no health data)
- **Physical device required**: Use TestFlight or dev build
- **EAS Build**: Required for native HealthKit module
- **Fake data**: Use Health app on device to add test data

---

## Open Questions

1. **Write access**: Do we want to write workouts back to HealthKit?
   - Recommendation: Not for MVP, add later

2. **Historical import**: Should we import past data on first sync?
   - Recommendation: Import last 7 days for better onboarding experience

3. **Google Fit parity**: When to implement Android equivalent?
   - Recommendation: After iOS HealthKit is stable

---

## Task Breakdown

See individual task files:
- G56-healthkit-integration.md (existing - needs update)
- G64-healthkit-permissions.md (new)
- G65-healthkit-sync-service.md (new)
- G66-healthkit-background-sync.md (new)
- G67-health-sync-ui.md (new)
