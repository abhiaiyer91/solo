/**
 * LogMeal API client for food image recognition
 * https://logmeal.es/api
 */

import type { DetectedFood, NutritionTotals } from '../db/schema/nutrition'

const LOGMEAL_API_URL = 'https://api.logmeal.es/v2'

/**
 * LogMeal API response types
 */
interface LogMealSegmentationResponse {
  imageId: number
  recognition_results: Array<{
    id: number
    name: string
    prob: number
  }>
}

interface LogMealNutritionResponse {
  nutritional_info: {
    calories: number
    totalNutrients: {
      PROCNT?: { quantity: number }
      CHOCDF?: { quantity: number }
      FAT?: { quantity: number }
      FIBTG?: { quantity: number }
    }
  }
}

/**
 * Analyze a food image using LogMeal API
 * Returns detected foods with nutritional information
 */
export async function analyzeFoodImage(
  imageBuffer: Buffer,
  _mimeType: string = 'image/jpeg'
): Promise<{
  foods: DetectedFood[]
  totals: NutritionTotals
  rawResponse: object
}> {
  const apiKey = process.env.LOGMEAL_API_KEY

  // If no API key, return mock data for development
  if (!apiKey) {
    return getMockAnalysis()
  }

  try {
    // Step 1: Send image for segmentation/recognition
    const formData = new FormData()
    const blob = new Blob([imageBuffer], { type: 'image/jpeg' })
    formData.append('image', blob, 'meal.jpg')

    const segmentResponse = await fetch(
      `${LOGMEAL_API_URL}/image/segmentation/complete`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        body: formData,
      }
    )

    if (!segmentResponse.ok) {
      throw new Error(`LogMeal segmentation failed: ${segmentResponse.status}`)
    }

    const segmentData = (await segmentResponse.json()) as LogMealSegmentationResponse

    // Step 2: Get nutritional info for detected foods
    const foods: DetectedFood[] = []
    let totals: NutritionTotals = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
    }

    for (const item of segmentData.recognition_results) {
      const nutritionResponse = await fetch(
        `${LOGMEAL_API_URL}/nutrition/info`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ imageId: segmentData.imageId }),
        }
      )

      if (nutritionResponse.ok) {
        const nutritionData = (await nutritionResponse.json()) as LogMealNutritionResponse
        const nutrients = nutritionData.nutritional_info.totalNutrients

        const food: DetectedFood = {
          name: item.name,
          servingSize: '1 serving',
          calories: Math.round(nutritionData.nutritional_info.calories),
          protein: nutrients.PROCNT?.quantity ?? 0,
          carbs: nutrients.CHOCDF?.quantity ?? 0,
          fat: nutrients.FAT?.quantity ?? 0,
          fiber: nutrients.FIBTG?.quantity,
          confidence: item.prob,
        }

        foods.push(food)
        totals.calories += food.calories
        totals.protein += food.protein
        totals.carbs += food.carbs
        totals.fat += food.fat
        totals.fiber += food.fiber ?? 0
      }
    }

    return {
      foods,
      totals,
      rawResponse: segmentData,
    }
  } catch (error) {
    console.error('LogMeal API error:', error)
    throw error
  }
}

/**
 * Mock analysis for development/testing
 */
function getMockAnalysis(): {
  foods: DetectedFood[]
  totals: NutritionTotals
  rawResponse: object
} {
  const foods: DetectedFood[] = [
    {
      name: 'Grilled Chicken Breast',
      servingSize: '1 piece (150g)',
      calories: 231,
      protein: 43.4,
      carbs: 0,
      fat: 5.0,
      fiber: 0,
      confidence: 0.92,
    },
    {
      name: 'Brown Rice',
      servingSize: '1 cup (195g)',
      calories: 216,
      protein: 5.0,
      carbs: 44.8,
      fat: 1.8,
      fiber: 3.5,
      confidence: 0.88,
    },
    {
      name: 'Steamed Broccoli',
      servingSize: '1 cup (91g)',
      calories: 55,
      protein: 3.7,
      carbs: 11.2,
      fat: 0.6,
      fiber: 5.1,
      confidence: 0.95,
    },
  ]

  const totals: NutritionTotals = {
    calories: foods.reduce((sum, f) => sum + f.calories, 0),
    protein: foods.reduce((sum, f) => sum + f.protein, 0),
    carbs: foods.reduce((sum, f) => sum + f.carbs, 0),
    fat: foods.reduce((sum, f) => sum + f.fat, 0),
    fiber: foods.reduce((sum, f) => sum + (f.fiber ?? 0), 0),
  }

  return {
    foods,
    totals,
    rawResponse: { mock: true, timestamp: new Date().toISOString() },
  }
}

/**
 * Validate image before sending to API
 */
export function validateFoodImage(
  buffer: Buffer,
  mimeType: string
): { valid: boolean; error?: string } {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp']

  if (!validTypes.includes(mimeType)) {
    return { valid: false, error: 'Invalid image type. Use JPEG, PNG, or WebP.' }
  }

  // Max 10MB
  if (buffer.length > 10 * 1024 * 1024) {
    return { valid: false, error: 'Image too large. Maximum 10MB.' }
  }

  // Min 10KB (likely too small to be useful)
  if (buffer.length < 10 * 1024) {
    return { valid: false, error: 'Image too small. Please use a higher quality image.' }
  }

  return { valid: true }
}
