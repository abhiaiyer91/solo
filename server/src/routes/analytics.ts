/**
 * Analytics Routes
 * Player analytics and insights API
 */

import { Hono } from 'hono'
import { getUser } from '../lib/auth'
import { cacheResponse, CACHE_PRESETS } from '../lib/cache'
import {
  getAnalyticsSummary,
  getQuestTrend,
  getXPTrend,
  getActivityHeatmap,
  getPersonalBests,
} from '../services/analytics'

const analytics = new Hono()

// All analytics routes require authentication
analytics.use('/*', async (c, next) => {
  const user = getUser(c)
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  c.set('userId', user.id)
  await next()
})

/**
 * GET /analytics/summary - Get analytics summary
 * Query params:
 *   - period: 'week' | 'month' | 'alltime' (default: 'week')
 */
analytics.get(
  '/summary',
  cacheResponse({ ...CACHE_PRESETS.stats, ttlSeconds: 60 }),
  async (c) => {
    const userId = c.get('userId')
    const period = (c.req.query('period') as 'week' | 'month' | 'alltime') || 'week'

    try {
      const summary = await getAnalyticsSummary(userId, period)
      return c.json(summary)
    } catch (error) {
      console.error('Error fetching analytics summary:', error)
      return c.json({ error: 'Failed to fetch analytics' }, 500)
    }
  }
)

/**
 * GET /analytics/quests/trend - Get quest completion trend
 * Query params:
 *   - days: number (default: 30)
 */
analytics.get(
  '/quests/trend',
  cacheResponse({ ...CACHE_PRESETS.stats, ttlSeconds: 120 }),
  async (c) => {
    const userId = c.get('userId')
    const days = parseInt(c.req.query('days') ?? '30')

    try {
      const trend = await getQuestTrend(userId, Math.min(days, 365))
      return c.json({ data: trend })
    } catch (error) {
      console.error('Error fetching quest trend:', error)
      return c.json({ error: 'Failed to fetch quest trend' }, 500)
    }
  }
)

/**
 * GET /analytics/xp/trend - Get XP earning trend
 * Query params:
 *   - days: number (default: 30)
 */
analytics.get(
  '/xp/trend',
  cacheResponse({ ...CACHE_PRESETS.stats, ttlSeconds: 120 }),
  async (c) => {
    const userId = c.get('userId')
    const days = parseInt(c.req.query('days') ?? '30')

    try {
      const trend = await getXPTrend(userId, Math.min(days, 365))
      return c.json({ data: trend })
    } catch (error) {
      console.error('Error fetching XP trend:', error)
      return c.json({ error: 'Failed to fetch XP trend' }, 500)
    }
  }
)

/**
 * GET /analytics/activity/heatmap - Get activity heatmap data
 * Query params:
 *   - days: number (default: 90)
 */
analytics.get(
  '/activity/heatmap',
  cacheResponse({ ...CACHE_PRESETS.stats, ttlSeconds: 300 }),
  async (c) => {
    const userId = c.get('userId')
    const days = parseInt(c.req.query('days') ?? '90')

    try {
      const heatmap = await getActivityHeatmap(userId, Math.min(days, 365))
      return c.json({ data: heatmap })
    } catch (error) {
      console.error('Error fetching activity heatmap:', error)
      return c.json({ error: 'Failed to fetch activity heatmap' }, 500)
    }
  }
)

/**
 * GET /analytics/personal-bests - Get personal best records
 */
analytics.get(
  '/personal-bests',
  cacheResponse({ ...CACHE_PRESETS.stats, ttlSeconds: 300 }),
  async (c) => {
    const userId = c.get('userId')

    try {
      const bests = await getPersonalBests(userId)
      return c.json(bests)
    } catch (error) {
      console.error('Error fetching personal bests:', error)
      return c.json({ error: 'Failed to fetch personal bests' }, 500)
    }
  }
)

export default analytics
