import { dbClient as db } from '../db'
import { users, dailyLogs } from '../db/schema'
import { eq, desc } from 'drizzle-orm'

function requireDb() {
  if (!db) {
    throw new Error('Database connection required for streak service')
  }
  return db
}

export interface StreakInfo {
  currentStreak: number
  longestStreak: number
  perfectStreak: number
  bonusTier: 'none' | 'bronze' | 'silver' | 'gold'
  bonusPercent: number
  streakStartDate: string | null
  daysUntilNextTier: number | null
}

/**
 * Get streak bonus multiplier based on current streak
 */
export function getStreakBonus(streakDays: number): { tier: 'none' | 'bronze' | 'silver' | 'gold'; percent: number } {
  if (streakDays >= 30) return { tier: 'gold', percent: 25 }
  if (streakDays >= 14) return { tier: 'silver', percent: 15 }
  if (streakDays >= 7) return { tier: 'bronze', percent: 10 }
  return { tier: 'none', percent: 0 }
}

/**
 * Calculate days until next streak bonus tier
 */
function getDaysUntilNextTier(streakDays: number): number | null {
  if (streakDays >= 30) return null // Already at max tier
  if (streakDays >= 14) return 30 - streakDays
  if (streakDays >= 7) return 14 - streakDays
  return 7 - streakDays
}

/**
 * Get days difference between two YYYY-MM-DD dates
 */
function getDaysDifference(date1: string, date2: string): number {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  const diffTime = Math.abs(d2.getTime() - d1.getTime())
  return Math.floor(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Get previous day's date in YYYY-MM-DD format
 */
function getPreviousDate(dateStr: string): string {
  const date = new Date(dateStr)
  date.setDate(date.getDate() - 1)
  return date.toISOString().split('T')[0]!
}

/**
 * Calculate streak from daily logs
 * A streak day requires all core quests completed
 */
export async function calculateStreak(userId: string): Promise<{
  currentStreak: number
  perfectStreak: number
  streakStartDate: string | null
}> {
  // Get daily logs in reverse chronological order
  const logs = await requireDb()
    .select()
    .from(dailyLogs)
    .where(eq(dailyLogs.userId, userId))
    .orderBy(desc(dailyLogs.logDate))
    .limit(365) // Max 1 year lookback

  if (logs.length === 0) {
    return { currentStreak: 0, perfectStreak: 0, streakStartDate: null }
  }

  let currentStreak = 0
  let perfectStreak = 0
  let streakStartDate: string | null = null
  let perfectStreakBroken = false

  // Get today's date
  const today = new Date().toISOString().split('T')[0]!

  // Check if there's a gap between today and most recent log
  const mostRecentLog = logs[0]!
  const daysSinceLastLog = getDaysDifference(mostRecentLog.logDate, today)

  // If more than 1 day gap (not today and not yesterday), streak is broken
  if (daysSinceLastLog > 1) {
    return { currentStreak: 0, perfectStreak: 0, streakStartDate: null }
  }

  // Count consecutive days where core quests were completed
  let expectedDate = daysSinceLastLog === 0 ? today : mostRecentLog.logDate

  for (const log of logs) {
    const daysDiff = getDaysDifference(log.logDate, expectedDate)

    // Allow for the log to be on expectedDate or the day before
    if (daysDiff > 1) {
      // Gap in logs - streak broken
      break
    }

    // Check if all core quests were completed
    if (log.coreQuestsCompleted >= log.coreQuestsTotal && log.coreQuestsTotal > 0) {
      currentStreak++
      streakStartDate = log.logDate

      // Check for perfect day (all quests including bonus)
      if (log.isPerfectDay && !perfectStreakBroken) {
        perfectStreak++
      } else {
        perfectStreakBroken = true // Once broken, perfect streak stops counting
      }
    } else {
      // Missed core quests - streak broken
      break
    }

    // Move to previous day for next iteration
    expectedDate = getPreviousDate(log.logDate)
  }

  return { currentStreak, perfectStreak, streakStartDate }
}

/**
 * Update user's streak data
 */
export async function updateUserStreak(userId: string): Promise<StreakInfo> {
  const { currentStreak, perfectStreak, streakStartDate } = await calculateStreak(userId)

  // Get current user data
  const [user] = await requireDb()
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!user) {
    throw new Error('User not found')
  }

  // Update longest streak if current exceeds it
  const newLongestStreak = Math.max(currentStreak, user.longestStreak)

  // Update user
  await requireDb()
    .update(users)
    .set({
      currentStreak,
      longestStreak: newLongestStreak,
      perfectStreak,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))

  const bonus = getStreakBonus(currentStreak)

  return {
    currentStreak,
    longestStreak: newLongestStreak,
    perfectStreak,
    bonusTier: bonus.tier,
    bonusPercent: bonus.percent,
    streakStartDate,
    daysUntilNextTier: getDaysUntilNextTier(currentStreak),
  }
}

/**
 * Get streak info for a user (without updating)
 */
export async function getStreakInfo(userId: string): Promise<StreakInfo> {
  const [user] = await requireDb()
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!user) {
    throw new Error('User not found')
  }

  const bonus = getStreakBonus(user.currentStreak)

  // Calculate streak start date
  const { streakStartDate } = await calculateStreak(userId)

  return {
    currentStreak: user.currentStreak,
    longestStreak: user.longestStreak,
    perfectStreak: user.perfectStreak,
    bonusTier: bonus.tier,
    bonusPercent: bonus.percent,
    streakStartDate,
    daysUntilNextTier: getDaysUntilNextTier(user.currentStreak),
  }
}
