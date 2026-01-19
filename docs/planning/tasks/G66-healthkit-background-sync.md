# G66: HealthKit Background Sync

## Overview

Implement background sync so health data is updated even when the app isn't in the foreground. This ensures quests are completed accurately throughout the day without requiring the user to open the app.

## Context

**Source:** Ideation loop --topic "HealthKit integration"
**Design Doc:** docs/mobile/healthkit-integration.md
**Current State:** G65 provides foreground sync. Need background capability.

## Acceptance Criteria

- [ ] Background fetch registered with iOS
- [ ] Health data synced in background every 15-30 minutes
- [ ] Background sync triggers quest evaluation
- [ ] Battery-efficient implementation
- [ ] Sync only if app has health permissions
- [ ] Handle background fetch failures gracefully
- [ ] Last sync timestamp tracked

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `mobile/src/health/background.ts` | Create | Background task registration |
| `mobile/app/_layout.tsx` | Modify | Register background task on app start |
| `mobile/src/stores/health.ts` | Modify | Track last sync time |
| `mobile/app.json` | Modify | Enable background modes |

## Implementation Notes

### Dependencies

```bash
npx expo install expo-background-fetch expo-task-manager
```

### app.json Background Modes

```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "UIBackgroundModes": ["fetch", "processing"]
      }
    }
  }
}
```

### Background Task Registration

```typescript
// mobile/src/health/background.ts
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { syncHealthData } from './sync';
import { useHealthStore } from '../stores/health';

const HEALTH_SYNC_TASK = 'health-sync-background';

// Define the background task
TaskManager.defineTask(HEALTH_SYNC_TASK, async () => {
  try {
    console.log('[Background] Starting health sync...');
    
    const result = await syncHealthData();
    
    if (result.success) {
      // Update last sync time
      useHealthStore.getState().setLastSyncTime(new Date());
      console.log('[Background] Health sync complete:', result.questsCompleted, 'quests completed');
      return BackgroundFetch.BackgroundFetchResult.NewData;
    } else {
      console.log('[Background] Health sync failed:', result.error);
      return BackgroundFetch.BackgroundFetchResult.Failed;
    }
  } catch (error) {
    console.error('[Background] Health sync error:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export async function registerBackgroundSync(): Promise<void> {
  try {
    // Check if already registered
    const isRegistered = await TaskManager.isTaskRegisteredAsync(HEALTH_SYNC_TASK);
    
    if (isRegistered) {
      console.log('[Background] Task already registered');
      return;
    }

    // Register background fetch
    await BackgroundFetch.registerTaskAsync(HEALTH_SYNC_TASK, {
      minimumInterval: 15 * 60,  // 15 minutes minimum
      stopOnTerminate: false,
      startOnBoot: true,
    });

    console.log('[Background] Health sync task registered');
  } catch (error) {
    console.error('[Background] Failed to register task:', error);
  }
}

export async function unregisterBackgroundSync(): Promise<void> {
  try {
    await BackgroundFetch.unregisterTaskAsync(HEALTH_SYNC_TASK);
    console.log('[Background] Health sync task unregistered');
  } catch (error) {
    console.error('[Background] Failed to unregister task:', error);
  }
}

export async function getBackgroundSyncStatus(): Promise<{
  isRegistered: boolean;
  status: BackgroundFetch.BackgroundFetchStatus;
}> {
  const isRegistered = await TaskManager.isTaskRegisteredAsync(HEALTH_SYNC_TASK);
  const status = await BackgroundFetch.getStatusAsync();
  return { isRegistered, status };
}
```

### App Layout Integration

```typescript
// mobile/app/_layout.tsx
import { useEffect } from 'react';
import { registerBackgroundSync } from '../src/health/background';
import { useHealthAuth } from '../src/health/hooks/useHealthAuth';

export default function RootLayout() {
  const { isAuthorized } = useHealthAuth();

  useEffect(() => {
    if (isAuthorized) {
      registerBackgroundSync();
    }
  }, [isAuthorized]);

  // ... rest of layout
}
```

### Health Store

```typescript
// mobile/src/stores/health.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface HealthState {
  lastSyncTime: Date | null;
  syncStatus: 'idle' | 'syncing' | 'success' | 'error';
  healthPermission: 'unknown' | 'granted' | 'denied' | 'partial';
  setLastSyncTime: (time: Date) => void;
  setSyncStatus: (status: HealthState['syncStatus']) => void;
  setHealthPermission: (permission: HealthState['healthPermission']) => void;
}

export const useHealthStore = create<HealthState>()(
  persist(
    (set) => ({
      lastSyncTime: null,
      syncStatus: 'idle',
      healthPermission: 'unknown',
      setLastSyncTime: (time) => set({ lastSyncTime: time }),
      setSyncStatus: (status) => set({ syncStatus: status }),
      setHealthPermission: (permission) => set({ healthPermission: permission }),
    }),
    {
      name: 'health-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

### Battery Optimization

The background sync should be efficient:

1. **Minimum interval**: 15 minutes (iOS may extend this based on usage)
2. **Quick execution**: Query + POST should complete in <10 seconds
3. **No heavy processing**: Just query and send
4. **Skip if recently synced**: Check last sync time before querying

```typescript
// In background task
const lastSync = useHealthStore.getState().lastSyncTime;
const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

if (lastSync && lastSync > fiveMinutesAgo) {
  console.log('[Background] Skipping sync, too recent');
  return BackgroundFetch.BackgroundFetchResult.NoData;
}
```

## Testing

Background fetch testing is tricky:

1. Build with EAS: `eas build --profile development --platform ios`
2. Install on device
3. Put app in background
4. Wait or use Xcode to simulate background fetch
5. Check logs with `npx expo start --dev-client`

## Definition of Done

- [ ] Background task registered on app start
- [ ] Sync executes in background
- [ ] Last sync time persisted
- [ ] Battery usage acceptable
- [ ] Unregistration works
- [ ] No TypeScript errors
- [ ] Works on physical device
