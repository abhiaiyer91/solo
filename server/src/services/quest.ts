import { dbClient as db } from '../db'
import {
  questTemplates,
  questLogs,
  dailyLogs,
  type RequirementDSL,
  type NumericRequirement,
  type BooleanRequirement,
  type CompoundRequirement,
} from '../db/schema'
import { eq, and } from 'drizzle-orm'
import { createXPEvent, createXPRemovalEvent } from './xp'
import { updateUserStreak } from './streak'
import { getTodayHealthSnapshot, healthDataToQuestData } from './health'
import { getTodayDateForTimezone, getSafeTimezone, type Timezone } from '../lib/timezone'
import { getTodayRotatingQuest, getRotatingQuestUnlockStatus } from './rotating-quest'

function requireDb() {
  if (!db) {
    throw new Error('Database connection required for quest service')
  }
  return db
}

/**
 * Get today's date in YYYY-MM-DD format for user's timezone
 *
 * @param timezone - IANA timezone identifier (e.g., 'America/Los_Angeles')
 * @returns Date string in YYYY-MM-DD format representing today in the user's timezone
 */
function getTodayDate(timezone: Timezone = 'UTC'): string {
  const safeTimezone = getSafeTimezone(timezone)
  return getTodayDateForTimezone(safeTimezone)
}

/**
 * Evaluate a requirement against provided data
 */
export function evaluateRequirement(
  requirement: RequirementDSL,
  data: Record<string, number | boolean>
): { met: boolean; progress: number; target: number } {
  switch (requirement.type) {
    case 'numeric': {
      const req = requirement as NumericRequirement
      const value = (data[req.metric] as number) ?? 0
      const target = req.value

      let met = false
      switch (req.operator) {
        case 'gte':
          met = value >= target
          break
        case 'lte':
          met = value <= target
          break
        case 'eq':
          met = value === target
          break
        case 'gt':
          met = value > target
          break
        case 'lt':
          met = value < target
          break
      }

      const progress = Math.min((value / target) * 100, 100)
      return { met, progress, target }
    }

    case 'boolean': {
      const req = requirement as BooleanRequirement
      const value = data[req.metric] as boolean | undefined
      const met = value === req.expected
      return { met, progress: met ? 100 : 0, target: 1 }
    }

    case 'compound': {
      const req = requirement as CompoundRequirement
      const results = req.requirements.map((r) => evaluateRequirement(r, data))

      if (req.operator === 'and') {
        const met = results.every((r) => r.met)
        const avgProgress = results.reduce((sum, r) => sum + r.progress, 0) / results.length
        return { met, progress: avgProgress, target: 100 }
      } else {
        // 'or'
        const met = results.some((r) => r.met)
        const maxProgress = Math.max(...results.map((r) => r.progress))
        return { met, progress: maxProgress, target: 100 }
      }
    }

    default:
      return { met: false, progress: 0, target: 0 }
  }
}

/**
 * Get or create today's quests for a user
 *
 * @param userId - The user's ID
 * @param timezone - IANA timezone identifier for the user's local time
 * @returns Array of quest objects for today
 */
export async function getTodayQuests(userId: string, timezone: Timezone = 'UTC') {
  const today = getTodayDate(timezone)

  // Get all active core templates (non-rotating)
  const coreTemplates = await requireDb()
    .select()
    .from(questTemplates)
    .where(and(
      eq(questTemplates.isActive, true),
      eq(questTemplates.isCore, true)
    ))
    .then(templates => templates.filter((t) => !t.id.startsWith('rotating-')))

  // Get existing quest logs for today
  const existingLogs = await requireDb()
    .select()
    .from(questLogs)
    .where(and(eq(questLogs.userId, userId), eq(questLogs.questDate, today)))

  const existingTemplateIds = new Set(existingLogs.map(log => log.templateId))

  // Create logs for any missing core templates (skip if already exists to avoid duplicates)
  const missingTemplates = coreTemplates.filter(t => !existingTemplateIds.has(t.id))
  if (missingTemplates.length > 0) {
    await Promise.all(
      missingTemplates.map(async (template) => {
        const req = template.requirement as RequirementDSL
        let targetValue = 1

        if (req.type === 'numeric') {
          targetValue = (req as NumericRequirement).value
        }

        // Use onConflictDoNothing to prevent duplicates from race conditions
        await requireDb()
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
          .onConflictDoNothing()
      })
    )
  }

  // Get DAILY quest logs for today (core + bonus + rotating), filtering out WEEKLY and other types
  const allQuests = await requireDb()
    .select({
      log: questLogs,
      template: questTemplates,
    })
    .from(questLogs)
    .innerJoin(questTemplates, eq(questLogs.templateId, questTemplates.id))
    .where(and(
      eq(questLogs.userId, userId),
      eq(questLogs.questDate, today),
      // Only include DAILY type quests (excludes WEEKLY, DUNGEON, BOSS which have their own sections)
      eq(questTemplates.type, 'DAILY')
    ))

  // Deduplicate by template ID (keep the first/oldest entry)
  const seenTemplateIds = new Set<string>()
  const dedupedQuests = allQuests.filter(({ template }) => {
    if (seenTemplateIds.has(template.id)) {
      return false
    }
    seenTemplateIds.add(template.id)
    return true
  })

  return dedupedQuests.map(({ log, template }) => ({
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
  }))
}


/**
 * Get all of today's quests including the rotating quest if unlocked
 *
 * @param userId - The user's ID
 * @param timezone - IANA timezone identifier for the user's local time
 * @returns Object containing all quests, rotating quest (if available), and unlock status
 */
export async function getTodayQuestsWithRotating(userId: string, timezone: Timezone = 'UTC') {
  // Get rotating quest unlock status
  const rotatingUnlockStatus = await getRotatingQuestUnlockStatus(userId)

  // Get or create rotating quest if unlocked (this ensures it exists before fetching all quests)
  let rotatingQuest = null
  if (rotatingUnlockStatus.unlocked) {
    rotatingQuest = await getTodayRotatingQuest(userId, timezone)
  }

  // Get ALL quests for today (core + bonus + rotating) - this now includes any rotating quest
  const allQuests = await getTodayQuests(userId, timezone)

  // Separate core quests for backward compatibility
  const coreQuests = allQuests.filter(q => q.isCore)

  return {
    coreQuests,
    allQuests,  // All quests including core, bonus, and rotating
    rotatingQuest,
    rotatingUnlockStatus,
  }
}

/**
 * Update quest progress and potentially complete it
 */
export async function updateQuestProgress(
  questLogId: string,
  userId: string,
  data: Record<string, number | boolean>
): Promise<{
  quest: Awaited<ReturnType<typeof getTodayQuests>>[0]
  xpAwarded: number
  leveledUp: boolean
  newLevel?: number
}> {
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

  if (log.status !== 'ACTIVE') {
    throw new Error('Quest is not active')
  }

  // Evaluate requirement
  const { met, progress, target } = evaluateRequirement(
    template.requirement as RequirementDSL,
    data
  )

  // Determine completion status
  let newStatus: 'ACTIVE' | 'COMPLETED' | 'FAILED' | 'EXPIRED' = log.status
  let xpAwarded = 0
  let leveledUp = false
  let newLevel: number | undefined

  if (met) {
    newStatus = 'COMPLETED'
    xpAwarded = template.baseXP

    // Create XP event
    const xpResult = await createXPEvent({
      userId,
      source: 'QUEST_COMPLETION',
      sourceId: log.id,
      baseAmount: template.baseXP,
      description: `Completed quest: ${template.name}`,
    })

    leveledUp = xpResult.leveledUp
    newLevel = xpResult.newLevel
  } else if (template.allowPartial && progress >= (template.minPartialPercent ?? 50)) {
    // Partial completion
    newStatus = 'COMPLETED'
    const partialMultiplier = progress / 100
    xpAwarded = Math.floor(template.baseXP * partialMultiplier)

    const xpResult = await createXPEvent({
      userId,
      source: 'QUEST_COMPLETION',
      sourceId: log.id,
      baseAmount: xpAwarded,
      description: `Partially completed quest: ${template.name} (${Math.floor(progress)}%)`,
    })

    leveledUp = xpResult.leveledUp
    newLevel = xpResult.newLevel
  }

  // Update quest log
  const currentValue =
    template.requirement && (template.requirement as RequirementDSL).type === 'numeric'
      ? ((data[(template.requirement as NumericRequirement).metric] as number) ?? 0)
      : met
        ? 1
        : 0

  await requireDb()
    .update(questLogs)
    .set({
      status: newStatus,
      currentValue,
      completionPercent: progress,
      completedAt: newStatus === 'COMPLETED' ? new Date() : null,
      xpAwarded: xpAwarded > 0 ? xpAwarded : null,
      updatedAt: new Date(),
    })
    .where(eq(questLogs.id, questLogId))

  // Update daily log if completed
  if (newStatus === 'COMPLETED') {
    const today = log.questDate
    const [dailyLog] = await requireDb()
      .select()
      .from(dailyLogs)
      .where(and(eq(dailyLogs.userId, userId), eq(dailyLogs.logDate, today)))
      .limit(1)

    if (dailyLog) {
      const updates: Partial<typeof dailyLogs.$inferInsert> = {
        xpEarned: dailyLog.xpEarned + xpAwarded,
        updatedAt: new Date(),
      }

      if (template.isCore) {
        updates.coreQuestsCompleted = dailyLog.coreQuestsCompleted + 1
        // Check for perfect day
        if (updates.coreQuestsCompleted === dailyLog.coreQuestsTotal) {
          updates.isPerfectDay = true
        }
      } else {
        updates.bonusQuestsCompleted = dailyLog.bonusQuestsCompleted + 1
      }

      await requireDb().update(dailyLogs).set(updates).where(eq(dailyLogs.id, dailyLog.id))

      // Update streak after daily log update
      await updateUserStreak(userId)
    }
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
      status: newStatus,
      currentValue,
      targetValue: target,
      completionPercent: progress,
      completedAt: newStatus === 'COMPLETED' ? new Date() : null,
      xpAwarded: xpAwarded > 0 ? xpAwarded : null,
      questDate: log.questDate,
    },
    xpAwarded,
    leveledUp,
    newLevel,
  }
}

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
 * Get a single quest by ID
 */
export async function getQuestById(questLogId: string, userId: string) {
  const [result] = await requireDb()
    .select({
      log: questLogs,
      template: questTemplates,
    })
    .from(questLogs)
    .innerJoin(questTemplates, eq(questLogs.templateId, questTemplates.id))
    .where(and(eq(questLogs.id, questLogId), eq(questLogs.userId, userId)))
    .limit(1)

  if (!result) return null

  const { log, template } = result

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

/**
 * Auto-evaluate quests based on synced health data
 * This should be called after health data is synced
 *
 * @param userId - The user's ID
 * @param timezone - IANA timezone identifier for the user's local time
 * @returns Evaluation results including completed quests and XP awarded
 */
export async function autoEvaluateQuestsFromHealth(
  userId: string,
  timezone: Timezone = 'UTC'
): Promise<{
  evaluated: number
  completed: number
  results: Array<{
    questId: string
    questName: string
    previousStatus: string
    newStatus: string
    xpAwarded: number
    leveledUp: boolean
    newLevel?: number
  }>
}> {
  // Get today's health snapshot
  const healthSnapshot = await getTodayHealthSnapshot(userId)

  if (!healthSnapshot) {
    return { evaluated: 0, completed: 0, results: [] }
  }

  // Convert health data to quest evaluation format
  const healthData = healthDataToQuestData(healthSnapshot)

  // Get today's active quests
  const quests = await getTodayQuests(userId, timezone)
  const activeQuests = quests.filter((q) => q.status === 'ACTIVE')

  const results: Array<{
    questId: string
    questName: string
    previousStatus: string
    newStatus: string
    xpAwarded: number
    leveledUp: boolean
    newLevel?: number
  }> = []

  let completedCount = 0

  for (const quest of activeQuests) {
    // Check if this quest can be auto-evaluated from health data
    const requirement = quest.requirement as RequirementDSL
    const canAutoEvaluate = canAutoEvaluateFromHealth(requirement)

    if (!canAutoEvaluate) {
      continue
    }

    // Evaluate the quest
    const { met, progress } = evaluateRequirement(requirement, healthData)

    // Only update if there's progress or completion
    if (progress > (quest.completionPercent ?? 0) || met) {
      try {
        const result = await updateQuestProgress(quest.id, userId, healthData)

        results.push({
          questId: quest.id,
          questName: quest.name,
          previousStatus: quest.status,
          newStatus: result.quest.status,
          xpAwarded: result.xpAwarded,
          leveledUp: result.leveledUp,
          newLevel: result.newLevel,
        })

        if (result.quest.status === 'COMPLETED') {
          completedCount++
        }
      } catch {
        // Quest update failed, skip
        continue
      }
    }
  }

  return {
    evaluated: results.length,
    completed: completedCount,
    results,
  }
}

/**
 * Check if a requirement can be auto-evaluated from health data
 */
function canAutoEvaluateFromHealth(requirement: RequirementDSL): boolean {
  const healthMetrics = [
    'steps',
    'exercise_minutes',
    'workout_minutes',
    'sleep_hours',
    'sleep_minutes',
    'workouts',
    'workout_count',
    'active_calories',
    'protein_logged',
  ]

  switch (requirement.type) {
    case 'numeric': {
      const req = requirement as NumericRequirement
      return healthMetrics.includes(req.metric)
    }
    case 'boolean': {
      const req = requirement as BooleanRequirement
      return healthMetrics.includes(req.metric)
    }
    case 'compound': {
      const req = requirement as CompoundRequirement
      return req.requirements.every((r) => canAutoEvaluateFromHealth(r))
    }
    default:
      return false
  }
}

/**
 * Get all active quest templates
 */
export async function getAllQuestTemplates(userId: string) {
  const templates = await requireDb()
    .select()
    .from(questTemplates)
    .where(eq(questTemplates.isActive, true))

  // Get existing quest logs for today to check which are active
  const today = getTodayDate()
  const existingLogs = await requireDb()
    .select()
    .from(questLogs)
    .where(and(eq(questLogs.userId, userId), eq(questLogs.questDate, today)))

  const activeTemplateIds = new Set(existingLogs.map(log => log.templateId))

  return templates.map(template => ({
    id: template.id,
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
    isActive: activeTemplateIds.has(template.id),
  }))
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
