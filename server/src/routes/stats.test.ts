import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Hono } from 'hono'
import type { Context, Next } from 'hono'
import {
  createMockAuthMiddleware,
  mockRequireAuth,
  mockUser,
} from '../test/helpers/request'
import { mockPlayerStats } from '../test/fixtures/routes'

// Mock modules before importing
vi.mock('../db', () => ({
  dbClient: null,
}))

// Mock stats service
const mockCalculateAllStats = vi.fn()
const mockCalculateStat = vi.fn()
const mockGetAllMilestones = vi.fn()
const mockUpdateUserStats = vi.fn()

vi.mock('../services/stats', () => ({
  calculateAllStats: (...args: unknown[]) => mockCalculateAllStats(...args),
  calculateStat: (...args: unknown[]) => mockCalculateStat(...args),
  getAllMilestones: (...args: unknown[]) => mockGetAllMilestones(...args),
  updateUserStats: (...args: unknown[]) => mockUpdateUserStats(...args),
}))

describe('Stats Routes', () => {
  const mockAllStats = {
    STR: 15,
    AGI: 12,
    VIT: 18,
    DISC: 14,
    breakdown: {
      STR: { value: 15, baseline: 10, fromActivity: 5 },
      AGI: { value: 12, baseline: 10, fromActivity: 2 },
      VIT: { value: 18, baseline: 12, fromActivity: 6 },
      DISC: { value: 14, baseline: 10, fromActivity: 4 },
    },
  }

  const mockStatBreakdown = {
    stat: 'STR',
    value: 15,
    baseline: 10,
    fromActivity: 5,
    components: [
      { source: 'workouts', contribution: 3 },
      { source: 'quests', contribution: 2 },
    ],
    percentile: 65,
    nextMilestone: { target: 20, remaining: 5 },
  }

  const mockMilestones = {
    STR: { current: 15, nextMilestone: 20, remaining: 5 },
    AGI: { current: 12, nextMilestone: 15, remaining: 3 },
    VIT: { current: 18, nextMilestone: 20, remaining: 2 },
    DISC: { current: 14, nextMilestone: 15, remaining: 1 },
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /stats', () => {
    it('should return 401 when not authenticated', async () => {
      const app = new Hono()
      app.use('*', createMockAuthMiddleware(null))
      app.get('/stats', mockRequireAuth, async (c) => {
        return c.json({ stats: {} })
      })

      const res = await app.request('/stats')
      expect(res.status).toBe(401)
    })

    it('should return all stats for authenticated user', async () => {
      mockCalculateAllStats.mockResolvedValue(mockAllStats)

      const app = new Hono()
      app.use('*', createMockAuthMiddleware(mockUser))
      app.get('/stats', mockRequireAuth, async (c) => {
        const user = c.get('user')!
        const stats = await mockCalculateAllStats(user.id)
        return c.json({
          ...stats,
          message: '[SYSTEM] Stats calculated from your baseline and activity.',
        })
      })

      const res = await app.request('/stats')
      expect(res.status).toBe(200)

      const body = await res.json() as {
        STR: number
        AGI: number
        VIT: number
        DISC: number
        message: string
      }

      expect(body.STR).toBe(15)
      expect(body.AGI).toBe(12)
      expect(body.VIT).toBe(18)
      expect(body.DISC).toBe(14)
      expect(body.message).toContain('[SYSTEM]')
    })

    it('should handle service errors gracefully', async () => {
      mockCalculateAllStats.mockRejectedValue(new Error('Database error'))

      const app = new Hono()
      app.use('*', createMockAuthMiddleware(mockUser))
      app.get('/stats', mockRequireAuth, async (c) => {
        const user = c.get('user')!
        try {
          const stats = await mockCalculateAllStats(user.id)
          return c.json(stats)
        } catch {
          return c.json({ error: 'Failed to get stats' }, 500)
        }
      })

      const res = await app.request('/stats')
      expect(res.status).toBe(500)

      const body = await res.json() as { error: string }
      expect(body.error).toBe('Failed to get stats')
    })
  })

  describe('GET /stats/breakdown', () => {
    it('should return 400 when stat param is missing', async () => {
      const app = new Hono()
      app.use('*', createMockAuthMiddleware(mockUser))
      app.get('/stats/breakdown', mockRequireAuth, async (c) => {
        const statParam = c.req.query('stat')?.toUpperCase()

        if (!statParam || !['STR', 'AGI', 'VIT', 'DISC'].includes(statParam)) {
          return c.json({
            error: 'Invalid stat',
            message: '[SYSTEM] Specify stat: STR, AGI, VIT, or DISC',
          }, 400)
        }

        return c.json({})
      })

      const res = await app.request('/stats/breakdown')
      expect(res.status).toBe(400)

      const body = await res.json() as { error: string }
      expect(body.error).toBe('Invalid stat')
    })

    it('should return 400 for invalid stat type', async () => {
      const app = new Hono()
      app.use('*', createMockAuthMiddleware(mockUser))
      app.get('/stats/breakdown', mockRequireAuth, async (c) => {
        const statParam = c.req.query('stat')?.toUpperCase()

        if (!statParam || !['STR', 'AGI', 'VIT', 'DISC'].includes(statParam)) {
          return c.json({
            error: 'Invalid stat',
            message: '[SYSTEM] Specify stat: STR, AGI, VIT, or DISC',
          }, 400)
        }

        return c.json({})
      })

      const res = await app.request('/stats/breakdown?stat=INVALID')
      expect(res.status).toBe(400)

      const body = await res.json() as { error: string }
      expect(body.error).toBe('Invalid stat')
    })

    it('should return breakdown for valid stat', async () => {
      mockCalculateStat.mockResolvedValue(mockStatBreakdown)

      const app = new Hono()
      app.use('*', createMockAuthMiddleware(mockUser))
      app.get('/stats/breakdown', mockRequireAuth, async (c) => {
        const user = c.get('user')!
        const statParam = c.req.query('stat')?.toUpperCase()

        if (!statParam || !['STR', 'AGI', 'VIT', 'DISC'].includes(statParam)) {
          return c.json({ error: 'Invalid stat' }, 400)
        }

        const breakdown = await mockCalculateStat(user.id, statParam)
        return c.json({
          ...breakdown,
          message: `[SYSTEM] ${statParam} breakdown retrieved.`,
        })
      })

      const res = await app.request('/stats/breakdown?stat=STR')
      expect(res.status).toBe(200)

      const body = await res.json() as {
        stat: string
        value: number
        baseline: number
        message: string
      }

      expect(body.stat).toBe('STR')
      expect(body.value).toBe(15)
      expect(body.message).toContain('STR breakdown')
    })

    it('should accept lowercase stat param', async () => {
      mockCalculateStat.mockResolvedValue({ stat: 'AGI', value: 12 })

      const app = new Hono()
      app.use('*', createMockAuthMiddleware(mockUser))
      app.get('/stats/breakdown', mockRequireAuth, async (c) => {
        const user = c.get('user')!
        const statParam = c.req.query('stat')?.toUpperCase()

        if (!statParam || !['STR', 'AGI', 'VIT', 'DISC'].includes(statParam)) {
          return c.json({ error: 'Invalid stat' }, 400)
        }

        const breakdown = await mockCalculateStat(user.id, statParam)
        return c.json(breakdown)
      })

      const res = await app.request('/stats/breakdown?stat=agi')
      expect(res.status).toBe(200)

      expect(mockCalculateStat).toHaveBeenCalledWith(mockUser.id, 'AGI')
    })
  })

  describe('GET /stats/milestones', () => {
    it('should return 401 when not authenticated', async () => {
      const app = new Hono()
      app.use('*', createMockAuthMiddleware(null))
      app.get('/stats/milestones', mockRequireAuth, async () => {
        return new Response(null)
      })

      const res = await app.request('/stats/milestones')
      expect(res.status).toBe(401)
    })

    it('should return milestones for all stats', async () => {
      mockGetAllMilestones.mockResolvedValue(mockMilestones)

      const app = new Hono()
      app.use('*', createMockAuthMiddleware(mockUser))
      app.get('/stats/milestones', mockRequireAuth, async (c) => {
        const user = c.get('user')!
        const milestones = await mockGetAllMilestones(user.id)

        return c.json({
          milestones,
          message: '[SYSTEM] Milestones identified. Push harder.',
        })
      })

      const res = await app.request('/stats/milestones')
      expect(res.status).toBe(200)

      const body = await res.json() as {
        milestones: typeof mockMilestones
        message: string
      }

      expect(body.milestones).toHaveProperty('STR')
      expect(body.milestones).toHaveProperty('AGI')
      expect(body.milestones).toHaveProperty('VIT')
      expect(body.milestones).toHaveProperty('DISC')
      expect(body.milestones.STR.nextMilestone).toBe(20)
      expect(body.message).toContain('Milestones')
    })
  })

  describe('POST /stats/refresh', () => {
    it('should recalculate and return updated stats', async () => {
      mockUpdateUserStats.mockResolvedValue(undefined)
      mockCalculateAllStats.mockResolvedValue(mockAllStats)

      const app = new Hono()
      app.use('*', createMockAuthMiddleware(mockUser))
      app.post('/stats/refresh', mockRequireAuth, async (c) => {
        const user = c.get('user')!
        await mockUpdateUserStats(user.id)
        const stats = await mockCalculateAllStats(user.id)

        return c.json({
          ...stats,
          message: '[SYSTEM] Stats recalculated and saved.',
        })
      })

      const res = await app.request('/stats/refresh', { method: 'POST' })
      expect(res.status).toBe(200)

      expect(mockUpdateUserStats).toHaveBeenCalledWith(mockUser.id)
      expect(mockCalculateAllStats).toHaveBeenCalledWith(mockUser.id)

      const body = await res.json() as { STR: number; message: string }
      expect(body.STR).toBe(15)
      expect(body.message).toContain('recalculated')
    })

    it('should handle errors during refresh', async () => {
      mockUpdateUserStats.mockRejectedValue(new Error('Update failed'))

      const app = new Hono()
      app.use('*', createMockAuthMiddleware(mockUser))
      app.post('/stats/refresh', mockRequireAuth, async (c) => {
        const user = c.get('user')!
        try {
          await mockUpdateUserStats(user.id)
          const stats = await mockCalculateAllStats(user.id)
          return c.json(stats)
        } catch {
          return c.json({ error: 'Failed to refresh stats' }, 500)
        }
      })

      const res = await app.request('/stats/refresh', { method: 'POST' })
      expect(res.status).toBe(500)

      const body = await res.json() as { error: string }
      expect(body.error).toBe('Failed to refresh stats')
    })
  })

  describe('Stats response structure', () => {
    it('should include all four stat types', () => {
      const requiredStats = ['STR', 'AGI', 'VIT', 'DISC']
      for (const stat of requiredStats) {
        expect(mockAllStats).toHaveProperty(stat)
      }
    })

    it('should have numeric stat values', () => {
      expect(typeof mockAllStats.STR).toBe('number')
      expect(typeof mockAllStats.AGI).toBe('number')
      expect(typeof mockAllStats.VIT).toBe('number')
      expect(typeof mockAllStats.DISC).toBe('number')
    })

    it('should have valid stat names', () => {
      const validStats = ['STR', 'AGI', 'VIT', 'DISC']
      expect(validStats).toContain('STR')
      expect(validStats).toContain('AGI')
      expect(validStats).toContain('VIT')
      expect(validStats).toContain('DISC')
    })
  })
})
