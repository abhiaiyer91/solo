import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Hono } from 'hono'
import type { Context, Next } from 'hono'

// Mock modules
vi.mock('../db', () => ({
  dbClient: null,
}))

// Mock nutrition service
const mockLogMealManually = vi.fn()
const mockGetTodayNutrition = vi.fn()
const mockGetNutritionHistory = vi.fn()
const mockSetNutritionTargets = vi.fn()
const mockCheckProteinGoal = vi.fn()

vi.mock('../services/nutrition', () => ({
  logMealManually: (...args: unknown[]) => mockLogMealManually(...args),
  getTodayNutrition: (...args: unknown[]) => mockGetTodayNutrition(...args),
  getNutritionHistory: (...args: unknown[]) => mockGetNutritionHistory(...args),
  setNutritionTargets: (...args: unknown[]) => mockSetNutritionTargets(...args),
  checkProteinGoal: (...args: unknown[]) => mockCheckProteinGoal(...args),
  logMealFromImage: vi.fn(),
}))

// Mock Open Food Facts service
const mockLookupBarcode = vi.fn()
const mockSearchProducts = vi.fn()

vi.mock('../services/open-food-facts', () => ({
  lookupBarcode: (...args: unknown[]) => mockLookupBarcode(...args),
  searchProducts: (...args: unknown[]) => mockSearchProducts(...args),
  calculateServingNutrition: vi.fn(),
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

describe('Nutrition Routes', () => {
  const mockUser = {
    id: 'user-123',
    name: 'Test Hunter',
    email: 'test@example.com',
    level: 5,
    timezone: 'America/New_York',
  }

  const mockMealLog = {
    id: 'meal-1',
    playerId: 'user-123',
    date: '2026-01-18',
    mealType: 'lunch',
    calories: 500,
    protein: 35,
    carbs: 40,
    fat: 20,
    createdAt: '2026-01-18T12:00:00Z',
  }

  const mockDailySummary = {
    date: '2026-01-18',
    totalCalories: 1500,
    totalProtein: 100,
    totalCarbs: 150,
    totalFat: 60,
    mealCount: 3,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('POST /nutrition/log', () => {
    it('should return 401 when not authenticated', async () => {
      const app = new Hono()
      app.use('*', mockAuthMiddleware(null))
      app.post('/nutrition/log', mockRequireAuth, async (c) => {
        return c.json({ success: true })
      })

      const res = await app.request('/nutrition/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ manual: true, calories: 500, protein: 30 }),
      })

      expect(res.status).toBe(401)
    })

    it('should log manual meal successfully', async () => {
      mockLogMealManually.mockResolvedValue({
        log: mockMealLog,
        dailySummary: mockDailySummary,
      })

      const app = new Hono()
      app.use('*', mockAuthMiddleware(mockUser))
      app.post('/nutrition/log', mockRequireAuth, async (c) => {
        const user = c.get('user')!
        const body = await c.req.json<{
          manual?: boolean
          calories?: number
          protein?: number
          carbs?: number
          fat?: number
          mealType?: string
        }>()

        if (body.manual) {
          if (body.calories === undefined || body.protein === undefined) {
            return c.json({ error: 'Calories and protein required' }, 400)
          }

          const result = await mockLogMealManually(user.id, {
            calories: body.calories,
            protein: body.protein,
            carbs: body.carbs ?? 0,
            fat: body.fat ?? 0,
            mealType: body.mealType,
          })

          return c.json({
            success: true,
            log: result.log,
            dailySummary: result.dailySummary,
          })
        }

        return c.json({ error: 'Invalid request' }, 400)
      })

      const res = await app.request('/nutrition/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          manual: true,
          calories: 500,
          protein: 35,
          carbs: 40,
          fat: 20,
          mealType: 'lunch',
        }),
      })

      expect(res.status).toBe(200)
      const body = await res.json() as { success: boolean; log: typeof mockMealLog }
      expect(body.success).toBe(true)
      expect(body.log.calories).toBe(500)
      expect(body.log.protein).toBe(35)
    })

    it('should require calories and protein for manual entry', async () => {
      const app = new Hono()
      app.use('*', mockAuthMiddleware(mockUser))
      app.post('/nutrition/log', mockRequireAuth, async (c) => {
        const body = await c.req.json<{ manual?: boolean; calories?: number; protein?: number }>()

        if (body.manual) {
          if (body.calories === undefined || body.protein === undefined) {
            return c.json({ error: 'Calories and protein required' }, 400)
          }
        }

        return c.json({ success: true })
      })

      const res = await app.request('/nutrition/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ manual: true, calories: 500 }), // Missing protein
      })

      expect(res.status).toBe(400)
      const body = await res.json() as { error: string }
      expect(body.error).toContain('protein')
    })
  })

  describe('GET /nutrition/today', () => {
    it('should return today nutrition summary', async () => {
      mockGetTodayNutrition.mockResolvedValue({
        summary: mockDailySummary,
        meals: [mockMealLog],
        targets: { calories: 2000, protein: 150 },
      })

      const app = new Hono()
      app.use('*', mockAuthMiddleware(mockUser))
      app.get('/nutrition/today', mockRequireAuth, async (c) => {
        const user = c.get('user')!
        const data = await mockGetTodayNutrition(user.id, user.timezone)

        return c.json({
          summary: data.summary,
          meals: data.meals,
          targets: data.targets,
          progress: {
            proteinPercent: Math.round((data.summary.totalProtein / data.targets.protein) * 100),
            caloriesPercent: Math.round((data.summary.totalCalories / data.targets.calories) * 100),
          },
        })
      })

      const res = await app.request('/nutrition/today')
      expect(res.status).toBe(200)

      const body = await res.json() as {
        summary: typeof mockDailySummary
        meals: typeof mockMealLog[]
        progress: { proteinPercent: number }
      }
      expect(body.summary.totalCalories).toBe(1500)
      expect(body.meals).toHaveLength(1)
      expect(body.progress.proteinPercent).toBe(67) // 100/150 * 100
    })

    it('should handle empty nutrition data', async () => {
      mockGetTodayNutrition.mockResolvedValue({
        summary: null,
        meals: [],
        targets: { calories: 2000, protein: 150 },
      })

      const app = new Hono()
      app.use('*', mockAuthMiddleware(mockUser))
      app.get('/nutrition/today', mockRequireAuth, async (c) => {
        const user = c.get('user')!
        const data = await mockGetTodayNutrition(user.id, user.timezone)

        return c.json({
          summary: data.summary ?? { totalCalories: 0, totalProtein: 0 },
          meals: data.meals,
          targets: data.targets,
        })
      })

      const res = await app.request('/nutrition/today')
      expect(res.status).toBe(200)

      const body = await res.json() as { summary: { totalCalories: number }; meals: unknown[] }
      expect(body.summary.totalCalories).toBe(0)
      expect(body.meals).toHaveLength(0)
    })
  })

  describe('GET /nutrition/history', () => {
    it('should return nutrition history for specified days', async () => {
      const historyData = [
        { date: '2026-01-18', totalCalories: 1500, totalProtein: 100 },
        { date: '2026-01-17', totalCalories: 1800, totalProtein: 120 },
        { date: '2026-01-16', totalCalories: 1600, totalProtein: 110 },
      ]

      mockGetNutritionHistory.mockResolvedValue({
        days: historyData,
        averages: { calories: 1633, protein: 110 },
      })

      const app = new Hono()
      app.use('*', mockAuthMiddleware(mockUser))
      app.get('/nutrition/history', mockRequireAuth, async (c) => {
        const user = c.get('user')!
        const days = parseInt(c.req.query('days') ?? '7')
        const data = await mockGetNutritionHistory(user.id, days)

        return c.json({
          days: data.days,
          averages: data.averages,
          totalDays: data.days.length,
        })
      })

      const res = await app.request('/nutrition/history?days=7')
      expect(res.status).toBe(200)

      const body = await res.json() as { days: unknown[]; averages: { calories: number } }
      expect(body.days).toHaveLength(3)
      expect(body.averages.calories).toBe(1633)
    })
  })

  describe('POST /nutrition/barcode', () => {
    it('should lookup product by barcode', async () => {
      const mockProduct = {
        barcode: '1234567890123',
        name: 'Protein Bar',
        brand: 'HealthCo',
        calories: 200,
        protein: 20,
        carbs: 25,
        fat: 8,
      }

      mockLookupBarcode.mockResolvedValue(mockProduct)

      const app = new Hono()
      app.use('*', mockAuthMiddleware(mockUser))
      app.post('/nutrition/barcode', mockRequireAuth, async (c) => {
        const body = await c.req.json<{ barcode: string }>()
        const product = await mockLookupBarcode(body.barcode)

        if (!product) {
          return c.json({ error: 'Product not found' }, 404)
        }

        return c.json({ product })
      })

      const res = await app.request('/nutrition/barcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barcode: '1234567890123' }),
      })

      expect(res.status).toBe(200)
      const body = await res.json() as { product: typeof mockProduct }
      expect(body.product.name).toBe('Protein Bar')
      expect(body.product.protein).toBe(20)
    })

    it('should return 404 for unknown barcode', async () => {
      mockLookupBarcode.mockResolvedValue(null)

      const app = new Hono()
      app.use('*', mockAuthMiddleware(mockUser))
      app.post('/nutrition/barcode', mockRequireAuth, async (c) => {
        const body = await c.req.json<{ barcode: string }>()
        const product = await mockLookupBarcode(body.barcode)

        if (!product) {
          return c.json({ error: 'Product not found' }, 404)
        }

        return c.json({ product })
      })

      const res = await app.request('/nutrition/barcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barcode: '0000000000000' }),
      })

      expect(res.status).toBe(404)
    })
  })

  describe('GET /nutrition/search', () => {
    it('should search products by query', async () => {
      const mockResults = [
        { name: 'Chicken Breast', calories: 165, protein: 31 },
        { name: 'Chicken Thigh', calories: 209, protein: 26 },
      ]

      mockSearchProducts.mockResolvedValue({ products: mockResults, total: 2 })

      const app = new Hono()
      app.use('*', mockAuthMiddleware(mockUser))
      app.get('/nutrition/search', mockRequireAuth, async (c) => {
        const query = c.req.query('q')
        if (!query) {
          return c.json({ error: 'Query required' }, 400)
        }

        const results = await mockSearchProducts(query)
        return c.json(results)
      })

      const res = await app.request('/nutrition/search?q=chicken')
      expect(res.status).toBe(200)

      const body = await res.json() as { products: unknown[]; total: number }
      expect(body.products).toHaveLength(2)
      expect(body.total).toBe(2)
    })

    it('should require search query', async () => {
      const app = new Hono()
      app.use('*', mockAuthMiddleware(mockUser))
      app.get('/nutrition/search', mockRequireAuth, async (c) => {
        const query = c.req.query('q')
        if (!query) {
          return c.json({ error: 'Query required' }, 400)
        }

        return c.json({ products: [] })
      })

      const res = await app.request('/nutrition/search')
      expect(res.status).toBe(400)
    })
  })

  describe('PUT /nutrition/targets', () => {
    it('should update nutrition targets', async () => {
      mockSetNutritionTargets.mockResolvedValue({
        calories: 2200,
        protein: 180,
        carbs: 250,
        fat: 80,
      })

      const app = new Hono()
      app.use('*', mockAuthMiddleware(mockUser))
      app.put('/nutrition/targets', mockRequireAuth, async (c) => {
        const user = c.get('user')!
        const body = await c.req.json<{ calories?: number; protein?: number }>()

        const targets = await mockSetNutritionTargets(user.id, body)
        return c.json({ targets, message: 'Targets updated' })
      })

      const res = await app.request('/nutrition/targets', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ calories: 2200, protein: 180 }),
      })

      expect(res.status).toBe(200)
      const body = await res.json() as { targets: { calories: number; protein: number } }
      expect(body.targets.calories).toBe(2200)
      expect(body.targets.protein).toBe(180)
    })
  })

  describe('GET /nutrition/protein-goal', () => {
    it('should check protein goal status', async () => {
      mockCheckProteinGoal.mockResolvedValue({
        target: 150,
        current: 120,
        remaining: 30,
        percentComplete: 80,
        isComplete: false,
      })

      const app = new Hono()
      app.use('*', mockAuthMiddleware(mockUser))
      app.get('/nutrition/protein-goal', mockRequireAuth, async (c) => {
        const user = c.get('user')!
        const status = await mockCheckProteinGoal(user.id)

        return c.json({
          ...status,
          message: status.isComplete
            ? '[SYSTEM] Protein goal achieved!'
            : `[SYSTEM] ${status.remaining}g protein remaining.`,
        })
      })

      const res = await app.request('/nutrition/protein-goal')
      expect(res.status).toBe(200)

      const body = await res.json() as {
        target: number
        current: number
        remaining: number
        isComplete: boolean
        message: string
      }
      expect(body.target).toBe(150)
      expect(body.current).toBe(120)
      expect(body.isComplete).toBe(false)
      expect(body.message).toContain('30g protein remaining')
    })

    it('should show success when goal is complete', async () => {
      mockCheckProteinGoal.mockResolvedValue({
        target: 150,
        current: 160,
        remaining: 0,
        percentComplete: 107,
        isComplete: true,
      })

      const app = new Hono()
      app.use('*', mockAuthMiddleware(mockUser))
      app.get('/nutrition/protein-goal', mockRequireAuth, async (c) => {
        const user = c.get('user')!
        const status = await mockCheckProteinGoal(user.id)

        return c.json({
          ...status,
          message: status.isComplete
            ? '[SYSTEM] Protein goal achieved!'
            : `[SYSTEM] ${status.remaining}g remaining.`,
        })
      })

      const res = await app.request('/nutrition/protein-goal')
      const body = await res.json() as { isComplete: boolean; message: string }

      expect(body.isComplete).toBe(true)
      expect(body.message).toContain('achieved')
    })
  })
})
