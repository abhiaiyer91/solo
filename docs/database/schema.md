# Database Schema

Complete Drizzle ORM schema for the Solo Leveling Fitness Quest System.

---

## Overview

The database uses PostgreSQL with Drizzle ORM. Schema is organized into modular files:

```
server/src/db/schema/
├── index.ts       # Barrel export
├── enums.ts       # PostgreSQL enums
├── auth.ts        # Better Auth models + user game stats
├── quests.ts      # Quest templates and logs
├── xp.ts          # XP ledger (immutable)
├── titles.ts      # Titles and passives
├── bosses.ts      # Boss fights
├── dungeons.ts    # Time-limited challenges
├── seasons.ts     # Seasonal content
└── config.ts      # Game config and narrative
```

---

## Enums

```typescript
// server/src/db/schema/enums.ts
import { pgEnum } from 'drizzle-orm/pg-core';

export const questTypeEnum = pgEnum('quest_type', ['DAILY', 'WEEKLY', 'DUNGEON', 'BOSS']);
export const questCategoryEnum = pgEnum('quest_category', ['MOVEMENT', 'STRENGTH', 'RECOVERY', 'NUTRITION', 'DISCIPLINE']);
export const questStatusEnum = pgEnum('quest_status', ['ACTIVE', 'COMPLETED', 'FAILED', 'EXPIRED']);
export const statTypeEnum = pgEnum('stat_type', ['STR', 'AGI', 'VIT', 'DISC']);

export const xpEventSourceEnum = pgEnum('xp_event_source', [
  'QUEST_COMPLETION', 'STREAK_BONUS', 'BOSS_DEFEAT', 'DUNGEON_CLEAR',
  'SEASON_BONUS', 'TITLE_BONUS', 'MANUAL_ADJUSTMENT'
]);

export const modifierTypeEnum = pgEnum('modifier_type', [
  'DEBUFF_PENALTY', 'STREAK_BONUS', 'WEEKEND_BONUS',
  'SEASON_MULTIPLIER', 'TITLE_PASSIVE', 'DUNGEON_MULTIPLIER'
]);

export const titleConditionTypeEnum = pgEnum('title_condition_type', [
  'STREAK_DAYS', 'CUMULATIVE_COUNT', 'TIME_WINDOW', 'EVENT_COUNT', 'COMPOUND', 'SPECIAL'
]);

export const passiveTypeEnum = pgEnum('passive_type', [
  'FLAT_XP_BONUS', 'PERCENT_XP_BONUS', 'STAT_BONUS', 'DEBUFF_REDUCTION'
]);

export const titleRarityEnum = pgEnum('title_rarity', ['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY']);
export const bossDifficultyEnum = pgEnum('boss_difficulty', ['NORMAL', 'HARD', 'NIGHTMARE']);
export const bossAttemptStatusEnum = pgEnum('boss_attempt_status', ['IN_PROGRESS', 'VICTORY', 'DEFEAT', 'ABANDONED']);
export const dungeonDifficultyEnum = pgEnum('dungeon_difficulty', ['E_RANK', 'D_RANK', 'C_RANK', 'B_RANK', 'A_RANK', 'S_RANK']);
export const dungeonAttemptStatusEnum = pgEnum('dungeon_attempt_status', ['IN_PROGRESS', 'CLEARED', 'FAILED', 'TIMED_OUT']);
export const seasonStatusEnum = pgEnum('season_status', ['UPCOMING', 'ACTIVE', 'ENDED']);

export const narrativeCategoryEnum = pgEnum('narrative_category', [
  'ONBOARDING', 'SYSTEM_MESSAGE', 'DAILY_QUEST', 'DEBUFF', 'DUNGEON',
  'BOSS', 'TITLE', 'SEASON', 'LEVEL_UP', 'DAILY_REMINDER'
]);
```

---

## Authentication & Users

```typescript
// server/src/db/schema/auth.ts
import { pgTable, text, boolean, timestamp, integer, bigint, index } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';

export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  name: text('name'),
  image: text('image'),
  timezone: text('timezone').default('UTC').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),

  // Game Stats
  level: integer('level').default(1).notNull(),
  totalXP: bigint('total_xp', { mode: 'bigint' }).default(0n).notNull(),
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
});

export const sessions = pgTable('sessions', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const accounts = pgTable('accounts', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
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
});

export const verifications = pgTable('verifications', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

---

## Quest System

```typescript
// server/src/db/schema/quests.ts
import { pgTable, text, integer, boolean, timestamp, json, index, unique } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';
import { users } from './auth';
import { seasons } from './seasons';
import { questTypeEnum, questCategoryEnum, questStatusEnum, statTypeEnum } from './enums';

export const questTemplates = pgTable('quest_templates', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull(),
  description: text('description').notNull(),
  type: questTypeEnum('type').notNull(),
  category: questCategoryEnum('category').notNull(),
  requirements: json('requirements').notNull(), // Requirement DSL
  baseXp: integer('base_xp').notNull(),
  statAffected: statTypeEnum('stat_affected'),
  partialReward: json('partial_reward'), // { threshold, xp }
  isCore: boolean('is_core').default(false).notNull(),
  seasonId: text('season_id').references(() => seasons.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  typeIsCoreIdx: index('quest_template_type_is_core_idx').on(table.type, table.isCore),
}));

export const questLogs = pgTable('quest_logs', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id),
  templateId: text('template_id').notNull().references(() => questTemplates.id),
  status: questStatusEnum('status').default('ACTIVE').notNull(),
  progress: json('progress').notNull(), // Current progress against requirements
  completedAt: timestamp('completed_at'),
  xpAwarded: integer('xp_awarded'),
  dayDate: text('day_date').notNull(), // YYYY-MM-DD for daily grouping
}, (table) => ({
  userTemplateDayUnique: unique().on(table.userId, table.templateId, table.dayDate),
  userDayIdx: index('quest_log_user_day_idx').on(table.userId, table.dayDate),
}));

export const dailyLogs = pgTable('daily_logs', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id),
  dayDate: text('day_date').notNull(), // YYYY-MM-DD
  coreCompleted: integer('core_completed').default(0).notNull(),
  coreTotal: integer('core_total').default(4).notNull(),
  allCompleted: boolean('all_completed').default(false).notNull(),
  debuffTriggered: boolean('debuff_triggered').default(false).notNull(),
  evaluated: boolean('evaluated').default(false).notNull(),
}, (table) => ({
  userDayUnique: unique().on(table.userId, table.dayDate),
  userEvaluatedIdx: index('daily_log_user_evaluated_idx').on(table.userId, table.evaluated),
}));
```

---

## XP Ledger (Immutable)

```typescript
// server/src/db/schema/xp.ts
import { pgTable, text, integer, bigint, real, timestamp, index } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';
import { users } from './auth';
import { xpEventSourceEnum, modifierTypeEnum } from './enums';

export const xpEvents = pgTable('xp_events', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id),
  eventSource: xpEventSourceEnum('event_source').notNull(),
  sourceId: text('source_id'), // References questLog, bossAttempt, etc.
  baseXP: integer('base_xp').notNull(),
  finalXP: integer('final_xp').notNull(),
  totalXPBefore: bigint('total_xp_before', { mode: 'bigint' }).notNull(),
  totalXPAfter: bigint('total_xp_after', { mode: 'bigint' }).notNull(),
  levelBefore: integer('level_before').notNull(),
  levelAfter: integer('level_after').notNull(),
  eventHash: text('event_hash').notNull(), // SHA256 for immutability verification
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  userCreatedIdx: index('xp_event_user_created_idx').on(table.userId, table.createdAt),
  eventSourceIdx: index('xp_event_source_idx').on(table.eventSource),
}));

export const xpModifiers = pgTable('xp_modifiers', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  xpEventId: text('xp_event_id').notNull().references(() => xpEvents.id),
  order: integer('order').notNull(),
  type: modifierTypeEnum('type').notNull(),
  multiplier: real('multiplier').notNull(),
  reason: text('reason').notNull(),
  xpBefore: integer('xp_before').notNull(),
  xpAfter: integer('xp_after').notNull(),
}, (table) => ({
  xpEventIdx: index('xp_modifier_event_idx').on(table.xpEventId),
}));
```

---

## Titles & Passives

```typescript
// server/src/db/schema/titles.ts
import { pgTable, text, real, boolean, timestamp, json, index, unique } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';
import { users } from './auth';
import { titleConditionTypeEnum, passiveTypeEnum, titleRarityEnum } from './enums';

export const titles = pgTable('titles', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull().unique(),
  description: text('description').notNull(),
  systemMessage: text('system_message').notNull(),
  conditionType: titleConditionTypeEnum('condition_type').notNull(),
  conditionConfig: json('condition_config').notNull(),
  passiveType: passiveTypeEnum('passive_type'),
  passiveValue: real('passive_value'),
  rarity: titleRarityEnum('rarity').default('COMMON').notNull(),
  canRegress: boolean('can_regress').default(true).notNull(),
});

export const userTitles = pgTable('user_titles', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id),
  titleId: text('title_id').notNull().references(() => titles.id),
  earnedAt: timestamp('earned_at').defaultNow().notNull(),
  revokedAt: timestamp('revoked_at'),
  isActive: boolean('is_active').default(false).notNull(),
}, (table) => ({
  userTitleUnique: unique().on(table.userId, table.titleId),
  userActiveIdx: index('user_title_user_active_idx').on(table.userId, table.isActive),
}));
```

---

## Boss Fights

```typescript
// server/src/db/schema/bosses.ts
import { pgTable, text, integer, timestamp, json, index, unique } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';
import { users } from './auth';
import { seasons } from './seasons';
import { bossDifficultyEnum, bossAttemptStatusEnum } from './enums';

export const bosses = pgTable('bosses', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull().unique(),
  description: text('description').notNull(),
  introMonologue: text('intro_monologue').notNull(),
  defeatMessage: text('defeat_message').notNull(),
  difficulty: bossDifficultyEnum('difficulty').notNull(),
  requiredLevel: integer('required_level').default(1).notNull(),
  xpReward: integer('xp_reward').notNull(),
  titleRewardId: text('title_reward_id'),
  seasonId: text('season_id').references(() => seasons.id),
});

export const bossPhases = pgTable('boss_phases', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  bossId: text('boss_id').notNull().references(() => bosses.id),
  phaseNumber: integer('phase_number').notNull(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  requirements: json('requirements').notNull(),
  durationDays: integer('duration_days').notNull(),
}, (table) => ({
  bossPhaseUnique: unique().on(table.bossId, table.phaseNumber),
}));

export const bossAttempts = pgTable('boss_attempts', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id),
  bossId: text('boss_id').notNull().references(() => bosses.id),
  status: bossAttemptStatusEnum('status').default('IN_PROGRESS').notNull(),
  currentPhase: integer('current_phase').default(1).notNull(),
  phaseProgress: json('phase_progress').notNull(),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
}, (table) => ({
  userStatusIdx: index('boss_attempt_user_status_idx').on(table.userId, table.status),
}));
```

---

## Dungeons

```typescript
// server/src/db/schema/dungeons.ts
import { pgTable, text, integer, real, timestamp, json, index } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';
import { users } from './auth';
import { seasons } from './seasons';
import { dungeonDifficultyEnum, dungeonAttemptStatusEnum } from './enums';

export const dungeons = pgTable('dungeons', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull(),
  description: text('description').notNull(),
  difficulty: dungeonDifficultyEnum('difficulty').notNull(),
  requirements: json('requirements').notNull(),
  challenges: json('challenges').notNull(),
  xpMultiplier: real('xp_multiplier').default(1.5).notNull(),
  durationMinutes: integer('duration_minutes').notNull(),
  cooldownHours: integer('cooldown_hours').default(24).notNull(),
  seasonId: text('season_id').references(() => seasons.id),
});

export const dungeonAttempts = pgTable('dungeon_attempts', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id),
  dungeonId: text('dungeon_id').notNull().references(() => dungeons.id),
  status: dungeonAttemptStatusEnum('status').default('IN_PROGRESS').notNull(),
  progress: json('progress').notNull(),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
  xpAwarded: integer('xp_awarded'),
}, (table) => ({
  userStatusIdx: index('dungeon_attempt_user_status_idx').on(table.userId, table.status),
}));
```

---

## Seasons

```typescript
// server/src/db/schema/seasons.ts
import { pgTable, text, integer, real, bigint, timestamp, index, unique } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';
import { users } from './auth';
import { seasonStatusEnum } from './enums';

export const seasons = pgTable('seasons', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  number: integer('number').notNull().unique(),
  name: text('name').notNull(),
  theme: text('theme').notNull(),
  description: text('description').notNull(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  status: seasonStatusEnum('status').default('UPCOMING').notNull(),
  xpMultiplier: real('xp_multiplier').default(1.0).notNull(),
});

export const seasonParticipations = pgTable('season_participations', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id),
  seasonId: text('season_id').notNull().references(() => seasons.id),
  seasonXP: bigint('season_xp', { mode: 'bigint' }).default(0n).notNull(),
  rank: integer('rank'),
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
}, (table) => ({
  userSeasonUnique: unique().on(table.userId, table.seasonId),
}));

export const seasonLeaderboards = pgTable('season_leaderboards', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  seasonId: text('season_id').notNull().references(() => seasons.id),
  userId: text('user_id').notNull(),
  rank: integer('rank').notNull(),
  totalXP: bigint('total_xp', { mode: 'bigint' }).notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  seasonUserUnique: unique().on(table.seasonId, table.userId),
  seasonRankIdx: index('season_leaderboard_rank_idx').on(table.seasonId, table.rank),
}));
```

---

## Config & Narrative

```typescript
// server/src/db/schema/config.ts
import { pgTable, text, integer, boolean, json, timestamp, index } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';
import { narrativeCategoryEnum } from './enums';

export const gameConfigs = pgTable('game_configs', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  key: text('key').notNull().unique(),
  value: json('value').notNull(),
  version: integer('version').default(1).notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const narrativeContents = pgTable('narrative_contents', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  key: text('key').notNull().unique(),
  category: narrativeCategoryEnum('category').notNull(),
  content: text('content').notNull(),
  context: json('context'),
  isActive: boolean('is_active').default(true).notNull(),
}, (table) => ({
  categoryActiveIdx: index('narrative_category_active_idx').on(table.category, table.isActive),
}));
```

---

## Database Connection

```typescript
// server/src/db/index.ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });

export type Database = typeof db;
```

---

## Barrel Export

```typescript
// server/src/db/schema/index.ts
export * from './enums';
export * from './auth';
export * from './quests';
export * from './xp';
export * from './titles';
export * from './bosses';
export * from './dungeons';
export * from './seasons';
export * from './config';
```
