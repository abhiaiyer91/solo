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

// Psychology Profile - AI-assessed motivation and behavioral patterns
export const psychologyProfiles = pgTable(
  'psychology_profiles',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' })
      .unique(),

    // Extracted traits from AI conversation
    motivationType: text('motivation_type'), // achievement | social | mastery | health
    primaryBarrier: text('primary_barrier'), // time | motivation | knowledge | injury | other
    consistencyRisk: text('consistency_risk'), // low | medium | high
    pressureResponse: text('pressure_response'), // positive | neutral | negative
    accountabilityPreference: text('accountability_preference'), // solo | partner | group

    // AI conversation log
    conversationLog: text('conversation_log'), // JSON array of { role, content }

    // AI-generated insights
    insights: text('insights'), // JSON array of strings
    recommendedApproach: text('recommended_approach'),

    // Status
    status: text('status').default('in_progress'), // in_progress | completed

    assessedAt: timestamp('assessed_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    userIdx: index('psychology_user_idx').on(table.userId),
    statusIdx: index('psychology_status_idx').on(table.status),
  })
)

export type PsychologyProfile = typeof psychologyProfiles.$inferSelect
export type NewPsychologyProfile = typeof psychologyProfiles.$inferInsert

// Psychology conversation message type
export interface PsychologyMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
  timestamp?: string
}

// Extracted psychology traits
export interface PsychologyTraits {
  motivationType: 'achievement' | 'social' | 'mastery' | 'health'
  primaryBarrier: 'time' | 'motivation' | 'knowledge' | 'injury' | 'other'
  consistencyRisk: 'low' | 'medium' | 'high'
  pressureResponse: 'positive' | 'neutral' | 'negative'
  accountabilityPreference: 'solo' | 'partner' | 'group'
  insights: string[]
  recommendedApproach: string
}

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
