# G175: Mobile Weekly Summary

## Overview
Create a weekly summary feature for mobile matching web's weekly summary modal shown on Mondays to recap the previous week's performance.

## Context
**Source:** Ideation loop --focus "feature parity for web and mobile"
**Related Docs:** `web/src/components/weekly/WeeklySummary.tsx`
**Current State:** Mobile has no weekly summary functionality

## Web Weekly Summary Features to Replicate
| Feature | Web Status | Mobile Status |
|---------|------------|---------------|
| Monday check trigger | ✅ Complete | ❌ Missing |
| Week stats (XP, quests, streaks) | ✅ Complete | ❌ Missing |
| Day breakdown | ✅ Complete | ❌ Missing |
| Comparison to previous week | ✅ Complete | ❌ Missing |
| Dismiss and remember | ✅ Complete | ❌ Missing |
| Weekly history view | ✅ Complete | ❌ Missing |

## Acceptance Criteria
- [ ] Show weekly summary modal on Monday (if not dismissed)
- [ ] Week stats: total XP, quests completed, streak maintained
- [ ] Day-by-day breakdown visualization
- [ ] Comparison to previous week (trend)
- [ ] Dismiss button with local storage
- [ ] Weekly history in Stats page

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| `mobile/src/components/WeeklySummaryModal.tsx` | Create | Summary modal |
| `mobile/src/components/WeekDayBreakdown.tsx` | Create | Daily breakdown vis |
| `mobile/src/components/WeekCompare.tsx` | Create | Week-over-week compare |
| `mobile/src/hooks/useWeeklySummary.ts` | Create | Summary data hook |

## Implementation Notes
- Check day of week on app open
- Store dismissed week in AsyncStorage
- Animate modal appearance
- Consider push notification for Monday summary

## Definition of Done
- [ ] All acceptance criteria met
- [ ] No TypeScript errors
- [ ] Existing tests pass
- [ ] Modal shows correctly on Mondays
