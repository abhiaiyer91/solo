/**
 * Analytics Service
 * Computes player analytics for trends, patterns, and insights
 */

import { dbClient as db } from '../db'
import { dailyLogs, questLogs, xpEvents } from '../db/schema'
import { eq, and, gte, lte, desc, sql, count } from 'drizzle-orm'

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

export interface AnalyticsSummary {
  period: 'week' | 'month' | 'alltime'
  questCompletion: {
    total: number
    completed: number
    rate: number
    trend: number // % change from previous period
  }
  xpEarned: {
    total: number
    average: number
    trend: number
  }
  streaks: {
    current: number
    longest: number
    perfectDays: number
  }
  bestDay: {
    date: string
    xpEarned: number
    questsCompleted: number
  } | null
  statProgression: {
    STR: number[]
    AGI: number[]
    VIT: number[]
    DISC: number[]
    dates: string[]
  }
}

export interface DayPattern {
  hour: number
  day: number // 0 = Sunday, 6 = Saturday
  count: number
  avgXP: number
}

export interface TrendData {
  date: string
  value: number
}

// ═══════════════════════════════════════════════════════════
// MAIN ANALYTICS FUNCTIONS
// ═══════════════════════════════════════════════════════════

/**
 * Get comprehensive analytics summary for a user
 */
export async function getAnalyticsSummary(
  userId: string,
  period: 'week' | 'month' | 'alltime' = 'week'
): Promise<AnalyticsSummary> {
  const now = new Date()
  const periodDays = period === 'week' ? 7 : period === 'month' ? 30 : 365

  const startDate = new Date(now)
  startDate.setDate(startDate.getDate() - periodDays)
  const startDateStr = startDate.toISOString().split('T')[0]

  // Previous period for trend comparison
  const prevStartDate = new Date(startDate)
  prevStartDate.setDate(prevStartDate.getDate() - periodDays)
  const prevStartDateStr = prevStartDate.toISOString().split('T')[0]

  // Get daily logs for current period
  const currentLogs = await db
    .select()
    .from(dailyLogs)
    .where(and(eq(dailyLogs.userId, userId), gte(dailyLogs.logDate, startDateStr)))

  // Get daily logs for previous period (for trend)
  const previousLogs = await db
    .select()
    .from(dailyLogs)
    .where(
      and(
        eq(dailyLogs.userId, userId),
        gte(dailyLogs.logDate, prevStartDateStr),
        lte(dailyLogs.logDate, startDateStr)
      )
    )

  // Calculate quest completion
  const currentTotal = currentLogs.reduce((sum, log) => sum + log.coreQuestsTotal, 0)
  const currentCompleted = currentLogs.reduce((sum, log) => sum + log.coreQuestsCompleted, 0)
  const currentRate = currentTotal > 0 ? Math.round((currentCompleted / currentTotal) * 100) : 0

  const prevTotal = previousLogs.reduce((sum, log) => sum + log.coreQuestsTotal, 0)
  const prevCompleted = previousLogs.reduce((sum, log) => sum + log.coreQuestsCompleted, 0)
  const prevRate = prevTotal > 0 ? Math.round((prevCompleted / prevTotal) * 100) : 0

  // Calculate XP
  const currentXP = currentLogs.reduce((sum, log) => sum + log.xpEarned, 0)
  const prevXP = previousLogs.reduce((sum, log) => sum + log.xpEarned, 0)

  // Calculate streaks
  const perfectDays = currentLogs.filter((log) => log.isPerfectDay).length

  // Find best day
  const bestDayLog = currentLogs.reduce(
    (best, log) => {
      if (!best || log.xpEarned > best.xpEarned) return log
      return best
    },
    null as (typeof currentLogs)[0] | null
  )

  // Get stat progression (simplified - would need actual stat tracking)
  const statProgression = await getStatProgression(userId, periodDays)

  // Get current and longest streak from user profile (simplified)
  const streakData = await getStreakData(userId)

  return {
    period,
    questCompletion: {
      total: currentTotal,
      completed: currentCompleted,
      rate: currentRate,
      trend: currentRate - prevRate,
    },
    xpEarned: {
      total: currentXP,
      average: currentLogs.length > 0 ? Math.round(currentXP / currentLogs.length) : 0,
      trend: prevXP > 0 ? Math.round(((currentXP - prevXP) / prevXP) * 100) : 0,
    },
    streaks: {
      current: streakData.current,
      longest: streakData.longest,
      perfectDays,
    },
    bestDay: bestDayLog
      ? {
          date: bestDayLog.logDate,
          xpEarned: bestDayLog.xpEarned,
          questsCompleted: bestDayLog.coreQuestsCompleted + bestDayLog.bonusQuestsCompleted,
        }
      : null,
    statProgression,
  }
}

/**
 * Get quest completion trend data
 */
export async function getQuestTrend(
  userId: string,
  days: number = 30
): Promise<TrendData[]> {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  const startDateStr = startDate.toISOString().split('T')[0]

  const logs = await db
    .select({
      date: dailyLogs.logDate,
      total: dailyLogs.coreQuestsTotal,
      completed: dailyLogs.coreQuestsCompleted,
    })
    .from(dailyLogs)
    .where(and(eq(dailyLogs.userId, userId), gte(dailyLogs.logDate, startDateStr)))
    .orderBy(dailyLogs.logDate)

  return logs.map((log) => ({
    date: log.date,
    value: log.total > 0 ? Math.round((log.completed / log.total) * 100) : 0,
  }))
}

/**
 * Get XP earning trend data
 */
export async function getXPTrend(userId: string, days: number = 30): Promise<TrendData[]> {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  const startDateStr = startDate.toISOString().split('T')[0]

  const logs = await db
    .select({
      date: dailyLogs.logDate,
      xp: dailyLogs.xpEarned,
    })
    .from(dailyLogs)
    .where(and(eq(dailyLogs.userId, userId), gte(dailyLogs.logDate, startDateStr)))
    .orderBy(dailyLogs.logDate)

  return logs.map((log) => ({
    date: log.date,
    value: log.xp,
  }))
}

/**
 * Get activity heatmap data (day of week × hour)
 */
export async function getActivityHeatmap(
  userId: string,
  days: number = 90
): Promise<DayPattern[]> {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  // Get XP events with timestamps
  const events = await db
    .select({
      createdAt: xpEvents.createdAt,
      finalAmount: xpEvents.finalAmount,
    })
    .from(xpEvents)
    .where(and(eq(xpEvents.userId, userId), gte(xpEvents.createdAt, startDate)))

  // Aggregate by day of week and hour
  const heatmapData = new Map<string, { count: number; totalXP: number }>()

  for (const event of events) {
    const date = new Date(event.createdAt)
    const day = date.getDay()
    const hour = date.getHours()
    const key = `${day}-${hour}`

    const existing = heatmapData.get(key) || { count: 0, totalXP: 0 }
    existing.count++
    existing.totalXP += event.finalAmount
    heatmapData.set(key, existing)
  }

  // Convert to array format
  const result: DayPattern[] = []
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      const key = `${day}-${hour}`
      const data = heatmapData.get(key) || { count: 0, totalXP: 0 }
      result.push({
        hour,
        day,
        count: data.count,
        avgXP: data.count > 0 ? Math.round(data.totalXP / data.count) : 0,
      })
    }
  }

  return result
}

/**
 * Get personal bests comparison
 */
export async function getPersonalBests(userId: string) {
  // Best single day XP
  const bestDayXP = await db
    .select({
      date: dailyLogs.logDate,
      xp: dailyLogs.xpEarned,
    })
    .from(dailyLogs)
    .where(eq(dailyLogs.userId, userId))
    .orderBy(desc(dailyLogs.xpEarned))
    .limit(1)

  // Best week (7-day rolling)
  const allLogs = await db
    .select({
      date: dailyLogs.logDate,
      xp: dailyLogs.xpEarned,
    })
    .from(dailyLogs)
    .where(eq(dailyLogs.userId, userId))
    .orderBy(dailyLogs.logDate)

  let bestWeekXP = 0
  let bestWeekStart = ''
  for (let i = 6; i < allLogs.length; i++) {
    const weekXP = allLogs.slice(i - 6, i + 1).reduce((sum, log) => sum + log.xp, 0)
    if (weekXP > bestWeekXP) {
      bestWeekXP = weekXP
      bestWeekStart = allLogs[i - 6].date
    }
  }

  // Most quests completed in a day
  const mostQuests = await db
    .select({
      date: dailyLogs.logDate,
      completed: sql<number>`${dailyLogs.coreQuestsCompleted} + ${dailyLogs.bonusQuestsCompleted}`,
    })
    .from(dailyLogs)
    .where(eq(dailyLogs.userId, userId))
    .orderBy(desc(sql`${dailyLogs.coreQuestsCompleted} + ${dailyLogs.bonusQuestsCompleted}`))
    .limit(1)

  return {
    bestDayXP: bestDayXP[0] || null,
    bestWeek: bestWeekXP > 0 ? { startDate: bestWeekStart, xp: bestWeekXP } : null,
    mostQuestsInDay: mostQuests[0] || null,
  }
}

// ═══════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════

async function getStatProgression(userId: string, days: number) {
  // Simplified stat progression - would need actual stat tracking table
  // For now, return empty arrays
  return {
    STR: [] as number[],
    AGI: [] as number[],
    VIT: [] as number[],
    DISC: [] as number[],
    dates: [] as string[],
  }
}

async function getStreakData(userId: string) {
  // Get streak from daily logs
  const logs = await db
    .select({
      date: dailyLogs.logDate,
      isPerfect: dailyLogs.isPerfectDay,
    })
    .from(dailyLogs)
    .where(eq(dailyLogs.userId, userId))
    .orderBy(desc(dailyLogs.logDate))
    .limit(365)

  if (logs.length === 0) {
    return { current: 0, longest: 0 }
  }

  // Calculate current streak
  let current = 0
  const today = new Date().toISOString().split('T')[0]
  let checkDate = today

  for (const log of logs) {
    if (log.date === checkDate && log.isPerfect) {
      current++
      const d = new Date(checkDate)
      d.setDate(d.getDate() - 1)
      checkDate = d.toISOString().split('T')[0]
    } else if (log.date < checkDate) {
      break
    }
  }

  // Calculate longest streak
  let longest = 0
  let currentStreak = 0
  let prevDate: string | null = null

  for (const log of logs.reverse()) {
    if (!log.isPerfect) {
      currentStreak = 0
      prevDate = null
      continue
    }

    if (!prevDate) {
      currentStreak = 1
    } else {
      const prev = new Date(prevDate)
      const curr = new Date(log.date)
      const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24))
      if (diffDays === 1) {
        currentStreak++
      } else {
        currentStreak = 1
      }
    }
    prevDate = log.date
    longest = Math.max(longest, currentStreak)
  }

  return { current, longest }
}
