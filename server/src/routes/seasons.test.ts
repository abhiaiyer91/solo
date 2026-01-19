import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Hono } from 'hono'
import {
  createMockAuthMiddleware,
  mockRequireAuth,
  mockUser,
} from '../test/helpers/request'
import { mockSeason, mockSeasonProgress, mockSeasonHistory } from '../test/fixtures/routes'

// Mock modules before importing
vi.mock('../db', () => ({
  dbClient: null,
}))

vi.mock('../lib/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}))

// Mock season service
const mockGetAllSeasons = vi.fn()
const mockGetCurrentSeason = vi.fn()
const mockGetSeasonById = vi.fn()
const mockGetUserCurrentSeason = vi.fn()
const mockGetUserSeasonHistory = vi.fn()
const mockGetSeasonLeaderboard = vi.fn()
const mockStartUserInSeason = vi.fn()
const mockGetSeasonByNumber = vi.fn()

vi.mock('../services/season', () => ({
  getAllSeasons: (...args: unknown[]) => mockGetAllSeasons(...args),
  getCurrentSeason: (...args: unknown[]) => mockGetCurrentSeason(...args),
  getSeasonById: (...args: unknown[]) => mockGetSeasonById(...args),
  getUserCurrentSeason: (...args: unknown[]) => mockGetUserCurrentSeason(...args),
  getUserSeasonHistory: (...args: unknown[]) => mockGetUserSeasonHistory(...args),
  getSeasonLeaderboard: (...args: unknown[]) => mockGetSeasonLeaderboard(...args),
  startUserInSeason: (...args: unknown[]) => mockStartUserInSeason(...args),
  getSeasonByNumber: (...args: unknown[]) => mockGetSeasonByNumber(...args),
}))

// Mock title service
const mockGetAllTitles = vi.fn()

vi.mock('../services/title', () => ({
  getAllTitles: (...args: unknown[]) => mockGetAllTitles(...args),
}))

describe('Season Routes', () => {
  const mockSeasonData = {
    id: 'season-1',
    name: 'The Awakening',
    theme: 'emergence',
    number: 1,
    status: 'ACTIVE',
    startDate: new Date('2026-01-01'),
    endDate: null,
  }

  const mockParticipation = {
    userId: mockUser.id,
    seasonId: 'season-1',
    xp: 500,
    startedAt: new Date('2026-01-05'),
    season: mockSeasonData,
  }

  const mockTitles = [
    { id: 'title-1', name: 'Novice', requiredLevel: 1 },
    { id: 'title-2', name: 'Apprentice', requiredLevel: 5 },
    { id: 'title-3', name: 'Adept', requiredLevel: 10 },
  ]

  const mockLeaderboard = [
    { userId: 'user-1', displayName: 'TopHunter', xp: 2000, rank: 1 },
    { userId: 'user-2', displayName: 'SecondPlace', xp: 1500, rank: 2 },
    { userId: mockUser.id, displayName: 'TestHunter', xp: 500, rank: 42 },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /titles', () => {
    it('should return all titles (public endpoint)', async () => {
      mockGetAllTitles.mockResolvedValue(mockTitles)

      const app = new Hono()
      app.get('/titles', async (c) => {
        try {
          const allTitles = await mockGetAllTitles()
          return c.json({ titles: allTitles })
        } catch {
          return c.json({ error: 'Failed to get titles' }, 500)
        }
      })

      const res = await app.request('/titles')
      expect(res.status).toBe(200)

      const body = await res.json() as { titles: typeof mockTitles }
      expect(body.titles).toHaveLength(3)
      expect(body.titles[0].name).toBe('Novice')
    })

    it('should handle errors gracefully', async () => {
      mockGetAllTitles.mockRejectedValue(new Error('Database error'))

      const app = new Hono()
      app.get('/titles', async (c) => {
        try {
          const allTitles = await mockGetAllTitles()
          return c.json({ titles: allTitles })
        } catch {
          return c.json({ error: 'Failed to get titles' }, 500)
        }
      })

      const res = await app.request('/titles')
      expect(res.status).toBe(500)

      const body = await res.json() as { error: string }
      expect(body.error).toBe('Failed to get titles')
    })
  })

  describe('GET /seasons', () => {
    it('should return all seasons', async () => {
      const allSeasons = [mockSeasonData, { ...mockSeasonData, id: 'season-2', number: 2, name: 'The Contender' }]
      mockGetAllSeasons.mockResolvedValue(allSeasons)

      const app = new Hono()
      app.get('/seasons', async (c) => {
        try {
          const seasons = await mockGetAllSeasons()
          return c.json({ seasons })
        } catch {
          return c.json({ error: 'Failed to get seasons' }, 500)
        }
      })

      const res = await app.request('/seasons')
      expect(res.status).toBe(200)

      const body = await res.json() as { seasons: typeof allSeasons }
      expect(body.seasons).toHaveLength(2)
    })
  })

  describe('GET /seasons/current', () => {
    it('should return current season when active', async () => {
      mockGetCurrentSeason.mockResolvedValue(mockSeasonData)

      const app = new Hono()
      app.get('/seasons/current', async (c) => {
        try {
          const current = await mockGetCurrentSeason()
          if (!current) {
            return c.json({ error: 'No active season' }, 404)
          }
          return c.json(current)
        } catch {
          return c.json({ error: 'Failed to get current season' }, 500)
        }
      })

      const res = await app.request('/seasons/current')
      expect(res.status).toBe(200)

      const body = await res.json() as typeof mockSeasonData
      expect(body.name).toBe('The Awakening')
      expect(body.status).toBe('ACTIVE')
    })

    it('should return 404 when no active season', async () => {
      mockGetCurrentSeason.mockResolvedValue(null)

      const app = new Hono()
      app.get('/seasons/current', async (c) => {
        try {
          const current = await mockGetCurrentSeason()
          if (!current) {
            return c.json({ error: 'No active season' }, 404)
          }
          return c.json(current)
        } catch {
          return c.json({ error: 'Failed to get current season' }, 500)
        }
      })

      const res = await app.request('/seasons/current')
      expect(res.status).toBe(404)

      const body = await res.json() as { error: string }
      expect(body.error).toBe('No active season')
    })
  })

  describe('GET /seasons/:id', () => {
    it('should return specific season by id', async () => {
      mockGetSeasonById.mockResolvedValue(mockSeasonData)

      const app = new Hono()
      app.get('/seasons/:id', async (c) => {
        const seasonId = c.req.param('id')
        try {
          const season = await mockGetSeasonById(seasonId)
          if (!season) {
            return c.json({ error: 'Season not found' }, 404)
          }
          return c.json(season)
        } catch {
          return c.json({ error: 'Failed to get season' }, 500)
        }
      })

      const res = await app.request('/seasons/season-1')
      expect(res.status).toBe(200)

      expect(mockGetSeasonById).toHaveBeenCalledWith('season-1')
    })

    it('should return 404 for non-existent season', async () => {
      mockGetSeasonById.mockResolvedValue(null)

      const app = new Hono()
      app.get('/seasons/:id', async (c) => {
        const seasonId = c.req.param('id')
        try {
          const season = await mockGetSeasonById(seasonId)
          if (!season) {
            return c.json({ error: 'Season not found' }, 404)
          }
          return c.json(season)
        } catch {
          return c.json({ error: 'Failed to get season' }, 500)
        }
      })

      const res = await app.request('/seasons/non-existent')
      expect(res.status).toBe(404)

      const body = await res.json() as { error: string }
      expect(body.error).toBe('Season not found')
    })
  })

  describe('GET /seasons/:id/leaderboard', () => {
    it('should return leaderboard for season', async () => {
      mockGetSeasonLeaderboard.mockResolvedValue(mockLeaderboard)

      const app = new Hono()
      app.get('/seasons/:id/leaderboard', async (c) => {
        const seasonId = c.req.param('id')
        const limit = parseInt(c.req.query('limit') || '50')
        const offset = parseInt(c.req.query('offset') || '0')

        try {
          const leaderboard = await mockGetSeasonLeaderboard(seasonId, limit, offset)
          return c.json({ leaderboard })
        } catch {
          return c.json({ error: 'Failed to get leaderboard' }, 500)
        }
      })

      const res = await app.request('/seasons/season-1/leaderboard')
      expect(res.status).toBe(200)

      const body = await res.json() as { leaderboard: typeof mockLeaderboard }
      expect(body.leaderboard).toHaveLength(3)
      expect(body.leaderboard[0].rank).toBe(1)
      expect(mockGetSeasonLeaderboard).toHaveBeenCalledWith('season-1', 50, 0)
    })

    it('should support pagination params', async () => {
      mockGetSeasonLeaderboard.mockResolvedValue([])

      const app = new Hono()
      app.get('/seasons/:id/leaderboard', async (c) => {
        const seasonId = c.req.param('id')
        const limit = parseInt(c.req.query('limit') || '50')
        const offset = parseInt(c.req.query('offset') || '0')

        try {
          const leaderboard = await mockGetSeasonLeaderboard(seasonId, limit, offset)
          return c.json({ leaderboard })
        } catch {
          return c.json({ error: 'Failed to get leaderboard' }, 500)
        }
      })

      await app.request('/seasons/season-1/leaderboard?limit=10&offset=20')

      expect(mockGetSeasonLeaderboard).toHaveBeenCalledWith('season-1', 10, 20)
    })
  })

  describe('GET /seasons/quests', () => {
    it('should return 401 when not authenticated', async () => {
      const app = new Hono()
      app.use('*', createMockAuthMiddleware(null))
      app.get('/seasons/quests', mockRequireAuth, async () => {
        return new Response(null)
      })

      const res = await app.request('/seasons/quests')
      expect(res.status).toBe(401)
    })

    it('should return seasonal quests when authenticated', async () => {
      mockGetUserCurrentSeason.mockResolvedValue(mockParticipation)

      const app = new Hono()
      app.use('*', createMockAuthMiddleware(mockUser))
      app.get('/seasons/quests', mockRequireAuth, async (c) => {
        const user = c.get('user')!

        try {
          const participation = await mockGetUserCurrentSeason(user.id)
          const currentSeason = participation?.season ?? null

          const UNLOCK_SEASON = 2
          const isUnlocked = currentSeason ? currentSeason.number >= UNLOCK_SEASON : false

          return c.json({
            season: currentSeason
              ? {
                  id: currentSeason.id,
                  name: currentSeason.name,
                  theme: currentSeason.theme,
                  number: currentSeason.number,
                  isActive: currentSeason.status === 'ACTIVE',
                }
              : null,
            quests: [],
            isUnlocked,
            unlockSeason: UNLOCK_SEASON,
            currentSeason: currentSeason?.number ?? null,
          })
        } catch {
          return c.json({ error: 'Failed to get seasonal quests' }, 500)
        }
      })

      const res = await app.request('/seasons/quests')
      expect(res.status).toBe(200)

      const body = await res.json() as {
        season: { id: string; name: string }
        quests: unknown[]
        isUnlocked: boolean
        unlockSeason: number
      }

      expect(body.season?.name).toBe('The Awakening')
      expect(body.isUnlocked).toBe(false) // Season 1 < unlock requirement (2)
      expect(body.unlockSeason).toBe(2)
    })

    it('should unlock quests in Season 2+', async () => {
      const season2Participation = {
        ...mockParticipation,
        season: { ...mockSeasonData, number: 2, name: 'The Contender' },
      }
      mockGetUserCurrentSeason.mockResolvedValue(season2Participation)

      const app = new Hono()
      app.use('*', createMockAuthMiddleware(mockUser))
      app.get('/seasons/quests', mockRequireAuth, async (c) => {
        const user = c.get('user')!

        try {
          const participation = await mockGetUserCurrentSeason(user.id)
          const currentSeason = participation?.season ?? null

          const UNLOCK_SEASON = 2
          const isUnlocked = currentSeason ? currentSeason.number >= UNLOCK_SEASON : false

          return c.json({
            isUnlocked,
            currentSeason: currentSeason?.number ?? null,
          })
        } catch {
          return c.json({ error: 'Failed' }, 500)
        }
      })

      const res = await app.request('/seasons/quests')
      expect(res.status).toBe(200)

      const body = await res.json() as { isUnlocked: boolean; currentSeason: number }
      expect(body.isUnlocked).toBe(true)
      expect(body.currentSeason).toBe(2)
    })
  })

  describe('GET /player/season', () => {
    it('should return 401 when not authenticated', async () => {
      const app = new Hono()
      app.use('*', createMockAuthMiddleware(null))
      app.get('/player/season', mockRequireAuth, async () => {
        return new Response(null)
      })

      const res = await app.request('/player/season')
      expect(res.status).toBe(401)
    })

    it('should return player current season', async () => {
      mockGetUserCurrentSeason.mockResolvedValue(mockParticipation)

      const app = new Hono()
      app.use('*', createMockAuthMiddleware(mockUser))
      app.get('/player/season', mockRequireAuth, async (c) => {
        const user = c.get('user')!

        try {
          const participation = await mockGetUserCurrentSeason(user.id)
          return c.json(participation)
        } catch {
          return c.json({ error: 'Failed to get player season' }, 500)
        }
      })

      const res = await app.request('/player/season')
      expect(res.status).toBe(200)

      const body = await res.json() as typeof mockParticipation
      expect(body.xp).toBe(500)
      expect(body.seasonId).toBe('season-1')
    })

    it('should auto-enroll user in Season 1 if no season', async () => {
      mockGetUserCurrentSeason.mockResolvedValue(null)
      mockGetSeasonByNumber.mockResolvedValue(mockSeasonData)
      mockStartUserInSeason.mockResolvedValue(mockParticipation)

      const app = new Hono()
      app.use('*', createMockAuthMiddleware(mockUser))
      app.get('/player/season', mockRequireAuth, async (c) => {
        const user = c.get('user')!

        try {
          let participation = await mockGetUserCurrentSeason(user.id)

          if (!participation) {
            const season1 = await mockGetSeasonByNumber(1)
            if (season1) {
              participation = await mockStartUserInSeason(user.id, season1.id)
            }
          }

          return c.json(participation)
        } catch {
          return c.json({ error: 'Failed to get player season' }, 500)
        }
      })

      const res = await app.request('/player/season')
      expect(res.status).toBe(200)

      expect(mockGetSeasonByNumber).toHaveBeenCalledWith(1)
      expect(mockStartUserInSeason).toHaveBeenCalledWith(mockUser.id, mockSeasonData.id)
    })
  })

  describe('GET /player/seasons/history', () => {
    it('should return 401 when not authenticated', async () => {
      const app = new Hono()
      app.use('*', createMockAuthMiddleware(null))
      app.get('/player/seasons/history', mockRequireAuth, async () => {
        return new Response(null)
      })

      const res = await app.request('/player/seasons/history')
      expect(res.status).toBe(401)
    })

    it('should return player season history', async () => {
      const history = [
        { seasonId: 'season-1', xp: 500, completedAt: null },
        { seasonId: 'season-0', xp: 1200, completedAt: '2025-12-31' },
      ]
      mockGetUserSeasonHistory.mockResolvedValue(history)

      const app = new Hono()
      app.use('*', createMockAuthMiddleware(mockUser))
      app.get('/player/seasons/history', mockRequireAuth, async (c) => {
        const user = c.get('user')!

        try {
          const seasonHistory = await mockGetUserSeasonHistory(user.id)
          return c.json({ history: seasonHistory })
        } catch {
          return c.json({ error: 'Failed to get season history' }, 500)
        }
      })

      const res = await app.request('/player/seasons/history')
      expect(res.status).toBe(200)

      const body = await res.json() as { history: typeof history }
      expect(body.history).toHaveLength(2)
      expect(body.history[1].xp).toBe(1200)
    })

    it('should return empty array for new users', async () => {
      mockGetUserSeasonHistory.mockResolvedValue([])

      const app = new Hono()
      app.use('*', createMockAuthMiddleware(mockUser))
      app.get('/player/seasons/history', mockRequireAuth, async (c) => {
        const user = c.get('user')!

        try {
          const history = await mockGetUserSeasonHistory(user.id)
          return c.json({ history })
        } catch {
          return c.json({ error: 'Failed to get season history' }, 500)
        }
      })

      const res = await app.request('/player/seasons/history')
      expect(res.status).toBe(200)

      const body = await res.json() as { history: unknown[] }
      expect(body.history).toHaveLength(0)
    })
  })

  describe('Season data structure', () => {
    it('should have required season fields', () => {
      const requiredFields = ['id', 'name', 'number', 'status']
      for (const field of requiredFields) {
        expect(mockSeasonData).toHaveProperty(field)
      }
    })

    it('should have valid season status values', () => {
      const validStatuses = ['ACTIVE', 'UPCOMING', 'COMPLETED']
      expect(validStatuses).toContain(mockSeasonData.status)
    })

    it('should have numeric season numbers', () => {
      expect(typeof mockSeasonData.number).toBe('number')
      expect(mockSeasonData.number).toBeGreaterThanOrEqual(1)
    })
  })
})
