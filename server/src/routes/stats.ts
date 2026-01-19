/**
 * Stats API Routes
 * 
 * Endpoints for player stats with real-world benchmarks.
 */

import { Hono } from 'hono'
import { requireAuth } from '../middleware/auth'
import {
  calculateStat,
  calculateAllStats,
  getAllMilestones,
  updateUserStats,
} from '../services/stats'
import { type StatType } from '../lib/stat-benchmarks'

const statsRoutes = new Hono()

/**
 * GET /stats
 * Get all stats for the current user
 */
statsRoutes.get('/stats', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const stats = await calculateAllStats(user.id)

    return c.json({
      ...stats,
      message: '[SYSTEM] Stats calculated from your baseline and activity.',
    })
  } catch (error) {
    console.error('Get stats error:', error)
    return c.json({ error: 'Failed to get stats' }, 500)
  }
})

/**
 * GET /stats/breakdown
 * Get detailed breakdown for a specific stat
 * Query: ?stat=STR|AGI|VIT|DISC
 */
statsRoutes.get('/stats/breakdown', requireAuth, async (c) => {
  const user = c.get('user')!
  const statParam = c.req.query('stat')?.toUpperCase()

  if (!statParam || !['STR', 'AGI', 'VIT', 'DISC'].includes(statParam)) {
    return c.json({
      error: 'Invalid stat',
      message: '[SYSTEM] Specify stat: STR, AGI, VIT, or DISC',
    }, 400)
  }

  try {
    const breakdown = await calculateStat(user.id, statParam as StatType)

    return c.json({
      ...breakdown,
      message: `[SYSTEM] ${statParam} breakdown retrieved.`,
    })
  } catch (error) {
    console.error('Get stat breakdown error:', error)
    return c.json({ error: 'Failed to get stat breakdown' }, 500)
  }
})

/**
 * GET /stats/milestones
 * Get next milestone for each stat
 */
statsRoutes.get('/stats/milestones', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const milestones = await getAllMilestones(user.id)

    return c.json({
      milestones,
      message: '[SYSTEM] Milestones identified. Push harder.',
    })
  } catch (error) {
    console.error('Get milestones error:', error)
    return c.json({ error: 'Failed to get milestones' }, 500)
  }
})

/**
 * POST /stats/refresh
 * Recalculate and update stored stats
 */
statsRoutes.post('/stats/refresh', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    await updateUserStats(user.id)
    const stats = await calculateAllStats(user.id)

    return c.json({
      ...stats,
      message: '[SYSTEM] Stats recalculated and saved.',
    })
  } catch (error) {
    console.error('Refresh stats error:', error)
    return c.json({ error: 'Failed to refresh stats' }, 500)
  }
})

export default statsRoutes
