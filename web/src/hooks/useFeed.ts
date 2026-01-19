/**
 * useFeed - Hook for social activity feed
 */

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { api } from '../lib/api'

export type FeedEventType = 
  | 'boss_defeat'
  | 'title_unlock'
  | 'streak_milestone'
  | 'dungeon_complete'
  | 'season_achievement'
  | 'level_milestone'

export interface FeedItem {
  id: string
  userId: string
  userName: string | null // null for anonymous
  eventType: FeedEventType
  title: string
  description: string
  metadata: {
    bossName?: string
    titleName?: string
    streakDays?: number
    dungeonName?: string
    dungeonRank?: string
    level?: number
    seasonNumber?: number
  }
  createdAt: string
}

export interface FeedResponse {
  items: FeedItem[]
  nextCursor: string | null
  hasMore: boolean
}

export interface FeedSettings {
  showFeed: boolean
  showOwnActivity: boolean
  showBossDefeats: boolean
  showTitleUnlocks: boolean
  showStreakMilestones: boolean
  showDungeonCompletions: boolean
}

const DEFAULT_SETTINGS: FeedSettings = {
  showFeed: true,
  showOwnActivity: false,
  showBossDefeats: true,
  showTitleUnlocks: true,
  showStreakMilestones: true,
  showDungeonCompletions: true,
}

/**
 * Hook for feed settings
 */
export function useFeedSettings() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['feed', 'settings'],
    queryFn: async () => {
      try {
        const response = await api.get<{ settings: FeedSettings }>('/api/feed/settings')
        return response.settings
      } catch {
        return DEFAULT_SETTINGS
      }
    },
    staleTime: 5 * 60 * 1000,
  })

  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<FeedSettings>) => {
      return api.put<{ settings: FeedSettings }>('/api/feed/settings', updates)
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['feed', 'settings'], data.settings)
    },
  })

  return {
    settings: query.data ?? DEFAULT_SETTINGS,
    isLoading: query.isLoading,
    updateSettings: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
  }
}

/**
 * Hook for infinite scrolling feed
 */
export function useFeed() {
  const { settings } = useFeedSettings()

  return useInfiniteQuery({
    queryKey: ['feed', 'items'],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams()
      if (pageParam) params.set('cursor', pageParam)
      params.set('limit', '20')
      
      return api.get<FeedResponse>(`/api/feed?${params}`)
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: undefined as string | undefined,
    enabled: settings.showFeed,
    staleTime: 60 * 1000,
  })
}

/**
 * Get icon for event type
 */
export function getFeedEventIcon(type: FeedEventType): string {
  switch (type) {
    case 'boss_defeat': return '⚔️'
    case 'title_unlock': return '👑'
    case 'streak_milestone': return '🔥'
    case 'dungeon_complete': return '🏰'
    case 'season_achievement': return '🏆'
    case 'level_milestone': return '⬆️'
  }
}

/**
 * Get color class for event type
 */
export function getFeedEventColor(type: FeedEventType): string {
  switch (type) {
    case 'boss_defeat': return 'text-red-400'
    case 'title_unlock': return 'text-yellow-400'
    case 'streak_milestone': return 'text-orange-400'
    case 'dungeon_complete': return 'text-purple-400'
    case 'season_achievement': return 'text-blue-400'
    case 'level_milestone': return 'text-green-400'
  }
}

/**
 * Format relative time
 */
export function formatFeedTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  
  return date.toLocaleDateString()
}
