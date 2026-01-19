/**
 * useDashboard - Hook for dashboard data
 */

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { usePlayer } from './usePlayer'
import { useQuests } from './useQuests'
import { useHealthSync } from './useHealthSync'

export interface DashboardData {
  player: {
    name: string
    level: number
    totalXP: number
    currentStreak: number
    perfectStreak: number
    longestStreak: number
    stats: {
      STR: number
      AGI: number
      VIT: number
      DISC: number
    }
  }
  levelProgress: {
    currentLevel: number
    currentXP: number
    xpForNextLevel: number
    progressPercent: number
  }
  quests: {
    total: number
    completed: number
    xpEarned: number
    xpPotential: number
  }
  debuff: {
    active: boolean
    type?: string
    severity?: number
    message?: string
  }
  streak: {
    current: number
    isActive: boolean
    daysUntilBonus: number
  }
}

/**
 * Hook for all dashboard data
 */
export function useDashboard() {
  const player = usePlayer()
  const quests = useQuests()
  const queryClient = useQueryClient()
  const { syncIfNeeded } = useHealthSync()

  // Fetch level progress
  const levelProgress = useQuery({
    queryKey: ['player', 'level-progress'],
    queryFn: async () => {
      try {
        const response = await api.get<{
          currentLevel: number
          currentXP: number
          xpForNextLevel: number
          progressPercent: number
        }>('/api/player/level-progress')
        return response
      } catch {
        // Default if endpoint not available
        return {
          currentLevel: player.data?.level ?? 1,
          currentXP: player.data?.totalXP ?? 0,
          xpForNextLevel: 100,
          progressPercent: 0,
        }
      }
    },
    enabled: !!player.data,
    staleTime: 60 * 1000,
  })

  // Fetch debuff status
  const debuff = useQuery({
    queryKey: ['player', 'debuff'],
    queryFn: async () => {
      try {
        const response = await api.get<{
          active: boolean
          type?: string
          severity?: number
          message?: string
        }>('/api/player/debuff')
        return response
      } catch {
        return { active: false }
      }
    },
    staleTime: 60 * 1000,
  })

  // Calculate quest summary
  const questSummary = {
    total: quests.data?.length ?? 0,
    completed: quests.data?.filter(q => q.status === 'COMPLETED').length ?? 0,
    xpEarned: quests.data
      ?.filter(q => q.status === 'COMPLETED')
      .reduce((sum, q) => sum + (q.xpReward ?? 0), 0) ?? 0,
    xpPotential: quests.data?.reduce((sum, q) => sum + (q.xpReward ?? 0), 0) ?? 0,
  }

  // Calculate streak info
  const streakInfo = {
    current: player.data?.currentStreak ?? 0,
    isActive: (player.data?.currentStreak ?? 0) > 0,
    daysUntilBonus: 7 - ((player.data?.currentStreak ?? 0) % 7),
  }

  // Refresh all data
  const refresh = async () => {
    // Trigger health sync first
    syncIfNeeded()
    
    // Invalidate all queries
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['player'] }),
      queryClient.invalidateQueries({ queryKey: ['quests'] }),
    ])
  }

  return {
    data: player.data ? {
      player: {
        name: player.data.name ?? 'Hunter',
        level: player.data.level,
        totalXP: player.data.totalXP,
        currentStreak: player.data.currentStreak,
        perfectStreak: player.data.perfectStreak ?? 0,
        longestStreak: player.data.longestStreak ?? 0,
        stats: player.data.stats,
      },
      levelProgress: levelProgress.data ?? {
        currentLevel: player.data.level,
        currentXP: player.data.totalXP,
        xpForNextLevel: 100,
        progressPercent: 0,
      },
      quests: questSummary,
      debuff: debuff.data ?? { active: false },
      streak: streakInfo,
    } as DashboardData : null,
    
    isLoading: player.isLoading || quests.isLoading,
    isRefetching: player.isRefetching || quests.isRefetching,
    error: player.error || quests.error,
    refresh,
  }
}

/**
 * Get time-of-day based greeting
 */
export function getGreeting(): string {
  const hour = new Date().getHours()
  
  if (hour < 5) return 'Night Owl'
  if (hour < 12) return 'Good Morning'
  if (hour < 17) return 'Good Afternoon'
  if (hour < 21) return 'Good Evening'
  return 'Night Owl'
}

/**
 * Get motivational message based on state
 */
export function getMotivationalMessage(data: DashboardData | null): string {
  if (!data) return 'Loading...'
  
  const { quests, streak, debuff } = data
  
  // Priority: Debuff warning
  if (debuff.active) {
    return debuff.message ?? 'You have an active debuff. Complete quests to remove it.'
  }
  
  // All quests complete
  if (quests.total > 0 && quests.completed === quests.total) {
    return 'All quests complete! Rest well, Hunter.'
  }
  
  // Streak milestone approaching
  if (streak.current > 0 && streak.daysUntilBonus <= 2) {
    return `${streak.daysUntilBonus} day(s) until streak bonus!`
  }
  
  // Low completion
  const hour = new Date().getHours()
  if (hour > 18 && quests.completed < quests.total / 2) {
    return 'Evening approaches. Complete your quests.'
  }
  
  // Default
  return 'Focus on the mission ahead.'
}
