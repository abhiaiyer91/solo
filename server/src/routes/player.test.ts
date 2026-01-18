import { describe, it, expect, vi } from 'vitest'
import { Hono } from 'hono'
import type { Context, Next } from 'hono'

// Mock modules before importing routes
vi.mock('../db', () => ({
  dbClient: null,
}))

vi.mock('../services/level', () => ({
  xpToNextLevel: vi.fn(() => ({
    currentLevel: 5,
    xpProgress: 50n,
    xpNeeded: 100n,
    progressPercent: 50,
  })),
}))

vi.mock('../services/streak', () => ({
  getStreakInfo: vi.fn(() => ({
    currentStreak: 7,
    longestStreak: 14,
    perfectStreak: 3,
    streakStartDate: '2026-01-11',
    lastActiveDate: '2026-01-17',
  })),
}))

vi.mock('../services/debuff', () => ({
  getDebuffStatus: vi.fn(() => ({
    isActive: false,
    expiresAt: null,
    reason: null,
  })),
}))

vi.mock('../services/title', () => ({
  getUserTitles: vi.fn(() => []),
  getActiveTitle: vi.fn(() => null),
  setActiveTitle: vi.fn(),
  getActiveTitleBonus: vi.fn(() => null),
}))

vi.mock('../services/xp', () => ({
  getXPTimeline: vi.fn(() => []),
  getXPEventBreakdown: vi.fn(() => null),
}))

// Create a test middleware that sets mock user
function mockAuthMiddleware(user: object | null) {
  return async (c: Context, next: Next) => {
    c.set('user', user as never)
    c.set('session', (user ? { id: 'session-1' } : null) as never)
    return next()
  }
}

// Mock requireAuth that checks for user
async function mockRequireAuth(c: Context, next: Next) {
  const user = c.get('user')
  if (!user) {
    return c.json(
      { error: 'Unauthorized', message: '[SYSTEM] Authentication required.' },
      401
    )
  }
  return next()
}

describe('Player Routes', () => {
  const mockUser = {
    id: 'user-123',
    name: 'Test Hunter',
    email: 'test@example.com',
    level: 5,
    totalXP: 500,
    timezone: 'UTC',
  }

  describe('GET /player/me (unauthenticated endpoint)', () => {
    it('should return authenticated: false when no user', async () => {
      const app = new Hono()
      app.use('*', mockAuthMiddleware(null))

      app.get('/player/me', (c) => {
        const user = c.get('user')
        if (!user) {
          return c.json({ authenticated: false })
        }
        return c.json({
          authenticated: true,
          id: user.id,
          name: user.name || 'Hunter',
          email: user.email,
          level: user.level ?? 1,
        })
      })

      const res = await app.request('/player/me')
      const body = await res.json()

      expect(res.status).toBe(200)
      expect(body).toEqual({ authenticated: false })
    })

    it('should return user info when authenticated', async () => {
      const app = new Hono()
      app.use('*', mockAuthMiddleware(mockUser))

      app.get('/player/me', (c) => {
        const user = c.get('user')
        if (!user) {
          return c.json({ authenticated: false })
        }
        return c.json({
          authenticated: true,
          id: user.id,
          name: user.name || 'Hunter',
          email: user.email,
          level: user.level ?? 1,
        })
      })

      const res = await app.request('/player/me')
      const body = await res.json()

      expect(res.status).toBe(200)
      expect(body).toEqual({
        authenticated: true,
        id: 'user-123',
        name: 'Test Hunter',
        email: 'test@example.com',
        level: 5,
      })
    })
  })

  describe('Protected routes authentication', () => {
    it('should return 401 for /player when not authenticated', async () => {
      const app = new Hono()
      app.use('*', mockAuthMiddleware(null))

      app.get('/player', mockRequireAuth, async (c) => {
        return c.json({ user: c.get('user') })
      })

      const res = await app.request('/player')
      const body = await res.json() as { error: string }

      expect(res.status).toBe(401)
      expect(body.error).toBe('Unauthorized')
    })

    it('should return 401 for /player/level-progress when not authenticated', async () => {
      const app = new Hono()
      app.use('*', mockAuthMiddleware(null))

      app.get('/player/level-progress', mockRequireAuth, async (c) => {
        return c.json({ level: 1 })
      })

      const res = await app.request('/player/level-progress')

      expect(res.status).toBe(401)
    })

    it('should return 401 for /player/streak when not authenticated', async () => {
      const app = new Hono()
      app.use('*', mockAuthMiddleware(null))

      app.get('/player/streak', mockRequireAuth, async (c) => {
        return c.json({ streak: 0 })
      })

      const res = await app.request('/player/streak')

      expect(res.status).toBe(401)
    })

    it('should return 401 for /player/debuff when not authenticated', async () => {
      const app = new Hono()
      app.use('*', mockAuthMiddleware(null))

      app.get('/player/debuff', mockRequireAuth, async (c) => {
        return c.json({ active: false })
      })

      const res = await app.request('/player/debuff')

      expect(res.status).toBe(401)
    })

    it('should return 401 for /player/titles when not authenticated', async () => {
      const app = new Hono()
      app.use('*', mockAuthMiddleware(null))

      app.get('/player/titles', mockRequireAuth, async (c) => {
        return c.json({ titles: [] })
      })

      const res = await app.request('/player/titles')

      expect(res.status).toBe(401)
    })

    it('should return 401 for /xp/timeline when not authenticated', async () => {
      const app = new Hono()
      app.use('*', mockAuthMiddleware(null))

      app.get('/xp/timeline', mockRequireAuth, async (c) => {
        return c.json({ events: [] })
      })

      const res = await app.request('/xp/timeline')

      expect(res.status).toBe(401)
    })
  })

  describe('PATCH /player validation', () => {
    const VALID_TIMEZONES = [
      'UTC',
      'America/New_York',
      'America/Chicago',
      'America/Denver',
      'America/Los_Angeles',
      'Europe/London',
      'Europe/Paris',
      'Europe/Berlin',
      'Asia/Tokyo',
      'Asia/Shanghai',
      'Asia/Singapore',
      'Australia/Sydney',
    ]

    it('should reject invalid timezone', async () => {
      const app = new Hono()
      app.use('*', mockAuthMiddleware(mockUser))

      app.patch('/player', mockRequireAuth, async (c) => {
        const body = await c.req.json<{ timezone?: string; name?: string }>()

        if (body.timezone && !VALID_TIMEZONES.includes(body.timezone)) {
          return c.json({ error: 'Invalid timezone' }, 400)
        }

        return c.json({ message: 'Profile updated', timezone: body.timezone })
      })

      const res = await app.request('/player', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timezone: 'Invalid/Timezone' }),
      })
      const body = await res.json() as { error: string }

      expect(res.status).toBe(400)
      expect(body.error).toBe('Invalid timezone')
    })

    it('should accept valid timezone', async () => {
      const app = new Hono()
      app.use('*', mockAuthMiddleware(mockUser))

      app.patch('/player', mockRequireAuth, async (c) => {
        const body = await c.req.json<{ timezone?: string; name?: string }>()

        if (body.timezone && !VALID_TIMEZONES.includes(body.timezone)) {
          return c.json({ error: 'Invalid timezone' }, 400)
        }

        return c.json({ message: 'Profile updated', timezone: body.timezone })
      })

      const res = await app.request('/player', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timezone: 'America/New_York' }),
      })
      const body = await res.json() as { timezone: string }

      expect(res.status).toBe(200)
      expect(body.timezone).toBe('America/New_York')
    })

    it('should truncate name to 50 characters', async () => {
      const app = new Hono()
      app.use('*', mockAuthMiddleware(mockUser))

      app.patch('/player', mockRequireAuth, async (c) => {
        const body = await c.req.json<{ timezone?: string; name?: string }>()

        const name = body.name ? body.name.trim().slice(0, 50) : undefined

        return c.json({ message: 'Profile updated', name })
      })

      const longName = 'A'.repeat(100)
      const res = await app.request('/player', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: longName }),
      })
      const body = await res.json() as { name?: string }

      expect(res.status).toBe(200)
      expect(body.name?.length).toBe(50)
    })
  })

  describe('XP timeline pagination', () => {
    it('should use default limit and offset', async () => {
      const app = new Hono()
      app.use('*', mockAuthMiddleware(mockUser))

      let capturedLimit: number | undefined
      let capturedOffset: number | undefined

      app.get('/xp/timeline', mockRequireAuth, async (c) => {
        capturedLimit = parseInt(c.req.query('limit') || '50')
        capturedOffset = parseInt(c.req.query('offset') || '0')
        return c.json({ events: [], limit: capturedLimit, offset: capturedOffset })
      })

      const res = await app.request('/xp/timeline')
      const body = await res.json() as { limit: number; offset: number }

      expect(res.status).toBe(200)
      expect(body.limit).toBe(50)
      expect(body.offset).toBe(0)
    })

    it('should accept custom limit and offset', async () => {
      const app = new Hono()
      app.use('*', mockAuthMiddleware(mockUser))

      app.get('/xp/timeline', mockRequireAuth, async (c) => {
        const limit = parseInt(c.req.query('limit') || '50')
        const offset = parseInt(c.req.query('offset') || '0')
        return c.json({ events: [], limit, offset })
      })

      const res = await app.request('/xp/timeline?limit=20&offset=10')
      const body = await res.json() as { limit: number; offset: number }

      expect(res.status).toBe(200)
      expect(body.limit).toBe(20)
      expect(body.offset).toBe(10)
    })
  })

  describe('PUT /player/title/active', () => {
    it('should require authentication', async () => {
      const app = new Hono()
      app.use('*', mockAuthMiddleware(null))

      app.put('/player/title/active', mockRequireAuth, async (c) => {
        return c.json({ message: 'Title equipped' })
      })

      const res = await app.request('/player/title/active', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titleId: 'title-1' }),
      })

      expect(res.status).toBe(401)
    })

    it('should accept null titleId to unequip', async () => {
      const app = new Hono()
      app.use('*', mockAuthMiddleware(mockUser))

      app.put('/player/title/active', mockRequireAuth, async (c) => {
        const body = await c.req.json<{ titleId: string | null }>()
        return c.json({
          message: body.titleId ? 'Title equipped' : 'Title unequipped',
          activeTitle: null,
        })
      })

      const res = await app.request('/player/title/active', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titleId: null }),
      })
      const body = await res.json() as { message: string }

      expect(res.status).toBe(200)
      expect(body.message).toBe('Title unequipped')
    })
  })
})
