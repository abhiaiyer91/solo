/**
 * Nutrition API routes
 */

import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import {
  logMealFromImage,
  logMealManually,
  getTodayNutrition,
  getNutritionHistory,
  setNutritionTargets,
  checkProteinGoal,
} from '../services/nutrition'
import { lookupBarcode, searchProducts, calculateServingNutrition } from '../services/open-food-facts'

const nutrition = new Hono()

/**
 * POST /nutrition/log - Log a meal (image or manual)
 */
nutrition.post(
  '/nutrition/log',
  zValidator(
    'json',
    z.object({
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
      mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']).optional(),
      // For manual entry
      manual: z.boolean().optional(),
      calories: z.number().min(0).optional(),
      protein: z.number().min(0).optional(),
      carbs: z.number().min(0).optional(),
      fat: z.number().min(0).optional(),
      fiber: z.number().min(0).optional(),
      notes: z.string().max(500).optional(),
    })
  ),
  async (c) => {
    const user = c.get('user')
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const body = c.req.valid('json')

    try {
      // Manual entry
      if (body.manual) {
        if (body.calories === undefined || body.protein === undefined) {
          return c.json({ error: 'Calories and protein required for manual entry' }, 400)
        }

        const result = await logMealManually(user.id, {
          date: body.date,
          mealType: body.mealType,
          calories: body.calories,
          protein: body.protein,
          carbs: body.carbs ?? 0,
          fat: body.fat ?? 0,
          fiber: body.fiber,
          notes: body.notes,
        })

        return c.json({
          success: true,
          log: result.log,
          dailySummary: result.dailySummary,
        })
      }

      // Image analysis would require multipart/form-data handling
      // For now, return guidance
      return c.json({
        error: 'Image upload requires multipart/form-data. Use POST /nutrition/log-image',
      }, 400)
    } catch (error) {
      console.error('Meal logging error:', error)
      return c.json({ error: 'Failed to log meal' }, 500)
    }
  }
)

/**
 * POST /nutrition/log-image - Log a meal from an image
 * Expects multipart/form-data with 'image' file
 */
nutrition.post('/nutrition/log-image', async (c) => {
  const user = c.get('user')
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  try {
    const formData = await c.req.formData()
    const image = formData.get('image') as File | null
    const mealType = formData.get('mealType') as string | null
    const date = formData.get('date') as string | null

    if (!image) {
      return c.json({ error: 'No image provided' }, 400)
    }

    const buffer = Buffer.from(await image.arrayBuffer())
    const mimeType = image.type

    const result = await logMealFromImage(user.id, buffer, mimeType, {
      date: date ?? undefined,
      mealType: mealType as 'breakfast' | 'lunch' | 'dinner' | 'snack' | undefined,
    })

    return c.json({
      success: true,
      log: result.log,
      dailySummary: result.dailySummary,
    })
  } catch (error) {
    console.error('Image logging error:', error)
    return c.json({
      error: error instanceof Error ? error.message : 'Failed to analyze image',
    }, 500)
  }
})

/**
 * GET /nutrition/today - Get today's nutrition summary
 */
nutrition.get('/nutrition/today', async (c) => {
  const user = c.get('user')
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  try {
    const result = await getTodayNutrition(user.id)
    return c.json(result)
  } catch (error) {
    console.error('Error fetching today nutrition:', error)
    return c.json({ error: 'Failed to fetch nutrition data' }, 500)
  }
})

/**
 * GET /nutrition/history - Get nutrition history
 */
nutrition.get(
  '/nutrition/history',
  zValidator('query', z.object({
    days: z.coerce.number().min(1).max(365).default(30),
  })),
  async (c) => {
    const user = c.get('user')
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const { days } = c.req.valid('query')

    try {
      const result = await getNutritionHistory(user.id, days)
      return c.json(result)
    } catch (error) {
      console.error('Error fetching nutrition history:', error)
      return c.json({ error: 'Failed to fetch nutrition history' }, 500)
    }
  }
)

/**
 * POST /nutrition/targets - Set nutrition targets
 */
nutrition.post(
  '/nutrition/targets',
  zValidator(
    'json',
    z.object({
      calories: z.number().min(0).max(10000).optional(),
      protein: z.number().min(0).max(500).optional(),
      carbs: z.number().min(0).max(1000).optional(),
      fat: z.number().min(0).max(500).optional(),
    })
  ),
  async (c) => {
    const user = c.get('user')
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const targets = c.req.valid('json')

    try {
      const result = await setNutritionTargets(user.id, targets)
      return c.json({ success: true, targets: result })
    } catch (error) {
      console.error('Error setting targets:', error)
      return c.json({ error: 'Failed to set targets' }, 500)
    }
  }
)

/**
 * GET /nutrition/protein-check - Check protein goal (for quest evaluation)
 */
nutrition.get(
  '/nutrition/protein-check',
  zValidator('query', z.object({
    target: z.coerce.number().min(1).max(500),
  })),
  async (c) => {
    const user = c.get('user')
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const { target } = c.req.valid('query')

    try {
      const result = await checkProteinGoal(user.id, target)
      return c.json(result)
    } catch (error) {
      console.error('Error checking protein goal:', error)
      return c.json({ error: 'Failed to check protein goal' }, 500)
    }
  }
)

/**
 * GET /nutrition/barcode/:code - Look up a product by barcode
 */
nutrition.get('/nutrition/barcode/:code', async (c) => {
  const user = c.get('user')
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const barcode = c.req.param('code')

  if (!barcode || barcode.length < 8 || barcode.length > 14) {
    return c.json({ error: 'Invalid barcode format' }, 400)
  }

  try {
    const product = await lookupBarcode(barcode)

    if (!product) {
      return c.json({
        found: false,
        barcode,
        message: 'Product not found in Open Food Facts database',
      }, 404)
    }

    return c.json({
      found: true,
      product,
    })
  } catch (error) {
    console.error('Barcode lookup error:', error)
    return c.json({ error: 'Failed to lookup barcode' }, 500)
  }
})

/**
 * GET /nutrition/search - Search for products by name
 */
nutrition.get(
  '/nutrition/search',
  zValidator('query', z.object({
    q: z.string().min(2).max(100),
    page: z.coerce.number().min(1).max(100).default(1),
    pageSize: z.coerce.number().min(1).max(50).default(20),
  })),
  async (c) => {
    const user = c.get('user')
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const { q, page, pageSize } = c.req.valid('query')

    try {
      const results = await searchProducts(q, page, pageSize)
      return c.json(results)
    } catch (error) {
      console.error('Product search error:', error)
      return c.json({ error: 'Failed to search products' }, 500)
    }
  }
)

/**
 * POST /nutrition/calculate - Calculate nutrition for a serving
 */
nutrition.post(
  '/nutrition/calculate',
  zValidator(
    'json',
    z.object({
      barcode: z.string(),
      grams: z.number().min(1).max(5000),
    })
  ),
  async (c) => {
    const user = c.get('user')
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const { barcode, grams } = c.req.valid('json')

    try {
      const product = await lookupBarcode(barcode)

      if (!product) {
        return c.json({ error: 'Product not found' }, 404)
      }

      const nutrition = calculateServingNutrition(product, grams)

      return c.json({
        product: {
          name: product.name,
          brand: product.brand,
          barcode: product.barcode,
        },
        serving: {
          grams,
          ...nutrition,
        },
      })
    } catch (error) {
      console.error('Nutrition calculation error:', error)
      return c.json({ error: 'Failed to calculate nutrition' }, 500)
    }
  }
)

export { nutrition as nutritionRoutes }
