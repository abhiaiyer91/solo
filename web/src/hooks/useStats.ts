/**
 * Stats hooks for fetching player stats with breakdowns
 */

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export type StatType = 'STR' | 'AGI' | 'VIT' | 'DISC'

export interface StatBenchmark {
  value: number
  label: string
  realWorldEquivalent: string
  description?: string
}

export interface StatBreakdown {
  stat: StatType
  value: number
  breakdown: {
    baseline: number
    activity: number
    streak: number
  }
  benchmark: {
    current: StatBenchmark
    next: StatBenchmark | null
    progressToNext: number
  }
  howToImprove: string[]
}

export interface AllStatsResponse {
  STR: number
  AGI: number
  VIT: number
  DISC: number
  lastUpdated: string
}

export interface StatMilestone {
  stat: StatType
  current: StatBenchmark
  next: StatBenchmark | null
  progressToNext: number
}

/**
 * Fetch all stats
 */
async function fetchAllStats(): Promise<AllStatsResponse> {
  return api.get<AllStatsResponse>('/stats')
}

/**
 * Fetch stat breakdown for a specific stat
 */
async function fetchStatBreakdown(stat: StatType): Promise<StatBreakdown> {
  return api.get<StatBreakdown>(`/stats/breakdown?stat=${stat}`)
}

/**
 * Fetch milestones for all stats
 */
async function fetchMilestones(): Promise<{ milestones: StatMilestone[] }> {
  return api.get<{ milestones: StatMilestone[] }>('/stats/milestones')
}

/**
 * Hook to get all stats
 */
export function useAllStats() {
  return useQuery({
    queryKey: ['stats', 'all'],
    queryFn: fetchAllStats,
    staleTime: 30 * 1000,
  })
}

/**
 * Hook to get stat breakdown for a specific stat
 */
export function useStatBreakdown(stat: StatType) {
  return useQuery({
    queryKey: ['stats', 'breakdown', stat],
    queryFn: () => fetchStatBreakdown(stat),
    staleTime: 30 * 1000,
  })
}

/**
 * Hook to get all stat breakdowns
 */
export function useAllStatBreakdowns() {
  const stats: StatType[] = ['STR', 'AGI', 'VIT', 'DISC']
  
  // Fetch all breakdowns in parallel
  const results = stats.map(stat => 
    useQuery({
      queryKey: ['stats', 'breakdown', stat],
      queryFn: () => fetchStatBreakdown(stat),
      staleTime: 30 * 1000,
    })
  )
  
  const isLoading = results.some(r => r.isLoading)
  const data = isLoading ? undefined : {
    STR: results[0]?.data,
    AGI: results[1]?.data,
    VIT: results[2]?.data,
    DISC: results[3]?.data,
  }
  
  return {
    isLoading,
    data,
    refetch: () => results.forEach(r => r.refetch()),
  }
}

/**
 * Hook to get milestones for all stats
 */
export function useMilestones() {
  return useQuery({
    queryKey: ['stats', 'milestones'],
    queryFn: fetchMilestones,
    staleTime: 30 * 1000,
  })
}

/**
 * Get stat color based on stat type
 */
export function getStatColor(stat: StatType): string {
  switch (stat) {
    case 'STR': return 'text-red-400'
    case 'AGI': return 'text-green-400'
    case 'VIT': return 'text-blue-400'
    case 'DISC': return 'text-purple-400'
  }
}

/**
 * Get stat background color
 */
export function getStatBgColor(stat: StatType): string {
  switch (stat) {
    case 'STR': return 'bg-red-500/10'
    case 'AGI': return 'bg-green-500/10'
    case 'VIT': return 'bg-blue-500/10'
    case 'DISC': return 'bg-purple-500/10'
  }
}

/**
 * Get stat border color
 */
export function getStatBorderColor(stat: StatType): string {
  switch (stat) {
    case 'STR': return 'border-red-500/30'
    case 'AGI': return 'border-green-500/30'
    case 'VIT': return 'border-blue-500/30'
    case 'DISC': return 'border-purple-500/30'
  }
}

/**
 * Get stat icon
 */
export function getStatIcon(stat: StatType): string {
  switch (stat) {
    case 'STR': return '💪'
    case 'AGI': return '🏃'
    case 'VIT': return '❤️'
    case 'DISC': return '🎯'
  }
}
