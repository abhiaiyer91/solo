/**
 * Nutrition tracking schema
 * Supports photo-based food logging via LogMeal API
 */

import { pgTable, text, integer, real, json, timestamp } from 'drizzle-orm/pg-core'
import { users } from './auth'

/**
 * Individual meal logs with detected nutrition
 */
export const mealLogs = pgTable('meal_logs', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  date: text('date').notNull(), // YYYY-MM-DD
  mealType: text('meal_type'), // breakfast, lunch, dinner, snack
  imageUrl: text('image_url'),
  
  // Nutrition data
  foods: json('foods').$type<DetectedFood[]>(),
  calories: integer('calories').notNull().default(0),
  protein: real('protein').notNull().default(0),
  carbs: real('carbs').notNull().default(0),
  fat: real('fat').notNull().default(0),
  fiber: real('fiber'),
  
  // Raw API response for debugging
  logmealResponse: json('logmeal_response'),
  
  // Manual entry flag
  isManualEntry: integer('is_manual_entry').notNull().default(0),
  notes: text('notes'),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

/**
 * Daily nutrition aggregation
 */
export const dailyNutrition = pgTable('daily_nutrition', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  date: text('date').notNull(), // YYYY-MM-DD
  
  // Aggregated totals
  totalCalories: integer('total_calories').notNull().default(0),
  totalProtein: real('total_protein').notNull().default(0),
  totalCarbs: real('total_carbs').notNull().default(0),
  totalFat: real('total_fat').notNull().default(0),
  totalFiber: real('total_fiber').notNull().default(0),
  mealCount: integer('meal_count').notNull().default(0),
  
  // User targets (optional)
  targetCalories: integer('target_calories'),
  targetProtein: real('target_protein'),
  targetCarbs: real('target_carbs'),
  targetFat: real('target_fat'),
  
  // Progress flags
  proteinGoalMet: integer('protein_goal_met').notNull().default(0),
  calorieDeficitMet: integer('calorie_deficit_met').notNull().default(0),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

/**
 * Type definitions
 */
export interface DetectedFood {
  name: string
  servingSize: string
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber?: number
  confidence?: number
}

export interface NutritionTotals {
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'

/**
 * Quick-add food presets
 */
export const foodPresets = pgTable('food_presets', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  
  // Food info
  name: text('name').notNull(),
  emoji: text('emoji').default('🍽️'),
  
  // Nutrition per serving
  calories: integer('calories').notNull().default(0),
  protein: real('protein').notNull().default(0),
  carbs: real('carbs').notNull().default(0),
  fat: real('fat').notNull().default(0),
  
  // Metadata
  servingSize: text('serving_size'),
  barcode: text('barcode'),
  sortOrder: integer('sort_order').notNull().default(0),
  usageCount: integer('usage_count').notNull().default(0),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
