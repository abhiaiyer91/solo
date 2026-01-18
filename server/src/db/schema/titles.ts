import {
  pgTable,
  text,
  boolean,
  timestamp,
  jsonb,
  real,
  index,
} from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'
import { users } from './auth'
import {
  titleConditionTypeEnum,
  passiveTypeEnum,
  titleRarityEnum,
  statTypeEnum,
} from './enums'

// Title Definitions
export const titles = pgTable('titles', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text('name').notNull().unique(),
  description: text('description').notNull(),
  rarity: titleRarityEnum('rarity').notNull(),

  // Condition for unlocking
  conditionType: titleConditionTypeEnum('condition_type').notNull(),
  conditionConfig: jsonb('condition_config').notNull().$type<TitleConditionConfig>(),

  // Passive effect
  passiveType: passiveTypeEnum('passive_type'),
  passiveValue: real('passive_value'), // e.g., 5 for +5%, 3 for +3 XP
  passiveStat: statTypeEnum('passive_stat'), // For STAT_BONUS type

  // Display
  systemMessage: text('system_message'), // Message shown when earned

  // Can this title be lost?
  canRegress: boolean('can_regress').default(false).notNull(),
  regressionConfig: jsonb('regression_config').$type<TitleRegressionConfig>(),

  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// User's earned titles
export const userTitles = pgTable(
  'user_titles',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    titleId: text('title_id')
      .notNull()
      .references(() => titles.id, { onDelete: 'cascade' }),

    earnedAt: timestamp('earned_at').defaultNow().notNull(),
    revokedAt: timestamp('revoked_at'),
    isRevoked: boolean('is_revoked').default(false).notNull(),

    // Track progress toward the title
    progress: real('progress').default(0),
    progressMax: real('progress_max'),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    userTitleIdx: index('user_titles_user_title_idx').on(table.userId, table.titleId),
    userIdx: index('user_titles_user_idx').on(table.userId),
  })
)

// Type definitions for JSONB fields

export interface StreakDaysCondition {
  type: 'STREAK_DAYS'
  days: number
}

export interface CumulativeCountCondition {
  type: 'CUMULATIVE_COUNT'
  metric: string // e.g., 'workout_completions', 'steps_goals', 'boss_defeats'
  count: number
}

export interface TimeWindowCondition {
  type: 'TIME_WINDOW'
  metric: string
  count: number
  windowDays: number // e.g., 7 for weekly
}

export interface EventCountCondition {
  type: 'EVENT_COUNT'
  event: string // e.g., 'boss_defeat', 'dungeon_clear'
  count: number
}

export interface CompoundCondition {
  type: 'COMPOUND'
  operator: 'and' | 'or'
  conditions: TitleConditionConfig[]
}

export interface SpecialCondition {
  type: 'SPECIAL'
  specialType: 'ACCOUNT_CREATION' | 'FIRST_QUEST' | 'CUSTOM'
  customLogic?: string
}

export type TitleConditionConfig =
  | StreakDaysCondition
  | CumulativeCountCondition
  | TimeWindowCondition
  | EventCountCondition
  | CompoundCondition
  | SpecialCondition

export interface TitleRegressionConfig {
  trigger: 'STREAK_BREAK' | 'TIME_WINDOW_FAIL' | 'CUSTOM'
  threshold?: number // e.g., 3 drinking days for Alcohol Slayer
  windowDays?: number
}
