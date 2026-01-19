/**
 * useFoodRecognition - Hook for AI-powered food image analysis
 * Uploads photos to LogMeal API and manages detected foods state
 */

import { useState, useCallback } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import * as SecureStore from 'expo-secure-store'
import Constants from 'expo-constants'

const API_BASE_URL =
  Constants.expoConfig?.extra?.apiUrl ||
  process.env.EXPO_PUBLIC_API_URL ||
  'http://localhost:3000'

/**
 * Detected food item from AI analysis
 */
export interface DetectedFood {
  id: string
  name: string
  servingSize: string
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber?: number
  confidence: number
  portion: number // Multiplier (1 = standard serving)
  included: boolean // Whether to include in final log
}

/**
 * Analysis result from API
 */
export interface AnalysisResult {
  foods: DetectedFood[]
  totals: {
    calories: number
    protein: number
    carbs: number
    fat: number
    fiber: number
  }
  imageUrl?: string
}

/**
 * Recognition state machine
 */
export type RecognitionStatus =
  | 'idle'
  | 'capturing'
  | 'uploading'
  | 'analyzing'
  | 'complete'
  | 'error'
  | 'no_foods'

export interface RecognitionState {
  status: RecognitionStatus
  photoUri: string | null
  result: AnalysisResult | null
  error: string | null
}

/**
 * Hook for food image recognition
 */
export function useFoodRecognition() {
  const queryClient = useQueryClient()

  const [state, setState] = useState<RecognitionState>({
    status: 'idle',
    photoUri: null,
    result: null,
    error: null,
  })

  const [foods, setFoods] = useState<DetectedFood[]>([])

  /**
   * Upload and analyze a photo
   */
  const analyzePhoto = useCallback(async (
    uri: string,
    mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  ) => {
    setState(prev => ({ ...prev, status: 'uploading', photoUri: uri, error: null }))

    try {
      const token = await SecureStore.getItemAsync('authToken')

      // Create form data with the image
      const formData = new FormData()
      formData.append('image', {
        uri,
        type: 'image/jpeg',
        name: 'meal.jpg',
      } as unknown as Blob)

      if (mealType) {
        formData.append('mealType', mealType)
      }

      setState(prev => ({ ...prev, status: 'analyzing' }))

      const response = await fetch(`${API_BASE_URL}/api/nutrition/log-image`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to analyze image')
      }

      const data = await response.json()

      // Transform API response to our format with local state
      const detectedFoods: DetectedFood[] = (data.log?.foods ?? []).map(
        (food: {
          name: string
          servingSize?: string
          calories: number
          protein: number
          carbs: number
          fat: number
          fiber?: number
          confidence?: number
        }, index: number) => ({
          id: `food-${index}-${Date.now()}`,
          name: food.name,
          servingSize: food.servingSize ?? '1 serving',
          calories: food.calories,
          protein: food.protein,
          carbs: food.carbs,
          fat: food.fat,
          fiber: food.fiber,
          confidence: food.confidence ?? 0.85,
          portion: 1,
          included: true,
        })
      )

      if (detectedFoods.length === 0) {
        setState(prev => ({
          ...prev,
          status: 'no_foods',
          result: null,
        }))
        return null
      }

      const result: AnalysisResult = {
        foods: detectedFoods,
        totals: calculateTotals(detectedFoods),
      }

      setFoods(detectedFoods)
      setState(prev => ({
        ...prev,
        status: 'complete',
        result,
      }))

      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Analysis failed'
      setState(prev => ({
        ...prev,
        status: 'error',
        error: errorMessage,
      }))
      return null
    }
  }, [])

  /**
   * Update a food item's portion
   */
  const updateFoodPortion = useCallback((foodId: string, portion: number) => {
    setFoods(prev =>
      prev.map(food =>
        food.id === foodId ? { ...food, portion } : food
      )
    )
  }, [])

  /**
   * Toggle whether a food is included in the final log
   */
  const toggleFoodIncluded = useCallback((foodId: string) => {
    setFoods(prev =>
      prev.map(food =>
        food.id === foodId ? { ...food, included: !food.included } : food
      )
    )
  }, [])

  /**
   * Remove a food from the list entirely
   */
  const removeFood = useCallback((foodId: string) => {
    setFoods(prev => prev.filter(food => food.id !== foodId))
  }, [])

  /**
   * Add a manually entered food
   */
  const addManualFood = useCallback((food: Omit<DetectedFood, 'id' | 'portion' | 'included'>) => {
    const newFood: DetectedFood = {
      ...food,
      id: `manual-${Date.now()}`,
      portion: 1,
      included: true,
      confidence: 1.0, // Manual = 100% confident
    }
    setFoods(prev => [...prev, newFood])
  }, [])

  /**
   * Calculate totals for included foods with portion adjustments
   */
  const calculateTotals = useCallback((foodList: DetectedFood[] = foods) => {
    return foodList
      .filter(f => f.included)
      .reduce(
        (totals, food) => ({
          calories: totals.calories + Math.round(food.calories * food.portion),
          protein: totals.protein + food.protein * food.portion,
          carbs: totals.carbs + food.carbs * food.portion,
          fat: totals.fat + food.fat * food.portion,
          fiber: totals.fiber + (food.fiber ?? 0) * food.portion,
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
      )
  }, [foods])

  /**
   * Log the final meal with adjusted portions
   */
  const logMealMutation = useMutation({
    mutationFn: async ({
      mealType,
      date,
    }: {
      mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack'
      date?: string
    }) => {
      const token = await SecureStore.getItemAsync('authToken')
      const includedFoods = foods.filter(f => f.included)
      const totals = calculateTotals(includedFoods)

      const response = await fetch(`${API_BASE_URL}/api/nutrition/log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          manual: true,
          mealType,
          date,
          calories: totals.calories,
          protein: Math.round(totals.protein * 10) / 10,
          carbs: Math.round(totals.carbs * 10) / 10,
          fat: Math.round(totals.fat * 10) / 10,
          fiber: Math.round(totals.fiber * 10) / 10,
          notes: `AI-detected: ${includedFoods.map(f => f.name).join(', ')}`,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to log meal')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nutrition'] })
      queryClient.invalidateQueries({ queryKey: ['quests'] })
    },
  })

  /**
   * Reset to initial state
   */
  const reset = useCallback(() => {
    setState({
      status: 'idle',
      photoUri: null,
      result: null,
      error: null,
    })
    setFoods([])
  }, [])

  /**
   * Get totals for current food list
   */
  const currentTotals = calculateTotals()

  /**
   * Get included foods count
   */
  const includedCount = foods.filter(f => f.included).length

  return {
    // State
    status: state.status,
    photoUri: state.photoUri,
    error: state.error,
    foods,
    totals: currentTotals,
    includedCount,

    // Actions
    analyzePhoto,
    updateFoodPortion,
    toggleFoodIncluded,
    removeFood,
    addManualFood,
    reset,

    // Logging
    logMeal: logMealMutation.mutateAsync,
    isLogging: logMealMutation.isPending,
  }
}
