# G65: HealthKit Sync Service

## Overview

Implement the service that queries HealthKit for today's health data and syncs it to the backend. This is the core data flow: HealthKit → Mobile App → Backend API → Database.

## Context

**Source:** Ideation loop --topic "HealthKit integration"
**Design Doc:** docs/mobile/healthkit-integration.md
**Current State:** G56 provides HealthKit access. Backend API ready at `/api/health/sync`.

## Acceptance Criteria

- [ ] Query steps from HealthKit for today
- [ ] Query workouts from HealthKit for today
- [ ] Query exercise minutes from HealthKit for today
- [ ] Query sleep data from HealthKit for last night
- [ ] Format data for backend API
- [ ] POST to `/api/health/sync` endpoint
- [ ] Handle sync errors gracefully
- [ ] Return quest completion results to UI
- [ ] Deduplicate workouts using HealthKit UUIDs

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `mobile/src/health/sync.ts` | Create | Main sync service |
| `mobile/src/health/queries.ts` | Create | HealthKit query functions |
| `mobile/src/hooks/useHealthSync.ts` | Create | React hook for syncing |
| `mobile/src/lib/api.ts` | Modify | Add health sync endpoint |

## Implementation Notes

### Query Functions

```typescript
// mobile/src/health/queries.ts
import { 
  queryQuantitySamples,
  queryWorkoutSamples,
  queryCategorySamples,
} from '@kingstinct/react-native-healthkit';

export async function getTodaySteps(): Promise<number> {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const samples = await queryQuantitySamples({
    quantityType: 'HKQuantityTypeIdentifierStepCount',
    from: startOfDay,
    to: now,
    ascending: false,
  });
  
  // Sum all step samples for today
  return samples.reduce((total, sample) => total + sample.quantity, 0);
}

export async function getTodayExerciseMinutes(): Promise<number> {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const samples = await queryQuantitySamples({
    quantityType: 'HKQuantityTypeIdentifierAppleExerciseTime',
    from: startOfDay,
    to: now,
  });
  
  return samples.reduce((total, sample) => total + sample.quantity, 0);
}

export async function getTodayActiveCalories(): Promise<number> {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const samples = await queryQuantitySamples({
    quantityType: 'HKQuantityTypeIdentifierActiveEnergyBurned',
    from: startOfDay,
    to: now,
  });
  
  return samples.reduce((total, sample) => total + sample.quantity, 0);
}

export async function getTodayWorkouts(): Promise<Workout[]> {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const workouts = await queryWorkoutSamples({
    from: startOfDay,
    to: now,
  });
  
  return workouts.map(w => ({
    id: w.uuid,
    type: w.workoutActivityType,
    durationMinutes: Math.round(w.duration / 60),
    calories: w.totalEnergyBurned,
    distance: w.totalDistance,
    startTime: new Date(w.startDate),
    endTime: new Date(w.endDate),
  }));
}

export async function getLastNightSleep(): Promise<number | null> {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  
  const samples = await queryCategorySamples({
    categoryType: 'HKCategoryTypeIdentifierSleepAnalysis',
    from: yesterday,
    to: now,
  });
  
  // Sum "asleep" samples (value 1 = asleep, 0 = in bed)
  const sleepSamples = samples.filter(s => s.value === 1);
  if (sleepSamples.length === 0) return null;
  
  const totalMinutes = sleepSamples.reduce((total, sample) => {
    const start = new Date(sample.startDate).getTime();
    const end = new Date(sample.endDate).getTime();
    return total + (end - start) / (1000 * 60);
  }, 0);
  
  return Math.round(totalMinutes);
}
```

### Sync Service

```typescript
// mobile/src/health/sync.ts
import { api } from '../lib/api';
import { 
  getTodaySteps, 
  getTodayExerciseMinutes,
  getTodayActiveCalories,
  getTodayWorkouts,
  getLastNightSleep,
} from './queries';
import type { HealthSyncRequest, HealthSyncResponse } from './types';

export interface SyncResult {
  success: boolean;
  snapshot?: HealthSnapshot;
  questsCompleted: number;
  questResults: Array<{
    questId: string;
    title: string;
    wasCompleted: boolean;
  }>;
  error?: string;
}

export async function syncHealthData(): Promise<SyncResult> {
  try {
    // Query all health data in parallel
    const [steps, exerciseMinutes, activeCalories, workouts, sleepMinutes] = 
      await Promise.all([
        getTodaySteps(),
        getTodayExerciseMinutes(),
        getTodayActiveCalories(),
        getTodayWorkouts(),
        getLastNightSleep(),
      ]);

    // Format request
    const request: HealthSyncRequest = {
      source: 'HEALTHKIT',
      data: {
        steps,
        exerciseMinutes,
        activeCalories,
        sleepMinutes: sleepMinutes ?? undefined,
        workouts: workouts.map(w => ({
          type: w.type,
          durationMinutes: w.durationMinutes,
          calories: w.calories,
          distance: w.distance,
          startTime: w.startTime.toISOString(),
          endTime: w.endTime?.toISOString(),
          externalId: w.id,  // HealthKit UUID for deduplication
        })),
      },
      rawData: {
        healthkit: {
          stepCount: steps,
          activeEnergyBurned: activeCalories,
          appleExerciseTime: exerciseMinutes,
          sleepAnalysis: sleepMinutes ? { asleep: sleepMinutes } : undefined,
        },
      },
    };

    // Send to backend
    const response = await api.post<HealthSyncResponse>('/api/health/sync', request);

    return {
      success: true,
      snapshot: response.snapshot,
      questsCompleted: response.questsCompleted,
      questResults: response.questResults,
    };
  } catch (error) {
    console.error('Health sync error:', error);
    return {
      success: false,
      questsCompleted: 0,
      questResults: [],
      error: error instanceof Error ? error.message : 'Sync failed',
    };
  }
}
```

### React Hook

```typescript
// mobile/src/hooks/useHealthSync.ts
import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { syncHealthData, type SyncResult } from '../health/sync';
import { queryKeys } from '../lib/api';

export function useHealthSync() {
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: syncHealthData,
    onSuccess: (result) => {
      if (result.success) {
        // Invalidate relevant queries to refresh UI
        queryClient.invalidateQueries({ queryKey: queryKeys.quests() });
        queryClient.invalidateQueries({ queryKey: queryKeys.healthData() });
        queryClient.invalidateQueries({ queryKey: queryKeys.player() });
      }
    },
  });

  return {
    sync: mutation.mutate,
    syncAsync: mutation.mutateAsync,
    isSyncing: mutation.isPending,
    lastResult: mutation.data,
    error: mutation.error,
  };
}
```

## Definition of Done

- [ ] Steps query returns correct value
- [ ] Workouts query returns today's workouts
- [ ] Sleep query returns last night's sleep
- [ ] Sync successfully posts to backend
- [ ] Quests auto-complete when health data meets requirements
- [ ] Errors handled gracefully
- [ ] No TypeScript errors
- [ ] Works on physical device
