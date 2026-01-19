/**
 * Custom Quest Service
 * Handles user-created quest templates
 */

import { eq, and, desc, sql } from 'drizzle-orm'
import { dbClient as db } from '../db'
import {
  customQuestTemplates,
  customQuestLogs,
  MAX_ACTIVE_CUSTOM_QUESTS,
  XP_PER_DIFFICULTY,
  type CustomQuestTemplate,
  type NewCustomQuestTemplate,
  type CustomQuestLog,
} from '../db/schema/custom-quests'
import { createXPEvent } from './xp'
import { logger } from '../lib/logger'
import type { RequirementDSL } from '../db/schema/game'

function requireDb() {
  if (!db) throw new Error('Database not initialized')
  return db
}

/**
 * Get all custom quest templates for a user
 */
export async function getCustomQuestTemplates(
  userId: string,
  includeArchived = false
): Promise<CustomQuestTemplate[]> {
  const database = requireDb()

  const conditions = [eq(customQuestTemplates.userId, userId)]
  if (!includeArchived) {
    conditions.push(eq(customQuestTemplates.isArchived, false))
  }

  return database
    .select()
    .from(customQuestTemplates)
    .where(and(...conditions))
    .orderBy(desc(customQuestTemplates.createdAt))
}

/**
 * Get active custom quests for a user
 */
export async function getActiveCustomQuests(
  userId: string
): Promise<CustomQuestTemplate[]> {
  const database = requireDb()

  return database
    .select()
    .from(customQuestTemplates)
    .where(
      and(
        eq(customQuestTemplates.userId, userId),
        eq(customQuestTemplates.isActive, true),
        eq(customQuestTemplates.isArchived, false)
      )
    )
    .orderBy(customQuestTemplates.createdAt)
}

/**
 * Get single custom quest template
 */
export async function getCustomQuestTemplate(
  userId: string,
  templateId: string
): Promise<CustomQuestTemplate | null> {
  const database = requireDb()

  const [template] = await database
    .select()
    .from(customQuestTemplates)
    .where(
      and(
        eq(customQuestTemplates.id, templateId),
        eq(customQuestTemplates.userId, userId)
      )
    )
    .limit(1)

  return template ?? null
}

/**
 * Create a new custom quest template
 */
export async function createCustomQuestTemplate(
  userId: string,
  data: {
    name: string
    description: string
    category: 'MOVEMENT' | 'STRENGTH' | 'RECOVERY' | 'NUTRITION' | 'DISCIPLINE'
    metric: string
    targetValue: number
    statType: 'STR' | 'AGI' | 'VIT' | 'DISC'
    icon?: string
    color?: string
    isDaily?: boolean
  }
): Promise<CustomQuestTemplate> {
  const database = requireDb()

  // Build requirement DSL
  const requirement: RequirementDSL = {
    type: 'numeric',
    metric: data.metric,
    operator: 'gte',
    value: data.targetValue,
  }

  // Calculate XP based on difficulty (higher target = more XP)
  const baseXP = calculateXPReward(data.metric, data.targetValue)

  const [template] = await database
    .insert(customQuestTemplates)
    .values({
      userId,
      name: data.name,
      description: data.description,
      category: data.category,
      requirement,
      baseXP,
      statType: data.statType,
      statBonus: 1,
      icon: data.icon ?? '⚔️',
      color: data.color ?? '#6366f1',
      isDaily: data.isDaily ?? true,
      targetValue: data.targetValue,
    })
    .returning()

  logger.info('Custom quest template created', {
    userId,
    templateId: template.id,
    name: data.name,
  })

  return template
}

/**
 * Update a custom quest template
 */
export async function updateCustomQuestTemplate(
  userId: string,
  templateId: string,
  updates: {
    name?: string
    description?: string
    category?: 'MOVEMENT' | 'STRENGTH' | 'RECOVERY' | 'NUTRITION' | 'DISCIPLINE'
    metric?: string
    targetValue?: number
    statType?: 'STR' | 'AGI' | 'VIT' | 'DISC'
    icon?: string
    color?: string
    isDaily?: boolean
  }
): Promise<CustomQuestTemplate | null> {
  const database = requireDb()

  // Build update object
  const updateData: Record<string, unknown> = {
    updatedAt: new Date(),
  }

  if (updates.name) updateData.name = updates.name
  if (updates.description) updateData.description = updates.description
  if (updates.category) updateData.category = updates.category
  if (updates.statType) updateData.statType = updates.statType
  if (updates.icon) updateData.icon = updates.icon
  if (updates.color) updateData.color = updates.color
  if (updates.isDaily !== undefined) updateData.isDaily = updates.isDaily

  // Update requirement and XP if target/metric changed
  if (updates.metric || updates.targetValue) {
    const currentTemplate = await getCustomQuestTemplate(userId, templateId)
    if (!currentTemplate) return null

    const currentReq = currentTemplate.requirement as RequirementDSL & {
      type: 'numeric'
    }
    const metric = updates.metric ?? currentReq.metric
    const targetValue = updates.targetValue ?? currentTemplate.targetValue

    updateData.requirement = {
      type: 'numeric',
      metric,
      operator: 'gte',
      value: targetValue,
    }
    updateData.targetValue = targetValue
    updateData.baseXP = calculateXPReward(metric, targetValue)
  }

  const [updated] = await database
    .update(customQuestTemplates)
    .set(updateData)
    .where(
      and(
        eq(customQuestTemplates.id, templateId),
        eq(customQuestTemplates.userId, userId)
      )
    )
    .returning()

  return updated ?? null
}

/**
 * Activate a custom quest template
 */
export async function activateCustomQuest(
  userId: string,
  templateId: string
): Promise<{ success: boolean; message: string; template?: CustomQuestTemplate }> {
  const database = requireDb()

  // Check current active count
  const activeQuests = await getActiveCustomQuests(userId)
  if (activeQuests.length >= MAX_ACTIVE_CUSTOM_QUESTS) {
    return {
      success: false,
      message: `Maximum of ${MAX_ACTIVE_CUSTOM_QUESTS} active custom quests allowed`,
    }
  }

  // Check if already active
  const template = await getCustomQuestTemplate(userId, templateId)
  if (!template) {
    return { success: false, message: 'Quest template not found' }
  }

  if (template.isActive) {
    return { success: false, message: 'Quest is already active' }
  }

  // Activate
  const [updated] = await database
    .update(customQuestTemplates)
    .set({
      isActive: true,
      timesActivated: sql`${customQuestTemplates.timesActivated} + 1`,
      updatedAt: new Date(),
    })
    .where(eq(customQuestTemplates.id, templateId))
    .returning()

  logger.info('Custom quest activated', { userId, templateId })

  return { success: true, message: 'Quest activated', template: updated }
}

/**
 * Deactivate a custom quest template
 */
export async function deactivateCustomQuest(
  userId: string,
  templateId: string
): Promise<CustomQuestTemplate | null> {
  const database = requireDb()

  const [updated] = await database
    .update(customQuestTemplates)
    .set({ isActive: false, updatedAt: new Date() })
    .where(
      and(
        eq(customQuestTemplates.id, templateId),
        eq(customQuestTemplates.userId, userId)
      )
    )
    .returning()

  if (updated) {
    logger.info('Custom quest deactivated', { userId, templateId })
  }

  return updated ?? null
}

/**
 * Archive a custom quest template
 */
export async function archiveCustomQuest(
  userId: string,
  templateId: string
): Promise<CustomQuestTemplate | null> {
  const database = requireDb()

  const [updated] = await database
    .update(customQuestTemplates)
    .set({
      isArchived: true,
      isActive: false,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(customQuestTemplates.id, templateId),
        eq(customQuestTemplates.userId, userId)
      )
    )
    .returning()

  if (updated) {
    logger.info('Custom quest archived', { userId, templateId })
  }

  return updated ?? null
}

/**
 * Delete a custom quest template
 */
export async function deleteCustomQuestTemplate(
  userId: string,
  templateId: string
): Promise<boolean> {
  const database = requireDb()

  const result = await database
    .delete(customQuestTemplates)
    .where(
      and(
        eq(customQuestTemplates.id, templateId),
        eq(customQuestTemplates.userId, userId)
      )
    )

  return (result.rowCount ?? 0) > 0
}

/**
 * Get custom quest logs for a date
 */
export async function getCustomQuestLogs(
  userId: string,
  date: string
): Promise<(CustomQuestLog & { template: CustomQuestTemplate })[]> {
  const database = requireDb()

  const logs = await database
    .select()
    .from(customQuestLogs)
    .innerJoin(
      customQuestTemplates,
      eq(customQuestLogs.templateId, customQuestTemplates.id)
    )
    .where(
      and(
        eq(customQuestLogs.userId, userId),
        eq(customQuestLogs.questDate, date)
      )
    )

  return logs.map((row) => ({
    ...row.custom_quest_logs,
    template: row.custom_quest_templates,
  }))
}

/**
 * Create daily custom quest logs for active templates
 */
export async function createDailyCustomQuestLogs(
  userId: string,
  date: string
): Promise<CustomQuestLog[]> {
  const database = requireDb()

  // Get active templates
  const activeTemplates = await getActiveCustomQuests(userId)
  const dailyTemplates = activeTemplates.filter((t) => t.isDaily)

  const createdLogs: CustomQuestLog[] = []

  for (const template of dailyTemplates) {
    // Check if log already exists
    const [existing] = await database
      .select()
      .from(customQuestLogs)
      .where(
        and(
          eq(customQuestLogs.userId, userId),
          eq(customQuestLogs.templateId, template.id),
          eq(customQuestLogs.questDate, date)
        )
      )
      .limit(1)

    if (!existing) {
      const [log] = await database
        .insert(customQuestLogs)
        .values({
          userId,
          templateId: template.id,
          questDate: date,
          targetValue: template.targetValue,
        })
        .returning()

      createdLogs.push(log)
    }
  }

  return createdLogs
}

/**
 * Update progress on a custom quest
 */
export async function updateCustomQuestProgress(
  userId: string,
  templateId: string,
  date: string,
  currentValue: number
): Promise<{ log: CustomQuestLog; justCompleted: boolean; xpAwarded?: number }> {
  const database = requireDb()

  // Get or create log
  let [log] = await database
    .select()
    .from(customQuestLogs)
    .where(
      and(
        eq(customQuestLogs.userId, userId),
        eq(customQuestLogs.templateId, templateId),
        eq(customQuestLogs.questDate, date)
      )
    )
    .limit(1)

  if (!log) {
    // Create the log
    const template = await getCustomQuestTemplate(userId, templateId)
    if (!template) {
      throw new Error('Quest template not found')
    }

    ;[log] = await database
      .insert(customQuestLogs)
      .values({
        userId,
        templateId,
        questDate: date,
        targetValue: template.targetValue,
        currentValue,
      })
      .returning()

    return { log, justCompleted: false }
  }

  // Already completed
  if (log.isCompleted) {
    return { log, justCompleted: false }
  }

  // Check if now completed
  const justCompleted = currentValue >= log.targetValue

  if (justCompleted) {
    // Get template for XP
    const template = await getCustomQuestTemplate(userId, templateId)
    if (!template) {
      throw new Error('Quest template not found')
    }

    // Award XP
    const xpResult = await createXPEvent({
      userId,
      source: 'QUEST_COMPLETION',
      sourceId: log.id,
      baseAmount: template.baseXP,
      description: `Completed custom quest: ${template.name}`,
    })

    // Update log and template
    ;[log] = await database
      .update(customQuestLogs)
      .set({
        currentValue,
        isCompleted: true,
        completedAt: new Date(),
        xpAwarded: template.baseXP,
      })
      .where(eq(customQuestLogs.id, log.id))
      .returning()

    // Increment completion count on template
    await database
      .update(customQuestTemplates)
      .set({
        timesCompleted: sql`${customQuestTemplates.timesCompleted} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(customQuestTemplates.id, templateId))

    logger.info('Custom quest completed', {
      userId,
      templateId,
      logId: log.id,
      xpAwarded: template.baseXP,
    })

    return { log, justCompleted: true, xpAwarded: template.baseXP }
  }

  // Just update progress
  ;[log] = await database
    .update(customQuestLogs)
    .set({ currentValue })
    .where(eq(customQuestLogs.id, log.id))
    .returning()

  return { log, justCompleted: false }
}

/**
 * Calculate XP reward based on metric and target
 */
function calculateXPReward(metric: string, targetValue: number): number {
  // Define difficulty thresholds per metric
  const thresholds: Record<string, { easy: number; medium: number; hard: number }> = {
    steps: { easy: 3000, medium: 7500, hard: 15000 },
    workout_minutes: { easy: 15, medium: 30, hard: 60 },
    active_minutes: { easy: 20, medium: 45, hard: 90 },
    sleep_hours: { easy: 6, medium: 7, hard: 8 },
    water_glasses: { easy: 4, medium: 8, hard: 12 },
    protein_grams: { easy: 50, medium: 100, hard: 150 },
    calories_burned: { easy: 200, medium: 400, hard: 600 },
    meditation_minutes: { easy: 5, medium: 15, hard: 30 },
    stretching_minutes: { easy: 5, medium: 15, hard: 30 },
    outdoor_minutes: { easy: 15, medium: 30, hard: 60 },
  }

  const metricThresholds = thresholds[metric] ?? { easy: 10, medium: 50, hard: 100 }

  if (targetValue <= metricThresholds.easy) {
    return XP_PER_DIFFICULTY.easy
  } else if (targetValue <= metricThresholds.medium) {
    return XP_PER_DIFFICULTY.medium
  } else if (targetValue <= metricThresholds.hard) {
    return XP_PER_DIFFICULTY.hard
  } else {
    return XP_PER_DIFFICULTY.extreme
  }
}

/**
 * Get custom quest stats for a user
 */
export async function getCustomQuestStats(userId: string): Promise<{
  totalTemplates: number
  activeTemplates: number
  totalCompletions: number
  totalXpEarned: number
}> {
  const database = requireDb()

  const templates = await getCustomQuestTemplates(userId)
  const activeTemplates = templates.filter((t) => t.isActive)

  const completionsResult = await database
    .select({
      count: sql<number>`count(*)`,
      xp: sql<number>`coalesce(sum(${customQuestLogs.xpAwarded}), 0)`,
    })
    .from(customQuestLogs)
    .where(
      and(
        eq(customQuestLogs.userId, userId),
        eq(customQuestLogs.isCompleted, true)
      )
    )

  return {
    totalTemplates: templates.length,
    activeTemplates: activeTemplates.length,
    totalCompletions: completionsResult[0]?.count ?? 0,
    totalXpEarned: completionsResult[0]?.xp ?? 0,
  }
}
