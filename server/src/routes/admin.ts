/**
 * Admin Routes
 * 
 * Protected admin endpoints for metrics and service management.
 */

import { Hono } from 'hono'
import { getUser } from '../lib/auth'
import {
  getMetricsDashboard,
  getUserMetrics,
  getQuestMetrics,
  getPerformanceMetrics,
  getGameMetrics,
  getRecentErrors,
  getMetricsTimeSeries,
} from '../services/metrics'
import { sendWeeklyReportsToAll } from '../services/email'
import { cache } from '../lib/cache'

const admin = new Hono()

/**
 * Middleware to check admin status
 */
admin.use('/*', async (c, next) => {
  const user = getUser(c)
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  
  // Check if user is admin (would check role in database)
  // For now, we'll use email check as placeholder
  const isAdmin = user.email?.endsWith('@journey.app') || 
                  user.email === 'admin@example.com'
  
  if (!isAdmin) {
    return c.json({ error: 'Forbidden: Admin access required' }, 403)
  }
  
  await next()
})

/**
 * GET /admin/metrics - Full metrics dashboard
 */
admin.get('/metrics', async (c) => {
  try {
    const dashboard = await getMetricsDashboard()
    return c.json(dashboard)
  } catch (error) {
    console.error('Error fetching metrics:', error)
    return c.json({ error: 'Failed to fetch metrics' }, 500)
  }
})

/**
 * GET /admin/metrics/users - User metrics only
 */
admin.get('/metrics/users', async (c) => {
  try {
    const metrics = await getUserMetrics()
    return c.json(metrics)
  } catch (error) {
    console.error('Error fetching user metrics:', error)
    return c.json({ error: 'Failed to fetch user metrics' }, 500)
  }
})

/**
 * GET /admin/metrics/quests - Quest metrics only
 */
admin.get('/metrics/quests', async (c) => {
  try {
    const metrics = await getQuestMetrics()
    return c.json(metrics)
  } catch (error) {
    console.error('Error fetching quest metrics:', error)
    return c.json({ error: 'Failed to fetch quest metrics' }, 500)
  }
})

/**
 * GET /admin/metrics/performance - Performance metrics only
 */
admin.get('/metrics/performance', (c) => {
  try {
    const metrics = getPerformanceMetrics()
    return c.json(metrics)
  } catch (error) {
    console.error('Error fetching performance metrics:', error)
    return c.json({ error: 'Failed to fetch performance metrics' }, 500)
  }
})

/**
 * GET /admin/metrics/game - Game metrics only
 */
admin.get('/metrics/game', async (c) => {
  try {
    const metrics = await getGameMetrics()
    return c.json(metrics)
  } catch (error) {
    console.error('Error fetching game metrics:', error)
    return c.json({ error: 'Failed to fetch game metrics' }, 500)
  }
})

/**
 * GET /admin/errors - Recent errors
 */
admin.get('/errors', (c) => {
  const limit = parseInt(c.req.query('limit') ?? '20')
  const errors = getRecentErrors(Math.min(limit, 100))
  return c.json({ errors })
})

/**
 * GET /admin/metrics/timeseries - Time series data for charts
 */
admin.get('/metrics/timeseries', (c) => {
  const metric = c.req.query('metric') as 'requests' | 'errors' | undefined
  const intervalMinutes = parseInt(c.req.query('interval') ?? '5')
  const periodHours = parseInt(c.req.query('period') ?? '1')
  
  if (metric !== 'requests' && metric !== 'errors') {
    return c.json({ error: 'Invalid metric. Use "requests" or "errors"' }, 400)
  }
  
  const data = getMetricsTimeSeries(metric, intervalMinutes, periodHours)
  return c.json({ metric, data })
})

/**
 * GET /admin/health - Service health check
 */
admin.get('/health', (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version ?? 'unknown',
    uptime: process.uptime(),
    memory: {
      used: process.memoryUsage().heapUsed,
      total: process.memoryUsage().heapTotal,
    },
  })
})

/**
 * POST /admin/emails/weekly-reports - Trigger weekly email reports
 *
 * This endpoint is designed to be called by a cron job (e.g., every Sunday).
 * It sends weekly progress reports to all opted-in users.
 */
admin.post('/emails/weekly-reports', async (c) => {
  try {
    console.log('[ADMIN] Triggering weekly email reports...')
    const result = await sendWeeklyReportsToAll()

    return c.json({
      success: true,
      message: `Weekly reports sent: ${result.sent}/${result.total} successful`,
      details: result,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[ADMIN] Weekly reports error:', error)
    return c.json({
      success: false,
      error: 'Failed to send weekly reports',
      timestamp: new Date().toISOString(),
    }, 500)
  }
})

/**
 * GET /admin/cache - Cache statistics
 */
admin.get('/cache', (c) => {
  const stats = cache.stats()
  return c.json({
    size: stats.size,
    maxSize: stats.maxSize,
    hits: stats.hits,
    misses: stats.misses,
    hitRate: `${stats.hitRate}%`,
    entries: stats.keys.length,
    keys: stats.keys.slice(0, 100), // Limit for readability
    timestamp: new Date().toISOString(),
  })
})

/**
 * POST /admin/cache/clear - Clear all cache
 */
admin.post('/cache/clear', (c) => {
  cache.clear()
  return c.json({
    success: true,
    message: 'Cache cleared',
    timestamp: new Date().toISOString(),
  })
})

/**
 * DELETE /admin/cache/:pattern - Clear cache by pattern
 */
admin.delete('/cache/:pattern', (c) => {
  const pattern = decodeURIComponent(c.req.param('pattern'))
  const count = cache.invalidateByPattern(pattern)
  return c.json({
    success: true,
    message: `Invalidated ${count} cache entries`,
    pattern,
    timestamp: new Date().toISOString(),
  })
})

export default admin
