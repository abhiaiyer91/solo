import { createHash } from 'crypto'
import { dbClient as db } from '../db'
import { xpEvents, xpModifiers, users } from '../db/schema'
import { eq, and, gte, lte } from 'drizzle-orm'
import { computeLevel, xpToNextLevel } from './level'
import { getStreakBonus } from './streak'
import { getDebuffModifier } from './debuff'
import type { xpEventSourceEnum, modifierTypeEnum } from '../db/schema/enums'
import {
  getTodayDateForTimezone,
  getStartOfDayInTimezone,
  getEndOfDayInTimezone,
  getSafeTimezone,
  isWeekend,
  type Timezone,
} from '../lib/timezone'

type XpEventSource = (typeof xpEventSourceEnum.enumValues)[number]
type ModifierType = (typeof modifierTypeEnum.enumValues)[number]

function requireDb() {
  if (!db) {
    throw new Error('Database connection required for XP service')
  }
  return db
}

interface XPModifierInput {
  type: ModifierType
  multiplier: number
  description: string
}

interface CreateXPEventInput {
  userId: string
  source: XpEventSource
  sourceId?: string
  baseAmount: number
  description: string
  modifiers?: XPModifierInput[]
}

/**
 * Generate SHA256 hash for XP event immutability
 */
function generateEventHash(
  userId: string,
  baseAmount: number,
  finalAmount: number,
  previousHash: string | null,
  timestamp: Date
): string {
  const data = `${userId}:${baseAmount}:${finalAmount}:${previousHash || 'genesis'}:${timestamp.toISOString()}`
  return createHash('sha256').update(data).digest('hex')
}

/**
 * Apply modifiers to base XP amount
 * Bonuses (multiplier > 1) are applied first, then penalties (multiplier < 1)
 */
function applyModifiers(baseAmount: number, modifiers: XPModifierInput[]): {
  finalAmount: number
  orderedModifiers: Array<XPModifierInput & { order: number }>
} {
  // Sort: bonuses first (multiplier > 1), penalties second (multiplier < 1)
  const sorted = [...modifiers].sort((a, b) => {
    const aIsBonus = a.multiplier >= 1
    const bIsBonus = b.multiplier >= 1
    if (aIsBonus && !bIsBonus) return -1
    if (!aIsBonus && bIsBonus) return 1
    return 0
  })

  let amount = baseAmount
  const orderedModifiers = sorted.map((mod, index) => {
    amount = Math.floor(amount * mod.multiplier)
    return { ...mod, order: index }
  })

  return {
    finalAmount: Math.max(0, amount), // Never negative XP
    orderedModifiers,
  }
}

/**
 * Create an XP event and update user's total XP
 */
export async function createXPEvent(input: CreateXPEventInput): Promise<{
  event: typeof xpEvents.$inferSelect
  leveledUp: boolean
  newLevel: number
}> {
  const { userId, source, sourceId, baseAmount, description, modifiers = [] } = input

  // Get current user state
  const [user] = await requireDb().select().from(users).where(eq(users.id, userId)).limit(1)

  if (!user) {
    throw new Error('User not found')
  }

  const currentXP = typeof user.totalXP === 'bigint' ? user.totalXP : BigInt(user.totalXP)
  const currentLevel = computeLevel(currentXP)

  // Get user's current streak for bonus
  const currentStreak = user.currentStreak ?? 0
  const streakBonus = getStreakBonus(currentStreak)

  // Add streak bonus modifier if applicable
  const allModifiers = [...modifiers]
  if (streakBonus.percent > 0) {
    allModifiers.push({
      type: 'STREAK_BONUS' as ModifierType,
      multiplier: 1 + streakBonus.percent / 100,
      description: `${streakBonus.tier.charAt(0).toUpperCase() + streakBonus.tier.slice(1)} streak bonus (${currentStreak} days)`,
    })
  }

  // Add debuff penalty if applicable
  const debuff = getDebuffModifier(user.debuffActiveUntil)
  if (debuff.hasDebuff) {
    allModifiers.push({
      type: 'DEBUFF_PENALTY' as ModifierType,
      multiplier: debuff.multiplier,
      description: debuff.description,
    })
  }

  // Add weekend bonus if applicable (check in user's timezone)
  const userTimezone = user.timezone ?? 'UTC'
  if (isWeekend(userTimezone)) {
    allModifiers.push({
      type: 'WEEKEND_BONUS' as ModifierType,
      multiplier: 1.10,
      description: 'Weekend bonus (+10% XP)',
    })
  }

  // Apply modifiers with streak bonus, debuff, and weekend bonus included
  const { finalAmount, orderedModifiers } = applyModifiers(baseAmount, allModifiers)

  const newTotalXP = currentXP + BigInt(finalAmount)
  const newLevel = computeLevel(newTotalXP)
  const leveledUp = newLevel > currentLevel

  // Get previous event hash for chain
  const [lastEvent] = await requireDb()
    .select({ hash: xpEvents.hash })
    .from(xpEvents)
    .where(eq(xpEvents.userId, userId))
    .orderBy(xpEvents.createdAt)
    .limit(1)

  const previousHash = lastEvent?.hash || null
  const timestamp = new Date()
  const hash = generateEventHash(userId, baseAmount, finalAmount, previousHash, timestamp)

  // Create the XP event
  const [event] = await requireDb()
    .insert(xpEvents)
    .values({
      userId,
      source,
      sourceId,
      baseAmount,
      finalAmount,
      levelBefore: currentLevel,
      levelAfter: newLevel,
      totalXPBefore: currentXP,
      totalXPAfter: newTotalXP,
      hash,
      previousHash,
      description,
      createdAt: timestamp,
    })
    .returning()

  // Insert modifiers
  if (orderedModifiers.length > 0) {
    await requireDb().insert(xpModifiers).values(
      orderedModifiers.map((mod) => ({
        eventId: event!.id,
        type: mod.type,
        multiplier: mod.multiplier,
        description: mod.description,
        order: mod.order,
      }))
    )
  }

  // Update user's total XP and level
  // Note: Converting bigint to number for drizzle-orm compatibility
  // XP values should never exceed Number.MAX_SAFE_INTEGER in practice
  await requireDb()
    .update(users)
    .set({
      totalXP: newTotalXP as unknown as number,
      level: newLevel,
      updatedAt: timestamp,
    })
    .where(eq(users.id, userId))

  return {
    event: event!,
    leveledUp,
    newLevel,
  }
}

/**
 * Create an XP removal event (for quest resets, etc.)
 * This creates a negative XP entry in the timeline
 */
export async function createXPRemovalEvent(input: {
  userId: string
  source: XpEventSource
  sourceId?: string
  amount: number
  description: string
}): Promise<{
  event: typeof xpEvents.$inferSelect
  levelChanged: boolean
  newLevel: number
}> {
  const { userId, source, sourceId, amount, description } = input

  if (amount <= 0) {
    throw new Error('Amount must be positive (it will be subtracted)')
  }

  // Get current user state
  const [user] = await requireDb().select().from(users).where(eq(users.id, userId)).limit(1)

  if (!user) {
    throw new Error('User not found')
  }

  const currentXP = typeof user.totalXP === 'bigint' ? user.totalXP : BigInt(user.totalXP)
  const currentLevel = computeLevel(currentXP)

  // Calculate new XP (never go below 0)
  const newTotalXP = currentXP - BigInt(amount) < 0n ? 0n : currentXP - BigInt(amount)
  const newLevel = computeLevel(newTotalXP)
  const levelChanged = newLevel !== currentLevel

  // Get previous event hash for chain
  const [lastEvent] = await requireDb()
    .select({ hash: xpEvents.hash })
    .from(xpEvents)
    .where(eq(xpEvents.userId, userId))
    .orderBy(xpEvents.createdAt)
    .limit(1)

  const previousHash = lastEvent?.hash || null
  const timestamp = new Date()
  // Store negative amounts for display
  const negativeAmount = -amount
  const hash = generateEventHash(userId, negativeAmount, negativeAmount, previousHash, timestamp)

  // Create the XP removal event
  const [event] = await requireDb()
    .insert(xpEvents)
    .values({
      userId,
      source,
      sourceId,
      baseAmount: negativeAmount,
      finalAmount: negativeAmount,
      levelBefore: currentLevel,
      levelAfter: newLevel,
      totalXPBefore: currentXP,
      totalXPAfter: newTotalXP,
      hash,
      previousHash,
      description,
      createdAt: timestamp,
    })
    .returning()

  // Update user's total XP and level
  await requireDb()
    .update(users)
    .set({
      totalXP: newTotalXP as unknown as number,
      level: newLevel,
      updatedAt: timestamp,
    })
    .where(eq(users.id, userId))

  return {
    event: event!,
    levelChanged,
    newLevel,
  }
}

/**
 * Get XP timeline for a user
 */
export async function getXPTimeline(
  userId: string,
  limit = 50,
  offset = 0
): Promise<Array<typeof xpEvents.$inferSelect>> {
  return requireDb()
    .select()
    .from(xpEvents)
    .where(eq(xpEvents.userId, userId))
    .orderBy(xpEvents.createdAt)
    .limit(limit)
    .offset(offset)
}

/**
 * Get XP event with modifiers breakdown
 */
export async function getXPEventBreakdown(eventId: string): Promise<{
  event: typeof xpEvents.$inferSelect
  modifiers: Array<typeof xpModifiers.$inferSelect>
} | null> {
  const [event] = await requireDb()
    .select()
    .from(xpEvents)
    .where(eq(xpEvents.id, eventId))
    .limit(1)

  if (!event) return null

  const eventModifiers = await requireDb()
    .select()
    .from(xpModifiers)
    .where(eq(xpModifiers.eventId, eventId))
    .orderBy(xpModifiers.order)

  return {
    event,
    modifiers: eventModifiers,
  }
}

/**
 * Get level progress for a user
 */
export async function getLevelProgress(userId: string) {
  const [user] = await requireDb().select().from(users).where(eq(users.id, userId)).limit(1)

  if (!user) {
    throw new Error('User not found')
  }

  const totalXP = typeof user.totalXP === 'bigint' ? user.totalXP : BigInt(user.totalXP)
  return xpToNextLevel(totalXP)
}

/**
 * Get XP events for a specific date in the user's timezone
 *
 * @param userId - The user's ID
 * @param dateStr - Date string in YYYY-MM-DD format (defaults to today in user's timezone)
 * @param timezone - IANA timezone identifier for the user's local time
 * @returns Array of XP events that occurred during that calendar day in the user's timezone
 */
export async function getXPEventsForDate(
  userId: string,
  dateStr?: string,
  timezone: Timezone = 'UTC'
): Promise<Array<typeof xpEvents.$inferSelect>> {
  const safeTimezone = getSafeTimezone(timezone)
  const targetDate = dateStr || getTodayDateForTimezone(safeTimezone)

  // Get the start and end of the day in the user's timezone
  const startOfDay = getStartOfDayInTimezone(targetDate, safeTimezone)
  const endOfDay = getEndOfDayInTimezone(targetDate, safeTimezone)

  return requireDb()
    .select()
    .from(xpEvents)
    .where(
      and(
        eq(xpEvents.userId, userId),
        gte(xpEvents.createdAt, startOfDay),
        lte(xpEvents.createdAt, endOfDay)
      )
    )
    .orderBy(xpEvents.createdAt)
}

/**
 * Get total XP earned for a specific date in the user's timezone
 *
 * @param userId - The user's ID
 * @param dateStr - Date string in YYYY-MM-DD format (defaults to today in user's timezone)
 * @param timezone - IANA timezone identifier for the user's local time
 * @returns Total XP earned during that calendar day
 */
export async function getTotalXPForDate(
  userId: string,
  dateStr?: string,
  timezone: Timezone = 'UTC'
): Promise<number> {
  const events = await getXPEventsForDate(userId, dateStr, timezone)
  return events.reduce((sum, event) => sum + event.finalAmount, 0)
}

/**
 * Get today's XP summary for a user in their timezone
 *
 * @param userId - The user's ID
 * @param timezone - IANA timezone identifier for the user's local time
 * @returns Summary of today's XP activity
 */
export async function getTodayXPSummary(
  userId: string,
  timezone: Timezone = 'UTC'
): Promise<{
  totalXP: number
  eventCount: number
  events: Array<typeof xpEvents.$inferSelect>
  date: string
}> {
  const safeTimezone = getSafeTimezone(timezone)
  const today = getTodayDateForTimezone(safeTimezone)
  const events = await getXPEventsForDate(userId, today, safeTimezone)

  return {
    totalXP: events.reduce((sum, event) => sum + event.finalAmount, 0),
    eventCount: events.length,
    events,
    date: today,
  }
}

/**
 * Weekend bonus percentage (10%)
 */
export const WEEKEND_BONUS_PERCENT = 10

/**
 * Get weekend bonus status for a user
 *
 * @param timezone - IANA timezone identifier for the user's local time
 * @returns Weekend bonus status information
 */
export function getWeekendBonusStatus(timezone: Timezone = 'UTC'): {
  isWeekend: boolean
  bonusPercent: number
  message: string | null
} {
  const safeTimezone = getSafeTimezone(timezone)
  const weekendActive = isWeekend(safeTimezone)

  return {
    isWeekend: weekendActive,
    bonusPercent: weekendActive ? WEEKEND_BONUS_PERCENT : 0,
    message: weekendActive ? `Weekend Bonus Active: +${WEEKEND_BONUS_PERCENT}% XP on all completions` : null,
  }
}
