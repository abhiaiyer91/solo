# G174: Mobile Day Reconciliation Flow

## Overview
Create a day reconciliation flow for mobile matching web's reconciliation modal for end-of-day quest confirmation and day closing.

## Context
**Source:** Ideation loop --focus "feature parity for web and mobile"
**Related Docs:** `web/src/components/daily/Reconciliation.tsx`, `web/src/components/daily/DaySummary.tsx`
**Current State:** Mobile has no reconciliation functionality

## Web Reconciliation Features to Replicate
| Feature | Web Status | Mobile Status |
|---------|------------|---------------|
| Reconciliation prompt banner | ✅ Complete | ❌ Missing |
| Pending items list | ✅ Complete | ❌ Missing |
| Confirm/skip per item | ✅ Complete | ❌ Missing |
| Close day button | ✅ Complete | ❌ Missing |
| Day summary modal | ✅ Complete | ❌ Missing |
| Late night mode | ✅ Complete | ❌ Missing |
| Time until midnight | ✅ Complete | ❌ Missing |

## Acceptance Criteria
- [ ] Reconciliation banner when in evening/night phase
- [ ] Pending items list with confirm/skip options
- [ ] Swipe gestures for confirm/skip (mobile-native)
- [ ] Close day functionality
- [ ] Day summary screen after close
- [ ] Late night mode display
- [ ] Time until midnight countdown

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| `mobile/src/screens/Reconciliation.tsx` | Create | Reconciliation screen |
| `mobile/src/components/ReconciliationItem.tsx` | Create | Swipeable item |
| `mobile/src/components/ReconciliationBanner.tsx` | Create | Prompt banner |
| `mobile/src/components/DaySummary.tsx` | Create | End of day summary |
| `mobile/src/components/LateNightMode.tsx` | Create | Late night display |
| `mobile/src/hooks/useReconciliation.ts` | Create | Reconciliation data hook |

## Implementation Notes
- Use react-native-gesture-handler for swipe
- Integrate with useDayStatus hook
- Consider push notification for reconciliation reminder
- Handle timezone correctly for midnight

## Definition of Done
- [ ] All acceptance criteria met
- [ ] No TypeScript errors
- [ ] Existing tests pass
- [ ] Swipe gestures work smoothly
