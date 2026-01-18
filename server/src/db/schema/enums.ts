import { pgEnum } from 'drizzle-orm/pg-core'

export const questTypeEnum = pgEnum('quest_type', ['DAILY', 'WEEKLY', 'DUNGEON', 'BOSS'])
export const questCategoryEnum = pgEnum('quest_category', [
  'MOVEMENT',
  'STRENGTH',
  'RECOVERY',
  'NUTRITION',
  'DISCIPLINE',
])
export const questStatusEnum = pgEnum('quest_status', ['ACTIVE', 'COMPLETED', 'FAILED', 'EXPIRED'])
export const statTypeEnum = pgEnum('stat_type', ['STR', 'AGI', 'VIT', 'DISC'])

export const xpEventSourceEnum = pgEnum('xp_event_source', [
  'QUEST_COMPLETION',
  'STREAK_BONUS',
  'BOSS_DEFEAT',
  'DUNGEON_CLEAR',
  'SEASON_BONUS',
  'TITLE_BONUS',
  'MANUAL_ADJUSTMENT',
  'BODY_COMPOSITION',
])

export const modifierTypeEnum = pgEnum('modifier_type', [
  'DEBUFF_PENALTY',
  'STREAK_BONUS',
  'WEEKEND_BONUS',
  'SEASON_MULTIPLIER',
  'TITLE_PASSIVE',
  'DUNGEON_MULTIPLIER',
])

export const titleConditionTypeEnum = pgEnum('title_condition_type', [
  'STREAK_DAYS',
  'CUMULATIVE_COUNT',
  'TIME_WINDOW',
  'EVENT_COUNT',
  'COMPOUND',
  'SPECIAL',
])

export const passiveTypeEnum = pgEnum('passive_type', [
  'FLAT_XP_BONUS',
  'PERCENT_XP_BONUS',
  'STAT_BONUS',
  'DEBUFF_REDUCTION',
])

export const titleRarityEnum = pgEnum('title_rarity', [
  'COMMON',
  'UNCOMMON',
  'RARE',
  'EPIC',
  'LEGENDARY',
])

export const bossDifficultyEnum = pgEnum('boss_difficulty', ['NORMAL', 'HARD', 'NIGHTMARE'])
export const bossAttemptStatusEnum = pgEnum('boss_attempt_status', [
  'IN_PROGRESS',
  'VICTORY',
  'DEFEAT',
  'ABANDONED',
])

export const dungeonDifficultyEnum = pgEnum('dungeon_difficulty', [
  'E_RANK',
  'D_RANK',
  'C_RANK',
  'B_RANK',
  'A_RANK',
  'S_RANK',
])
export const dungeonAttemptStatusEnum = pgEnum('dungeon_attempt_status', [
  'IN_PROGRESS',
  'CLEARED',
  'FAILED',
  'TIMED_OUT',
])

export const seasonStatusEnum = pgEnum('season_status', ['UPCOMING', 'ACTIVE', 'ENDED'])

export const narrativeCategoryEnum = pgEnum('narrative_category', [
  'ONBOARDING',
  'SYSTEM_MESSAGE',
  'DAILY_QUEST',
  'DEBUFF',
  'DUNGEON',
  'BOSS',
  'TITLE',
  'SEASON',
  'LEVEL_UP',
  'DAILY_REMINDER',
])
