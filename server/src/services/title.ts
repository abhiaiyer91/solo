import { dbClient as db } from '../db'
import {
  titles,
  userTitles,
  users,
  type TitleConditionConfig,
} from '../db/schema'
import { eq, and } from 'drizzle-orm'
import type { passiveTypeEnum, titleRarityEnum, statTypeEnum } from '../db/schema/enums'

type PassiveType = (typeof passiveTypeEnum.enumValues)[number]
type TitleRarity = (typeof titleRarityEnum.enumValues)[number]
type StatType = (typeof statTypeEnum.enumValues)[number]

function requireDb() {
  if (!db) {
    throw new Error('Database connection required for title service')
  }
  return db
}

export interface Title {
  id: string
  name: string
  description: string
  rarity: TitleRarity
  conditionType: string
  conditionConfig: TitleConditionConfig
  passiveType: PassiveType | null
  passiveValue: number | null
  passiveStat: StatType | null
  systemMessage: string | null
  canRegress: boolean
}

export interface UserTitle {
  id: string
  titleId: string
  title: Title
  earnedAt: Date
  isRevoked: boolean
  revokedAt: Date | null
  progress: number | null
  progressMax: number | null
}

export interface TitlePassiveBonus {
  titleId: string
  titleName: string
  passiveType: PassiveType
  value: number
  stat?: StatType
}

/**
 * Get all available titles
 */
export async function getAllTitles(): Promise<Title[]> {
  const result = await requireDb()
    .select()
    .from(titles)
    .where(eq(titles.isActive, true))

  return result.map(formatTitle)
}

/**
 * Get a title by ID
 */
export async function getTitleById(titleId: string): Promise<Title | null> {
  const [result] = await requireDb()
    .select()
    .from(titles)
    .where(eq(titles.id, titleId))
    .limit(1)

  return result ? formatTitle(result) : null
}

/**
 * Get all titles earned by a user
 */
export async function getUserTitles(userId: string): Promise<UserTitle[]> {
  const result = await requireDb()
    .select({
      userTitle: userTitles,
      title: titles,
    })
    .from(userTitles)
    .innerJoin(titles, eq(userTitles.titleId, titles.id))
    .where(and(eq(userTitles.userId, userId), eq(userTitles.isRevoked, false)))

  return result.map((row) => ({
    id: row.userTitle.id,
    titleId: row.userTitle.titleId,
    title: formatTitle(row.title),
    earnedAt: row.userTitle.earnedAt,
    isRevoked: row.userTitle.isRevoked,
    revokedAt: row.userTitle.revokedAt,
    progress: row.userTitle.progress,
    progressMax: row.userTitle.progressMax,
  }))
}

/**
 * Get user's active (equipped) title
 */
export async function getActiveTitle(userId: string): Promise<Title | null> {
  const [user] = await requireDb()
    .select({ activeTitleId: users.activeTitleId })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!user?.activeTitleId) return null

  return getTitleById(user.activeTitleId)
}

/**
 * Set user's active title
 */
export async function setActiveTitle(
  userId: string,
  titleId: string | null
): Promise<void> {
  // If setting a title, verify user owns it
  if (titleId) {
    const [userTitle] = await requireDb()
      .select()
      .from(userTitles)
      .where(
        and(
          eq(userTitles.userId, userId),
          eq(userTitles.titleId, titleId),
          eq(userTitles.isRevoked, false)
        )
      )
      .limit(1)

    if (!userTitle) {
      throw new Error('User does not own this title')
    }
  }

  await requireDb()
    .update(users)
    .set({ activeTitleId: titleId, updatedAt: new Date() })
    .where(eq(users.id, userId))
}

/**
 * Award a title to a user
 */
export async function awardTitle(
  userId: string,
  titleId: string
): Promise<UserTitle | null> {
  // Check if user already has this title
  const [existing] = await requireDb()
    .select()
    .from(userTitles)
    .where(
      and(
        eq(userTitles.userId, userId),
        eq(userTitles.titleId, titleId),
        eq(userTitles.isRevoked, false)
      )
    )
    .limit(1)

  if (existing) {
    // Already has title
    return null
  }

  // Check if user had this title but it was revoked
  const [revoked] = await requireDb()
    .select()
    .from(userTitles)
    .where(
      and(
        eq(userTitles.userId, userId),
        eq(userTitles.titleId, titleId),
        eq(userTitles.isRevoked, true)
      )
    )
    .limit(1)

  if (revoked) {
    // Re-award the title
    await requireDb()
      .update(userTitles)
      .set({
        isRevoked: false,
        revokedAt: null,
        earnedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(userTitles.id, revoked.id))
  } else {
    // Create new user title
    await requireDb().insert(userTitles).values({
      userId,
      titleId,
      earnedAt: new Date(),
    })
  }

  const userTitleList = await getUserTitles(userId)
  return userTitleList.find((ut) => ut.titleId === titleId) || null
}

/**
 * Revoke a title from a user
 */
export async function revokeTitle(userId: string, titleId: string): Promise<void> {
  await requireDb()
    .update(userTitles)
    .set({
      isRevoked: true,
      revokedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(userTitles.userId, userId),
        eq(userTitles.titleId, titleId),
        eq(userTitles.isRevoked, false)
      )
    )

  // If this was the active title, clear it
  const [user] = await requireDb()
    .select({ activeTitleId: users.activeTitleId })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (user?.activeTitleId === titleId) {
    await requireDb()
      .update(users)
      .set({ activeTitleId: null, updatedAt: new Date() })
      .where(eq(users.id, userId))
  }
}

/**
 * Get the passive bonus from user's active title
 */
export async function getActiveTitleBonus(
  userId: string
): Promise<TitlePassiveBonus | null> {
  const activeTitle = await getActiveTitle(userId)

  if (!activeTitle || !activeTitle.passiveType || activeTitle.passiveValue === null) {
    return null
  }

  return {
    titleId: activeTitle.id,
    titleName: activeTitle.name,
    passiveType: activeTitle.passiveType,
    value: activeTitle.passiveValue,
    stat: activeTitle.passiveStat ?? undefined,
  }
}

/**
 * Calculate XP bonus from active title
 * Returns multiplier (e.g., 1.05 for +5%) or flat bonus
 */
export function calculateTitleXPBonus(
  bonus: TitlePassiveBonus | null
): { multiplier: number; flatBonus: number; description: string } {
  if (!bonus) {
    return { multiplier: 1, flatBonus: 0, description: '' }
  }

  switch (bonus.passiveType) {
    case 'PERCENT_XP_BONUS':
      return {
        multiplier: 1 + bonus.value / 100,
        flatBonus: 0,
        description: `${bonus.titleName} (+${bonus.value}% XP)`,
      }
    case 'FLAT_XP_BONUS':
      return {
        multiplier: 1,
        flatBonus: bonus.value,
        description: `${bonus.titleName} (+${bonus.value} XP)`,
      }
    default:
      return { multiplier: 1, flatBonus: 0, description: '' }
  }
}

/**
 * Evaluate if a user qualifies for a title based on their stats
 */
export async function evaluateTitleCondition(
  userId: string,
  conditionConfig: TitleConditionConfig
): Promise<{ qualified: boolean; progress: number; max: number }> {
  const [user] = await requireDb()
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!user) {
    return { qualified: false, progress: 0, max: 0 }
  }

  switch (conditionConfig.type) {
    case 'STREAK_DAYS': {
      const currentStreak = user.currentStreak ?? 0
      return {
        qualified: currentStreak >= conditionConfig.days,
        progress: currentStreak,
        max: conditionConfig.days,
      }
    }

    case 'SPECIAL': {
      if (conditionConfig.specialType === 'ACCOUNT_CREATION') {
        return { qualified: true, progress: 1, max: 1 }
      }
      return { qualified: false, progress: 0, max: 1 }
    }

    // Other condition types would need additional data queries
    // For now, return false for complex conditions
    case 'CUMULATIVE_COUNT':
    case 'TIME_WINDOW':
    case 'EVENT_COUNT':
    case 'COMPOUND':
      // These would require querying quest logs, health data, etc.
      // Placeholder for now
      return { qualified: false, progress: 0, max: conditionConfig.type === 'CUMULATIVE_COUNT' ? conditionConfig.count : 0 }

    default:
      return { qualified: false, progress: 0, max: 0 }
  }
}

/**
 * Check and award titles based on streak changes
 */
export async function checkStreakTitles(
  userId: string,
  newStreak: number
): Promise<UserTitle[]> {
  const awarded: UserTitle[] = []

  // Get all streak-based titles
  const streakTitles = await requireDb()
    .select()
    .from(titles)
    .where(eq(titles.isActive, true))

  for (const title of streakTitles) {
    const config = title.conditionConfig as TitleConditionConfig
    if (config.type !== 'STREAK_DAYS') continue

    if (newStreak >= config.days) {
      const userTitle = await awardTitle(userId, title.id)
      if (userTitle) {
        awarded.push(userTitle)
      }
    }
  }

  return awarded
}

/**
 * Check for title regression (e.g., streak breaks)
 */
export async function checkTitleRegression(
  userId: string,
  event: 'STREAK_BREAK' | 'TIME_WINDOW_FAIL'
): Promise<string[]> {
  const revoked: string[] = []

  const userTitleList = await getUserTitles(userId)

  for (const userTitle of userTitleList) {
    if (!userTitle.title.canRegress) continue

    const title = await requireDb()
      .select()
      .from(titles)
      .where(eq(titles.id, userTitle.titleId))
      .limit(1)

    if (!title[0]) continue

    const regressionConfig = title[0].regressionConfig as { trigger: string } | null
    if (regressionConfig?.trigger === event) {
      await revokeTitle(userId, userTitle.titleId)
      revoked.push(userTitle.title.name)
    }
  }

  return revoked
}

function formatTitle(row: typeof titles.$inferSelect): Title {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    rarity: row.rarity,
    conditionType: row.conditionType,
    conditionConfig: row.conditionConfig as TitleConditionConfig,
    passiveType: row.passiveType,
    passiveValue: row.passiveValue,
    passiveStat: row.passiveStat,
    systemMessage: row.systemMessage,
    canRegress: row.canRegress,
  }
}
