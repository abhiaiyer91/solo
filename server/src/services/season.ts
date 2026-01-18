import { dbClient as db } from '../db'
import {
  seasons,
  seasonParticipations,
  seasonLeaderboards,
  users,
  type SeasonContentConfig,
  type SeasonEndStats,
} from '../db/schema'
import { eq, and, desc, asc } from 'drizzle-orm'
import type { seasonStatusEnum } from '../db/schema/enums'

type SeasonStatus = (typeof seasonStatusEnum.enumValues)[number]

function requireDb() {
  if (!db) {
    throw new Error('Database connection required for season service')
  }
  return db
}

export interface Season {
  id: string
  number: number
  name: string
  theme: string
  description: string
  xpMultiplier: number
  levelRequirement: number | null
  dayRequirement: number | null
  status: SeasonStatus
  introNarrative: string | null
  outroNarrative: string | null
  contentConfig: SeasonContentConfig | null
}

export interface SeasonParticipation {
  id: string
  seasonId: string
  season: Season
  seasonalXP: number
  startedAt: Date
  completedAt: Date | null
  isCurrent: boolean
  endStats: SeasonEndStats | null
}

export interface LeaderboardEntry {
  rank: number | null
  userId: string
  userName: string | null
  seasonalXP: number
  level: number
}

/**
 * Get all seasons
 */
export async function getAllSeasons(): Promise<Season[]> {
  const result = await requireDb()
    .select()
    .from(seasons)
    .orderBy(asc(seasons.number))

  return result.map(formatSeason)
}

/**
 * Get current active season
 */
export async function getCurrentSeason(): Promise<Season | null> {
  const [result] = await requireDb()
    .select()
    .from(seasons)
    .where(eq(seasons.status, 'ACTIVE'))
    .limit(1)

  return result ? formatSeason(result) : null
}

/**
 * Get season by ID
 */
export async function getSeasonById(seasonId: string): Promise<Season | null> {
  const [result] = await requireDb()
    .select()
    .from(seasons)
    .where(eq(seasons.id, seasonId))
    .limit(1)

  return result ? formatSeason(result) : null
}

/**
 * Get season by number
 */
export async function getSeasonByNumber(number: number): Promise<Season | null> {
  const [result] = await requireDb()
    .select()
    .from(seasons)
    .where(eq(seasons.number, number))
    .limit(1)

  return result ? formatSeason(result) : null
}

/**
 * Get user's current season participation
 */
export async function getUserCurrentSeason(
  userId: string
): Promise<SeasonParticipation | null> {
  const result = await requireDb()
    .select({
      participation: seasonParticipations,
      season: seasons,
    })
    .from(seasonParticipations)
    .innerJoin(seasons, eq(seasonParticipations.seasonId, seasons.id))
    .where(
      and(
        eq(seasonParticipations.userId, userId),
        eq(seasonParticipations.isCurrent, true)
      )
    )
    .limit(1)

  if (!result[0]) return null

  return {
    id: result[0].participation.id,
    seasonId: result[0].participation.seasonId,
    season: formatSeason(result[0].season),
    seasonalXP: result[0].participation.seasonalXP,
    startedAt: result[0].participation.startedAt,
    completedAt: result[0].participation.completedAt,
    isCurrent: result[0].participation.isCurrent,
    endStats: result[0].participation.endStats as SeasonEndStats | null,
  }
}

/**
 * Get user's season history
 */
export async function getUserSeasonHistory(
  userId: string
): Promise<SeasonParticipation[]> {
  const result = await requireDb()
    .select({
      participation: seasonParticipations,
      season: seasons,
    })
    .from(seasonParticipations)
    .innerJoin(seasons, eq(seasonParticipations.seasonId, seasons.id))
    .where(eq(seasonParticipations.userId, userId))
    .orderBy(desc(seasonParticipations.startedAt))

  return result.map((row) => ({
    id: row.participation.id,
    seasonId: row.participation.seasonId,
    season: formatSeason(row.season),
    seasonalXP: row.participation.seasonalXP,
    startedAt: row.participation.startedAt,
    completedAt: row.participation.completedAt,
    isCurrent: row.participation.isCurrent,
    endStats: row.participation.endStats as SeasonEndStats | null,
  }))
}

/**
 * Start a user in a season (usually Season 1 for new users)
 */
export async function startUserInSeason(
  userId: string,
  seasonId: string
): Promise<SeasonParticipation> {
  // Mark any existing current season as not current
  await requireDb()
    .update(seasonParticipations)
    .set({ isCurrent: false, updatedAt: new Date() })
    .where(
      and(
        eq(seasonParticipations.userId, userId),
        eq(seasonParticipations.isCurrent, true)
      )
    )

  // Create new participation
  const [participation] = await requireDb()
    .insert(seasonParticipations)
    .values({
      userId,
      seasonId,
      seasonalXP: 0,
      startedAt: new Date(),
      isCurrent: true,
    })
    .returning()

  const season = await getSeasonById(seasonId)
  if (!season) throw new Error('Season not found')

  return {
    id: participation!.id,
    seasonId: participation!.seasonId,
    season,
    seasonalXP: participation!.seasonalXP,
    startedAt: participation!.startedAt,
    completedAt: participation!.completedAt,
    isCurrent: participation!.isCurrent,
    endStats: null,
  }
}

/**
 * Add seasonal XP to user's current season
 */
export async function addSeasonalXP(userId: string, amount: number): Promise<void> {
  await requireDb()
    .update(seasonParticipations)
    .set({
      seasonalXP: db ? (await requireDb()
        .select({ seasonalXP: seasonParticipations.seasonalXP })
        .from(seasonParticipations)
        .where(
          and(
            eq(seasonParticipations.userId, userId),
            eq(seasonParticipations.isCurrent, true)
          )
        )
        .limit(1)
        .then(r => (r[0]?.seasonalXP ?? 0) + amount)) : amount,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(seasonParticipations.userId, userId),
        eq(seasonParticipations.isCurrent, true)
      )
    )
}

/**
 * Get season XP multiplier for a user
 */
export async function getSeasonXPMultiplier(userId: string): Promise<{
  multiplier: number
  seasonName: string | null
}> {
  const current = await getUserCurrentSeason(userId)

  if (!current) {
    // User not in a season, return 1.0x
    return { multiplier: 1.0, seasonName: null }
  }

  return {
    multiplier: current.season.xpMultiplier,
    seasonName: current.season.name,
  }
}

/**
 * Check if user should transition to next season
 */
export async function checkSeasonTransition(userId: string): Promise<{
  shouldTransition: boolean
  nextSeason: Season | null
  reason: 'level' | 'days' | null
}> {
  const current = await getUserCurrentSeason(userId)
  if (!current) {
    return { shouldTransition: false, nextSeason: null, reason: null }
  }

  // Get user's level and days in season
  const [user] = await requireDb()
    .select({ level: users.level })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!user) {
    return { shouldTransition: false, nextSeason: null, reason: null }
  }

  const daysInSeason = Math.floor(
    (Date.now() - current.startedAt.getTime()) / (1000 * 60 * 60 * 24)
  )

  // Get next season
  const nextSeason = await getSeasonByNumber(current.season.number + 1)
  if (!nextSeason) {
    // No more seasons
    return { shouldTransition: false, nextSeason: null, reason: null }
  }

  // Check level requirement
  if (
    current.season.levelRequirement &&
    user.level >= current.season.levelRequirement
  ) {
    return { shouldTransition: true, nextSeason, reason: 'level' }
  }

  // Check day requirement
  if (
    current.season.dayRequirement &&
    daysInSeason >= current.season.dayRequirement
  ) {
    return { shouldTransition: true, nextSeason, reason: 'days' }
  }

  return { shouldTransition: false, nextSeason: null, reason: null }
}

/**
 * Transition user to next season
 */
export async function transitionToNextSeason(
  userId: string,
  nextSeasonId: string,
  endStats: SeasonEndStats
): Promise<SeasonParticipation> {
  // Update current season with end stats
  await requireDb()
    .update(seasonParticipations)
    .set({
      isCurrent: false,
      completedAt: new Date(),
      endStats,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(seasonParticipations.userId, userId),
        eq(seasonParticipations.isCurrent, true)
      )
    )

  // Start new season
  return startUserInSeason(userId, nextSeasonId)
}

/**
 * Get leaderboard for a season
 */
export async function getSeasonLeaderboard(
  seasonId: string,
  limit = 50,
  offset = 0
): Promise<LeaderboardEntry[]> {
  const result = await requireDb()
    .select({
      rank: seasonLeaderboards.rank,
      userId: seasonLeaderboards.userId,
      seasonalXP: seasonLeaderboards.seasonalXP,
      userName: users.name,
      level: users.level,
    })
    .from(seasonLeaderboards)
    .innerJoin(users, eq(seasonLeaderboards.userId, users.id))
    .where(eq(seasonLeaderboards.seasonId, seasonId))
    .orderBy(asc(seasonLeaderboards.rank))
    .limit(limit)
    .offset(offset)

  return result.map((row) => ({
    rank: row.rank,
    userId: row.userId,
    userName: row.userName,
    seasonalXP: row.seasonalXP,
    level: row.level,
  }))
}

/**
 * Update leaderboard for a season (run periodically)
 */
export async function updateSeasonLeaderboard(seasonId: string): Promise<void> {
  // Get all participants ordered by seasonal XP
  const participants = await requireDb()
    .select({
      userId: seasonParticipations.userId,
      seasonalXP: seasonParticipations.seasonalXP,
    })
    .from(seasonParticipations)
    .where(eq(seasonParticipations.seasonId, seasonId))
    .orderBy(desc(seasonParticipations.seasonalXP))

  // Update leaderboard entries
  for (let i = 0; i < participants.length; i++) {
    const participant = participants[i]!
    const rank = i + 1

    // Upsert leaderboard entry
    const [existing] = await requireDb()
      .select()
      .from(seasonLeaderboards)
      .where(
        and(
          eq(seasonLeaderboards.seasonId, seasonId),
          eq(seasonLeaderboards.userId, participant.userId)
        )
      )
      .limit(1)

    if (existing) {
      await requireDb()
        .update(seasonLeaderboards)
        .set({
          rank,
          seasonalXP: participant.seasonalXP,
          snapshotAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(seasonLeaderboards.id, existing.id))
    } else {
      await requireDb().insert(seasonLeaderboards).values({
        seasonId,
        userId: participant.userId,
        rank,
        seasonalXP: participant.seasonalXP,
        snapshotAt: new Date(),
      })
    }
  }
}

function formatSeason(row: typeof seasons.$inferSelect): Season {
  return {
    id: row.id,
    number: row.number,
    name: row.name,
    theme: row.theme,
    description: row.description,
    xpMultiplier: row.xpMultiplier,
    levelRequirement: row.levelRequirement,
    dayRequirement: row.dayRequirement,
    status: row.status,
    introNarrative: row.introNarrative,
    outroNarrative: row.outroNarrative,
    contentConfig: row.contentConfig as SeasonContentConfig | null,
  }
}
