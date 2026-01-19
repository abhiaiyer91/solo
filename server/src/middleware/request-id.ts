/**
 * Request ID Middleware
 * Generates unique request IDs for request tracing
 */

import { Context, Next } from 'hono'
import { randomUUID } from 'crypto'

export const REQUEST_ID_HEADER = 'X-Request-ID'

/**
 * Request ID middleware - adds unique ID to each request for tracing
 */
export async function requestId(c: Context, next: Next) {
  // Use existing request ID from header or generate new one
  const id = c.req.header(REQUEST_ID_HEADER) || randomUUID()

  // Store in context for handlers to access
  c.set('requestId', id)

  // Add to response headers
  c.header(REQUEST_ID_HEADER, id)

  await next()
}

/**
 * Get request ID from context
 */
export function getRequestId(c: Context): string {
  return c.get('requestId') || 'unknown'
}
