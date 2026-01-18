import { pgTable, text, boolean, timestamp, integer, index } from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'

// Users table with game stats
export const users = pgTable(
  'users',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    email: text('email').notNull().unique(),
    emailVerified: boolean('email_verified').default(false).notNull(),
    name: text('name'),
    image: text('image'),
    timezone: text('timezone').default('UTC').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),

    // Game Stats
    level: integer('level').default(1).notNull(),
    totalXP: integer('total_xp').default(0).notNull(),
    currentStreak: integer('current_streak').default(0).notNull(),
    longestStreak: integer('longest_streak').default(0).notNull(),
    perfectStreak: integer('perfect_streak').default(0).notNull(),
    debuffActiveUntil: timestamp('debuff_active_until'),

    // Attributes
    str: integer('str').default(10).notNull(),
    agi: integer('agi').default(10).notNull(),
    vit: integer('vit').default(10).notNull(),
    disc: integer('disc').default(10).notNull(),

    // Active title reference
    activeTitleId: text('active_title_id'),

    // Onboarding
    onboardingCompleted: boolean('onboarding_completed').default(false).notNull(),

    // Leaderboard display preferences
    leaderboardOptIn: boolean('leaderboard_opt_in').default(false).notNull(),
    leaderboardDisplayName: text('leaderboard_display_name'), // Custom display name for leaderboard

    // Notification preferences (all opt-in, off by default)
    notifyMorningQuests: boolean('notify_morning_quests').default(false).notNull(),
    notifyMilestones: boolean('notify_milestones').default(false).notNull(),
    notifyAfternoonStatus: boolean('notify_afternoon_status').default(false).notNull(),
    notifyReconciliation: boolean('notify_reconciliation').default(false).notNull(),
    notifyStreaks: boolean('notify_streaks').default(false).notNull(),
    notifyLevelUp: boolean('notify_level_up').default(false).notNull(),
    notifyBoss: boolean('notify_boss').default(false).notNull(),
    quietHoursStart: integer('quiet_hours_start').default(22).notNull(), // 10 PM default
    quietHoursEnd: integer('quiet_hours_end').default(7).notNull(), // 7 AM default

    // Return Protocol tracking
    returnProtocolActive: boolean('return_protocol_active').default(false).notNull(),
    returnProtocolDay: integer('return_protocol_day').default(0).notNull(), // 0 = not active, 1-3 = protocol day
    returnProtocolStartedAt: timestamp('return_protocol_started_at'),
    lastActivityAt: timestamp('last_activity_at'), // For detecting absence

    // Body Composition Tracking (opt-in)
    trackBodyComposition: boolean('track_body_composition').default(false).notNull(),
    targetWeight: integer('target_weight'),  // kg - optional goal weight
    targetCalories: integer('target_calories'),  // Daily calorie target

    // Hard Mode (unlocks at Season 3 or Level 25)
    hardModeEnabled: boolean('hard_mode_enabled').default(false).notNull(),
    hardModeUnlockedAt: timestamp('hard_mode_unlocked_at'),
    hardModeQuestsCompleted: integer('hard_mode_quests_completed').default(0).notNull(),
    hardModeDungeonsCleared: integer('hard_mode_dungeons_cleared').default(0).notNull(),
    hardModePerfectDays: integer('hard_mode_perfect_days').default(0).notNull(),
  },
  (table) => ({
    emailIdx: index('users_email_idx').on(table.email),
  })
)

export const sessions = pgTable('sessions', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const accounts = pgTable('accounts', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  idToken: text('id_token'),
  password: text('password'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const verifications = pgTable('verifications', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})
