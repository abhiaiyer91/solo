/**
 * Hard Mode Service
 *
 * Handles hard mode content for late-game players.
 * Unlocks at Season 3 or Level 25.
 */

import { dbClient as db } from '../db'
import { users } from '../db/schema'
import { eq } from 'drizzle-orm'

function requireDb() {
  if (!db) {
    throw new Error('Database connection required for hard mode service')
  }
  return db
}

const UNLOCK_LEVEL = 25
const UNLOCK_SEASON = 3
const HARD_MODE_XP_MULTIPLIER = 1.5

export interface HardModeStatus {
  isUnlocked: boolean
  isEnabled: boolean
  unlockReason: string | null
  stats: {
    questsCompleted: number
    dungeonsCleared: number
    perfectDays: number
  }
}

export interface HardModeUnlockRequirements {
  levelRequired: number
  seasonRequired: number
  currentLevel: number
  currentSeason: number | null
  canUnlock: boolean
}

/**
 * Check if user can unlock hard mode
 */
export async function checkHardModeUnlock(
  userId: string,
  currentSeason: number | null = null
): Promise<HardModeUnlockRequirements> {
  const [user] = await requireDb()
    .select({
      level: users.level,
      hardModeEnabled: users.hardModeEnabled,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!user) {
    throw new Error('User not found')
  }

  const level = user.level ?? 1
  const canUnlock = level >= UNLOCK_LEVEL || (currentSeason !== null && currentSeason >= UNLOCK_SEASON)

  return {
    levelRequired: UNLOCK_LEVEL,
    seasonRequired: UNLOCK_SEASON,
    currentLevel: level,
    currentSeason,
    canUnlock,
  }
}

/**
 * Get hard mode status for user
 */
export async function getHardModeStatus(
  userId: string,
  currentSeason: number | null = null
): Promise<HardModeStatus> {
  const [user] = await requireDb()
    .select({
      level: users.level,
      hardModeEnabled: users.hardModeEnabled,
      hardModeUnlockedAt: users.hardModeUnlockedAt,
      hardModeQuestsCompleted: users.hardModeQuestsCompleted,
      hardModeDungeonsCleared: users.hardModeDungeonsCleared,
      hardModePerfectDays: users.hardModePerfectDays,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!user) {
    throw new Error('User not found')
  }

  const level = user.level ?? 1
  const isUnlocked = level >= UNLOCK_LEVEL || (currentSeason !== null && currentSeason >= UNLOCK_SEASON)

  let unlockReason: string | null = null
  if (isUnlocked) {
    if (level >= UNLOCK_LEVEL) {
      unlockReason = `Level ${UNLOCK_LEVEL} reached`
    } else if (currentSeason && currentSeason >= UNLOCK_SEASON) {
      unlockReason = `Season ${UNLOCK_SEASON} reached`
    }
  }

  return {
    isUnlocked,
    isEnabled: user.hardModeEnabled,
    unlockReason,
    stats: {
      questsCompleted: user.hardModeQuestsCompleted,
      dungeonsCleared: user.hardModeDungeonsCleared,
      perfectDays: user.hardModePerfectDays,
    },
  }
}

/**
 * Enable hard mode for user
 */
export async function enableHardMode(
  userId: string,
  currentSeason: number | null = null
): Promise<HardModeStatus> {
  const requirements = await checkHardModeUnlock(userId, currentSeason)

  if (!requirements.canUnlock) {
    throw new Error(
      `Hard mode unlocks at Level ${UNLOCK_LEVEL} or Season ${UNLOCK_SEASON}. ` +
      `Current: Level ${requirements.currentLevel}, Season ${requirements.currentSeason ?? 'N/A'}`
    )
  }

  await requireDb()
    .update(users)
    .set({
      hardModeEnabled: true,
      hardModeUnlockedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))

  return getHardModeStatus(userId, currentSeason)
}

/**
 * Disable hard mode for user
 */
export async function disableHardMode(userId: string): Promise<HardModeStatus> {
  // TODO: Check if user is mid-dungeon
  // For now, allow disabling anytime

  await requireDb()
    .update(users)
    .set({
      hardModeEnabled: false,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))

  return getHardModeStatus(userId)
}

/**
 * Increment hard mode quest completion count
 */
export async function recordHardModeQuestComplete(userId: string): Promise<void> {
  const [user] = await requireDb()
    .select({ count: users.hardModeQuestsCompleted })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!user) return

  await requireDb()
    .update(users)
    .set({
      hardModeQuestsCompleted: (user.count ?? 0) + 1,
    })
    .where(eq(users.id, userId))
}

/**
 * Increment hard mode dungeon clear count
 */
export async function recordHardModeDungeonClear(userId: string): Promise<void> {
  const [user] = await requireDb()
    .select({ count: users.hardModeDungeonsCleared })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!user) return

  await requireDb()
    .update(users)
    .set({
      hardModeDungeonsCleared: (user.count ?? 0) + 1,
    })
    .where(eq(users.id, userId))
}

/**
 * Increment hard mode perfect day count
 */
export async function recordHardModePerfectDay(userId: string): Promise<void> {
  const [user] = await requireDb()
    .select({ count: users.hardModePerfectDays })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!user) return

  await requireDb()
    .update(users)
    .set({
      hardModePerfectDays: (user.count ?? 0) + 1,
    })
    .where(eq(users.id, userId))
}

/**
 * Get XP multiplier for hard mode
 */
export function getHardModeXPMultiplier(): number {
  return HARD_MODE_XP_MULTIPLIER
}

/**
 * Hard mode quest thresholds (stricter than normal)
 */
export const HARD_MODE_QUEST_CONFIG = {
  // Movement: 12k instead of 10k, 8k for partial instead of 5k
  movement: {
    target: 12000,
    partialMin: 8000,
  },
  // Strength: 4 sets instead of 3
  strength: {
    target: 4,
    partialMin: 3,
  },
  // Recovery: 8 hours sleep instead of 7
  recovery: {
    target: 8,
    partialMin: 7,
  },
}

/**
 * Hard mode dungeon config
 */
export const HARD_MODE_DUNGEON_CONFIG = {
  // Time limit reduction (e.g., 0.8 = 80% of normal time)
  timeLimitMultiplier: 0.8,
  // No partial credit
  allowPartialCredit: false,
  // Perfect completion required
  requirePerfect: true,
  // XP multiplier
  xpMultiplier: HARD_MODE_XP_MULTIPLIER,
}

/**
 * Hard mode titles/achievements
 */
export const HARD_MODE_TITLES = [
  {
    id: 'the-perfectionist',
    name: 'The Perfectionist',
    description: '30-day perfect streak on hard mode',
    requirement: { type: 'perfectDays', value: 30 },
  },
  {
    id: 'iron-discipline',
    name: 'Iron Discipline',
    description: 'Clear 10 hard mode dungeons',
    requirement: { type: 'dungeonsCleared', value: 10 },
  },
  {
    id: 'the-relentless',
    name: 'The Relentless',
    description: '100 hard mode quests completed',
    requirement: { type: 'questsCompleted', value: 100 },
  },
]

/**
 * Check if user has earned a hard mode title
 */
export async function checkHardModeTitleEligibility(
  userId: string
): Promise<string[]> {
  const status = await getHardModeStatus(userId)
  const earned: string[] = []

  for (const title of HARD_MODE_TITLES) {
    const { type, value } = title.requirement
    switch (type) {
      case 'perfectDays':
        if (status.stats.perfectDays >= value) earned.push(title.id)
        break
      case 'dungeonsCleared':
        if (status.stats.dungeonsCleared >= value) earned.push(title.id)
        break
      case 'questsCompleted':
        if (status.stats.questsCompleted >= value) earned.push(title.id)
        break
    }
  }

  return earned
}
