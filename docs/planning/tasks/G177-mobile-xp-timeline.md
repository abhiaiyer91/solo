# G177: Mobile XP Timeline

## Overview
Create an XP timeline/history screen for mobile matching web's XP timeline showing historical XP gains with breakdown details.

## Context
**Source:** Ideation loop --focus "feature parity for web and mobile"
**Related Docs:** `web/src/components/xp/XPTimeline.tsx`, `web/src/components/xp/XPTimelineItem.tsx`
**Current State:** Mobile has DailyXPSummary but no detailed timeline

## Web XP Timeline Features to Replicate
| Feature | Web Status | Mobile Status |
|---------|------------|---------------|
| XP history list | ✅ Complete | ❌ Missing |
| XP breakdown modal | ✅ Complete | ❌ Missing |
| Infinite scroll | ✅ Complete | ❌ Missing |
| Source display (quest/streak/bonus) | ✅ Complete | ❌ Missing |
| Timestamp display | ✅ Complete | ❌ Missing |

## Acceptance Criteria
- [ ] XP timeline list with recent gains
- [ ] Each item shows: XP amount, source, time
- [ ] Tap to see breakdown (base XP, modifiers)
- [ ] Infinite scroll for older entries
- [ ] Pull-to-refresh for latest
- [ ] Visual grouping by day

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| `mobile/src/screens/XPTimeline.tsx` | Create | XP history screen |
| `mobile/src/components/XPTimelineItem.tsx` | Create | Individual XP entry |
| `mobile/src/components/XPBreakdownModal.tsx` | Create | Breakdown details |
| `mobile/src/hooks/useXPTimeline.ts` | Create | Timeline data hook |

## Implementation Notes
- Use FlatList with onEndReached for infinite scroll
- Group items by date for readability
- Cache timeline data for offline viewing

## Definition of Done
- [ ] All acceptance criteria met
- [ ] No TypeScript errors
- [ ] Existing tests pass
- [ ] Infinite scroll works smoothly
