/**
 * Exercise Service
 * Handles exercise library operations
 */

import { eq, and, like, or, inArray, desc, sql } from 'drizzle-orm'
import { dbClient as db } from '../db'
import {
  exercises,
  exerciseFavorites,
  exerciseOfTheDay,
  type MuscleGroup,
  type Equipment,
  type ExerciseCategory,
  type Difficulty,
} from '../db/schema/exercises'
import { nanoid } from 'nanoid'

function requireDb() {
  if (!db) throw new Error('Database not initialized')
  return db
}

export interface ExerciseFilters {
  category?: ExerciseCategory
  primaryMuscle?: MuscleGroup
  equipment?: Equipment
  difficulty?: Difficulty
  search?: string
  limit?: number
  offset?: number
}

export interface ParsedExercise {
  id: string
  name: string
  slug: string
  description: string
  instructions: string[]
  tips: string[]
  category: ExerciseCategory
  primaryMuscle: MuscleGroup
  secondaryMuscles: MuscleGroup[]
  equipment: Equipment
  difficulty: Difficulty
  videoUrl: string | null
  imageUrl: string | null
  caloriesPerMinute: number | null
  isCompound: boolean
  isFavorite?: boolean
}

/**
 * Parse stored JSON fields
 */
function parseExercise(e: typeof exercises.$inferSelect): ParsedExercise {
  return {
    ...e,
    instructions: JSON.parse(e.instructions || '[]'),
    tips: JSON.parse(e.tips || '[]'),
    secondaryMuscles: JSON.parse(e.secondaryMuscles || '[]'),
    isCompound: e.isCompound ?? false,
  }
}

/**
 * Get all exercises with optional filters
 */
export async function getExercises(
  filters: ExerciseFilters = {},
  userId?: string
): Promise<{ exercises: ParsedExercise[]; total: number }> {
  const database = requireDb()

  const conditions = []

  if (filters.category) {
    conditions.push(eq(exercises.category, filters.category))
  }
  if (filters.primaryMuscle) {
    conditions.push(eq(exercises.primaryMuscle, filters.primaryMuscle))
  }
  if (filters.equipment) {
    conditions.push(eq(exercises.equipment, filters.equipment))
  }
  if (filters.difficulty) {
    conditions.push(eq(exercises.difficulty, filters.difficulty))
  }
  if (filters.search) {
    const search = `%${filters.search.toLowerCase()}%`
    conditions.push(
      or(
        like(sql`lower(${exercises.name})`, search),
        like(sql`lower(${exercises.description})`, search)
      )
    )
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined

  const [results, countResult] = await Promise.all([
    database
      .select()
      .from(exercises)
      .where(whereClause)
      .limit(filters.limit || 50)
      .offset(filters.offset || 0)
      .orderBy(exercises.name),
    database
      .select({ count: sql<number>`count(*)` })
      .from(exercises)
      .where(whereClause),
  ])

  // Get user favorites if userId provided
  let favoriteIds: Set<string> = new Set()
  if (userId) {
    const favorites = await database
      .select({ exerciseId: exerciseFavorites.exerciseId })
      .from(exerciseFavorites)
      .where(eq(exerciseFavorites.userId, userId))

    favoriteIds = new Set(favorites.map((f) => f.exerciseId))
  }

  return {
    exercises: results.map((e) => ({
      ...parseExercise(e),
      isFavorite: favoriteIds.has(e.id),
    })),
    total: countResult[0]?.count ?? 0,
  }
}

/**
 * Get exercise by ID or slug
 */
export async function getExercise(
  idOrSlug: string,
  userId?: string
): Promise<ParsedExercise | null> {
  const database = requireDb()

  const [result] = await database
    .select()
    .from(exercises)
    .where(
      or(eq(exercises.id, idOrSlug), eq(exercises.slug, idOrSlug))
    )
    .limit(1)

  if (!result) return null

  // Check if favorited
  let isFavorite = false
  if (userId) {
    const [fav] = await database
      .select()
      .from(exerciseFavorites)
      .where(
        and(
          eq(exerciseFavorites.userId, userId),
          eq(exerciseFavorites.exerciseId, result.id)
        )
      )
      .limit(1)
    isFavorite = !!fav
  }

  return { ...parseExercise(result), isFavorite }
}

/**
 * Get exercise of the day
 */
export async function getExerciseOfTheDay(userId?: string): Promise<ParsedExercise | null> {
  const database = requireDb()
  const today = new Date().toISOString().split('T')[0]!

  // Check if we have one for today
  const [eotd] = await database
    .select()
    .from(exerciseOfTheDay)
    .where(eq(exerciseOfTheDay.date, today))
    .limit(1)

  if (eotd) {
    return getExercise(eotd.exerciseId, userId)
  }

  // Select a random exercise
  const allExercises = await database.select().from(exercises)
  if (allExercises.length === 0) return null

  const randomIndex = Math.floor(Math.random() * allExercises.length)
  const selectedExercise = allExercises[randomIndex]!

  // Store it
  await database.insert(exerciseOfTheDay).values({
    id: nanoid(),
    date: today,
    exerciseId: selectedExercise.id,
  })

  return getExercise(selectedExercise.id, userId)
}

/**
 * Toggle favorite
 */
export async function toggleFavorite(
  userId: string,
  exerciseId: string
): Promise<{ favorited: boolean }> {
  const database = requireDb()

  const [existing] = await database
    .select()
    .from(exerciseFavorites)
    .where(
      and(
        eq(exerciseFavorites.userId, userId),
        eq(exerciseFavorites.exerciseId, exerciseId)
      )
    )
    .limit(1)

  if (existing) {
    await database
      .delete(exerciseFavorites)
      .where(
        and(
          eq(exerciseFavorites.userId, userId),
          eq(exerciseFavorites.exerciseId, exerciseId)
        )
      )
    return { favorited: false }
  }

  await database.insert(exerciseFavorites).values({
    userId,
    exerciseId,
    addedAt: new Date(),
  })

  return { favorited: true }
}

/**
 * Get user favorites
 */
export async function getUserFavorites(
  userId: string
): Promise<ParsedExercise[]> {
  const database = requireDb()

  const favorites = await database
    .select({ exerciseId: exerciseFavorites.exerciseId })
    .from(exerciseFavorites)
    .where(eq(exerciseFavorites.userId, userId))
    .orderBy(desc(exerciseFavorites.addedAt))

  if (favorites.length === 0) return []

  const exerciseIds = favorites.map((f) => f.exerciseId)
  const results = await database
    .select()
    .from(exercises)
    .where(inArray(exercises.id, exerciseIds))

  return results.map((e) => ({ ...parseExercise(e), isFavorite: true }))
}

/**
 * Get exercises by muscle group
 */
export async function getExercisesByMuscleGroup(
  muscle: MuscleGroup,
  userId?: string
): Promise<ParsedExercise[]> {
  const { exercises: results } = await getExercises(
    { primaryMuscle: muscle, limit: 100 },
    userId
  )
  return results
}
