/**
 * Shadow Service
 *
 * Provides anonymous "shadow" comparisons showing aggregated data
 * about similar players without revealing identities.
 *
 * Shadow Types:
 * - Level Shadow: Players at similar level (±2)
 * - Streak Shadow: Players with similar streak lengths
 * - Time Shadow: Players in the same timezone
 * - Title Shadow: Players with the same active title
 */

import { dbClient as db } from '../db'
import { users, dailyLogs } from '../db/schema'
import { eq, and, gte, lte, ne, sql, desc, count } from 'drizzle-orm'

function requireDb() {
  if (!db) {
    throw new Error('Database connection required for shadow service')
  }
  return db
}

export type ShadowType = 'level' | 'streak' | 'time' | 'title'

export interface ShadowObservation {
  type: ShadowType
  narrative: string
  shadowData: {
    shadowLevel?: number
    shadowStreak?: number
    shadowCompletionTime?: string
    shadowTitle?: string
    playerCount?: number
  }
  playerData: {
    level: number
    streak: number
    lastCompletionTime?: string
    title?: string
  }
  observedAt: string
}

export interface ShadowAggregates {
  totalActivePlayers: number
  playersCompletedToday: number
  playersInDungeons: number
  playersDefeatedBosses: number
}

/**
 * Get a daily shadow observation for a user
 * Returns different shadow types based on the day and user context
 */
export async function getDailyShadowObservation(
  userId: string
): Promise<ShadowObservation | null> {
  const database = requireDb()

  // Get the current user's data
  const [currentUser] = await database
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!currentUser) {
    return null
  }

  // Determine which shadow type to show based on day of year
  // This ensures variety in observations
  const dayOfYear = getDayOfYear()
  const shadowTypes: ShadowType[] = ['level', 'streak', 'time', 'title']
  const selectedType = shadowTypes[dayOfYear % shadowTypes.length]!

  // Generate shadow based on type
  switch (selectedType) {
    case 'level':
      return await generateLevelShadow(currentUser)
    case 'streak':
      return await generateStreakShadow(currentUser)
    case 'time':
      return await generateTimeShadow(currentUser)
    case 'title':
      return await generateTitleShadow(currentUser)
    default:
      return await generateLevelShadow(currentUser)
  }
}

/**
 * Generate a Level Shadow observation
 * Compares user to anonymous players at similar level (±2)
 */
async function generateLevelShadow(
  currentUser: typeof users.$inferSelect
): Promise<ShadowObservation> {
  const database = requireDb()
  const today = new Date().toISOString().split('T')[0]!

  // Find players at similar level who completed quests today
  const similarLevelPlayers = await database
    .select({
      level: users.level,
      streak: users.currentStreak,
    })
    .from(users)
    .innerJoin(dailyLogs, eq(dailyLogs.userId, users.id))
    .where(
      and(
        ne(users.id, currentUser.id),
        gte(users.level, currentUser.level - 2),
        lte(users.level, currentUser.level + 2),
        eq(dailyLogs.logDate, today),
        gte(dailyLogs.coreQuestsCompleted, 1)
      )
    )
    .limit(100)

  if (similarLevelPlayers.length === 0) {
    // No shadows found - return general observation
    return {
      type: 'level',
      narrative: generateNoShadowNarrative('level', currentUser.level),
      shadowData: {
        playerCount: 0,
      },
      playerData: {
        level: currentUser.level,
        streak: currentUser.currentStreak,
      },
      observedAt: new Date().toISOString(),
    }
  }

  // Calculate aggregates
  const avgStreak = Math.round(
    similarLevelPlayers.reduce((sum, p) => sum + p.streak, 0) /
      similarLevelPlayers.length
  )
  // Pick a representative player to show in the shadow narrative
  const representativePlayer =
    similarLevelPlayers[Math.floor(Math.random() * similarLevelPlayers.length)]!

  return {
    type: 'level',
    narrative: generateLevelShadowNarrative(
      representativePlayer.level,
      representativePlayer.streak,
      currentUser.level,
      currentUser.currentStreak,
      similarLevelPlayers.length
    ),
    shadowData: {
      shadowLevel: representativePlayer.level,
      shadowStreak: avgStreak,
      playerCount: similarLevelPlayers.length,
    },
    playerData: {
      level: currentUser.level,
      streak: currentUser.currentStreak,
    },
    observedAt: new Date().toISOString(),
  }
}

/**
 * Generate a Streak Shadow observation
 * Compares user to players with similar streak lengths
 */
async function generateStreakShadow(
  currentUser: typeof users.$inferSelect
): Promise<ShadowObservation> {
  const database = requireDb()

  // Define streak range based on current user's streak
  const streakMin = Math.max(0, currentUser.currentStreak - 5)
  const streakMax = currentUser.currentStreak + 10

  const similarStreakPlayers = await database
    .select({
      level: users.level,
      streak: users.currentStreak,
    })
    .from(users)
    .where(
      and(
        ne(users.id, currentUser.id),
        gte(users.currentStreak, streakMin),
        lte(users.currentStreak, streakMax)
      )
    )
    .orderBy(desc(users.currentStreak))
    .limit(50)

  if (similarStreakPlayers.length === 0) {
    return {
      type: 'streak',
      narrative: generateNoShadowNarrative('streak', currentUser.currentStreak),
      shadowData: {
        playerCount: 0,
      },
      playerData: {
        level: currentUser.level,
        streak: currentUser.currentStreak,
      },
      observedAt: new Date().toISOString(),
    }
  }

  // Find someone with a higher streak to inspire
  const higherStreakPlayer = similarStreakPlayers.find(
    (p) => p.streak > currentUser.currentStreak
  )
  const representativePlayer = higherStreakPlayer || similarStreakPlayers[0]!

  return {
    type: 'streak',
    narrative: generateStreakShadowNarrative(
      representativePlayer.streak,
      representativePlayer.level,
      currentUser.currentStreak,
      currentUser.level,
      similarStreakPlayers.length
    ),
    shadowData: {
      shadowLevel: representativePlayer.level,
      shadowStreak: representativePlayer.streak,
      playerCount: similarStreakPlayers.length,
    },
    playerData: {
      level: currentUser.level,
      streak: currentUser.currentStreak,
    },
    observedAt: new Date().toISOString(),
  }
}

/**
 * Generate a Time Shadow observation
 * Shows aggregate completion stats for players in the same timezone
 */
async function generateTimeShadow(
  currentUser: typeof users.$inferSelect
): Promise<ShadowObservation> {
  const database = requireDb()
  const today = new Date().toISOString().split('T')[0]!

  // Count players in the same timezone who completed today
  const timezoneStats = await database
    .select({
      count: count(),
    })
    .from(users)
    .innerJoin(dailyLogs, eq(dailyLogs.userId, users.id))
    .where(
      and(
        ne(users.id, currentUser.id),
        eq(users.timezone, currentUser.timezone),
        eq(dailyLogs.logDate, today),
        gte(dailyLogs.coreQuestsCompleted, 1)
      )
    )

  const completedCount = timezoneStats[0]?.count ?? 0

  // Get total players in timezone
  const totalInTimezone = await database
    .select({
      count: count(),
    })
    .from(users)
    .where(and(ne(users.id, currentUser.id), eq(users.timezone, currentUser.timezone)))

  const totalCount = totalInTimezone[0]?.count ?? 0

  return {
    type: 'time',
    narrative: generateTimeShadowNarrative(
      completedCount,
      totalCount,
      currentUser.timezone
    ),
    shadowData: {
      playerCount: completedCount,
    },
    playerData: {
      level: currentUser.level,
      streak: currentUser.currentStreak,
    },
    observedAt: new Date().toISOString(),
  }
}

/**
 * Generate a Title Shadow observation
 * Compares user to others with the same active title
 */
async function generateTitleShadow(
  currentUser: typeof users.$inferSelect
): Promise<ShadowObservation> {
  const database = requireDb()

  // If user has no title, fall back to level shadow
  if (!currentUser.activeTitleId) {
    return generateLevelShadow(currentUser)
  }

  const sameTitlePlayers = await database
    .select({
      level: users.level,
      streak: users.currentStreak,
    })
    .from(users)
    .where(
      and(
        ne(users.id, currentUser.id),
        eq(users.activeTitleId, currentUser.activeTitleId)
      )
    )
    .limit(50)

  if (sameTitlePlayers.length === 0) {
    return {
      type: 'title',
      narrative: `OBSERVATION\n\nYou are the only one bearing this title.\n\nThe System records your solitary distinction.`,
      shadowData: {
        playerCount: 0,
        shadowTitle: currentUser.activeTitleId,
      },
      playerData: {
        level: currentUser.level,
        streak: currentUser.currentStreak,
        title: currentUser.activeTitleId,
      },
      observedAt: new Date().toISOString(),
    }
  }

  const avgStreak = Math.round(
    sameTitlePlayers.reduce((sum, p) => sum + p.streak, 0) / sameTitlePlayers.length
  )
  const avgLevel = Math.round(
    sameTitlePlayers.reduce((sum, p) => sum + p.level, 0) / sameTitlePlayers.length
  )

  return {
    type: 'title',
    narrative: generateTitleShadowNarrative(
      sameTitlePlayers.length,
      avgStreak,
      avgLevel,
      currentUser.currentStreak,
      currentUser.level
    ),
    shadowData: {
      shadowLevel: avgLevel,
      shadowStreak: avgStreak,
      shadowTitle: currentUser.activeTitleId,
      playerCount: sameTitlePlayers.length,
    },
    playerData: {
      level: currentUser.level,
      streak: currentUser.currentStreak,
      title: currentUser.activeTitleId,
    },
    observedAt: new Date().toISOString(),
  }
}

/**
 * Get aggregate statistics across all players
 */
export async function getShadowAggregates(): Promise<ShadowAggregates> {
  const database = requireDb()
  const today = new Date().toISOString().split('T')[0]!

  // Total active players (logged in last 7 days)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const activePlayersResult = await database
    .select({ count: count() })
    .from(users)
    .where(gte(users.updatedAt, sevenDaysAgo))

  // Players who completed core quests today
  const completedTodayResult = await database
    .select({ count: count() })
    .from(dailyLogs)
    .where(
      and(
        eq(dailyLogs.logDate, today),
        sql`${dailyLogs.coreQuestsCompleted} >= ${dailyLogs.coreQuestsTotal}`,
        sql`${dailyLogs.coreQuestsTotal} > 0`
      )
    )

  return {
    totalActivePlayers: activePlayersResult[0]?.count ?? 0,
    playersCompletedToday: completedTodayResult[0]?.count ?? 0,
    playersInDungeons: 0, // Placeholder for when dungeon system is implemented
    playersDefeatedBosses: 0, // Placeholder for boss defeat tracking
  }
}

// ============== Narrative Generation ==============

function generateLevelShadowNarrative(
  shadowLevel: number,
  shadowStreak: number,
  playerLevel: number,
  playerStreak: number,
  playerCount: number
): string {
  const levelDiff = shadowLevel - playerLevel

  let comparison = ''
  if (levelDiff > 0) {
    comparison = `They are ${levelDiff} level${levelDiff > 1 ? 's' : ''} ahead.`
  } else if (levelDiff < 0) {
    comparison = `You are ${Math.abs(levelDiff)} level${Math.abs(levelDiff) > 1 ? 's' : ''} ahead.`
  } else {
    comparison = 'Your levels are identical.'
  }

  return `SHADOW DETECTED

A player at Level ${shadowLevel} completed their objectives today.
Their streak: ${shadowStreak} days.

You are Level ${playerLevel}.
Your streak: ${playerStreak} days.

${comparison}

${playerCount} similar players observed.
The System presents data.
Interpretation is yours.`
}

function generateStreakShadowNarrative(
  shadowStreak: number,
  shadowLevel: number,
  playerStreak: number,
  playerLevel: number,
  playerCount: number
): string {
  const streakDiff = shadowStreak - playerStreak

  let observation = ''
  if (streakDiff > 0) {
    observation = `${streakDiff} more days of consistency separate you.`
  } else if (streakDiff < 0) {
    observation = `Your streak exceeds theirs by ${Math.abs(streakDiff)} days.`
  } else {
    observation = 'Your streaks are matched.'
  }

  return `SHADOW DETECTED

A player on day ${shadowStreak} of their streak maintains their pattern.
Level ${shadowLevel}.

You are on day ${playerStreak}.
Level ${playerLevel}.

${observation}

${playerCount} players walk similar paths.
The distance between you is measured in days.`
}

function generateTimeShadowNarrative(
  completedCount: number,
  totalCount: number,
  _timezone: string
): string {
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return `OBSERVATION

The System monitors ${totalCount > 0 ? totalCount : 'few'} players in your region.

Today:
${completedCount > 0 ? `${completedCount} completed their core objectives.` : 'None have completed their core objectives yet.'}
${percentage > 0 ? `Completion rate: ${percentage}%` : ''}

You are one data point.
Your actions determine which category.`
}

function generateTitleShadowNarrative(
  playerCount: number,
  avgStreak: number,
  avgLevel: number,
  playerStreak: number,
  playerLevel: number
): string {
  return `OBSERVATION

${playerCount} other players bear your title.

Their average streak: ${avgStreak} days.
Their average level: ${avgLevel}.

Your streak: ${playerStreak} days.
Your level: ${playerLevel}.

The title is shared.
What you do with it is not.`
}

function generateNoShadowNarrative(type: ShadowType, value: number): string {
  switch (type) {
    case 'level':
      return `OBSERVATION

No shadows detected at Level ${value} today.

The System found no comparable players who completed their objectives.

Perhaps you are alone at this level.
Perhaps others have not yet begun.

The System does not speculate.
It only observes.`
    case 'streak':
      return `OBSERVATION

No shadows detected with a ${value}-day streak.

The System found no comparable players.

Your path may be unique.
Or others walk it silently.

The System records what it can measure.`
    default:
      return `OBSERVATION

The System detected no comparable shadows today.

Continue.
The data will accumulate.`
  }
}

// ============== Utility Functions ==============

function getDayOfYear(): number {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const diff = now.getTime() - start.getTime()
  const oneDay = 1000 * 60 * 60 * 24
  return Math.floor(diff / oneDay)
}
