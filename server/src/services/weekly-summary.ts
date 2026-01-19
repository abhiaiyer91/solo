/**
 * Weekly Summary Service
 * Provides weekly summary data for display in the UI (distinct from email recaps)
 */

import { dbClient as db } from '../db'
import { users, dailyLogs } from '../db/schema'
import { titles, userTitles } from '../db/schema/titles'
import { eq, and, gte, sql, desc } from 'drizzle-orm'

function requireDb() {
  if (!db) {
    throw new Error('Database connection required for weekly summary service')
  }
  return db
}

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

export interface WeeklySummary {
  weekStart: string
  weekEnd: string
  daysCompleted: number
  totalDays: number
  coreCompletionRate: number
  xpEarned: number
  streakMaintained: boolean
  currentStreak: number
  perfectDays: number
  comparedToLastWeek?: {
    daysChange: number
    xpChange: number
    completionChange: number
  }
  achievements: string[]
  observation: string
}

export interface WeeklyHistory {
  summaries: WeeklySummary[]
  totalWeeks: number
}

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════

/**
 * Get Monday of a given week
 */
function getWeekStart(date: Date = new Date()): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

/**
 * Get Sunday of a given week
 */
function getWeekEnd(date: Date = new Date()): Date {
  const d = getWeekStart(date)
  d.setDate(d.getDate() + 6)
  d.setHours(23, 59, 59, 999)
  return d
}

/**
 * Format date as YYYY-MM-DD
 */
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]!
}

/**
 * Check if a date is Monday
 */
export function isMonday(date: Date = new Date()): boolean {
  return date.getDay() === 1
}

/**
 * Generate a narrative observation based on stats
 */
function generateObservation(
  completionRate: number,
  streak: number,
  perfectDays: number,
  xpChange: number
): string {
  const observations: string[] = []

  // Streak observations
  if (streak >= 30) {
    observations.push('A month of unwavering discipline. The System acknowledges mastery.')
  } else if (streak >= 14) {
    observations.push('Two weeks of consistency. The foundation is solid.')
  } else if (streak >= 7) {
    observations.push('A full week maintained. Momentum builds.')
  }

  // Performance observations
  if (completionRate >= 90) {
    observations.push('Near-perfect execution. Excellence is becoming standard.')
  } else if (completionRate >= 70) {
    observations.push('Strong performance. Room for refinement exists.')
  } else if (completionRate >= 50) {
    observations.push('Half the path walked. The other half awaits.')
  }

  // Perfect days
  if (perfectDays >= 5) {
    observations.push('Multiple perfect days achieved. Rare discipline noted.')
  }

  // Trend
  if (xpChange > 20) {
    observations.push('Significant acceleration detected. Trajectory shifted upward.')
  } else if (xpChange < -20) {
    observations.push('A quieter week recorded. Recovery has its place.')
  }

  if (observations.length === 0) {
    return 'The week is recorded. Each day builds upon the last.'
  }

  return observations[Math.floor(Math.random() * observations.length)]
}

// ═══════════════════════════════════════════════════════════
// MAIN FUNCTIONS
// ═══════════════════════════════════════════════════════════

/**
 * Get weekly summary for a specific week (defaults to previous week)
 */
export async function getWeeklySummary(
  userId: string,
  weekOffset: number = 1 // 1 = last week, 0 = current week
): Promise<WeeklySummary | null> {
  const now = new Date()
  const targetDate = new Date(now)
  targetDate.setDate(targetDate.getDate() - weekOffset * 7)

  const weekStart = getWeekStart(targetDate)
  const weekEnd = getWeekEnd(targetDate)
  const weekStartStr = formatDate(weekStart)
  const weekEndStr = formatDate(weekEnd)

  // Get user info
  const [user] = await requireDb()
    .select({
      currentStreak: users.currentStreak,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!user) return null

  // Get daily logs for the target week
  const logs = await requireDb()
    .select()
    .from(dailyLogs)
    .where(
      and(
        eq(dailyLogs.userId, userId),
        gte(dailyLogs.logDate, weekStartStr),
        sql`${dailyLogs.logDate} <= ${weekEndStr}`
      )
    )

  // Get previous week for comparison
  const prevWeekStart = new Date(weekStart)
  prevWeekStart.setDate(prevWeekStart.getDate() - 7)
  const prevWeekEnd = new Date(weekEnd)
  prevWeekEnd.setDate(prevWeekEnd.getDate() - 7)
  const prevWeekStartStr = formatDate(prevWeekStart)
  const prevWeekEndStr = formatDate(prevWeekEnd)

  const prevLogs = await requireDb()
    .select()
    .from(dailyLogs)
    .where(
      and(
        eq(dailyLogs.userId, userId),
        gte(dailyLogs.logDate, prevWeekStartStr),
        sql`${dailyLogs.logDate} <= ${prevWeekEndStr}`
      )
    )

  // Calculate current week stats
  const daysCompleted = logs.filter((l) => l.coreQuestsCompleted > 0).length
  const totalDays = 7
  const coreQuestsCompleted = logs.reduce((sum, l) => sum + l.coreQuestsCompleted, 0)
  const coreQuestsTotal = logs.reduce((sum, l) => sum + l.coreQuestsTotal, 0)
  const coreCompletionRate = coreQuestsTotal > 0 ? Math.round((coreQuestsCompleted / coreQuestsTotal) * 100) : 0
  const xpEarned = logs.reduce((sum, l) => sum + l.xpEarned, 0)
  const perfectDays = logs.filter((l) => l.isPerfectDay).length

  // Calculate previous week stats
  const prevDaysCompleted = prevLogs.filter((l) => l.coreQuestsCompleted > 0).length
  const prevCoreQuestsCompleted = prevLogs.reduce((sum, l) => sum + l.coreQuestsCompleted, 0)
  const prevCoreQuestsTotal = prevLogs.reduce((sum, l) => sum + l.coreQuestsTotal, 0)
  const prevCompletionRate = prevCoreQuestsTotal > 0 ? Math.round((prevCoreQuestsCompleted / prevCoreQuestsTotal) * 100) : 0
  const prevXpEarned = prevLogs.reduce((sum, l) => sum + l.xpEarned, 0)

  // Calculate comparison
  const comparedToLastWeek =
    prevLogs.length > 0
      ? {
          daysChange: daysCompleted - prevDaysCompleted,
          xpChange: prevXpEarned > 0 ? Math.round(((xpEarned - prevXpEarned) / prevXpEarned) * 100) : 0,
          completionChange: coreCompletionRate - prevCompletionRate,
        }
      : undefined

  // Get achievements earned this week
  const achievements: string[] = []

  try {
    const newTitles = await requireDb()
      .select({ name: titles.name })
      .from(userTitles)
      .innerJoin(titles, eq(userTitles.titleId, titles.id))
      .where(and(eq(userTitles.userId, userId), gte(userTitles.earnedAt, weekStart)))

    for (const title of newTitles) {
      achievements.push(`Earned title: "${title.name}"`)
    }
  } catch {
    // Titles table might not exist in test environments
  }

  // Add milestone achievements
  if (user.currentStreak === 7) achievements.push('7-day streak achieved')
  if (user.currentStreak === 14) achievements.push('2-week streak milestone')
  if (user.currentStreak === 30) achievements.push('30-day streak - legendary')
  if (perfectDays === 7) achievements.push('Perfect week - all days flawless')
  if (xpEarned >= 1000) achievements.push(`Earned ${xpEarned} XP in one week`)

  // Determine if streak was maintained
  const streakMaintained = daysCompleted >= 5 || user.currentStreak > 0

  return {
    weekStart: weekStartStr,
    weekEnd: weekEndStr,
    daysCompleted,
    totalDays,
    coreCompletionRate,
    xpEarned,
    streakMaintained,
    currentStreak: user.currentStreak,
    perfectDays,
    comparedToLastWeek,
    achievements,
    observation: generateObservation(
      coreCompletionRate,
      user.currentStreak,
      perfectDays,
      comparedToLastWeek?.xpChange ?? 0
    ),
  }
}

/**
 * Get weekly history (past N weeks)
 */
export async function getWeeklyHistory(userId: string, weeks: number = 4): Promise<WeeklyHistory> {
  const summaries: WeeklySummary[] = []

  for (let i = 1; i <= weeks; i++) {
    const summary = await getWeeklySummary(userId, i)
    if (summary && summary.daysCompleted > 0) {
      summaries.push(summary)
    }
  }

  return {
    summaries,
    totalWeeks: summaries.length,
  }
}

/**
 * Check if user should see weekly summary (Monday morning, not dismissed)
 */
export async function shouldShowWeeklySummary(
  userId: string,
  lastDismissedWeek?: string
): Promise<{ show: boolean; summary: WeeklySummary | null }> {
  const now = new Date()

  // Only show on Monday
  if (!isMonday(now)) {
    return { show: false, summary: null }
  }

  // Get last week's summary
  const summary = await getWeeklySummary(userId, 1)

  if (!summary) {
    return { show: false, summary: null }
  }

  // Check if already dismissed for this week
  if (lastDismissedWeek === summary.weekStart) {
    return { show: false, summary: null }
  }

  return { show: true, summary }
}
