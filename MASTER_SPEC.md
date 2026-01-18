# Solo Leveling Fitness Quest System — Master Technical Specification

## Tech Stack

| Layer | Technology |
|-------|------------|
| Web Frontend | React 18 + Vite + React Router |
| Mobile | React Native + Expo |
| Health Data | Apple HealthKit (via react-native-health) |
| Nutrition AI | LogMeal API (food image recognition) |
| State | Zustand + TanStack Query |
| Animation | Framer Motion (web) / Reanimated (mobile) |
| Auth | Better Auth |
| Backend | Hono + TypeScript |
| AI/Rules | Mastra Agent Framework (@beta) |
| Database | PostgreSQL + Drizzle ORM |
| CMS | Sanity.io (narrative content) |
| Hosting | TBD (Vercel/Railway/Render) |

---

## 1. Core Concepts

### Player Stats
- **Level**: Derived from cumulative XP (1-∞)
- **HP**: Metaphor for recovery capacity
- **STR**: Strength training progress
- **AGI**: Cardio/movement consistency
- **VIT**: Nutrition/sleep quality
- **DISC**: Discipline coefficient (streak-based)

### Quest Types
- **Daily Quests**: Trivial tasks that compound (Steps, Workout, Protein, Sleep, Alcohol-free)
- **Weekly Quests**: 7-day challenges
- **Dungeons**: Optional high-risk/high-reward challenges
- **Boss Fights**: Identity checkpoints defeated through sustained compliance

### XP System
- Append-only immutable event ledger
- Level curve: `threshold(L) = floor(50 × L² × 1.15) + (L × 25)`
- Modifiers applied in order: bonuses first, then penalties

### Debuff Day
- Trigger: Miss ≥2 core dailies
- Effect: -10% XP for 24 hours, dungeon bonuses disabled
- Narrative: "You are experiencing the cost of neglect"

---

## 2. Drizzle Schema

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

```typescript
// server/src/db/schema/auth.ts
import { pgTable, text, boolean, timestamp, index } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';

// ═══════════════════════════════════════════════════════════
// BETTER AUTH MODELS
// ═══════════════════════════════════════════════════════════

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

```typescript
// server/src/db/schema/quests.ts
import { pgTable, text, integer, boolean, timestamp, json, index, unique } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';
import { users } from './auth';
import { seasons } from './seasons';
import { questTypeEnum, questCategoryEnum, questStatusEnum, statTypeEnum } from './enums';

// ═══════════════════════════════════════════════════════════
// QUEST SYSTEM
// ═══════════════════════════════════════════════════════════

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

```typescript
// server/src/db/schema/xp.ts
import { pgTable, text, integer, bigint, real, timestamp, index } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';
import { users } from './auth';
import { questLogs } from './quests';
import { xpEventSourceEnum, modifierTypeEnum } from './enums';

// ═══════════════════════════════════════════════════════════
// XP LEDGER (IMMUTABLE)
// ═══════════════════════════════════════════════════════════

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

```typescript
// server/src/db/schema/titles.ts
import { pgTable, text, real, boolean, timestamp, index, unique } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';
import { users } from './auth';
import { titleConditionTypeEnum, passiveTypeEnum, titleRarityEnum } from './enums';

// ═══════════════════════════════════════════════════════════
// TITLES & PASSIVES
// ═══════════════════════════════════════════════════════════

export const titles = pgTable('titles', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull().unique(),
  description: text('description').notNull(), // Narrative description
  systemMessage: text('system_message').notNull(), // Cold, observational system text
  conditionType: titleConditionTypeEnum('condition_type').notNull(),
  conditionConfig: json('condition_config').notNull(), // Condition DSL
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

```typescript
// server/src/db/schema/bosses.ts
import { pgTable, text, integer, timestamp, json, index, unique } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';
import { users } from './auth';
import { seasons } from './seasons';
import { bossDifficultyEnum, bossAttemptStatusEnum } from './enums';

// ═══════════════════════════════════════════════════════════
// BOSSES
// ═══════════════════════════════════════════════════════════

export const bosses = pgTable('bosses', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull().unique(),
  description: text('description').notNull(),
  introMonologue: text('intro_monologue').notNull(), // "This opponent has defeated you before..."
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
  requirements: json('requirements').notNull(), // What must be achieved in this phase
  durationDays: integer('duration_days').notNull(), // How many days this phase lasts
}, (table) => ({
  bossPhaseUnique: unique().on(table.bossId, table.phaseNumber),
}));

export const bossAttempts = pgTable('boss_attempts', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id),
  bossId: text('boss_id').notNull().references(() => bosses.id),
  status: bossAttemptStatusEnum('status').default('IN_PROGRESS').notNull(),
  currentPhase: integer('current_phase').default(1).notNull(),
  phaseProgress: json('phase_progress').notNull(), // Progress within current phase
  startedAt: timestamp('started_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
}, (table) => ({
  userStatusIdx: index('boss_attempt_user_status_idx').on(table.userId, table.status),
}));
```

```typescript
// server/src/db/schema/dungeons.ts
import { pgTable, text, integer, real, timestamp, json, index } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';
import { users } from './auth';
import { seasons } from './seasons';
import { dungeonDifficultyEnum, dungeonAttemptStatusEnum } from './enums';

// ═══════════════════════════════════════════════════════════
// DUNGEONS
// ═══════════════════════════════════════════════════════════

export const dungeons = pgTable('dungeons', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull(),
  description: text('description').notNull(), // "Entry is optional. Survival is likely..."
  difficulty: dungeonDifficultyEnum('difficulty').notNull(),
  requirements: json('requirements').notNull(), // Entry requirements
  challenges: json('challenges').notNull(), // Array of challenge configs
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

```typescript
// server/src/db/schema/seasons.ts
import { pgTable, text, integer, real, bigint, timestamp, index, unique } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';
import { users } from './auth';
import { seasonStatusEnum } from './enums';

// ═══════════════════════════════════════════════════════════
// SEASONS
// ═══════════════════════════════════════════════════════════

export const seasons = pgTable('seasons', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  number: integer('number').notNull().unique(),
  name: text('name').notNull(), // "Awakening", "The Contender", "The Monarch"
  theme: text('theme').notNull(),
  description: text('description').notNull(), // Narrative description
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

```typescript
// server/src/db/schema/config.ts
import { pgTable, text, integer, json, timestamp, index } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';
import { narrativeCategoryEnum } from './enums';

// ═══════════════════════════════════════════════════════════
// GAME CONFIG (JSON-STORED RULES)
// ═══════════════════════════════════════════════════════════

export const gameConfigs = pgTable('game_configs', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  key: text('key').notNull().unique(),
  value: json('value').notNull(),
  version: integer('version').default(1).notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ═══════════════════════════════════════════════════════════
// NARRATIVE CONTENT
// ═══════════════════════════════════════════════════════════

export const narrativeContents = pgTable('narrative_contents', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  key: text('key').notNull().unique(),
  category: narrativeCategoryEnum('category').notNull(),
  content: text('content').notNull(),
  context: json('context'), // Additional metadata
  isActive: boolean('is_active').default(true).notNull(),
}, (table) => ({
  categoryActiveIdx: index('narrative_category_active_idx').on(table.category, table.isActive),
}));
```

```typescript
// server/src/db/schema/index.ts
// Barrel export for all schema modules

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

## 3. XP & Leveling System

### Level Curve

```typescript
// server/src/services/xp/level-curve.ts

export function computeLevelThreshold(level: number): number {
  if (level <= 1) return 0;
  return Math.floor(50 * Math.pow(level, 2) * 1.15) + (level * 25);
}

export function computeLevel(totalXP: number): number {
  let level = 1;
  while (computeLevelThreshold(level + 1) <= totalXP) {
    level++;
  }
  return level;
}

export function xpToNextLevel(totalXP: number): { current: number; required: number; progress: number } {
  const level = computeLevel(totalXP);
  const currentThreshold = computeLevelThreshold(level);
  const nextThreshold = computeLevelThreshold(level + 1);
  const xpIntoLevel = totalXP - currentThreshold;
  const xpRequired = nextThreshold - currentThreshold;

  return {
    current: xpIntoLevel,
    required: xpRequired,
    progress: Math.round((xpIntoLevel / xpRequired) * 100),
  };
}
```

### Level Thresholds (1-30)

| Level | XP to Reach | XP for Level |
|-------|-------------|--------------|
| 1 | 0 | — |
| 2 | 140 | 140 |
| 3 | 305 | 165 |
| 4 | 495 | 190 |
| 5 | 712 | 217 |
| 10 | 2,538 | 469 |
| 15 | 6,063 | 778 |
| 20 | 11,558 | 1,137 |
| 25 | 19,309 | 1,550 |
| 30 | 29,620 | 2,020 |

### XP Awards

| Activity | Base XP | Stat |
|----------|---------|------|
| Wake on time | 15 | DISC |
| Steps goal (10k) | 25 | AGI |
| Steps partial (5k) | 10 | AGI |
| Workout completed | 40 | STR |
| Protein target | 20 | VIT |
| Alcohol-free day | 15 | VIT |
| Weekly completion (5/7) | 75 | — |
| Weekly perfect (7/7) | 150 | — |
| Boss phase complete | 100-500 | — |
| Dungeon clear | 50-200 | — |

### XP Modifiers

| Modifier | Multiplier | Condition |
|----------|------------|-----------|
| Debuff penalty | 0.90x | Debuff active |
| 7-day streak | 1.10x | 7+ consecutive |
| 14-day streak | 1.15x | 14+ consecutive |
| 30-day streak | 1.25x | 30+ consecutive |
| Weekend bonus | 1.10x | Sat/Sun completion |
| Season multiplier | varies | Season config |

---

## 4. Rules Engine (Mastra Integration)

### Requirement DSL

```typescript
// server/src/types/requirements.ts

export type Requirement = NumericRequirement | BooleanRequirement | CompoundRequirement;

export interface NumericRequirement {
  type: 'numeric';
  metric: 'steps' | 'protein_grams' | 'sleep_hours' | 'workout_minutes';
  op: '>=' | '<=' | '>' | '<' | '==' | '!=';
  value: number;
}

export interface BooleanRequirement {
  type: 'boolean';
  metric: 'workout_completed' | 'alcohol_free' | 'wake_on_time';
  value: boolean;
}

export interface CompoundRequirement {
  type: 'compound';
  logic: 'AND' | 'OR';
  requirements: Requirement[];
}
```

### Example Quest Requirements

```json
{
  "daily_steps": {
    "type": "numeric",
    "metric": "steps",
    "op": ">=",
    "value": 10000
  },
  "strength_training": {
    "type": "compound",
    "logic": "AND",
    "requirements": [
      { "type": "boolean", "metric": "workout_completed", "value": true },
      { "type": "numeric", "metric": "workout_minutes", "op": ">=", "value": 30 }
    ]
  }
}
```

### Mastra Agent Structure

```
server/src/mastra/
├── index.ts                    # Mastra instance
├── agents/
│   ├── quest-evaluator.ts      # Evaluates quest completion
│   ├── xp-calculator.ts        # Calculates XP with modifiers
│   └── title-evaluator.ts      # Checks title conditions
└── tools/
    ├── player-stats.ts         # Get player current state
    ├── quest-requirements.ts   # Evaluate requirements
    ├── xp-ledger.ts            # Award XP (immutable)
    ├── streak-checker.ts       # Check streak status
    └── title-conditions.ts     # Title condition checks
```

---

## 5. Streak & Debuff System

### Streak Calculation

```typescript
// server/src/services/streak.service.ts
import { eq, and, desc } from 'drizzle-orm';
import { db } from '../db';
import { dailyLogs } from '../db/schema';

interface StreakResult {
  currentStreak: number;      // Days with 3+/4 core quests
  perfectStreak: number;      // Days with 4/4 core quests
  longestStreak: number;
  lastCompletedDate: string;
}

async function computeStreaks(userId: string): Promise<StreakResult> {
  const logs = await db
    .select()
    .from(dailyLogs)
    .where(and(eq(dailyLogs.userId, userId), eq(dailyLogs.evaluated, true)))
    .orderBy(desc(dailyLogs.dayDate))
    .limit(365);

  let currentStreak = 0;
  let perfectStreak = 0;

  for (const log of logs) {
    const passesDaily = log.coreCompleted >= 3;
    const passesPerfect = log.coreCompleted === log.coreTotal;

    if (passesDaily) {
      currentStreak++;
      if (passesPerfect) perfectStreak++;
      else perfectStreak = 0;
    } else {
      break; // Streak broken
    }
  }

  return { currentStreak, perfectStreak, longestStreak, lastCompletedDate };
}
```

### Debuff Trigger

```typescript
import { eq, and } from 'drizzle-orm';
import { db } from '../db';
import { users, dailyLogs } from '../db/schema';

async function evaluateDailyDebuff(userId: string, dayDate: string): Promise<void> {
  const [log] = await db
    .select()
    .from(dailyLogs)
    .where(and(eq(dailyLogs.userId, userId), eq(dailyLogs.dayDate, dayDate)));

  if (!log) return;

  const missedCore = log.coreTotal - log.coreCompleted;

  if (missedCore >= 2) {
    const debuffUntil = new Date();
    debuffUntil.setHours(debuffUntil.getHours() + 24);

    await db
      .update(users)
      .set({ debuffActiveUntil: debuffUntil })
      .where(eq(users.id, userId));

    await db
      .update(dailyLogs)
      .set({ debuffTriggered: true })
      .where(eq(dailyLogs.id, log.id));
  }
}
```

---

## 6. Titles & Passives

### Title Condition Types

| Type | Description | Example |
|------|-------------|---------|
| STREAK_DAYS | Consecutive days | 30-day streak = "Iron Will" |
| CUMULATIVE_COUNT | Total count | 100 workouts = "Centurion" |
| TIME_WINDOW | Within period | 7 alcohol-free days this week |
| EVENT_COUNT | Specific events | 10 boss defeats |
| COMPOUND | Multiple conditions | Streak + cumulative |
| SPECIAL | Custom logic | First of month completion |

### Seed Titles

```typescript
export const titles = [
  {
    name: 'The Consistent',
    description: 'This individual returns even when progress is invisible.',
    systemMessage: 'Consistency detected. Classification updated.',
    conditionType: 'STREAK_DAYS',
    conditionConfig: { days: 14 },
    passiveType: 'PERCENT_XP_BONUS',
    passiveValue: 5,
    rarity: 'UNCOMMON',
  },
  {
    name: 'Alcohol Slayer',
    description: 'Short-term pleasure no longer dictates long-term outcomes.',
    systemMessage: 'Substance independence confirmed.',
    conditionType: 'CUMULATIVE_COUNT',
    conditionConfig: { metric: 'alcohol_free_days', count: 30 },
    passiveType: 'STAT_BONUS',
    passiveValue: 2, // +2 VIT
    rarity: 'RARE',
  },
  {
    name: 'The Walker',
    description: 'Movement has become default, not effort.',
    systemMessage: 'Locomotion pattern normalized.',
    conditionType: 'CUMULATIVE_COUNT',
    conditionConfig: { metric: 'steps_goal_days', count: 60 },
    passiveType: 'FLAT_XP_BONUS',
    passiveValue: 3,
    rarity: 'UNCOMMON',
  },
  {
    name: 'Iron Will',
    description: 'Action occurs regardless of internal resistance.',
    systemMessage: 'Willpower coefficient exceeds baseline.',
    conditionType: 'STREAK_DAYS',
    conditionConfig: { days: 30 },
    passiveType: 'DEBUFF_REDUCTION',
    passiveValue: 0.5, // Debuff only -5% instead of -10%
    rarity: 'EPIC',
  },
  {
    name: 'Centurion',
    description: 'One hundred sessions. The body remembers what the mind forgets.',
    systemMessage: 'Century milestone achieved.',
    conditionType: 'CUMULATIVE_COUNT',
    conditionConfig: { metric: 'workout_completions', count: 100 },
    passiveType: 'STAT_BONUS',
    passiveValue: 5, // +5 STR
    rarity: 'EPIC',
  },
];
```

---

## 7. Boss Fights

### Boss Structure

Bosses are **identity checkpoints** defeated through sustained compliance over weeks.

```typescript
export const bosses = [
  {
    name: 'The Inconsistent One',
    description: 'Your pattern of starting and stopping. The cycle that defines failure.',
    introMonologue: `This opponent has defeated you before.
Not through strength — but through time.
It waits for enthusiasm to fade.
It knows you will negotiate.`,
    defeatMessage: 'The pattern is broken. For now.',
    difficulty: 'NORMAL',
    requiredLevel: 5,
    xpReward: 500,
    phases: [
      { phaseNumber: 1, name: 'Recognition', durationDays: 7, requirements: { dailyCompletionRate: 0.7 } },
      { phaseNumber: 2, name: 'Resistance', durationDays: 7, requirements: { dailyCompletionRate: 0.8 } },
      { phaseNumber: 3, name: 'Override', durationDays: 7, requirements: { dailyCompletionRate: 0.9 } },
    ],
  },
  {
    name: 'The Excuse Maker',
    description: 'The voice that provides reasons. Always reasonable. Always wrong.',
    introMonologue: `This enemy speaks with your voice.
It offers logic when logic serves weakness.
"Tomorrow" is its favorite word.`,
    defeatMessage: 'Silence achieved. Temporarily.',
    difficulty: 'HARD',
    requiredLevel: 10,
    xpReward: 1000,
    phases: [
      { phaseNumber: 1, name: 'Awareness', durationDays: 7, requirements: { perfectDays: 3 } },
      { phaseNumber: 2, name: 'Confrontation', durationDays: 7, requirements: { perfectDays: 5 } },
      { phaseNumber: 3, name: 'Execution', durationDays: 7, requirements: { perfectDays: 7 } },
    ],
  },
  {
    name: 'The Comfortable Self',
    description: 'The version of you that stopped. The one who decided "enough."',
    introMonologue: `This is not an enemy.
This is who you were becoming.
Comfortable. Settled. Done.`,
    defeatMessage: 'Comfort rejected. Growth chosen.',
    difficulty: 'NIGHTMARE',
    requiredLevel: 20,
    xpReward: 2500,
    phases: [
      { phaseNumber: 1, name: 'Discomfort', durationDays: 14, requirements: { dungeonClears: 2, streak: 10 } },
      { phaseNumber: 2, name: 'Sustained Effort', durationDays: 14, requirements: { dungeonClears: 3, streak: 14 } },
      { phaseNumber: 3, name: 'Transformation', durationDays: 14, requirements: { perfectDays: 10, streak: 14 } },
    ],
  },
];
```

---

## 8. Seasons

### Season Structure

Seasons represent **phases of becoming**, not resets.

```typescript
export const seasons = [
  {
    number: 1,
    name: 'Awakening',
    theme: 'FOUNDATION',
    description: 'You learn the cost of inaction. The System reveals what neglect has hidden.',
    xpMultiplier: 1.0,
    // Focus: Establishing daily habits
  },
  {
    number: 2,
    name: 'The Contender',
    theme: 'CHALLENGE',
    description: 'You stop negotiating with yourself. Excuses become visible lies.',
    xpMultiplier: 1.1,
    // Focus: Harder dungeons, first boss fights
  },
  {
    number: 3,
    name: 'The Monarch',
    theme: 'MASTERY',
    description: 'You choose when to push — and when not to. Control replaces compulsion.',
    xpMultiplier: 1.2,
    // Focus: Optimization, hardest content
  },
];
```

### Season Rules
- Stats persist across seasons
- Memory/history persists
- Only challenges and content change
- Seasonal leaderboard resets
- Seasonal XP tracked separately

---

## 9. Narrative Content System

### Content Categories

| Category | Examples |
|----------|----------|
| ONBOARDING | Awakening sequence, system access |
| SYSTEM_MESSAGE | Generic system observations |
| DAILY_QUEST | "These tasks are trivial..." |
| DEBUFF | Performance degradation notices |
| DUNGEON | Entry prompts, completion |
| BOSS | Intro monologues, defeat messages |
| TITLE | Assignment observations |
| SEASON | Season descriptions |
| LEVEL_UP | Level increase notices |
| DAILY_REMINDER | "The System is not impressed..." |

### Seed Narrative Content

```typescript
export const narrativeContent = [
  // ONBOARDING
  {
    key: 'onboarding.detection',
    category: 'ONBOARDING',
    content: `A dormant capability has been detected.

Physical output: underdeveloped
Recovery capacity: unstable
Discipline coefficient: unknown

You have been granted access to the System.`,
  },
  {
    key: 'onboarding.accept',
    category: 'ONBOARDING',
    content: `This interface will not motivate you.
It will not encourage you.

It will only record what you do.`,
  },

  // DAILY QUEST
  {
    key: 'daily.header',
    category: 'DAILY_QUEST',
    content: `DAILY QUESTS GENERATED

These tasks are trivial.
That is why most people fail them.`,
  },
  {
    key: 'daily.philosophy',
    category: 'DAILY_QUEST',
    content: `Movement keeps decay away
Strength prevents helplessness
Recovery determines longevity
Nutrition decides efficiency

Skipping them does not anger the System.
It simply marks you accurately.`,
  },

  // DEBUFF
  {
    key: 'debuff.notice',
    category: 'DEBUFF',
    content: `SYSTEM NOTICE: PERFORMANCE DEGRADATION

Repeated inaction detected.

No punishment issued.
Efficiency temporarily reduced.

You are not being punished.
You are experiencing the cost of neglect.

The System reflects reality — nothing more.`,
  },

  // DUNGEON
  {
    key: 'dungeon.prompt',
    category: 'DUNGEON',
    content: `UNSTABLE ZONE DETECTED

Entry is optional.

Survival is likely.
Growth is not guaranteed.

Dungeons exist for one reason:
To see what happens when you ask more of yourself than required.

Failure here is not weakness.
It is ambition without preparation.`,
  },

  // LEVEL UP
  {
    key: 'levelup.notice',
    category: 'LEVEL_UP',
    content: `LEVEL UP DETECTED

Strength marginally increased.
Recovery improved.

No celebration required.

The System does not applaud.
Progress is expected.`,
  },

  // DAILY REMINDER
  {
    key: 'daily.reminder',
    category: 'DAILY_REMINDER',
    content: `The System is not impressed.
It is only paying attention.`,
  },

  // SYSTEM PHILOSOPHY
  {
    key: 'system.philosophy',
    category: 'SYSTEM_MESSAGE',
    content: `The System does not care how you feel.
It only responds to action.

Action creates XP
XP creates Levels
Levels create distance
Distance creates identity

You are not improving.
You are moving away from your former self.`,
  },

  // ENDGAME
  {
    key: 'endgame.question',
    category: 'SYSTEM_MESSAGE',
    content: `There is no final boss.
There is no completion screen.

Only this question, asked repeatedly:

If this body had to carry you for the next 40 years…
would it be enough?`,
  },
];
```

### Content Service

```typescript
// server/src/services/narrative.service.ts
import { eq, and } from 'drizzle-orm';
import { db } from '../db';
import { narrativeContents, NarrativeCategory } from '../db/schema';

export class NarrativeService {
  async getContent(key: string): Promise<string | null> {
    const [content] = await db
      .select()
      .from(narrativeContents)
      .where(and(eq(narrativeContents.key, key), eq(narrativeContents.isActive, true)));

    return content?.content ?? null;
  }

  async getContentByCategory(category: NarrativeCategory): Promise<Record<string, string>> {
    const contents = await db
      .select()
      .from(narrativeContents)
      .where(and(eq(narrativeContents.category, category), eq(narrativeContents.isActive, true)));

    return Object.fromEntries(contents.map(c => [c.key, c.content]));
  }

  async interpolate(key: string, variables: Record<string, string>): Promise<string> {
    let content = await this.getContent(key);
    if (!content) return '';

    for (const [varName, value] of Object.entries(variables)) {
      content = content.replace(new RegExp(`{{${varName}}}`, 'g'), value);
    }
    return content;
  }
}
```

---

## 10. Apple HealthKit Integration

### Overview

Health data flows automatically from Apple Watch → iPhone HealthKit → Backend API. Users never manually enter steps, workouts, or sleep data. The app requests HealthKit permissions on first launch and syncs in the background.

### Data Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Apple Watch │────▶│  HealthKit  │────▶│  RN App     │────▶│  Backend    │
│             │     │  (iPhone)   │     │  (Sync)     │     │  API        │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                                               │
                                               ▼
                                        ┌─────────────┐
                                        │ Quest Auto- │
                                        │ Completion  │
                                        └─────────────┘
```

### HealthKit Data Types

| HealthKit Type | Quest Metric | Sample Type |
|----------------|--------------|-------------|
| `HKQuantityTypeIdentifierStepCount` | Daily steps | Cumulative |
| `HKQuantityTypeIdentifierActiveEnergyBurned` | Workout calories | Cumulative |
| `HKQuantityTypeIdentifierAppleExerciseTime` | Workout minutes | Cumulative |
| `HKCategoryTypeIdentifierSleepAnalysis` | Sleep hours | Category |
| `HKWorkoutType` | Workout completed | Workout |
| `HKQuantityTypeIdentifierBodyMass` | Weight tracking | Discrete |
| `HKQuantityTypeIdentifierDietaryProtein` | Protein intake | Cumulative |

### React Native Setup

```typescript
// mobile/src/health/healthkit.ts
import AppleHealthKit, {
  HealthKitPermissions,
  HealthInputOptions,
  HealthValue,
} from 'react-native-health';

const permissions: HealthKitPermissions = {
  permissions: {
    read: [
      AppleHealthKit.Constants.Permissions.Steps,
      AppleHealthKit.Constants.Permissions.ActiveEnergyBurned,
      AppleHealthKit.Constants.Permissions.AppleExerciseTime,
      AppleHealthKit.Constants.Permissions.SleepAnalysis,
      AppleHealthKit.Constants.Permissions.Workout,
      AppleHealthKit.Constants.Permissions.Weight,
      AppleHealthKit.Constants.Permissions.DietaryProtein,
    ],
    write: [], // Read-only for now
  },
};

export async function initializeHealthKit(): Promise<boolean> {
  return new Promise((resolve) => {
    AppleHealthKit.initHealthKit(permissions, (error) => {
      if (error) {
        console.error('HealthKit init error:', error);
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
}

export async function getTodaySteps(): Promise<number> {
  const options: HealthInputOptions = {
    date: new Date().toISOString(),
    includeManuallyAdded: true,
  };

  return new Promise((resolve) => {
    AppleHealthKit.getStepCount(options, (error, results) => {
      if (error) {
        resolve(0);
      } else {
        resolve(results.value);
      }
    });
  });
}

export async function getTodayWorkouts(): Promise<HealthValue[]> {
  const options = {
    startDate: new Date(new Date().setHours(0, 0, 0, 0)).toISOString(),
    endDate: new Date().toISOString(),
  };

  return new Promise((resolve) => {
    AppleHealthKit.getSamples(
      {
        ...options,
        type: 'Workout',
      },
      (error, results) => {
        if (error) {
          resolve([]);
        } else {
          resolve(results);
        }
      }
    );
  });
}

export async function getTodaySleep(): Promise<number> {
  const options = {
    startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date().toISOString(),
  };

  return new Promise((resolve) => {
    AppleHealthKit.getSleepSamples(options, (error, results) => {
      if (error) {
        resolve(0);
      } else {
        // Calculate total sleep hours from samples
        const totalMinutes = results
          .filter((s) => s.value === 'ASLEEP' || s.value === 'INBED')
          .reduce((acc, sample) => {
            const start = new Date(sample.startDate);
            const end = new Date(sample.endDate);
            return acc + (end.getTime() - start.getTime()) / (1000 * 60);
          }, 0);
        resolve(totalMinutes / 60);
      }
    });
  });
}

export async function getTodayExerciseMinutes(): Promise<number> {
  const options: HealthInputOptions = {
    date: new Date().toISOString(),
  };

  return new Promise((resolve) => {
    AppleHealthKit.getAppleExerciseTime(options, (error, results) => {
      if (error) {
        resolve(0);
      } else {
        resolve(results.value);
      }
    });
  });
}
```

### Health Sync Service

```typescript
// mobile/src/health/sync.service.ts
import { api } from '../lib/api';
import {
  getTodaySteps,
  getTodayWorkouts,
  getTodaySleep,
  getTodayExerciseMinutes,
} from './healthkit';

export interface HealthSnapshot {
  date: string; // YYYY-MM-DD
  steps: number;
  exerciseMinutes: number;
  sleepHours: number;
  workouts: {
    type: string;
    durationMinutes: number;
    calories: number;
    startTime: string;
  }[];
  syncedAt: string;
}

export async function captureHealthSnapshot(): Promise<HealthSnapshot> {
  const [steps, exerciseMinutes, sleepHours, workouts] = await Promise.all([
    getTodaySteps(),
    getTodayExerciseMinutes(),
    getTodaySleep(),
    getTodayWorkouts(),
  ]);

  return {
    date: new Date().toISOString().split('T')[0],
    steps,
    exerciseMinutes,
    sleepHours,
    workouts: workouts.map((w) => ({
      type: w.activityName || 'Unknown',
      durationMinutes: w.duration ? w.duration / 60 : 0,
      calories: w.calories || 0,
      startTime: w.startDate,
    })),
    syncedAt: new Date().toISOString(),
  };
}

export async function syncHealthData(): Promise<void> {
  try {
    const snapshot = await captureHealthSnapshot();
    await api.health.sync(snapshot);
  } catch (error) {
    console.error('Health sync failed:', error);
    // Queue for retry
    await queueFailedSync(snapshot);
  }
}

// Background sync with iOS Background App Refresh
export function registerBackgroundSync(): void {
  // Using react-native-background-fetch
  BackgroundFetch.configure(
    {
      minimumFetchInterval: 15, // 15 minutes
      stopOnTerminate: false,
      startOnBoot: true,
      enableHeadless: true,
    },
    async (taskId) => {
      await syncHealthData();
      BackgroundFetch.finish(taskId);
    },
    (taskId) => {
      BackgroundFetch.finish(taskId);
    }
  );
}
```

### Backend Health API

```typescript
// server/src/db/schema/health.ts
import { pgTable, text, integer, real, timestamp, json, index } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';
import { users } from './auth';

export const healthSnapshots = pgTable('health_snapshots', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id),
  date: text('date').notNull(), // YYYY-MM-DD
  steps: integer('steps').notNull(),
  exerciseMinutes: integer('exercise_minutes').notNull(),
  sleepHours: real('sleep_hours').notNull(),
  workouts: json('workouts').notNull(), // Array of workout objects
  syncedAt: timestamp('synced_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  userDateIdx: index('health_snapshot_user_date_idx').on(table.userId, table.date),
}));
```

```typescript
// server/src/routes/health.ts
import { Hono } from 'hono';
import { eq, and } from 'drizzle-orm';
import { requireAuth } from '../middleware/auth';
import { db } from '../db';
import { healthSnapshots } from '../db/schema';
import { evaluateQuestsFromHealth } from '../services/quest-evaluator.service';

export const healthRoutes = new Hono();

healthRoutes.use('*', requireAuth);

healthRoutes.post('/sync', async (c) => {
  const userId = c.get('userId');
  const snapshot = await c.req.json();

  // Upsert health snapshot for the day
  const existing = await db
    .select()
    .from(healthSnapshots)
    .where(and(
      eq(healthSnapshots.userId, userId),
      eq(healthSnapshots.date, snapshot.date)
    ));

  if (existing.length > 0) {
    await db
      .update(healthSnapshots)
      .set({
        steps: snapshot.steps,
        exerciseMinutes: snapshot.exerciseMinutes,
        sleepHours: snapshot.sleepHours,
        workouts: snapshot.workouts,
        syncedAt: new Date(snapshot.syncedAt),
      })
      .where(eq(healthSnapshots.id, existing[0].id));
  } else {
    await db.insert(healthSnapshots).values({
      userId,
      date: snapshot.date,
      steps: snapshot.steps,
      exerciseMinutes: snapshot.exerciseMinutes,
      sleepHours: snapshot.sleepHours,
      workouts: snapshot.workouts,
      syncedAt: new Date(snapshot.syncedAt),
    });
  }

  // Evaluate quests based on new health data
  const questResults = await evaluateQuestsFromHealth(userId, snapshot);

  return c.json({
    synced: true,
    questsCompleted: questResults.completed,
    questsProgressed: questResults.progressed,
  });
});

healthRoutes.get('/today', async (c) => {
  const userId = c.get('userId');
  const today = new Date().toISOString().split('T')[0];

  const [snapshot] = await db
    .select()
    .from(healthSnapshots)
    .where(and(
      eq(healthSnapshots.userId, userId),
      eq(healthSnapshots.date, today)
    ));

  return c.json(snapshot || null);
});
```

### Quest Auto-Evaluation Service

```typescript
// server/src/services/quest-evaluator.service.ts
import { eq, and } from 'drizzle-orm';
import { db } from '../db';
import { questLogs, questTemplates, dailyLogs } from '../db/schema';
import { HealthSnapshot } from '../types/health';
import { awardXP } from './xp.service';

interface QuestEvaluationResult {
  completed: string[];  // Quest IDs that were completed
  progressed: string[]; // Quest IDs that progressed
}

export async function evaluateQuestsFromHealth(
  userId: string,
  health: HealthSnapshot
): Promise<QuestEvaluationResult> {
  const result: QuestEvaluationResult = { completed: [], progressed: [] };

  // Get today's active quests for user
  const activeQuests = await db
    .select({
      log: questLogs,
      template: questTemplates,
    })
    .from(questLogs)
    .innerJoin(questTemplates, eq(questLogs.templateId, questTemplates.id))
    .where(and(
      eq(questLogs.userId, userId),
      eq(questLogs.dayDate, health.date),
      eq(questLogs.status, 'ACTIVE')
    ));

  for (const { log, template } of activeQuests) {
    const requirements = template.requirements as any;
    let isComplete = false;
    let progress = log.progress as any;

    // Evaluate based on requirement type
    switch (requirements.metric) {
      case 'steps':
        progress = { current: health.steps, target: requirements.value };
        isComplete = health.steps >= requirements.value;
        break;

      case 'workout_completed':
        const hasWorkout = health.workouts.length > 0;
        progress = { completed: hasWorkout };
        isComplete = hasWorkout;
        break;

      case 'workout_minutes':
        progress = { current: health.exerciseMinutes, target: requirements.value };
        isComplete = health.exerciseMinutes >= requirements.value;
        break;

      case 'sleep_hours':
        progress = { current: health.sleepHours, target: requirements.value };
        isComplete = health.sleepHours >= requirements.value;
        break;
    }

    // Update quest progress
    await db
      .update(questLogs)
      .set({ progress })
      .where(eq(questLogs.id, log.id));

    result.progressed.push(log.id);

    // Complete quest if requirements met
    if (isComplete && log.status !== 'COMPLETED') {
      await db
        .update(questLogs)
        .set({
          status: 'COMPLETED',
          completedAt: new Date(),
          xpAwarded: template.baseXp,
        })
        .where(eq(questLogs.id, log.id));

      // Award XP
      await awardXP(userId, {
        source: 'QUEST_COMPLETION',
        sourceId: log.id,
        baseXP: template.baseXp,
      });

      // Update daily log
      await incrementDailyCompletion(userId, health.date, template.isCore);

      result.completed.push(log.id);
    }
  }

  return result;
}

async function incrementDailyCompletion(
  userId: string,
  date: string,
  isCore: boolean
): Promise<void> {
  const [log] = await db
    .select()
    .from(dailyLogs)
    .where(and(eq(dailyLogs.userId, userId), eq(dailyLogs.dayDate, date)));

  if (log && isCore) {
    await db
      .update(dailyLogs)
      .set({ coreCompleted: log.coreCompleted + 1 })
      .where(eq(dailyLogs.id, log.id));
  }
}
```

### Mobile App Structure

```
mobile/
├── app/                        # Expo Router pages
│   ├── (tabs)/
│   │   ├── index.tsx           # Dashboard
│   │   ├── quests.tsx          # Quest list
│   │   └── profile.tsx         # Stats & settings
│   ├── _layout.tsx
│   └── onboarding.tsx
├── src/
│   ├── components/
│   │   ├── StatBlock.tsx
│   │   ├── QuestCard.tsx
│   │   └── SystemWindow.tsx
│   ├── health/
│   │   ├── healthkit.ts        # HealthKit wrapper
│   │   ├── sync.service.ts     # Sync logic
│   │   └── permissions.tsx     # Permission UI
│   ├── hooks/
│   │   ├── useHealth.ts
│   │   ├── usePlayer.ts
│   │   └── useQuests.ts
│   ├── lib/
│   │   ├── api.ts
│   │   └── auth.ts
│   └── stores/
│       └── healthStore.ts
├── app.json
└── package.json
```

### HealthKit Permission Flow

```typescript
// mobile/src/health/permissions.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { initializeHealthKit } from './healthkit';
import { SystemWindow } from '../components/SystemWindow';

export function HealthPermissionScreen({ onComplete }: { onComplete: () => void }) {
  const [status, setStatus] = useState<'idle' | 'requesting' | 'granted' | 'denied'>('idle');

  const requestPermission = async () => {
    setStatus('requesting');
    const granted = await initializeHealthKit();
    setStatus(granted ? 'granted' : 'denied');

    if (granted) {
      // Start initial sync
      await syncHealthData();
      onComplete();
    }
  };

  return (
    <SystemWindow title="SYSTEM ACCESS REQUIRED">
      <Text style={styles.message}>
        {`The System requires access to your physical data.

Movement patterns
Recovery cycles
Training output

This is not optional for accurate assessment.`}
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={requestPermission}
        disabled={status === 'requesting'}
      >
        <Text style={styles.buttonText}>
          {status === 'requesting' ? 'REQUESTING...' : 'GRANT ACCESS'}
        </Text>
      </TouchableOpacity>

      {status === 'denied' && (
        <Text style={styles.warning}>
          Access denied. The System cannot function without data.
        </Text>
      )}
    </SystemWindow>
  );
}
```

### Sync Frequency & Battery Optimization

| Trigger | Frequency | Purpose |
|---------|-----------|---------|
| App foreground | Immediate | Fresh data on open |
| Background fetch | 15 min | iOS-managed background sync |
| Significant location change | On move | Catch outdoor workouts |
| Workout end | Immediate | Apple Watch workout completion |
| Manual pull-to-refresh | On demand | User-initiated sync |

### Offline Support

```typescript
// mobile/src/health/offline-queue.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const QUEUE_KEY = 'health_sync_queue';

export async function queueFailedSync(snapshot: HealthSnapshot): Promise<void> {
  const queue = await getQueue();
  queue.push(snapshot);
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export async function processQueue(): Promise<void> {
  const queue = await getQueue();
  if (queue.length === 0) return;

  const successful: number[] = [];

  for (let i = 0; i < queue.length; i++) {
    try {
      await api.health.sync(queue[i]);
      successful.push(i);
    } catch {
      // Keep in queue for retry
    }
  }

  // Remove successful syncs
  const remaining = queue.filter((_, i) => !successful.includes(i));
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
}
```

---

## 11. Nutrition Tracking (LogMeal AI)

### Overview

Nutrition is tracked via photo-based food recognition. Users snap a photo of their meal, LogMeal AI identifies the food items, and returns detailed nutritional data. No manual calorie counting or macro entry.

### Data Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  User snaps │────▶│  LogMeal    │────▶│  Backend    │────▶│  Quest      │
│  meal photo │     │  API        │     │  processes  │     │  evaluation │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │ Calories,   │
                    │ Protein,    │
                    │ Carbs, Fat  │
                    └─────────────┘
```

### LogMeal API Integration

| Endpoint | Purpose |
|----------|---------|
| `POST /v2/image/segmentation/complete` | Detect multiple food items in image |
| `POST /v2/recipe/nutritionalInfo` | Get nutritional breakdown |
| `POST /v2/nutrition/recipe/ingredients` | Detect ingredients with quantities |

### Nutrition Data Model

```typescript
// server/src/db/schema/nutrition.ts
import { pgTable, text, integer, real, timestamp, json, index, unique } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';
import { users } from './auth';

export const mealLogs = pgTable('meal_logs', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id),
  date: text('date').notNull(), // YYYY-MM-DD
  mealType: text('meal_type').notNull(), // breakfast, lunch, dinner, snack
  imageUrl: text('image_url'), // S3/Cloudflare R2 URL
  logmealResponse: json('logmeal_response'), // Raw API response for debugging

  // Detected foods
  foods: json('foods').notNull(), // Array of { name, quantity, unit, confidence }

  // Aggregated nutrition
  calories: integer('calories').notNull(),
  protein: real('protein').notNull(), // grams
  carbs: real('carbs').notNull(), // grams
  fat: real('fat').notNull(), // grams
  fiber: real('fiber'), // grams
  sugar: real('sugar'), // grams
  sodium: real('sodium'), // mg

  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  userDateIdx: index('meal_log_user_date_idx').on(table.userId, table.date),
}));

export const dailyNutrition = pgTable('daily_nutrition', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id),
  date: text('date').notNull(), // YYYY-MM-DD

  // Daily totals (aggregated from meal_logs)
  totalCalories: integer('total_calories').default(0).notNull(),
  totalProtein: real('total_protein').default(0).notNull(),
  totalCarbs: real('total_carbs').default(0).notNull(),
  totalFat: real('total_fat').default(0).notNull(),
  mealCount: integer('meal_count').default(0).notNull(),

  // User targets (can be personalized)
  targetCalories: integer('target_calories'),
  targetProtein: real('target_protein'),

  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userDateUnique: unique().on(table.userId, table.date),
}));
```

### LogMeal Service

```typescript
// server/src/services/logmeal.service.ts
import { createHash } from 'crypto';

const LOGMEAL_API_URL = 'https://api.logmeal.com/v2';
const LOGMEAL_API_KEY = process.env.LOGMEAL_API_KEY!;

interface LogMealFood {
  name: string;
  confidence: number;
  quantity?: number;
  unit?: string;
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
  };
}

interface LogMealResult {
  foods: LogMealFood[];
  totalNutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
  };
}

export async function analyzeFoodImage(imageBuffer: Buffer): Promise<LogMealResult> {
  // Step 1: Segment the image to detect food items
  const segmentationRes = await fetch(`${LOGMEAL_API_URL}/image/segmentation/complete`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${LOGMEAL_API_KEY}`,
    },
    body: createFormData(imageBuffer),
  });

  const segmentation = await segmentationRes.json();

  if (!segmentation.imageId) {
    throw new Error('Food recognition failed');
  }

  // Step 2: Get nutritional information
  const nutritionRes = await fetch(`${LOGMEAL_API_URL}/recipe/nutritionalInfo`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${LOGMEAL_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ imageId: segmentation.imageId }),
  });

  const nutrition = await nutritionRes.json();

  // Map to our format
  const foods: LogMealFood[] = segmentation.foodFamily.map((food: any, idx: number) => ({
    name: food.name,
    confidence: food.confidence,
    quantity: nutrition.servingSizes?.[idx]?.quantity,
    unit: nutrition.servingSizes?.[idx]?.unit,
    nutrition: {
      calories: nutrition.nutritionalInfo?.[idx]?.calories || 0,
      protein: nutrition.nutritionalInfo?.[idx]?.protein || 0,
      carbs: nutrition.nutritionalInfo?.[idx]?.carbs || 0,
      fat: nutrition.nutritionalInfo?.[idx]?.fat || 0,
      fiber: nutrition.nutritionalInfo?.[idx]?.fiber,
      sugar: nutrition.nutritionalInfo?.[idx]?.sugar,
      sodium: nutrition.nutritionalInfo?.[idx]?.sodium,
    },
  }));

  // Calculate totals
  const totalNutrition = foods.reduce(
    (acc, food) => ({
      calories: acc.calories + food.nutrition.calories,
      protein: acc.protein + food.nutrition.protein,
      carbs: acc.carbs + food.nutrition.carbs,
      fat: acc.fat + food.nutrition.fat,
      fiber: (acc.fiber || 0) + (food.nutrition.fiber || 0),
      sugar: (acc.sugar || 0) + (food.nutrition.sugar || 0),
      sodium: (acc.sodium || 0) + (food.nutrition.sodium || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0 }
  );

  return { foods, totalNutrition };
}

function createFormData(imageBuffer: Buffer): FormData {
  const formData = new FormData();
  formData.append('image', new Blob([imageBuffer]), 'meal.jpg');
  return formData;
}
```

### Meal Logging API

```typescript
// server/src/routes/nutrition.ts
import { Hono } from 'hono';
import { eq, and, sql } from 'drizzle-orm';
import { requireAuth } from '../middleware/auth';
import { db } from '../db';
import { mealLogs, dailyNutrition } from '../db/schema';
import { analyzeFoodImage } from '../services/logmeal.service';
import { evaluateNutritionQuests } from '../services/quest-evaluator.service';
import { uploadImage } from '../services/storage.service';

export const nutritionRoutes = new Hono();

nutritionRoutes.use('*', requireAuth);

// Log a meal via photo
nutritionRoutes.post('/log', async (c) => {
  const userId = c.get('userId');
  const formData = await c.req.formData();
  const image = formData.get('image') as File;
  const mealType = formData.get('mealType') as string || 'snack';
  const date = formData.get('date') as string || new Date().toISOString().split('T')[0];

  if (!image) {
    return c.json({ error: 'Image required' }, 400);
  }

  // Convert to buffer
  const imageBuffer = Buffer.from(await image.arrayBuffer());

  // Analyze with LogMeal
  const analysis = await analyzeFoodImage(imageBuffer);

  // Upload image to storage
  const imageUrl = await uploadImage(imageBuffer, `meals/${userId}/${Date.now()}.jpg`);

  // Save meal log
  const [mealLog] = await db.insert(mealLogs).values({
    userId,
    date,
    mealType,
    imageUrl,
    foods: analysis.foods,
    calories: analysis.totalNutrition.calories,
    protein: analysis.totalNutrition.protein,
    carbs: analysis.totalNutrition.carbs,
    fat: analysis.totalNutrition.fat,
    fiber: analysis.totalNutrition.fiber,
    sugar: analysis.totalNutrition.sugar,
    sodium: analysis.totalNutrition.sodium,
  }).returning();

  // Update daily totals
  await updateDailyNutrition(userId, date);

  // Evaluate nutrition quests
  const questResults = await evaluateNutritionQuests(userId, date);

  return c.json({
    mealLog,
    questsCompleted: questResults.completed,
    questsProgressed: questResults.progressed,
  });
});

// Get today's nutrition summary
nutritionRoutes.get('/today', async (c) => {
  const userId = c.get('userId');
  const today = new Date().toISOString().split('T')[0];

  const [summary] = await db
    .select()
    .from(dailyNutrition)
    .where(and(eq(dailyNutrition.userId, userId), eq(dailyNutrition.date, today)));

  const meals = await db
    .select()
    .from(mealLogs)
    .where(and(eq(mealLogs.userId, userId), eq(mealLogs.date, today)))
    .orderBy(mealLogs.createdAt);

  return c.json({
    summary: summary || { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0, mealCount: 0 },
    meals,
  });
});

// Get meal history
nutritionRoutes.get('/history', async (c) => {
  const userId = c.get('userId');
  const days = parseInt(c.req.query('days') || '7');

  const history = await db
    .select()
    .from(dailyNutrition)
    .where(eq(dailyNutrition.userId, userId))
    .orderBy(sql`${dailyNutrition.date} DESC`)
    .limit(days);

  return c.json(history);
});

async function updateDailyNutrition(userId: string, date: string): Promise<void> {
  // Aggregate all meals for the day
  const meals = await db
    .select()
    .from(mealLogs)
    .where(and(eq(mealLogs.userId, userId), eq(mealLogs.date, date)));

  const totals = meals.reduce(
    (acc, meal) => ({
      calories: acc.calories + meal.calories,
      protein: acc.protein + meal.protein,
      carbs: acc.carbs + meal.carbs,
      fat: acc.fat + meal.fat,
      count: acc.count + 1,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, count: 0 }
  );

  // Upsert daily summary
  await db
    .insert(dailyNutrition)
    .values({
      userId,
      date,
      totalCalories: totals.calories,
      totalProtein: totals.protein,
      totalCarbs: totals.carbs,
      totalFat: totals.fat,
      mealCount: totals.count,
    })
    .onConflictDoUpdate({
      target: [dailyNutrition.userId, dailyNutrition.date],
      set: {
        totalCalories: totals.calories,
        totalProtein: totals.protein,
        totalCarbs: totals.carbs,
        totalFat: totals.fat,
        mealCount: totals.count,
        updatedAt: new Date(),
      },
    });
}
```

### Nutrition Quest Evaluation

```typescript
// Add to server/src/services/quest-evaluator.service.ts

export async function evaluateNutritionQuests(
  userId: string,
  date: string
): Promise<QuestEvaluationResult> {
  const result: QuestEvaluationResult = { completed: [], progressed: [] };

  // Get daily nutrition totals
  const [daily] = await db
    .select()
    .from(dailyNutrition)
    .where(and(eq(dailyNutrition.userId, userId), eq(dailyNutrition.date, date)));

  if (!daily) return result;

  // Get nutrition-related quests
  const nutritionQuests = await db
    .select({ log: questLogs, template: questTemplates })
    .from(questLogs)
    .innerJoin(questTemplates, eq(questLogs.templateId, questTemplates.id))
    .where(and(
      eq(questLogs.userId, userId),
      eq(questLogs.dayDate, date),
      eq(questLogs.status, 'ACTIVE'),
      eq(questTemplates.category, 'NUTRITION')
    ));

  for (const { log, template } of nutritionQuests) {
    const requirements = template.requirements as any;
    let isComplete = false;
    let progress = log.progress as any;

    switch (requirements.metric) {
      case 'protein_grams':
        progress = { current: daily.totalProtein, target: requirements.value };
        isComplete = daily.totalProtein >= requirements.value;
        break;

      case 'calories_under':
        progress = { current: daily.totalCalories, target: requirements.value };
        isComplete = daily.totalCalories <= requirements.value;
        break;

      case 'calories_over':
        progress = { current: daily.totalCalories, target: requirements.value };
        isComplete = daily.totalCalories >= requirements.value;
        break;

      case 'meals_logged':
        progress = { current: daily.mealCount, target: requirements.value };
        isComplete = daily.mealCount >= requirements.value;
        break;
    }

    await db.update(questLogs).set({ progress }).where(eq(questLogs.id, log.id));
    result.progressed.push(log.id);

    if (isComplete) {
      await db.update(questLogs).set({
        status: 'COMPLETED',
        completedAt: new Date(),
        xpAwarded: template.baseXp,
      }).where(eq(questLogs.id, log.id));

      await awardXP(userId, {
        source: 'QUEST_COMPLETION',
        sourceId: log.id,
        baseXP: template.baseXp,
      });

      await incrementDailyCompletion(userId, date, template.isCore);
      result.completed.push(log.id);
    }
  }

  return result;
}
```

### Mobile Food Logging UI

```typescript
// mobile/src/screens/LogMealScreen.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import { SystemWindow } from '../components/SystemWindow';
import { api } from '../lib/api';

export function LogMealScreen() {
  const [photo, setPhoto] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const cameraRef = React.useRef<CameraView>(null);

  const takePhoto = async () => {
    if (!cameraRef.current) return;

    const photo = await cameraRef.current.takePictureAsync({
      quality: 0.8,
      base64: true,
    });

    setPhoto(photo.uri);
    analyzePhoto(photo);
  };

  const analyzePhoto = async (photo: any) => {
    setAnalyzing(true);

    try {
      const formData = new FormData();
      formData.append('image', {
        uri: photo.uri,
        type: 'image/jpeg',
        name: 'meal.jpg',
      } as any);
      formData.append('mealType', 'meal');

      const response = await api.nutrition.log(formData);
      setResult(response);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  if (result) {
    return (
      <SystemWindow title="NUTRITIONAL ANALYSIS">
        <Image source={{ uri: photo! }} style={styles.previewImage} />

        <View style={styles.macroGrid}>
          <MacroBox label="CALORIES" value={result.mealLog.calories} unit="kcal" color="var(--status-xp)" />
          <MacroBox label="PROTEIN" value={result.mealLog.protein} unit="g" color="var(--stat-str)" />
          <MacroBox label="CARBS" value={result.mealLog.carbs} unit="g" color="var(--stat-agi)" />
          <MacroBox label="FAT" value={result.mealLog.fat} unit="g" color="var(--stat-vit)" />
        </View>

        <View style={styles.foodList}>
          <Text style={styles.foodListTitle}>DETECTED ITEMS</Text>
          {result.mealLog.foods.map((food: any, idx: number) => (
            <Text key={idx} style={styles.foodItem}>
              • {food.name} ({Math.round(food.confidence * 100)}%)
            </Text>
          ))}
        </View>

        {result.questsCompleted.length > 0 && (
          <View style={styles.questAlert}>
            <Text style={styles.questAlertText}>
              QUEST COMPLETED: +{result.questsCompleted.length}
            </Text>
          </View>
        )}

        <TouchableOpacity style={styles.button} onPress={() => setResult(null)}>
          <Text style={styles.buttonText}>LOG ANOTHER</Text>
        </TouchableOpacity>
      </SystemWindow>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing="back">
        <View style={styles.overlay}>
          <Text style={styles.instruction}>
            {analyzing ? 'ANALYZING...' : 'CAPTURE YOUR MEAL'}
          </Text>

          {analyzing ? (
            <ActivityIndicator size="large" color="#0ea5e9" />
          ) : (
            <TouchableOpacity style={styles.captureButton} onPress={takePhoto}>
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>
          )}
        </View>
      </CameraView>
    </View>
  );
}

function MacroBox({ label, value, unit, color }: { label: string; value: number; unit: string; color: string }) {
  return (
    <View style={[styles.macroBox, { borderColor: color }]}>
      <Text style={styles.macroLabel}>{label}</Text>
      <Text style={[styles.macroValue, { color }]}>{Math.round(value)}</Text>
      <Text style={styles.macroUnit}>{unit}</Text>
    </View>
  );
}
```

### Example Nutrition Quests

```typescript
const nutritionQuestTemplates = [
  {
    name: 'Protein Target',
    description: 'Consume 150g of protein today',
    type: 'DAILY',
    category: 'NUTRITION',
    requirements: { metric: 'protein_grams', operator: 'gte', value: 150 },
    baseXp: 75,
    statAffected: 'STR',
    isCore: true,
  },
  {
    name: 'Caloric Discipline',
    description: 'Stay under 2200 calories',
    type: 'DAILY',
    category: 'NUTRITION',
    requirements: { metric: 'calories_under', operator: 'lte', value: 2200 },
    baseXp: 50,
    statAffected: 'DISC',
    isCore: false,
  },
  {
    name: 'Meal Logger',
    description: 'Log at least 3 meals today',
    type: 'DAILY',
    category: 'NUTRITION',
    requirements: { metric: 'meals_logged', operator: 'gte', value: 3 },
    baseXp: 25,
    statAffected: 'DISC',
    isCore: false,
  },
  {
    name: 'Clean Eating',
    description: 'Keep sugar under 50g today',
    type: 'DAILY',
    category: 'NUTRITION',
    requirements: { metric: 'sugar_under', operator: 'lte', value: 50 },
    baseXp: 50,
    statAffected: 'VIT',
    isCore: false,
  },
];
```

### Nutrition in HealthKit (Optional Sync)

If the user also logs nutrition in Apple Health (via other apps), we can pull that data too:

```typescript
// mobile/src/health/healthkit.ts - add to existing

export async function getTodayDietaryProtein(): Promise<number> {
  const options: HealthInputOptions = {
    date: new Date().toISOString(),
  };

  return new Promise((resolve) => {
    AppleHealthKit.getDietaryProtein(options, (error, results) => {
      if (error) {
        resolve(0);
      } else {
        resolve(results.value);
      }
    });
  });
}

export async function getTodayDietaryCalories(): Promise<number> {
  const options: HealthInputOptions = {
    date: new Date().toISOString(),
  };

  return new Promise((resolve) => {
    AppleHealthKit.getDietaryEnergyConsumed(options, (error, results) => {
      if (error) {
        resolve(0);
      } else {
        resolve(results.value);
      }
    });
  });
}
```

---

## 12. Hono Server Setup

### Project Structure

```
server/
├── src/
│   ├── index.ts              # Entry point
│   ├── app.ts                # Hono app configuration
│   ├── routes/
│   │   ├── index.ts          # Route aggregator
│   │   ├── auth.ts           # Better Auth routes
│   │   ├── player.ts
│   │   ├── quests.ts
│   │   ├── xp.ts
│   │   ├── boss.ts
│   │   ├── dungeon.ts
│   │   ├── season.ts
│   │   └── content.ts
│   ├── middleware/
│   │   ├── auth.ts           # Auth middleware
│   │   └── error.ts          # Error handler
│   ├── services/
│   │   ├── xp/
│   │   ├── streak.service.ts
│   │   ├── narrative.service.ts
│   │   └── sanity.service.ts
│   ├── mastra/
│   │   ├── index.ts
│   │   ├── agents/
│   │   └── tools/
│   └── db.ts                 # Drizzle client
├── package.json
└── tsconfig.json
```

### Hono App Configuration

```typescript
// server/src/app.ts
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import { auth } from './auth';
import { playerRoutes } from './routes/player';
import { questRoutes } from './routes/quests';
import { xpRoutes } from './routes/xp';
import { bossRoutes } from './routes/boss';
import { dungeonRoutes } from './routes/dungeon';
import { seasonRoutes } from './routes/season';
import { contentRoutes } from './routes/content';

const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', secureHeaders());
app.use('*', cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// Better Auth handler
app.on(['POST', 'GET'], '/api/auth/**', (c) => auth.handler(c.req.raw));

// API Routes
app.route('/api/player', playerRoutes);
app.route('/api/quests', questRoutes);
app.route('/api/xp', xpRoutes);
app.route('/api/bosses', bossRoutes);
app.route('/api/dungeons', dungeonRoutes);
app.route('/api/seasons', seasonRoutes);
app.route('/api/content', contentRoutes);

// Health check
app.get('/health', (c) => c.json({ status: 'ok' }));

export default app;
```

### Entry Point

```typescript
// server/src/index.ts
import { serve } from '@hono/node-server';
import app from './app';

const port = Number(process.env.PORT) || 3001;

console.log(`Server starting on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
```

### Better Auth with Hono

```typescript
// server/src/auth.ts
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from './db';
import * as schema from './db/schema';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24,     // 1 day
  },
});

export type Session = typeof auth.$Infer.Session;
```

### Auth Middleware for Hono

```typescript
// server/src/middleware/auth.ts
import { Context, Next } from 'hono';
import { auth, Session } from '../auth';

declare module 'hono' {
  interface ContextVariableMap {
    session: Session;
    userId: string;
  }
}

export async function requireAuth(c: Context, next: Next) {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  c.set('session', session);
  c.set('userId', session.user.id);

  await next();
}
```

### Example Route (Player)

```typescript
// server/src/routes/player.ts
import { Hono } from 'hono';
import { eq, isNull, and, count } from 'drizzle-orm';
import { requireAuth } from '../middleware/auth';
import { db } from '../db';
import { users, userTitles, titles, xpEvents, questLogs, bossAttempts } from '../db/schema';

export const playerRoutes = new Hono();

playerRoutes.use('*', requireAuth);

playerRoutes.get('/', async (c) => {
  const userId = c.get('userId');

  const [player] = await db
    .select({
      id: users.id,
      name: users.name,
      level: users.level,
      totalXP: users.totalXP,
      currentStreak: users.currentStreak,
      longestStreak: users.longestStreak,
      str: users.str,
      agi: users.agi,
      vit: users.vit,
      disc: users.disc,
      debuffActiveUntil: users.debuffActiveUntil,
    })
    .from(users)
    .where(eq(users.id, userId));

  if (!player) {
    return c.json({ error: 'Player not found' }, 404);
  }

  return c.json({
    ...player,
    totalXP: Number(player.totalXP),
    debuffActive: player.debuffActiveUntil
      ? new Date() < player.debuffActiveUntil
      : false,
  });
});

playerRoutes.get('/stats', async (c) => {
  const userId = c.get('userId');

  const [player] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId));

  const playerTitles = await db
    .select({
      userTitle: userTitles,
      title: titles,
    })
    .from(userTitles)
    .innerJoin(titles, eq(userTitles.titleId, titles.id))
    .where(and(
      eq(userTitles.userId, userId),
      isNull(userTitles.revokedAt)
    ));

  const [xpCount] = await db
    .select({ count: count() })
    .from(xpEvents)
    .where(eq(xpEvents.userId, userId));

  const [questCount] = await db
    .select({ count: count() })
    .from(questLogs)
    .where(and(eq(questLogs.userId, userId), eq(questLogs.status, 'COMPLETED')));

  const [bossCount] = await db
    .select({ count: count() })
    .from(bossAttempts)
    .where(and(eq(bossAttempts.userId, userId), eq(bossAttempts.status, 'VICTORY')));

  return c.json({
    ...player,
    titles: playerTitles,
    _count: {
      xpEvents: xpCount?.count ?? 0,
      questLogs: questCount?.count ?? 0,
      bossAttempts: bossCount?.count ?? 0,
    },
  });
});
```

---

## 11. Sanity.io CMS Integration

### Sanity Schema

```typescript
// sanity/schemas/narrativeContent.ts
export default {
  name: 'narrativeContent',
  title: 'Narrative Content',
  type: 'document',
  fields: [
    {
      name: 'key',
      title: 'Content Key',
      type: 'string',
      description: 'Unique identifier (e.g., onboarding.detection)',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          'onboarding',
          'system_message',
          'daily_quest',
          'debuff',
          'dungeon',
          'boss',
          'title',
          'season',
          'level_up',
          'daily_reminder',
        ],
      },
    },
    {
      name: 'content',
      title: 'Content',
      type: 'text',
      rows: 10,
    },
    {
      name: 'variables',
      title: 'Available Variables',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Variables that can be interpolated (e.g., {{playerName}})',
    },
    {
      name: 'isActive',
      title: 'Active',
      type: 'boolean',
      initialValue: true,
    },
  ],
};
```

```typescript
// sanity/schemas/boss.ts
export default {
  name: 'boss',
  title: 'Boss',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'name' },
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
    },
    {
      name: 'introMonologue',
      title: 'Intro Monologue',
      type: 'text',
      rows: 8,
      description: 'The cold, narrative text shown when encountering this boss',
    },
    {
      name: 'defeatMessage',
      title: 'Defeat Message',
      type: 'text',
    },
    {
      name: 'difficulty',
      title: 'Difficulty',
      type: 'string',
      options: {
        list: ['NORMAL', 'HARD', 'NIGHTMARE'],
      },
    },
    {
      name: 'requiredLevel',
      title: 'Required Level',
      type: 'number',
    },
    {
      name: 'xpReward',
      title: 'XP Reward',
      type: 'number',
    },
    {
      name: 'phases',
      title: 'Phases',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'phaseNumber', type: 'number', title: 'Phase Number' },
            { name: 'name', type: 'string', title: 'Phase Name' },
            { name: 'description', type: 'text', title: 'Description' },
            { name: 'durationDays', type: 'number', title: 'Duration (Days)' },
            { name: 'requirements', type: 'text', title: 'Requirements (JSON)' },
          ],
        },
      ],
    },
  ],
};
```

```typescript
// sanity/schemas/title.ts
export default {
  name: 'title',
  title: 'Title',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
      description: 'Narrative description of what this title means',
    },
    {
      name: 'systemMessage',
      title: 'System Message',
      type: 'text',
      description: 'The cold observation when title is earned',
    },
    {
      name: 'conditionType',
      title: 'Condition Type',
      type: 'string',
      options: {
        list: [
          'STREAK_DAYS',
          'CUMULATIVE_COUNT',
          'TIME_WINDOW',
          'EVENT_COUNT',
          'COMPOUND',
          'SPECIAL',
        ],
      },
    },
    {
      name: 'conditionConfig',
      title: 'Condition Config (JSON)',
      type: 'text',
    },
    {
      name: 'passiveType',
      title: 'Passive Type',
      type: 'string',
      options: {
        list: [
          'FLAT_XP_BONUS',
          'PERCENT_XP_BONUS',
          'STAT_BONUS',
          'DEBUFF_REDUCTION',
        ],
      },
    },
    {
      name: 'passiveValue',
      title: 'Passive Value',
      type: 'number',
    },
    {
      name: 'rarity',
      title: 'Rarity',
      type: 'string',
      options: {
        list: ['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY'],
      },
    },
  ],
};
```

### Sanity Service

```typescript
// server/src/services/sanity.service.ts
import { createClient } from '@sanity/client';

const sanityClient = createClient({
  projectId: process.env.SANITY_PROJECT_ID!,
  dataset: process.env.SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: process.env.NODE_ENV === 'production',
  token: process.env.SANITY_TOKEN, // Optional, for mutations
});

export class SanityService {
  // Narrative Content
  async getContent(key: string): Promise<string | null> {
    const result = await sanityClient.fetch(
      `*[_type == "narrativeContent" && key == $key && isActive == true][0].content`,
      { key }
    );
    return result;
  }

  async getContentByCategory(category: string): Promise<Record<string, string>> {
    const results = await sanityClient.fetch(
      `*[_type == "narrativeContent" && category == $category && isActive == true]{
        key,
        content
      }`,
      { category }
    );
    return Object.fromEntries(results.map((r: any) => [r.key, r.content]));
  }

  // Bosses
  async getBosses() {
    return sanityClient.fetch(`*[_type == "boss"]{
      name,
      "slug": slug.current,
      description,
      introMonologue,
      defeatMessage,
      difficulty,
      requiredLevel,
      xpReward,
      phases
    }`);
  }

  async getBoss(slug: string) {
    return sanityClient.fetch(
      `*[_type == "boss" && slug.current == $slug][0]{
        name,
        "slug": slug.current,
        description,
        introMonologue,
        defeatMessage,
        difficulty,
        requiredLevel,
        xpReward,
        phases
      }`,
      { slug }
    );
  }

  // Titles
  async getTitles() {
    return sanityClient.fetch(`*[_type == "title"]{
      name,
      description,
      systemMessage,
      conditionType,
      conditionConfig,
      passiveType,
      passiveValue,
      rarity
    }`);
  }

  // Interpolate variables
  interpolate(content: string, variables: Record<string, string>): string {
    let result = content;
    for (const [key, value] of Object.entries(variables)) {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
    return result;
  }
}

export const sanityService = new SanityService();
```

### Content Route with Sanity

```typescript
// server/src/routes/content.ts
import { Hono } from 'hono';
import { sanityService } from '../services/sanity.service';

export const contentRoutes = new Hono();

contentRoutes.get('/:key', async (c) => {
  const key = c.req.param('key');
  const content = await sanityService.getContent(key);

  if (!content) {
    return c.json({ error: 'Content not found' }, 404);
  }

  return c.json({ key, content });
});

contentRoutes.get('/category/:category', async (c) => {
  const category = c.req.param('category');
  const content = await sanityService.getContentByCategory(category);

  return c.json(content);
});

contentRoutes.get('/bosses', async (c) => {
  const bosses = await sanityService.getBosses();
  return c.json(bosses);
});

contentRoutes.get('/bosses/:slug', async (c) => {
  const slug = c.req.param('slug');
  const boss = await sanityService.getBoss(slug);

  if (!boss) {
    return c.json({ error: 'Boss not found' }, 404);
  }

  return c.json(boss);
});

contentRoutes.get('/titles', async (c) => {
  const titles = await sanityService.getTitles();
  return c.json(titles);
});
```

### Frontend Hook for Sanity Content

```typescript
// src/hooks/useNarrative.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useNarrativeContent(key: string) {
  return useQuery({
    queryKey: ['content', key],
    queryFn: () => api.content.get(key),
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

export function useNarrativeCategory(category: string) {
  return useQuery({
    queryKey: ['content', 'category', category],
    queryFn: () => api.content.getByCategory(category),
    staleTime: 1000 * 60 * 30,
  });
}

export function useBossContent(slug: string) {
  return useQuery({
    queryKey: ['content', 'boss', slug],
    queryFn: () => api.content.getBoss(slug),
  });
}
```

### Environment Variables (Updated)

```env
# Sanity
SANITY_PROJECT_ID=your-project-id
SANITY_DATASET=production
SANITY_TOKEN=your-token  # Optional, for mutations
```

---

## 12. API Routes

### Authentication (Better Auth)

```
POST   /api/auth/sign-up/email    # Email signup
POST   /api/auth/sign-in/email    # Email login
GET    /api/auth/sign-in/social   # OAuth redirect
POST   /api/auth/sign-out         # Logout
GET    /api/auth/session          # Get current session
```

### Player

```
GET    /api/player                # Get player stats
GET    /api/player/stats          # Detailed stats breakdown
GET    /api/player/streak         # Streak information
GET    /api/player/titles         # Earned titles
PUT    /api/player/title/active   # Set active title
```

### Quests

```
GET    /api/quests                # Today's quests
GET    /api/quests/:id            # Quest details
POST   /api/quests/:id/complete   # Submit completion
GET    /api/quests/history        # Quest history
```

### XP

```
GET    /api/xp/timeline           # XP event timeline
GET    /api/xp/:eventId/breakdown # Detailed breakdown
GET    /api/xp/level-progress     # Progress to next level
```

### Boss

```
GET    /api/bosses                # Available bosses
GET    /api/bosses/:id            # Boss details
POST   /api/bosses/:id/start      # Start attempt
GET    /api/bosses/:id/attempt    # Current attempt status
POST   /api/bosses/:id/abandon    # Abandon attempt
```

### Dungeon

```
GET    /api/dungeons              # Available dungeons
GET    /api/dungeons/:id          # Dungeon details
POST   /api/dungeons/:id/enter    # Start attempt
POST   /api/dungeons/:id/progress # Submit progress
```

### Season

```
GET    /api/seasons/current       # Current season
GET    /api/seasons/:id/leaderboard # Season leaderboard
GET    /api/seasons/history       # Past seasons
```

### Content

```
GET    /api/content/:key          # Get narrative content
GET    /api/content/category/:cat # Get by category
```

---

## 11. Frontend Structure (Vite + React)

```
src/
├── main.tsx
├── App.tsx
├── routes/
│   ├── index.tsx
│   ├── dashboard.tsx
│   ├── quests.tsx
│   ├── profile.tsx
│   ├── boss/[id].tsx
│   ├── dungeon/[id].tsx
│   ├── season.tsx
│   └── auth/
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx
│   │   ├── SystemWindow.tsx    # Core UI aesthetic
│   │   └── Navbar.tsx
│   ├── player/
│   │   ├── StatBlock.tsx
│   │   ├── XPBar.tsx
│   │   ├── LevelBadge.tsx
│   │   └── StreakFire.tsx
│   ├── quests/
│   │   ├── QuestCard.tsx
│   │   ├── QuestList.tsx
│   │   └── QuestInput.tsx
│   ├── boss/
│   │   ├── BossArena.tsx
│   │   ├── PhaseProgress.tsx
│   │   └── BossMonologue.tsx
│   ├── narrative/
│   │   ├── SystemMessage.tsx
│   │   └── TypewriterText.tsx
│   └── xp/
│       ├── XPTimeline.tsx
│       └── LevelUpModal.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── usePlayer.ts
│   ├── useQuests.ts
│   └── useNarrative.ts
├── stores/
│   ├── authStore.ts
│   └── uiStore.ts
├── lib/
│   ├── api.ts
│   ├── auth.ts
│   └── queryClient.ts
└── styles/
    ├── globals.css
    └── system-window.css
```

### System Window Aesthetic

```css
/* src/styles/system-window.css */

:root {
  --system-bg: #0a0a0f;
  --system-border: #1a1a2e;
  --system-text: #e4e4e7;
  --system-muted: #71717a;
  --system-accent: #3b82f6;
  --system-glow: rgba(59, 130, 246, 0.3);
  --system-danger: #ef4444;
  --system-success: #22c55e;
}

.system-window {
  background: var(--system-bg);
  border: 1px solid var(--system-border);
  box-shadow: 0 0 20px var(--system-glow);
  font-family: 'JetBrains Mono', monospace;
}

.system-text {
  color: var(--system-text);
  line-height: 1.8;
  letter-spacing: 0.02em;
}

.system-header {
  border-bottom: 1px solid var(--system-border);
  padding: 1rem;
  text-transform: uppercase;
  font-size: 0.75rem;
  color: var(--system-muted);
}

.stat-glow {
  text-shadow: 0 0 10px currentColor;
}
```

---

## 12. Cron Jobs

| Job | Schedule | Purpose |
|-----|----------|---------|
| `evaluateDailyLogs` | 4:00 AM UTC | Mark previous day as evaluated |
| `computeStreaks` | 4:05 AM UTC | Update streak counts |
| `checkDebuffs` | 4:10 AM UTC | Apply/clear debuffs |
| `reconcileXP` | 4:30 AM UTC | Verify XP totals match ledger |
| `updateLeaderboard` | Every hour | Refresh season rankings |
| `evaluateTitles` | 5:00 AM UTC | Check for new title unlocks |

---

## 13. Migration Plan

### MVP (Phase 1)
- [ ] User authentication (Better Auth)
- [ ] Basic player stats
- [ ] Daily quest system (5 core quests)
- [ ] XP ledger
- [ ] Level progression
- [ ] Basic streak tracking
- [ ] System window UI

### V1 (Phase 2)
- [ ] Debuff system
- [ ] Title/passive system
- [ ] Weekly quests
- [ ] XP breakdown/timeline
- [ ] Mastra agent integration

### V2 (Phase 3)
- [ ] Boss fights
- [ ] Dungeons
- [ ] Season system
- [ ] Leaderboards
- [ ] Full narrative content

---

## 16. Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/solo

# Better Auth
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=http://localhost:3001
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Mastra
OPENAI_API_KEY=your-openai-key

# Sanity CMS
SANITY_PROJECT_ID=your-project-id
SANITY_DATASET=production
SANITY_TOKEN=your-token

# App
VITE_API_URL=http://localhost:3001
FRONTEND_URL=http://localhost:5173
PORT=3001
NODE_ENV=development
```

---

## 14. Frontend Design Vision — Solo Leveling Aesthetic

### Design Philosophy

The UI embodies the **cold, observational System** from Solo Leveling. It does not encourage. It does not celebrate. It **records**. The interface feels like accessing a hidden layer of reality — holographic windows floating in darkness, stats rendered in stark blue light, progress measured with clinical precision.

**Core Principles:**
1. **The System is indifferent** — UI feels alien, detached, almost unsettling
2. **Information density** — RPG-style stat blocks, no wasted space
3. **Darkness as canvas** — Deep blacks punctuated by glowing elements
4. **Earned presence** — UI elements appear with weight and purpose
5. **Holographic materiality** — Translucent panels, subtle depth, floating in space

---

### Color Palette

```css
:root {
  /* === VOID (Background Layers) === */
  --void-pure: #000000;           /* True black - deepest background */
  --void-deep: #030308;           /* Primary app background */
  --void-surface: #0a0a12;        /* Card/panel backgrounds */
  --void-elevated: #12121c;       /* Elevated surfaces, modals */

  /* === SYSTEM BLUE (Primary) === */
  --system-blue-100: #e0f2fe;     /* Lightest - highlights */
  --system-blue-200: #7dd3fc;     /* Light - secondary text */
  --system-blue-300: #38bdf8;     /* Medium - primary accent */
  --system-blue-400: #0ea5e9;     /* Core system color */
  --system-blue-500: #0284c7;     /* Darker accent */
  --system-glow: rgba(14, 165, 233, 0.4);  /* Glow effect */
  --system-glow-intense: rgba(56, 189, 248, 0.6);

  /* === SHADOW PURPLE (Secondary) === */
  --shadow-purple-100: #f3e8ff;
  --shadow-purple-200: #c4b5fd;
  --shadow-purple-300: #a78bfa;   /* Dungeon/boss accent */
  --shadow-purple-400: #8b5cf6;   /* Rare/epic items */
  --shadow-purple-500: #7c3aed;
  --shadow-glow: rgba(139, 92, 246, 0.4);

  /* === STATUS COLORS === */
  --status-hp: #ef4444;           /* Health/danger */
  --status-hp-glow: rgba(239, 68, 68, 0.4);
  --status-xp: #fbbf24;           /* Experience/progress */
  --status-xp-glow: rgba(251, 191, 36, 0.4);
  --status-success: #22c55e;      /* Completion/victory */
  --status-success-glow: rgba(34, 197, 94, 0.4);

  /* === STAT COLORS === */
  --stat-str: #f97316;            /* Strength - orange fire */
  --stat-agi: #06b6d4;            /* Agility - cyan wind */
  --stat-vit: #22c55e;            /* Vitality - green life */
  --stat-disc: #eab308;           /* Discipline - gold resolve */

  /* === RARITY COLORS === */
  --rarity-common: #9ca3af;       /* Gray */
  --rarity-uncommon: #22c55e;     /* Green */
  --rarity-rare: #3b82f6;         /* Blue */
  --rarity-epic: #a855f7;         /* Purple */
  --rarity-legendary: #f59e0b;    /* Orange/Gold */

  /* === TEXT === */
  --text-primary: #f4f4f5;        /* Primary text */
  --text-secondary: #a1a1aa;      /* Secondary text */
  --text-muted: #52525b;          /* Disabled/hint text */
  --text-system: var(--system-blue-300); /* System messages */

  /* === BORDERS & LINES === */
  --border-subtle: rgba(255, 255, 255, 0.06);
  --border-default: rgba(255, 255, 255, 0.1);
  --border-strong: rgba(255, 255, 255, 0.15);
  --border-glow: var(--system-blue-400);
}
```

---

### Typography

```css
/* === FONT STACK === */
:root {
  /* Primary: Monospace for that terminal/system feel */
  --font-system: 'JetBrains Mono', 'Fira Code', 'SF Mono', monospace;

  /* Headers: Sharp, condensed for impact */
  --font-display: 'Rajdhani', 'Orbitron', 'Share Tech', sans-serif;

  /* Numeric: Tabular figures for stats */
  --font-numeric: 'JetBrains Mono', monospace;
  font-feature-settings: 'tnum' on, 'lnum' on;
}

/* === TYPE SCALE === */
.text-system-xs    { font-size: 0.625rem; line-height: 1; letter-spacing: 0.1em; }     /* 10px - labels */
.text-system-sm    { font-size: 0.75rem;  line-height: 1.4; letter-spacing: 0.05em; }  /* 12px - captions */
.text-system-base  { font-size: 0.875rem; line-height: 1.6; letter-spacing: 0.02em; }  /* 14px - body */
.text-system-lg    { font-size: 1rem;     line-height: 1.5; letter-spacing: 0.01em; }  /* 16px - emphasis */
.text-system-xl    { font-size: 1.25rem;  line-height: 1.4; }                          /* 20px - subheads */
.text-system-2xl   { font-size: 1.5rem;   line-height: 1.3; }                          /* 24px - section heads */
.text-system-3xl   { font-size: 2rem;     line-height: 1.2; }                          /* 32px - page titles */
.text-system-stat  { font-size: 2.5rem;   line-height: 1; font-weight: 700; }          /* 40px - big numbers */

/* === SPECIAL TEXT STYLES === */
.text-system-mono {
  font-family: var(--font-system);
  text-transform: uppercase;
  letter-spacing: 0.15em;
}

.text-system-glow {
  color: var(--system-blue-300);
  text-shadow:
    0 0 10px var(--system-glow),
    0 0 20px var(--system-glow),
    0 0 40px var(--system-glow);
}

.text-system-fade {
  background: linear-gradient(180deg, var(--text-primary) 0%, var(--text-muted) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

---

### Core Components

#### System Window (Primary Container)

The foundational UI element — a floating holographic panel that contains all interface content.

```tsx
// src/components/ui/SystemWindow.tsx
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface SystemWindowProps {
  title?: string;
  subtitle?: string;
  variant?: 'default' | 'danger' | 'success' | 'boss';
  glow?: boolean;
  children: ReactNode;
}

export function SystemWindow({
  title,
  subtitle,
  variant = 'default',
  glow = true,
  children
}: SystemWindowProps) {
  const glowColor = {
    default: 'var(--system-glow)',
    danger: 'var(--status-hp-glow)',
    success: 'var(--status-success-glow)',
    boss: 'var(--shadow-glow)',
  }[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="system-window"
      style={{
        '--window-glow': glowColor,
      } as React.CSSProperties}
    >
      {/* Holographic edge effects */}
      <div className="window-edge window-edge-top" />
      <div className="window-edge window-edge-left" />

      {/* Header */}
      {title && (
        <div className="window-header">
          <div className="window-header-line" />
          <span className="window-title">{title}</span>
          {subtitle && <span className="window-subtitle">{subtitle}</span>}
          <div className="window-header-line" />
        </div>
      )}

      {/* Content */}
      <div className="window-content">
        {children}
      </div>

      {/* Corner decorations */}
      <div className="window-corner window-corner-tl" />
      <div className="window-corner window-corner-tr" />
      <div className="window-corner window-corner-bl" />
      <div className="window-corner window-corner-br" />
    </motion.div>
  );
}
```

```css
/* System Window Styles */
.system-window {
  position: relative;
  background: linear-gradient(
    180deg,
    rgba(10, 10, 18, 0.95) 0%,
    rgba(10, 10, 18, 0.85) 100%
  );
  border: 1px solid var(--border-default);
  border-radius: 4px;
  backdrop-filter: blur(20px);
  box-shadow:
    0 0 40px -10px var(--window-glow),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.window-edge {
  position: absolute;
  background: linear-gradient(
    90deg,
    transparent 0%,
    var(--system-blue-400) 50%,
    transparent 100%
  );
  opacity: 0.6;
}

.window-edge-top {
  top: 0;
  left: 10%;
  right: 10%;
  height: 1px;
}

.window-edge-left {
  top: 10%;
  bottom: 10%;
  left: 0;
  width: 1px;
  background: linear-gradient(
    180deg,
    transparent 0%,
    var(--system-blue-400) 50%,
    transparent 100%
  );
}

.window-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-subtle);
}

.window-header-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(
    90deg,
    var(--border-default) 0%,
    transparent 100%
  );
}

.window-header-line:last-child {
  background: linear-gradient(
    90deg,
    transparent 0%,
    var(--border-default) 100%
  );
}

.window-title {
  font-family: var(--font-system);
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: var(--text-secondary);
}

.window-content {
  padding: 1.5rem;
}

/* Corner decorations */
.window-corner {
  position: absolute;
  width: 12px;
  height: 12px;
  border-color: var(--system-blue-400);
  border-style: solid;
  opacity: 0.5;
}

.window-corner-tl { top: -1px; left: -1px; border-width: 2px 0 0 2px; }
.window-corner-tr { top: -1px; right: -1px; border-width: 2px 2px 0 0; }
.window-corner-bl { bottom: -1px; left: -1px; border-width: 0 0 2px 2px; }
.window-corner-br { bottom: -1px; right: -1px; border-width: 0 2px 2px 0; }
```

---

#### Stat Block Component

Displays player stats with the iconic RPG stat window aesthetic.

```tsx
// src/components/player/StatBlock.tsx
import { motion } from 'framer-motion';

interface StatBlockProps {
  stats: {
    str: number;
    agi: number;
    vit: number;
    disc: number;
  };
  level: number;
  className?: string;
}

export function StatBlock({ stats, level, className }: StatBlockProps) {
  const statConfig = [
    { key: 'str', label: 'STR', color: 'var(--stat-str)', icon: '⚔️' },
    { key: 'agi', label: 'AGI', color: 'var(--stat-agi)', icon: '💨' },
    { key: 'vit', label: 'VIT', color: 'var(--stat-vit)', icon: '❤️' },
    { key: 'disc', label: 'DISC', color: 'var(--stat-disc)', icon: '🎯' },
  ];

  return (
    <div className={`stat-block ${className}`}>
      <div className="stat-block-header">
        <span className="stat-label">STATUS</span>
        <span className="stat-level">LV. {level}</span>
      </div>

      <div className="stat-grid">
        {statConfig.map(({ key, label, color }, index) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="stat-row"
          >
            <span className="stat-name" style={{ color }}>{label}</span>
            <div className="stat-bar-container">
              <motion.div
                className="stat-bar"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(stats[key as keyof typeof stats], 100)}%` }}
                transition={{ delay: 0.3 + index * 0.1, duration: 0.8 }}
                style={{ backgroundColor: color }}
              />
            </div>
            <span className="stat-value" style={{ color }}>
              {stats[key as keyof typeof stats]}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
```

```css
.stat-block {
  padding: 1rem;
}

.stat-block-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-subtle);
}

.stat-label {
  font-family: var(--font-system);
  font-size: 0.625rem;
  letter-spacing: 0.2em;
  color: var(--text-muted);
}

.stat-level {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--system-blue-300);
  text-shadow: 0 0 20px var(--system-glow);
}

.stat-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.stat-row {
  display: grid;
  grid-template-columns: 48px 1fr 48px;
  align-items: center;
  gap: 0.75rem;
}

.stat-name {
  font-family: var(--font-system);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.1em;
}

.stat-bar-container {
  height: 4px;
  background: var(--void-pure);
  border-radius: 2px;
  overflow: hidden;
}

.stat-bar {
  height: 100%;
  border-radius: 2px;
  box-shadow: 0 0 10px currentColor;
}

.stat-value {
  font-family: var(--font-numeric);
  font-size: 0.875rem;
  font-weight: 700;
  text-align: right;
  text-shadow: 0 0 10px currentColor;
}
```

---

#### XP Progress Bar

```tsx
// src/components/player/XPBar.tsx
import { motion } from 'framer-motion';

interface XPBarProps {
  current: number;
  required: number;
  level: number;
}

export function XPBar({ current, required, level }: XPBarProps) {
  const progress = (current / required) * 100;

  return (
    <div className="xp-bar-container">
      <div className="xp-bar-header">
        <span className="xp-label">EXPERIENCE</span>
        <span className="xp-values">
          <span className="xp-current">{current.toLocaleString()}</span>
          <span className="xp-separator">/</span>
          <span className="xp-required">{required.toLocaleString()}</span>
        </span>
      </div>

      <div className="xp-bar-track">
        {/* Animated fill */}
        <motion.div
          className="xp-bar-fill"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />

        {/* Shimmer effect */}
        <motion.div
          className="xp-bar-shimmer"
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
        />

        {/* Level markers */}
        <div className="xp-bar-markers">
          {[25, 50, 75].map((mark) => (
            <div key={mark} className="xp-marker" style={{ left: `${mark}%` }} />
          ))}
        </div>
      </div>

      <div className="xp-bar-footer">
        <span className="xp-level-current">LV {level}</span>
        <span className="xp-level-next">LV {level + 1}</span>
      </div>
    </div>
  );
}
```

```css
.xp-bar-container {
  padding: 1rem;
}

.xp-bar-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 0.5rem;
}

.xp-label {
  font-family: var(--font-system);
  font-size: 0.625rem;
  letter-spacing: 0.2em;
  color: var(--text-muted);
}

.xp-values {
  font-family: var(--font-numeric);
  font-size: 0.875rem;
}

.xp-current {
  color: var(--status-xp);
  font-weight: 600;
}

.xp-separator {
  color: var(--text-muted);
  margin: 0 0.25rem;
}

.xp-required {
  color: var(--text-secondary);
}

.xp-bar-track {
  position: relative;
  height: 8px;
  background: var(--void-pure);
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid var(--border-subtle);
}

.xp-bar-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: linear-gradient(
    90deg,
    var(--status-xp) 0%,
    #fcd34d 100%
  );
  border-radius: 4px;
  box-shadow:
    0 0 10px var(--status-xp-glow),
    0 0 20px var(--status-xp-glow);
}

.xp-bar-shimmer {
  position: absolute;
  top: 0;
  left: 0;
  width: 50%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.3) 50%,
    transparent 100%
  );
}

.xp-bar-markers {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.xp-marker {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 1px;
  background: var(--border-default);
}

.xp-bar-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 0.25rem;
  font-family: var(--font-system);
  font-size: 0.625rem;
  color: var(--text-muted);
}
```

---

#### Quest Card

```tsx
// src/components/quests/QuestCard.tsx
import { motion } from 'framer-motion';
import { Check, Circle, Clock } from 'lucide-react';

interface QuestCardProps {
  quest: {
    id: string;
    name: string;
    description: string;
    category: 'MOVEMENT' | 'STRENGTH' | 'RECOVERY' | 'NUTRITION' | 'DISCIPLINE';
    xp: number;
    isCore: boolean;
    status: 'pending' | 'completed' | 'failed';
    progress?: { current: number; target: number };
  };
  onComplete?: () => void;
}

const categoryConfig = {
  MOVEMENT: { color: 'var(--stat-agi)', icon: '🚶' },
  STRENGTH: { color: 'var(--stat-str)', icon: '💪' },
  RECOVERY: { color: 'var(--stat-vit)', icon: '😴' },
  NUTRITION: { color: 'var(--stat-vit)', icon: '🥗' },
  DISCIPLINE: { color: 'var(--stat-disc)', icon: '⚡' },
};

export function QuestCard({ quest, onComplete }: QuestCardProps) {
  const config = categoryConfig[quest.category];
  const isCompleted = quest.status === 'completed';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`quest-card ${isCompleted ? 'quest-card-completed' : ''}`}
      style={{ '--quest-color': config.color } as React.CSSProperties}
    >
      {/* Category indicator */}
      <div className="quest-category-bar" />

      <div className="quest-content">
        <div className="quest-header">
          <div className="quest-icon">{config.icon}</div>
          <div className="quest-info">
            <h3 className="quest-name">{quest.name}</h3>
            <p className="quest-description">{quest.description}</p>
          </div>
          <div className="quest-xp">
            <span className="quest-xp-value">+{quest.xp}</span>
            <span className="quest-xp-label">XP</span>
          </div>
        </div>

        {/* Progress bar if applicable */}
        {quest.progress && (
          <div className="quest-progress">
            <div className="quest-progress-track">
              <motion.div
                className="quest-progress-fill"
                initial={{ width: 0 }}
                animate={{ width: `${(quest.progress.current / quest.progress.target) * 100}%` }}
              />
            </div>
            <span className="quest-progress-text">
              {quest.progress.current} / {quest.progress.target}
            </span>
          </div>
        )}

        {/* Action button */}
        <button
          className="quest-action"
          onClick={onComplete}
          disabled={isCompleted}
        >
          {isCompleted ? (
            <>
              <Check size={16} />
              <span>COMPLETED</span>
            </>
          ) : (
            <>
              <Circle size={16} />
              <span>MARK COMPLETE</span>
            </>
          )}
        </button>
      </div>

      {/* Core quest indicator */}
      {quest.isCore && (
        <div className="quest-core-badge">CORE</div>
      )}
    </motion.div>
  );
}
```

```css
.quest-card {
  position: relative;
  background: var(--void-surface);
  border: 1px solid var(--border-default);
  border-radius: 4px;
  overflow: hidden;
  transition: all 0.2s ease;
}

.quest-card:hover {
  border-color: var(--quest-color);
  box-shadow: 0 0 20px -5px var(--quest-color);
}

.quest-card-completed {
  opacity: 0.6;
}

.quest-card-completed .quest-category-bar {
  background: var(--status-success);
}

.quest-category-bar {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--quest-color);
}

.quest-content {
  padding: 1rem 1rem 1rem 1.25rem;
}

.quest-header {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.quest-icon {
  font-size: 1.5rem;
  line-height: 1;
}

.quest-info {
  flex: 1;
  min-width: 0;
}

.quest-name {
  font-family: var(--font-system);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.25rem 0;
}

.quest-description {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin: 0;
}

.quest-xp {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.quest-xp-value {
  font-family: var(--font-numeric);
  font-size: 1rem;
  font-weight: 700;
  color: var(--status-xp);
}

.quest-xp-label {
  font-family: var(--font-system);
  font-size: 0.5rem;
  letter-spacing: 0.1em;
  color: var(--text-muted);
}

.quest-progress {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.75rem;
}

.quest-progress-track {
  flex: 1;
  height: 4px;
  background: var(--void-pure);
  border-radius: 2px;
  overflow: hidden;
}

.quest-progress-fill {
  height: 100%;
  background: var(--quest-color);
  border-radius: 2px;
}

.quest-progress-text {
  font-family: var(--font-numeric);
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.quest-action {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.5rem;
  margin-top: 0.75rem;
  background: transparent;
  border: 1px solid var(--border-default);
  border-radius: 4px;
  color: var(--text-secondary);
  font-family: var(--font-system);
  font-size: 0.625rem;
  letter-spacing: 0.1em;
  cursor: pointer;
  transition: all 0.2s ease;
}

.quest-action:hover:not(:disabled) {
  border-color: var(--system-blue-400);
  color: var(--system-blue-300);
  background: rgba(14, 165, 233, 0.1);
}

.quest-action:disabled {
  cursor: default;
  border-color: var(--status-success);
  color: var(--status-success);
}

.quest-core-badge {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  padding: 0.125rem 0.375rem;
  background: rgba(14, 165, 233, 0.2);
  border: 1px solid var(--system-blue-400);
  border-radius: 2px;
  font-family: var(--font-system);
  font-size: 0.5rem;
  letter-spacing: 0.1em;
  color: var(--system-blue-300);
}
```

---

#### System Message / Narrative Text

```tsx
// src/components/narrative/SystemMessage.tsx
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface SystemMessageProps {
  content: string;
  variant?: 'default' | 'danger' | 'boss' | 'achievement';
  typewriter?: boolean;
  speed?: number;
}

export function SystemMessage({
  content,
  variant = 'default',
  typewriter = true,
  speed = 30
}: SystemMessageProps) {
  const [displayedText, setDisplayedText] = useState(typewriter ? '' : content);

  useEffect(() => {
    if (!typewriter) return;

    let index = 0;
    const timer = setInterval(() => {
      setDisplayedText(content.slice(0, index));
      index++;
      if (index > content.length) clearInterval(timer);
    }, speed);

    return () => clearInterval(timer);
  }, [content, typewriter, speed]);

  const variantStyles = {
    default: 'system-message-default',
    danger: 'system-message-danger',
    boss: 'system-message-boss',
    achievement: 'system-message-achievement',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`system-message ${variantStyles[variant]}`}
    >
      <div className="system-message-header">
        <span className="system-message-indicator" />
        <span className="system-message-label">SYSTEM</span>
      </div>
      <p className="system-message-content">
        {displayedText}
        {typewriter && displayedText.length < content.length && (
          <span className="system-message-cursor">▋</span>
        )}
      </p>
    </motion.div>
  );
}
```

```css
.system-message {
  padding: 1.5rem;
  background: linear-gradient(
    135deg,
    rgba(14, 165, 233, 0.05) 0%,
    transparent 50%
  );
  border-left: 2px solid var(--system-blue-400);
}

.system-message-danger {
  background: linear-gradient(
    135deg,
    rgba(239, 68, 68, 0.05) 0%,
    transparent 50%
  );
  border-left-color: var(--status-hp);
}

.system-message-boss {
  background: linear-gradient(
    135deg,
    rgba(139, 92, 246, 0.05) 0%,
    transparent 50%
  );
  border-left-color: var(--shadow-purple-400);
}

.system-message-achievement {
  background: linear-gradient(
    135deg,
    rgba(251, 191, 36, 0.05) 0%,
    transparent 50%
  );
  border-left-color: var(--status-xp);
}

.system-message-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.system-message-indicator {
  width: 6px;
  height: 6px;
  background: var(--system-blue-400);
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
}

.system-message-label {
  font-family: var(--font-system);
  font-size: 0.625rem;
  letter-spacing: 0.2em;
  color: var(--text-muted);
}

.system-message-content {
  font-family: var(--font-system);
  font-size: 0.875rem;
  line-height: 1.8;
  color: var(--text-primary);
  white-space: pre-wrap;
  margin: 0;
}

.system-message-cursor {
  animation: blink 1s step-end infinite;
  color: var(--system-blue-300);
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
```

---

#### Level Up Modal

```tsx
// src/components/xp/LevelUpModal.tsx
import { motion, AnimatePresence } from 'framer-motion';

interface LevelUpModalProps {
  isOpen: boolean;
  newLevel: number;
  onClose: () => void;
}

export function LevelUpModal({ isOpen, newLevel, onClose }: LevelUpModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="level-up-backdrop"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="level-up-modal"
          >
            {/* Radial glow */}
            <div className="level-up-glow" />

            {/* Particle effects */}
            <div className="level-up-particles">
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="level-up-particle"
                  initial={{
                    opacity: 0,
                    scale: 0,
                    x: 0,
                    y: 0
                  }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                    x: (Math.random() - 0.5) * 200,
                    y: (Math.random() - 0.5) * 200
                  }}
                  transition={{
                    duration: 1.5,
                    delay: Math.random() * 0.5,
                    repeat: Infinity,
                    repeatDelay: Math.random() * 2
                  }}
                />
              ))}
            </div>

            <div className="level-up-content">
              <span className="level-up-label">LEVEL UP</span>

              <motion.div
                className="level-up-number"
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                {newLevel}
              </motion.div>

              <p className="level-up-message">
                Progress recorded.<br />
                Continue.
              </p>

              <button className="level-up-dismiss" onClick={onClose}>
                ACKNOWLEDGE
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
```

```css
.level-up-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
  z-index: 100;
}

.level-up-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 320px;
  background: var(--void-surface);
  border: 1px solid var(--system-blue-400);
  border-radius: 8px;
  overflow: hidden;
  z-index: 101;
}

.level-up-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 200%;
  height: 200%;
  background: radial-gradient(
    circle,
    var(--system-glow-intense) 0%,
    transparent 50%
  );
  pointer-events: none;
}

.level-up-particles {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.level-up-particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: var(--system-blue-300);
  border-radius: 50%;
  box-shadow: 0 0 10px var(--system-blue-400);
}

.level-up-content {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem 2rem;
  text-align: center;
}

.level-up-label {
  font-family: var(--font-system);
  font-size: 0.75rem;
  letter-spacing: 0.3em;
  color: var(--system-blue-300);
  margin-bottom: 1rem;
}

.level-up-number {
  font-family: var(--font-display);
  font-size: 5rem;
  font-weight: 700;
  color: var(--text-primary);
  text-shadow:
    0 0 20px var(--system-glow),
    0 0 40px var(--system-glow),
    0 0 60px var(--system-glow);
  line-height: 1;
}

.level-up-message {
  font-family: var(--font-system);
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 1.5rem 0;
}

.level-up-dismiss {
  padding: 0.75rem 2rem;
  background: transparent;
  border: 1px solid var(--system-blue-400);
  border-radius: 4px;
  color: var(--system-blue-300);
  font-family: var(--font-system);
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  cursor: pointer;
  transition: all 0.2s ease;
}

.level-up-dismiss:hover {
  background: rgba(14, 165, 233, 0.1);
  box-shadow: 0 0 20px var(--system-glow);
}
```

---

#### Rank Badge

```tsx
// src/components/ui/RankBadge.tsx
import { motion } from 'framer-motion';

type Rank = 'E' | 'D' | 'C' | 'B' | 'A' | 'S';

interface RankBadgeProps {
  rank: Rank;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

const rankConfig: Record<Rank, { color: string; glow: string; label: string }> = {
  E: { color: '#9ca3af', glow: 'rgba(156, 163, 175, 0.4)', label: 'E-RANK' },
  D: { color: '#22c55e', glow: 'rgba(34, 197, 94, 0.4)', label: 'D-RANK' },
  C: { color: '#3b82f6', glow: 'rgba(59, 130, 246, 0.4)', label: 'C-RANK' },
  B: { color: '#a855f7', glow: 'rgba(168, 85, 247, 0.4)', label: 'B-RANK' },
  A: { color: '#ef4444', glow: 'rgba(239, 68, 68, 0.4)', label: 'A-RANK' },
  S: { color: '#fbbf24', glow: 'rgba(251, 191, 36, 0.5)', label: 'S-RANK' },
};

const sizeConfig = {
  sm: { width: 32, fontSize: '0.875rem' },
  md: { width: 48, fontSize: '1.25rem' },
  lg: { width: 64, fontSize: '1.75rem' },
};

export function RankBadge({ rank, size = 'md', animated = true }: RankBadgeProps) {
  const config = rankConfig[rank];
  const sizes = sizeConfig[size];

  return (
    <motion.div
      className="rank-badge"
      style={{
        '--rank-color': config.color,
        '--rank-glow': config.glow,
        width: sizes.width,
        height: sizes.width,
        fontSize: sizes.fontSize,
      } as React.CSSProperties}
      initial={animated ? { scale: 0, rotate: -180 } : false}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', damping: 15 }}
    >
      {rank === 'S' && <div className="rank-badge-shine" />}
      <span className="rank-badge-letter">{rank}</span>
    </motion.div>
  );
}
```

```css
.rank-badge {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.1) 0%,
    transparent 50%
  );
  border: 2px solid var(--rank-color);
  border-radius: 8px;
  box-shadow:
    0 0 20px var(--rank-glow),
    inset 0 0 20px var(--rank-glow);
  overflow: hidden;
}

.rank-badge-letter {
  font-family: var(--font-display);
  font-weight: 700;
  color: var(--rank-color);
  text-shadow: 0 0 10px var(--rank-glow);
}

.rank-badge-shine {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    45deg,
    transparent 40%,
    rgba(255, 255, 255, 0.1) 50%,
    transparent 60%
  );
  animation: shine 3s ease-in-out infinite;
}

@keyframes shine {
  0%, 100% { transform: translateX(-50%) rotate(45deg); }
  50% { transform: translateX(50%) rotate(45deg); }
}
```

---

### Animation Patterns (Framer Motion)

```typescript
// src/lib/animations.ts

export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3 }
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
  transition: { type: 'spring', damping: 25 }
};

export const slideInFromLeft = {
  initial: { opacity: 0, x: -30 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 30 },
  transition: { duration: 0.3 }
};

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export const staggerItem = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 }
};

// Glow pulse animation
export const glowPulse = {
  animate: {
    boxShadow: [
      '0 0 20px rgba(14, 165, 233, 0.3)',
      '0 0 40px rgba(14, 165, 233, 0.5)',
      '0 0 20px rgba(14, 165, 233, 0.3)'
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

// Number increment animation hook
export function useCountUp(target: number, duration = 1000) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [target, duration]);

  return count;
}
```

---

### Responsive Breakpoints

```css
/* Mobile-first responsive design */
:root {
  /* Breakpoints */
  --bp-sm: 640px;
  --bp-md: 768px;
  --bp-lg: 1024px;
  --bp-xl: 1280px;
}

/* Mobile (default) */
.system-window {
  margin: 0.5rem;
  border-radius: 0;
}

/* Tablet and up */
@media (min-width: 768px) {
  .system-window {
    margin: 1rem;
    border-radius: 4px;
  }

  .stat-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .stat-grid {
    grid-template-columns: repeat(4, 1fr);
  }

  .quest-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
}
```

---

### Visual Effects Reference

| Effect | Implementation | Use Case |
|--------|---------------|----------|
| **Glow** | `box-shadow` with color-matched rgba | Buttons, active states, level up |
| **Scan Lines** | CSS pseudo-element with gradient | System windows (subtle) |
| **Particle Float** | Framer Motion with random paths | Level up, boss encounters |
| **Text Reveal** | Character-by-character with interval | System messages, narrative |
| **Bar Fill** | Animated width with easeOut | XP bars, quest progress |
| **Shimmer** | Translating gradient overlay | XP bar highlight |
| **Pulse** | Keyframe opacity animation | Status indicators |
| **Number Tick** | useCountUp hook | Stat changes, XP gains |

---

### Accessibility Notes

Despite the dark, atmospheric aesthetic:

- All text maintains **WCAG AA contrast** (4.5:1 minimum)
- Interactive elements have **visible focus states** (ring outline)
- Animations respect **prefers-reduced-motion**
- Screen reader labels on icon-only buttons
- Semantic HTML structure (proper headings, landmarks)

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Focus visible for keyboard navigation */
*:focus-visible {
  outline: 2px solid var(--system-blue-400);
  outline-offset: 2px;
}
```

---

## Sources

- [Mastra AI Framework](https://mastra.ai/)
- [Mastra GitHub](https://github.com/mastra-ai/mastra)
- [Mastra Agents Documentation](https://mastra.ai/docs/agents/overview)
- [Mastra createTool Reference](https://mastra.ai/en/reference/tools/create-tool)
- [Mastra Quickstart](https://workos.com/blog/mastra-ai-quick-start)
- [Hono Framework](https://hono.dev/)
- [Sanity.io CMS](https://www.sanity.io/)
