import { useQuery } from '@tanstack/react-query'

export type ShadowType = 'level' | 'streak' | 'time' | 'title'

export interface ShadowObservation {
  type: ShadowType
  narrative: string
  shadowData: {
    shadowLevel?: number
    shadowStreak?: number
    shadowCompletionTime?: string
    shadowTitle?: string
    playerCount?: number
  }
  playerData: {
    level: number
    streak: number
    lastCompletionTime?: string
    title?: string
  }
  observedAt: string
}

export interface ShadowAggregates {
  totalActivePlayers: number
  playersCompletedToday: number
  playersInDungeons: number
  playersDefeatedBosses: number
}

async function fetchShadowObservation(): Promise<ShadowObservation> {
  const res = await fetch('/api/shadows/today', {
    credentials: 'include',
  })

  if (!res.ok) {
    throw new Error('Failed to fetch shadow observation')
  }

  return res.json()
}

async function fetchShadowAggregates(): Promise<ShadowAggregates> {
  const res = await fetch('/api/shadows/aggregates', {
    credentials: 'include',
  })

  if (!res.ok) {
    throw new Error('Failed to fetch shadow aggregates')
  }

  return res.json()
}

export function useShadowObservation() {
  return useQuery({
    queryKey: ['shadow', 'observation'],
    queryFn: fetchShadowObservation,
    staleTime: 1000 * 60 * 30, // 30 minutes - shadow changes daily
    retry: 1,
  })
}

export function useShadowAggregates() {
  return useQuery({
    queryKey: ['shadow', 'aggregates'],
    queryFn: fetchShadowAggregates,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  })
}
