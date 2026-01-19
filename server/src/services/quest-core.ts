import { dbClient as db } from '../db'
import {
  questTemplates,
  questLogs,
  type RequirementDSL,
  type NumericRequirement,
  type BooleanRequirement,
  type CompoundRequirement,
} from '../db/schema'
import { eq, and } from 'drizzle-orm'
import { getTodayDateForTimezone, getSafeTimezone, type Timezone } from '../lib/timezone'
import { getTodayRotatingQuest, getRotatingQuestUnlockStatus } from './rotating-quest'

export function requireDb() {
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
export function getTodayDate(timezone: Timezone = 'UTC'): string {
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
