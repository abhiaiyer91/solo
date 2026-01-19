# G104: Player Analytics Dashboard

## Overview

Build a comprehensive analytics dashboard that gives players deep insight into their fitness journey patterns, trends, and progress over time.

## Context

**Source:** Ideation loop - player engagement analysis
**Current State:** Basic stats page exists; no trend analysis or pattern visualization

## Acceptance Criteria

- [ ] Weekly/monthly/all-time view toggle for analytics
- [ ] Quest completion rate trends (line chart)
- [ ] Stat progression charts showing STR/AGI/VIT/DISC over time
- [ ] Best day/week identification with breakdown
- [ ] Streak analytics (longest, current, patterns)
- [ ] Time-of-day completion patterns (heatmap)
- [ ] XP earning velocity trends
- [ ] Comparison with personal bests

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| web/src/pages/Analytics.tsx | Create | Main analytics dashboard page |
| web/src/components/analytics/TrendChart.tsx | Create | Reusable trend line chart |
| web/src/components/analytics/HeatmapCalendar.tsx | Create | Activity heatmap |
| web/src/hooks/useAnalytics.ts | Create | Data fetching hook |
| server/src/routes/analytics.ts | Create | Analytics API endpoints |
| server/src/services/analytics.ts | Create | Analytics computation service |

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Charts are performant with large datasets
- [ ] Mobile-responsive layout
- [ ] No TypeScript errors
