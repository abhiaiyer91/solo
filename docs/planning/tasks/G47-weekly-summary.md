# G47: Weekly Summary View

## Overview
Show a weekly recap every Monday morning, summarizing the previous week's performance and setting context for the new week.

## Context
**Source:** docs/frontend/daily-rhythm.md
**Related Docs:** G31-daily-reconciliation.md (in progress)
**Current State:** Daily reconciliation exists, no weekly summary

## Acceptance Criteria
- [ ] Weekly summary triggers on Monday first open
- [ ] Shows previous week's stats:
  - Days completed (X/7)
  - Core completion rate
  - XP earned
  - Streak status
- [ ] Comparison to previous week (if applicable)
- [ ] Narrative framing ("The week begins. Last week...")
- [ ] Dismissible, doesn't block interaction
- [ ] Historical weekly summaries viewable in stats

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| web/src/components/weekly/WeeklySummary.tsx | Create | Weekly summary modal |
| web/src/hooks/useWeeklySummary.ts | Create | Hook for weekly data |
| server/src/routes/player.ts | Modify | Add weekly summary endpoint |
| server/src/services/weekly-summary.ts | Create | Weekly calculation service |
| web/src/pages/Dashboard.tsx | Modify | Show weekly summary on Monday |
| web/src/pages/Stats.tsx | Modify | Add weekly history section |

## Implementation Notes
From daily-rhythm.md:
```
MONDAY — DAY 25

The week begins.

Last week:
• Days completed: 6/7
• Core completion: 89%
• XP earned: 847

This week's slate is clean.
What you did last week is recorded.
What you do this week is undetermined.
```

## API Response Shape
```typescript
interface WeeklySummary {
  weekStart: string // ISO date
  weekEnd: string
  daysCompleted: number
  totalDays: number
  coreCompletionRate: number
  xpEarned: number
  streakMaintained: boolean
  comparedToLastWeek?: {
    daysChange: number
    xpChange: number
    completionChange: number
  }
}
```

## Definition of Done
- [ ] All acceptance criteria met
- [ ] No TypeScript errors
- [ ] Existing tests pass
