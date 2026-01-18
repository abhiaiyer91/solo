# G53: Adaptive Quest Targets

## Overview

Implement quest target adaptation based on user baseline and performance history. New users get appropriately scaled targets, and targets adjust over time based on actual performance.

## Context

**Source:** Ideation loop --topic "Realistic leveling and stats system"
**Design Doc:** docs/game-systems/realistic-progression.md
**Current State:** Quest targets are fixed (e.g., 10,000 steps for everyone)

## Acceptance Criteria

- [ ] `adaptedTargets` table stores per-user quest targets
- [ ] New users get targets based on baseline assessment
- [ ] Targets adjust after 14+ days of data
- [ ] Adjustment is gradual (max 10% per period)
- [ ] Manual target override option exists
- [ ] Quest UI shows personalized target
- [ ] XP scales appropriately with adapted targets

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `server/src/db/schema/quests.ts` | Modify | Add adaptedTargets table |
| `server/src/services/quest-adaptation.ts` | Create | Target adaptation logic |
| `server/src/services/quest.ts` | Modify | Use adapted targets |
| `server/src/routes/quests.ts` | Modify | Include adapted targets in response |

## Implementation Notes

### Schema

```typescript
export const adaptedTargets = pgTable('adapted_targets', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id),
  questTemplateId: text('quest_template_id').notNull().references(() => questTemplates.id),
  
  baseTarget: integer('base_target').notNull(),     // Standard target
  adaptedTarget: integer('adapted_target').notNull(), // Personalized
  manualOverride: boolean('manual_override').default(false),
  
  // Performance tracking
  completionRate: real('completion_rate'),          // Last 14 days
  averageAchievement: real('average_achievement'),  // % of target
  
  lastAdaptedAt: timestamp('last_adapted_at'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  userQuestUnique: unique().on(table.userId, table.questTemplateId),
}))
```

### Initial Target Calculation (from baseline)

```typescript
function getInitialTarget(
  questType: string,
  baseline: BaselineAssessment | null
): number {
  const defaults = {
    STEPS: 10000,
    WORKOUT_MINUTES: 30,
    PROTEIN_GRAMS: 150,
    SLEEP_HOURS: 7,
  }
  
  if (!baseline) return defaults[questType] ?? 0
  
  switch (questType) {
    case 'STEPS':
      // Start 20% above their baseline, capped at 10k
      const stepsTarget = Math.ceil(baseline.dailyStepsBaseline * 1.2)
      return Math.min(stepsTarget, 10000)
      
    case 'WORKOUT_MINUTES':
      // Based on current workouts/week
      if (baseline.workoutsPerWeek >= 5) return 45
      if (baseline.workoutsPerWeek >= 3) return 30
      return 20
      
    case 'PROTEIN_GRAMS':
      // Start slightly above current intake
      return Math.ceil(baseline.proteinGramsBaseline * 1.1)
      
    case 'SLEEP_HOURS':
      // Push toward 7-8 hours
      if (baseline.sleepHoursBaseline >= 7) return 7
      return Math.ceil(baseline.sleepHoursBaseline + 0.5)
  }
  
  return defaults[questType] ?? 0
}
```

### Target Adaptation Logic

```typescript
async function adaptTarget(
  userId: string,
  questTemplateId: string
): Promise<{ oldTarget: number; newTarget: number; reason: string }> {
  const current = await getAdaptedTarget(userId, questTemplateId)
  const performance = await getRecentPerformance(userId, questTemplateId, 14)
  
  if (performance.completionCount < 7) {
    return { oldTarget: current, newTarget: current, reason: 'Insufficient data' }
  }
  
  const avgAchievement = performance.averageAchievement // e.g., 1.3 = 130% of target
  
  let newTarget = current
  let reason = 'No change needed'
  
  // Consistently exceeding by >25%? Increase by 10%
  if (avgAchievement > 1.25 && performance.completionRate > 0.8) {
    newTarget = Math.ceil(current * 1.1)
    reason = `Exceeding target by ${Math.round((avgAchievement - 1) * 100)}%`
  }
  
  // Consistently missing by >30%? Decrease by 10%
  if (avgAchievement < 0.7 && performance.completionRate < 0.5) {
    newTarget = Math.floor(current * 0.9)
    reason = `Struggling at current target`
  }
  
  // Apply bounds
  newTarget = Math.max(newTarget, getMinimumTarget(questTemplateId))
  newTarget = Math.min(newTarget, getMaximumTarget(questTemplateId))
  
  await updateAdaptedTarget(userId, questTemplateId, newTarget)
  
  return { oldTarget: current, newTarget, reason }
}
```

### XP Scaling with Adapted Targets

```typescript
function calculateQuestXP(
  baseXP: number,
  targetValue: number,
  actualValue: number,
  isAdaptedTarget: boolean
): number {
  const completionRatio = actualValue / targetValue
  
  // Base XP for meeting target
  if (completionRatio >= 1.0) {
    // Bonus for exceeding, up to 50% extra
    const bonus = Math.min(0.5, (completionRatio - 1) * 0.5)
    return Math.floor(baseXP * (1 + bonus))
  }
  
  // Partial credit (if quest allows)
  if (completionRatio >= 0.5) {
    return Math.floor(baseXP * completionRatio * 0.8)
  }
  
  return 0
}
```

## Definition of Done

- [ ] All acceptance criteria met
- [ ] New users get personalized targets
- [ ] Targets adapt over time appropriately
- [ ] XP scales correctly
- [ ] No TypeScript errors
- [ ] Existing tests pass
