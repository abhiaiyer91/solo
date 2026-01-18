import { useQuery } from '@tanstack/react-query'
import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'

export interface UnlockStatus {
  id: string
  name: string
  description: string
  category: string
  isUnlocked: boolean
  requirement: {
    type: string
    value: number
    current: number
  }
  progress: number
  narrative: string | null
}

export interface ProgressionSummary {
  unlocks: UnlockStatus[]
  newUnlocks: UnlockStatus[]
  nextUnlocks: UnlockStatus[]
  stats: {
    totalUnlocks: number
    unlockedCount: number
    level: number
    daysActive: number
    currentSeason: number
  }
}

const LAST_SEEN_STORAGE_KEY = 'solo-last-seen-unlocks'

/**
 * Get last seen unlock IDs from localStorage
 */
function getLastSeenUnlocks(): string[] {
  try {
    const stored = localStorage.getItem(LAST_SEEN_STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

/**
 * Save last seen unlock IDs to localStorage
 */
function saveLastSeenUnlocks(ids: string[]): void {
  try {
    localStorage.setItem(LAST_SEEN_STORAGE_KEY, JSON.stringify(ids))
  } catch {
    // Ignore storage errors
  }
}

/**
 * Hook to fetch unlock progression data
 */
export function useUnlocks() {
  const [lastSeenIds, setLastSeenIds] = useState<string[]>(() => getLastSeenUnlocks())
  const [pendingCelebration, setPendingCelebration] = useState<UnlockStatus | null>(null)

  const query = useQuery<ProgressionSummary>({
    queryKey: ['unlocks', lastSeenIds.join(',')],
    queryFn: async () => {
      const lastSeenParam = lastSeenIds.length > 0 ? `?lastSeen=${lastSeenIds.join(',')}` : ''
      const res = await api.get(`/api/player/unlocks${lastSeenParam}`) as Response
      if (!res.ok) throw new Error('Failed to fetch unlocks')
      return res.json() as Promise<ProgressionSummary>
    },
    staleTime: 60 * 1000, // 1 minute
    refetchOnWindowFocus: true,
  })

  // When we get new unlocks, queue them for celebration
  useEffect(() => {
    if (query.data?.newUnlocks && query.data.newUnlocks.length > 0) {
      // Show the first new unlock
      const firstNew = query.data.newUnlocks[0]
      if (firstNew) {
        setPendingCelebration(firstNew)
      }
    }
  }, [query.data?.newUnlocks])

  /**
   * Mark an unlock as "seen" (dismisses celebration)
   */
  const markAsSeen = useCallback((unlockId: string) => {
    const newIds = [...lastSeenIds, unlockId]
    setLastSeenIds(newIds)
    saveLastSeenUnlocks(newIds)
    setPendingCelebration(null)
  }, [lastSeenIds])

  /**
   * Mark all current unlocks as seen
   */
  const markAllAsSeen = useCallback(() => {
    if (query.data?.unlocks) {
      const allUnlockedIds = query.data.unlocks
        .filter((u) => u.isUnlocked)
        .map((u) => u.id)
      setLastSeenIds(allUnlockedIds)
      saveLastSeenUnlocks(allUnlockedIds)
      setPendingCelebration(null)
    }
  }, [query.data?.unlocks])

  return {
    ...query,
    pendingCelebration,
    markAsSeen,
    markAllAsSeen,
    // Convenience accessors
    unlocks: query.data?.unlocks ?? [],
    newUnlocks: query.data?.newUnlocks ?? [],
    nextUnlocks: query.data?.nextUnlocks ?? [],
    stats: query.data?.stats,
  }
}

/**
 * Hook to check if a specific feature is unlocked
 */
export function useIsUnlocked(featureId: string): boolean {
  const { unlocks } = useUnlocks()
  const unlock = unlocks.find((u) => u.id === featureId)
  return unlock?.isUnlocked ?? false
}
