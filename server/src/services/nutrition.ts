/**
 * Nutrition service - aggregation and tracking
 */

import { eq, and, gte, lte, desc } from 'drizzle-orm'
import { dbClient as database } from '../db'
import { mealLogs, dailyNutrition, type DetectedFood, type NutritionTotals } from '../db/schema/nutrition'
import { analyzeFoodImage, validateFoodImage } from './logmeal'

function requireDb() {
  if (!database) throw new Error('Database not initialized')
  return database
}

/**
 * Log a meal from an image
 */
export async function logMealFromImage(
  userId: string,
  imageBuffer: Buffer,
  mimeType: string,
  options: {
    date?: string
    mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  } = {}
): Promise<{
  log: typeof mealLogs.$inferSelect
  dailySummary: typeof dailyNutrition.$inferSelect
}> {
  const db = requireDb()
  
  // Validate image
  const validation = validateFoodImage(imageBuffer, mimeType)
  if (!validation.valid) {
    throw new Error(validation.error)
  }

  // Analyze with LogMeal
  const analysis = await analyzeFoodImage(imageBuffer, mimeType)
  
  const date = options.date ?? new Date().toISOString().split('T')[0]!
  
  // Create meal log
  const [log] = await db
    .insert(mealLogs)
    .values({
      userId,
      date,
      mealType: options.mealType,
      foods: analysis.foods,
      calories: analysis.totals.calories,
      protein: analysis.totals.protein,
      carbs: analysis.totals.carbs,
      fat: analysis.totals.fat,
      fiber: analysis.totals.fiber,
      logmealResponse: analysis.rawResponse,
    })
    .returning()

  if (!log) throw new Error('Failed to create meal log')

  // Update daily summary
  const dailySummary = await updateDailyNutrition(userId, date)

  return { log, dailySummary }
}

/**
 * Log a meal manually (no image)
 */
export async function logMealManually(
  userId: string,
  data: {
    date?: string
    mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack'
    foods?: DetectedFood[]
    calories: number
    protein: number
    carbs: number
    fat: number
    fiber?: number
    notes?: string
  }
): Promise<{
  log: typeof mealLogs.$inferSelect
  dailySummary: typeof dailyNutrition.$inferSelect
}> {
  const db = requireDb()
  const date = data.date ?? new Date().toISOString().split('T')[0]!

  const [log] = await db
    .insert(mealLogs)
    .values({
      userId,
      date,
      mealType: data.mealType,
      foods: data.foods,
      calories: data.calories,
      protein: data.protein,
      carbs: data.carbs,
      fat: data.fat,
      fiber: data.fiber ?? 0,
      notes: data.notes,
      isManualEntry: 1,
    })
    .returning()

  if (!log) throw new Error('Failed to create meal log')

  const dailySummary = await updateDailyNutrition(userId, date)

  return { log, dailySummary }
}

/**
 * Update daily nutrition aggregation
 */
async function updateDailyNutrition(
  userId: string,
  date: string
): Promise<typeof dailyNutrition.$inferSelect> {
  const db = requireDb()

  // Get all meals for the day
  const meals = await db
    .select()
    .from(mealLogs)
    .where(and(eq(mealLogs.userId, userId), eq(mealLogs.date, date)))

  // Calculate totals
  const totals = meals.reduce<NutritionTotals>(
    (acc: NutritionTotals, meal) => ({
      calories: acc.calories + meal.calories,
      protein: acc.protein + meal.protein,
      carbs: acc.carbs + meal.carbs,
      fat: acc.fat + meal.fat,
      fiber: acc.fiber + (meal.fiber ?? 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
  )

  // Upsert daily summary
  const existing = await db
    .select()
    .from(dailyNutrition)
    .where(and(eq(dailyNutrition.userId, userId), eq(dailyNutrition.date, date)))
    .limit(1)

  if (existing[0]) {
    const [updated] = await db
      .update(dailyNutrition)
      .set({
        totalCalories: totals.calories,
        totalProtein: totals.protein,
        totalCarbs: totals.carbs,
        totalFat: totals.fat,
        totalFiber: totals.fiber,
        mealCount: meals.length,
        updatedAt: new Date(),
      })
      .where(eq(dailyNutrition.id, existing[0].id))
      .returning()

    if (!updated) throw new Error('Failed to update daily nutrition')
    return updated
  }

  const [created] = await db
    .insert(dailyNutrition)
    .values({
      userId,
      date,
      totalCalories: totals.calories,
      totalProtein: totals.protein,
      totalCarbs: totals.carbs,
      totalFat: totals.fat,
      totalFiber: totals.fiber,
      mealCount: meals.length,
    })
    .returning()

  if (!created) throw new Error('Failed to create daily nutrition')
  return created
}

/**
 * Get today's nutrition summary
 */
export async function getTodayNutrition(
  userId: string
): Promise<{
  summary: typeof dailyNutrition.$inferSelect | null
  meals: Array<typeof mealLogs.$inferSelect>
}> {
  const db = requireDb()
  const today = new Date().toISOString().split('T')[0]!

  const summary = await db
    .select()
    .from(dailyNutrition)
    .where(and(eq(dailyNutrition.userId, userId), eq(dailyNutrition.date, today)))
    .limit(1)

  const meals = await db
    .select()
    .from(mealLogs)
    .where(and(eq(mealLogs.userId, userId), eq(mealLogs.date, today)))
    .orderBy(desc(mealLogs.createdAt))

  return {
    summary: summary[0] ?? null,
    meals,
  }
}

/**
 * Get nutrition history
 */
export async function getNutritionHistory(
  userId: string,
  days: number = 30
): Promise<{
  days: Array<typeof dailyNutrition.$inferSelect>
  averages: NutritionTotals
}> {
  const db = requireDb()
  const endDate = new Date()
  const startDate = new Date(endDate)
  startDate.setDate(startDate.getDate() - days)

  const startDateStr = startDate.toISOString().split('T')[0]!
  const endDateStr = endDate.toISOString().split('T')[0]!

  const daysData = await db
    .select()
    .from(dailyNutrition)
    .where(
      and(
        eq(dailyNutrition.userId, userId),
        gte(dailyNutrition.date, startDateStr),
        lte(dailyNutrition.date, endDateStr)
      )
    )
    .orderBy(desc(dailyNutrition.date))

  // Calculate averages
  type DayRecord = typeof dailyNutrition.$inferSelect
  const daysWithData = daysData.filter((d: DayRecord) => d.mealCount > 0)
  const count = daysWithData.length || 1

  const averages: NutritionTotals = {
    calories: Math.round(daysWithData.reduce((sum: number, d: DayRecord) => sum + d.totalCalories, 0) / count),
    protein: Math.round(daysWithData.reduce((sum: number, d: DayRecord) => sum + d.totalProtein, 0) / count),
    carbs: Math.round(daysWithData.reduce((sum: number, d: DayRecord) => sum + d.totalCarbs, 0) / count),
    fat: Math.round(daysWithData.reduce((sum: number, d: DayRecord) => sum + d.totalFat, 0) / count),
    fiber: Math.round(daysWithData.reduce((sum: number, d: DayRecord) => sum + d.totalFiber, 0) / count),
  }

  return { days: daysData, averages }
}

/**
 * Set nutrition targets
 */
export async function setNutritionTargets(
  userId: string,
  targets: {
    calories?: number
    protein?: number
    carbs?: number
    fat?: number
  }
): Promise<typeof dailyNutrition.$inferSelect> {
  const db = requireDb()
  const today = new Date().toISOString().split('T')[0]!

  // Get or create today's record
  const existing = await db
    .select()
    .from(dailyNutrition)
    .where(and(eq(dailyNutrition.userId, userId), eq(dailyNutrition.date, today)))
    .limit(1)

  if (existing[0]) {
    const [updated] = await db
      .update(dailyNutrition)
      .set({
        targetCalories: targets.calories ?? existing[0].targetCalories,
        targetProtein: targets.protein ?? existing[0].targetProtein,
        targetCarbs: targets.carbs ?? existing[0].targetCarbs,
        targetFat: targets.fat ?? existing[0].targetFat,
        updatedAt: new Date(),
      })
      .where(eq(dailyNutrition.id, existing[0].id))
      .returning()

    if (!updated) throw new Error('Failed to update targets')
    return updated
  }

  const [created] = await db
    .insert(dailyNutrition)
    .values({
      userId,
      date: today,
      targetCalories: targets.calories,
      targetProtein: targets.protein,
      targetCarbs: targets.carbs,
      targetFat: targets.fat,
    })
    .returning()

  if (!created) throw new Error('Failed to create nutrition record')
  return created
}

/**
 * Check if protein goal is met for quest evaluation
 */
export async function checkProteinGoal(
  userId: string,
  targetGrams: number
): Promise<{
  met: boolean
  current: number
  target: number
  progress: number
}> {
  const db = requireDb()
  const today = new Date().toISOString().split('T')[0]!

  const summary = await db
    .select()
    .from(dailyNutrition)
    .where(and(eq(dailyNutrition.userId, userId), eq(dailyNutrition.date, today)))
    .limit(1)

  const current = summary[0]?.totalProtein ?? 0
  const progress = Math.min(100, (current / targetGrams) * 100)

  return {
    met: current >= targetGrams,
    current,
    target: targetGrams,
    progress,
  }
}
