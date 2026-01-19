/**
 * Response Caching Layer
 * In-memory cache with TTL support
 */

import { Context, Next } from 'hono'

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

interface CacheEntry<T> {
  data: T
  expiresAt: number
  tags: string[]
}

interface CacheConfig {
  ttlSeconds: number
  keyGenerator?: (c: Context) => string
  tags?: string[]
  condition?: (c: Context) => boolean
}

// ═══════════════════════════════════════════════════════════
// IN-MEMORY CACHE STORE
// ═══════════════════════════════════════════════════════════

class CacheStore {
  private store = new Map<string, CacheEntry<unknown>>()
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor() {
    // Start cleanup interval
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 60000) // Cleanup every minute
  }

  /**
   * Get a cached value
   */
  get<T>(key: string): T | null {
    const entry = this.store.get(key)
    
    if (!entry) return null
    
    if (entry.expiresAt < Date.now()) {
      this.store.delete(key)
      return null
    }
    
    return entry.data as T
  }

  /**
   * Set a cached value
   */
  set<T>(key: string, data: T, ttlSeconds: number, tags: string[] = []): void {
    this.store.set(key, {
      data,
      expiresAt: Date.now() + ttlSeconds * 1000,
      tags,
    })
  }

  /**
   * Delete a cached value
   */
  delete(key: string): boolean {
    return this.store.delete(key)
  }

  /**
   * Invalidate all entries with a specific tag
   */
  invalidateByTag(tag: string): number {
    let count = 0
    for (const [key, entry] of this.store.entries()) {
      if (entry.tags.includes(tag)) {
        this.store.delete(key)
        count++
      }
    }
    return count
  }

  /**
   * Invalidate entries matching a key pattern
   */
  invalidateByPattern(pattern: string): number {
    let count = 0
    const regex = new RegExp(pattern)
    
    for (const key of this.store.keys()) {
      if (regex.test(key)) {
        this.store.delete(key)
        count++
      }
    }
    return count
  }

  /**
   * Clear all cached entries
   */
  clear(): void {
    this.store.clear()
  }

  /**
   * Get cache statistics
   */
  stats(): { size: number; keys: string[] } {
    return {
      size: this.store.size,
      keys: Array.from(this.store.keys()),
    }
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.store.entries()) {
      if (entry.expiresAt < now) {
        this.store.delete(key)
      }
    }
  }

  /**
   * Stop cleanup interval
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
  }
}

// Singleton instance
export const cache = new CacheStore()

// ═══════════════════════════════════════════════════════════
// CACHE MIDDLEWARE
// ═══════════════════════════════════════════════════════════

/**
 * Create caching middleware for API routes
 */
export function cacheResponse(config: CacheConfig) {
  const {
    ttlSeconds,
    keyGenerator = defaultKeyGenerator,
    tags = [],
    condition = () => true,
  } = config

  return async (c: Context, next: Next) => {
    // Skip if condition not met
    if (!condition(c)) {
      await next()
      return
    }

    // Only cache GET requests
    if (c.req.method !== 'GET') {
      await next()
      return
    }

    const cacheKey = keyGenerator(c)
    
    // Check cache
    const cached = cache.get<{ body: unknown; headers: Record<string, string> }>(cacheKey)
    
    if (cached) {
      // Set cache headers
      c.header('X-Cache', 'HIT')
      Object.entries(cached.headers).forEach(([key, value]) => {
        c.header(key, value)
      })
      
      return c.json(cached.body)
    }

    // Cache miss - proceed with request
    await next()

    // Cache the response if successful
    if (c.res.status === 200) {
      try {
        const clonedResponse = c.res.clone()
        const body = await clonedResponse.json()
        
        // Store response with headers
        const headersToCache: Record<string, string> = {}
        ;['Content-Type', 'X-Request-ID'].forEach((header) => {
          const value = c.res.headers.get(header)
          if (value) headersToCache[header] = value
        })
        
        cache.set(cacheKey, { body, headers: headersToCache }, ttlSeconds, tags)
        c.header('X-Cache', 'MISS')
      } catch {
        // Ignore caching errors
      }
    }
  }
}

/**
 * Default cache key generator
 */
function defaultKeyGenerator(c: Context): string {
  const userId = c.get('userId') || 'anonymous'
  const path = c.req.path
  const query = c.req.query()
  const queryString = Object.entries(query)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('&')
  
  return `cache:${userId}:${path}${queryString ? `?${queryString}` : ''}`
}

// ═══════════════════════════════════════════════════════════
// CACHE INVALIDATION HELPERS
// ═══════════════════════════════════════════════════════════

/**
 * Invalidate user-specific cache entries
 */
export function invalidateUserCache(userId: string): number {
  return cache.invalidateByPattern(`cache:${userId}:`)
}

/**
 * Invalidate cache for a specific path
 */
export function invalidatePathCache(path: string): number {
  return cache.invalidateByPattern(`cache:[^:]+:${path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`)
}

/**
 * Invalidate cache by tag
 */
export function invalidateTagCache(tag: string): number {
  return cache.invalidateByTag(tag)
}

// ═══════════════════════════════════════════════════════════
// PRESET CACHE CONFIGS
// ═══════════════════════════════════════════════════════════

export const CACHE_PRESETS = {
  // Short-lived cache for frequently changing data
  short: {
    ttlSeconds: 30,
  },

  // Standard cache for semi-static data
  standard: {
    ttlSeconds: 5 * 60, // 5 minutes
  },

  // Long cache for static-ish data
  long: {
    ttlSeconds: 30 * 60, // 30 minutes
  },

  // Very long cache for rarely changing data
  veryLong: {
    ttlSeconds: 60 * 60, // 1 hour
  },

  // Player-specific with invalidation tags
  playerData: {
    ttlSeconds: 60,
    tags: ['player-data'],
  },

  // Quest data
  questData: {
    ttlSeconds: 30,
    tags: ['quests'],
  },

  // Stats (can be cached longer)
  stats: {
    ttlSeconds: 5 * 60,
    tags: ['stats'],
  },

  // Leaderboard (public, can be cached)
  leaderboard: {
    ttlSeconds: 60,
    tags: ['leaderboard'],
    // Use a simpler key without user ID for shared cache
    keyGenerator: (c: Context) => `cache:public:${c.req.path}`,
  },
}

// ═══════════════════════════════════════════════════════════
// MIDDLEWARE FOR CACHE CONTROL HEADERS
// ═══════════════════════════════════════════════════════════

/**
 * Set cache control headers for browser caching
 */
export function cacheControl(options: {
  maxAge?: number
  sMaxAge?: number
  staleWhileRevalidate?: number
  private?: boolean
  noStore?: boolean
}) {
  return async (c: Context, next: Next) => {
    await next()

    if (options.noStore) {
      c.header('Cache-Control', 'no-store, no-cache, must-revalidate')
      return
    }

    const parts: string[] = []
    
    if (options.private) {
      parts.push('private')
    } else {
      parts.push('public')
    }
    
    if (options.maxAge !== undefined) {
      parts.push(`max-age=${options.maxAge}`)
    }
    
    if (options.sMaxAge !== undefined) {
      parts.push(`s-maxage=${options.sMaxAge}`)
    }
    
    if (options.staleWhileRevalidate !== undefined) {
      parts.push(`stale-while-revalidate=${options.staleWhileRevalidate}`)
    }
    
    c.header('Cache-Control', parts.join(', '))
  }
}
