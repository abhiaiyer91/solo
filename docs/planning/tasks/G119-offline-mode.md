# G119: Mobile Offline Mode Support

## Overview
Enable mobile app to work offline with local caching and background sync.

## Acceptance Criteria
- [ ] Cache player data locally
- [ ] Queue quest completions for sync
- [ ] Show offline indicator
- [ ] Sync when connection restored
- [ ] Handle conflict resolution

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| `mobile/src/lib/offline.ts` | Create | Offline utilities |
| `mobile/src/stores/offline.ts` | Create | Offline queue store |
| `mobile/src/hooks/useOffline.ts` | Create | Offline status hook |
| `mobile/src/components/OfflineIndicator.tsx` | Create | UI indicator |

## Definition of Done
- [ ] App works without network
- [ ] Data syncs correctly
- [ ] No TypeScript errors
