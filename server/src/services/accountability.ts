/**
 * Accountability Partners Service
 *
 * Manages 1-on-1 accountability partnerships between players.
 */

import { dbClient as db } from '../db'
import {
  accountabilityPairs,
  partnerCooldowns,
  partnerNudges,
  users,
  dailyLogs,
} from '../db/schema'
import { eq, and, or, gte, sql, desc } from 'drizzle-orm'
import { getTodayDateForTimezone, type Timezone } from '../lib/timezone'

function requireDb() {
  if (!db) {
    throw new Error('Database connection required for accountability service')
  }
  return db
}

const MAX_PARTNERS = 3
const COOLDOWN_DAYS = 7

export interface PartnerInfo {
  id: string
  pairId: string
  userId: string
  name: string | null
  level: number
  completionPercent: number | null // Today's completion %
  canNudge: boolean
  partnerSince: string
}

export interface PartnerRequest {
  id: string
  requesterId: string
  requesterName: string | null
  requesterLevel: number
  createdAt: string
}

/**
 * Get current active partners for a user
 */
export async function getPartners(userId: string, timezone: Timezone = 'UTC'): Promise<PartnerInfo[]> {
  // Get pairs where user is requester or partner
  const pairs = await requireDb()
    .select()
    .from(accountabilityPairs)
    .where(
      and(
        eq(accountabilityPairs.status, 'ACTIVE'),
        or(
          eq(accountabilityPairs.requesterId, userId),
          eq(accountabilityPairs.partnerId, userId)
        )
      )
    )

  const partners: PartnerInfo[] = []
  const today = getTodayDateForTimezone(timezone)

  for (const pair of pairs) {
    const partnerId = pair.requesterId === userId ? pair.partnerId : pair.requesterId

    // Get partner user info
    const [partner] = await requireDb()
      .select({ id: users.id, name: users.name, level: users.level })
      .from(users)
      .where(eq(users.id, partnerId))
      .limit(1)

    if (!partner) continue

    // Get partner's completion % for today (calculated from completed/total)
    const [todayLog] = await requireDb()
      .select({
        coreQuestsTotal: dailyLogs.coreQuestsTotal,
        coreQuestsCompleted: dailyLogs.coreQuestsCompleted,
      })
      .from(dailyLogs)
      .where(and(eq(dailyLogs.userId, partnerId), eq(dailyLogs.logDate, today)))
      .limit(1)

    // Calculate completion percent
    const completionPercent = todayLog && todayLog.coreQuestsTotal > 0
      ? Math.round((todayLog.coreQuestsCompleted / todayLog.coreQuestsTotal) * 100)
      : 0

    // Check if nudge already sent today
    const [existingNudge] = await requireDb()
      .select()
      .from(partnerNudges)
      .where(
        and(
          eq(partnerNudges.pairId, pair.id),
          eq(partnerNudges.senderId, userId),
          eq(partnerNudges.nudgeDate, today)
        )
      )
      .limit(1)

    partners.push({
      id: partner.id,
      pairId: pair.id,
      userId: partner.id,
      name: partner.name,
      level: partner.level ?? 1,
      completionPercent,
      canNudge: !existingNudge,
      partnerSince: pair.acceptedAt?.toISOString() ?? pair.createdAt.toISOString(),
    })
  }

  return partners
}

/**
 * Get pending partner requests for a user
 */
export async function getPendingRequests(userId: string): Promise<PartnerRequest[]> {
  const requests = await requireDb()
    .select({
      id: accountabilityPairs.id,
      requesterId: accountabilityPairs.requesterId,
      createdAt: accountabilityPairs.createdAt,
    })
    .from(accountabilityPairs)
    .where(
      and(
        eq(accountabilityPairs.partnerId, userId),
        eq(accountabilityPairs.status, 'PENDING')
      )
    )
    .orderBy(desc(accountabilityPairs.createdAt))

  const result: PartnerRequest[] = []

  for (const req of requests) {
    const [requester] = await requireDb()
      .select({ name: users.name, level: users.level })
      .from(users)
      .where(eq(users.id, req.requesterId))
      .limit(1)

    result.push({
      id: req.id,
      requesterId: req.requesterId,
      requesterName: requester?.name ?? null,
      requesterLevel: requester?.level ?? 1,
      createdAt: req.createdAt.toISOString(),
    })
  }

  return result
}

/**
 * Send a partner request
 */
export async function requestPartner(userId: string, targetUserId: string): Promise<typeof accountabilityPairs.$inferSelect> {
  if (userId === targetUserId) {
    throw new Error('Cannot partner with yourself')
  }

  // Check if target exists
  const [target] = await requireDb()
    .select()
    .from(users)
    .where(eq(users.id, targetUserId))
    .limit(1)

  if (!target) {
    throw new Error('User not found')
  }

  // Check if user already has max partners
  const currentPartners = await getPartners(userId)
  if (currentPartners.length >= MAX_PARTNERS) {
    throw new Error(`Maximum ${MAX_PARTNERS} partners allowed`)
  }

  // Check if target has max partners
  const targetPartners = await getPartners(targetUserId)
  if (targetPartners.length >= MAX_PARTNERS) {
    throw new Error('This user has reached maximum partners')
  }

  // Check for existing partnership or pending request
  const existing = await requireDb()
    .select()
    .from(accountabilityPairs)
    .where(
      and(
        or(
          and(
            eq(accountabilityPairs.requesterId, userId),
            eq(accountabilityPairs.partnerId, targetUserId)
          ),
          and(
            eq(accountabilityPairs.requesterId, targetUserId),
            eq(accountabilityPairs.partnerId, userId)
          )
        ),
        or(
          eq(accountabilityPairs.status, 'PENDING'),
          eq(accountabilityPairs.status, 'ACTIVE')
        )
      )
    )
    .limit(1)

  if (existing.length > 0) {
    throw new Error('Partnership or request already exists')
  }

  // Check for cooldown
  const cooldown = await requireDb()
    .select()
    .from(partnerCooldowns)
    .where(
      and(
        eq(partnerCooldowns.userId, userId),
        eq(partnerCooldowns.partnerId, targetUserId),
        gte(partnerCooldowns.cooldownUntil, new Date())
      )
    )
    .limit(1)

  if (cooldown.length > 0) {
    throw new Error('Please wait before requesting this partner again')
  }

  // Create request
  const [pair] = await requireDb()
    .insert(accountabilityPairs)
    .values({
      requesterId: userId,
      partnerId: targetUserId,
      status: 'PENDING',
    })
    .returning()

  return pair!
}

/**
 * Accept a partner request
 */
export async function acceptRequest(userId: string, requestId: string): Promise<typeof accountabilityPairs.$inferSelect> {
  const [request] = await requireDb()
    .select()
    .from(accountabilityPairs)
    .where(
      and(
        eq(accountabilityPairs.id, requestId),
        eq(accountabilityPairs.partnerId, userId),
        eq(accountabilityPairs.status, 'PENDING')
      )
    )
    .limit(1)

  if (!request) {
    throw new Error('Request not found')
  }

  // Check if user has max partners
  const currentPartners = await getPartners(userId)
  if (currentPartners.length >= MAX_PARTNERS) {
    throw new Error(`Maximum ${MAX_PARTNERS} partners allowed`)
  }

  const [updated] = await requireDb()
    .update(accountabilityPairs)
    .set({
      status: 'ACTIVE',
      acceptedAt: new Date(),
    })
    .where(eq(accountabilityPairs.id, requestId))
    .returning()

  return updated!
}

/**
 * Decline a partner request
 */
export async function declineRequest(userId: string, requestId: string): Promise<void> {
  await requireDb()
    .update(accountabilityPairs)
    .set({ status: 'DECLINED' })
    .where(
      and(
        eq(accountabilityPairs.id, requestId),
        eq(accountabilityPairs.partnerId, userId),
        eq(accountabilityPairs.status, 'PENDING')
      )
    )
}

/**
 * End a partnership
 */
export async function endPartnership(userId: string, pairId: string): Promise<void> {
  const [pair] = await requireDb()
    .select()
    .from(accountabilityPairs)
    .where(
      and(
        eq(accountabilityPairs.id, pairId),
        eq(accountabilityPairs.status, 'ACTIVE'),
        or(
          eq(accountabilityPairs.requesterId, userId),
          eq(accountabilityPairs.partnerId, userId)
        )
      )
    )
    .limit(1)

  if (!pair) {
    throw new Error('Partnership not found')
  }

  const partnerId = pair.requesterId === userId ? pair.partnerId : pair.requesterId

  // End the partnership
  await requireDb()
    .update(accountabilityPairs)
    .set({ status: 'ENDED', endedAt: new Date() })
    .where(eq(accountabilityPairs.id, pairId))

  // Add cooldown for both users
  const cooldownUntil = new Date()
  cooldownUntil.setDate(cooldownUntil.getDate() + COOLDOWN_DAYS)

  await requireDb().insert(partnerCooldowns).values([
    { userId, partnerId, cooldownUntil },
    { userId: partnerId, partnerId: userId, cooldownUntil },
  ])
}

/**
 * Send a nudge to partner
 */
export async function sendNudge(
  userId: string,
  pairId: string,
  timezone: Timezone = 'UTC'
): Promise<typeof partnerNudges.$inferSelect> {
  const today = getTodayDateForTimezone(timezone)

  // Verify partnership
  const [pair] = await requireDb()
    .select()
    .from(accountabilityPairs)
    .where(
      and(
        eq(accountabilityPairs.id, pairId),
        eq(accountabilityPairs.status, 'ACTIVE'),
        or(
          eq(accountabilityPairs.requesterId, userId),
          eq(accountabilityPairs.partnerId, userId)
        )
      )
    )
    .limit(1)

  if (!pair) {
    throw new Error('Partnership not found')
  }

  const receiverId = pair.requesterId === userId ? pair.partnerId : pair.requesterId

  // Check if already nudged today
  const [existingNudge] = await requireDb()
    .select()
    .from(partnerNudges)
    .where(
      and(
        eq(partnerNudges.pairId, pairId),
        eq(partnerNudges.senderId, userId),
        eq(partnerNudges.nudgeDate, today)
      )
    )
    .limit(1)

  if (existingNudge) {
    throw new Error('You can only nudge once per day')
  }

  const [nudge] = await requireDb()
    .insert(partnerNudges)
    .values({
      pairId,
      senderId: userId,
      receiverId,
      nudgeDate: today,
    })
    .returning()

  return nudge!
}

/**
 * Get nudges received today
 */
export async function getTodayNudges(userId: string, timezone: Timezone = 'UTC'): Promise<number> {
  const today = getTodayDateForTimezone(timezone)

  const [result] = await requireDb()
    .select({ count: sql<number>`count(*)::int` })
    .from(partnerNudges)
    .where(
      and(
        eq(partnerNudges.receiverId, userId),
        eq(partnerNudges.nudgeDate, today)
      )
    )

  return result?.count ?? 0
}
