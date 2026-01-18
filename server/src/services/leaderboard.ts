import { dbClient as db } from '../db'
import { users, seasonParticipations, seasons, xpEvents } from '../db/schema'
import { eq, and, desc, gte, sql, asc } from 'drizzle-orm'

function requireDb() {
  if (!db) {
    throw new Error('Database connection required for leaderboard service')
  }
  return db
}

export interface LeaderboardEntry {
  rank: number
  displayName: string
  level: number
  xp: number
  isCurrentUser: boolean
  userId: string
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[]
  totalPlayers: number
  currentPage: number
  totalPages: number
  pageSize: number
}

export interface PlayerRankInfo {
  global: { rank: number; total: number } | null
  weekly: { rank: number; total: number } | null
  seasonal: { rank: number; total: number; seasonName: string } | null
}

/**
 * Get display name for a user - anonymous by default unless opted in
 */
function getDisplayName(
  user: {
    id: string
    name: string | null
    leaderboardOptIn: boolean
    leaderboardDisplayName: string | null
  },
  rank: number
): string {
  if (user.leaderboardOptIn) {
    return user.leaderboardDisplayName || user.name || `Player #${rank}`
  }
  // Generate a consistent anonymous identifier based on the user ID
  const idHash = user.id.slice(-5).toUpperCase()
  return `Hunter-${idHash}`
}

/**
 * Get global leaderboard (top players by total XP)
 */
export async function getGlobalLeaderboard(
  currentUserId: string,
  page = 1,
  pageSize = 100
): Promise<LeaderboardResponse> {
  const offset = (page - 1) * pageSize

  // Get total count
  const [countResult] = await requireDb()
    .select({ count: sql<number>`count(*)` })
    .from(users)

  const totalPlayers = Number(countResult?.count ?? 0)

  // Get leaderboard entries
  const result = await requireDb()
    .select({
      id: users.id,
      name: users.name,
      level: users.level,
      totalXP: users.totalXP,
      leaderboardOptIn: users.leaderboardOptIn,
      leaderboardDisplayName: users.leaderboardDisplayName,
    })
    .from(users)
    .orderBy(desc(users.totalXP), asc(users.createdAt))
    .limit(pageSize)
    .offset(offset)

  const entries: LeaderboardEntry[] = result.map((user, index) => {
    const rank = offset + index + 1
    return {
      rank,
      displayName: getDisplayName(user, rank),
      level: user.level,
      xp: user.totalXP,
      isCurrentUser: user.id === currentUserId,
      userId: user.id,
    }
  })

  return {
    entries,
    totalPlayers,
    currentPage: page,
    totalPages: Math.ceil(totalPlayers / pageSize),
    pageSize,
  }
}

/**
 * Get weekly leaderboard (XP earned this week)
 */
export async function getWeeklyLeaderboard(
  currentUserId: string,
  page = 1,
  pageSize = 100
): Promise<LeaderboardResponse> {
  const offset = (page - 1) * pageSize

  // Get start of current week (Monday)
  const now = new Date()
  const dayOfWeek = now.getUTCDay()
  const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  const weekStart = new Date(now)
  weekStart.setUTCDate(now.getUTCDate() - daysToSubtract)
  weekStart.setUTCHours(0, 0, 0, 0)

  // Get weekly XP totals
  const weeklyXPQuery = requireDb()
    .select({
      userId: xpEvents.userId,
      weeklyXP: sql<number>`sum(${xpEvents.finalAmount})`.as('weekly_xp'),
    })
    .from(xpEvents)
    .where(gte(xpEvents.createdAt, weekStart))
    .groupBy(xpEvents.userId)
    .as('weekly_xp')

  // Get total count of players with weekly activity
  const [countResult] = await requireDb()
    .select({ count: sql<number>`count(*)` })
    .from(weeklyXPQuery)

  const totalPlayers = Number(countResult?.count ?? 0)

  // Get leaderboard entries
  const result = await requireDb()
    .select({
      id: users.id,
      name: users.name,
      level: users.level,
      weeklyXP: weeklyXPQuery.weeklyXP,
      leaderboardOptIn: users.leaderboardOptIn,
      leaderboardDisplayName: users.leaderboardDisplayName,
    })
    .from(weeklyXPQuery)
    .innerJoin(users, eq(weeklyXPQuery.userId, users.id))
    .orderBy(desc(weeklyXPQuery.weeklyXP))
    .limit(pageSize)
    .offset(offset)

  const entries: LeaderboardEntry[] = result.map((row, index) => {
    const rank = offset + index + 1
    return {
      rank,
      displayName: getDisplayName(
        {
          id: row.id,
          name: row.name,
          leaderboardOptIn: row.leaderboardOptIn,
          leaderboardDisplayName: row.leaderboardDisplayName,
        },
        rank
      ),
      level: row.level,
      xp: Number(row.weeklyXP ?? 0),
      isCurrentUser: row.id === currentUserId,
      userId: row.id,
    }
  })

  return {
    entries,
    totalPlayers,
    currentPage: page,
    totalPages: Math.ceil(totalPlayers / pageSize) || 1,
    pageSize,
  }
}

/**
 * Get seasonal leaderboard (XP earned this season)
 */
export async function getSeasonalLeaderboard(
  currentUserId: string,
  seasonId?: string,
  page = 1,
  pageSize = 100
): Promise<LeaderboardResponse & { seasonName: string | null }> {
  const offset = (page - 1) * pageSize

  // Get current active season if not specified
  let targetSeasonId = seasonId
  let seasonName: string | null = null

  if (!targetSeasonId) {
    const [activeSeason] = await requireDb()
      .select({ id: seasons.id, name: seasons.name })
      .from(seasons)
      .where(eq(seasons.status, 'ACTIVE'))
      .limit(1)

    if (activeSeason) {
      targetSeasonId = activeSeason.id
      seasonName = activeSeason.name
    }
  } else {
    const [season] = await requireDb()
      .select({ name: seasons.name })
      .from(seasons)
      .where(eq(seasons.id, targetSeasonId))
      .limit(1)

    seasonName = season?.name ?? null
  }

  if (!targetSeasonId) {
    return {
      entries: [],
      totalPlayers: 0,
      currentPage: page,
      totalPages: 0,
      pageSize,
      seasonName: null,
    }
  }

  // Get total count
  const [countResult] = await requireDb()
    .select({ count: sql<number>`count(*)` })
    .from(seasonParticipations)
    .where(eq(seasonParticipations.seasonId, targetSeasonId))

  const totalPlayers = Number(countResult?.count ?? 0)

  // Get leaderboard entries
  const result = await requireDb()
    .select({
      id: users.id,
      name: users.name,
      level: users.level,
      seasonalXP: seasonParticipations.seasonalXP,
      leaderboardOptIn: users.leaderboardOptIn,
      leaderboardDisplayName: users.leaderboardDisplayName,
    })
    .from(seasonParticipations)
    .innerJoin(users, eq(seasonParticipations.userId, users.id))
    .where(eq(seasonParticipations.seasonId, targetSeasonId))
    .orderBy(desc(seasonParticipations.seasonalXP))
    .limit(pageSize)
    .offset(offset)

  const entries: LeaderboardEntry[] = result.map((row, index) => {
    const rank = offset + index + 1
    return {
      rank,
      displayName: getDisplayName(
        {
          id: row.id,
          name: row.name,
          leaderboardOptIn: row.leaderboardOptIn,
          leaderboardDisplayName: row.leaderboardDisplayName,
        },
        rank
      ),
      level: row.level,
      xp: row.seasonalXP,
      isCurrentUser: row.id === currentUserId,
      userId: row.id,
    }
  })

  return {
    entries,
    totalPlayers,
    currentPage: page,
    totalPages: Math.ceil(totalPlayers / pageSize) || 1,
    pageSize,
    seasonName,
  }
}

/**
 * Get player's rank in each leaderboard
 */
export async function getPlayerRanks(userId: string): Promise<PlayerRankInfo> {
  // Global rank
  const globalRank = await getGlobalRank(userId)

  // Weekly rank
  const weeklyRank = await getWeeklyRank(userId)

  // Seasonal rank
  const seasonalRank = await getSeasonalRank(userId)

  return {
    global: globalRank,
    weekly: weeklyRank,
    seasonal: seasonalRank,
  }
}

/**
 * Get user's global rank
 */
async function getGlobalRank(
  userId: string
): Promise<{ rank: number; total: number } | null> {
  // Get user's total XP
  const [user] = await requireDb()
    .select({ totalXP: users.totalXP })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!user) return null

  // Count users with higher XP
  const [rankResult] = await requireDb()
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .where(sql`${users.totalXP} > ${user.totalXP}`)

  const rank = Number(rankResult?.count ?? 0) + 1

  // Get total count
  const [totalResult] = await requireDb()
    .select({ count: sql<number>`count(*)` })
    .from(users)

  return {
    rank,
    total: Number(totalResult?.count ?? 0),
  }
}

/**
 * Get user's weekly rank
 */
async function getWeeklyRank(
  userId: string
): Promise<{ rank: number; total: number } | null> {
  // Get start of current week (Monday)
  const now = new Date()
  const dayOfWeek = now.getUTCDay()
  const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  const weekStart = new Date(now)
  weekStart.setUTCDate(now.getUTCDate() - daysToSubtract)
  weekStart.setUTCHours(0, 0, 0, 0)

  // Get user's weekly XP
  const [userXP] = await requireDb()
    .select({ weeklyXP: sql<number>`sum(${xpEvents.finalAmount})` })
    .from(xpEvents)
    .where(and(eq(xpEvents.userId, userId), gte(xpEvents.createdAt, weekStart)))

  const userWeeklyXP = Number(userXP?.weeklyXP ?? 0)

  if (userWeeklyXP === 0) return null

  // Get weekly XP totals for all users
  const weeklyXPQuery = requireDb()
    .select({
      userId: xpEvents.userId,
      weeklyXP: sql<number>`sum(${xpEvents.finalAmount})`.as('weekly_xp'),
    })
    .from(xpEvents)
    .where(gte(xpEvents.createdAt, weekStart))
    .groupBy(xpEvents.userId)
    .as('weekly_xp')

  // Count users with higher weekly XP
  const [rankResult] = await requireDb()
    .select({ count: sql<number>`count(*)` })
    .from(weeklyXPQuery)
    .where(sql`${weeklyXPQuery.weeklyXP} > ${userWeeklyXP}`)

  const rank = Number(rankResult?.count ?? 0) + 1

  // Get total count
  const [totalResult] = await requireDb()
    .select({ count: sql<number>`count(*)` })
    .from(weeklyXPQuery)

  return {
    rank,
    total: Number(totalResult?.count ?? 0),
  }
}

/**
 * Get user's seasonal rank
 */
async function getSeasonalRank(
  userId: string
): Promise<{ rank: number; total: number; seasonName: string } | null> {
  // Get user's current season participation
  const [participation] = await requireDb()
    .select({
      seasonId: seasonParticipations.seasonId,
      seasonalXP: seasonParticipations.seasonalXP,
    })
    .from(seasonParticipations)
    .where(
      and(
        eq(seasonParticipations.userId, userId),
        eq(seasonParticipations.isCurrent, true)
      )
    )
    .limit(1)

  if (!participation) return null

  // Get season name
  const [season] = await requireDb()
    .select({ name: seasons.name })
    .from(seasons)
    .where(eq(seasons.id, participation.seasonId))
    .limit(1)

  if (!season) return null

  // Count users with higher seasonal XP in same season
  const [rankResult] = await requireDb()
    .select({ count: sql<number>`count(*)` })
    .from(seasonParticipations)
    .where(
      and(
        eq(seasonParticipations.seasonId, participation.seasonId),
        sql`${seasonParticipations.seasonalXP} > ${participation.seasonalXP}`
      )
    )

  const rank = Number(rankResult?.count ?? 0) + 1

  // Get total count
  const [totalResult] = await requireDb()
    .select({ count: sql<number>`count(*)` })
    .from(seasonParticipations)
    .where(eq(seasonParticipations.seasonId, participation.seasonId))

  return {
    rank,
    total: Number(totalResult?.count ?? 0),
    seasonName: season.name,
  }
}

/**
 * Update user's leaderboard display preferences
 */
export async function updateLeaderboardPreferences(
  userId: string,
  optIn: boolean,
  displayName?: string
): Promise<void> {
  await requireDb()
    .update(users)
    .set({
      leaderboardOptIn: optIn,
      leaderboardDisplayName: displayName || null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
}

/**
 * Get user's leaderboard preferences
 */
export async function getLeaderboardPreferences(userId: string): Promise<{
  optIn: boolean
  displayName: string | null
}> {
  const [user] = await requireDb()
    .select({
      leaderboardOptIn: users.leaderboardOptIn,
      leaderboardDisplayName: users.leaderboardDisplayName,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  return {
    optIn: user?.leaderboardOptIn ?? false,
    displayName: user?.leaderboardDisplayName ?? null,
  }
}
