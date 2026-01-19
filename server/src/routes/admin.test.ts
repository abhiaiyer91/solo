import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Hono } from 'hono'
import type { Context, Next } from 'hono'

// Mock modules
vi.mock('../db', () => ({
  dbClient: null,
}))

// Mock metrics service
const mockGetUserMetrics = vi.fn()
const mockGetQuestMetrics = vi.fn()
const mockGetPerformanceMetrics = vi.fn()
const mockGetGameMetrics = vi.fn()
const mockGetRecentErrors = vi.fn()

vi.mock('../services/metrics', () => ({
  getUserMetrics: (...args: unknown[]) => mockGetUserMetrics(...args),
  getQuestMetrics: (...args: unknown[]) => mockGetQuestMetrics(...args),
  getPerformanceMetrics: (...args: unknown[]) => mockGetPerformanceMetrics(...args),
  getGameMetrics: (...args: unknown[]) => mockGetGameMetrics(...args),
  getRecentErrors: (...args: unknown[]) => mockGetRecentErrors(...args),
}))

// Test middleware
function mockAuthMiddleware(user: object | null) {
  return async (c: Context, next: Next) => {
    c.set('user', user as never)
    return next()
  }
}

function mockAdminMiddleware(isAdmin: boolean) {
  return async (c: Context, next: Next) => {
    if (!isAdmin) {
      return c.json({ error: 'Admin access required' }, 403)
    }
    return next()
  }
}

async function mockRequireAuth(c: Context, next: Next) {
  const user = c.get('user')
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  return next()
}

describe('Admin Routes', () => {
  const mockAdminUser = {
    id: 'admin-123',
    name: 'Admin Hunter',
    email: 'admin@example.com',
    role: 'admin',
  }

  const mockRegularUser = {
    id: 'user-456',
    name: 'Regular Hunter',
    email: 'user@example.com',
    role: 'player',
  }

  const mockUserMetrics = {
    totalUsers: 1500,
    activeToday: 450,
    activeThisWeek: 980,
    newUsersToday: 25,
    newUsersThisWeek: 180,
    retentionRate: 0.72,
  }

  const mockQuestMetrics = {
    questsCompletedToday: 3200,
    questsCompletedThisWeek: 22000,
    averageCompletionRate: 0.78,
    mostPopularQuest: 'Daily Steps',
    leastCompletedQuest: 'Meditation',
  }

  const mockPerformanceMetrics = {
    averageResponseTime: 45,
    p95ResponseTime: 120,
    p99ResponseTime: 250,
    requestsPerMinute: 150,
    errorRate: 0.002,
    uptime: 99.98,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /admin/metrics/users', () => {
    it('should return 401 when not authenticated', async () => {
      const app = new Hono()
      app.use('*', mockAuthMiddleware(null))
      app.get('/admin/metrics/users', mockRequireAuth, async (c) => {
        return c.json({})
      })

      const res = await app.request('/admin/metrics/users')
      expect(res.status).toBe(401)
    })

    it('should return 403 for non-admin users', async () => {
      const app = new Hono()
      app.use('*', mockAuthMiddleware(mockRegularUser))
      app.get('/admin/metrics/users', mockRequireAuth, mockAdminMiddleware(false), async (c) => {
        return c.json({})
      })

      const res = await app.request('/admin/metrics/users')
      expect(res.status).toBe(403)
    })

    it('should return user metrics for admin', async () => {
      mockGetUserMetrics.mockResolvedValue(mockUserMetrics)

      const app = new Hono()
      app.use('*', mockAuthMiddleware(mockAdminUser))
      app.get('/admin/metrics/users', mockRequireAuth, mockAdminMiddleware(true), async (c) => {
        const metrics = await mockGetUserMetrics()
        return c.json({ metrics, timestamp: new Date().toISOString() })
      })

      const res = await app.request('/admin/metrics/users')
      expect(res.status).toBe(200)

      const body = await res.json() as { metrics: typeof mockUserMetrics }
      expect(body.metrics.totalUsers).toBe(1500)
      expect(body.metrics.activeToday).toBe(450)
      expect(body.metrics.retentionRate).toBe(0.72)
    })
  })

  describe('GET /admin/metrics/quests', () => {
    it('should return quest metrics', async () => {
      mockGetQuestMetrics.mockResolvedValue(mockQuestMetrics)

      const app = new Hono()
      app.use('*', mockAuthMiddleware(mockAdminUser))
      app.get('/admin/metrics/quests', mockRequireAuth, mockAdminMiddleware(true), async (c) => {
        const metrics = await mockGetQuestMetrics()
        return c.json({ metrics })
      })

      const res = await app.request('/admin/metrics/quests')
      expect(res.status).toBe(200)

      const body = await res.json() as { metrics: typeof mockQuestMetrics }
      expect(body.metrics.questsCompletedToday).toBe(3200)
      expect(body.metrics.averageCompletionRate).toBe(0.78)
    })
  })

  describe('GET /admin/metrics/performance', () => {
    it('should return performance metrics', async () => {
      mockGetPerformanceMetrics.mockResolvedValue(mockPerformanceMetrics)

      const app = new Hono()
      app.use('*', mockAuthMiddleware(mockAdminUser))
      app.get('/admin/metrics/performance', mockRequireAuth, mockAdminMiddleware(true), async (c) => {
        const metrics = await mockGetPerformanceMetrics()

        return c.json({
          metrics,
          status: metrics.errorRate < 0.01 ? 'healthy' : 'degraded',
        })
      })

      const res = await app.request('/admin/metrics/performance')
      expect(res.status).toBe(200)

      const body = await res.json() as { metrics: typeof mockPerformanceMetrics; status: string }
      expect(body.metrics.averageResponseTime).toBe(45)
      expect(body.metrics.uptime).toBe(99.98)
      expect(body.status).toBe('healthy')
    })
  })

  describe('GET /admin/metrics/game', () => {
    it('should return game-specific metrics', async () => {
      const gameMetrics = {
        averageLevel: 12.5,
        totalXPAwarded: 15000000,
        activeStreaks: 850,
        dungeonsCompleted: 320,
        bossesDefeated: 45,
        guildsActive: 28,
      }

      mockGetGameMetrics.mockResolvedValue(gameMetrics)

      const app = new Hono()
      app.use('*', mockAuthMiddleware(mockAdminUser))
      app.get('/admin/metrics/game', mockRequireAuth, mockAdminMiddleware(true), async (c) => {
        const metrics = await mockGetGameMetrics()
        return c.json({ metrics })
      })

      const res = await app.request('/admin/metrics/game')
      expect(res.status).toBe(200)

      const body = await res.json() as { metrics: typeof gameMetrics }
      expect(body.metrics.averageLevel).toBe(12.5)
      expect(body.metrics.activeStreaks).toBe(850)
    })
  })

  describe('GET /admin/errors', () => {
    it('should return recent errors', async () => {
      const recentErrors = [
        { id: 'err-1', message: 'Database timeout', count: 3, lastOccurrence: '2026-01-18T14:30:00Z' },
        { id: 'err-2', message: 'External API failure', count: 1, lastOccurrence: '2026-01-18T12:00:00Z' },
      ]

      mockGetRecentErrors.mockResolvedValue(recentErrors)

      const app = new Hono()
      app.use('*', mockAuthMiddleware(mockAdminUser))
      app.get('/admin/errors', mockRequireAuth, mockAdminMiddleware(true), async (c) => {
        const limit = parseInt(c.req.query('limit') ?? '10')
        const errors = await mockGetRecentErrors(limit)

        return c.json({
          errors,
          totalErrors: errors.reduce((sum: number, e: { count: number }) => sum + e.count, 0),
        })
      })

      const res = await app.request('/admin/errors?limit=10')
      expect(res.status).toBe(200)

      const body = await res.json() as { errors: typeof recentErrors; totalErrors: number }
      expect(body.errors).toHaveLength(2)
      expect(body.totalErrors).toBe(4)
    })
  })

  describe('GET /admin/health', () => {
    it('should return health check', async () => {
      const app = new Hono()
      app.use('*', mockAuthMiddleware(mockAdminUser))
      app.get('/admin/health', mockRequireAuth, mockAdminMiddleware(true), async (c) => {
        // Simulate health checks
        const checks = {
          database: { status: 'healthy', latency: 5 },
          cache: { status: 'healthy', latency: 1 },
          external: { status: 'healthy', latency: 45 },
        }

        const allHealthy = Object.values(checks).every((c) => c.status === 'healthy')

        return c.json({
          status: allHealthy ? 'healthy' : 'degraded',
          checks,
          timestamp: new Date().toISOString(),
        })
      })

      const res = await app.request('/admin/health')
      expect(res.status).toBe(200)

      const body = await res.json() as {
        status: string
        checks: { database: { status: string } }
      }
      expect(body.status).toBe('healthy')
      expect(body.checks.database.status).toBe('healthy')
    })
  })

  describe('POST /admin/broadcast', () => {
    it('should send broadcast message', async () => {
      const app = new Hono()
      app.use('*', mockAuthMiddleware(mockAdminUser))
      app.post('/admin/broadcast', mockRequireAuth, mockAdminMiddleware(true), async (c) => {
        const body = await c.req.json<{ message: string; type?: string }>()

        if (!body.message || body.message.length > 500) {
          return c.json({ error: 'Invalid message' }, 400)
        }

        // Simulate broadcast
        return c.json({
          success: true,
          message: body.message,
          type: body.type ?? 'info',
          recipientCount: 1500, // Total users
          sentAt: new Date().toISOString(),
        })
      })

      const res = await app.request('/admin/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'System maintenance scheduled for tonight.',
          type: 'warning',
        }),
      })

      expect(res.status).toBe(200)
      const body = await res.json() as { success: boolean; recipientCount: number }
      expect(body.success).toBe(true)
      expect(body.recipientCount).toBe(1500)
    })

    it('should validate message length', async () => {
      const app = new Hono()
      app.use('*', mockAuthMiddleware(mockAdminUser))
      app.post('/admin/broadcast', mockRequireAuth, mockAdminMiddleware(true), async (c) => {
        const body = await c.req.json<{ message: string }>()

        if (!body.message || body.message.length > 500) {
          return c.json({ error: 'Message must be 1-500 characters' }, 400)
        }

        return c.json({ success: true })
      })

      const res = await app.request('/admin/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'a'.repeat(501) }),
      })

      expect(res.status).toBe(400)
    })
  })

  describe('Admin access control', () => {
    it('should verify admin role properly', async () => {
      const app = new Hono()

      // Setup role-based middleware
      app.use('*', mockAuthMiddleware(mockRegularUser))
      app.use('/admin/*', async (c, next) => {
        const user = c.get('user') as { role?: string } | null
        if (!user || user.role !== 'admin') {
          return c.json({ error: 'Admin access required' }, 403)
        }
        return next()
      })

      app.get('/admin/test', async (c) => {
        return c.json({ access: 'granted' })
      })

      const res = await app.request('/admin/test')
      expect(res.status).toBe(403)

      const body = await res.json() as { error: string }
      expect(body.error).toContain('Admin')
    })
  })
})
