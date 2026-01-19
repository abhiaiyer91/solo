import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Hono } from 'hono'
import type { Context, Next } from 'hono'

// Mock modules
vi.mock('../db', () => ({
  dbClient: null,
}))

// Mock raid service
const mockGetActiveRaid = vi.fn()
const mockGetRaidHistory = vi.fn()
const mockJoinRaid = vi.fn()
const mockGetRaidProgress = vi.fn()
const mockSubmitRaidProgress = vi.fn()
const mockLeaveRaid = vi.fn()
const mockGetRaidLeaderboard = vi.fn()

vi.mock('../services/raid', () => ({
  getActiveRaid: (...args: unknown[]) => mockGetActiveRaid(...args),
  getRaidHistory: (...args: unknown[]) => mockGetRaidHistory(...args),
  joinRaid: (...args: unknown[]) => mockJoinRaid(...args),
  getRaidProgress: (...args: unknown[]) => mockGetRaidProgress(...args),
  submitRaidProgress: (...args: unknown[]) => mockSubmitRaidProgress(...args),
  leaveRaid: (...args: unknown[]) => mockLeaveRaid(...args),
  getRaidLeaderboard: (...args: unknown[]) => mockGetRaidLeaderboard(...args),
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

describe('Raid Routes', () => {
  const mockUser = {
    id: 'user-123',
    name: 'Test Hunter',
    email: 'test@example.com',
    level: 15,
    guildId: 'guild-1',
  }

  const mockRaid = {
    id: 'raid-1',
    name: 'Weekend Warrior',
    description: 'Complete 100 quests as a guild this weekend',
    type: 'guild',
    startDate: '2026-01-18T00:00:00Z',
    endDate: '2026-01-19T23:59:59Z',
    targetValue: 100,
    currentValue: 45,
    status: 'active',
    rewards: { xp: 500, title: 'Weekend Warrior' },
    participants: 12,
  }

  const mockRaidProgress = {
    raidId: 'raid-1',
    playerId: 'user-123',
    contribution: 5,
    rank: 3,
    lastContribution: '2026-01-18T14:30:00Z',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /raids/active', () => {
    it('should return 401 when not authenticated', async () => {
      const app = new Hono()
      app.use('*', mockAuthMiddleware(null))
      app.get('/raids/active', mockRequireAuth, async (c) => {
        return c.json({})
      })

      const res = await app.request('/raids/active')
      expect(res.status).toBe(401)
    })

    it('should return active raid for user', async () => {
      mockGetActiveRaid.mockResolvedValue(mockRaid)

      const app = new Hono()
      app.use('*', mockAuthMiddleware(mockUser))
      app.get('/raids/active', mockRequireAuth, async (c) => {
        const user = c.get('user')!
        const raid = await mockGetActiveRaid(user.id, user.guildId)

        if (!raid) {
          return c.json({ raid: null, hasActiveRaid: false })
        }

        return c.json({
          raid,
          hasActiveRaid: true,
          progressPercent: Math.round((raid.currentValue / raid.targetValue) * 100),
        })
      })

      const res = await app.request('/raids/active')
      expect(res.status).toBe(200)

      const body = await res.json() as { raid: typeof mockRaid; hasActiveRaid: boolean; progressPercent: number }
      expect(body.hasActiveRaid).toBe(true)
      expect(body.raid.name).toBe('Weekend Warrior')
      expect(body.progressPercent).toBe(45)
    })

    it('should handle no active raid', async () => {
      mockGetActiveRaid.mockResolvedValue(null)

      const app = new Hono()
      app.use('*', mockAuthMiddleware(mockUser))
      app.get('/raids/active', mockRequireAuth, async (c) => {
        const user = c.get('user')!
        const raid = await mockGetActiveRaid(user.id, user.guildId)

        if (!raid) {
          return c.json({ raid: null, hasActiveRaid: false })
        }

        return c.json({ raid, hasActiveRaid: true })
      })

      const res = await app.request('/raids/active')
      const body = await res.json() as { hasActiveRaid: boolean }
      expect(body.hasActiveRaid).toBe(false)
    })
  })

  describe('POST /raids/:raidId/join', () => {
    it('should join a raid', async () => {
      mockJoinRaid.mockResolvedValue({
        success: true,
        participation: { id: 'part-1', joinedAt: '2026-01-18T10:00:00Z' },
      })

      const app = new Hono()
      app.use('*', mockAuthMiddleware(mockUser))
      app.post('/raids/:raidId/join', mockRequireAuth, async (c) => {
        const user = c.get('user')!
        const raidId = c.req.param('raidId')

        try {
          const result = await mockJoinRaid(raidId, user.id)
          return c.json({
            success: true,
            participation: result.participation,
            message: '[SYSTEM] You have joined the raid. Fight alongside your allies!',
          })
        } catch (error) {
          const msg = error instanceof Error ? error.message : 'Failed to join raid'
          return c.json({ error: msg }, 400)
        }
      })

      const res = await app.request('/raids/raid-1/join', { method: 'POST' })
      expect(res.status).toBe(200)

      const body = await res.json() as { success: boolean; message: string }
      expect(body.success).toBe(true)
      expect(body.message).toContain('joined the raid')
    })

    it('should handle join errors', async () => {
      mockJoinRaid.mockRejectedValue(new Error('Raid is full'))

      const app = new Hono()
      app.use('*', mockAuthMiddleware(mockUser))
      app.post('/raids/:raidId/join', mockRequireAuth, async (c) => {
        const user = c.get('user')!
        const raidId = c.req.param('raidId')

        try {
          await mockJoinRaid(raidId, user.id)
          return c.json({ success: true })
        } catch (error) {
          const msg = error instanceof Error ? error.message : 'Failed to join'
          return c.json({ error: msg }, 400)
        }
      })

      const res = await app.request('/raids/raid-1/join', { method: 'POST' })
      expect(res.status).toBe(400)

      const body = await res.json() as { error: string }
      expect(body.error).toBe('Raid is full')
    })
  })

  describe('GET /raids/:raidId/progress', () => {
    it('should return raid progress for user', async () => {
      mockGetRaidProgress.mockResolvedValue(mockRaidProgress)

      const app = new Hono()
      app.use('*', mockAuthMiddleware(mockUser))
      app.get('/raids/:raidId/progress', mockRequireAuth, async (c) => {
        const user = c.get('user')!
        const raidId = c.req.param('raidId')

        const progress = await mockGetRaidProgress(raidId, user.id)

        if (!progress) {
          return c.json({ error: 'Not participating in this raid' }, 404)
        }

        return c.json({
          progress,
          message: `[SYSTEM] Rank #${progress.rank} - Keep pushing!`,
        })
      })

      const res = await app.request('/raids/raid-1/progress')
      expect(res.status).toBe(200)

      const body = await res.json() as { progress: typeof mockRaidProgress; message: string }
      expect(body.progress.contribution).toBe(5)
      expect(body.progress.rank).toBe(3)
    })
  })

  describe('POST /raids/:raidId/contribute', () => {
    it('should submit raid contribution', async () => {
      mockSubmitRaidProgress.mockResolvedValue({
        progress: { ...mockRaidProgress, contribution: 6 },
        raidProgress: { currentValue: 46 },
        xpAwarded: 10,
      })

      const app = new Hono()
      app.use('*', mockAuthMiddleware(mockUser))
      app.post('/raids/:raidId/contribute', mockRequireAuth, async (c) => {
        const user = c.get('user')!
        const raidId = c.req.param('raidId')
        const body = await c.req.json<{ value: number; type: string }>()

        const result = await mockSubmitRaidProgress(raidId, user.id, body.value, body.type)

        return c.json({
          progress: result.progress,
          raidProgress: result.raidProgress,
          xpAwarded: result.xpAwarded,
          message: result.xpAwarded > 0
            ? `[SYSTEM] Contribution logged! +${result.xpAwarded} XP`
            : '[SYSTEM] Contribution logged.',
        })
      })

      const res = await app.request('/raids/raid-1/contribute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: 1, type: 'quest_completion' }),
      })

      expect(res.status).toBe(200)
      const body = await res.json() as { progress: { contribution: number }; xpAwarded: number }
      expect(body.progress.contribution).toBe(6)
      expect(body.xpAwarded).toBe(10)
    })
  })

  describe('GET /raids/:raidId/leaderboard', () => {
    it('should return raid leaderboard', async () => {
      const leaderboard = [
        { playerId: 'user-1', name: 'Hunter Alpha', contribution: 15, rank: 1 },
        { playerId: 'user-2', name: 'Hunter Beta', contribution: 12, rank: 2 },
        { playerId: 'user-123', name: 'Test Hunter', contribution: 5, rank: 3 },
      ]

      mockGetRaidLeaderboard.mockResolvedValue(leaderboard)

      const app = new Hono()
      app.use('*', mockAuthMiddleware(mockUser))
      app.get('/raids/:raidId/leaderboard', mockRequireAuth, async (c) => {
        const raidId = c.req.param('raidId')
        const limit = parseInt(c.req.query('limit') ?? '10')

        const leaderboard = await mockGetRaidLeaderboard(raidId, limit)

        return c.json({
          leaderboard,
          totalParticipants: leaderboard.length,
        })
      })

      const res = await app.request('/raids/raid-1/leaderboard?limit=10')
      expect(res.status).toBe(200)

      const body = await res.json() as { leaderboard: typeof leaderboard; totalParticipants: number }
      expect(body.leaderboard).toHaveLength(3)
      expect(body.leaderboard[0].rank).toBe(1)
    })
  })

  describe('DELETE /raids/:raidId/leave', () => {
    it('should leave raid', async () => {
      mockLeaveRaid.mockResolvedValue({ success: true })

      const app = new Hono()
      app.use('*', mockAuthMiddleware(mockUser))
      app.delete('/raids/:raidId/leave', mockRequireAuth, async (c) => {
        const user = c.get('user')!
        const raidId = c.req.param('raidId')

        await mockLeaveRaid(raidId, user.id)

        return c.json({
          success: true,
          message: '[SYSTEM] You have left the raid.',
        })
      })

      const res = await app.request('/raids/raid-1/leave', { method: 'DELETE' })
      expect(res.status).toBe(200)

      const body = await res.json() as { success: boolean }
      expect(body.success).toBe(true)
    })
  })

  describe('GET /raids/history', () => {
    it('should return raid history', async () => {
      const history = [
        { ...mockRaid, id: 'raid-old-1', status: 'completed', result: 'victory' },
        { ...mockRaid, id: 'raid-old-2', status: 'completed', result: 'defeat' },
      ]

      mockGetRaidHistory.mockResolvedValue(history)

      const app = new Hono()
      app.use('*', mockAuthMiddleware(mockUser))
      app.get('/raids/history', mockRequireAuth, async (c) => {
        const user = c.get('user')!
        const limit = parseInt(c.req.query('limit') ?? '10')

        const history = await mockGetRaidHistory(user.id, limit)

        return c.json({
          raids: history,
          victories: history.filter((r: { result: string }) => r.result === 'victory').length,
          defeats: history.filter((r: { result: string }) => r.result === 'defeat').length,
        })
      })

      const res = await app.request('/raids/history?limit=10')
      expect(res.status).toBe(200)

      const body = await res.json() as { raids: unknown[]; victories: number; defeats: number }
      expect(body.raids).toHaveLength(2)
      expect(body.victories).toBe(1)
      expect(body.defeats).toBe(1)
    })
  })
})
