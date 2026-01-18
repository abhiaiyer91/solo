import {
  pgTable,
  text,
  real,
  integer,
  boolean,
  timestamp,
  index,
} from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'
import { users } from './auth'

// Baseline Assessment - User's initial fitness data collected during onboarding
export const baselineAssessments = pgTable(
  'baseline_assessments',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' })
      .unique(),

    // Physical baselines
    startingWeight: real('starting_weight'), // kg
    targetWeight: real('target_weight'), // kg (optional)
    height: real('height'), // cm
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
    fitnessExperience: text('fitness_experience'), // beginner | intermediate | advanced
    hasGymAccess: boolean('has_gym_access').default(false),
    hasHomeEquipment: boolean('has_home_equipment').default(false),

    assessedAt: timestamp('assessed_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    userIdx: index('baseline_user_idx').on(table.userId),
  })
)

export type BaselineAssessment = typeof baselineAssessments.$inferSelect
export type NewBaselineAssessment = typeof baselineAssessments.$inferInsert

// Input type for API (allows lbs or kg)
export interface BaselineAssessmentInput {
  // Physical baselines
  startingWeight?: number
  weightUnit?: 'kg' | 'lbs'
  targetWeight?: number
  height?: number // cm
  pushUpsMax?: number
  plankHoldSeconds?: number
  mileTimeMinutes?: number
  dailyStepsBaseline?: number
  workoutsPerWeek?: number

  // Lifestyle
  sleepHoursBaseline?: number
  proteinGramsBaseline?: number
  alcoholDrinksPerWeek?: number

  // Experience
  fitnessExperience?: 'beginner' | 'intermediate' | 'advanced'
  hasGymAccess?: boolean
  hasHomeEquipment?: boolean
}
