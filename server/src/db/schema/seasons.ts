import {
  pgTable,
  text,
  integer,
  timestamp,
  real,
  index,
  boolean,
  jsonb,
} from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'
import { users } from './auth'
import { seasonStatusEnum } from './enums'

// Season Definitions
export const seasons = pgTable('seasons', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  number: integer('number').notNull().unique(), // 1, 2, 3
  name: text('name').notNull(),
  theme: text('theme').notNull(), // FOUNDATION, CHALLENGE, MASTERY
  description: text('description').notNull(),

  // XP multiplier for this season
  xpMultiplier: real('xp_multiplier').default(1.0).notNull(),

  // Transition requirements (whichever comes first)
  levelRequirement: integer('level_requirement'), // null means no level requirement
  dayRequirement: integer('day_requirement'), // null means no day requirement

  // Status
  status: seasonStatusEnum('status').default('UPCOMING').notNull(),

  // Intro narrative
  introNarrative: text('intro_narrative'),
  outroNarrative: text('outro_narrative'),

  // Content unlocks
  contentConfig: jsonb('content_config').$type<SeasonContentConfig>(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// User's season participation
export const seasonParticipations = pgTable(
  'season_participations',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    seasonId: text('season_id')
      .notNull()
      .references(() => seasons.id, { onDelete: 'cascade' }),

    // Seasonal XP tracked separately
    seasonalXP: integer('seasonal_xp').default(0).notNull(),

    // When user entered this season
    startedAt: timestamp('started_at').defaultNow().notNull(),
    // When user transitioned to next season (null if current)
    completedAt: timestamp('completed_at'),

    // Stats at season end
    endStats: jsonb('end_stats').$type<SeasonEndStats>(),

    // Is this the user's current season?
    isCurrent: boolean('is_current').default(true).notNull(),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    userSeasonIdx: index('season_participations_user_season_idx').on(
      table.userId,
      table.seasonId
    ),
    userCurrentIdx: index('season_participations_user_current_idx').on(
      table.userId,
      table.isCurrent
    ),
  })
)

// Season leaderboard entries
export const seasonLeaderboards = pgTable(
  'season_leaderboards',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    seasonId: text('season_id')
      .notNull()
      .references(() => seasons.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    // Leaderboard position (updated periodically)
    rank: integer('rank'),
    seasonalXP: integer('seasonal_xp').default(0).notNull(),

    // Snapshot time
    snapshotAt: timestamp('snapshot_at').defaultNow().notNull(),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    seasonRankIdx: index('season_leaderboards_season_rank_idx').on(
      table.seasonId,
      table.rank
    ),
    userSeasonIdx: index('season_leaderboards_user_season_idx').on(
      table.userId,
      table.seasonId
    ),
  })
)

// Type definitions

export interface SeasonContentConfig {
  dungeonRanks: string[] // e.g., ['E_RANK', 'D_RANK']
  bossesAvailable: number[] // Boss IDs available
  titlesAvailable: string[] // Title categories available
  hasLeaderboard: boolean
}

export interface SeasonEndStats {
  tasksCompleted: number
  tasksFailed: number
  completionRate: number
  currentStreak: number
  longestStreak: number
  streakBreaks: number
  bossesDefeated: number
  dungeonsCleared: number
  totalXP: number
  seasonalXP: number
  finalLevel: number
}
