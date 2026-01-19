/**
 * Exercise Library API Routes
 */

import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import {
  getExercises,
  getExercise,
  getExerciseOfTheDay,
  toggleFavorite,
  getUserFavorites,
  getExercisesByMuscleGroup,
  type ExerciseFilters,
} from '../services/exercise'
import type { MuscleGroup, Equipment, ExerciseCategory, Difficulty } from '../db/schema/exercises'

const exerciseRoutes = new Hono()

const MUSCLE_GROUPS = [
  'chest', 'back', 'shoulders', 'biceps', 'triceps',
  'core', 'quads', 'hamstrings', 'glutes', 'calves', 'full_body',
] as const

const EQUIPMENT_TYPES = [
  'bodyweight', 'dumbbell', 'barbell', 'kettlebell',
  'cable', 'machine', 'resistance_band', 'pull_up_bar',
] as const

const CATEGORIES = ['strength', 'cardio', 'flexibility', 'balance', 'plyometric'] as const
const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'] as const

/**
 * GET /exercises - List exercises with filters
 */
exerciseRoutes.get(
  '/',
  zValidator(
    'query',
    z.object({
      category: z.enum(CATEGORIES).optional(),
      muscle: z.enum(MUSCLE_GROUPS).optional(),
      equipment: z.enum(EQUIPMENT_TYPES).optional(),
      difficulty: z.enum(DIFFICULTIES).optional(),
      search: z.string().max(100).optional(),
      limit: z.coerce.number().min(1).max(100).default(50),
      offset: z.coerce.number().min(0).default(0),
    })
  ),
  async (c) => {
    const query = c.req.valid('query')
    const user = c.get('user')

    const filters: ExerciseFilters = {
      category: query.category,
      primaryMuscle: query.muscle,
      equipment: query.equipment,
      difficulty: query.difficulty,
      search: query.search,
      limit: query.limit,
      offset: query.offset,
    }

    try {
      const result = await getExercises(filters, user?.id)
      return c.json(result)
    } catch (error) {
      console.error('Error fetching exercises:', error)
      return c.json({ error: 'Failed to fetch exercises' }, 500)
    }
  }
)

/**
 * GET /exercises/today - Get exercise of the day
 */
exerciseRoutes.get('/today', async (c) => {
  const user = c.get('user')

  try {
    const exercise = await getExerciseOfTheDay(user?.id)
    if (!exercise) {
      return c.json({ error: 'No exercises available' }, 404)
    }
    return c.json({ exercise })
  } catch (error) {
    console.error('Error fetching exercise of the day:', error)
    return c.json({ error: 'Failed to fetch exercise of the day' }, 500)
  }
})

/**
 * GET /exercises/favorites - Get user's favorite exercises
 */
exerciseRoutes.get('/favorites', async (c) => {
  const user = c.get('user')
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  try {
    const exercises = await getUserFavorites(user.id)
    return c.json({ exercises })
  } catch (error) {
    console.error('Error fetching favorites:', error)
    return c.json({ error: 'Failed to fetch favorites' }, 500)
  }
})

/**
 * GET /exercises/muscle/:muscle - Get exercises by muscle group
 */
exerciseRoutes.get('/muscle/:muscle', async (c) => {
  const muscle = c.req.param('muscle') as MuscleGroup
  const user = c.get('user')

  if (!MUSCLE_GROUPS.includes(muscle as (typeof MUSCLE_GROUPS)[number])) {
    return c.json({ error: 'Invalid muscle group' }, 400)
  }

  try {
    const exercises = await getExercisesByMuscleGroup(muscle, user?.id)
    return c.json({ exercises })
  } catch (error) {
    console.error('Error fetching exercises by muscle:', error)
    return c.json({ error: 'Failed to fetch exercises' }, 500)
  }
})

/**
 * GET /exercises/:id - Get single exercise
 */
exerciseRoutes.get('/:id', async (c) => {
  const id = c.req.param('id')
  const user = c.get('user')

  try {
    const exercise = await getExercise(id, user?.id)
    if (!exercise) {
      return c.json({ error: 'Exercise not found' }, 404)
    }
    return c.json({ exercise })
  } catch (error) {
    console.error('Error fetching exercise:', error)
    return c.json({ error: 'Failed to fetch exercise' }, 500)
  }
})

/**
 * POST /exercises/:id/favorite - Toggle favorite
 */
exerciseRoutes.post('/:id/favorite', async (c) => {
  const user = c.get('user')
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const exerciseId = c.req.param('id')

  try {
    const result = await toggleFavorite(user.id, exerciseId)
    return c.json(result)
  } catch (error) {
    console.error('Error toggling favorite:', error)
    return c.json({ error: 'Failed to toggle favorite' }, 500)
  }
})

/**
 * GET /exercises/filters/options - Get available filter options
 */
exerciseRoutes.get('/filters/options', (c) => {
  return c.json({
    categories: CATEGORIES,
    muscleGroups: MUSCLE_GROUPS,
    equipment: EQUIPMENT_TYPES,
    difficulties: DIFFICULTIES,
  })
})

export default exerciseRoutes
