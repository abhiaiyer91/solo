/**
 * Open Food Facts API Client
 * Free, open barcode database for food products
 */

import { cache } from '../lib/cache'

const OFF_BASE_URL = 'https://world.openfoodfacts.org/api/v2'
const CACHE_PREFIX = 'off:'
const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours

export interface OFFProduct {
  product_name: string
  brands: string
  serving_size: string
  nutrition_grades: string
  nutriments: {
    'energy-kcal_100g'?: number
    'energy-kcal_serving'?: number
    proteins_100g?: number
    proteins_serving?: number
    carbohydrates_100g?: number
    carbohydrates_serving?: number
    fat_100g?: number
    fat_serving?: number
    fiber_100g?: number
    fiber_serving?: number
    sugars_100g?: number
    sodium_100g?: number
  }
  image_url?: string
  image_front_url?: string
  image_nutrition_url?: string
  categories?: string
  quantity?: string
}

export interface NormalizedProduct {
  barcode: string
  name: string
  brand: string
  servingSize: string
  quantity: string
  categories: string
  nutritionGrade: string
  imageUrl: string
  per100g: {
    calories: number
    protein: number
    carbs: number
    fat: number
    fiber: number
    sugar: number
    sodium: number
  }
  perServing: {
    calories: number | null
    protein: number | null
    carbs: number | null
    fat: number | null
    fiber: number | null
  } | null
  source: 'openfoodfacts'
}

/**
 * Look up a product by barcode
 */
export async function lookupBarcode(barcode: string): Promise<NormalizedProduct | null> {
  // Check cache first
  const cacheKey = `${CACHE_PREFIX}${barcode}`
  const cached = cache.get<NormalizedProduct>(cacheKey)
  if (cached) {
    return cached
  }

  try {
    const fields = [
      'product_name',
      'brands',
      'serving_size',
      'nutrition_grades',
      'nutriments',
      'image_url',
      'image_front_url',
      'categories',
      'quantity',
    ].join(',')

    const response = await fetch(
      `${OFF_BASE_URL}/product/${barcode}?fields=${fields}`,
      {
        headers: {
          'User-Agent': 'Journey Fitness App/1.0 (contact@journey.app)',
        },
      }
    )

    if (!response.ok) {
      console.warn(`[OFF] Failed to fetch barcode ${barcode}: ${response.status}`)
      return null
    }

    const json = await response.json()

    if (json.status !== 1 || !json.product) {
      console.warn(`[OFF] Product not found for barcode ${barcode}`)
      return null
    }

    const product = normalizeProduct(json.product as OFFProduct, barcode)

    // Cache the result
    cache.set(cacheKey, product, CACHE_TTL)

    return product
  } catch (error) {
    console.error(`[OFF] Error looking up barcode ${barcode}:`, error)
    return null
  }
}

/**
 * Normalize Open Food Facts response to our format
 */
function normalizeProduct(off: OFFProduct, barcode: string): NormalizedProduct {
  const n = off.nutriments || {}

  // Per 100g values (always available)
  const per100g = {
    calories: Math.round(n['energy-kcal_100g'] || 0),
    protein: round1(n.proteins_100g || 0),
    carbs: round1(n.carbohydrates_100g || 0),
    fat: round1(n.fat_100g || 0),
    fiber: round1(n.fiber_100g || 0),
    sugar: round1(n.sugars_100g || 0),
    sodium: round1(n.sodium_100g || 0),
  }

  // Per serving values (may not be available)
  let perServing: NormalizedProduct['perServing'] = null
  if (n['energy-kcal_serving'] !== undefined) {
    perServing = {
      calories: Math.round(n['energy-kcal_serving'] || 0),
      protein: round1(n.proteins_serving || 0),
      carbs: round1(n.carbohydrates_serving || 0),
      fat: round1(n.fat_serving || 0),
      fiber: round1(n.fiber_serving || 0),
    }
  }

  return {
    barcode,
    name: off.product_name || 'Unknown Product',
    brand: off.brands || '',
    servingSize: off.serving_size || '100g',
    quantity: off.quantity || '',
    categories: off.categories || '',
    nutritionGrade: off.nutrition_grades || '',
    imageUrl: off.image_front_url || off.image_url || '',
    per100g,
    perServing,
    source: 'openfoodfacts',
  }
}

/**
 * Search for products by name
 */
export async function searchProducts(
  query: string,
  page: number = 1,
  pageSize: number = 20
): Promise<{
  products: NormalizedProduct[]
  total: number
  page: number
  pageSize: number
}> {
  try {
    const response = await fetch(
      `${OFF_BASE_URL}/search?search_terms=${encodeURIComponent(query)}&page=${page}&page_size=${pageSize}&fields=code,product_name,brands,serving_size,nutrition_grades,nutriments,image_front_url`,
      {
        headers: {
          'User-Agent': 'Journey Fitness App/1.0 (contact@journey.app)',
        },
      }
    )

    if (!response.ok) {
      console.warn(`[OFF] Search failed: ${response.status}`)
      return { products: [], total: 0, page, pageSize }
    }

    const json = await response.json()
    const products = (json.products || []).map((p: OFFProduct & { code: string }) =>
      normalizeProduct(p, p.code)
    )

    return {
      products,
      total: json.count || 0,
      page,
      pageSize,
    }
  } catch (error) {
    console.error('[OFF] Search error:', error)
    return { products: [], total: 0, page, pageSize }
  }
}

/**
 * Round to 1 decimal place
 */
function round1(n: number): number {
  return Math.round(n * 10) / 10
}

/**
 * Calculate nutrition for a serving
 */
export function calculateServingNutrition(
  product: NormalizedProduct,
  grams: number
): {
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
} {
  const factor = grams / 100

  return {
    calories: Math.round(product.per100g.calories * factor),
    protein: round1(product.per100g.protein * factor),
    carbs: round1(product.per100g.carbs * factor),
    fat: round1(product.per100g.fat * factor),
    fiber: round1(product.per100g.fiber * factor),
  }
}
