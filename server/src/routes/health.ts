/**
 * Health check endpoint
 * Used for monitoring and load balancer health checks
 * Also handles health data sync from mobile devices
 */

import { Hono } from 'hono'
import { dbClient } from '../db'
import { sql } from 'drizzle-orm'
import { logger } from '../lib/logger'
import { requireAuth } from '../middleware/auth'
import { syncHealthData, getTodayHealthSnapshot, type HealthSyncRequest } from '../services/health'
import { autoEvaluateQuestsFromHealth } from '../services/quest-progress'

const app = new Hono()

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  version: string
  uptime: number
  checks: {
    database: 'ok' | 'error'
  }
  error?: string
}

const startTime = Date.now()

/**
 * Basic health check - returns 200 if server is running
 */
app.get('/', async (c) => {
  const version = process.env.APP_VERSION || 'dev'
  const uptime = Math.floor((Date.now() - startTime) / 1000)

  let dbStatus: 'ok' | 'error' = 'ok'
  let error: string | undefined

  // Check database connection
  try {
    if (dbClient) {
      await dbClient.execute(sql`SELECT 1`)
    } else {
      dbStatus = 'error'
      error = 'Database client not initialized'
    }
  } catch (e) {
    dbStatus = 'error'
    error = e instanceof Error ? e.message : 'Database connection failed'
    logger.error('Health check database error', { error })
  }

  const status: HealthStatus = {
    status: dbStatus === 'ok' ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    version,
    uptime,
    checks: {
      database: dbStatus,
    },
  }

  if (error) {
    status.error = error
  }

  const statusCode = status.status === 'healthy' ? 200 : 503

  return c.json(status, statusCode)
})

/**
 * Liveness probe - just checks if server can respond
 */
app.get('/live', (c) => {
  return c.json({ status: 'ok' })
})

/**
 * Readiness probe - checks if server is ready to accept traffic
 */
app.get('/ready', async (c) => {
  try {
    if (dbClient) {
      await dbClient.execute(sql`SELECT 1`)
      return c.json({ status: 'ready' })
    } else {
      return c.json({ status: 'not ready', reason: 'database not initialized' }, 503)
    }
  } catch (e) {
    const error = e instanceof Error ? e.message : 'Unknown error'
    return c.json({ status: 'not ready', reason: error }, 503)
  }
})

/**
 * Detailed metrics endpoint
 */
app.get('/metrics', (c) => {
  const uptime = Math.floor((Date.now() - startTime) / 1000)
  const memoryUsage = process.memoryUsage()

  return c.json({
    uptime_seconds: uptime,
    memory: {
      rss_mb: Math.round(memoryUsage.rss / 1024 / 1024),
      heap_used_mb: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      heap_total_mb: Math.round(memoryUsage.heapTotal / 1024 / 1024),
    },
    node_version: process.version,
    env: process.env.NODE_ENV || 'development',
  })
})

// ============================================================
// Health Data Sync (from mobile devices)
// ============================================================

/**
 * Sync health data from mobile app (HealthKit/Google Fit)
 * POST /api/health/sync
 */
app.post('/sync', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const body = await c.req.json() as HealthSyncRequest

    // Validate required fields
    if (!body.source || !body.data) {
      return c.json({ error: 'Missing required fields: source, data' }, 400)
    }

    // Sync health data to database
    const snapshot = await syncHealthData(user.id, body)

    // Auto-evaluate quests based on new health data
    const evalResult = await autoEvaluateQuestsFromHealth(user.id, user.timezone ?? 'UTC')

    logger.info('Health data synced', {
      userId: user.id,
      source: body.source,
      steps: body.data.steps,
      exerciseMinutes: body.data.exerciseMinutes,
      questsCompleted: evalResult.completed,
    })

    return c.json({
      success: true,
      snapshotId: snapshot.id,
      questsCompleted: evalResult.completed,
      questResults: evalResult.results.map(q => ({
        questId: q.questId,
        title: q.questName,
        wasCompleted: q.newStatus === 'COMPLETED',
      })),
      snapshot: {
        id: snapshot.id,
        steps: snapshot.steps,
        exerciseMinutes: snapshot.exerciseMinutes,
        workoutCount: snapshot.workoutCount,
        sleepMinutes: snapshot.sleepMinutes,
        activeCalories: snapshot.activeCalories,
        syncedAt: snapshot.lastSyncedAt?.toISOString(),
      },
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : undefined
    logger.error('Health sync error', { error: errorMessage, stack: errorStack, userId: user.id })
    return c.json({ error: 'Failed to sync health data', details: errorMessage }, 500)
  }
})

/**
 * Get today's health snapshot
 * GET /api/health/today
 */
app.get('/today', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const snapshot = await getTodayHealthSnapshot(user.id)

    if (!snapshot) {
      return c.json({
        hasData: false,
        snapshot: null,
      })
    }

    return c.json({
      hasData: true,
      snapshot: {
        id: snapshot.id,
        date: snapshot.snapshotDate,
        steps: snapshot.steps,
        exerciseMinutes: snapshot.exerciseMinutes,
        sleepMinutes: snapshot.sleepMinutes,
        workoutCount: snapshot.workoutCount,
        workoutMinutes: snapshot.workoutMinutes,
        activeCalories: snapshot.activeCalories,
        source: snapshot.primarySource,
        syncedAt: snapshot.lastSyncedAt,
      },
    })
  } catch (error) {
    logger.error('Get health snapshot error', { error, userId: user.id })
    return c.json({ error: 'Failed to get health data' }, 500)
  }
})

export default app
