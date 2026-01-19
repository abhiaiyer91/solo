/**
 * Health check endpoint
 * Used for monitoring and load balancer health checks
 */

import { Hono } from 'hono'
import { dbClient } from '../db'
import { sql } from 'drizzle-orm'
import { logger } from '../lib/logger'

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

export default app
