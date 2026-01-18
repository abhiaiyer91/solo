import { useQuery } from '@tanstack/react-query'

export interface Player {
  id: string
  name: string
  email: string
  level: number
  totalXP: number
  currentStreak: number
  longestStreak: number
  perfectStreak: number
  str: number
  agi: number
  vit: number
  disc: number
  timezone: string
  onboardingCompleted: boolean
  currentTitle?: string
  debuffActive: boolean
  debuffActiveUntil: string | null
  weekendBonusActive: boolean
  weekendBonusPercent: number
}

export interface LevelProgress {
  currentLevel: number
  xpProgress: number
  xpNeeded: number
  progressPercent: number
  totalXP: number
}

async function fetchPlayer(): Promise<Player> {
  const res = await fetch('/api/player', {
    credentials: 'include',
  })

  if (!res.ok) {
    throw new Error('Failed to fetch player data')
  }

  return res.json()
}

async function fetchLevelProgress(): Promise<LevelProgress> {
  const res = await fetch('/api/player/level-progress', {
    credentials: 'include',
  })

  if (!res.ok) {
    throw new Error('Failed to fetch level progress')
  }

  return res.json()
}

export function usePlayer() {
  return useQuery({
    queryKey: ['player'],
    queryFn: fetchPlayer,
    staleTime: 1000 * 60, // 1 minute
  })
}

export function useLevelProgress() {
  return useQuery({
    queryKey: ['player', 'level-progress'],
    queryFn: fetchLevelProgress,
    staleTime: 1000 * 30, // 30 seconds
  })
}
