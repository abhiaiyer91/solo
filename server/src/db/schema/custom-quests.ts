/**
 * Custom Quest Templates Schema
 * Allow users to create their own quest templates
 */

import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'
import { users } from './auth'
import { questCategoryEnum, statTypeEnum } from './enums'
import type { RequirementDSL } from './game'

/**
 * Custom Quest Templates - User-created quest templates
 */
export const customQuestTemplates = pgTable(
  'custom_quest_templates',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    // Basic info
    name: text('name').notNull(),
    description: text('description').notNull(),
    category: questCategoryEnum('category').notNull(),

    // Requirement DSL (same format as system quests)
    requirement: jsonb('requirement').notNull().$type<RequirementDSL>(),

    // Rewards
    baseXP: integer('base_xp').notNull(),
    statType: statTypeEnum('stat_type').notNull(),
    statBonus: integer('stat_bonus').default(1).notNull(),

    // Display customization
    icon: text('icon').default('⚔️'),
    color: text('color').default('#6366f1'), // Default indigo

    // Quest frequency
    isDaily: boolean('is_daily').default(true).notNull(), // vs weekly
    targetValue: integer('target_value').notNull(), // The goal number

    // Status
    isActive: boolean('is_active').default(false).notNull(), // Currently enabled
    isArchived: boolean('is_archived').default(false).notNull(),

    // Sharing (future: guild sharing)
    isShared: boolean('is_shared').default(false).notNull(),

    // Stats
    timesCompleted: integer('times_completed').default(0).notNull(),
    timesActivated: integer('times_activated').default(0).notNull(),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index('custom_quest_templates_user_idx').on(table.userId),
    userActiveIdx: index('custom_quest_templates_user_active_idx').on(
      table.userId,
      table.isActive
    ),
  })
)

/**
 * Custom Quest Logs - Track custom quest completion
 */
export const customQuestLogs = pgTable(
  'custom_quest_logs',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    templateId: text('template_id')
      .notNull()
      .references(() => customQuestTemplates.id, { onDelete: 'cascade' }),

    // Date (YYYY-MM-DD or week start for weekly)
    questDate: text('quest_date').notNull(),

    // Progress
    currentValue: integer('current_value').default(0).notNull(),
    targetValue: integer('target_value').notNull(),

    // Status
    isCompleted: boolean('is_completed').default(false).notNull(),
    completedAt: timestamp('completed_at'),
    xpAwarded: integer('xp_awarded'),

    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    userDateIdx: index('custom_quest_logs_user_date_idx').on(
      table.userId,
      table.questDate
    ),
    userTemplateDateUnique: uniqueIndex('custom_quest_logs_user_template_date_unique').on(
      table.userId,
      table.templateId,
      table.questDate
    ),
  })
)

// Inferred types
export type CustomQuestTemplate = typeof customQuestTemplates.$inferSelect
export type NewCustomQuestTemplate = typeof customQuestTemplates.$inferInsert
export type CustomQuestLog = typeof customQuestLogs.$inferSelect
export type NewCustomQuestLog = typeof customQuestLogs.$inferInsert

// Available metrics for custom quests
export const CUSTOM_QUEST_METRICS = [
  { id: 'steps', label: 'Steps', unit: 'steps', icon: '👟' },
  { id: 'workout_minutes', label: 'Workout Minutes', unit: 'min', icon: '💪' },
  { id: 'active_minutes', label: 'Active Minutes', unit: 'min', icon: '🏃' },
  { id: 'sleep_hours', label: 'Sleep Hours', unit: 'hrs', icon: '😴' },
  { id: 'water_glasses', label: 'Water Glasses', unit: 'glasses', icon: '💧' },
  { id: 'protein_grams', label: 'Protein', unit: 'g', icon: '🥩' },
  { id: 'calories_burned', label: 'Calories Burned', unit: 'cal', icon: '🔥' },
  { id: 'meditation_minutes', label: 'Meditation', unit: 'min', icon: '🧘' },
  { id: 'stretching_minutes', label: 'Stretching', unit: 'min', icon: '🤸' },
  { id: 'outdoor_minutes', label: 'Time Outdoors', unit: 'min', icon: '🌳' },
] as const

export type CustomQuestMetric = (typeof CUSTOM_QUEST_METRICS)[number]['id']

// XP calculation constants
export const XP_PER_DIFFICULTY = {
  easy: 25, // Low target (e.g., 2000 steps)
  medium: 50, // Medium target (e.g., 7500 steps)
  hard: 100, // High target (e.g., 15000 steps)
  extreme: 150, // Extreme target
}

// Max active custom quests
export const MAX_ACTIVE_CUSTOM_QUESTS = 3
