/**
 * Centralized Error Handler Middleware
 * Provides consistent error responses and logging
 */

import type { Context } from 'hono'
import { AppError, isAppError, toError } from '../lib/errors'

/**
 * Standard error response format
 */
interface ErrorResponse {
  error: string
  code: string
  details?: Record<string, unknown>
  stack?: string
  requestId?: string
}

/**
 * Error handler middleware for Hono
 */
export function errorHandler(err: Error, c: Context): Response {
  const isDev = process.env.NODE_ENV === 'development'
  const requestId = c.req.header('x-request-id') || generateRequestId()

  // Log error with context
  logError(err, c, requestId)

  // Handle known operational errors
  if (isAppError(err)) {
    const response: ErrorResponse = {
      error: err.message,
      code: err.code,
      requestId,
    }

    if (err.details) {
      response.details = err.details
    }

    if (isDev && err.stack) {
      response.stack = err.stack
    }

    return c.json(response, err.statusCode as 400 | 401 | 403 | 404 | 409 | 429 | 500 | 503)
  }

  // Handle unknown/unexpected errors
  const response: ErrorResponse = {
    error: isDev ? err.message : 'An unexpected error occurred',
    code: 'INTERNAL_ERROR',
    requestId,
  }

  if (isDev && err.stack) {
    response.stack = err.stack
  }

  return c.json(response, 500)
}

/**
 * Async wrapper that catches errors and passes them to error handler
 */
export function asyncHandler<T>(
  handler: (c: Context) => Promise<T>
): (c: Context) => Promise<T | Response> {
  return async (c: Context) => {
    try {
      return await handler(c)
    } catch (error) {
      return errorHandler(toError(error), c)
    }
  }
}

/**
 * Log error with contextual information
 */
function logError(err: Error, c: Context, requestId: string): void {
  const logData = {
    timestamp: new Date().toISOString(),
    requestId,
    error: {
      name: err.name,
      message: err.message,
      stack: err.stack,
    },
    request: {
      method: c.req.method,
      path: c.req.path,
      query: Object.fromEntries(new URL(c.req.url).searchParams),
    },
    user: c.get('user') as { id: string } | undefined,
  }

  if (isAppError(err)) {
    // Operational errors - log at appropriate level based on status
    if (err.statusCode >= 500) {
      console.error('[ERROR]', JSON.stringify(logData))
    } else if (err.statusCode >= 400) {
      console.warn('[WARN]', JSON.stringify(logData))
    }
  } else {
    // Unexpected errors - always log as error
    console.error('[ERROR] Unexpected error:', JSON.stringify(logData))
  }
}

/**
 * Generate a unique request ID
 */
function generateRequestId(): string {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Create error handler for specific route group
 */
export function createRouteErrorHandler(routeName: string) {
  return (err: Error, c: Context): Response => {
    console.error(`[${routeName}] Route error:`, err.message)
    return errorHandler(err, c)
  }
}

/**
 * Not Found handler for undefined routes
 */
export function notFoundHandler(c: Context): Response {
  return c.json(
    {
      error: `Route ${c.req.path} not found`,
      code: 'NOT_FOUND',
    },
    404
  )
}

/**
 * Validation error helper for request body validation
 */
export function validateRequest<T>(
  data: unknown,
  validator: (data: unknown) => { success: boolean; error?: { issues: Array<{ message: string }> } }
): T {
  const result = validator(data)
  if (!result.success) {
    const messages = result.error?.issues.map((i) => i.message).join(', ') || 'Invalid request'
    throw new AppError(messages, 400, 'VALIDATION_ERROR')
  }
  return data as T
}
