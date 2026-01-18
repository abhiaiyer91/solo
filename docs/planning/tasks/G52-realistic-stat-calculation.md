# G52: Realistic Stat Calculation

## Overview

Implement stat calculation based on real-world benchmarks. Stats (STR, AGI, VIT, DISC) should reflect actual fitness capabilities and progress from baseline assessments.

## Context

**Source:** Ideation loop --topic "Realistic leveling and stats system"
**Design Doc:** docs/game-systems/realistic-progression.md
**Current State:** Stats are fixed at 10, not calculated from any data

## Acceptance Criteria

- [ ] Stats calculated from baseline + activity history
- [ ] GET `/api/stats/breakdown` returns stat with explanation
- [ ] GET `/api/stats/milestones` returns next milestone per stat
- [ ] Stats update after relevant quest completions
- [ ] Real-world equivalents displayed (e.g., "STR 25 = 20-30 push-ups")
- [ ] Stat capped at 100

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `server/src/services/stats.ts` | Create | Stat calculation service |
| `server/src/routes/stats.ts` | Create | Stats API endpoints |
| `server/src/index.ts` | Modify | Mount stats routes |
| `server/src/lib/stat-benchmarks.ts` | Create | Real-world benchmark mappings |

## Implementation Notes

### Stat Benchmarks

```typescript
// server/src/lib/stat-benchmarks.ts

export interface StatBenchmark {
  value: number
  label: string
  realWorldEquivalent: string
}

export const STR_BENCHMARKS: StatBenchmark[] = [
  { value: 10, label: 'Baseline', realWorldEquivalent: 'Cannot do push-up' },
  { value: 15, label: 'Beginner', realWorldEquivalent: '5-10 push-ups' },
  { value: 25, label: 'Developing', realWorldEquivalent: '20-30 push-ups' },
  { value: 40, label: 'Solid', realWorldEquivalent: '50+ push-ups, pull-ups' },
  { value: 60, label: 'Athletic', realWorldEquivalent: 'Bench bodyweight' },
  { value: 80, label: 'Competitive', realWorldEquivalent: '1.5x bodyweight bench' },
  { value: 100, label: 'Elite', realWorldEquivalent: '2x bodyweight bench' },
]

export const AGI_BENCHMARKS: StatBenchmark[] = [
  { value: 10, label: 'Sedentary', realWorldEquivalent: '<5,000 steps/day' },
  { value: 15, label: 'Below Average', realWorldEquivalent: '5,000-7,500 steps' },
  { value: 25, label: 'Active', realWorldEquivalent: '10,000+ steps, regular cardio' },
  { value: 40, label: 'Fit', realWorldEquivalent: '5K runner (<30 min)' },
  { value: 60, label: 'Athletic', realWorldEquivalent: 'Half marathon capable' },
  { value: 80, label: 'Competitive', realWorldEquivalent: 'Marathon runner' },
  { value: 100, label: 'Elite', realWorldEquivalent: 'Ultra-endurance athlete' },
]

export const VIT_BENCHMARKS: StatBenchmark[] = [
  { value: 10, label: 'Poor', realWorldEquivalent: 'Poor sleep, poor diet' },
  { value: 15, label: 'Trying', realWorldEquivalent: 'Occasional good choices' },
  { value: 25, label: 'Foundation', realWorldEquivalent: '7+ hr sleep, protein targets' },
  { value: 40, label: 'Solid', realWorldEquivalent: 'Optimized recovery' },
  { value: 60, label: 'Athletic', realWorldEquivalent: 'Athletic-level recovery' },
  { value: 80, label: 'Competitive', realWorldEquivalent: 'Pro-level recovery' },
  { value: 100, label: 'Elite', realWorldEquivalent: 'Peak recovery capacity' },
]

export const DISC_BENCHMARKS: StatBenchmark[] = [
  { value: 10, label: 'New', realWorldEquivalent: 'No consistency history' },
  { value: 15, label: 'Starting', realWorldEquivalent: '1-week streaks' },
  { value: 25, label: 'Building', realWorldEquivalent: '2-4 week streaks' },
  { value: 40, label: 'Habit Forming', realWorldEquivalent: '30+ day streaks' },
  { value: 60, label: 'Established', realWorldEquivalent: '90+ day streaks' },
  { value: 80, label: 'Lifestyle', realWorldEquivalent: '180+ day streaks' },
  { value: 100, label: 'Identity', realWorldEquivalent: '365+ days, never broken' },
]
```

### Stat Calculation

```typescript
// server/src/services/stats.ts

interface StatCalculationResult {
  value: number
  baselineContribution: number
  activityContribution: number
  currentBenchmark: StatBenchmark
  nextMilestone: StatBenchmark | null
  progressToNext: number  // 0-100%
}

export async function calculateStat(
  userId: string,
  statType: 'STR' | 'AGI' | 'VIT' | 'DISC'
): Promise<StatCalculationResult> {
  const baseline = await getBaselineAssessment(userId)
  const activities = await getRecentActivities(userId, statType, 30)
  
  // Start from baseline
  const baselineValue = getBaselineStatValue(baseline, statType)
  
  // Add progression from activities
  const activityValue = calculateActivityProgression(activities, statType)
  
  // Total (capped at 100)
  const total = Math.min(100, baselineValue + activityValue)
  
  const benchmarks = getBenchmarksForStat(statType)
  const current = getCurrentBenchmark(total, benchmarks)
  const next = getNextMilestone(total, benchmarks)
  
  return {
    value: total,
    baselineContribution: baselineValue,
    activityContribution: activityValue,
    currentBenchmark: current,
    nextMilestone: next,
    progressToNext: next ? ((total - current.value) / (next.value - current.value)) * 100 : 100,
  }
}

function getBaselineStatValue(baseline: BaselineAssessment | null, type: string): number {
  if (!baseline) return 10
  
  switch (type) {
    case 'STR':
      if (baseline.pushUpsMax >= 50) return 35
      if (baseline.pushUpsMax >= 20) return 22
      if (baseline.pushUpsMax >= 10) return 15
      if (baseline.pushUpsMax >= 5) return 12
      return 10
      
    case 'AGI':
      if (baseline.dailyStepsBaseline >= 12000) return 28
      if (baseline.dailyStepsBaseline >= 10000) return 23
      if (baseline.dailyStepsBaseline >= 7500) return 18
      if (baseline.dailyStepsBaseline >= 5000) return 14
      return 10
      
    case 'VIT':
      let vitScore = 10
      if (baseline.sleepHoursBaseline >= 7) vitScore += 5
      if (baseline.proteinGramsBaseline >= 100) vitScore += 5
      if (baseline.alcoholDrinksPerWeek <= 3) vitScore += 5
      return vitScore
      
    case 'DISC':
      // Discipline starts low and is earned through streaks
      return 10
  }
  return 10
}
```

### API Response

```typescript
// GET /api/stats/breakdown?stat=STR
{
  stat: 'STR',
  value: 25,
  breakdown: {
    baseline: 12,
    activity: 13
  },
  benchmark: {
    current: { value: 25, label: 'Developing', realWorldEquivalent: '20-30 push-ups' },
    next: { value: 40, label: 'Solid', realWorldEquivalent: '50+ push-ups, pull-ups' },
    progressToNext: 0  // Just hit 25
  },
  howToImprove: [
    'Complete strength workouts',
    'Track push-up progress',
    'Progressive overload training'
  ]
}
```

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Stats reflect real capabilities
- [ ] Milestones are motivating and achievable
- [ ] No TypeScript errors
- [ ] Existing tests pass
