import {
  questTemplates,
  questLogs,
  dailyLogs,
  type RequirementDSL,
  type NumericRequirement,
} from '../db/schema'
import { eq, and } from 'drizzle-orm'
import { createXPRemovalEvent } from './xp'
import { type Timezone } from '../lib/timezone'
import { requireDb, getTodayDate, getTodayQuests } from './quest-core'

/**
 * Reset a completed quest back to active status
 */
export async function resetQuest(
  questLogId: string,
  userId: string
): Promise<{ quest: Awaited<ReturnType<typeof getTodayQuests>>[0]; xpRemoved: number }> {
  const [result] = await requireDb()
    .select({
      log: questLogs,
      template: questTemplates,
    })
    .from(questLogs)
    .innerJoin(questTemplates, eq(questLogs.templateId, questTemplates.id))
    .where(and(eq(questLogs.id, questLogId), eq(questLogs.userId, userId)))
    .limit(1)

  if (!result) {
    throw new Error('Quest not found')
  }

  const { log, template } = result

  if (log.status !== 'COMPLETED') {
    throw new Error('Quest is not completed - cannot reset')
  }

  const xpToRemove = log.xpAwarded ?? 0

  // Reset quest log
  await requireDb()
    .update(questLogs)
    .set({
      status: 'ACTIVE',
      currentValue: 0,
      completionPercent: 0,
      completedAt: null,
      xpAwarded: null,
      updatedAt: new Date(),
    })
    .where(eq(questLogs.id, questLogId))

  // Remove XP from user if any was awarded (creates an event in XP history)
  if (xpToRemove > 0) {
    await createXPRemovalEvent({
      userId,
      source: 'MANUAL_ADJUSTMENT',
      sourceId: questLogId,
      amount: xpToRemove,
      description: `Quest reset: ${template.name}`,
    })
  }

  // Update daily log
  const today = log.questDate
  const [dailyLog] = await requireDb()
    .select()
    .from(dailyLogs)
    .where(and(eq(dailyLogs.userId, userId), eq(dailyLogs.logDate, today)))
    .limit(1)

  if (dailyLog) {
    const updates: Partial<typeof dailyLogs.$inferInsert> = {
      xpEarned: Math.max(0, dailyLog.xpEarned - xpToRemove),
      updatedAt: new Date(),
    }

    if (template.isCore) {
      updates.coreQuestsCompleted = Math.max(0, dailyLog.coreQuestsCompleted - 1)
      updates.isPerfectDay = false
    } else {
      updates.bonusQuestsCompleted = Math.max(0, dailyLog.bonusQuestsCompleted - 1)
    }

    await requireDb().update(dailyLogs).set(updates).where(eq(dailyLogs.id, dailyLog.id))
  }

  return {
    quest: {
      id: log.id,
      templateId: template.id,
      name: template.name,
      description: template.description,
      type: template.type,
      category: template.category,
      requirement: template.requirement,
      baseXP: template.baseXP,
      statType: template.statType,
      statBonus: template.statBonus,
      allowPartial: template.allowPartial,
      minPartialPercent: template.minPartialPercent,
      isCore: template.isCore,
      status: 'ACTIVE',
      currentValue: 0,
      targetValue: log.targetValue,
      completionPercent: 0,
      completedAt: null,
      xpAwarded: null,
      questDate: log.questDate,
    },
    xpRemoved: xpToRemove,
  }
}

/**
 * Remove/deactivate a quest from today's active log
 * Only non-core quests can be removed
 */
export async function removeQuest(
  questLogId: string,
  userId: string
): Promise<{ removed: boolean; message: string }> {
  // Get quest log with template
  const [result] = await requireDb()
    .select({
      log: questLogs,
      template: questTemplates,
    })
    .from(questLogs)
    .innerJoin(questTemplates, eq(questLogs.templateId, questTemplates.id))
    .where(and(eq(questLogs.id, questLogId), eq(questLogs.userId, userId)))
    .limit(1)

  if (!result) {
    throw new Error('Quest not found')
  }

  const { log, template } = result

  // Prevent removing core quests
  if (template.isCore) {
    throw new Error('Core quests cannot be removed')
  }

  // Prevent removing completed quests (user should reset first if needed)
  if (log.status === 'COMPLETED') {
    throw new Error('Cannot remove a completed quest. Reset it first if you want to remove it.')
  }

  // Delete the quest log entry
  await requireDb()
    .delete(questLogs)
    .where(eq(questLogs.id, questLogId))

  return {
    removed: true,
    message: `Quest removed: ${template.name}`,
  }
}

/**
 * Deactivate a quest by template ID for today
 * Only non-core quests can be deactivated
 */
export async function deactivateQuestByTemplate(
  templateId: string,
  userId: string,
  timezone: Timezone = 'UTC'
): Promise<{ deactivated: boolean; message: string }> {
  const today = getTodayDate(timezone)

  // Get template first to check if it's core
  const [template] = await requireDb()
    .select()
    .from(questTemplates)
    .where(eq(questTemplates.id, templateId))
    .limit(1)

  if (!template) {
    throw new Error('Quest template not found')
  }

  // Prevent deactivating core quests
  if (template.isCore) {
    throw new Error('Core quests cannot be deactivated')
  }

  // Get quest log for today
  const [log] = await requireDb()
    .select()
    .from(questLogs)
    .where(and(
      eq(questLogs.userId, userId),
      eq(questLogs.templateId, templateId),
      eq(questLogs.questDate, today)
    ))
    .limit(1)

  if (!log) {
    throw new Error('Quest is not active for today')
  }

  // Prevent deactivating completed quests
  if (log.status === 'COMPLETED') {
    throw new Error('Cannot deactivate a completed quest. Reset it first if you want to remove it.')
  }

  // Delete the quest log entry
  await requireDb()
    .delete(questLogs)
    .where(eq(questLogs.id, log.id))

  return {
    deactivated: true,
    message: `Quest deactivated: ${template.name}`,
  }
}

/**
 * Activate a quest for today
 */
export async function activateQuest(userId: string, templateId: string) {
  const today = getTodayDate()

  // Check if already active
  const existing = await requireDb()
    .select()
    .from(questLogs)
    .where(and(
      eq(questLogs.userId, userId),
      eq(questLogs.templateId, templateId),
      eq(questLogs.questDate, today)
    ))
    .limit(1)

  if (existing.length > 0) {
    throw new Error('Quest already active')
  }

  // Get template
  const [template] = await requireDb()
    .select()
    .from(questTemplates)
    .where(eq(questTemplates.id, templateId))
    .limit(1)

  if (!template) {
    throw new Error('Quest template not found')
  }

  // Only allow DAILY type quests to be activated as daily quests
  // Weekly quests should use the weekly quest system
  if (template.type !== 'DAILY') {
    throw new Error(`Cannot activate ${template.type} quest as a daily quest. ${template.type} quests have their own tracking system.`)
  }

  // Create log
  const req = template.requirement as RequirementDSL
  let targetValue = 1

  if (req.type === 'numeric') {
    targetValue = (req as NumericRequirement).value
  }

  const [log] = await requireDb()
    .insert(questLogs)
    .values({
      userId,
      templateId: template.id,
      questDate: today,
      status: 'ACTIVE',
      currentValue: 0,
      targetValue,
      completionPercent: 0,
    })
    .returning()

  if (!log) {
    throw new Error('Failed to create quest log')
  }

  return {
    id: log.id,
    templateId: template.id,
    name: template.name,
    description: template.description,
    type: template.type,
    category: template.category,
    requirement: template.requirement,
    baseXP: template.baseXP,
    statType: template.statType,
    statBonus: template.statBonus,
    allowPartial: template.allowPartial,
    minPartialPercent: template.minPartialPercent,
    isCore: template.isCore,
    status: log.status,
    currentValue: log.currentValue,
    targetValue: log.targetValue,
    completionPercent: log.completionPercent,
    completedAt: log.completedAt,
    xpAwarded: log.xpAwarded,
    questDate: log.questDate,
  }
}
