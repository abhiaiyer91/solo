import {
  questTemplates,
  questLogs,
  dailyLogs,
} from '../db/schema'
import { eq, and } from 'drizzle-orm'
import { requireDb } from './quest-core'

/**
 * Get quest history for a user with aggregated statistics
 */
export async function getQuestHistory(
  userId: string,
  options: {
    limit?: number
    offset?: number
    daysBack?: number
    status?: 'COMPLETED' | 'FAILED' | 'ACTIVE'
    type?: 'DAILY' | 'WEEKLY'
  } = {}
) {
  const { limit = 30, offset = 0, daysBack = 30, status, type } = options

  // Build where conditions
  const conditions = [eq(questLogs.userId, userId)]

  if (status) {
    conditions.push(eq(questLogs.status, status))
  }

  // Get quest history with template info
  const history = await requireDb()
    .select({
      log: questLogs,
      template: questTemplates,
    })
    .from(questLogs)
    .innerJoin(questTemplates, eq(questLogs.templateId, questTemplates.id))
    .where(and(...conditions))
    .orderBy(questLogs.questDate, questLogs.createdAt)
    .limit(limit)
    .offset(offset)

  // Filter by type if specified (need to do this after join)
  const filteredHistory = type
    ? history.filter((h) => h.template.type === type)
    : history

  // Calculate aggregate statistics
  const stats = await getQuestStatistics(userId, daysBack)

  return {
    history: filteredHistory.map((h) => ({
      id: h.log.id,
      questDate: h.log.questDate,
      name: h.template.name,
      description: h.template.description,
      type: h.template.type,
      category: h.template.category,
      status: h.log.status,
      currentValue: h.log.currentValue,
      targetValue: h.log.targetValue,
      completionPercent: h.log.completionPercent,
      completedAt: h.log.completedAt,
      xpAwarded: h.log.xpAwarded,
    })),
    stats,
    pagination: {
      limit,
      offset,
      total: filteredHistory.length,
    },
  }
}

/**
 * Get aggregated quest statistics for a user
 */
export async function getQuestStatistics(userId: string, daysBack: number = 30) {
  // Get all quest logs in date range
  const allLogs = await requireDb()
    .select({
      log: questLogs,
      template: questTemplates,
    })
    .from(questLogs)
    .innerJoin(questTemplates, eq(questLogs.templateId, questTemplates.id))
    .where(eq(questLogs.userId, userId))

  // Calculate statistics
  const totalQuests = allLogs.length
  const completedQuests = allLogs.filter((l) => l.log.status === 'COMPLETED').length
  const failedQuests = allLogs.filter((l) => l.log.status === 'FAILED').length
  const partialQuests = allLogs.filter(
    (l) => l.log.status === 'COMPLETED' && l.log.completionPercent && l.log.completionPercent < 100
  ).length

  const completionRate = totalQuests > 0 ? (completedQuests / totalQuests) * 100 : 0

  const totalXP = allLogs.reduce((sum, l) => sum + (l.log.xpAwarded ?? 0), 0)

  // Find most completed quest
  const questCounts = new Map<string, { count: number; name: string }>()
  allLogs.forEach((l) => {
    if (l.log.status === 'COMPLETED') {
      const current = questCounts.get(l.template.id) || { count: 0, name: l.template.name }
      questCounts.set(l.template.id, { count: current.count + 1, name: l.template.name })
    }
  })

  let favoriteQuest: { name: string; count: number } | null = null
  let maxCount = 0
  questCounts.forEach((value) => {
    if (value.count > maxCount) {
      maxCount = value.count
      favoriteQuest = { name: value.name, count: value.count }
    }
  })

  // Calculate current streak (consecutive days with completed quests)
  const dailyLogsData = await requireDb()
    .select()
    .from(dailyLogs)
    .where(eq(dailyLogs.userId, userId))
    .orderBy(dailyLogs.logDate)

  let currentStreak = 0
  const sortedDates = dailyLogsData
    .map((d) => d.logDate)
    .sort()
    .reverse()

  for (let i = 0; i < sortedDates.length; i++) {
    const date = sortedDates[i]
    const log = dailyLogsData.find((d) => d.logDate === date)

    if (log && log.coreQuestsCompleted && log.coreQuestsCompleted > 0) {
      currentStreak++
    } else {
      break
    }
  }

  // Get completion by day for calendar
  const completionByDay = new Map<string, number>()
  allLogs.forEach((l) => {
    if (l.log.status === 'COMPLETED') {
      const count = completionByDay.get(l.log.questDate) || 0
      completionByDay.set(l.log.questDate, count + 1)
    }
  })

  return {
    totalQuests,
    completedQuests,
    failedQuests,
    partialQuests,
    completionRate: Math.round(completionRate * 100) / 100,
    totalXP,
    favoriteQuest,
    currentStreak,
    completionByDay: Object.fromEntries(completionByDay),
  }
}
