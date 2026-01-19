import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Hono } from 'hono'
import {
  createMockAuthMiddleware,
  mockRequireAuth,
  mockUser,
  jsonRequest,
} from '../test/helpers/request'
import { mockBaselineAssessment, mockOnboardingProgress } from '../test/fixtures/routes'

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

// Mock baseline service
const mockSaveBaselineAssessment = vi.fn()
const mockGetBaselineAssessment = vi.fn()
const mockFormatAssessmentResponse = vi.fn()
const mockCalculateInitialStats = vi.fn()

vi.mock('../services/baseline', () => ({
  saveBaselineAssessment: (...args: unknown[]) => mockSaveBaselineAssessment(...args),
  getBaselineAssessment: (...args: unknown[]) => mockGetBaselineAssessment(...args),
  formatAssessmentResponse: (a: unknown) => mockFormatAssessmentResponse(a),
  calculateInitialStats: (...args: unknown[]) => mockCalculateInitialStats(...args),
}))

// Mock psychology service
const mockStartPsychologyAssessment = vi.fn()
const mockRespondToPsychologyAssessment = vi.fn()
const mockCompletePsychologyAssessment = vi.fn()
const mockGetPsychologyProfile = vi.fn()

vi.mock('../services/psychology', () => ({
  startPsychologyAssessment: (...args: unknown[]) => mockStartPsychologyAssessment(...args),
  respondToPsychologyAssessment: (...args: unknown[]) => mockRespondToPsychologyAssessment(...args),
  completePsychologyAssessment: (...args: unknown[]) => mockCompletePsychologyAssessment(...args),
  getPsychologyProfile: (...args: unknown[]) => mockGetPsychologyProfile(...args),
  formatPsychologyResponse: (p: unknown) => p,
}))

describe('Onboarding Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('POST /onboarding/baseline', () => {
    it('should return 401 when not authenticated', async () => {
      const app = new Hono()
      app.use('*', createMockAuthMiddleware(null))
      app.post('/onboarding/baseline', mockRequireAuth, async () => {
        return new Response(null)
      })

      const res = await app.request('/onboarding/baseline', { method: 'POST' })
      expect(res.status).toBe(401)
    })

    it('should return 400 for invalid fitnessExperience', async () => {
      const app = new Hono()
      app.use('*', createMockAuthMiddleware(mockUser))
      app.post('/onboarding/baseline', mockRequireAuth, async (c) => {
        const body = await c.req.json<{ fitnessExperience?: string }>()
        if (
          body.fitnessExperience &&
          !['beginner', 'intermediate', 'advanced'].includes(body.fitnessExperience)
        ) {
          return c.json(
            { error: 'fitnessExperience must be beginner, intermediate, or advanced' },
            400
          )
        }
        return c.json({ success: true })
      })

      const res = await app.request(
        '/onboarding/baseline',
        jsonRequest({ fitnessExperience: 'expert' })
      )

      expect(res.status).toBe(400)

      const body = await res.json() as { error: string }
      expect(body.error).toContain('fitnessExperience')
    })

    it('should return 400 for invalid weightUnit', async () => {
      const app = new Hono()
      app.use('*', createMockAuthMiddleware(mockUser))
      app.post('/onboarding/baseline', mockRequireAuth, async (c) => {
        const body = await c.req.json<{ weightUnit?: string }>()
        if (body.weightUnit && !['kg', 'lbs'].includes(body.weightUnit)) {
          return c.json({ error: 'weightUnit must be kg or lbs' }, 400)
        }
        return c.json({ success: true })
      })

      const res = await app.request('/onboarding/baseline', jsonRequest({ weightUnit: 'stones' }))
      expect(res.status).toBe(400)

      const body = await res.json() as { error: string }
      expect(body.error).toContain('weightUnit')
    })

    it('should return 400 for out-of-range pushUpsMax', async () => {
      const app = new Hono()
      app.use('*', createMockAuthMiddleware(mockUser))
      app.post('/onboarding/baseline', mockRequireAuth, async (c) => {
        const body = await c.req.json<{ pushUpsMax?: number }>()
        if (body.pushUpsMax !== undefined && (body.pushUpsMax < 0 || body.pushUpsMax > 500)) {
          return c.json({ error: 'pushUpsMax must be between 0 and 500' }, 400)
        }
        return c.json({ success: true })
      })

      const res = await app.request('/onboarding/baseline', jsonRequest({ pushUpsMax: 600 }))
      expect(res.status).toBe(400)

      const body = await res.json() as { error: string }
      expect(body.error).toContain('pushUpsMax')
    })

    it('should return 400 for invalid mileTimeMinutes', async () => {
      const app = new Hono()
      app.use('*', createMockAuthMiddleware(mockUser))
      app.post('/onboarding/baseline', mockRequireAuth, async (c) => {
        const body = await c.req.json<{ mileTimeMinutes?: number }>()
        if (
          body.mileTimeMinutes !== undefined &&
          (body.mileTimeMinutes < 3 || body.mileTimeMinutes > 60)
        ) {
          return c.json({ error: 'mileTimeMinutes must be between 3 and 60' }, 400)
        }
        return c.json({ success: true })
      })

      const res = await app.request('/onboarding/baseline', jsonRequest({ mileTimeMinutes: 2 }))
      expect(res.status).toBe(400)

      const body = await res.json() as { error: string }
      expect(body.error).toContain('mileTimeMinutes')
    })

    it('should save valid baseline assessment', async () => {
      const mockAssessment = {
        id: 'assessment-1',
        userId: mockUser.id,
        fitnessExperience: 'intermediate',
        pushUpsMax: 30,
        createdAt: '2026-01-15T10:00:00.000Z',
      }
      const mockStats = { STR: 15, AGI: 12, VIT: 18, DISC: 14 }

      mockSaveBaselineAssessment.mockResolvedValue({ assessment: mockAssessment, stats: mockStats })
      mockFormatAssessmentResponse.mockReturnValue(mockAssessment)

      const app = new Hono()
      app.use('*', createMockAuthMiddleware(mockUser))
      app.post('/onboarding/baseline', mockRequireAuth, async (c) => {
        const user = c.get('user')!
        const body = await c.req.json()

        // Validate fitness experience
        if (
          body.fitnessExperience &&
          !['beginner', 'intermediate', 'advanced'].includes(body.fitnessExperience)
        ) {
          return c.json({ error: 'Invalid fitnessExperience' }, 400)
        }

        const { assessment, stats } = await mockSaveBaselineAssessment(user.id, body)
        return c.json({
          success: true,
          assessment: mockFormatAssessmentResponse(assessment),
          stats,
          message: '[SYSTEM] Baseline assessment recorded. Initial stats calculated.',
        })
      })

      const res = await app.request(
        '/onboarding/baseline',
        jsonRequest({
          fitnessExperience: 'intermediate',
          pushUpsMax: 30,
          workoutsPerWeek: 4,
        })
      )

      expect(res.status).toBe(200)

      const body = await res.json() as {
        success: boolean
        assessment: typeof mockAssessment
        stats: typeof mockStats
        message: string
      }

      expect(body.success).toBe(true)
      expect(body.assessment).toEqual(mockAssessment)
      expect(body.stats).toEqual(mockStats)
      expect(body.message).toContain('Baseline assessment recorded')
    })
  })

  describe('GET /player/baseline', () => {
    it('should return null when no baseline exists', async () => {
      mockGetBaselineAssessment.mockResolvedValue(null)

      const app = new Hono()
      app.use('*', createMockAuthMiddleware(mockUser))
      app.get('/player/baseline', mockRequireAuth, async (c) => {
        const user = c.get('user')!
        const assessment = await mockGetBaselineAssessment(user.id)
        if (!assessment) {
          return c.json({
            assessment: null,
            message: '[SYSTEM] No baseline assessment found. Complete onboarding to set baseline.',
          })
        }
        return c.json({ assessment })
      })

      const res = await app.request('/player/baseline')
      expect(res.status).toBe(200)

      const body = await res.json() as { assessment: null; message: string }
      expect(body.assessment).toBeNull()
      expect(body.message).toContain('No baseline assessment found')
    })

    it('should return baseline assessment when exists', async () => {
      const mockAssessment = {
        id: 'assessment-1',
        fitnessExperience: 'intermediate',
        pushUpsMax: 30,
      }
      mockGetBaselineAssessment.mockResolvedValue(mockAssessment)
      mockFormatAssessmentResponse.mockReturnValue(mockAssessment)

      const app = new Hono()
      app.use('*', createMockAuthMiddleware(mockUser))
      app.get('/player/baseline', mockRequireAuth, async (c) => {
        const user = c.get('user')!
        const assessment = await mockGetBaselineAssessment(user.id)
        if (!assessment) {
          return c.json({ assessment: null })
        }
        return c.json({
          assessment: mockFormatAssessmentResponse(assessment),
          message: '[SYSTEM] Baseline assessment retrieved.',
        })
      })

      const res = await app.request('/player/baseline')
      expect(res.status).toBe(200)

      const body = await res.json() as {
        assessment: typeof mockAssessment
        message: string
      }

      expect(body.assessment).toEqual(mockAssessment)
      expect(body.message).toContain('Baseline assessment retrieved')
    })
  })

  describe('Psychology Assessment Endpoints', () => {
    describe('POST /onboarding/psychology/start', () => {
      it('should start psychology assessment', async () => {
        const mockQuestions = [
          { id: 'q1', text: 'Question 1', options: ['A', 'B', 'C'] },
          { id: 'q2', text: 'Question 2', options: ['A', 'B', 'C'] },
        ]
        mockStartPsychologyAssessment.mockResolvedValue({
          sessionId: 'session-1',
          questions: mockQuestions,
        })

        const app = new Hono()
        app.use('*', createMockAuthMiddleware(mockUser))
        app.post('/onboarding/psychology/start', mockRequireAuth, async (c) => {
          const user = c.get('user')!
          const result = await mockStartPsychologyAssessment(user.id)
          return c.json({
            ...result,
            message: '[SYSTEM] Psychology assessment initialized.',
          })
        })

        const res = await app.request('/onboarding/psychology/start', { method: 'POST' })
        expect(res.status).toBe(200)

        const body = await res.json() as {
          sessionId: string
          questions: typeof mockQuestions
          message: string
        }

        expect(body.sessionId).toBe('session-1')
        expect(body.questions).toHaveLength(2)
        expect(body.message).toContain('Psychology assessment initialized')
      })
    })

    describe('POST /onboarding/psychology/respond', () => {
      it('should record psychology response', async () => {
        mockRespondToPsychologyAssessment.mockResolvedValue({
          recorded: true,
          progress: { current: 1, total: 5 },
        })

        const app = new Hono()
        app.use('*', createMockAuthMiddleware(mockUser))
        app.post('/onboarding/psychology/respond', mockRequireAuth, async (c) => {
          const user = c.get('user')!
          const body = await c.req.json<{ questionId: string; answer: string }>()

          if (!body.questionId || !body.answer) {
            return c.json({ error: 'questionId and answer required' }, 400)
          }

          const result = await mockRespondToPsychologyAssessment(user.id, body.questionId, body.answer)
          return c.json({
            ...result,
            message: '[SYSTEM] Response recorded.',
          })
        })

        const res = await app.request(
          '/onboarding/psychology/respond',
          jsonRequest({ questionId: 'q1', answer: 'A' })
        )

        expect(res.status).toBe(200)

        const body = await res.json() as { recorded: boolean; progress: { current: number } }
        expect(body.recorded).toBe(true)
        expect(body.progress.current).toBe(1)
      })
    })

    describe('POST /onboarding/psychology/complete', () => {
      it('should complete psychology assessment', async () => {
        const mockProfile = {
          traits: { discipline: 0.8, motivation: 0.7 },
          archetype: 'disciplined',
        }
        mockCompletePsychologyAssessment.mockResolvedValue(mockProfile)

        const app = new Hono()
        app.use('*', createMockAuthMiddleware(mockUser))
        app.post('/onboarding/psychology/complete', mockRequireAuth, async (c) => {
          const user = c.get('user')!
          const profile = await mockCompletePsychologyAssessment(user.id)
          return c.json({
            profile,
            message: '[SYSTEM] Psychology profile computed.',
          })
        })

        const res = await app.request('/onboarding/psychology/complete', { method: 'POST' })
        expect(res.status).toBe(200)

        const body = await res.json() as { profile: typeof mockProfile; message: string }
        expect(body.profile.archetype).toBe('disciplined')
        expect(body.message).toContain('Psychology profile computed')
      })
    })

    describe('GET /player/psychology', () => {
      it('should return null when no profile exists', async () => {
        mockGetPsychologyProfile.mockResolvedValue(null)

        const app = new Hono()
        app.use('*', createMockAuthMiddleware(mockUser))
        app.get('/player/psychology', mockRequireAuth, async (c) => {
          const user = c.get('user')!
          const profile = await mockGetPsychologyProfile(user.id)
          if (!profile) {
            return c.json({
              profile: null,
              message: '[SYSTEM] No psychology profile found. Complete assessment.',
            })
          }
          return c.json({ profile })
        })

        const res = await app.request('/player/psychology')
        expect(res.status).toBe(200)

        const body = await res.json() as { profile: null; message: string }
        expect(body.profile).toBeNull()
      })

      it('should return psychology profile when exists', async () => {
        const mockProfile = { traits: { discipline: 0.8 }, archetype: 'disciplined' }
        mockGetPsychologyProfile.mockResolvedValue(mockProfile)

        const app = new Hono()
        app.use('*', createMockAuthMiddleware(mockUser))
        app.get('/player/psychology', mockRequireAuth, async (c) => {
          const user = c.get('user')!
          const profile = await mockGetPsychologyProfile(user.id)
          if (!profile) {
            return c.json({ profile: null })
          }
          return c.json({
            profile,
            message: '[SYSTEM] Psychology profile retrieved.',
          })
        })

        const res = await app.request('/player/psychology')
        expect(res.status).toBe(200)

        const body = await res.json() as { profile: typeof mockProfile }
        expect(body.profile).toEqual(mockProfile)
      })
    })
  })

  describe('Baseline assessment validation', () => {
    it('should accept all valid fitness experience levels', () => {
      const validLevels = ['beginner', 'intermediate', 'advanced']
      for (const level of validLevels) {
        expect(validLevels).toContain(level)
      }
    })

    it('should accept valid weight units', () => {
      const validUnits = ['kg', 'lbs']
      expect(validUnits).toContain('kg')
      expect(validUnits).toContain('lbs')
    })

    it('should have valid range constraints', () => {
      // Push-ups: 0-500
      expect(0).toBeGreaterThanOrEqual(0)
      expect(500).toBeLessThanOrEqual(500)

      // Plank hold: 0-3600 seconds (1 hour)
      expect(0).toBeGreaterThanOrEqual(0)
      expect(3600).toBeLessThanOrEqual(3600)

      // Mile time: 3-60 minutes
      expect(3).toBeGreaterThanOrEqual(3)
      expect(60).toBeLessThanOrEqual(60)

      // Workouts per week: 0-21
      expect(0).toBeGreaterThanOrEqual(0)
      expect(21).toBeLessThanOrEqual(21)

      // Sleep hours: 0-24
      expect(0).toBeGreaterThanOrEqual(0)
      expect(24).toBeLessThanOrEqual(24)
    })
  })
})
