# G170: Mobile Quest History Screen

## Overview
Create a quest history screen for mobile matching web's QuestHistory page showing historical quest completion data, statistics, and trends.

## Context
**Source:** Ideation loop --focus "feature parity for web and mobile"
**Related Docs:** `web/src/pages/QuestHistory.tsx`
**Current State:** Mobile has no quest history functionality

## Web Quest History Features to Replicate
| Feature | Web Status | Mobile Status |
|---------|------------|---------------|
| Date range filter (7d/30d/90d/all) | ✅ Complete | ❌ Missing |
| Status filter (all/completed/partial/missed) | ✅ Complete | ❌ Missing |
| Stats summary cards | ✅ Complete | ❌ Missing |
| Completion trend chart | ✅ Complete | ❌ Missing |
| Quest log list | ✅ Complete | ❌ Missing |

## Acceptance Criteria
- [ ] Date range filter (7 days, 30 days, 90 days, all time)
- [ ] Status filter (all, completed, partial, missed)
- [ ] Stats summary (total quests, completion rate, partial, missed)
- [ ] Completion trend mini-chart
- [ ] Quest history list with status indicators
- [ ] XP earned per quest display
- [ ] Pull-to-refresh for updated data

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| `mobile/src/screens/QuestHistory.tsx` | Create | Quest history screen |
| `mobile/src/components/HistoryFilterBar.tsx` | Create | Date/status filters |
| `mobile/src/components/HistoryStatsCards.tsx` | Create | Summary statistics |
| `mobile/src/components/CompletionTrendChart.tsx` | Create | Mini trend chart |
| `mobile/src/components/QuestHistoryItem.tsx` | Create | Individual history entry |
| `mobile/src/hooks/useQuestHistory.ts` | Create | History data hook |

## Implementation Notes
- Use victory-native or react-native-chart-kit for trend chart
- Implement virtualized list for performance
- Cache history data for offline viewing

## Definition of Done
- [ ] All acceptance criteria met
- [ ] No TypeScript errors
- [ ] Existing tests pass
- [ ] Filters work correctly
