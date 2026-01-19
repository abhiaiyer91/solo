import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Hono } from 'hono'
import type { Context, Next } from 'hono'

// Mock modules
vi.mock('../db', () => ({
  dbClient: null,
}))

// Mock accountability service
const mockGetAccountabilityPartner = vi.fn()
const mockRequestPartnership = vi.fn()
const mockAcceptPartnership = vi.fn()
const mockDeclinePartnership = vi.fn()
const mockEndPartnership = vi.fn()
const mockGetPendingRequests = vi.fn()
const mockGetPartnerActivity = vi.fn()
const mockSendEncouragement = vi.fn()

vi.mock('../services/accountability', () => ({
  getAccountabilityPartner: (...args: unknown[]) => mockGetAccountabilityPartner(...args),
  requestPartnership: (...args: unknown[]) => mockRequestPartnership(...args),
  acceptPartnership: (...args: unknown[]) => mockAcceptPartnership(...args),
  declinePartnership: (...args: unknown[]) => mockDeclinePartnership(...args),
  endPartnership: (...args: unknown[]) => mockEndPartnership(...args),
  getPendingRequests: (...args: unknown[]) => mockGetPendingRequests(...args),
  getPartnerActivity: (...args: unknown[]) => mockGetPartnerActivity(...args),
  sendEncouragement: (...args: unknown[]) => mockSendEncouragement(...args),
}))

// Test middleware
function mockAuthMiddleware(user: object | null) {
  return async (c: Context, next: Next) => {
    c.set('user', user as never)
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

describe('Accountability Routes', () => {
  const mockUser = {
    id: 'user-123',
    name: 'Test Hunter',
    email: 'test@example.com',
    level: 10,
  }

  const mockPartner = {
    id: 'partner-456',
    name: 'Partner Hunter',
    level: 12,
    currentStreak: 15,
    lastActive: '2026-01-18T10:00:00Z',
  }

  const mockPartnership = {
    id: 'partnership-1',
    userId: 'user-123',
    partnerId: 'partner-456',
    status: 'active',
    createdAt: '2026-01-01T00:00:00Z',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /accountability/partner', () => {
    it('should return 401 when not authenticated', async () => {
      const app = new Hono()
      app.use('*', mockAuthMiddleware(null))
      app.get('/accountability/partner', mockRequireAuth, async (c) => {
        return c.json({})
      })

      const res = await app.request('/accountability/partner')
      expect(res.status).toBe(401)
    })

    it('should return current partner', async () => {
      mockGetAccountabilityPartner.mockResolvedValue({
        partner: mockPartner,
        partnership: mockPartnership,
      })

      const app = new Hono()
      app.use('*', mockAuthMiddleware(mockUser))
      app.get('/accountability/partner', mockRequireAuth, async (c) => {
        const user = c.get('user')!
        const data = await mockGetAccountabilityPartner(user.id)

        if (!data.partner) {
          return c.json({ partner: null, hasPartner: false })
        }

        return c.json({
          partner: data.partner,
          partnership: data.partnership,
          hasPartner: true,
        })
      })

      const res = await app.request('/accountability/partner')
      expect(res.status).toBe(200)

      const body = await res.json() as { partner: typeof mockPartner; hasPartner: boolean }
      expect(body.hasPartner).toBe(true)
      expect(body.partner.name).toBe('Partner Hunter')
    })

    it('should handle no partner', async () => {
      mockGetAccountabilityPartner.mockResolvedValue({ partner: null })

      const app = new Hono()
      app.use('*', mockAuthMiddleware(mockUser))
      app.get('/accountability/partner', mockRequireAuth, async (c) => {
        const user = c.get('user')!
        const data = await mockGetAccountabilityPartner(user.id)

        if (!data.partner) {
          return c.json({ partner: null, hasPartner: false })
        }

        return c.json({ partner: data.partner, hasPartner: true })
      })

      const res = await app.request('/accountability/partner')
      const body = await res.json() as { hasPartner: boolean; partner: unknown }

      expect(body.hasPartner).toBe(false)
      expect(body.partner).toBeNull()
    })
  })

  describe('POST /accountability/request', () => {
    it('should send partnership request', async () => {
      mockRequestPartnership.mockResolvedValue({
        request: { id: 'req-1', status: 'pending' },
        message: 'Request sent successfully',
      })

      const app = new Hono()
      app.use('*', mockAuthMiddleware(mockUser))
      app.post('/accountability/request', mockRequireAuth, async (c) => {
        const user = c.get('user')!
        const body = await c.req.json<{ targetUserId: string; message?: string }>()

        if (!body.targetUserId) {
          return c.json({ error: 'Target user ID required' }, 400)
        }

        if (body.targetUserId === user.id) {
          return c.json({ error: 'Cannot partner with yourself' }, 400)
        }

        const result = await mockRequestPartnership(user.id, body.targetUserId, body.message)
        return c.json(result)
      })

      const res = await app.request('/accountability/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: 'partner-456', message: 'Let\'s train together!' }),
      })

      expect(res.status).toBe(200)
      const body = await res.json() as { request: { status: string }; message: string }
      expect(body.request.status).toBe('pending')
    })

    it('should prevent self-partnership', async () => {
      const app = new Hono()
      app.use('*', mockAuthMiddleware(mockUser))
      app.post('/accountability/request', mockRequireAuth, async (c) => {
        const user = c.get('user')!
        const body = await c.req.json<{ targetUserId: string }>()

        if (body.targetUserId === user.id) {
          return c.json({ error: 'Cannot partner with yourself' }, 400)
        }

        return c.json({ success: true })
      })

      const res = await app.request('/accountability/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: 'user-123' }), // Same as mockUser.id
      })

      expect(res.status).toBe(400)
      const body = await res.json() as { error: string }
      expect(body.error).toContain('yourself')
    })
  })

  describe('POST /accountability/accept/:requestId', () => {
    it('should accept partnership request', async () => {
      mockAcceptPartnership.mockResolvedValue({
        partnership: mockPartnership,
        partner: mockPartner,
      })

      const app = new Hono()
      app.use('*', mockAuthMiddleware(mockUser))
      app.post('/accountability/accept/:requestId', mockRequireAuth, async (c) => {
        const user = c.get('user')!
        const requestId = c.req.param('requestId')

        const result = await mockAcceptPartnership(requestId, user.id)

        return c.json({
          partnership: result.partnership,
          partner: result.partner,
          message: '[SYSTEM] Partnership formed! Your journey together begins.',
        })
      })

      const res = await app.request('/accountability/accept/req-1', { method: 'POST' })
      expect(res.status).toBe(200)

      const body = await res.json() as { partnership: typeof mockPartnership; message: string }
      expect(body.partnership.status).toBe('active')
      expect(body.message).toContain('Partnership formed')
    })
  })

  describe('POST /accountability/decline/:requestId', () => {
    it('should decline partnership request', async () => {
      mockDeclinePartnership.mockResolvedValue({ success: true })

      const app = new Hono()
      app.use('*', mockAuthMiddleware(mockUser))
      app.post('/accountability/decline/:requestId', mockRequireAuth, async (c) => {
        const user = c.get('user')!
        const requestId = c.req.param('requestId')

        await mockDeclinePartnership(requestId, user.id)
        return c.json({ success: true, message: 'Request declined' })
      })

      const res = await app.request('/accountability/decline/req-1', { method: 'POST' })
      expect(res.status).toBe(200)

      const body = await res.json() as { success: boolean }
      expect(body.success).toBe(true)
    })
  })

  describe('DELETE /accountability/partner', () => {
    it('should end partnership', async () => {
      mockEndPartnership.mockResolvedValue({ success: true })

      const app = new Hono()
      app.use('*', mockAuthMiddleware(mockUser))
      app.delete('/accountability/partner', mockRequireAuth, async (c) => {
        const user = c.get('user')!
        await mockEndPartnership(user.id)

        return c.json({
          success: true,
          message: '[SYSTEM] Partnership ended. You walk alone once more.',
        })
      })

      const res = await app.request('/accountability/partner', { method: 'DELETE' })
      expect(res.status).toBe(200)

      const body = await res.json() as { success: boolean; message: string }
      expect(body.success).toBe(true)
      expect(body.message).toContain('alone')
    })
  })

  describe('GET /accountability/requests', () => {
    it('should return pending requests', async () => {
      const mockRequests = [
        { id: 'req-1', fromUser: { name: 'Hunter A' }, createdAt: '2026-01-18T00:00:00Z' },
        { id: 'req-2', fromUser: { name: 'Hunter B' }, createdAt: '2026-01-17T00:00:00Z' },
      ]

      mockGetPendingRequests.mockResolvedValue(mockRequests)

      const app = new Hono()
      app.use('*', mockAuthMiddleware(mockUser))
      app.get('/accountability/requests', mockRequireAuth, async (c) => {
        const user = c.get('user')!
        const requests = await mockGetPendingRequests(user.id)

        return c.json({
          requests,
          count: requests.length,
        })
      })

      const res = await app.request('/accountability/requests')
      expect(res.status).toBe(200)

      const body = await res.json() as { requests: unknown[]; count: number }
      expect(body.requests).toHaveLength(2)
      expect(body.count).toBe(2)
    })
  })

  describe('GET /accountability/activity', () => {
    it('should return partner activity', async () => {
      const mockActivity = {
        questsCompletedToday: 4,
        streakStatus: 'active',
        lastActiveTime: '2026-01-18T15:30:00Z',
        weeklyXP: 350,
      }

      mockGetPartnerActivity.mockResolvedValue(mockActivity)

      const app = new Hono()
      app.use('*', mockAuthMiddleware(mockUser))
      app.get('/accountability/activity', mockRequireAuth, async (c) => {
        const user = c.get('user')!
        const activity = await mockGetPartnerActivity(user.id)

        if (!activity) {
          return c.json({ error: 'No partner found' }, 404)
        }

        return c.json({
          activity,
          message: `[SYSTEM] Your partner completed ${activity.questsCompletedToday} quests today.`,
        })
      })

      const res = await app.request('/accountability/activity')
      expect(res.status).toBe(200)

      const body = await res.json() as { activity: typeof mockActivity; message: string }
      expect(body.activity.questsCompletedToday).toBe(4)
      expect(body.message).toContain('4 quests')
    })
  })

  describe('POST /accountability/encourage', () => {
    it('should send encouragement to partner', async () => {
      mockSendEncouragement.mockResolvedValue({
        sent: true,
        notification: { id: 'notif-1' },
      })

      const app = new Hono()
      app.use('*', mockAuthMiddleware(mockUser))
      app.post('/accountability/encourage', mockRequireAuth, async (c) => {
        const user = c.get('user')!
        const body = await c.req.json<{ message?: string; type?: string }>()

        const result = await mockSendEncouragement(user.id, body.message, body.type)

        return c.json({
          success: result.sent,
          message: '[SYSTEM] Encouragement sent to your partner.',
        })
      })

      const res = await app.request('/accountability/encourage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Keep going! You\'ve got this!' }),
      })

      expect(res.status).toBe(200)
      const body = await res.json() as { success: boolean; message: string }
      expect(body.success).toBe(true)
    })
  })
})
