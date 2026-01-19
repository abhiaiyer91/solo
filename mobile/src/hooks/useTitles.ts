/**
 * useTitles - Mobile hook for title collection
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { Alert } from 'react-native'

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

export type TitleRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
export type TitleCategory = 'streak' | 'boss' | 'dungeon' | 'seasonal' | 'achievement' | 'hard_mode'

export interface Title {
  id: string
  name: string
  description: string
  category: TitleCategory
  rarity: TitleRarity
  requirement: string
  passiveEffect?: string
  passiveValue?: number
  isEarned: boolean
  earnedAt?: string
  isActive: boolean
  isSeasonExclusive?: boolean
  seasonId?: string
}

export interface TitlesResponse {
  titles: Title[]
  activeTitle: Title | null
  totalEarned: number
  totalAvailable: number
}

// ═══════════════════════════════════════════════════════════
// HOOKS
// ═══════════════════════════════════════════════════════════

export function useTitles() {
  return useQuery({
    queryKey: ['titles'],
    queryFn: async () => {
      const response = await api.get<TitlesResponse>('/player/titles')
      return response
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useSetActiveTitle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (titleId: string | null) => {
      const response = await api.post<{ activeTitle: Title | null }>('/player/titles/active', {
        titleId,
      })
      return response
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['titles'] })
      queryClient.invalidateQueries({ queryKey: ['player'] })
      if (data.activeTitle) {
        Alert.alert('Title Equipped', `You are now known as "${data.activeTitle.name}"`)
      }
    },
    onError: (error) => {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to set title')
    },
  })
}

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════

export function getRarityColor(rarity: TitleRarity): string {
  switch (rarity) {
    case 'common':
      return '#9ca3af' // gray-400
    case 'uncommon':
      return '#22c55e' // green-500
    case 'rare':
      return '#3b82f6' // blue-500
    case 'epic':
      return '#a855f7' // purple-500
    case 'legendary':
      return '#f59e0b' // amber-500
    default:
      return '#ffffff'
  }
}

export function getRarityBgColor(rarity: TitleRarity): string {
  switch (rarity) {
    case 'common':
      return '#9ca3af20'
    case 'uncommon':
      return '#22c55e20'
    case 'rare':
      return '#3b82f620'
    case 'epic':
      return '#a855f720'
    case 'legendary':
      return '#f59e0b20'
    default:
      return '#ffffff10'
  }
}

export function getCategoryIcon(category: TitleCategory): string {
  switch (category) {
    case 'streak':
      return '🔥'
    case 'boss':
      return '⚔️'
    case 'dungeon':
      return '🏰'
    case 'seasonal':
      return '🌟'
    case 'achievement':
      return '🏆'
    case 'hard_mode':
      return '💀'
    default:
      return '📜'
  }
}

export function getRarityLabel(rarity: TitleRarity): string {
  return rarity.charAt(0).toUpperCase() + rarity.slice(1)
}

export function sortTitles(titles: Title[], sortBy: 'rarity' | 'recency' | 'alphabetical'): Title[] {
  const rarityOrder: Record<TitleRarity, number> = {
    legendary: 0,
    epic: 1,
    rare: 2,
    uncommon: 3,
    common: 4,
  }

  return [...titles].sort((a, b) => {
    switch (sortBy) {
      case 'rarity':
        return rarityOrder[a.rarity] - rarityOrder[b.rarity]
      case 'recency':
        if (!a.earnedAt && !b.earnedAt) return 0
        if (!a.earnedAt) return 1
        if (!b.earnedAt) return -1
        return new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime()
      case 'alphabetical':
        return a.name.localeCompare(b.name)
      default:
        return 0
    }
  })
}

export function filterTitles(titles: Title[], filter: 'all' | 'unlocked' | 'locked'): Title[] {
  switch (filter) {
    case 'unlocked':
      return titles.filter((t) => t.isEarned)
    case 'locked':
      return titles.filter((t) => !t.isEarned)
    default:
      return titles
  }
}
