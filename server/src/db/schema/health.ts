import {
  pgTable,
  pgEnum,
  text,
  integer,
  real,
  boolean,
  timestamp,
  jsonb,
  index,
} from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'
import { users } from './auth'

// Enums for health data
export const healthDataSourceEnum = pgEnum('health_data_source', [
  'HEALTHKIT',
  'GOOGLE_FIT',
  'MANUAL',
])

export const verificationLevelEnum = pgEnum('verification_level', [
  'VERIFIED', // Hardware-confirmed (steps from HealthKit)
  'IMPORTED', // From trusted source (workout from fitness app)
  'SELF_REPORTED', // User claims it
  'ESTIMATED', // System inferred
])

// Health Snapshots - Daily health data from mobile apps
export const healthSnapshots = pgTable(
  'health_snapshots',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    // Date the snapshot is for (YYYY-MM-DD format)
    snapshotDate: text('snapshot_date').notNull(),

    // Primary health metrics
    steps: integer('steps').default(0),
    stepsVerification: verificationLevelEnum('steps_verification').default('SELF_REPORTED'),

    exerciseMinutes: integer('exercise_minutes').default(0),
    exerciseMinutesVerification: verificationLevelEnum('exercise_minutes_verification').default(
      'SELF_REPORTED'
    ),

    sleepMinutes: integer('sleep_minutes'),
    sleepVerification: verificationLevelEnum('sleep_verification').default('SELF_REPORTED'),

    workoutCount: integer('workout_count').default(0),
    workoutMinutes: integer('workout_minutes').default(0),
    workoutVerification: verificationLevelEnum('workout_verification').default('SELF_REPORTED'),

    // Additional metrics
    activeCalories: integer('active_calories'),
    caloriesVerification: verificationLevelEnum('calories_verification').default('SELF_REPORTED'),

    // Nutrition tracking (simplified)
    proteinLogged: boolean('protein_logged').default(false),
    proteinVerification: verificationLevelEnum('protein_verification').default('SELF_REPORTED'),

    // Data source tracking
    primarySource: healthDataSourceEnum('primary_source').default('MANUAL'),

    // Raw data from health APIs (for debugging/analysis)
    rawHealthData: jsonb('raw_health_data').$type<RawHealthData>(),

    // Sync metadata
    lastSyncedAt: timestamp('last_synced_at').defaultNow(),
    syncCount: integer('sync_count').default(1),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    userDateIdx: index('health_snapshots_user_date_idx').on(table.userId, table.snapshotDate),
    userSourceIdx: index('health_snapshots_user_source_idx').on(table.userId, table.primarySource),
  })
)

// Workout records - individual workout sessions
export const workoutRecords = pgTable(
  'workout_records',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    snapshotId: text('snapshot_id').references(() => healthSnapshots.id, { onDelete: 'set null' }),

    // Workout details
    workoutType: text('workout_type').notNull(), // e.g., 'running', 'strength', 'cycling'
    startTime: timestamp('start_time').notNull(),
    endTime: timestamp('end_time'),
    durationMinutes: integer('duration_minutes').notNull(),

    // Metrics
    calories: integer('calories'),
    distance: real('distance'), // in meters
    heartRateAvg: integer('heart_rate_avg'),
    heartRateMax: integer('heart_rate_max'),

    // Source and verification
    source: healthDataSourceEnum('source').default('MANUAL'),
    verification: verificationLevelEnum('verification').default('SELF_REPORTED'),

    // External IDs for deduplication
    externalId: text('external_id'), // ID from HealthKit/GoogleFit

    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    userDateIdx: index('workout_records_user_date_idx').on(table.userId, table.startTime),
    externalIdx: index('workout_records_external_idx').on(table.userId, table.externalId),
  })
)

// Type definitions for raw health data
export interface RawHealthData {
  // HealthKit data structure
  healthkit?: {
    stepCount?: number
    activeEnergyBurned?: number
    appleExerciseTime?: number
    sleepAnalysis?: {
      asleep?: number
      inBed?: number
    }
    workouts?: Array<{
      workoutType: string
      duration: number
      calories?: number
      distance?: number
      startDate: string
      endDate: string
    }>
  }
  // Google Fit data structure
  googleFit?: {
    steps?: number
    calories?: number
    moveMinutes?: number
    heartMinutes?: number
    sleep?: {
      sleepMinutes?: number
    }
    workouts?: Array<{
      activityType: string
      duration: number
      calories?: number
      distance?: number
      startTime: string
      endTime: string
    }>
  }
  // Any additional metadata
  metadata?: Record<string, unknown>
}

// Health sync request types
export interface HealthSyncRequest {
  date?: string // YYYY-MM-DD, defaults to today
  source: 'HEALTHKIT' | 'GOOGLE_FIT' | 'MANUAL'
  data: {
    steps?: number
    exerciseMinutes?: number
    sleepMinutes?: number
    workouts?: Array<{
      type: string
      durationMinutes: number
      calories?: number
      distance?: number
      startTime: string
      endTime?: string
      externalId?: string
    }>
    activeCalories?: number
    proteinLogged?: boolean
  }
  rawData?: RawHealthData
}

export interface HealthSnapshot {
  id: string
  userId: string
  snapshotDate: string
  steps: number | null
  stepsVerification: 'VERIFIED' | 'IMPORTED' | 'SELF_REPORTED' | 'ESTIMATED' | null
  exerciseMinutes: number | null
  exerciseMinutesVerification: 'VERIFIED' | 'IMPORTED' | 'SELF_REPORTED' | 'ESTIMATED' | null
  sleepMinutes: number | null
  sleepVerification: 'VERIFIED' | 'IMPORTED' | 'SELF_REPORTED' | 'ESTIMATED' | null
  workoutCount: number | null
  workoutMinutes: number | null
  workoutVerification: 'VERIFIED' | 'IMPORTED' | 'SELF_REPORTED' | 'ESTIMATED' | null
  activeCalories: number | null
  caloriesVerification: 'VERIFIED' | 'IMPORTED' | 'SELF_REPORTED' | 'ESTIMATED' | null
  proteinLogged: boolean | null
  proteinVerification: 'VERIFIED' | 'IMPORTED' | 'SELF_REPORTED' | 'ESTIMATED' | null
  primarySource: 'HEALTHKIT' | 'GOOGLE_FIT' | 'MANUAL' | null
  lastSyncedAt: Date | null
  syncCount: number | null
}
