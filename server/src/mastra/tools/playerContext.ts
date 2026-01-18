import { createTool } from '@mastra/core/tools'
import { z } from 'zod'
import { dbClient as db } from '../../db'
import { users, dailyLogs, userTitles, titles } from '../../db/schema'
import { eq, desc, and } from 'drizzle-orm'
import { xpToNextLevel } from '../../services/level'
import { getStreakBonus } from '../../services/streak'

/**
 * Player context data for narrative generation
 */
export interface PlayerContext {
  // Core stats
  userId: string
  level: number
  totalXP: number
  xpProgress: {
    currentLevel: number
    xpForCurrentLevel: bigint
    xpForNextLevel: bigint
    xpProgress: bigint
    xpNeeded: bigint
    progressPercent: number
  }

  // Attributes
  stats: {
    str: number
    agi: number
    vit: number
    disc: number
  }

  // Streak info
  currentStreak: number
  longestStreak: number
  perfectStreak: number
  streakBonus: {
    tier: 'none' | 'bronze' | 'silver' | 'gold'
    percent: number
  }

  // Debuff status
  hasDebuff: boolean
  debuffActiveUntil: Date | null

  // Active title
  activeTitle: {
    name: string
    description: string
  } | null

  // Recent activity
  lastActivityDate: string | null
  daysSinceLastActivity: number | null

  // Today's progress
  todayProgress: {
    coreQuestsTotal: number
    coreQuestsCompleted: number
    bonusQuestsCompleted: number
    xpEarned: number
    isPerfectDay: boolean
  } | null
}

/**
 * Get player context from database
 */
async function fetchPlayerContext(userId: string): Promise<PlayerContext | null> {
  if (!db) {
    console.warn('[MASTRA] Database not available for player context')
    return null
  }

  try {
    // Fetch user data
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    if (!user) {
      return null
    }

    // Calculate XP progress
    const xpProgress = xpToNextLevel(BigInt(user.totalXP))

    // Get streak bonus
    const streakBonus = getStreakBonus(user.currentStreak)

    // Check debuff status
    const now = new Date()
    const hasDebuff = user.debuffActiveUntil ? user.debuffActiveUntil > now : false

    // Get active title if set
    let activeTitle: PlayerContext['activeTitle'] = null
    if (user.activeTitleId) {
      const [userTitle] = await db
        .select({
          name: titles.name,
          description: titles.description,
        })
        .from(userTitles)
        .innerJoin(titles, eq(userTitles.titleId, titles.id))
        .where(and(eq(userTitles.userId, userId), eq(userTitles.titleId, user.activeTitleId)))
        .limit(1)

      if (userTitle) {
        activeTitle = {
          name: userTitle.name,
          description: userTitle.description,
        }
      }
    }

    // Get most recent activity
    const [recentLog] = await db
      .select()
      .from(dailyLogs)
      .where(eq(dailyLogs.userId, userId))
      .orderBy(desc(dailyLogs.logDate))
      .limit(1)

    const lastActivityDate = recentLog?.logDate ?? null
    let daysSinceLastActivity: number | null = null
    if (lastActivityDate) {
      const lastDate = new Date(lastActivityDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      lastDate.setHours(0, 0, 0, 0)
      daysSinceLastActivity = Math.floor(
        (today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
      )
    }

    // Get today's log if exists
    const todayStr = new Date().toISOString().split('T')[0]!
    const [todayLog] = await db
      .select()
      .from(dailyLogs)
      .where(and(eq(dailyLogs.userId, userId), eq(dailyLogs.logDate, todayStr)))
      .limit(1)

    const todayProgress: PlayerContext['todayProgress'] = todayLog
      ? {
          coreQuestsTotal: todayLog.coreQuestsTotal,
          coreQuestsCompleted: todayLog.coreQuestsCompleted,
          bonusQuestsCompleted: todayLog.bonusQuestsCompleted,
          xpEarned: todayLog.xpEarned,
          isPerfectDay: todayLog.isPerfectDay,
        }
      : null

    return {
      userId,
      level: user.level,
      totalXP: user.totalXP,
      xpProgress,
      stats: {
        str: user.str,
        agi: user.agi,
        vit: user.vit,
        disc: user.disc,
      },
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      perfectStreak: user.perfectStreak,
      streakBonus,
      hasDebuff,
      debuffActiveUntil: user.debuffActiveUntil,
      activeTitle,
      lastActivityDate,
      daysSinceLastActivity,
      todayProgress,
    }
  } catch (error) {
    console.error('[MASTRA] Error fetching player context:', error)
    return null
  }
}

/**
 * Mastra tool for fetching player context
 * Used by the narrator agent to personalize narrative generation
 */
export const getPlayerContextTool = createTool({
  id: 'getPlayerContext',
  description:
    'Fetches the current player context including level, stats, streak, debuff status, and recent activity. Use this to personalize narrative messages.',
  inputSchema: z.object({
    userId: z.string().describe('The user ID to fetch context for'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    context: z
      .object({
        userId: z.string(),
        level: z.number(),
        totalXP: z.number(),
        currentStreak: z.number(),
        longestStreak: z.number(),
        perfectStreak: z.number(),
        hasDebuff: z.boolean(),
        activeTitle: z.string().nullable(),
        daysSinceLastActivity: z.number().nullable(),
        streakTier: z.enum(['none', 'bronze', 'silver', 'gold']),
        streakBonusPercent: z.number(),
        stats: z.object({
          str: z.number(),
          agi: z.number(),
          vit: z.number(),
          disc: z.number(),
        }),
        todayProgress: z
          .object({
            coreQuestsCompleted: z.number(),
            coreQuestsTotal: z.number(),
            xpEarned: z.number(),
            isPerfectDay: z.boolean(),
          })
          .nullable(),
      })
      .nullable(),
    error: z.string().optional(),
  }),
  execute: async ({ context }) => {
    const playerContext = await fetchPlayerContext(context.userId)

    if (!playerContext) {
      return {
        success: false,
        context: null,
        error: 'Player not found or database unavailable',
      }
    }

    return {
      success: true,
      context: {
        userId: playerContext.userId,
        level: playerContext.level,
        totalXP: playerContext.totalXP,
        currentStreak: playerContext.currentStreak,
        longestStreak: playerContext.longestStreak,
        perfectStreak: playerContext.perfectStreak,
        hasDebuff: playerContext.hasDebuff,
        activeTitle: playerContext.activeTitle?.name ?? null,
        daysSinceLastActivity: playerContext.daysSinceLastActivity,
        streakTier: playerContext.streakBonus.tier,
        streakBonusPercent: playerContext.streakBonus.percent,
        stats: playerContext.stats,
        todayProgress: playerContext.todayProgress
          ? {
              coreQuestsCompleted: playerContext.todayProgress.coreQuestsCompleted,
              coreQuestsTotal: playerContext.todayProgress.coreQuestsTotal,
              xpEarned: playerContext.todayProgress.xpEarned,
              isPerfectDay: playerContext.todayProgress.isPerfectDay,
            }
          : null,
      },
    }
  },
})

// Export the fetch function for direct use
export { fetchPlayerContext }
