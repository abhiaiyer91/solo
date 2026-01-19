# G67: Health Sync UI Components

## Overview

Build the UI components that show health sync status and allow manual sync. This includes sync status indicators, "Sync Now" buttons, and health data display.

## Context

**Source:** Ideation loop --topic "HealthKit integration"
**Design Doc:** docs/mobile/healthkit-integration.md
**Current State:** G65/G66 provide sync functionality. Need UI to expose it.

## Acceptance Criteria

- [ ] Sync status indicator in header/quest board
- [ ] "Sync Now" button with loading state
- [ ] Last sync time display (relative: "2 min ago")
- [ ] Health data summary on quest board
- [ ] Pull-to-refresh triggers sync
- [ ] Success toast when sync completes with quest completions
- [ ] Error state with retry option
- [ ] Health source badge on auto-completed quests

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `mobile/src/components/SyncStatus.tsx` | Create | Sync status indicator |
| `mobile/src/components/HealthSummary.tsx` | Create | Today's health data display |
| `mobile/src/components/QuestCard.tsx` | Modify | Add health source badge |
| `mobile/app/(tabs)/index.tsx` | Modify | Add sync UI to quest board |

## Implementation Notes

### Sync Status Indicator

Shows in header, indicates sync state:

```typescript
// mobile/src/components/SyncStatus.tsx
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { useHealthStore } from '../stores/health';
import { useHealthSync } from '../hooks/useHealthSync';
import { formatDistanceToNow } from 'date-fns';

export function SyncStatus() {
  const { lastSyncTime, syncStatus } = useHealthStore();
  const { sync, isSyncing } = useHealthSync();

  const getStatusText = () => {
    if (isSyncing) return 'Syncing...';
    if (!lastSyncTime) return 'Not synced';
    return `${formatDistanceToNow(lastSyncTime)} ago`;
  };

  return (
    <Pressable 
      onPress={() => sync()}
      disabled={isSyncing}
      style={styles.container}
    >
      <View style={styles.dot}>
        {isSyncing ? (
          <ActivityIndicator size="small" color="#00ff00" />
        ) : (
          <View style={[
            styles.statusDot,
            { backgroundColor: lastSyncTime ? '#00ff00' : '#666' }
          ]} />
        )}
      </View>
      <Text style={styles.text}>
        {getStatusText()}
      </Text>
    </Pressable>
  );
}
```

### Health Summary Card

Shows today's health data at a glance:

```typescript
// mobile/src/components/HealthSummary.tsx
import { View, Text } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { api, queryKeys } from '../lib/api';

interface HealthSnapshot {
  steps: number;
  exerciseMinutes: number;
  workoutCount: number;
  sleepMinutes: number | null;
  activeCalories: number;
}

export function HealthSummary() {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.healthData(),
    queryFn: () => api.get<{ snapshot: HealthSnapshot | null }>('/api/health/today'),
  });

  const snapshot = data?.snapshot;

  if (isLoading || !snapshot) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>TODAY'S ACTIVITY</Text>
      <View style={styles.grid}>
        <StatItem label="Steps" value={snapshot.steps.toLocaleString()} />
        <StatItem label="Exercise" value={`${snapshot.exerciseMinutes}m`} />
        <StatItem label="Workouts" value={snapshot.workoutCount.toString()} />
        <StatItem label="Calories" value={snapshot.activeCalories.toString()} />
      </View>
    </View>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}
```

### Quest Card Health Badge

Shows when a quest was auto-completed from health data:

```typescript
// Addition to QuestCard.tsx
function HealthSourceBadge({ source }: { source: 'HEALTHKIT' | 'GOOGLE_FIT' | 'MANUAL' }) {
  if (source === 'MANUAL') return null;

  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>
        {source === 'HEALTHKIT' ? '❤️ Health' : '📊 Fit'}
      </Text>
    </View>
  );
}

// In QuestCard render:
{quest.completedAt && quest.verificationLevel === 'VERIFIED' && (
  <HealthSourceBadge source={quest.source} />
)}
```

### Pull-to-Refresh Integration

```typescript
// mobile/app/(tabs)/index.tsx
import { RefreshControl, ScrollView } from 'react-native';
import { useHealthSync } from '../../src/hooks/useHealthSync';

export default function QuestBoard() {
  const { sync, isSyncing } = useHealthSync();
  const { refetch: refetchQuests, isRefetching } = useQuests();

  const handleRefresh = async () => {
    await Promise.all([
      sync(),
      refetchQuests(),
    ]);
  };

  return (
    <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={isSyncing || isRefetching}
          onRefresh={handleRefresh}
          tintColor="#00ff00"
        />
      }
    >
      <SyncStatus />
      <HealthSummary />
      <QuestList />
    </ScrollView>
  );
}
```

### Sync Success Toast

```typescript
// In useHealthSync hook
const mutation = useMutation({
  mutationFn: syncHealthData,
  onSuccess: (result) => {
    if (result.success && result.questsCompleted > 0) {
      // Show toast
      Toast.show({
        type: 'success',
        text1: '[SYSTEM]',
        text2: `${result.questsCompleted} quest(s) completed automatically!`,
      });
    }
  },
});
```

## UI States

### Idle (Not Syncing)
- Green dot
- "2 min ago" timestamp
- Tap to sync

### Syncing
- Spinner animation
- "Syncing..."
- Tap disabled

### Success
- Green dot pulse
- Updated timestamp
- Toast if quests completed

### Error
- Red dot
- "Sync failed"
- Tap to retry
- Error toast

## Definition of Done

- [ ] Sync status shows in header
- [ ] Tap syncs immediately
- [ ] Pull-to-refresh works
- [ ] Health summary displays data
- [ ] Toast on quest completion
- [ ] Error handling works
- [ ] No TypeScript errors
- [ ] Matches System aesthetic
