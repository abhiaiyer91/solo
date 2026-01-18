import { dbClient as db } from '../db'
import { users, dailyLogs } from '../db/schema'
import { eq, and, lt } from 'drizzle-orm'

function requireDb() {
  if (!db) {
    throw new Error('Database connection required for debuff service')
  }
  return db
}

export interface DebuffStatus {
  isActive: boolean
  expiresAt: Date | null
  hoursRemaining: number | null
  penaltyPercent: number
}

const DEBUFF_PENALTY_PERCENT = 10
const DEBUFF_DURATION_HOURS = 24
const MIN_MISSED_CORE_QUESTS = 2

/**
 * Check if a user has an active debuff
 */
export function isDebuffActive(debuffActiveUntil: Date | null): boolean {
  if (!debuffActiveUntil) return false
  return new Date() < debuffActiveUntil
}

/**
 * Get debuff status for a user
 */
export async function getDebuffStatus(userId: string): Promise<DebuffStatus> {
  const [user] = await requireDb()
    .select({ debuffActiveUntil: users.debuffActiveUntil })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!user || !user.debuffActiveUntil) {
    return {
      isActive: false,
      expiresAt: null,
      hoursRemaining: null,
      penaltyPercent: 0,
    }
  }

  const now = new Date()
  const isActive = now < user.debuffActiveUntil

  if (!isActive) {
    return {
      isActive: false,
      expiresAt: null,
      hoursRemaining: null,
      penaltyPercent: 0,
    }
  }

  const msRemaining = user.debuffActiveUntil.getTime() - now.getTime()
  const hoursRemaining = Math.ceil(msRemaining / (1000 * 60 * 60))

  return {
    isActive: true,
    expiresAt: user.debuffActiveUntil,
    hoursRemaining,
    penaltyPercent: DEBUFF_PENALTY_PERCENT,
  }
}

/**
 * Get debuff modifier for XP calculations
 * Returns multiplier (e.g., 0.9 for -10% penalty)
 */
export function getDebuffModifier(debuffActiveUntil: Date | null): {
  hasDebuff: boolean
  multiplier: number
  description: string
} {
  if (!isDebuffActive(debuffActiveUntil)) {
    return { hasDebuff: false, multiplier: 1, description: '' }
  }

  return {
    hasDebuff: true,
    multiplier: 1 - DEBUFF_PENALTY_PERCENT / 100,
    description: `Debuff penalty (-${DEBUFF_PENALTY_PERCENT}% XP)`,
  }
}

/**
 * Apply debuff to a user for 24 hours
 */
export async function applyDebuff(userId: string): Promise<Date> {
  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + DEBUFF_DURATION_HOURS)

  await requireDb()
    .update(users)
    .set({
      debuffActiveUntil: expiresAt,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))

  // Also update the daily log to mark debuff
  const today = new Date().toISOString().split('T')[0]!
  await requireDb()
    .update(dailyLogs)
    .set({
      hadDebuff: true,
      updatedAt: new Date(),
    })
    .where(and(eq(dailyLogs.userId, userId), eq(dailyLogs.logDate, today)))

  return expiresAt
}

/**
 * Clear expired debuffs (cleanup utility)
 */
export async function clearExpiredDebuffs(): Promise<number> {
  const now = new Date()
  const result = await requireDb()
    .update(users)
    .set({
      debuffActiveUntil: null,
      updatedAt: now,
    })
    .where(lt(users.debuffActiveUntil, now))

  return result.length
}

/**
 * Check if debuff should be applied based on daily log
 * Call this at end of day or when checking quest status
 */
export async function checkAndApplyDebuff(
  userId: string,
  date: string
): Promise<{ debuffApplied: boolean; reason?: string }> {
  // Get the daily log for the specified date
  const [dailyLog] = await requireDb()
    .select()
    .from(dailyLogs)
    .where(and(eq(dailyLogs.userId, userId), eq(dailyLogs.logDate, date)))
    .limit(1)

  if (!dailyLog) {
    return { debuffApplied: false, reason: 'No daily log found' }
  }

  // Calculate missed core quests
  const missedCoreQuests =
    dailyLog.coreQuestsTotal - dailyLog.coreQuestsCompleted

  if (missedCoreQuests >= MIN_MISSED_CORE_QUESTS) {
    // Check if user already has an active debuff
    const [user] = await requireDb()
      .select({ debuffActiveUntil: users.debuffActiveUntil })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    if (user && isDebuffActive(user.debuffActiveUntil)) {
      return {
        debuffApplied: false,
        reason: 'Debuff already active',
      }
    }

    await applyDebuff(userId)
    return {
      debuffApplied: true,
      reason: `Missed ${missedCoreQuests} core quests`,
    }
  }

  return {
    debuffApplied: false,
    reason: `Only missed ${missedCoreQuests} core quests (min: ${MIN_MISSED_CORE_QUESTS})`,
  }
}
