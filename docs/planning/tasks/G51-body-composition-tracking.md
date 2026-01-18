# G51: Body Composition Tracking

## Overview

Implement body composition and calorie deficit tracking as a progression mechanic. Weight loss (when opted in) converts to XP using the 3500 calorie = 1 lb principle.

## Context

**Source:** Ideation loop --topic "Realistic leveling and stats system"
**Design Doc:** docs/game-systems/realistic-progression.md
**Current State:** No weight or calorie tracking exists

## Acceptance Criteria

- [ ] `bodyCompositionLogs` table stores daily entries
- [ ] POST `/api/body-composition` logs weight and calories
- [ ] GET `/api/body-composition/progress` returns summary
- [ ] XP awarded for calorie deficit milestones (opt-in)
- [ ] Weekly deficit calculation (3500 cal = 1 lb)
- [ ] Weight trend chart data available
- [ ] Privacy: tracking is opt-in via user preference

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `server/src/db/schema/body.ts` | Create | Body composition tables |
| `server/src/db/schema/index.ts` | Modify | Export new schema |
| `server/src/services/body-composition.ts` | Create | Body tracking service |
| `server/src/routes/body.ts` | Create | Body composition API |
| `server/src/index.ts` | Modify | Mount body routes |
| `server/src/db/schema/auth.ts` | Modify | Add trackBodyComposition to users |

## Implementation Notes

### Schema

```typescript
export const bodyCompositionLogs = pgTable('body_composition_logs', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id),
  
  date: text('date').notNull(),                 // YYYY-MM-DD
  weight: real('weight'),                       // kg
  caloriesConsumed: integer('calories_consumed'),
  caloriesBurned: integer('calories_burned'),   // Active calories
  netCalories: integer('net_calories'),         // Computed: consumed - burned - bmr
  
  // Optional detailed tracking
  bodyFatPercent: real('body_fat_percent'),
  muscleMass: real('muscle_mass'),              // kg
  
  recordedAt: timestamp('recorded_at').defaultNow(),
}, (table) => ({
  userDateUnique: unique().on(table.userId, table.date),
  userDateIdx: index('body_log_user_date_idx').on(table.userId, table.date),
}))
```

### Add to users table

```typescript
// In users table
trackBodyComposition: boolean('track_body_composition').default(false).notNull(),
```

### Calorie Deficit → XP Conversion

```typescript
const CALORIES_PER_POUND = 3500
const XP_PER_POUND_LOST = 100

async function processWeeklyDeficit(userId: string): Promise<{
  totalDeficit: number
  poundsLost: number
  xpAwarded: number
}> {
  const weeklyLogs = await getLogsForPastDays(userId, 7)
  
  const totalDeficit = weeklyLogs.reduce((sum, log) => {
    return sum + (log.netCalories < 0 ? Math.abs(log.netCalories) : 0)
  }, 0)
  
  const poundsLost = totalDeficit / CALORIES_PER_POUND
  const xpAwarded = Math.floor(poundsLost * XP_PER_POUND_LOST)
  
  if (xpAwarded > 0) {
    await createXPEvent({
      userId,
      source: 'BODY_COMPOSITION',
      baseAmount: xpAwarded,
      description: `Calorie deficit: ${totalDeficit} cal (~${poundsLost.toFixed(1)} lb)`,
    })
  }
  
  return { totalDeficit, poundsLost, xpAwarded }
}
```

### API Endpoints

```typescript
// POST /api/body-composition
// Body: { date, weight?, caloriesConsumed?, caloriesBurned?, bodyFatPercent?, muscleMass? }
// Note: At least one field required

// GET /api/body-composition/progress
// Query: ?days=30 (default)
// Returns: {
//   logs: BodyCompositionLog[],
//   summary: {
//     startWeight, currentWeight, weightChange,
//     totalDeficit, projectedLoss,
//     trend: 'losing' | 'stable' | 'gaining'
//   }
// }
```

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Weight tracking is opt-in
- [ ] XP awarded correctly for deficits
- [ ] Weekly reconciliation job runs
- [ ] No TypeScript errors
- [ ] Existing tests pass
