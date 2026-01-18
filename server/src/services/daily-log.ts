import { dbClient as db } from '../db'
import { dailyLogs, questLogs, questTemplates, users } from '../db/schema'
import { eq, and } from 'drizzle-orm'
import { getTodayDateForTimezone, getSafeTimezone, type Timezone } from '../lib/timezone'
import { getStreakBonus, updateUserStreak } from './streak'

function requireDb() {
  if (!db) {
    throw new Error('Database connection required for daily log service')
  }
  return db
}

/**
 * Get today's date in YYYY-MM-DD format for user's timezone
 */
function getTodayDate(timezone: Timezone = 'UTC'): string {
  const safeTimezone = getSafeTimezone(timezone)
  return getTodayDateForTimezone(safeTimezone)
}

/**
 * Time phase of the day based on user's local time
 */
export type DayPhase = 'morning' | 'midday' | 'afternoon' | 'evening' | 'night' | 'closed'

/**
 * Get current day phase based on hour
 */
export function getDayPhase(hour: number, isDayClosed: boolean): DayPhase {
  if (isDayClosed) return 'closed'
  if (hour >= 5 && hour < 10) return 'morning'
  if (hour >= 10 && hour < 16) return 'midday'
  if (hour >= 16 && hour < 20) return 'afternoon'
  if (hour >= 20 && hour < 22) return 'evening'
  return 'night'
}

/**
 * Check if reconciliation should be shown based on time and day status
 */
export function shouldShowReconciliation(
  hour: number,
  _minute: number,
  isDayClosed: boolean,
  reconciliationTime: number = 22 // Default 10 PM
): boolean {
  if (isDayClosed) return false
  // Show reconciliation if current time >= reconciliation time
  return hour >= reconciliationTime
}

/**
 * Get hours and minutes until midnight for countdown
 */
export function getTimeUntilMidnight(hour: number, minute: number): { hours: number; minutes: number } {
  const minutesUntil = (24 - hour - 1) * 60 + (60 - minute)
  return {
    hours: Math.floor(minutesUntil / 60),
    minutes: minutesUntil % 60,
  }
}

/**
 * Day status including all relevant timing information
 */
export interface DayStatus {
  date: string
  phase: DayPhase
  isDayClosed: boolean
  closedAt: Date | null
  shouldShowReconciliation: boolean
  timeUntilMidnight: { hours: number; minutes: number } | null
  reconciliationTime: number
}

/**
 * Get comprehensive day status
 */
export async function getDayStatus(
  userId: string,
  timezone: Timezone = 'UTC',
  reconciliationTime: number = 22
): Promise<DayStatus> {
  const safeTimezone = getSafeTimezone(timezone)
  const today = getTodayDateForTimezone(safeTimezone)

  // Get current time in user's timezone
  const now = new Date()
  const userTime = new Date(now.toLocaleString('en-US', { timeZone: safeTimezone }))
  const hour = userTime.getHours()
  const minute = userTime.getMinutes()

  // Check if day is already closed
  const dailyLog = await getDailyLog(userId, today)
  const isDayClosed = dailyLog?.closedAt != null

  const phase = getDayPhase(hour, isDayClosed)
  const showReconciliation = shouldShowReconciliation(hour, minute, isDayClosed, reconciliationTime)

  return {
    date: today,
    phase,
    isDayClosed,
    closedAt: dailyLog?.closedAt ?? null,
    shouldShowReconciliation: showReconciliation,
    timeUntilMidnight: isDayClosed ? getTimeUntilMidnight(hour, minute) : null,
    reconciliationTime,
  }
}

/**
 * Get or create daily log for a specific date
 */
export async function getDailyLog(userId: string, date?: string, timezone: Timezone = 'UTC') {
  const targetDate = date || getTodayDate(timezone)

  const [log] = await requireDb()
    .select()
    .from(dailyLogs)
    .where(and(eq(dailyLogs.userId, userId), eq(dailyLogs.logDate, targetDate)))
    .limit(1)

  return log
}

/**
 * Items that need reconciliation
 */
export interface ReconciliationItem {
  questId: string
  questName: string
  type: 'numeric' | 'boolean'
  category: string
  currentValue: number | null
  targetValue: number
  metric: string
  isComplete: boolean
}

/**
 * Get pending items that need reconciliation
 */
export async function getPendingReconciliationItems(
  userId: string,
  timezone: Timezone = 'UTC'
): Promise<ReconciliationItem[]> {
  const today = getTodayDate(timezone)

  // Get all active quests for today that are not yet completed
  const quests = await requireDb()
    .select({
      log: questLogs,
      template: questTemplates,
    })
    .from(questLogs)
    .innerJoin(questTemplates, eq(questLogs.templateId, questTemplates.id))
    .where(
      and(
        eq(questLogs.userId, userId),
        eq(questLogs.questDate, today),
        eq(questLogs.status, 'ACTIVE')
      )
    )

  return quests.map(({ log, template }) => {
    const requirement = template.requirement as { type: string; metric?: string; value?: number }
    return {
      questId: log.id,
      questName: template.name,
      type: requirement.type === 'numeric' ? 'numeric' : 'boolean',
      category: template.category,
      currentValue: log.currentValue,
      targetValue: log.targetValue,
      metric: requirement.metric || 'value',
      isComplete: log.status === 'COMPLETED',
    }
  })
}

/**
 * Day summary after reconciliation
 */
export interface DaySummary {
  date: string
  dayNumber: number
  coreQuestsCompleted: number
  coreQuestsTotal: number
  bonusQuestsCompleted: number
  xpEarned: number
  xpMultiplier: number
  finalXP: number
  isPerfectDay: boolean
  streakMaintained: boolean
  currentStreak: number
  level: number
  levelProgress: {
    current: number
    needed: number
    percent: number
  }
}

/**
 * Close the day and generate summary
 */
export async function closeDay(
  userId: string,
  timezone: Timezone = 'UTC'
): Promise<DaySummary> {
  const today = getTodayDate(timezone)

  // Get or create daily log
  let [dailyLog] = await requireDb()
    .select()
    .from(dailyLogs)
    .where(and(eq(dailyLogs.userId, userId), eq(dailyLogs.logDate, today)))
    .limit(1)

  if (!dailyLog) {
    // Create daily log if it doesn't exist
    const templates = await requireDb()
      .select()
      .from(questTemplates)
      .where(eq(questTemplates.isActive, true))

    const coreCount = templates.filter((t) => t.isCore).length

    const [newLog] = await requireDb()
      .insert(dailyLogs)
      .values({
        userId,
        logDate: today,
        coreQuestsTotal: coreCount,
        coreQuestsCompleted: 0,
        bonusQuestsCompleted: 0,
        xpEarned: 0,
        closedAt: new Date(),
      })
      .returning()

    dailyLog = newLog!
  } else if (!dailyLog.closedAt) {
    // Mark day as closed
    await requireDb()
      .update(dailyLogs)
      .set({ closedAt: new Date(), updatedAt: new Date() })
      .where(eq(dailyLogs.id, dailyLog.id))
  }

  // Mark any remaining active quests as expired
  await requireDb()
    .update(questLogs)
    .set({ status: 'EXPIRED', updatedAt: new Date() })
    .where(
      and(
        eq(questLogs.userId, userId),
        eq(questLogs.questDate, today),
        eq(questLogs.status, 'ACTIVE')
      )
    )

  // Update user's streak
  const streakInfo = await updateUserStreak(userId)

  // Get user data for level info
  const [user] = await requireDb()
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!user) {
    throw new Error('User not found')
  }

  // Calculate XP multiplier from streak bonus
  const streakBonus = getStreakBonus(streakInfo.currentStreak)
  const xpMultiplier = 1 + streakBonus.percent / 100

  // Get day number (based on account creation or first log)
  const allLogs = await requireDb()
    .select()
    .from(dailyLogs)
    .where(eq(dailyLogs.userId, userId))
    .orderBy(dailyLogs.logDate)

  const dayNumber = allLogs.findIndex((l) => l.logDate === today) + 1

  // Compute level progress
  const totalXP = typeof user.totalXP === 'bigint' ? Number(user.totalXP) : user.totalXP
  const level = user.level ?? 1
  // Using simple XP formula: level * 100 XP needed per level
  const xpForCurrentLevel = level * 100
  const xpProgress = totalXP % xpForCurrentLevel

  return {
    date: today,
    dayNumber: dayNumber > 0 ? dayNumber : 1,
    coreQuestsCompleted: dailyLog.coreQuestsCompleted,
    coreQuestsTotal: dailyLog.coreQuestsTotal,
    bonusQuestsCompleted: dailyLog.bonusQuestsCompleted,
    xpEarned: dailyLog.xpEarned,
    xpMultiplier,
    finalXP: Math.floor(dailyLog.xpEarned * xpMultiplier),
    isPerfectDay: dailyLog.isPerfectDay,
    streakMaintained: streakInfo.currentStreak > 0,
    currentStreak: streakInfo.currentStreak,
    level,
    levelProgress: {
      current: xpProgress,
      needed: xpForCurrentLevel,
      percent: Math.floor((xpProgress / xpForCurrentLevel) * 100),
    },
  }
}

/**
 * Get day summary without closing (for preview)
 */
export async function getDaySummaryPreview(
  userId: string,
  timezone: Timezone = 'UTC'
): Promise<DaySummary | null> {
  const today = getTodayDate(timezone)

  const [dailyLog] = await requireDb()
    .select()
    .from(dailyLogs)
    .where(and(eq(dailyLogs.userId, userId), eq(dailyLogs.logDate, today)))
    .limit(1)

  if (!dailyLog) {
    return null
  }

  // Get user data
  const [user] = await requireDb()
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!user) {
    return null
  }

  const streakBonus = getStreakBonus(user.currentStreak ?? 0)
  const xpMultiplier = 1 + streakBonus.percent / 100

  // Get day number
  const allLogs = await requireDb()
    .select()
    .from(dailyLogs)
    .where(eq(dailyLogs.userId, userId))
    .orderBy(dailyLogs.logDate)

  const dayNumber = allLogs.findIndex((l) => l.logDate === today) + 1

  const totalXP = typeof user.totalXP === 'bigint' ? Number(user.totalXP) : user.totalXP
  const level = user.level ?? 1
  const xpForCurrentLevel = level * 100
  const xpProgress = totalXP % xpForCurrentLevel

  return {
    date: today,
    dayNumber: dayNumber > 0 ? dayNumber : 1,
    coreQuestsCompleted: dailyLog.coreQuestsCompleted,
    coreQuestsTotal: dailyLog.coreQuestsTotal,
    bonusQuestsCompleted: dailyLog.bonusQuestsCompleted,
    xpEarned: dailyLog.xpEarned,
    xpMultiplier,
    finalXP: Math.floor(dailyLog.xpEarned * xpMultiplier),
    isPerfectDay: dailyLog.isPerfectDay,
    streakMaintained: user.currentStreak > 0,
    currentStreak: user.currentStreak ?? 0,
    level,
    levelProgress: {
      current: xpProgress,
      needed: xpForCurrentLevel,
      percent: Math.floor((xpProgress / xpForCurrentLevel) * 100),
    },
  }
}

/**
 * Check if the day is closed
 */
export async function isDayClosed(userId: string, timezone: Timezone = 'UTC'): Promise<boolean> {
  const today = getTodayDate(timezone)

  const [dailyLog] = await requireDb()
    .select({ closedAt: dailyLogs.closedAt })
    .from(dailyLogs)
    .where(and(eq(dailyLogs.userId, userId), eq(dailyLogs.logDate, today)))
    .limit(1)

  return dailyLog?.closedAt != null
}
