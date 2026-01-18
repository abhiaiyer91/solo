/**
 * Guild Service
 *
 * Handles guild creation, membership, and management.
 */

import { dbClient as db } from '../db'
import {
  guilds,
  guildMembers,
  guildInvites,
  guildCooldowns,
  users,
  type Guild,
  type GuildMember,
} from '../db/schema'
import { eq, and, gte, count, desc } from 'drizzle-orm'

const GUILD_COOLDOWN_DAYS = 7
const MIN_LEVEL_TO_CREATE = 10
// Maximum members per guild (configurable per guild tier)
export const MAX_MEMBERS_DEFAULT = 10

function requireDb() {
  if (!db) {
    throw new Error('Database connection required for guild service')
  }
  return db
}

export interface CreateGuildInput {
  name: string
  description?: string
  isPublic?: boolean
  minLevel?: number
}

export interface GuildWithMembers extends Guild {
  members: GuildMember[]
  memberCount: number
}

/**
 * Create a new guild
 */
export async function createGuild(
  userId: string,
  input: CreateGuildInput
): Promise<Guild> {
  // Check if user meets level requirement
  const [user] = await requireDb()
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!user) {
    throw new Error('User not found')
  }

  if ((user.level ?? 1) < MIN_LEVEL_TO_CREATE) {
    throw new Error(`Must be Level ${MIN_LEVEL_TO_CREATE} or higher to create a guild`)
  }

  // Check if user is already in a guild
  const existingMembership = await requireDb()
    .select()
    .from(guildMembers)
    .where(and(eq(guildMembers.userId, userId), eq(guildMembers.status, 'ACTIVE')))
    .limit(1)

  if (existingMembership.length > 0) {
    throw new Error('You are already a member of a guild')
  }

  // Check if guild name is taken
  const existingGuild = await requireDb()
    .select()
    .from(guilds)
    .where(eq(guilds.name, input.name))
    .limit(1)

  if (existingGuild.length > 0) {
    throw new Error('Guild name is already taken')
  }

  // Create the guild
  const [guild] = await requireDb()
    .insert(guilds)
    .values({
      name: input.name,
      description: input.description,
      leaderId: userId,
      isPublic: input.isPublic ?? true,
      minLevel: input.minLevel ?? 10,
    })
    .returning()

  // Add creator as leader
  await requireDb().insert(guildMembers).values({
    guildId: guild!.id,
    userId,
    role: 'LEADER',
    status: 'ACTIVE',
  })

  return guild!
}

/**
 * Get guild by ID with member info
 */
export async function getGuild(guildId: string): Promise<GuildWithMembers | null> {
  const [guild] = await requireDb()
    .select()
    .from(guilds)
    .where(eq(guilds.id, guildId))
    .limit(1)

  if (!guild) return null

  const members = await requireDb()
    .select()
    .from(guildMembers)
    .where(and(eq(guildMembers.guildId, guildId), eq(guildMembers.status, 'ACTIVE')))

  return {
    ...guild,
    members,
    memberCount: members.length,
  }
}

/**
 * Get user's current guild
 */
export async function getUserGuild(userId: string): Promise<GuildWithMembers | null> {
  const [membership] = await requireDb()
    .select()
    .from(guildMembers)
    .where(and(eq(guildMembers.userId, userId), eq(guildMembers.status, 'ACTIVE')))
    .limit(1)

  if (!membership) return null

  return getGuild(membership.guildId)
}

/**
 * Join a public guild
 */
export async function joinGuild(userId: string, guildId: string): Promise<GuildMember> {
  const guild = await getGuild(guildId)

  if (!guild) {
    throw new Error('Guild not found')
  }

  if (!guild.isPublic) {
    throw new Error('This guild requires an invitation')
  }

  // Check user level
  const [user] = await requireDb()
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!user) {
    throw new Error('User not found')
  }

  if ((user.level ?? 1) < guild.minLevel) {
    throw new Error(`Must be Level ${guild.minLevel} or higher to join this guild`)
  }

  // Check if already in a guild
  const existingMembership = await requireDb()
    .select()
    .from(guildMembers)
    .where(and(eq(guildMembers.userId, userId), eq(guildMembers.status, 'ACTIVE')))
    .limit(1)

  if (existingMembership.length > 0) {
    throw new Error('You are already a member of a guild')
  }

  // Check for cooldown
  const cooldown = await requireDb()
    .select()
    .from(guildCooldowns)
    .where(
      and(
        eq(guildCooldowns.userId, userId),
        eq(guildCooldowns.guildId, guildId),
        gte(guildCooldowns.cooldownUntil, new Date())
      )
    )
    .limit(1)

  if (cooldown.length > 0) {
    throw new Error('You must wait before rejoining this guild')
  }

  // Check guild capacity
  if (guild.memberCount >= guild.maxMembers) {
    throw new Error('Guild is at maximum capacity')
  }

  // Join the guild
  const [member] = await requireDb()
    .insert(guildMembers)
    .values({
      guildId,
      userId,
      role: 'MEMBER',
      status: 'ACTIVE',
    })
    .returning()

  return member!
}

/**
 * Leave a guild
 */
export async function leaveGuild(userId: string): Promise<void> {
  const [membership] = await requireDb()
    .select()
    .from(guildMembers)
    .where(and(eq(guildMembers.userId, userId), eq(guildMembers.status, 'ACTIVE')))
    .limit(1)

  if (!membership) {
    throw new Error('You are not in a guild')
  }

  // Leaders cannot leave - they must transfer leadership first
  if (membership.role === 'LEADER') {
    throw new Error('Leaders must transfer leadership before leaving')
  }

  // Update membership
  await requireDb()
    .update(guildMembers)
    .set({
      status: 'LEFT',
      leftAt: new Date(),
    })
    .where(eq(guildMembers.id, membership.id))

  // Add cooldown
  const cooldownUntil = new Date()
  cooldownUntil.setDate(cooldownUntil.getDate() + GUILD_COOLDOWN_DAYS)

  await requireDb().insert(guildCooldowns).values({
    userId,
    guildId: membership.guildId,
    cooldownUntil,
  })
}

/**
 * Invite a user to the guild
 */
export async function inviteToGuild(
  inviterId: string,
  inviteeId: string
): Promise<typeof guildInvites.$inferSelect> {
  // Get inviter's guild
  const [inviterMembership] = await requireDb()
    .select()
    .from(guildMembers)
    .where(and(eq(guildMembers.userId, inviterId), eq(guildMembers.status, 'ACTIVE')))
    .limit(1)

  if (!inviterMembership) {
    throw new Error('You are not in a guild')
  }

  // Check if inviter has permission (leader or officer)
  if (inviterMembership.role === 'MEMBER') {
    throw new Error('Only leaders and officers can invite members')
  }

  // Check if invitee exists
  const [invitee] = await requireDb()
    .select()
    .from(users)
    .where(eq(users.id, inviteeId))
    .limit(1)

  if (!invitee) {
    throw new Error('User not found')
  }

  // Check if invitee is already in a guild
  const inviteeMembership = await requireDb()
    .select()
    .from(guildMembers)
    .where(and(eq(guildMembers.userId, inviteeId), eq(guildMembers.status, 'ACTIVE')))
    .limit(1)

  if (inviteeMembership.length > 0) {
    throw new Error('User is already in a guild')
  }

  // Check for existing pending invite
  const existingInvite = await requireDb()
    .select()
    .from(guildInvites)
    .where(
      and(
        eq(guildInvites.guildId, inviterMembership.guildId),
        eq(guildInvites.inviteeId, inviteeId),
        eq(guildInvites.status, 'PENDING')
      )
    )
    .limit(1)

  if (existingInvite.length > 0) {
    throw new Error('User already has a pending invite')
  }

  // Create invite (expires in 7 days)
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7)

  const [invite] = await requireDb()
    .insert(guildInvites)
    .values({
      guildId: inviterMembership.guildId,
      inviterId,
      inviteeId,
      status: 'PENDING',
      expiresAt,
    })
    .returning()

  return invite!
}

/**
 * Get public guilds for browsing
 */
export async function getPublicGuilds(limit = 20): Promise<GuildWithMembers[]> {
  const guildList = await requireDb()
    .select()
    .from(guilds)
    .where(eq(guilds.isPublic, true))
    .orderBy(desc(guilds.weeklyXP))
    .limit(limit)

  const result: GuildWithMembers[] = []

  for (const guild of guildList) {
    const members = await requireDb()
      .select()
      .from(guildMembers)
      .where(and(eq(guildMembers.guildId, guild.id), eq(guildMembers.status, 'ACTIVE')))

    result.push({
      ...guild,
      members,
      memberCount: members.length,
    })
  }

  return result
}

/**
 * Get guild leaderboard
 */
export async function getGuildLeaderboard(
  limit = 10
): Promise<Array<{ guild: Guild; memberCount: number; rank: number }>> {
  const guildList = await requireDb()
    .select()
    .from(guilds)
    .orderBy(desc(guilds.weeklyXP))
    .limit(limit)

  const result = []

  for (let i = 0; i < guildList.length; i++) {
    const guild = guildList[i]!
    const [memberCountResult] = await requireDb()
      .select({ count: count() })
      .from(guildMembers)
      .where(and(eq(guildMembers.guildId, guild.id), eq(guildMembers.status, 'ACTIVE')))

    result.push({
      guild,
      memberCount: memberCountResult?.count ?? 0,
      rank: i + 1,
    })
  }

  return result
}

/**
 * Add XP to guild (called when member completes quests)
 */
export async function addGuildXP(userId: string, xpAmount: number): Promise<void> {
  const [membership] = await requireDb()
    .select()
    .from(guildMembers)
    .where(and(eq(guildMembers.userId, userId), eq(guildMembers.status, 'ACTIVE')))
    .limit(1)

  if (!membership) return // User not in a guild

  // Update member's contributed XP
  await requireDb()
    .update(guildMembers)
    .set({
      contributedXP: membership.contributedXP + xpAmount,
    })
    .where(eq(guildMembers.id, membership.id))

  // Update guild's total and weekly XP
  const [guild] = await requireDb()
    .select()
    .from(guilds)
    .where(eq(guilds.id, membership.guildId))
    .limit(1)

  if (guild) {
    await requireDb()
      .update(guilds)
      .set({
        totalXP: guild.totalXP + xpAmount,
        weeklyXP: guild.weeklyXP + xpAmount,
        updatedAt: new Date(),
      })
      .where(eq(guilds.id, guild.id))
  }
}
