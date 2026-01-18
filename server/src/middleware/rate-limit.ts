/**
 * Rate Limiting Middleware
 * 
 * Implements sliding window rate limiting for API protection.
 * - IP-based limiting: 100 requests/minute for unauthenticated
 * - User-based limiting: 1000 requests/minute for authenticated
 */

import type { Context, Next } from 'hono'

interface RateLimitEntry {
  count: number
  resetAt: number
}

// In-memory stores (use Redis in production for distributed systems)
const ipStore = new Map<string, RateLimitEntry>()
const userStore = new Map<string, RateLimitEntry>()

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of ipStore) {
    if (entry.resetAt < now) ipStore.delete(key)
  }
  for (const [key, entry] of userStore) {
    if (entry.resetAt < now) userStore.delete(key)
  }
}, 5 * 60 * 1000)

interface RateLimitConfig {
  windowMs: number
  limit: number
  keyGenerator: (c: Context) => string
  store: Map<string, RateLimitEntry>
}

function createRateLimiter(config: RateLimitConfig) {
  return async (c: Context, next: Next) => {
    const key = config.keyGenerator(c)
    const now = Date.now()
    
    let entry = config.store.get(key)
    
    if (!entry || entry.resetAt < now) {
      entry = { count: 0, resetAt: now + config.windowMs }
      config.store.set(key, entry)
    }
    
    entry.count++
    
    // Add rate limit headers
    const remaining = Math.max(0, config.limit - entry.count)
    const reset = Math.ceil((entry.resetAt - now) / 1000)
    
    c.header('X-RateLimit-Limit', String(config.limit))
    c.header('X-RateLimit-Remaining', String(remaining))
    c.header('X-RateLimit-Reset', String(reset))
    
    if (entry.count > config.limit) {
      c.header('Retry-After', String(reset))
      return c.json(
        { 
          error: 'Too many requests',
          message: '[SYSTEM] Rate limit exceeded. Slow down, Hunter.',
          retryAfter: reset
        },
        429
      )
    }
    
    await next()
  }
}

/**
 * IP-based rate limiter
 * 100 requests per minute per IP
 */
export const ipRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  limit: 100,
  keyGenerator: (c) => {
    return c.req.header('x-forwarded-for')?.split(',')[0]?.trim() || 
           c.req.header('x-real-ip') || 
           'unknown'
  },
  store: ipStore,
})

/**
 * User-based rate limiter
 * 1000 requests per minute per authenticated user
 */
export const userRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  limit: 1000,
  keyGenerator: (c) => {
    const user = c.get('user')
    return user?.id || 'anonymous'
  },
  store: userStore,
})

/**
 * Strict rate limiter for sensitive operations
 * 10 requests per minute (e.g., password reset, login attempts)
 */
export const strictRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  limit: 10,
  keyGenerator: (c) => {
    return c.req.header('x-forwarded-for')?.split(',')[0]?.trim() || 
           c.req.header('x-real-ip') || 
           'unknown'
  },
  store: new Map(),
})

/**
 * Combined rate limiter that applies IP limits first, then user limits
 */
export async function rateLimiter(c: Context, next: Next) {
  // Apply IP-based limiting first
  await ipRateLimiter(c, async () => {
    // If user is authenticated, also apply user-based limiting
    const user = c.get('user')
    if (user) {
      await userRateLimiter(c, async () => {
        await next()
      })
    } else {
      await next()
    }
  })
}
