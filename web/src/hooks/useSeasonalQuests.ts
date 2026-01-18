import { useQuery } from '@tanstack/react-query'

export interface SeasonalQuest {
  id: string
  name: string
  description: string
  seasonId: string
  seasonName: string
  seasonTheme: string
  targetValue: number
  currentValue: number
  completionPercent: number
  isCompleted: boolean
  xpReward: number
  badgeReward?: string
  weekStart: string
  weekEnd: string
}

export interface SeasonInfo {
  id: string
  name: string
  theme: string
  number: number
  isActive: boolean
  startDate: string
  endDate: string
}

export interface SeasonalQuestsResponse {
  season: SeasonInfo | null
  quests: SeasonalQuest[]
  isUnlocked: boolean
  unlockSeason: number
  currentSeason: number | null
}

async function fetchSeasonalQuests(): Promise<SeasonalQuestsResponse> {
  const res = await fetch('/api/seasons/quests', {
    credentials: 'include',
  })

  if (!res.ok) {
    // Return empty state if not available
    return {
      season: null,
      quests: [],
      isUnlocked: false,
      unlockSeason: 2,
      currentSeason: null,
    }
  }

  return res.json()
}

async function fetchCurrentSeason(): Promise<SeasonInfo | null> {
  const res = await fetch('/api/seasons/current', {
    credentials: 'include',
  })

  if (!res.ok) {
    return null
  }

  const data = await res.json()
  return data.season
}

export function useSeasonalQuests() {
  return useQuery({
    queryKey: ['seasonal-quests'],
    queryFn: fetchSeasonalQuests,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export function useCurrentSeason() {
  return useQuery({
    queryKey: ['current-season'],
    queryFn: fetchCurrentSeason,
    staleTime: 1000 * 60 * 10, // 10 minutes
  })
}
