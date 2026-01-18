/**
 * Return Protocol Service
 *
 * Handles detection of lapsed players and the Return Protocol -
 * a gentler re-entry path after extended absence.
 */

import { dbClient as db } from '../db'
import { users, dailyLogs } from '../db/schema'
import { eq, desc } from 'drizzle-orm'

function requireDb() {
  if (!db) {
    throw new Error('Database connection required for return protocol service')
  }
  return db
}

/**
 * Absence duration categories
 */
export type AbsenceLevel = 'none' | 'short' | 'medium' | 'long'

export interface AbsenceInfo {
  daysSinceActivity: number
  level: AbsenceLevel
  streakAtDeparture: number
  lastActivityDate: string | null
}

export interface ReturnProtocolStatus {
  isActive: boolean
  currentDay: number // 0-3, 0 means not active
  startedAt: string | null
  requiredQuests: number // How many core quests required today (1, 2, or 4)
  daysRemaining: number
  canDecline: boolean
}

export interface ReturnProtocolOffer {
  shouldOffer: boolean
  absenceInfo: AbsenceInfo
  message: string | null
}

const ABSENCE_THRESHOLDS = {
  short: 7,   // 7-14 days
  medium: 15, // 15-29 days
  long: 30,   // 30+ days
}

const PROTOCOL_REQUIRED_QUESTS = [1, 2, 3] // Day 1, 2, 3 requirements

/**
 * Calculate days since last activity
 */
async function getDaysSinceActivity(userId: string): Promise<number> {
  const [user] = await requireDb()
    .select({ lastActivityAt: users.lastActivityAt })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!user?.lastActivityAt) {
    // Check daily logs as fallback
    const [lastLog] = await requireDb()
      .select({ logDate: dailyLogs.logDate })
      .from(dailyLogs)
      .where(eq(dailyLogs.userId, userId))
      .orderBy(desc(dailyLogs.logDate))
      .limit(1)

    if (!lastLog) return 0 // New user, no absence

    const lastDate = new Date(lastLog.logDate)
    const now = new Date()
    return Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
  }

  const lastDate = new Date(user.lastActivityAt)
  const now = new Date()
  return Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
}

/**
 * Determine absence level from days
 */
function getAbsenceLevel(days: number): AbsenceLevel {
  if (days >= ABSENCE_THRESHOLDS.long) return 'long'
  if (days >= ABSENCE_THRESHOLDS.medium) return 'medium'
  if (days >= ABSENCE_THRESHOLDS.short) return 'short'
  return 'none'
}

/**
 * Get absence info for a user
 */
export async function getAbsenceInfo(userId: string): Promise<AbsenceInfo> {
  const daysSinceActivity = await getDaysSinceActivity(userId)
  const level = getAbsenceLevel(daysSinceActivity)

  // Get user's streak at departure
  const [user] = await requireDb()
    .select({
      currentStreak: users.currentStreak,
      lastActivityAt: users.lastActivityAt,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  return {
    daysSinceActivity,
    level,
    streakAtDeparture: user?.currentStreak ?? 0,
    lastActivityDate: user?.lastActivityAt?.toISOString() ?? null,
  }
}

/**
 * Check if Return Protocol should be offered
 */
export async function checkReturnProtocolOffer(
  userId: string
): Promise<ReturnProtocolOffer> {
  const [user] = await requireDb()
    .select({
      returnProtocolActive: users.returnProtocolActive,
      returnProtocolDay: users.returnProtocolDay,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  // Don't offer if already in protocol
  if (user?.returnProtocolActive) {
    return {
      shouldOffer: false,
      absenceInfo: await getAbsenceInfo(userId),
      message: null,
    }
  }

  const absenceInfo = await getAbsenceInfo(userId)

  // Only offer for medium or long absences
  if (absenceInfo.level === 'none' || absenceInfo.level === 'short') {
    return {
      shouldOffer: false,
      absenceInfo,
      message: null,
    }
  }

  const message = generateReturnMessage(absenceInfo)

  return {
    shouldOffer: true,
    absenceInfo,
    message,
  }
}

/**
 * Generate narrative message for return
 */
function generateReturnMessage(absenceInfo: AbsenceInfo): string {
  const { daysSinceActivity, streakAtDeparture } = absenceInfo

  return `THE SYSTEM ACKNOWLEDGES YOUR RETURN

Last recorded activity: ${daysSinceActivity} days ago.
Streak at departure: ${streakAtDeparture} days.
Current streak: 0.

The System does not judge absence.
It records presence.

Today, reduced requirements are available.
Complete the protocol to reactivate full tracking.`
}

/**
 * Get current Return Protocol status
 */
export async function getReturnProtocolStatus(
  userId: string
): Promise<ReturnProtocolStatus> {
  const [user] = await requireDb()
    .select({
      returnProtocolActive: users.returnProtocolActive,
      returnProtocolDay: users.returnProtocolDay,
      returnProtocolStartedAt: users.returnProtocolStartedAt,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!user || !user.returnProtocolActive) {
    return {
      isActive: false,
      currentDay: 0,
      startedAt: null,
      requiredQuests: 4, // Normal
      daysRemaining: 0,
      canDecline: false,
    }
  }

  const currentDay = user.returnProtocolDay
  const daysRemaining = Math.max(0, 3 - currentDay)
  const requiredQuests = PROTOCOL_REQUIRED_QUESTS[currentDay - 1] ?? 4

  return {
    isActive: true,
    currentDay,
    startedAt: user.returnProtocolStartedAt?.toISOString() ?? null,
    requiredQuests,
    daysRemaining,
    canDecline: currentDay === 1, // Can only decline on day 1
  }
}

/**
 * Accept Return Protocol - start the 3-day protocol
 */
export async function acceptReturnProtocol(userId: string): Promise<ReturnProtocolStatus> {
  await requireDb()
    .update(users)
    .set({
      returnProtocolActive: true,
      returnProtocolDay: 1,
      returnProtocolStartedAt: new Date(),
      currentStreak: 0, // Reset streak
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))

  return getReturnProtocolStatus(userId)
}

/**
 * Decline Return Protocol - full intensity immediately
 */
export async function declineReturnProtocol(userId: string): Promise<void> {
  await requireDb()
    .update(users)
    .set({
      returnProtocolActive: false,
      returnProtocolDay: 0,
      returnProtocolStartedAt: null,
      currentStreak: 0, // Reset streak
      lastActivityAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
}

/**
 * Advance Return Protocol to next day
 * Called when daily quests are completed during protocol
 */
export async function advanceReturnProtocol(userId: string): Promise<ReturnProtocolStatus> {
  const [user] = await requireDb()
    .select({
      returnProtocolActive: users.returnProtocolActive,
      returnProtocolDay: users.returnProtocolDay,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!user?.returnProtocolActive) {
    return getReturnProtocolStatus(userId)
  }

  const nextDay = user.returnProtocolDay + 1

  if (nextDay > 3) {
    // Protocol complete - return to normal
    await requireDb()
      .update(users)
      .set({
        returnProtocolActive: false,
        returnProtocolDay: 0,
        returnProtocolStartedAt: null,
        currentStreak: 3, // Award 3-day streak for completing protocol
        lastActivityAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
  } else {
    // Advance to next day
    await requireDb()
      .update(users)
      .set({
        returnProtocolDay: nextDay,
        lastActivityAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
  }

  return getReturnProtocolStatus(userId)
}

/**
 * Update last activity timestamp (call on any user action)
 */
export async function updateLastActivity(userId: string): Promise<void> {
  await requireDb()
    .update(users)
    .set({
      lastActivityAt: new Date(),
    })
    .where(eq(users.id, userId))
}

/**
 * Get number of required quests based on protocol status
 */
export async function getRequiredQuestsCount(userId: string): Promise<number> {
  const status = await getReturnProtocolStatus(userId)
  return status.requiredQuests
}
