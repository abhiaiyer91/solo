/**
 * useHydration - Hook for hydration tracking
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'

export interface DailyHydration {
  date: string
  glasses: number
  target: number
  progress: number
  goalMet: boolean
}

export interface HydrationHistory {
  days: DailyHydration[]
  averageGlasses: number
  streakDays: number
}

/**
 * Hook for today's hydration
 */
export function useHydration() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['hydration', 'today'],
    queryFn: async () => {
      return api.get<DailyHydration>('/api/hydration/today')
    },
    staleTime: 30 * 1000,
  })

  const addMutation = useMutation({
    mutationFn: async (glasses: number = 1) => {
      return api.post<DailyHydration>('/api/hydration/add', { glasses })
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['hydration', 'today'], data)
      queryClient.invalidateQueries({ queryKey: ['quests'] })
    },
  })

  const setMutation = useMutation({
    mutationFn: async (glasses: number) => {
      return api.post<DailyHydration>('/api/hydration/set', { glasses })
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['hydration', 'today'], data)
      queryClient.invalidateQueries({ queryKey: ['quests'] })
    },
  })

  return {
    hydration: query.data,
    isLoading: query.isLoading,
    error: query.error,
    
    addGlass: () => addMutation.mutate(1),
    addGlasses: (count: number) => addMutation.mutate(count),
    setGlasses: (count: number) => setMutation.mutate(count),
    
    isAdding: addMutation.isPending,
    isSetting: setMutation.isPending,
  }
}

/**
 * Hook for hydration history
 */
export function useHydrationHistory(days: number = 7) {
  return useQuery({
    queryKey: ['hydration', 'history', days],
    queryFn: async () => {
      return api.get<{ history: DailyHydration[] }>(`/api/hydration/history?days=${days}`)
    },
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Check if hydration quest is active today
 */
export function useHasHydrationQuest() {
  return useQuery({
    queryKey: ['hydration', 'active'],
    queryFn: async () => {
      return api.get<{ active: boolean }>('/api/hydration/active')
    },
    staleTime: 60 * 1000,
  })
}
