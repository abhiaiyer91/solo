# G56: HealthKit Integration

## Overview

Implement Apple HealthKit integration for automatic health data sync. This enables automatic quest completion based on steps, workouts, sleep, and exercise minutes.

## Context

**Source:** Retrospection analysis - Core fitness app functionality
**Design Doc:** docs/mobile/data-input.md
**Current State:** Backend `/api/health/sync` exists. No mobile client.

## Acceptance Criteria

- [ ] HealthKit permissions requested properly
- [ ] Steps data queried and synced
- [ ] Workout data queried and synced
- [ ] Sleep data queried and synced
- [ ] Active calories tracked
- [ ] Background sync every 15 minutes
- [ ] Manual "sync now" option
- [ ] Sync status indicator in UI

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `mobile/src/health/providers/healthkit.ts` | Create | HealthKit API wrapper |
| `mobile/src/health/unified.ts` | Create | Unified health data interface |
| `mobile/src/health/sync.ts` | Create | Sync logic with backend |
| `mobile/src/hooks/useHealth.ts` | Create | React hook for health data |
| `mobile/app/onboarding/health.tsx` | Create | Health permissions screen |

## Implementation Notes

### HealthKit Types to Query

```typescript
const HEALTH_TYPES = {
  steps: 'HKQuantityTypeIdentifierStepCount',
  activeCalories: 'HKQuantityTypeIdentifierActiveEnergyBurned',
  exerciseMinutes: 'HKQuantityTypeIdentifierAppleExerciseTime',
  sleepAnalysis: 'HKCategoryTypeIdentifierSleepAnalysis',
  workouts: 'HKWorkoutType',
}
```

### Permission Request Flow

1. Show explanation screen (why we need access)
2. Request permissions
3. Show what was granted
4. Proceed to app

### Sync Strategy

```typescript
interface HealthSnapshot {
  date: string
  steps: number
  activeCalories: number
  exerciseMinutes: number
  sleepHours: number
  workouts: Workout[]
}

// Sync on:
// 1. App foreground
// 2. Background fetch (every 15 min)
// 3. Pull-to-refresh
// 4. After workout completes
```

## Definition of Done

- [ ] Health permissions granted on fresh install
- [ ] Steps sync to backend
- [ ] Workouts sync to backend
- [ ] Sleep syncs to backend
- [ ] Background sync works
- [ ] Quests auto-complete from health data
