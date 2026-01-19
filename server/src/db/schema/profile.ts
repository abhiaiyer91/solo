/**
 * Profile Customization Schema
 * User profile personalization options
 */

import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  index,
} from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'
import { users } from './auth'

/**
 * Profile Customization - User's profile settings
 */
export const profileCustomization = pgTable(
  'profile_customization',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text('user_id')
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: 'cascade' }),

    // Display settings
    displayName: text('display_name'), // Custom display name
    avatarId: text('avatar_id').default('default'), // Selected avatar
    frameId: text('frame_id').default('none'), // Profile frame/border
    themeId: text('theme_id').default('default'), // Background theme

    // Unlocked customization options
    unlockedAvatars: jsonb('unlocked_avatars').$type<string[]>().default(['default']),
    unlockedFrames: jsonb('unlocked_frames').$type<string[]>().default(['none']),
    unlockedThemes: jsonb('unlocked_themes').$type<string[]>().default(['default']),

    // Profile card settings
    showLevel: boolean('show_level').default(true),
    showStreak: boolean('show_streak').default(true),
    showTitle: boolean('show_title').default(true),
    showStats: boolean('show_stats').default(false),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index('profile_customization_user_idx').on(table.userId),
  })
)

// Inferred types
export type ProfileCustomization = typeof profileCustomization.$inferSelect
export type NewProfileCustomization = typeof profileCustomization.$inferInsert

// Avatar definitions
export const AVATARS = [
  { id: 'default', name: 'Warrior', icon: '⚔️', requirement: null },
  { id: 'runner', name: 'Runner', icon: '🏃', requirement: { type: 'stat', stat: 'AGI', value: 50 } },
  { id: 'lifter', name: 'Lifter', icon: '🏋️', requirement: { type: 'stat', stat: 'STR', value: 50 } },
  { id: 'monk', name: 'Monk', icon: '🧘', requirement: { type: 'stat', stat: 'DISC', value: 50 } },
  { id: 'healer', name: 'Healer', icon: '💚', requirement: { type: 'stat', stat: 'VIT', value: 50 } },
  { id: 'champion', name: 'Champion', icon: '🏆', requirement: { type: 'level', value: 25 } },
  { id: 'legend', name: 'Legend', icon: '👑', requirement: { type: 'level', value: 50 } },
  { id: 'phoenix', name: 'Phoenix', icon: '🔥', requirement: { type: 'streak', value: 30 } },
  { id: 'dragon', name: 'Dragon', icon: '🐉', requirement: { type: 'boss_defeats', value: 5 } },
  { id: 'shadow', name: 'Shadow', icon: '👤', requirement: { type: 'dungeon_clears', value: 10 } },
  { id: 'titan', name: 'Titan', icon: '⚡', requirement: { type: 'perfect_days', value: 14 } },
  { id: 'night', name: 'Night Owl', icon: '🦉', requirement: { type: 'special', code: 'night_warrior' } },
] as const

// Frame definitions
export const FRAMES = [
  { id: 'none', name: 'None', style: 'none', requirement: null },
  { id: 'bronze', name: 'Bronze', style: 'bronze', requirement: { type: 'level', value: 5 } },
  { id: 'silver', name: 'Silver', style: 'silver', requirement: { type: 'level', value: 15 } },
  { id: 'gold', name: 'Gold', style: 'gold', requirement: { type: 'level', value: 30 } },
  { id: 'diamond', name: 'Diamond', style: 'diamond', requirement: { type: 'level', value: 50 } },
  { id: 'fire', name: 'Flame', style: 'fire', requirement: { type: 'streak', value: 50 } },
  { id: 'ice', name: 'Frost', style: 'ice', requirement: { type: 'boss_defeats', value: 3 } },
  { id: 'shadow', name: 'Shadow', style: 'shadow', requirement: { type: 'dungeon_clears', value: 20 } },
  { id: 'legendary', name: 'Legendary', style: 'legendary', requirement: { type: 'title', titleId: 'legendary' } },
] as const

// Theme definitions
export const THEMES = [
  { id: 'default', name: 'Default', colors: { primary: '#6366f1', bg: '#0A0A0F' }, requirement: null },
  { id: 'crimson', name: 'Crimson', colors: { primary: '#dc2626', bg: '#1a0505' }, requirement: { type: 'level', value: 10 } },
  { id: 'emerald', name: 'Emerald', colors: { primary: '#10b981', bg: '#051a0f' }, requirement: { type: 'level', value: 10 } },
  { id: 'amber', name: 'Amber', colors: { primary: '#f59e0b', bg: '#1a1005' }, requirement: { type: 'level', value: 10 } },
  { id: 'violet', name: 'Violet', colors: { primary: '#8b5cf6', bg: '#0f051a' }, requirement: { type: 'level', value: 10 } },
  { id: 'midnight', name: 'Midnight', colors: { primary: '#3b82f6', bg: '#050a1a' }, requirement: { type: 'streak', value: 14 } },
  { id: 'sunset', name: 'Sunset', colors: { primary: '#f97316', bg: '#1a0f05' }, requirement: { type: 'boss_defeats', value: 1 } },
  { id: 'aurora', name: 'Aurora', colors: { primary: '#14b8a6', bg: '#051a17' }, requirement: { type: 'season_completion', value: 1 } },
] as const

export type AvatarId = (typeof AVATARS)[number]['id']
export type FrameId = (typeof FRAMES)[number]['id']
export type ThemeId = (typeof THEMES)[number]['id']
