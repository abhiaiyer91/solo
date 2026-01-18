/**
 * Body Composition Tracking Schema
 * 
 * Stores weight, calorie, and body composition data for tracking progress.
 * All tracking is opt-in via user preferences.
 */

import { pgTable, text, real, integer, timestamp, index, unique } from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'
import { users } from './auth'

/**
 * Daily body composition logs
 * Tracks weight, calories, and optional body composition metrics
 */
export const bodyCompositionLogs = pgTable('body_composition_logs', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  date: text('date').notNull(),  // YYYY-MM-DD format
  
  // Core metrics
  weight: real('weight'),  // kg
  caloriesConsumed: integer('calories_consumed'),
  caloriesBurned: integer('calories_burned'),  // Active calories from exercise
  basalMetabolicRate: integer('basal_metabolic_rate'),  // BMR for the user
  netCalories: integer('net_calories'),  // Computed: consumed - burned - bmr
  
  // Optional detailed metrics
  bodyFatPercent: real('body_fat_percent'),
  muscleMass: real('muscle_mass'),  // kg
  waterPercent: real('water_percent'),
  boneMass: real('bone_mass'),  // kg
  
  // Metadata
  source: text('source').default('manual'),  // 'manual', 'healthkit', 'fitbit', etc.
  notes: text('notes'),
  
  recordedAt: timestamp('recorded_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userDateUnique: unique().on(table.userId, table.date),
  userDateIdx: index('body_log_user_date_idx').on(table.userId, table.date),
  userIdx: index('body_log_user_idx').on(table.userId),
}))

/**
 * Weekly body composition summaries
 * Aggregated data for weekly progress tracking and XP awards
 */
export const weeklyBodySummaries = pgTable('weekly_body_summaries', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  weekStart: text('week_start').notNull(),  // Monday date YYYY-MM-DD
  weekEnd: text('week_end').notNull(),  // Sunday date YYYY-MM-DD
  
  // Weight change
  startWeight: real('start_weight'),
  endWeight: real('end_weight'),
  weightChange: real('weight_change'),  // Positive = gained, negative = lost
  
  // Calorie tracking
  totalCaloriesConsumed: integer('total_calories_consumed'),
  totalCaloriesBurned: integer('total_calories_burned'),
  totalDeficit: integer('total_deficit'),  // Positive = deficit, negative = surplus
  
  // Derived values
  projectedWeightChange: real('projected_weight_change'),  // Based on deficit (3500 cal = 1 lb)
  daysLogged: integer('days_logged').default(0).notNull(),
  
  // XP awarded for this week's deficit
  xpAwarded: integer('xp_awarded').default(0).notNull(),
  processedAt: timestamp('processed_at'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userWeekUnique: unique().on(table.userId, table.weekStart),
  userWeekIdx: index('body_summary_user_week_idx').on(table.userId, table.weekStart),
}))

// Type exports for use in services
export type BodyCompositionLog = typeof bodyCompositionLogs.$inferSelect
export type NewBodyCompositionLog = typeof bodyCompositionLogs.$inferInsert
export type WeeklyBodySummary = typeof weeklyBodySummaries.$inferSelect
export type NewWeeklyBodySummary = typeof weeklyBodySummaries.$inferInsert
