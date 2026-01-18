import { pgTable, text, timestamp, integer, boolean, pgEnum } from 'drizzle-orm/pg-core'
import { users } from './auth'

/**
 * Guild role enum
 */
export const guildRoleEnum = pgEnum('guild_role', ['LEADER', 'OFFICER', 'MEMBER'])

/**
 * Guild membership status enum
 */
export const guildMemberStatusEnum = pgEnum('guild_member_status', [
  'ACTIVE',
  'PENDING',
  'LEFT',
  'KICKED',
])

/**
 * Guild challenge status enum
 */
export const guildChallengeStatusEnum = pgEnum('guild_challenge_status', [
  'ACTIVE',
  'COMPLETED',
  'FAILED',
  'EXPIRED',
])

/**
 * Guilds table
 */
export const guilds = pgTable('guilds', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull().unique(),
  description: text('description'),
  leaderId: text('leader_id')
    .notNull()
    .references(() => users.id),
  minLevel: integer('min_level').notNull().default(10),
  maxMembers: integer('max_members').notNull().default(10),
  isPublic: boolean('is_public').notNull().default(true),
  totalXP: integer('total_xp').notNull().default(0),
  weeklyXP: integer('weekly_xp').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

/**
 * Guild members table
 */
export const guildMembers = pgTable('guild_members', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  guildId: text('guild_id')
    .notNull()
    .references(() => guilds.id),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  role: guildRoleEnum('role').notNull().default('MEMBER'),
  status: guildMemberStatusEnum('status').notNull().default('ACTIVE'),
  contributedXP: integer('contributed_xp').notNull().default(0),
  joinedAt: timestamp('joined_at').notNull().defaultNow(),
  leftAt: timestamp('left_at'),
})

/**
 * Guild challenges table (weekly collective goals)
 */
export const guildChallenges = pgTable('guild_challenges', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  guildId: text('guild_id')
    .notNull()
    .references(() => guilds.id),
  name: text('name').notNull(),
  description: text('description'),
  targetValue: integer('target_value').notNull(),
  currentValue: integer('current_value').notNull().default(0),
  xpReward: integer('xp_reward').notNull(),
  status: guildChallengeStatusEnum('status').notNull().default('ACTIVE'),
  weekStart: timestamp('week_start').notNull(),
  weekEnd: timestamp('week_end').notNull(),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

/**
 * Guild invites table
 */
export const guildInvites = pgTable('guild_invites', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  guildId: text('guild_id')
    .notNull()
    .references(() => guilds.id),
  inviterId: text('inviter_id')
    .notNull()
    .references(() => users.id),
  inviteeId: text('invitee_id')
    .notNull()
    .references(() => users.id),
  status: text('status').notNull().default('PENDING'), // PENDING, ACCEPTED, DECLINED, EXPIRED
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

/**
 * Guild join cooldowns (prevent rejoining too quickly after leaving)
 */
export const guildCooldowns = pgTable('guild_cooldowns', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  guildId: text('guild_id')
    .notNull()
    .references(() => guilds.id),
  cooldownUntil: timestamp('cooldown_until').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// ==========================================
// Accountability Partners
// ==========================================

/**
 * Accountability partner status enum
 */
export const accountabilityStatusEnum = pgEnum('accountability_status', [
  'PENDING',
  'ACTIVE',
  'DECLINED',
  'ENDED',
])

/**
 * Accountability pairs table (1-on-1 partners)
 */
export const accountabilityPairs = pgTable('accountability_pairs', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  requesterId: text('requester_id')
    .notNull()
    .references(() => users.id),
  partnerId: text('partner_id')
    .notNull()
    .references(() => users.id),
  status: accountabilityStatusEnum('status').notNull().default('PENDING'),
  acceptedAt: timestamp('accepted_at'),
  endedAt: timestamp('ended_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

/**
 * Partner cooldowns (prevent reconnecting too quickly)
 */
export const partnerCooldowns = pgTable('partner_cooldowns', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  partnerId: text('partner_id')
    .notNull()
    .references(() => users.id),
  cooldownUntil: timestamp('cooldown_until').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

/**
 * Daily nudges between partners
 */
export const partnerNudges = pgTable('partner_nudges', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  pairId: text('pair_id')
    .notNull()
    .references(() => accountabilityPairs.id),
  senderId: text('sender_id')
    .notNull()
    .references(() => users.id),
  receiverId: text('receiver_id')
    .notNull()
    .references(() => users.id),
  nudgeDate: text('nudge_date').notNull(), // YYYY-MM-DD format
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// ==========================================
// Raid Bosses
// ==========================================

/**
 * Raid status enum
 */
export const raidStatusEnum = pgEnum('raid_status', [
  'FORMING',
  'ACTIVE',
  'COMPLETED',
  'FAILED',
])

/**
 * Raid phase enum
 */
export const raidPhaseEnum = pgEnum('raid_phase', [
  'COORDINATION', // 3 days
  'SURGE',        // 1 day
  'ENDURANCE',    // 5 days
  'FINISHER',     // 1 day
])

/**
 * Raids table
 */
export const raids = pgTable('raids', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  bossId: text('boss_id').notNull(), // Reference to boss template
  leaderId: text('leader_id')
    .notNull()
    .references(() => users.id),
  status: raidStatusEnum('status').notNull().default('FORMING'),
  currentPhase: raidPhaseEnum('current_phase'),
  phaseStartedAt: timestamp('phase_started_at'),
  minMembers: integer('min_members').notNull().default(3),
  maxMembers: integer('max_members').notNull().default(5),
  xpReward: integer('xp_reward').notNull().default(500),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  failedAt: timestamp('failed_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

/**
 * Raid members table
 */
export const raidMembers = pgTable('raid_members', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  raidId: text('raid_id')
    .notNull()
    .references(() => raids.id),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  joinedAt: timestamp('joined_at').notNull().defaultNow(),
  hasFailed: boolean('has_failed').notNull().default(false), // If this member failed any phase
  xpAwarded: integer('xp_awarded').default(0),
})

/**
 * Raid phase progress tracking
 */
export const raidPhaseProgress = pgTable('raid_phase_progress', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  raidId: text('raid_id')
    .notNull()
    .references(() => raids.id),
  phase: raidPhaseEnum('phase').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  targetValue: integer('target_value').notNull(),
  currentValue: integer('current_value').notNull().default(0),
  completed: boolean('completed').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// Type exports
export type Guild = typeof guilds.$inferSelect
export type NewGuild = typeof guilds.$inferInsert
export type GuildMember = typeof guildMembers.$inferSelect
export type GuildChallenge = typeof guildChallenges.$inferSelect
export type AccountabilityPair = typeof accountabilityPairs.$inferSelect
export type Raid = typeof raids.$inferSelect
export type RaidMember = typeof raidMembers.$inferSelect
