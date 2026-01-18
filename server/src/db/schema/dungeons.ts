import {
  pgTable,
  text,
  integer,
  real,
  timestamp,
  jsonb,
  index,
} from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'
import { users } from './auth'
import { seasons } from './seasons'
import { dungeonDifficultyEnum, dungeonAttemptStatusEnum } from './enums'

// ===============================================================
// DUNGEONS
// ===============================================================

// Dungeon entry requirements
export interface DungeonRequirement {
  levelRequired?: number
  seasonNumber?: number
}

// Dungeon challenge configuration
export interface DungeonChallenge {
  type: 'steps' | 'workout_minutes' | 'protein' | 'no_processed_food' | 'wake_before'
  description: string
  target?: number
  deadline?: string // For time-based challenges like "before 8 AM"
}

// Dungeon Definitions
export const dungeons = pgTable('dungeons', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text('name').notNull(),
  description: text('description').notNull(), // "Entry is optional. Survival is likely..."
  difficulty: dungeonDifficultyEnum('difficulty').notNull(),

  // Entry requirements (level, season, etc.)
  requirements: jsonb('requirements').notNull().$type<DungeonRequirement>(),

  // Challenge configuration - what the player needs to accomplish
  challenges: jsonb('challenges').notNull().$type<DungeonChallenge[]>(),

  // XP multiplier (1.5 - 3.0)
  xpMultiplier: real('xp_multiplier').default(1.5).notNull(),

  // Time limit in minutes
  durationMinutes: integer('duration_minutes').notNull(),

  // Cooldown before re-entry in hours
  cooldownHours: integer('cooldown_hours').default(24).notNull(),

  // Optional season restriction
  seasonId: text('season_id').references(() => seasons.id),

  // Base XP reward for completing the dungeon
  baseXpReward: integer('base_xp_reward').default(50).notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Dungeon attempt progress tracking
export interface DungeonProgress {
  challengesCompleted: number
  challengeStatus: Record<number, boolean> // index -> completed
  lastUpdated: string // ISO timestamp
  progressNotes?: string
}

// Dungeon Attempts - User's dungeon run attempts
export const dungeonAttempts = pgTable(
  'dungeon_attempts',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    dungeonId: text('dungeon_id')
      .notNull()
      .references(() => dungeons.id, { onDelete: 'cascade' }),

    // Current status of the attempt
    status: dungeonAttemptStatusEnum('status').default('IN_PROGRESS').notNull(),

    // Progress tracking
    progress: jsonb('progress').notNull().$type<DungeonProgress>(),

    // When the attempt started
    startedAt: timestamp('started_at').defaultNow().notNull(),

    // Deadline for completion (startedAt + durationMinutes)
    expiresAt: timestamp('expires_at').notNull(),

    // When the attempt was completed (success or failure)
    completedAt: timestamp('completed_at'),

    // XP awarded (including multiplier if applicable)
    xpAwarded: integer('xp_awarded'),

    // Was the debuff active when this dungeon was entered?
    // If so, XP multiplier doesn't apply
    debuffActiveAtEntry: timestamp('debuff_active_at_entry'),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    userStatusIdx: index('dungeon_attempt_user_status_idx').on(
      table.userId,
      table.status
    ),
    userDungeonIdx: index('dungeon_attempt_user_dungeon_idx').on(
      table.userId,
      table.dungeonId
    ),
    expiresAtIdx: index('dungeon_attempt_expires_at_idx').on(table.expiresAt),
  })
)

// Type exports
export type Dungeon = typeof dungeons.$inferSelect
export type DungeonInsert = typeof dungeons.$inferInsert
export type DungeonAttempt = typeof dungeonAttempts.$inferSelect
export type DungeonAttemptInsert = typeof dungeonAttempts.$inferInsert
export type DungeonDifficulty = (typeof dungeonDifficultyEnum.enumValues)[number]
export type DungeonAttemptStatus = (typeof dungeonAttemptStatusEnum.enumValues)[number]
