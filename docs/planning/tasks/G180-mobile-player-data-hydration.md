# G180: Mobile Player Data Hydration

## Overview
Complete the player data hydration in mobile app to include all fields used by UI components. Currently `debuffActive` and `activeTitle` are hardcoded/undefined despite backend support.

## Context
**Source:** Ideation loop --focus retrospective
**Related TODOs:**
- `mobile/app/(tabs)/index.tsx:48` - `debuffActive: false, // TODO: get from player data`
- `mobile/src/hooks/usePlayer.ts:108` - `activeTitle: undefined, // TODO: fetch from titles`
**Current State:** Player hook exists but doesn't fetch all available fields

## Acceptance Criteria
- [ ] `usePlayer` hook fetches `debuffActive` status from player stats endpoint
- [ ] `usePlayer` hook fetches `activeTitle` from titles endpoint
- [ ] Dashboard displays actual debuff status (not hardcoded false)
- [ ] Player data includes title information for display
- [ ] Loading states handle async title/debuff fetches

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| mobile/src/hooks/usePlayer.ts | Modify | Add debuff and title fetching |
| mobile/app/(tabs)/index.tsx | Modify | Remove TODO, use real debuffActive |
| mobile/src/lib/api.ts | Modify | Ensure title endpoint available |

## Implementation Notes
- Debuff status comes from `/api/player/stats` or dedicated endpoint
- Active title comes from `/api/player/titles?active=true`
- Consider batching into single player state query for efficiency

## Definition of Done
- [ ] All acceptance criteria met
- [ ] No TypeScript errors
- [ ] TODOs removed from codebase
- [ ] Mobile app shows real debuff/title data
