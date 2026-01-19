# G64: HealthKit Permissions Screen

## Overview

Create the onboarding screen that explains why we need HealthKit access and requests permissions. This screen should follow the "Journey/System" aesthetic and handle all permission states gracefully.

## Context

**Source:** Ideation loop --topic "HealthKit integration"
**Design Doc:** docs/mobile/healthkit-integration.md
**Current State:** G56 provides the authorization hook. Need UI to present it.

## Acceptance Criteria

- [ ] Health permissions screen in onboarding flow
- [ ] Clear explanation of what data is accessed and why
- [ ] "Grant Access" button triggers HealthKit permission dialog
- [ ] "Skip" option for users who prefer manual entry
- [ ] Success state shown when permissions granted
- [ ] Denial handled gracefully with explanation
- [ ] Partial permissions handled (some types granted, others denied)
- [ ] Screen follows SystemWindow aesthetic

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `mobile/app/onboarding/health.tsx` | Create | Permissions request screen |
| `mobile/src/components/HealthPermissionCard.tsx` | Create | Card showing requested permissions |
| `mobile/app/onboarding/_layout.tsx` | Modify | Add health screen to flow |
| `mobile/src/stores/health.ts` | Create | Health permission state |

## Implementation Notes

### Screen Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  [THE SYSTEM]                                     [SKIP]        │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                                                             │ │
│  │            ❤️ HEALTH DATA ACCESS                           │ │
│  │                                                             │ │
│  │  The System requires access to your health data            │ │
│  │  to track your progress automatically.                     │ │
│  │                                                             │ │
│  │  ─────────────────────────────────────────────────────────│ │
│  │                                                             │ │
│  │  ✓ Steps                                                   │ │
│  │    Track your daily movement quest                         │ │
│  │                                                             │ │
│  │  ✓ Workouts                                                │ │
│  │    Detect strength training sessions                       │ │
│  │                                                             │ │
│  │  ✓ Exercise Minutes                                        │ │
│  │    Monitor your active time                                │ │
│  │                                                             │ │
│  │  ✓ Sleep                                                   │ │
│  │    Track recovery and discipline                           │ │
│  │                                                             │ │
│  │  ─────────────────────────────────────────────────────────│ │
│  │                                                             │ │
│  │  Your data stays on your device.                           │ │
│  │  We only sync daily totals to calculate quests.            │ │
│  │                                                             │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                   GRANT ACCESS                              │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Permission States

```typescript
type PermissionState = 
  | 'initial'        // Not yet requested
  | 'requesting'     // Dialog showing
  | 'granted'        // Full access
  | 'partial'        // Some permissions granted
  | 'denied'         // All denied
  | 'skipped';       // User chose manual mode

function getNextRoute(state: PermissionState): string {
  switch (state) {
    case 'granted':
    case 'partial':
      return '/onboarding/sync';  // Show initial sync
    case 'denied':
    case 'skipped':
      return '/onboarding/manual'; // Explain manual mode
    default:
      return '/';
  }
}
```

### Denied State UI

```
┌─────────────────────────────────────────────────────────────────┐
│  MANUAL MODE ENABLED                                             │
│                                                                  │
│  Health access was not granted.                                 │
│  You will need to log activities manually.                      │
│                                                                  │
│  You can enable access later in:                                │
│  Settings > Privacy > Health > Journey                          │
│                                                                  │
│  [CONTINUE]                                                     │
└─────────────────────────────────────────────────────────────────┘
```

## Component Structure

```typescript
// mobile/app/onboarding/health.tsx
export default function HealthPermissionsScreen() {
  const { status, requestAuth, isAuthorized, isDenied, needsRequest } = useHealthAuth();
  const [isRequesting, setIsRequesting] = useState(false);
  const router = useRouter();

  async function handleGrantAccess() {
    setIsRequesting(true);
    try {
      await requestAuth();
    } finally {
      setIsRequesting(false);
    }
  }

  // Navigate after permission change
  useEffect(() => {
    if (isAuthorized) {
      router.replace('/onboarding/sync');
    }
  }, [isAuthorized]);

  if (isDenied) {
    return <DeniedState onContinue={() => router.replace('/(tabs)')} />;
  }

  return (
    <SystemWindow title="HEALTH DATA ACCESS">
      <PermissionsList />
      <PrivacyNote />
      <Button 
        onPress={handleGrantAccess} 
        loading={isRequesting}
      >
        GRANT ACCESS
      </Button>
    </SystemWindow>
  );
}
```

## Definition of Done

- [ ] Screen renders with proper styling
- [ ] Grant Access triggers iOS permission dialog
- [ ] Skip navigates to main app with manual mode
- [ ] Granted state navigates forward
- [ ] Denied state shows helpful message
- [ ] No TypeScript errors
- [ ] Works on physical device
