# G137: Offline-First Mobile Architecture

## Overview
Implement robust offline support for the mobile app, ensuring health data and quest progress are never lost even when connectivity is poor or absent.

## Context
**Source:** Retrospective analysis 2026-01-18
**Dependencies:** G55-mobile-app-foundation, G65-healthkit-sync-service
**Current State:** Basic API client exists, no offline handling
**Rationale:** Fitness happens in gyms, on runs, in areas with poor connectivity

## Acceptance Criteria
- [ ] Health data queued locally when offline
- [ ] Automatic sync when connectivity returns
- [ ] Quest completion stored locally, synced later
- [ ] Clear UI indicator when offline
- [ ] No data loss on app restart while offline
- [ ] Conflict resolution for overlapping online/offline changes

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| mobile/src/lib/offline-queue.ts | Create | Offline operation queue with persistence |
| mobile/src/lib/sync-manager.ts | Create | Background sync coordination |
| mobile/src/stores/offline.ts | Create | Zustand store for offline state |
| mobile/src/hooks/useOnlineStatus.ts | Create | Network connectivity hook |
| mobile/src/components/OfflineIndicator.tsx | Modify | Enhance existing component |
| mobile/src/lib/api.ts | Modify | Add queue integration |

## Implementation Notes

### Offline Queue Design
```typescript
interface QueuedOperation {
  id: string;
  type: 'health_sync' | 'quest_complete' | 'quest_progress';
  payload: unknown;
  createdAt: Date;
  retryCount: number;
  lastError?: string;
}

// Persistence with AsyncStorage or expo-secure-store
// Queue survives app restart
// FIFO processing on reconnect
```

### Network Detection
```typescript
import NetInfo from '@react-native-community/netinfo';

// Subscribe to connectivity changes
NetInfo.addEventListener(state => {
  if (state.isConnected) {
    syncManager.processQueue();
  }
});
```

### Conflict Resolution Strategy
1. **Health Data:** Server wins (HealthKit is source of truth, just re-sync)
2. **Quest Progress:** Last-write-wins with timestamp comparison
3. **Quest Completion:** Idempotent - completing twice is safe

### UI States
| State | Indicator | Behavior |
|-------|-----------|----------|
| Online | None | Normal operation |
| Offline | Yellow banner | Queue operations |
| Syncing | Spinning icon | Processing queue |
| Sync Error | Red indicator | Show retry option |

### Critical Scenarios
1. **Gym workout offline:**
   - User completes workout, opens app
   - App queues quest completion
   - User leaves gym, gets signal
   - App auto-syncs, user sees XP

2. **Long offline period:**
   - User goes camping for 3 days
   - Apple Health tracks all data locally
   - User returns to civilization
   - Single sync catches up all data

3. **App killed while offline:**
   - Operations persisted to AsyncStorage
   - On app relaunch, queue restored
   - Sync resumes automatically

## Definition of Done
- [ ] Queue persists across app restarts
- [ ] Automatic sync on reconnection
- [ ] Clear visual feedback for offline state
- [ ] No data loss in any tested scenario
- [ ] Graceful degradation of features offline
- [ ] Performance acceptable with large queue (100+ items)
