/**
 * Body Composition Service
 * 
 * Handles weight, calorie, and body composition tracking.
 * XP is awarded for calorie deficits (opt-in feature).
 */

import { dbClient as db } from '../db'
import { 
  bodyCompositionLogs, 
  weeklyBodySummaries,
  users 
} from '../db/schema'
import { eq, and, gte, lte } from 'drizzle-orm'
import { createXPEvent } from './xp'

function requireDb() {
  if (!db) {
    throw new Error('Database connection required for body composition service')
  }
  return db
}

// Constants for calorie/weight conversion
const CALORIES_PER_POUND = 3500
const POUNDS_PER_KG = 2.205
const XP_PER_POUND_LOST = 100  // XP awarded per pound of weight loss
const MIN_DEFICIT_FOR_XP = 500  // Minimum weekly deficit to earn XP

export interface LogBodyCompositionInput {
  date?: string
  weight?: number
  caloriesConsumed?: number
  caloriesBurned?: number
  basalMetabolicRate?: number
  bodyFatPercent?: number
  muscleMass?: number
  waterPercent?: number
  boneMass?: number
  source?: string
  notes?: string
}

export interface BodyCompositionProgress {
  logs: Array<{
    date: string
    weight: number | null
    caloriesConsumed: number | null
    caloriesBurned: number | null
    netCalories: number | null
    bodyFatPercent: number | null
  }>
  summary: {
    startWeight: number | null
    currentWeight: number | null
    weightChange: number | null
    totalDeficit: number
    projectedLoss: number
    trend: 'losing' | 'stable' | 'gaining'
    daysLogged: number
  }
}

/**
 * Check if user has body composition tracking enabled
 */
export async function isBodyTrackingEnabled(userId: string): Promise<boolean> {
  const [user] = await requireDb()
    .select({ trackBodyComposition: users.trackBodyComposition })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)
  
  return user?.trackBodyComposition ?? false
}

/**
 * Enable or disable body composition tracking for a user
 */
export async function setBodyTrackingEnabled(
  userId: string, 
  enabled: boolean,
  targetWeight?: number,
  targetCalories?: number
): Promise<void> {
  await requireDb()
    .update(users)
    .set({
      trackBodyComposition: enabled,
      targetWeight: targetWeight ?? null,
      targetCalories: targetCalories ?? null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
}

/**
 * Log a body composition entry
 */
export async function logBodyComposition(
  userId: string,
  input: LogBodyCompositionInput
): Promise<typeof bodyCompositionLogs.$inferSelect> {
  const date = input.date ?? new Date().toISOString().split('T')[0]!
  
  // Calculate net calories if we have the data
  let netCalories: number | null = null
  if (input.caloriesConsumed !== undefined) {
    const consumed = input.caloriesConsumed
    const burned = input.caloriesBurned ?? 0
    const bmr = input.basalMetabolicRate ?? 1800  // Default BMR if not provided
    netCalories = consumed - burned - bmr
  }
  
  // Upsert the log (update if exists for this date)
  const existing = await requireDb()
    .select()
    .from(bodyCompositionLogs)
    .where(and(
      eq(bodyCompositionLogs.userId, userId),
      eq(bodyCompositionLogs.date, date)
    ))
    .limit(1)
  
  const existingEntry = existing[0]
  
  if (existingEntry) {
    // Update existing entry
    const [updated] = await requireDb()
      .update(bodyCompositionLogs)
      .set({
        weight: input.weight ?? existingEntry.weight,
        caloriesConsumed: input.caloriesConsumed ?? existingEntry.caloriesConsumed,
        caloriesBurned: input.caloriesBurned ?? existingEntry.caloriesBurned,
        basalMetabolicRate: input.basalMetabolicRate ?? existingEntry.basalMetabolicRate,
        netCalories: netCalories ?? existingEntry.netCalories,
        bodyFatPercent: input.bodyFatPercent ?? existingEntry.bodyFatPercent,
        muscleMass: input.muscleMass ?? existingEntry.muscleMass,
        waterPercent: input.waterPercent ?? existingEntry.waterPercent,
        boneMass: input.boneMass ?? existingEntry.boneMass,
        source: input.source ?? existingEntry.source,
        notes: input.notes ?? existingEntry.notes,
        updatedAt: new Date(),
      })
      .where(eq(bodyCompositionLogs.id, existingEntry.id))
      .returning()
    
    if (!updated) {
      throw new Error('Failed to update body composition log')
    }
    return updated
  }
  
  // Create new entry
  const [created] = await requireDb()
    .insert(bodyCompositionLogs)
    .values({
      userId,
      date,
      weight: input.weight,
      caloriesConsumed: input.caloriesConsumed,
      caloriesBurned: input.caloriesBurned,
      basalMetabolicRate: input.basalMetabolicRate,
      netCalories,
      bodyFatPercent: input.bodyFatPercent,
      muscleMass: input.muscleMass,
      waterPercent: input.waterPercent,
      boneMass: input.boneMass,
      source: input.source ?? 'manual',
      notes: input.notes,
    })
    .returning()
  
  if (!created) {
    throw new Error('Failed to create body composition log')
  }
  return created
}

/**
 * Get body composition progress for a user
 */
export async function getBodyCompositionProgress(
  userId: string,
  days: number = 30
): Promise<BodyCompositionProgress> {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  const startDateStr = startDate.toISOString().split('T')[0]!
  
  const logs = await requireDb()
    .select({
      date: bodyCompositionLogs.date,
      weight: bodyCompositionLogs.weight,
      caloriesConsumed: bodyCompositionLogs.caloriesConsumed,
      caloriesBurned: bodyCompositionLogs.caloriesBurned,
      netCalories: bodyCompositionLogs.netCalories,
      bodyFatPercent: bodyCompositionLogs.bodyFatPercent,
    })
    .from(bodyCompositionLogs)
    .where(and(
      eq(bodyCompositionLogs.userId, userId),
      gte(bodyCompositionLogs.date, startDateStr)
    ))
    .orderBy(bodyCompositionLogs.date)
  
  // Calculate summary
  const weightsWithValues = logs.filter(l => l.weight !== null)
  const startWeight = weightsWithValues[0]?.weight ?? null
  const currentWeight = weightsWithValues[weightsWithValues.length - 1]?.weight ?? null
  const weightChange = startWeight && currentWeight 
    ? currentWeight - startWeight 
    : null
  
  // Calculate total deficit
  const totalDeficit = logs.reduce((sum, log) => {
    if (log.netCalories !== null && log.netCalories < 0) {
      return sum + Math.abs(log.netCalories)
    }
    return sum
  }, 0)
  
  // Project weight loss from deficit (3500 cal = 1 lb = 0.45 kg)
  const projectedLoss = (totalDeficit / CALORIES_PER_POUND) / POUNDS_PER_KG
  
  // Determine trend
  let trend: 'losing' | 'stable' | 'gaining' = 'stable'
  if (weightChange !== null) {
    if (weightChange < -0.5) {
      trend = 'losing'
    } else if (weightChange > 0.5) {
      trend = 'gaining'
    }
  }
  
  return {
    logs,
    summary: {
      startWeight,
      currentWeight,
      weightChange,
      totalDeficit,
      projectedLoss,
      trend,
      daysLogged: logs.length,
    },
  }
}

/**
 * Get today's body composition log
 */
export async function getTodayLog(
  userId: string
): Promise<typeof bodyCompositionLogs.$inferSelect | null> {
  const today = new Date().toISOString().split('T')[0]!
  
  const [log] = await requireDb()
    .select()
    .from(bodyCompositionLogs)
    .where(and(
      eq(bodyCompositionLogs.userId, userId),
      eq(bodyCompositionLogs.date, today)
    ))
    .limit(1)
  
  return log ?? null
}

/**
 * Get week start date (Monday)
 */
function getWeekStart(date: Date = new Date()): string {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  return d.toISOString().split('T')[0]!
}

/**
 * Get week end date (Sunday)
 */
function getWeekEnd(date: Date = new Date()): string {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() + (day === 0 ? 0 : 7 - day)
  d.setDate(diff)
  return d.toISOString().split('T')[0]!
}

/**
 * Process weekly deficit and award XP
 * Should be called at end of week or during reconciliation
 */
export async function processWeeklyDeficit(userId: string): Promise<{
  totalDeficit: number
  poundsLost: number
  xpAwarded: number
  processed: boolean
}> {
  // Check if tracking is enabled
  const enabled = await isBodyTrackingEnabled(userId)
  if (!enabled) {
    return { totalDeficit: 0, poundsLost: 0, xpAwarded: 0, processed: false }
  }
  
  const weekStart = getWeekStart()
  const weekEnd = getWeekEnd()
  
  // Check if already processed
  const [existingSummary] = await requireDb()
    .select()
    .from(weeklyBodySummaries)
    .where(and(
      eq(weeklyBodySummaries.userId, userId),
      eq(weeklyBodySummaries.weekStart, weekStart)
    ))
    .limit(1)
  
  if (existingSummary?.processedAt) {
    // Already processed this week
    return {
      totalDeficit: existingSummary.totalDeficit ?? 0,
      poundsLost: (existingSummary.totalDeficit ?? 0) / CALORIES_PER_POUND,
      xpAwarded: existingSummary.xpAwarded,
      processed: false,
    }
  }
  
  // Get this week's logs
  const weekLogs = await requireDb()
    .select()
    .from(bodyCompositionLogs)
    .where(and(
      eq(bodyCompositionLogs.userId, userId),
      gte(bodyCompositionLogs.date, weekStart),
      lte(bodyCompositionLogs.date, weekEnd)
    ))
    .orderBy(bodyCompositionLogs.date)
  
  if (weekLogs.length === 0) {
    return { totalDeficit: 0, poundsLost: 0, xpAwarded: 0, processed: false }
  }
  
  // Calculate totals
  const weightsWithValues = weekLogs.filter(l => l.weight !== null)
  const startWeight = weightsWithValues[0]?.weight ?? null
  const endWeight = weightsWithValues[weightsWithValues.length - 1]?.weight ?? null
  const weightChange = startWeight && endWeight ? endWeight - startWeight : null
  
  let totalCaloriesConsumed = 0
  let totalCaloriesBurned = 0
  let totalDeficit = 0
  
  for (const log of weekLogs) {
    if (log.caloriesConsumed) totalCaloriesConsumed += log.caloriesConsumed
    if (log.caloriesBurned) totalCaloriesBurned += log.caloriesBurned
    if (log.netCalories !== null && log.netCalories < 0) {
      totalDeficit += Math.abs(log.netCalories)
    }
  }
  
  const poundsLost = totalDeficit / CALORIES_PER_POUND
  let xpAwarded = 0
  
  // Award XP if deficit is significant enough
  if (totalDeficit >= MIN_DEFICIT_FOR_XP) {
    xpAwarded = Math.floor(poundsLost * XP_PER_POUND_LOST)
    
    if (xpAwarded > 0) {
      await createXPEvent({
        userId,
        source: 'BODY_COMPOSITION',
        sourceId: `week-${weekStart}`,
        baseAmount: xpAwarded,
        description: `Weekly calorie deficit: ${totalDeficit.toLocaleString()} cal (~${poundsLost.toFixed(1)} lb)`,
      })
    }
  }
  
  // Create or update weekly summary
  if (existingSummary) {
    await requireDb()
      .update(weeklyBodySummaries)
      .set({
        startWeight,
        endWeight,
        weightChange,
        totalCaloriesConsumed,
        totalCaloriesBurned,
        totalDeficit,
        projectedWeightChange: -poundsLost / POUNDS_PER_KG,
        daysLogged: weekLogs.length,
        xpAwarded,
        processedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(weeklyBodySummaries.id, existingSummary.id))
  } else {
    await requireDb()
      .insert(weeklyBodySummaries)
      .values({
        userId,
        weekStart,
        weekEnd,
        startWeight,
        endWeight,
        weightChange,
        totalCaloriesConsumed,
        totalCaloriesBurned,
        totalDeficit,
        projectedWeightChange: -poundsLost / POUNDS_PER_KG,
        daysLogged: weekLogs.length,
        xpAwarded,
        processedAt: new Date(),
      })
  }
  
  return { totalDeficit, poundsLost, xpAwarded, processed: true }
}

/**
 * Get weight history for charting
 */
export async function getWeightHistory(
  userId: string,
  days: number = 90
): Promise<Array<{ date: string; weight: number }>> {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  const startDateStr = startDate.toISOString().split('T')[0]!
  
  const logs = await requireDb()
    .select({
      date: bodyCompositionLogs.date,
      weight: bodyCompositionLogs.weight,
    })
    .from(bodyCompositionLogs)
    .where(and(
      eq(bodyCompositionLogs.userId, userId),
      gte(bodyCompositionLogs.date, startDateStr)
    ))
    .orderBy(bodyCompositionLogs.date)
  
  return logs
    .filter(l => l.weight !== null)
    .map(l => ({ date: l.date, weight: l.weight! }))
}
