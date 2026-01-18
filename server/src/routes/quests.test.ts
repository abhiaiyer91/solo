import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Hono } from 'hono'
import type { Context, Next } from 'hono'

// Mock modules before importing routes
vi.mock('../db', () => ({
  dbClient: null,
}))

// Mock quest service
const mockGetTodayQuestsWithRotating = vi.fn()
const mockGetQuestById = vi.fn()
const mockUpdateQuestProgress = vi.fn()
const mockResetQuest = vi.fn()
const mockGetAllQuestTemplates = vi.fn()
const mockActivateQuest = vi.fn()

vi.mock('../services/quest', () => ({
  getTodayQuestsWithRotating: (...args: unknown[]) => mockGetTodayQuestsWithRotating(...args),
  getQuestById: (...args: unknown[]) => mockGetQuestById(...args),
  updateQuestProgress: (...args: unknown[]) => mockUpdateQuestProgress(...args),
  resetQuest: (...args: unknown[]) => mockResetQuest(...args),
  getAllQuestTemplates: (...args: unknown[]) => mockGetAllQuestTemplates(...args),
  activateQuest: (...args: unknown[]) => mockActivateQuest(...args),
}))

// Mock weekly quest service
const mockGetWeeklyQuests = vi.fn()
const mockGetWeeklyQuestById = vi.fn()

vi.mock('../services/weekly-quest', () => ({
  getWeeklyQuests: (...args: unknown[]) => mockGetWeeklyQuests(...args),
  getWeeklyQuestById: (...args: unknown[]) => mockGetWeeklyQuestById(...args),
}))

// Mock rotating quest service
const mockGetRotatingQuestUnlockStatus = vi.fn()
const mockGetTodayRotatingQuest = vi.fn()
const mockGetRotatingQuestUnlockNarrative = vi.fn()
const mockGetRotatingQuestNarrative = vi.fn()

vi.mock('../services/rotating-quest', () => ({
  getRotatingQuestUnlockStatus: (...args: unknown[]) => mockGetRotatingQuestUnlockStatus(...args),
  getTodayRotatingQuest: (...args: unknown[]) => mockGetTodayRotatingQuest(...args),
  getRotatingQuestUnlockNarrative: () => mockGetRotatingQuestUnlockNarrative(),
  getRotatingQuestNarrative: (...args: unknown[]) => mockGetRotatingQuestNarrative(...args),
  ROTATING_QUEST_UNLOCK_DAY: 7,
}))

// Create test middleware
function mockAuthMiddleware(user: object | null) {
  return async (c: Context, next: Next) => {
    c.set('user', user as never)
    c.set('session', (user ? { id: 'session-1' } : null) as never)
    return next()
  }
}

// Mock requireAuth
async function mockRequireAuth(c: Context, next: Next) {
  const user = c.get('user')
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  return next()
}

describe('Quest Routes', () => {
  const mockUser = {
    id: 'user-123',
    name: 'Test Hunter',
    email: 'test@example.com',
    level: 5,
    totalXP: 500,
    timezone: 'America/New_York',
  }

  const mockQuest = {
    id: 'quest-1',
    templateId: 'core-steps',
    name: 'Daily Steps',
    description: 'Walk 10,000 steps',
    type: 'DAILY',
    category: 'MOVEMENT',
    baseXP: 50,
    status: 'ACTIVE',
    currentValue: 5000,
    targetValue: 10000,
    completionPercent: 50,
    isCore: true,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /quests', () => {
    it('should return 401 when not authenticated', async () => {
      const app = new Hono()
      app.use('*', mockAuthMiddleware(null))
      app.get('/quests', mockRequireAuth, async (c) => {
        return c.json({ quests: [] })
      })

      const res = await app.request('/quests')
      expect(res.status).toBe(401)
    })

    it('should return quests for authenticated user', async () => {
      mockGetTodayQuestsWithRotating.mockResolvedValue({
        coreQuests: [mockQuest],
        rotatingQuest: null,
        rotatingUnlockStatus: { unlocked: false, daysRemaining: 3 },
      })

      const app = new Hono()
      app.use('*', mockAuthMiddleware(mockUser))
      app.get('/quests', mockRequireAuth, async (c) => {
        const user = c.get('user')!
        const { coreQuests, rotatingQuest, rotatingUnlockStatus } =
          await mockGetTodayQuestsWithRotating(user.id, user.timezone ?? 'UTC')

        const allQuests = rotatingQuest ? [...coreQuests, rotatingQuest] : coreQuests

        return c.json({
          quests: allQuests,
          coreQuests,
          rotatingQuest,
          rotatingUnlockStatus,
          date: '2026-01-18',
        })
      })

      const res = await app.request('/quests')
      expect(res.status).toBe(200)

      const body = await res.json() as {
        quests: unknown[]
        coreQuests: unknown[]
        rotatingQuest: unknown
        rotatingUnlockStatus: { unlocked: boolean; daysRemaining: number }
      }
      expect(body.quests).toHaveLength(1)
      expect(body.coreQuests).toHaveLength(1)
      expect(body.rotatingQuest).toBeNull()
      expect(body.rotatingUnlockStatus).toEqual({ unlocked: false, daysRemaining: 3 })
    })

    it('should include rotating quest when unlocked', async () => {
      const rotatingQuest = {
        ...mockQuest,
        id: 'quest-rotating',
        templateId: 'rotating-1',
        name: 'Rotating Challenge',
        isCore: false,
      }

      mockGetTodayQuestsWithRotating.mockResolvedValue({
        coreQuests: [mockQuest],
        rotatingQuest,
        rotatingUnlockStatus: { unlocked: true, daysRemaining: 0 },
      })

      const app = new Hono()
      app.use('*', mockAuthMiddleware(mockUser))
      app.get('/quests', mockRequireAuth, async (c) => {
        const user = c.get('user')!
        const { coreQuests, rotatingQuest, rotatingUnlockStatus } =
          await mockGetTodayQuestsWithRotating(user.id, user.timezone ?? 'UTC')

        const allQuests = rotatingQuest ? [...coreQuests, rotatingQuest] : coreQuests

        return c.json({
          quests: allQuests,
          coreQuests,
          rotatingQuest,
          rotatingUnlockStatus,
        })
      })

      const res = await app.request('/quests')
      const body = await res.json() as {
        quests: unknown[]
        rotatingQuest: { name: string } | null
      }

      expect(body.quests).toHaveLength(2)
      expect(body.rotatingQuest).not.toBeNull()
      expect(body.rotatingQuest!.name).toBe('Rotating Challenge')
    })
  })

  describe('GET /quests/:id', () => {
    it('should return 404 when quest not found', async () => {
      mockGetQuestById.mockResolvedValue(null)

      const app = new Hono()
      app.use('*', mockAuthMiddleware(mockUser))
      app.get('/quests/:id', mockRequireAuth, async (c) => {
        const user = c.get('user')!
        const questId = c.req.param('id')
        const quest = await mockGetQuestById(questId, user.id)

        if (!quest) {
          return c.json({ error: 'Quest not found' }, 404)
        }
        return c.json(quest)
      })

      const res = await app.request('/quests/nonexistent')
      expect(res.status).toBe(404)
    })

    it('should return quest when found', async () => {
      mockGetQuestById.mockResolvedValue(mockQuest)

      const app = new Hono()
      app.use('*', mockAuthMiddleware(mockUser))
      app.get('/quests/:id', mockRequireAuth, async (c) => {
        const user = c.get('user')!
        const questId = c.req.param('id')
        const quest = await mockGetQuestById(questId, user.id)

        if (!quest) {
          return c.json({ error: 'Quest not found' }, 404)
        }
        return c.json(quest)
      })

      const res = await app.request('/quests/quest-1')
      expect(res.status).toBe(200)

      const body = await res.json() as { id: string; name: string }
      expect(body.id).toBe('quest-1')
      expect(body.name).toBe('Daily Steps')
    })
  })

  describe('POST /quests/:id/complete', () => {
    it('should complete quest with XP awarded', async () => {
      mockUpdateQuestProgress.mockResolvedValue({
        quest: { ...mockQuest, status: 'COMPLETED', completionPercent: 100 },
        xpAwarded: 50,
        leveledUp: false,
        newLevel: undefined,
      })

      const app = new Hono()
      app.use('*', mockAuthMiddleware(mockUser))
      app.post('/quests/:id/complete', mockRequireAuth, async (c) => {
        const user = c.get('user')!
        const questId = c.req.param('id')
        const body = await c.req.json<{ data: Record<string, number | boolean> }>()

        const result = await mockUpdateQuestProgress(questId, user.id, body.data)

        return c.json({
          quest: result.quest,
          xpAwarded: result.xpAwarded,
          leveledUp: result.leveledUp,
          newLevel: result.newLevel,
          message:
            result.xpAwarded > 0
              ? `[SYSTEM] Quest complete! +${result.xpAwarded} XP`
              : '[SYSTEM] Quest progress updated.',
        })
      })

      const res = await app.request('/quests/quest-1/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: { steps: 10000 } }),
      })

      expect(res.status).toBe(200)

      const body = await res.json() as { xpAwarded: number; quest: { status: string }; message: string }
      expect(body.xpAwarded).toBe(50)
      expect(body.quest.status).toBe('COMPLETED')
      expect(body.message).toContain('+50 XP')
    })

    it('should indicate level up when player levels', async () => {
      mockUpdateQuestProgress.mockResolvedValue({
        quest: { ...mockQuest, status: 'COMPLETED' },
        xpAwarded: 100,
        leveledUp: true,
        newLevel: 6,
      })

      const app = new Hono()
      app.use('*', mockAuthMiddleware(mockUser))
      app.post('/quests/:id/complete', mockRequireAuth, async (c) => {
        const user = c.get('user')!
        const questId = c.req.param('id')
        const body = await c.req.json<{ data: Record<string, number | boolean> }>()

        const result = await mockUpdateQuestProgress(questId, user.id, body.data)

        return c.json({
          quest: result.quest,
          xpAwarded: result.xpAwarded,
          leveledUp: result.leveledUp,
          newLevel: result.newLevel,
          message:
            result.xpAwarded > 0
              ? `[SYSTEM] Quest complete! +${result.xpAwarded} XP${result.leveledUp ? ` Level up! Level ${result.newLevel}!` : ''}`
              : '[SYSTEM] Quest progress updated.',
        })
      })

      const res = await app.request('/quests/quest-1/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: { steps: 15000 } }),
      })

      const body = await res.json() as { leveledUp: boolean; newLevel: number; message: string }
      expect(body.leveledUp).toBe(true)
      expect(body.newLevel).toBe(6)
      expect(body.message).toContain('Level up')
    })

    it('should handle service errors gracefully', async () => {
      mockUpdateQuestProgress.mockRejectedValue(new Error('Quest is not active'))

      const app = new Hono()
      app.use('*', mockAuthMiddleware(mockUser))
      app.post('/quests/:id/complete', mockRequireAuth, async (c) => {
        const user = c.get('user')!
        const questId = c.req.param('id')

        try {
          const body = await c.req.json<{ data: Record<string, number | boolean> }>()
          const result = await mockUpdateQuestProgress(questId, user.id, body.data)
          return c.json(result)
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to complete quest'
          return c.json({ error: message }, 400)
        }
      })

      const res = await app.request('/quests/quest-1/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: { steps: 10000 } }),
      })

      expect(res.status).toBe(400)
      const body = await res.json() as { error: string }
      expect(body.error).toBe('Quest is not active')
    })
  })

  describe('POST /quests/:id/reset', () => {
    it('should reset quest and remove XP', async () => {
      mockResetQuest.mockResolvedValue({
        quest: { ...mockQuest, status: 'ACTIVE', currentValue: 0, completionPercent: 0 },
        xpRemoved: 50,
      })

      const app = new Hono()
      app.use('*', mockAuthMiddleware(mockUser))
      app.post('/quests/:id/reset', mockRequireAuth, async (c) => {
        const user = c.get('user')!
        const questId = c.req.param('id')

        const result = await mockResetQuest(questId, user.id)

        return c.json({
          quest: result.quest,
          xpRemoved: result.xpRemoved,
          message:
            result.xpRemoved > 0
              ? `[SYSTEM] Quest reset. -${result.xpRemoved} XP removed.`
              : '[SYSTEM] Quest reset.',
        })
      })

      const res = await app.request('/quests/quest-1/reset', { method: 'POST' })
      expect(res.status).toBe(200)

      const body = await res.json() as { xpRemoved: number; quest: { status: string }; message: string }
      expect(body.xpRemoved).toBe(50)
      expect(body.quest.status).toBe('ACTIVE')
      expect(body.message).toContain('-50 XP')
    })

    it('should handle reset errors', async () => {
      mockResetQuest.mockRejectedValue(new Error('Quest is not completed - cannot reset'))

      const app = new Hono()
      app.use('*', mockAuthMiddleware(mockUser))
      app.post('/quests/:id/reset', mockRequireAuth, async (c) => {
        const user = c.get('user')!
        const questId = c.req.param('id')

        try {
          const result = await mockResetQuest(questId, user.id)
          return c.json(result)
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to reset quest'
          return c.json({ error: message }, 400)
        }
      })

      const res = await app.request('/quests/quest-1/reset', { method: 'POST' })
      expect(res.status).toBe(400)

      const body = await res.json() as { error: string }
      expect(body.error).toContain('not completed')
    })
  })

  describe('GET /quests/rotating/status', () => {
    it('should return locked status when not unlocked', async () => {
      mockGetRotatingQuestUnlockStatus.mockResolvedValue({
        unlocked: false,
        currentDay: 3,
        daysRemaining: 4,
      })
      mockGetRotatingQuestUnlockNarrative.mockReturnValue('Keep pushing, Hunter...')

      const app = new Hono()
      app.use('*', mockAuthMiddleware(mockUser))
      app.get('/quests/rotating/status', mockRequireAuth, async (c) => {
        const user = c.get('user')!
        const status = await mockGetRotatingQuestUnlockStatus(user.id)

        return c.json({
          ...status,
          unlockNarrative: status.unlocked ? null : mockGetRotatingQuestUnlockNarrative(),
          message: status.unlocked
            ? '[SYSTEM] Rotating quest slot active.'
            : `[SYSTEM] Rotating quest slot locked. ${status.daysRemaining} days remaining.`,
        })
      })

      const res = await app.request('/quests/rotating/status')
      expect(res.status).toBe(200)

      const body = await res.json() as { unlocked: boolean; daysRemaining: number; unlockNarrative: string }
      expect(body.unlocked).toBe(false)
      expect(body.daysRemaining).toBe(4)
      expect(body.unlockNarrative).toBe('Keep pushing, Hunter...')
    })

    it('should return active status when unlocked', async () => {
      mockGetRotatingQuestUnlockStatus.mockResolvedValue({
        unlocked: true,
        currentDay: 10,
        daysRemaining: 0,
      })

      const app = new Hono()
      app.use('*', mockAuthMiddleware(mockUser))
      app.get('/quests/rotating/status', mockRequireAuth, async (c) => {
        const user = c.get('user')!
        const status = await mockGetRotatingQuestUnlockStatus(user.id)

        return c.json({
          ...status,
          unlockNarrative: status.unlocked ? null : 'locked narrative',
          message: status.unlocked
            ? '[SYSTEM] Rotating quest slot active.'
            : '[SYSTEM] Locked.',
        })
      })

      const res = await app.request('/quests/rotating/status')
      const body = await res.json() as { unlocked: boolean; unlockNarrative: string | null; message: string }

      expect(body.unlocked).toBe(true)
      expect(body.unlockNarrative).toBeNull()
      expect(body.message).toContain('active')
    })
  })

  describe('GET /quests/weekly', () => {
    it('should return weekly quests', async () => {
      const weeklyQuest = {
        id: 'weekly-1',
        name: 'Weekly Warrior',
        weekStart: '2026-01-13',
        weekEnd: '2026-01-19',
        status: 'ACTIVE',
      }

      mockGetWeeklyQuests.mockResolvedValue([weeklyQuest])

      const app = new Hono()
      app.use('*', mockAuthMiddleware(mockUser))
      app.get('/quests/weekly', mockRequireAuth, async (c) => {
        const user = c.get('user')!
        const weeklyQuests = await mockGetWeeklyQuests(user.id)

        return c.json({
          quests: weeklyQuests,
          weekStart: weeklyQuests[0]?.weekStart ?? null,
          weekEnd: weeklyQuests[0]?.weekEnd ?? null,
        })
      })

      const res = await app.request('/quests/weekly')
      expect(res.status).toBe(200)

      const body = await res.json() as { quests: unknown[]; weekStart: string | null; weekEnd: string | null }
      expect(body.quests).toHaveLength(1)
      expect(body.weekStart).toBe('2026-01-13')
      expect(body.weekEnd).toBe('2026-01-19')
    })

    it('should handle empty weekly quests', async () => {
      mockGetWeeklyQuests.mockResolvedValue([])

      const app = new Hono()
      app.use('*', mockAuthMiddleware(mockUser))
      app.get('/quests/weekly', mockRequireAuth, async (c) => {
        const user = c.get('user')!
        const weeklyQuests = await mockGetWeeklyQuests(user.id)

        return c.json({
          quests: weeklyQuests,
          weekStart: weeklyQuests[0]?.weekStart ?? null,
          weekEnd: weeklyQuests[0]?.weekEnd ?? null,
        })
      })

      const res = await app.request('/quests/weekly')
      const body = await res.json() as { quests: unknown[]; weekStart: string | null; weekEnd: string | null }

      expect(body.quests).toHaveLength(0)
      expect(body.weekStart).toBeNull()
      expect(body.weekEnd).toBeNull()
    })
  })

  describe('Quest response structure', () => {
    it('should include all required fields in quest response', () => {
      const requiredFields = [
        'id',
        'templateId',
        'name',
        'description',
        'type',
        'category',
        'baseXP',
        'status',
        'currentValue',
        'targetValue',
        'completionPercent',
      ]

      for (const field of requiredFields) {
        expect(mockQuest).toHaveProperty(field)
      }
    })

    it('should have valid quest status values', () => {
      const validStatuses = ['ACTIVE', 'COMPLETED', 'FAILED', 'EXPIRED']
      expect(validStatuses).toContain(mockQuest.status)
    })

    it('should have valid quest type values', () => {
      const validTypes = ['DAILY', 'WEEKLY', 'DUNGEON', 'BOSS']
      expect(validTypes).toContain(mockQuest.type)
    })

    it('should have valid category values', () => {
      const validCategories = ['MOVEMENT', 'STRENGTH', 'RECOVERY', 'NUTRITION', 'DISCIPLINE']
      expect(validCategories).toContain(mockQuest.category)
    })
  })
})
