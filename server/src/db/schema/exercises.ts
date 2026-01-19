/**
 * Exercise Database Schema
 * Stores exercise library with categories, muscle groups, and instructions
 */

import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core'
import { relations } from 'drizzle-orm'

export type MuscleGroup =
  | 'chest' | 'back' | 'shoulders' | 'biceps' | 'triceps'
  | 'core' | 'quads' | 'hamstrings' | 'glutes' | 'calves' | 'full_body'

export type Equipment =
  | 'bodyweight' | 'dumbbell' | 'barbell' | 'kettlebell'
  | 'cable' | 'machine' | 'resistance_band' | 'pull_up_bar'

export type ExerciseCategory =
  | 'strength' | 'cardio' | 'flexibility' | 'balance' | 'plyometric'

export type Difficulty = 'beginner' | 'intermediate' | 'advanced'

/**
 * Exercises table
 */
export const exercises = sqliteTable('exercises', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description').notNull(),
  instructions: text('instructions').notNull(), // JSON array of steps
  tips: text('tips'), // JSON array of tips
  category: text('category').notNull().$type<ExerciseCategory>(),
  primaryMuscle: text('primary_muscle').notNull().$type<MuscleGroup>(),
  secondaryMuscles: text('secondary_muscles'), // JSON array of MuscleGroup
  equipment: text('equipment').notNull().$type<Equipment>(),
  difficulty: text('difficulty').notNull().$type<Difficulty>(),
  videoUrl: text('video_url'),
  imageUrl: text('image_url'),
  caloriesPerMinute: integer('calories_per_minute'),
  isCompound: integer('is_compound', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

/**
 * User exercise favorites
 */
export const exerciseFavorites = sqliteTable('exercise_favorites', {
  userId: text('user_id').notNull(),
  exerciseId: text('exercise_id').notNull().references(() => exercises.id),
  addedAt: integer('added_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
}, (table) => ({
  pk: primaryKey({ columns: [table.userId, table.exerciseId] }),
}))

/**
 * Exercise of the day history
 */
export const exerciseOfTheDay = sqliteTable('exercise_of_the_day', {
  id: text('id').primaryKey(),
  date: text('date').notNull().unique(), // YYYY-MM-DD
  exerciseId: text('exercise_id').notNull().references(() => exercises.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

/**
 * Relations
 */
export const exercisesRelations = relations(exercises, ({ many }) => ({
  favorites: many(exerciseFavorites),
}))

export const exerciseFavoritesRelations = relations(exerciseFavorites, ({ one }) => ({
  exercise: one(exercises, {
    fields: [exerciseFavorites.exerciseId],
    references: [exercises.id],
  }),
}))
