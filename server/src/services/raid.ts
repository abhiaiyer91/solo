/**
 * Raid Service
 *
 * Manages collaborative raid boss encounters.
 * Raids require 3-5 players and have multiple phases.
 * If ANY raider fails ANY phase, the raid fails for everyone.
 */

import { dbClient as db } from '../db'
import {
  raids,
  raidMembers,
  users,
  type Raid,
  type RaidMember,
} from '../db/schema'
import { eq, and, count, desc, sql } from 'drizzle-orm'

function requireDb() {
  if (!db) {
    throw new Error('Database connection required for raid service')
  }
  return db
}

const MIN_LEVEL_FOR_RAID = 10
const XP_REWARD = 500

/**
 * Raid phase definitions with durations
 */
export const RAID_PHASES = {
  COORDINATION: { days: 3, description: 'Coordinate with your team' },
  SURGE: { days: 1, description: 'Intensive challenge day' },
  ENDURANCE: { days: 5, description: 'Maintain consistency' },
  FINISHER: { days: 1, description: 'Final push' },
} as const

export type RaidPhase = keyof typeof RAID_PHASES

export interface RaidWithMembers extends Raid {
  members: Array<{
    userId: string
    name: string | null
    level: number
    hasFailed: boolean
    joinedAt: string
  }>
  memberCount: number
}

export interface RaidSummary {
  id: string
  bossId: string
  status: string
  currentPhase: string | null
  memberCount: number
  maxMembers: number
  xpReward: number
  createdAt: string
}

/**
 * Get available raid bosses (predefined templates)
 */
export function getRaidBossTemplates() {
  return [
    {
      id: 'raid-boss-1',
      name: 'The Collective Challenge',
      description: 'A 10-day raid requiring team coordination',
      requirements: {
        minLevel: 10,
        defeatedBoss: 'boss-1',
      },
      phases: ['COORDINATION', 'SURGE', 'ENDURANCE', 'FINISHER'],
      xpReward: 500,
    },
    {
      id: 'raid-boss-2',
      name: 'The Endurance Trial',
      description: 'A longer raid focused on sustained effort',
      requirements: {
        minLevel: 15,
        defeatedBoss: 'boss-2',
      },
      phases: ['COORDINATION', 'ENDURANCE', 'SURGE', 'ENDURANCE', 'FINISHER'],
      xpReward: 750,
    },
  ]
}

/**
 * Create a new raid
 */
export async function createRaid(
  userId: string,
  bossId: string
): Promise<Raid> {
  // Check user level
  const [user] = await requireDb()
    .select({ level: users.level })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!user || (user.level ?? 1) < MIN_LEVEL_FOR_RAID) {
    throw new Error(`Must be Level ${MIN_LEVEL_FOR_RAID}+ to create a raid`)
  }

  // Check if user is already in an active raid
  const existingRaid = await getUserActiveRaid(userId)
  if (existingRaid) {
    throw new Error('You are already in an active raid')
  }

  // Create the raid
  const [raid] = await requireDb()
    .insert(raids)
    .values({
      bossId,
      leaderId: userId,
      status: 'FORMING',
      xpReward: XP_REWARD,
    })
    .returning()

  // Add leader as first member
  await requireDb().insert(raidMembers).values({
    raidId: raid!.id,
    userId,
  })

  return raid!
}

/**
 * Get raid by ID with members
 */
export async function getRaid(raidId: string): Promise<RaidWithMembers | null> {
  const [raid] = await requireDb()
    .select()
    .from(raids)
    .where(eq(raids.id, raidId))
    .limit(1)

  if (!raid) return null

  const members = await requireDb()
    .select({
      id: raidMembers.id,
      userId: raidMembers.userId,
      hasFailed: raidMembers.hasFailed,
      joinedAt: raidMembers.joinedAt,
    })
    .from(raidMembers)
    .where(eq(raidMembers.raidId, raidId))

  const memberDetails = []
  for (const member of members) {
    const [user] = await requireDb()
      .select({ name: users.name, level: users.level })
      .from(users)
      .where(eq(users.id, member.userId))
      .limit(1)

    memberDetails.push({
      userId: member.userId,
      name: user?.name ?? null,
      level: user?.level ?? 1,
      hasFailed: member.hasFailed,
      joinedAt: member.joinedAt.toISOString(),
    })
  }

  return {
    ...raid,
    members: memberDetails,
    memberCount: members.length,
  }
}

/**
 * Get user's active raid
 */
export async function getUserActiveRaid(userId: string): Promise<RaidWithMembers | null> {
  const [membership] = await requireDb()
    .select({ raidId: raidMembers.raidId })
    .from(raidMembers)
    .innerJoin(raids, eq(raids.id, raidMembers.raidId))
    .where(
      and(
        eq(raidMembers.userId, userId),
        sql`${raids.status} IN ('FORMING', 'ACTIVE')`
      )
    )
    .limit(1)

  if (!membership) return null

  return getRaid(membership.raidId)
}

/**
 * Join a forming raid
 */
export async function joinRaid(userId: string, raidId: string): Promise<RaidMember> {
  // Check user level
  const [user] = await requireDb()
    .select({ level: users.level })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!user || (user.level ?? 1) < MIN_LEVEL_FOR_RAID) {
    throw new Error(`Must be Level ${MIN_LEVEL_FOR_RAID}+ to join a raid`)
  }

  // Check if user is already in a raid
  const existingRaid = await getUserActiveRaid(userId)
  if (existingRaid) {
    throw new Error('You are already in an active raid')
  }

  // Get the raid
  const raid = await getRaid(raidId)
  if (!raid) {
    throw new Error('Raid not found')
  }

  if (raid.status !== 'FORMING') {
    throw new Error('Raid is not accepting new members')
  }

  if (raid.memberCount >= raid.maxMembers) {
    throw new Error('Raid is full')
  }

  // Join the raid
  const [member] = await requireDb()
    .insert(raidMembers)
    .values({
      raidId,
      userId,
    })
    .returning()

  return member!
}

/**
 * Leave a forming raid (cannot leave active raids)
 */
export async function leaveRaid(userId: string, raidId: string): Promise<void> {
  const raid = await getRaid(raidId)
  if (!raid) {
    throw new Error('Raid not found')
  }

  if (raid.status !== 'FORMING') {
    throw new Error('Cannot leave an active raid')
  }

  if (raid.leaderId === userId) {
    throw new Error('Leader cannot leave. Disband the raid instead.')
  }

  await requireDb()
    .delete(raidMembers)
    .where(
      and(
        eq(raidMembers.raidId, raidId),
        eq(raidMembers.userId, userId)
      )
    )
}

/**
 * Start a raid (leader only, requires minimum members)
 */
export async function startRaid(userId: string, raidId: string): Promise<Raid> {
  const raid = await getRaid(raidId)
  if (!raid) {
    throw new Error('Raid not found')
  }

  if (raid.leaderId !== userId) {
    throw new Error('Only the leader can start the raid')
  }

  if (raid.status !== 'FORMING') {
    throw new Error('Raid has already started')
  }

  if (raid.memberCount < raid.minMembers) {
    throw new Error(`Need at least ${raid.minMembers} members to start`)
  }

  const [updated] = await requireDb()
    .update(raids)
    .set({
      status: 'ACTIVE',
      currentPhase: 'COORDINATION',
      phaseStartedAt: new Date(),
      startedAt: new Date(),
    })
    .where(eq(raids.id, raidId))
    .returning()

  return updated!
}

/**
 * Mark a member as failed (causes whole raid to fail)
 */
export async function failRaidMember(
  raidId: string,
  userId: string
): Promise<void> {
  // Mark member as failed
  await requireDb()
    .update(raidMembers)
    .set({ hasFailed: true })
    .where(
      and(
        eq(raidMembers.raidId, raidId),
        eq(raidMembers.userId, userId)
      )
    )

  // Fail the entire raid
  await requireDb()
    .update(raids)
    .set({
      status: 'FAILED',
      failedAt: new Date(),
    })
    .where(eq(raids.id, raidId))
}

/**
 * Complete a raid and award XP
 */
export async function completeRaid(raidId: string): Promise<void> {
  const raid = await getRaid(raidId)
  if (!raid) return

  // Mark raid as completed
  await requireDb()
    .update(raids)
    .set({
      status: 'COMPLETED',
      completedAt: new Date(),
    })
    .where(eq(raids.id, raidId))

  // Award XP to all members
  for (const member of raid.members) {
    await requireDb()
      .update(raidMembers)
      .set({ xpAwarded: raid.xpReward })
      .where(
        and(
          eq(raidMembers.raidId, raidId),
          eq(raidMembers.userId, member.userId)
        )
      )

    // Add XP to user
    const [user] = await requireDb()
      .select({ totalXP: users.totalXP })
      .from(users)
      .where(eq(users.id, member.userId))
      .limit(1)

    if (user) {
      await requireDb()
        .update(users)
        .set({ totalXP: (user.totalXP ?? 0) + raid.xpReward })
        .where(eq(users.id, member.userId))
    }
  }
}

/**
 * Get open raids available to join
 */
export async function getOpenRaids(limit = 10): Promise<RaidSummary[]> {
  const openRaids = await requireDb()
    .select()
    .from(raids)
    .where(eq(raids.status, 'FORMING'))
    .orderBy(desc(raids.createdAt))
    .limit(limit)

  const summaries: RaidSummary[] = []

  for (const raid of openRaids) {
    const [memberCount] = await requireDb()
      .select({ count: count() })
      .from(raidMembers)
      .where(eq(raidMembers.raidId, raid.id))

    summaries.push({
      id: raid.id,
      bossId: raid.bossId,
      status: raid.status,
      currentPhase: raid.currentPhase,
      memberCount: memberCount?.count ?? 0,
      maxMembers: raid.maxMembers,
      xpReward: raid.xpReward,
      createdAt: raid.createdAt.toISOString(),
    })
  }

  return summaries
}
