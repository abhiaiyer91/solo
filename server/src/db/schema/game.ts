import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  bigint,
  real,
  index,
  json,
  uniqueIndex,
} from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'
import { users } from './auth'
import {
  questTypeEnum,
  questCategoryEnum,
  questStatusEnum,
  statTypeEnum,
  xpEventSourceEnum,
  modifierTypeEnum,
  narrativeCategoryEnum,
} from './enums'

// Quest Templates - Define available quests
export const questTemplates = pgTable('quest_templates', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text('name').notNull(),
  description: text('description').notNull(),
  type: questTypeEnum('type').notNull(),
  category: questCategoryEnum('category').notNull(),

  // Requirement DSL (stored as JSON)
  requirement: jsonb('requirement').notNull().$type<RequirementDSL>(),

  // Rewards
  baseXP: integer('base_xp').notNull(),
  statType: statTypeEnum('stat_type').notNull(),
  statBonus: integer('stat_bonus').default(0).notNull(),

  // Partial completion settings
  allowPartial: boolean('allow_partial').default(false).notNull(),
  minPartialPercent: integer('min_partial_percent').default(50),

  // Flags
  isCore: boolean('is_core').default(false).notNull(), // Core daily quests
  isActive: boolean('is_active').default(true).notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Quest Log - User's quest instances
export const questLogs = pgTable(
  'quest_logs',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    templateId: text('template_id')
      .notNull()
      .references(() => questTemplates.id),

    // Date the quest is for (YYYY-MM-DD format)
    questDate: text('quest_date').notNull(),

    status: questStatusEnum('status').default('ACTIVE').notNull(),

    // Progress tracking
    currentValue: real('current_value').default(0),
    targetValue: real('target_value').notNull(),
    completionPercent: real('completion_percent').default(0),

    // Completion data
    completedAt: timestamp('completed_at'),
    xpAwarded: integer('xp_awarded'),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    userDateIdx: index('quest_logs_user_date_idx').on(table.userId, table.questDate),
    userStatusIdx: index('quest_logs_user_status_idx').on(table.userId, table.status),
    // Unique constraint to prevent duplicate quest logs for same user/template/date
    userTemplateDateUnique: uniqueIndex('quest_logs_user_template_date_unique').on(
      table.userId,
      table.templateId,
      table.questDate
    ),
  })
)

// Daily Log - Track user's daily activities
export const dailyLogs = pgTable(
  'daily_logs',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    // Date (YYYY-MM-DD format)
    logDate: text('log_date').notNull(),

    // Quest completion stats for the day
    coreQuestsTotal: integer('core_quests_total').default(0).notNull(),
    coreQuestsCompleted: integer('core_quests_completed').default(0).notNull(),
    bonusQuestsCompleted: integer('bonus_quests_completed').default(0).notNull(),

    // XP earned this day
    xpEarned: integer('xp_earned').default(0).notNull(),

    // Status flags
    isPerfectDay: boolean('is_perfect_day').default(false).notNull(),
    hadDebuff: boolean('had_debuff').default(false).notNull(),

    // Day closing
    closedAt: timestamp('closed_at'),

    // Health data snapshot (from HealthKit sync)
    healthData: jsonb('health_data').$type<HealthDataSnapshot>(),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    userDateIdx: index('daily_logs_user_date_idx').on(table.userId, table.logDate),
  })
)

// XP Events - Immutable ledger of all XP transactions
export const xpEvents = pgTable(
  'xp_events',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    source: xpEventSourceEnum('source').notNull(),
    sourceId: text('source_id'), // Reference to quest, boss, dungeon, etc.

    // XP amounts
    baseAmount: integer('base_amount').notNull(),
    finalAmount: integer('final_amount').notNull(),

    // Level tracking
    levelBefore: integer('level_before').notNull(),
    levelAfter: integer('level_after').notNull(),
    totalXPBefore: bigint('total_xp_before', { mode: 'bigint' }).notNull(),
    totalXPAfter: bigint('total_xp_after', { mode: 'bigint' }).notNull(),

    // Immutability hash
    hash: text('hash').notNull(),
    previousHash: text('previous_hash'),

    // Description for timeline
    description: text('description').notNull(),

    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index('xp_events_user_idx').on(table.userId),
    createdAtIdx: index('xp_events_created_at_idx').on(table.createdAt),
  })
)

// XP Modifiers - Applied to XP events (bonuses/penalties)
export const xpModifiers = pgTable('xp_modifiers', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  eventId: text('event_id')
    .notNull()
    .references(() => xpEvents.id, { onDelete: 'cascade' }),

  type: modifierTypeEnum('type').notNull(),
  multiplier: real('multiplier').notNull(), // e.g., 1.25 for +25%, 0.5 for -50%
  description: text('description').notNull(),

  // Order matters: bonuses applied first, penalties second
  order: integer('order').notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Type definitions for JSONB fields

export type RequirementDSL =
  | NumericRequirement
  | BooleanRequirement
  | CompoundRequirement

export interface NumericRequirement {
  type: 'numeric'
  metric: string // e.g., 'steps', 'workout_minutes', 'protein_grams'
  operator: 'gte' | 'lte' | 'eq' | 'gt' | 'lt'
  value: number
  unit?: string
}

export interface BooleanRequirement {
  type: 'boolean'
  metric: string // e.g., 'no_alcohol', 'logged_meals'
  expected: boolean
}

export interface CompoundRequirement {
  type: 'compound'
  operator: 'and' | 'or'
  requirements: RequirementDSL[]
}

export interface HealthDataSnapshot {
  steps?: number
  activeMinutes?: number
  workoutMinutes?: number
  sleepHours?: number
  calories?: number
  protein?: number
  syncedAt?: string
}

// Player Archives - Historical snapshots of archived progress runs
export const playerArchives = pgTable(
  'player_archives',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    archivedAt: timestamp('archived_at').defaultNow().notNull(),
    levelAtArchive: integer('level_at_archive').notNull(),
    totalXpAtArchive: integer('total_xp_at_archive').notNull(),
    longestStreak: integer('longest_streak').notNull(),
    currentStreak: integer('current_streak').notNull(),
    titlesEarned: jsonb('titles_earned').$type<string[]>(),
    bossesDefeated: jsonb('bosses_defeated').$type<string[]>(),
    dungeonsCleared: integer('dungeons_cleared').default(0).notNull(),
    activeDays: integer('active_days').notNull(),
    totalQuestsCompleted: integer('total_quests_completed').default(0).notNull(),
    seasonNumber: integer('season_number'),
    archiveReason: text('archive_reason').default('soft_reset'),
    notes: text('notes'),
  },
  (table) => ({
    userIdx: index('archives_user_idx').on(table.userId),
  })
)

export type PlayerArchive = typeof playerArchives.$inferSelect
export type NewPlayerArchive = typeof playerArchives.$inferInsert

// Adapted Targets - Per-user personalized quest targets
export const adaptedTargets = pgTable(
  'adapted_targets',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    questTemplateId: text('quest_template_id')
      .notNull()
      .references(() => questTemplates.id, { onDelete: 'cascade' }),

    // Target values
    baseTarget: real('base_target').notNull(), // Standard target from template
    adaptedTarget: real('adapted_target').notNull(), // Personalized target
    manualOverride: boolean('manual_override').default(false).notNull(),

    // Performance tracking for adaptation
    completionRate: real('completion_rate'), // Last 14 days
    averageAchievement: real('average_achievement'), // % of target achieved

    lastAdaptedAt: timestamp('last_adapted_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    userQuestUnique: uniqueIndex('adapted_targets_user_quest_unique').on(
      table.userId,
      table.questTemplateId
    ),
    userIdx: index('adapted_targets_user_idx').on(table.userId),
  })
)

export type AdaptedTarget = typeof adaptedTargets.$inferSelect
export type NewAdaptedTarget = typeof adaptedTargets.$inferInsert

// Narrative Content - Stores all narrative text for the game
export const narrativeContents = pgTable(
  'narrative_contents',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    key: text('key').notNull().unique(),
    category: narrativeCategoryEnum('category').notNull(),
    content: text('content').notNull(),
    context: json('context').$type<Record<string, unknown>>(), // Additional metadata
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    categoryActiveIdx: index('narrative_category_active_idx').on(
      table.category,
      table.isActive
    ),
  })
)
