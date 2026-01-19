import { Hono } from 'hono'
import { requireAuth } from '../middleware/auth'
import { dbClient as db } from '../db'
import { logger } from '../lib/logger'
import { users } from '../db/schema'
import { eq } from 'drizzle-orm'
import { xpToNextLevel } from '../services/level'
import { getStreakInfo } from '../services/streak'
import { getDebuffStatus } from '../services/debuff'
import {
  getUserTitles,
  getActiveTitle,
  setActiveTitle,
  getActiveTitleBonus,
} from '../services/title'
import { getXPTimeline, getXPEventBreakdown } from '../services/xp'
import { getProgressionSummary } from '../services/progression'
import {
  getWeeklySummary,
  getWeeklyHistory,
  shouldShowWeeklySummary,
} from '../services/weekly-summary'
import { cacheResponse, CACHE_PRESETS } from '../lib/cache'

const statsRoutes = new Hono()

// Level progress (cached 5 min)
statsRoutes.get('/player/level-progress', requireAuth, cacheResponse(CACHE_PRESETS.stats), async (c) => {
  const user = c.get('user')!

  if (!db) {
    return c.json({ error: 'Database unavailable' }, 500)
  }

  try {
    const [dbUser] = await db.select().from(users).where(eq(users.id, user.id)).limit(1)
    if (!dbUser) {
      return c.json({ error: 'User not found' }, 404)
    }

    const totalXP = typeof dbUser.totalXP === 'bigint' ? dbUser.totalXP : BigInt(dbUser.totalXP)
    const progress = xpToNextLevel(totalXP)
    return c.json({
      currentLevel: progress.currentLevel,
      xpProgress: Number(progress.xpProgress),
      xpNeeded: Number(progress.xpNeeded),
      progressPercent: progress.progressPercent,
      totalXP: Number(totalXP),
    })
  } catch (error) {
    logger.error('Level progress error', { error })
    return c.json({ error: 'Failed to get level progress' }, 500)
  }
})

// Streak info (cached 1 min)
statsRoutes.get('/player/streak', requireAuth, cacheResponse(CACHE_PRESETS.short), async (c) => {
  const user = c.get('user')!

  try {
    const streakInfo = await getStreakInfo(user.id)
    return c.json(streakInfo)
  } catch (error) {
    logger.error('Streak info error', { error })
    return c.json({ error: 'Failed to get streak info' }, 500)
  }
})

// Debuff status
statsRoutes.get('/player/debuff', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const debuffStatus = await getDebuffStatus(user.id)
    return c.json(debuffStatus)
  } catch (error) {
    logger.error('Debuff status error', { error })
    return c.json({ error: 'Failed to get debuff status' }, 500)
  }
})

// Unlock progression status
statsRoutes.get('/player/unlocks', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    // Get lastSeenUnlocks from query params (comma-separated)
    const lastSeenParam = c.req.query('lastSeen') ?? ''
    const lastSeenUnlockIds = lastSeenParam ? lastSeenParam.split(',') : []

    const summary = await getProgressionSummary(user.id, lastSeenUnlockIds)
    return c.json(summary)
  } catch (error) {
    logger.error('Unlock progression error', { error })
    return c.json({ error: 'Failed to get unlock progression' }, 500)
  }
})

// Player titles
statsRoutes.get('/player/titles', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const userTitleList = await getUserTitles(user.id)
    const activeTitle = await getActiveTitle(user.id)
    const activeBonus = await getActiveTitleBonus(user.id)

    return c.json({
      titles: userTitleList,
      activeTitle,
      activeBonus,
    })
  } catch (error) {
    logger.error('Get user titles error', { error })
    return c.json({ error: 'Failed to get user titles' }, 500)
  }
})

// Set active title
statsRoutes.put('/player/title/active', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const body = await c.req.json<{ titleId: string | null }>()
    await setActiveTitle(user.id, body.titleId)

    const activeTitle = body.titleId ? await getActiveTitle(user.id) : null
    return c.json({
      message: body.titleId ? 'Title equipped' : 'Title unequipped',
      activeTitle,
    })
  } catch (error) {
    logger.error('Set active title error', { error })
    const message = error instanceof Error ? error.message : 'Failed to set active title'
    return c.json({ error: message }, 400)
  }
})

// XP timeline
statsRoutes.get('/xp/timeline', requireAuth, async (c) => {
  const user = c.get('user')!
  const limit = parseInt(c.req.query('limit') || '50')
  const offset = parseInt(c.req.query('offset') || '0')

  try {
    const events = await getXPTimeline(user.id, limit, offset)
    return c.json({
      events: events.map((e) => ({
        ...e,
        totalXPBefore: Number(e.totalXPBefore),
        totalXPAfter: Number(e.totalXPAfter),
      })),
    })
  } catch (error) {
    logger.error('XP timeline error', { error })
    return c.json({ error: 'Failed to get XP timeline' }, 500)
  }
})

// XP event breakdown
statsRoutes.get('/xp/:eventId/breakdown', requireAuth, async (c) => {
  const eventId = c.req.param('eventId')

  try {
    const result = await getXPEventBreakdown(eventId)
    if (!result) {
      return c.json({ error: 'Event not found' }, 404)
    }
    return c.json({
      event: {
        ...result.event,
        totalXPBefore: Number(result.event.totalXPBefore),
        totalXPAfter: Number(result.event.totalXPAfter),
      },
      modifiers: result.modifiers,
    })
  } catch (error) {
    logger.error('XP breakdown error', { error })
    return c.json({ error: 'Failed to get XP breakdown' }, 500)
  }
})

// Weekly summary (for Monday display)
statsRoutes.get('/player/weekly-summary', requireAuth, async (c) => {
  const user = c.get('user')!
  const lastDismissedWeek = c.req.query('lastDismissed') ?? undefined

  try {
    const result = await shouldShowWeeklySummary(user.id, lastDismissedWeek)
    return c.json(result)
  } catch (error) {
    logger.error('Weekly summary error', { error })
    return c.json({ error: 'Failed to get weekly summary' }, 500)
  }
})

// Get specific week's summary
statsRoutes.get('/player/weekly-summary/:offset', requireAuth, async (c) => {
  const user = c.get('user')!
  const offset = parseInt(c.req.param('offset') || '1', 10)

  try {
    const summary = await getWeeklySummary(user.id, offset)
    if (!summary) {
      return c.json({ error: 'No data for this week' }, 404)
    }
    return c.json(summary)
  } catch (error) {
    logger.error('Weekly summary error', { error })
    return c.json({ error: 'Failed to get weekly summary' }, 500)
  }
})

// Weekly history (past N weeks)
statsRoutes.get('/player/weekly-history', requireAuth, async (c) => {
  const user = c.get('user')!
  const weeks = parseInt(c.req.query('weeks') || '4', 10)

  try {
    const history = await getWeeklyHistory(user.id, Math.min(weeks, 12))
    return c.json(history)
  } catch (error) {
    logger.error('Weekly history error', { error })
    return c.json({ error: 'Failed to get weekly history' }, 500)
  }
})

export default statsRoutes
