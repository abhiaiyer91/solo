/**
 * Request Logging Middleware
 * Structured logging for all API requests
 */

import { type Context, type Next } from 'hono'
import { logger, logRequest, type RequestLog } from '../lib/logger'

/**
 * Generate a unique request ID
 */
function generateRequestId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
}

/**
 * Request logging middleware
 * Logs all requests with timing, status, and user info
 */
export async function requestLogging(c: Context, next: Next) {
  const requestId = generateRequestId()
  const start = Date.now()

  // Store request ID for other middleware/handlers
  c.set('requestId', requestId)

  // Log request start (debug level)
  logger.debug('Request started', {
    requestId,
    method: c.req.method,
    path: c.req.path,
    query: c.req.query(),
  })

  try {
    await next()
  } catch (error) {
    // Log error
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const duration = Date.now() - start

    logRequest({
      requestId,
      method: c.req.method,
      path: c.req.path,
      status: 500,
      duration,
      userId: c.get('user')?.id,
      error: errorMessage,
    })

    throw error
  }

  // Log request completion
  const duration = Date.now() - start
  const log: RequestLog = {
    requestId,
    method: c.req.method,
    path: c.req.path,
    status: c.res.status,
    duration,
    userId: c.get('user')?.id,
  }

  logRequest(log)
}

/**
 * Error handler that logs and returns structured error response
 */
export function errorHandler(err: Error, c: Context) {
  const requestId = c.get('requestId') || 'unknown'
  
  logger.error('Unhandled error', {
    requestId,
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  })

  // Return structured error response
  return c.json(
    {
      error: process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : err.message,
      requestId,
    },
    500
  )
}

/**
 * Slow query detector
 * Logs when database queries take longer than threshold
 */
export function createQueryTimer(operation: string) {
  const start = Date.now()
  
  return {
    end: (result?: { rowCount?: number }) => {
      const duration = Date.now() - start
      
      if (duration > 500) {
        logger.warn('Slow database query', {
          operation,
          duration,
          rowCount: result?.rowCount,
        })
      } else {
        logger.debug('Query completed', {
          operation,
          duration,
          rowCount: result?.rowCount,
        })
      }
      
      return duration
    },
  }
}

/**
 * Metric tracking for specific operations
 */
export const metrics = {
  questCompletion: (userId: string, questId: string, duration: number) => {
    logger.info('Quest completed', { userId, questId, duration })
  },
  
  xpAwarded: (userId: string, amount: number, source: string) => {
    logger.info('XP awarded', { userId, amount, source })
  },
  
  levelUp: (userId: string, oldLevel: number, newLevel: number) => {
    logger.info('Level up', { userId, oldLevel, newLevel })
  },
  
  healthSync: (userId: string, source: string, dataPoints: number, duration: number) => {
    logger.info('Health data synced', { userId, source, dataPoints, duration })
  },
  
  authEvent: (event: string, userId?: string, success: boolean = true) => {
    const level = success ? 'info' : 'warn'
    logger[level](`Auth: ${event}`, { userId, success })
  },
}
