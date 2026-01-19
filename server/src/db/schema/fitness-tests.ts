/**
 * Fitness Tests Schema
 * Tracks mandatory fitness tests like mile time and max lifts (bench, squat, deadlift)
 * These are one-time or periodic assessments that establish baselines for player progression
 */

import {
  pgTable,
  pgEnum,
  text,
  real,
  integer,
  boolean,
  timestamp,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'
import { users } from './auth'

/**
 * Fitness test types
 */
export const fitnessTestTypeEnum = pgEnum('fitness_test_type', [
  'MILE_TIME',      // Timed mile run
  'BENCH_PRESS',    // 1RM bench press
  'SQUAT',          // 1RM squat
  'DEADLIFT',       // 1RM deadlift
])

/**
 * Fitness test status
 */
export const fitnessTestStatusEnum = pgEnum('fitness_test_status', [
  'PENDING',        // Test not yet completed
  'COMPLETED',      // Test completed and recorded
  'SKIPPED',        // User chose to skip (still counts as addressed)
])

/**
 * Mandatory Fitness Tests - One-time required tests for each user
 * These are "quests" that must be completed to establish baselines
 */
export const mandatoryFitnessTests = pgTable(
  'mandatory_fitness_tests',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    
    testType: fitnessTestTypeEnum('test_type').notNull(),
    status: fitnessTestStatusEnum('status').default('PENDING').notNull(),
    
    // XP awarded when completed
    xpAwarded: integer('xp_awarded'),
    
    // When the test was completed or skipped
    completedAt: timestamp('completed_at'),
    
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index('mandatory_fitness_tests_user_idx').on(table.userId),
    userTestUnique: uniqueIndex('mandatory_fitness_tests_user_test_unique').on(
      table.userId,
      table.testType
    ),
    statusIdx: index('mandatory_fitness_tests_status_idx').on(table.status),
  })
)

/**
 * Fitness Test Records - Historical records of all fitness test results
 * Users can record multiple attempts over time to track progress
 */
export const fitnessTestRecords = pgTable(
  'fitness_test_records',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    
    testType: fitnessTestTypeEnum('test_type').notNull(),
    
    // Value recorded (interpretation depends on test type)
    // MILE_TIME: time in seconds (e.g., 480 = 8:00)
    // BENCH_PRESS/SQUAT/DEADLIFT: weight in pounds
    value: real('value').notNull(),
    
    // Optional unit override (defaults based on test type)
    // 'seconds' for time, 'lbs' or 'kg' for weight
    unit: text('unit'),
    
    // Whether this is a personal record at time of recording
    isPersonalRecord: boolean('is_personal_record').default(false),
    
    // Optional notes (e.g., "felt strong", "recovering from injury")
    notes: text('notes'),
    
    // Date the test was performed (may differ from recording time)
    testDate: text('test_date').notNull(), // YYYY-MM-DD
    
    // Link to mandatory test if this completed one
    mandatoryTestId: text('mandatory_test_id')
      .references(() => mandatoryFitnessTests.id, { onDelete: 'set null' }),
    
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index('fitness_test_records_user_idx').on(table.userId),
    userTypeIdx: index('fitness_test_records_user_type_idx').on(table.userId, table.testType),
    testDateIdx: index('fitness_test_records_test_date_idx').on(table.testDate),
  })
)

// Type exports
export type MandatoryFitnessTest = typeof mandatoryFitnessTests.$inferSelect
export type NewMandatoryFitnessTest = typeof mandatoryFitnessTests.$inferInsert
export type FitnessTestRecord = typeof fitnessTestRecords.$inferSelect
export type NewFitnessTestRecord = typeof fitnessTestRecords.$inferInsert

export type FitnessTestType = 'MILE_TIME' | 'BENCH_PRESS' | 'SQUAT' | 'DEADLIFT'
export type FitnessTestStatus = 'PENDING' | 'COMPLETED' | 'SKIPPED'

/**
 * Fitness test metadata for UI display
 */
export const FITNESS_TEST_METADATA: Record<FitnessTestType, {
  name: string
  description: string
  unit: string
  unitLabel: string
  icon: string
  category: 'cardio' | 'strength'
  xpReward: number
  statType: 'STR' | 'AGI' | 'VIT' | 'DISC'
}> = {
  MILE_TIME: {
    name: 'First Mile Time',
    description: 'Record your baseline mile run time. This establishes your cardio starting point.',
    unit: 'seconds',
    unitLabel: 'time',
    icon: '🏃',
    category: 'cardio',
    xpReward: 50,
    statType: 'AGI',
  },
  BENCH_PRESS: {
    name: 'Max Bench Press',
    description: 'Record your one-rep max (1RM) bench press. This establishes your upper body strength baseline.',
    unit: 'lbs',
    unitLabel: 'weight',
    icon: '🏋️',
    category: 'strength',
    xpReward: 50,
    statType: 'STR',
  },
  SQUAT: {
    name: 'Max Squat',
    description: 'Record your one-rep max (1RM) squat. This establishes your lower body strength baseline.',
    unit: 'lbs',
    unitLabel: 'weight',
    icon: '🦵',
    category: 'strength',
    xpReward: 50,
    statType: 'STR',
  },
  DEADLIFT: {
    name: 'Max Deadlift',
    description: 'Record your one-rep max (1RM) deadlift. This establishes your overall strength baseline.',
    unit: 'lbs',
    unitLabel: 'weight',
    icon: '💪',
    category: 'strength',
    xpReward: 50,
    statType: 'STR',
  },
}

/**
 * All mandatory fitness test types in order of completion
 */
export const MANDATORY_FITNESS_TESTS: FitnessTestType[] = [
  'MILE_TIME',
  'BENCH_PRESS',
  'SQUAT',
  'DEADLIFT',
]

/**
 * Helper to format mile time from seconds to MM:SS
 */
export function formatMileTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.round(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

/**
 * Helper to parse MM:SS to seconds
 */
export function parseMileTime(timeString: string): number {
  const [mins, secs] = timeString.split(':').map(Number)
  return (mins || 0) * 60 + (secs || 0)
}
