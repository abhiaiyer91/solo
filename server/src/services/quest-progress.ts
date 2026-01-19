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
import { createXPEvent } from './xp'
import { updateUserStreak } from './streak'
import { getTodayHealthSnapshot, healthDataToQuestData } from './health'
import { type Timezone } from '../lib/timezone'
import { requireDb, evaluateRequirement, getTodayQuests } from './quest-core'

/**
 * Check if a requirement can be auto-evaluated from health data
 */
export function canAutoEvaluateFromHealth(requirement: RequirementDSL): boolean {
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
