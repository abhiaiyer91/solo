/**
 * Rate Limiting Middleware
 * 
 * Protects API from abuse with configurable rate limits.
 */

import type { Context, Next } from 'hono'
import { getUser } from '../lib/auth'

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  /** Window size in seconds */
  windowSeconds: number
  
  /** Maximum requests per window */
  maxRequests: number
  
  /** Optional: Custom key generator */
  keyGenerator?: (c: Context) => string
  
  /** Skip rate limiting for certain conditions */
  skip?: (c: Context) => boolean
}

/**
 * Rate limit entry
 */
interface RateLimitEntry {
  count: number
  resetAt: number
}

// In-memory store (use Redis in production)
const rateLimitStore = new Map<string, RateLimitEntry>()

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key)
    }
  }
}, 60000) // Clean every minute

/**
 * Default rate limit configurations by route pattern
 */
export const RATE_LIMITS: Record<string, RateLimitConfig> = {
  // Auth endpoints - stricter limits
  'POST:/api/auth/login': { windowSeconds: 60, maxRequests: 5 },
  'POST:/api/auth/signup': { windowSeconds: 300, maxRequests: 3 },
  'POST:/api/auth/forgot-password': { windowSeconds: 300, maxRequests: 3 },
  
  // Quest completion - moderate limits
  'POST:/api/quests/:id/complete': { windowSeconds: 60, maxRequests: 30 },
  
  // Health sync - allow frequent syncs
  'POST:/api/health/sync': { windowSeconds: 60, maxRequests: 60 },
  
  // General reads - generous limits
  'GET:/api/*': { windowSeconds: 60, maxRequests: 100 },
  
  // General writes - moderate limits
  'POST:/api/*': { windowSeconds: 60, maxRequests: 50 },
  'PUT:/api/*': { windowSeconds: 60, maxRequests: 50 },
  'PATCH:/api/*': { windowSeconds: 60, maxRequests: 50 },
  'DELETE:/api/*': { windowSeconds: 60, maxRequests: 20 },
  
  // Default fallback
  '*': { windowSeconds: 60, maxRequests: 60 },
}

/**
 * Get rate limit key for request
 */
function getRateLimitKey(c: Context, config: RateLimitConfig): string {
  if (config.keyGenerator) {
    return config.keyGenerator(c)
  }
  
  // Try to get user ID first (more accurate than IP)
  const user = getUser(c)
  if (user?.id) {
    return `user:${user.id}`
  }
  
  // Fall back to IP address
  const ip = c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ||
             c.req.header('x-real-ip') ||
             'unknown'
  
  return `ip:${ip}`
}

/**
 * Find matching rate limit config for route
 */
function findConfig(method: string, path: string): RateLimitConfig {
  const routeKey = `${method}:${path}`
  
  // Check exact match first
  if (RATE_LIMITS[routeKey]) {
    return RATE_LIMITS[routeKey]
  }
  
  // Check pattern matches
  for (const [pattern, config] of Object.entries(RATE_LIMITS)) {
    const [patternMethod, patternPath] = pattern.split(':')
    
    if (patternMethod !== method && patternMethod !== '*') continue
    
    // Simple wildcard matching
    if (patternPath?.endsWith('/*')) {
      const prefix = patternPath.slice(0, -2)
      if (path.startsWith(prefix)) {
        return config
      }
    }
    
    // Path parameter matching (e.g., /api/quests/:id/complete)
    if (patternPath?.includes(':')) {
      const regex = new RegExp(
        '^' + patternPath.replace(/:[^/]+/g, '[^/]+') + '$'
      )
      if (regex.test(path)) {
        return config
      }
    }
  }
  
  // Return default
  return RATE_LIMITS['*'] || { windowSeconds: 60, maxRequests: 60 }
}

/**
 * Rate limit middleware factory
 */
export function rateLimit(customConfig?: Partial<RateLimitConfig>) {
  return async (c: Context, next: Next) => {
    const method = c.req.method
    const path = c.req.path
    
    // Get config for this route
    const routeConfig = findConfig(method, path)
    const config = { ...routeConfig, ...customConfig }
    
    // Check skip condition
    if (config.skip?.(c)) {
      return next()
    }
    
    const key = getRateLimitKey(c, config)
    const routeKey = `${method}:${path}`
    const fullKey = `${key}:${routeKey}`
    
    const now = Date.now()
    const windowMs = config.windowSeconds * 1000
    
    // Get or create entry
    let entry = rateLimitStore.get(fullKey)
    
    if (!entry || entry.resetAt < now) {
      entry = {
        count: 0,
        resetAt: now + windowMs,
      }
    }
    
    // Increment count
    entry.count++
    rateLimitStore.set(fullKey, entry)
    
    // Calculate headers
    const remaining = Math.max(0, config.maxRequests - entry.count)
    const resetSeconds = Math.ceil((entry.resetAt - now) / 1000)
    
    // Set rate limit headers
    c.header('X-RateLimit-Limit', config.maxRequests.toString())
    c.header('X-RateLimit-Remaining', remaining.toString())
    c.header('X-RateLimit-Reset', resetSeconds.toString())
    
    // Check if over limit
    if (entry.count > config.maxRequests) {
      c.header('Retry-After', resetSeconds.toString())
      
      return c.json({
        error: 'Too Many Requests',
        message: `Rate limit exceeded. Try again in ${resetSeconds} seconds.`,
        retryAfter: resetSeconds,
      }, 429)
    }
    
    return next()
  }
}

/**
 * Strict rate limit for auth endpoints
 */
export const authRateLimit = rateLimit({
  windowSeconds: 60,
  maxRequests: 5,
})

/**
 * Skip rate limiting for admin users
 */
export function rateLimitWithAdminBypass(config?: Partial<RateLimitConfig>) {
  return rateLimit({
    ...config,
    skip: (c) => {
      const user = getUser(c)
      // Would check admin role in real implementation
      return user?.email?.endsWith('@journey.app') ?? false
    },
  })
}
