import { dbClient as db } from '../db'
import { questTemplates, questLogs, dailyLogs } from '../db/schema'
import { eq, and, gte, lte, sql } from 'drizzle-orm'
import { createXPEvent } from './xp'

function requireDb() {
  if (!db) {
    throw new Error('Database connection required for weekly quest service')
  }
  return db
}

/**
 * Get the Monday of a given week (start of week)
 */
function getWeekStart(date: Date = new Date()): string {
  const d = new Date(date)
  const day = d.getDay()
  // Adjust to Monday (day 0 is Sunday, so Monday is 1)
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  return d.toISOString().split('T')[0]!
}

/**
 * Get the Sunday of a given week (end of week)
 */
function getWeekEnd(date: Date = new Date()): string {
  const d = new Date(date)
  const day = d.getDay()
  // Adjust to Sunday
  const diff = d.getDate() + (day === 0 ? 0 : 7 - day)
  d.setDate(diff)
  return d.toISOString().split('T')[0]!
}

/**
 * Get week identifier in YYYY-WXX format
 */
function getWeekIdentifier(date: Date = new Date()): string {
  const weekStart = getWeekStart(date)
  return `week:${weekStart}`
}

export interface WeeklyQuestProgress {
  id: string
  templateId: string
  name: string
  description: string
  category: string
  baseXP: number
  weekStart: string
  weekEnd: string
  status: 'ACTIVE' | 'COMPLETED' | 'FAILED' | 'EXPIRED'
  currentDays: number
  targetDays: number
  progressPercent: number
  completedAt: Date | null
  xpAwarded: number | null
}

interface DailyQuestStats {
  date: string
  stepsGoalMet: boolean
  workoutCompleted: boolean
  proteinGoalMet: boolean
}

/**
 * Get daily quest completion stats for a week
 */
async function getDailyStatsForWeek(
  userId: string,
  weekStart: string,
  weekEnd: string
): Promise<DailyQuestStats[]> {
  // Get all daily logs for the week
  const logs = await requireDb()
    .select({
      logDate: dailyLogs.logDate,
      healthData: dailyLogs.healthData,
    })
    .from(dailyLogs)
    .where(
      and(
        eq(dailyLogs.userId, userId),
        gte(dailyLogs.logDate, weekStart),
        lte(dailyLogs.logDate, weekEnd)
      )
    )

  // Get quest completions for the week
  const questCompletions = await requireDb()
    .select({
      questDate: questLogs.questDate,
      templateId: questLogs.templateId,
      status: questLogs.status,
      currentValue: questLogs.currentValue,
      targetValue: questLogs.targetValue,
      template: questTemplates,
    })
    .from(questLogs)
    .innerJoin(questTemplates, eq(questLogs.templateId, questTemplates.id))
    .where(
      and(
        eq(questLogs.userId, userId),
        gte(questLogs.questDate, weekStart),
        lte(questLogs.questDate, weekEnd),
        eq(questTemplates.type, 'DAILY')
      )
    )

  // Build stats for each day
  const statsMap = new Map<string, DailyQuestStats>()

  // Initialize with all logged days
  for (const log of logs) {
    statsMap.set(log.logDate, {
      date: log.logDate,
      stepsGoalMet: false,
      workoutCompleted: false,
      proteinGoalMet: false,
    })
  }

  // Check quest completions
  for (const completion of questCompletions) {
    if (completion.status !== 'COMPLETED') continue

    const stats = statsMap.get(completion.questDate) || {
      date: completion.questDate,
      stepsGoalMet: false,
      workoutCompleted: false,
      proteinGoalMet: false,
    }

    const templateName = completion.template.name.toLowerCase()

    if (templateName.includes('steps') || templateName.includes('daily steps')) {
      stats.stepsGoalMet = true
    }
    if (templateName.includes('workout') || templateName.includes('exercise')) {
      stats.workoutCompleted = true
    }
    if (templateName.includes('protein')) {
      stats.proteinGoalMet = true
    }

    statsMap.set(completion.questDate, stats)
  }

  return Array.from(statsMap.values())
}

/**
 * Calculate weekly quest progress from daily stats
 */
function calculateWeeklyProgress(
  questName: string,
  dailyStats: DailyQuestStats[]
): { currentDays: number; targetDays: number } {
  const questLower = questName.toLowerCase()

  if (questLower.includes('movement week')) {
    // Movement Week: Hit step goal 5/7 days
    const daysWithSteps = dailyStats.filter((s) => s.stepsGoalMet).length
    return { currentDays: daysWithSteps, targetDays: 5 }
  }

  if (questLower.includes('perfect movement')) {
    // Perfect Movement: Hit step goal 7/7 days
    const daysWithSteps = dailyStats.filter((s) => s.stepsGoalMet).length
    return { currentDays: daysWithSteps, targetDays: 7 }
  }

  if (questLower.includes('strength consistency')) {
    // Strength Consistency: 3 workouts minimum
    const daysWithWorkout = dailyStats.filter((s) => s.workoutCompleted).length
    return { currentDays: daysWithWorkout, targetDays: 3 }
  }

  if (questLower.includes('recovery focus') || questLower.includes('protein')) {
    // Recovery Focus: Hit protein 5/7 days
    const daysWithProtein = dailyStats.filter((s) => s.proteinGoalMet).length
    return { currentDays: daysWithProtein, targetDays: 5 }
  }

  // Default: count all active days
  return { currentDays: dailyStats.length, targetDays: 7 }
}

/**
 * Get or create weekly quests for a user
 */
export async function getWeeklyQuests(
  userId: string,
  date: Date = new Date()
): Promise<WeeklyQuestProgress[]> {
  const weekStart = getWeekStart(date)
  const weekEnd = getWeekEnd(date)
  const weekId = getWeekIdentifier(date)

  // Get weekly quest templates
  const weeklyTemplates = await requireDb()
    .select()
    .from(questTemplates)
    .where(
      and(eq(questTemplates.type, 'WEEKLY'), eq(questTemplates.isActive, true))
    )

  if (weeklyTemplates.length === 0) {
    return []
  }

  // Check for existing weekly quest logs
  const existingLogs = await requireDb()
    .select({
      log: questLogs,
      template: questTemplates,
    })
    .from(questLogs)
    .innerJoin(questTemplates, eq(questLogs.templateId, questTemplates.id))
    .where(and(eq(questLogs.userId, userId), eq(questLogs.questDate, weekId)))

  // Get daily stats for progress calculation
  const dailyStats = await getDailyStatsForWeek(userId, weekStart, weekEnd)

  // Create logs for new templates
  const existingTemplateIds = new Set(existingLogs.map((l) => l.template.id))
  const newTemplates = weeklyTemplates.filter(
    (t) => !existingTemplateIds.has(t.id)
  )

  if (newTemplates.length > 0) {
    for (const template of newTemplates) {
      const { targetDays } = calculateWeeklyProgress(template.name, dailyStats)

      await requireDb()
        .insert(questLogs)
        .values({
          userId,
          templateId: template.id,
          questDate: weekId,
          status: 'ACTIVE',
          currentValue: 0,
          targetValue: targetDays,
          completionPercent: 0,
        })
    }

    // Re-fetch logs after creating new ones
    return getWeeklyQuests(userId, date)
  }

  // Build response with calculated progress
  const results: WeeklyQuestProgress[] = []

  for (const { log, template } of existingLogs) {
    const { currentDays, targetDays } = calculateWeeklyProgress(
      template.name,
      dailyStats
    )
    const progressPercent = Math.min((currentDays / targetDays) * 100, 100)
    const isCompleted = currentDays >= targetDays

    // Check if we need to complete the quest
    if (isCompleted && log.status === 'ACTIVE') {
      await completeWeeklyQuest(log.id, userId, template.baseXP, template.name)
    }

    results.push({
      id: log.id,
      templateId: template.id,
      name: template.name,
      description: template.description,
      category: template.category,
      baseXP: template.baseXP,
      weekStart,
      weekEnd,
      status: isCompleted ? 'COMPLETED' : log.status,
      currentDays,
      targetDays,
      progressPercent,
      completedAt: log.completedAt,
      xpAwarded: log.xpAwarded,
    })
  }

  return results
}

/**
 * Complete a weekly quest and award XP
 */
async function completeWeeklyQuest(
  questLogId: string,
  userId: string,
  baseXP: number,
  questName: string
): Promise<{ xpAwarded: number; leveledUp: boolean; newLevel: number }> {
  // Create XP event
  const xpResult = await createXPEvent({
    userId,
    source: 'QUEST_COMPLETION',
    sourceId: questLogId,
    baseAmount: baseXP,
    description: `Completed weekly quest: ${questName}`,
  })

  // Update quest log
  await requireDb()
    .update(questLogs)
    .set({
      status: 'COMPLETED',
      completionPercent: 100,
      completedAt: new Date(),
      xpAwarded: xpResult.event.finalAmount,
      updatedAt: new Date(),
    })
    .where(eq(questLogs.id, questLogId))

  return {
    xpAwarded: xpResult.event.finalAmount,
    leveledUp: xpResult.leveledUp,
    newLevel: xpResult.newLevel,
  }
}

/**
 * Get a single weekly quest by ID
 */
export async function getWeeklyQuestById(
  questLogId: string,
  userId: string
): Promise<WeeklyQuestProgress | null> {
  const [result] = await requireDb()
    .select({
      log: questLogs,
      template: questTemplates,
    })
    .from(questLogs)
    .innerJoin(questTemplates, eq(questLogs.templateId, questTemplates.id))
    .where(
      and(
        eq(questLogs.id, questLogId),
        eq(questLogs.userId, userId),
        eq(questTemplates.type, 'WEEKLY')
      )
    )
    .limit(1)

  if (!result) return null

  const { log, template } = result
  const weekId = log.questDate
  const weekStartMatch = weekId.match(/week:(\d{4}-\d{2}-\d{2})/)
  const weekStart = weekStartMatch?.[1] ?? getWeekStart()
  const weekEnd = getWeekEnd(new Date(weekStart))

  const dailyStats = await getDailyStatsForWeek(userId, weekStart, weekEnd)
  const { currentDays, targetDays } = calculateWeeklyProgress(
    template.name,
    dailyStats
  )
  const progressPercent = Math.min((currentDays / targetDays) * 100, 100)

  return {
    id: log.id,
    templateId: template.id,
    name: template.name,
    description: template.description,
    category: template.category,
    baseXP: template.baseXP,
    weekStart,
    weekEnd,
    status: log.status,
    currentDays,
    targetDays,
    progressPercent,
    completedAt: log.completedAt,
    xpAwarded: log.xpAwarded,
  }
}

/**
 * Check and expire old weekly quests
 * Call this at the start of each week
 */
export async function expireOldWeeklyQuests(): Promise<number> {
  const currentWeekId = getWeekIdentifier()

  // Find all active weekly quests from previous weeks
  const result = await requireDb()
    .update(questLogs)
    .set({
      status: 'EXPIRED',
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(questLogs.status, 'ACTIVE'),
        sql`${questLogs.questDate} LIKE 'week:%'`,
        sql`${questLogs.questDate} < ${currentWeekId}`
      )
    )

  return result.length
}
