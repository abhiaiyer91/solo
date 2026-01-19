/**
 * Body Composition hooks for tracking weight and calories
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface BodyCompositionLog {
  date: string
  weight: number | null
  caloriesConsumed: number | null
  caloriesBurned: number | null
  netCalories: number | null
  bodyFatPercent: number | null
}

export interface BodyCompositionProgress {
  logs: BodyCompositionLog[]
  summary: {
    startWeight: number | null
    currentWeight: number | null
    weightChange: number | null
    totalDeficit: number
    projectedLoss: number
    trend: 'losing' | 'stable' | 'gaining'
    daysLogged: number
  }
}

export interface BodySettings {
  trackBodyComposition: boolean
  targetWeight?: number
  targetCalories?: number
}

export interface WeightHistoryPoint {
  date: string
  weight: number
}

/**
 * Fetch body composition settings
 */
async function fetchBodySettings(): Promise<{ trackBodyComposition: boolean }> {
  return api.get<{ trackBodyComposition: boolean }>('/body-composition/settings')
}

/**
 * Fetch body composition progress
 */
async function fetchProgress(days: number = 30): Promise<BodyCompositionProgress> {
  return api.get<BodyCompositionProgress>(`/body-composition/progress?days=${days}`)
}

/**
 * Fetch weight history
 */
async function fetchWeightHistory(days: number = 90): Promise<{ history: WeightHistoryPoint[] }> {
  return api.get<{ history: WeightHistoryPoint[] }>(`/body-composition/weight-history?days=${days}`)
}

/**
 * Fetch today's log
 */
async function fetchTodayLog(): Promise<{ log: BodyCompositionLog | null }> {
  return api.get<{ log: BodyCompositionLog | null }>('/body-composition/today')
}

/**
 * Hook to check if body tracking is enabled
 */
export function useBodySettings() {
  return useQuery({
    queryKey: ['bodyComposition', 'settings'],
    queryFn: fetchBodySettings,
    staleTime: 60 * 1000,
  })
}

/**
 * Hook to get body composition progress
 */
export function useBodyProgress(days: number = 30) {
  return useQuery({
    queryKey: ['bodyComposition', 'progress', days],
    queryFn: () => fetchProgress(days),
    staleTime: 60 * 1000,
  })
}

/**
 * Hook to get weight history for charting
 */
export function useWeightHistory(days: number = 90) {
  return useQuery({
    queryKey: ['bodyComposition', 'weightHistory', days],
    queryFn: () => fetchWeightHistory(days),
    staleTime: 60 * 1000,
  })
}

/**
 * Hook to get today's log
 */
export function useTodayLog() {
  return useQuery({
    queryKey: ['bodyComposition', 'today'],
    queryFn: fetchTodayLog,
    staleTime: 30 * 1000,
  })
}

/**
 * Hook to enable/disable body tracking
 */
export function useUpdateBodySettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (settings: BodySettings) => {
      return api.post<{ trackBodyComposition: boolean }>('/body-composition/settings', settings)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bodyComposition'] })
    },
  })
}

/**
 * Hook to log body composition
 */
export function useLogBodyComposition() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      date?: string
      weight?: number
      caloriesConsumed?: number
      caloriesBurned?: number
      bodyFatPercent?: number
      notes?: string
    }) => {
      return api.post<{ log: BodyCompositionLog }>('/body-composition', data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bodyComposition'] })
    },
  })
}

/**
 * Get trend indicator
 */
export function getTrendIndicator(trend: 'losing' | 'stable' | 'gaining'): {
  icon: string
  color: string
  label: string
} {
  switch (trend) {
    case 'losing':
      return { icon: '↓', color: 'text-green-400', label: 'Trending down' }
    case 'stable':
      return { icon: '→', color: 'text-blue-400', label: 'Stable' }
    case 'gaining':
      return { icon: '↑', color: 'text-red-400', label: 'Trending up' }
  }
}

/**
 * Format weight with unit
 */
export function formatWeight(kg: number, unit: 'kg' | 'lbs' = 'lbs'): string {
  if (unit === 'lbs') {
    return `${(kg * 2.205).toFixed(1)} lbs`
  }
  return `${kg.toFixed(1)} kg`
}
