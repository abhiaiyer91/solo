import { eq, and, desc, gte, sql } from 'drizzle-orm'
import { dbClient as db } from '../db'
import {
  adaptedTargets,
  questTemplates,
  questLogs,
  type AdaptedTarget,
  type RequirementDSL,
} from '../db/schema'
import { getBaselineAssessment } from './baseline'

function requireDb() {
  if (!db) {
    throw new Error('Database connection required for quest adaptation service')
  }
  return db
}

// Minimum and maximum targets by quest type
const TARGET_BOUNDS: Record<string, { min: number; max: number }> = {
  STEPS: { min: 3000, max: 15000 },
  WORKOUT_MINUTES: { min: 10, max: 90 },
  PROTEIN_GRAMS: { min: 50, max: 250 },
  SLEEP_HOURS: { min: 5, max: 10 },
  ACTIVE_MINUTES: { min: 15, max: 120 },
  CALORIES_BURNED: { min: 100, max: 1000 },
}

// Default targets when no baseline exists
const DEFAULT_TARGETS: Record<string, number> = {
  STEPS: 10000,
  WORKOUT_MINUTES: 30,
  PROTEIN_GRAMS: 150,
  SLEEP_HOURS: 7,
  ACTIVE_MINUTES: 30,
  CALORIES_BURNED: 300,
}

/**
 * Get adapted target for a user's quest
 * Returns the personalized target or creates one from baseline
 */
export async function getAdaptedTarget(
  userId: string,
  templateId: string
): Promise<AdaptedTarget | null> {
  const existing = await requireDb().query.adaptedTargets.findFirst({
    where: and(
      eq(adaptedTargets.userId, userId),
      eq(adaptedTargets.questTemplateId, templateId)
    ),
  })

  if (existing) {
    return existing
  }

  // No adapted target exists - create one from baseline
  const template = await requireDb().query.questTemplates.findFirst({
    where: eq(questTemplates.id, templateId),
  })

  if (!template) {
    return null
  }

  const initialTarget = await calculateInitialTarget(userId, template.requirement)
  const baseTarget = getTargetFromRequirement(template.requirement)

  const [newTarget] = await db
    .insert(adaptedTargets)
    .values({
      userId,
      questTemplateId: templateId,
      baseTarget,
      adaptedTarget: initialTarget,
    })
    .returning()

  return newTarget
}

/**
 * Get all adapted targets for a user
 */
export async function getAllAdaptedTargets(userId: string): Promise<AdaptedTarget[]> {
  return db.query.adaptedTargets.findMany({
    where: eq(adaptedTargets.userId, userId),
  })
}

/**
 * Calculate initial target from baseline assessment
 */
async function calculateInitialTarget(
  userId: string,
  requirement: RequirementDSL
): Promise<number> {
  const baseline = await getBaselineAssessment(userId)
  const metric = getMetricFromRequirement(requirement)
  const defaultTarget = getTargetFromRequirement(requirement)

  if (!baseline) {
    return defaultTarget
  }

  // Calculate personalized initial target based on metric
  switch (metric) {
    case 'steps': {
      // Start 20% above baseline, capped at default
      const stepsTarget = Math.ceil((baseline.dailyStepsBaseline || 5000) * 1.2)
      return Math.min(stepsTarget, DEFAULT_TARGETS.STEPS)
    }

    case 'workout_minutes': {
      // Based on current workout frequency
      const workoutsPerWeek = baseline.workoutsPerWeek || 0
      if (workoutsPerWeek >= 5) return 45
      if (workoutsPerWeek >= 3) return 30
      if (workoutsPerWeek >= 1) return 20
      return 15
    }

    case 'protein_grams': {
      // Start 10% above current intake
      const proteinTarget = Math.ceil((baseline.proteinGramsBaseline || 100) * 1.1)
      return Math.min(proteinTarget, DEFAULT_TARGETS.PROTEIN_GRAMS)
    }

    case 'sleep_hours': {
      // Push toward optimal 7-8 hours gradually
      const sleepBaseline = baseline.sleepHoursBaseline || 6
      if (sleepBaseline >= 7) return 7
      return Math.min(sleepBaseline + 0.5, 7)
    }

    case 'active_minutes': {
      // Based on steps baseline as proxy for activity
      const stepsBaseline = baseline.dailyStepsBaseline || 5000
      if (stepsBaseline >= 12000) return 60
      if (stepsBaseline >= 8000) return 45
      if (stepsBaseline >= 5000) return 30
      return 20
    }

    default:
      return defaultTarget
  }
}

/**
 * Adapt target based on recent performance
 * Called periodically (e.g., weekly) to adjust targets
 */
export async function adaptTarget(
  userId: string,
  templateId: string
): Promise<{
  oldTarget: number
  newTarget: number
  reason: string
}> {
  const target = await getAdaptedTarget(userId, templateId)

  if (!target) {
    throw new Error('No target found for adaptation')
  }

  // Don't adapt if manually overridden
  if (target.manualOverride) {
    return {
      oldTarget: target.adaptedTarget,
      newTarget: target.adaptedTarget,
      reason: 'Manual override active',
    }
  }

  // Get recent performance (last 14 days)
  const performance = await getRecentPerformance(userId, templateId, 14)

  // Need at least 7 data points
  if (performance.completionCount < 7) {
    return {
      oldTarget: target.adaptedTarget,
      newTarget: target.adaptedTarget,
      reason: 'Insufficient data (need 7+ days)',
    }
  }

  let newTarget = target.adaptedTarget
  let reason = 'No change needed'

  // Consistently exceeding by >25%? Increase by 10%
  if (performance.averageAchievement > 1.25 && performance.completionRate > 0.8) {
    newTarget = Math.ceil(target.adaptedTarget * 1.1)
    reason = `Exceeding target by ${Math.round((performance.averageAchievement - 1) * 100)}%`
  }

  // Consistently missing by >30%? Decrease by 10%
  if (performance.averageAchievement < 0.7 && performance.completionRate < 0.5) {
    newTarget = Math.floor(target.adaptedTarget * 0.9)
    reason = 'Struggling at current target'
  }

  // Apply bounds
  const metric = await getMetricFromTemplate(templateId)
  const bounds = TARGET_BOUNDS[metric.toUpperCase()] || { min: 0, max: Infinity }
  newTarget = Math.max(newTarget, bounds.min)
  newTarget = Math.min(newTarget, bounds.max)

  // Update if changed
  if (newTarget !== target.adaptedTarget) {
    await db
      .update(adaptedTargets)
      .set({
        adaptedTarget: newTarget,
        completionRate: performance.completionRate,
        averageAchievement: performance.averageAchievement,
        lastAdaptedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(adaptedTargets.id, target.id))
  }

  return {
    oldTarget: target.adaptedTarget,
    newTarget,
    reason,
  }
}

/**
 * Manually override a target
 */
export async function setManualTarget(
  userId: string,
  templateId: string,
  newTarget: number
): Promise<AdaptedTarget> {
  const existing = await getAdaptedTarget(userId, templateId)

  if (!existing) {
    throw new Error('No adapted target found')
  }

  // Validate bounds
  const metric = await getMetricFromTemplate(templateId)
  const bounds = TARGET_BOUNDS[metric.toUpperCase()] || { min: 0, max: Infinity }

  if (newTarget < bounds.min || newTarget > bounds.max) {
    throw new Error(`Target must be between ${bounds.min} and ${bounds.max}`)
  }

  const [updated] = await db
    .update(adaptedTargets)
    .set({
      adaptedTarget: newTarget,
      manualOverride: true,
      updatedAt: new Date(),
    })
    .where(eq(adaptedTargets.id, existing.id))
    .returning()

  return updated
}

/**
 * Clear manual override, allowing automatic adaptation
 */
export async function clearManualOverride(
  userId: string,
  templateId: string
): Promise<AdaptedTarget> {
  const existing = await getAdaptedTarget(userId, templateId)

  if (!existing) {
    throw new Error('No adapted target found')
  }

  const [updated] = await db
    .update(adaptedTargets)
    .set({
      manualOverride: false,
      updatedAt: new Date(),
    })
    .where(eq(adaptedTargets.id, existing.id))
    .returning()

  return updated
}

// ============================================================
// Helper Functions
// ============================================================

async function getRecentPerformance(
  userId: string,
  templateId: string,
  days: number
): Promise<{
  completionCount: number
  completionRate: number
  averageAchievement: number
}> {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - days)
  const cutoffDateStr = cutoffDate.toISOString().split('T')[0]

  const recentLogs = await requireDb().query.questLogs.findMany({
    where: and(
      eq(questLogs.userId, userId),
      eq(questLogs.templateId, templateId),
      gte(questLogs.questDate, cutoffDateStr)
    ),
    orderBy: [desc(questLogs.questDate)],
  })

  if (recentLogs.length === 0) {
    return { completionCount: 0, completionRate: 0, averageAchievement: 0 }
  }

  const completed = recentLogs.filter((log) => log.status === 'COMPLETE').length
  const completionRate = completed / recentLogs.length

  // Calculate average achievement percentage
  const totalAchievement = recentLogs.reduce((sum, log) => {
    const achievement = (log.currentValue || 0) / log.targetValue
    return sum + achievement
  }, 0)
  const averageAchievement = totalAchievement / recentLogs.length

  return {
    completionCount: recentLogs.length,
    completionRate,
    averageAchievement,
  }
}

function getMetricFromRequirement(requirement: RequirementDSL): string {
  if (requirement.type === 'numeric' || requirement.type === 'boolean') {
    return requirement.metric
  }
  if (requirement.type === 'compound' && requirement.requirements.length > 0) {
    return getMetricFromRequirement(requirement.requirements[0])
  }
  return 'unknown'
}

function getTargetFromRequirement(requirement: RequirementDSL): number {
  if (requirement.type === 'numeric') {
    return requirement.value
  }
  if (requirement.type === 'boolean') {
    return 1 // Boolean requirements have a target of 1 (true)
  }
  if (requirement.type === 'compound' && requirement.requirements.length > 0) {
    return getTargetFromRequirement(requirement.requirements[0])
  }
  return 0
}

async function getMetricFromTemplate(templateId: string): Promise<string> {
  const template = await requireDb().query.questTemplates.findFirst({
    where: eq(questTemplates.id, templateId),
  })

  if (!template) {
    return 'unknown'
  }

  return getMetricFromRequirement(template.requirement)
}

/**
 * Run adaptation for all of a user's targets
 * Call this weekly via a scheduled job
 */
export async function runAdaptationCycle(userId: string): Promise<{
  adapted: number
  unchanged: number
  results: Array<{ templateId: string; oldTarget: number; newTarget: number; reason: string }>
}> {
  const allTargets = await getAllAdaptedTargets(userId)
  const results: Array<{
    templateId: string
    oldTarget: number
    newTarget: number
    reason: string
  }> = []

  let adapted = 0
  let unchanged = 0

  for (const target of allTargets) {
    const result = await adaptTarget(userId, target.questTemplateId)
    results.push({
      templateId: target.questTemplateId,
      ...result,
    })

    if (result.oldTarget !== result.newTarget) {
      adapted++
    } else {
      unchanged++
    }
  }

  return { adapted, unchanged, results }
}
