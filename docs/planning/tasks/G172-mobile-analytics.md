# G172: Mobile Analytics Screen

## Overview
Create an analytics dashboard screen for mobile matching web's Analytics page with progress tracking, trend charts, activity heatmap, and personal records.

## Context
**Source:** Ideation loop --focus "feature parity for web and mobile"
**Related Docs:** `web/src/pages/Analytics.tsx`
**Current State:** Mobile has no analytics functionality

## Web Analytics Features to Replicate
| Feature | Web Status | Mobile Status |
|---------|------------|---------------|
| Period selector (week/month/alltime) | ✅ Complete | ❌ Missing |
| Summary cards (completion, XP, streaks) | ✅ Complete | ❌ Missing |
| Quest completion trend chart | ✅ Complete | ❌ Missing |
| XP earned trend chart | ✅ Complete | ❌ Missing |
| Activity heatmap calendar | ✅ Complete | ❌ Missing |
| Personal records section | ✅ Complete | ❌ Missing |

## Acceptance Criteria
- [ ] Period selector (7 days, 30 days, all time)
- [ ] Summary cards: quest completion rate, XP earned, streak, best day
- [ ] Trend indicators (up/down arrows)
- [ ] Quest completion trend chart
- [ ] XP earned trend chart
- [ ] Activity heatmap (last 90 days)
- [ ] Personal records: best day XP, best week, most quests

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| `mobile/src/screens/Analytics.tsx` | Create | Analytics dashboard screen |
| `mobile/src/components/analytics/SummaryCard.tsx` | Create | Summary statistic card |
| `mobile/src/components/analytics/TrendChart.tsx` | Create | Line/bar trend chart |
| `mobile/src/components/analytics/HeatmapCalendar.tsx` | Create | Activity heatmap |
| `mobile/src/components/analytics/PersonalBests.tsx` | Create | Personal records |
| `mobile/src/hooks/useAnalytics.ts` | Create | Analytics data hooks |

## Implementation Notes
- Use victory-native or react-native-chart-kit for charts
- Heatmap may need horizontal scroll on mobile
- Cache analytics data (refresh on pull)
- Consider simplified view for smaller screens

## Definition of Done
- [ ] All acceptance criteria met
- [ ] No TypeScript errors
- [ ] Existing tests pass
- [ ] Charts render smoothly
