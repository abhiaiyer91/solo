# G48: Baseline Assessment System

## Overview

Create the data models and API for collecting user baseline fitness data during onboarding. This establishes personalized starting points for stats and quest targets.

## Context

**Source:** Ideation loop --topic "Realistic leveling and stats system"
**Design Doc:** docs/game-systems/realistic-progression.md
**Current State:** Onboarding is narrative-only with no data collection

## Acceptance Criteria

- [ ] `baselineAssessments` table created in schema
- [ ] POST `/api/onboarding/baseline` endpoint saves assessment
- [ ] GET `/api/player/baseline` endpoint retrieves assessment
- [ ] Assessment includes physical, lifestyle, and experience fields
- [ ] Weight can be in kg or lbs (stored as kg internally)
- [ ] Assessment is optional but encouraged

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `server/src/db/schema/assessment.ts` | Create | Baseline assessment table |
| `server/src/db/schema/index.ts` | Modify | Export new schema |
| `server/src/services/baseline.ts` | Create | Baseline service |
| `server/src/routes/onboarding.ts` | Create | Onboarding API routes |
| `server/src/index.ts` | Modify | Mount onboarding routes |

## Implementation Notes

### Schema

```typescript
export const baselineAssessments = pgTable('baseline_assessments', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id).unique(),
  
  // Physical baselines
  startingWeight: real('starting_weight'),      // kg
  targetWeight: real('target_weight'),          // kg (optional)
  height: real('height'),                       // cm
  pushUpsMax: integer('push_ups_max'),
  plankHoldSeconds: integer('plank_hold_seconds'),
  mileTimeMinutes: real('mile_time_minutes'),
  dailyStepsBaseline: integer('daily_steps_baseline'),
  workoutsPerWeek: integer('workouts_per_week'),
  
  // Lifestyle
  sleepHoursBaseline: real('sleep_hours_baseline'),
  proteinGramsBaseline: integer('protein_grams_baseline'),
  alcoholDrinksPerWeek: integer('alcohol_drinks_per_week'),
  
  // Experience
  fitnessExperience: text('fitness_experience'),  // beginner|intermediate|advanced
  hasGymAccess: boolean('has_gym_access').default(false),
  hasHomeEquipment: boolean('has_home_equipment').default(false),
  
  assessedAt: timestamp('assessed_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})
```

### API Endpoints

```typescript
// POST /api/onboarding/baseline
// Request body matches BaselineAssessment interface
// Returns: { success: true, stats: { str, agi, vit, disc } }

// GET /api/player/baseline
// Returns full assessment or null if not completed
```

### Unit conversion helper

```typescript
function lbsToKg(lbs: number): number {
  return lbs * 0.453592
}

function kgToLbs(kg: number): number {
  return kg * 2.20462
}
```

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Assessment data persists correctly
- [ ] Stats calculated from baseline
- [ ] No TypeScript errors
- [ ] Existing tests pass
