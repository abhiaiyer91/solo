/**
 * usePresets - Hook for managing quick-add food presets
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'

export interface FoodPreset {
  id: string
  name: string
  emoji: string
  calories: number
  protein: number
  carbs: number
  fat: number
  servingSize?: string
  barcode?: string
  sortOrder: number
  usageCount: number
}

export interface CreatePresetInput {
  name: string
  emoji?: string
  calories: number
  protein: number
  carbs: number
  fat: number
  servingSize?: string
  barcode?: string
}

// Default presets for new users
const DEFAULT_PRESETS: Omit<FoodPreset, 'id' | 'sortOrder' | 'usageCount'>[] = [
  { name: 'Protein Shake', emoji: '🥤', protein: 25, calories: 150, carbs: 5, fat: 2 },
  { name: 'Chicken Breast', emoji: '🍗', protein: 31, calories: 165, carbs: 0, fat: 4 },
  { name: 'Eggs (2)', emoji: '🥚', protein: 12, calories: 140, carbs: 1, fat: 10 },
  { name: 'Greek Yogurt', emoji: '🥛', protein: 17, calories: 100, carbs: 6, fat: 1 },
  { name: 'Almonds (1oz)', emoji: '🥜', protein: 6, calories: 164, carbs: 6, fat: 14 },
  { name: 'Rice (1 cup)', emoji: '🍚', protein: 4, calories: 205, carbs: 45, fat: 0 },
]

/**
 * Hook to manage food presets
 */
export function usePresets() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['nutrition', 'presets'],
    queryFn: async () => {
      try {
        const response = await api.get<{ presets: FoodPreset[] }>('/api/nutrition/presets')
        // If no presets, return defaults
        if (response.presets.length === 0) {
          return DEFAULT_PRESETS.map((p, i) => ({
            ...p,
            id: `default-${i}`,
            sortOrder: i,
            usageCount: 0,
          }))
        }
        return response.presets
      } catch {
        // Return defaults on error
        return DEFAULT_PRESETS.map((p, i) => ({
          ...p,
          id: `default-${i}`,
          sortOrder: i,
          usageCount: 0,
        }))
      }
    },
    staleTime: 60 * 1000,
  })

  const createPresetMutation = useMutation({
    mutationFn: (input: CreatePresetInput) =>
      api.post<{ preset: FoodPreset }>('/api/nutrition/presets', input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nutrition', 'presets'] })
    },
  })

  const updatePresetMutation = useMutation({
    mutationFn: ({ id, ...input }: Partial<FoodPreset> & { id: string }) =>
      api.put<{ preset: FoodPreset }>(`/api/nutrition/presets/${id}`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nutrition', 'presets'] })
    },
  })

  const deletePresetMutation = useMutation({
    mutationFn: (id: string) =>
      api.delete(`/api/nutrition/presets/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nutrition', 'presets'] })
    },
  })

  const incrementUsageMutation = useMutation({
    mutationFn: (id: string) =>
      api.post(`/api/nutrition/presets/${id}/use`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nutrition', 'presets'] })
    },
  })

  return {
    presets: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    
    createPreset: createPresetMutation.mutate,
    createPresetAsync: createPresetMutation.mutateAsync,
    isCreating: createPresetMutation.isPending,
    
    updatePreset: updatePresetMutation.mutate,
    isUpdating: updatePresetMutation.isPending,
    
    deletePreset: deletePresetMutation.mutate,
    isDeleting: deletePresetMutation.isPending,
    
    incrementUsage: incrementUsageMutation.mutate,
  }
}

/**
 * Sort presets by usage count (most used first)
 */
export function sortPresetsByUsage(presets: FoodPreset[]): FoodPreset[] {
  return [...presets].sort((a, b) => b.usageCount - a.usageCount)
}

/**
 * Sort presets by protein content (highest first)
 */
export function sortPresetsByProtein(presets: FoodPreset[]): FoodPreset[] {
  return [...presets].sort((a, b) => b.protein - a.protein)
}
