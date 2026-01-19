/**
 * useNutrition - Hook for nutrition data and logging
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'

export interface MealLog {
  id: string
  date: string
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  foods: Array<{
    name: string
    servingSize: string
    calories: number
    protein: number
    carbs: number
    fat: number
  }>
  calories: number
  protein: number
  carbs: number
  fat: number
  createdAt: string
}

export interface DailyNutritionData {
  date: string
  meals: MealLog[]
  totals: {
    calories: number
    protein: number
    carbs: number
    fat: number
    fiber: number
  }
  targets: {
    calories: number | null
    protein: number | null
    carbs: number | null
    fat: number | null
  }
  progress: {
    proteinPercent: number
    proteinGoalMet: boolean
    calorieDeficitMet: boolean
  }
  mealCount: number
}

/**
 * Hook for today's nutrition data
 */
export function useNutrition() {
  return useQuery({
    queryKey: ['nutrition', 'today'],
    queryFn: async () => {
      const response = await api.get<{ 
        summary: DailyNutritionData | null
        meals: MealLog[]
      }>('/api/nutrition/today')
      
      // Calculate progress if we have summary
      const summary = response.summary
      const proteinTarget = summary?.targets?.protein ?? 150
      const currentProtein = summary?.totals?.protein ?? 0
      
      return {
        date: summary?.date ?? new Date().toISOString().split('T')[0],
        meals: response.meals ?? [],
        totals: summary?.totals ?? { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
        targets: summary?.targets ?? { calories: null, protein: 150, carbs: null, fat: null },
        progress: {
          proteinPercent: Math.round((currentProtein / proteinTarget) * 100),
          proteinGoalMet: currentProtein >= proteinTarget,
          calorieDeficitMet: false,
        },
        mealCount: response.meals?.length ?? 0,
      } as DailyNutritionData
    },
    staleTime: 30 * 1000,
  })
}

/**
 * Hook for nutrition history
 */
export function useNutritionHistory(days: number = 30) {
  return useQuery({
    queryKey: ['nutrition', 'history', days],
    queryFn: async () => {
      const response = await api.get<{
        days: Array<{
          date: string
          totalCalories: number
          totalProtein: number
          totalCarbs: number
          totalFat: number
          mealCount: number
        }>
        averages: {
          calories: number
          protein: number
          carbs: number
          fat: number
        }
      }>(`/api/nutrition/history?days=${days}`)
      return response
    },
    staleTime: 5 * 60 * 1000,
  })
}

export interface LogFoodInput {
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  date?: string
  foods?: Array<{
    name: string
    calories: number
    protein: number
    carbs: number
    fat: number
    servings?: number
    barcode?: string
  }>
  // For manual quick entry
  manual?: boolean
  calories?: number
  protein?: number
  carbs?: number
  fat?: number
  notes?: string
}

/**
 * Hook for logging food
 */
export function useLogFood() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: LogFoodInput) => {
      return api.post<{ success: boolean; log: MealLog }>('/api/nutrition/log', {
        manual: true,
        ...input,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nutrition'] })
      queryClient.invalidateQueries({ queryKey: ['quests'] })
    },
  })
}

/**
 * Hook for deleting a meal log
 */
export function useDeleteMeal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (mealId: string) => {
      return api.delete(`/api/nutrition/log/${mealId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nutrition'] })
    },
  })
}
