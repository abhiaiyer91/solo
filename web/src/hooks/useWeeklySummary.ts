/**
 * useWeeklySummary hook
 * Fetches and manages weekly summary data for display
 */

import { useQuery } from '@tanstack/react-query'

export interface WeeklySummary {
  weekStart: string
  weekEnd: string
  daysCompleted: number
  totalDays: number
  coreCompletionRate: number
  xpEarned: number
  streakMaintained: boolean
  currentStreak: number
  perfectDays: number
  comparedToLastWeek?: {
    daysChange: number
    xpChange: number
    completionChange: number
  }
  achievements: string[]
  observation: string
}

export interface WeeklySummaryCheck {
  show: boolean
  summary: WeeklySummary | null
}

export interface WeeklyHistory {
  summaries: WeeklySummary[]
  totalWeeks: number
}

/**
 * Get the dismissed week key from localStorage
 */
function getLastDismissedWeek(): string | null {
  try {
    return localStorage.getItem('weeklySummary:lastDismissed')
  } catch {
    return null
  }
}

/**
 * Set the dismissed week key in localStorage
 */
function setLastDismissedWeek(weekStart: string): void {
  try {
    localStorage.setItem('weeklySummary:lastDismissed', weekStart)
  } catch {
    // Ignore storage errors
  }
}

/**
 * Hook to check if weekly summary should be shown (Monday)
 */
export function useWeeklySummaryCheck() {
  const lastDismissed = getLastDismissedWeek()

  return useQuery({
    queryKey: ['weekly-summary-check', lastDismissed],
    queryFn: async (): Promise<WeeklySummaryCheck> => {
      const url = new URL('/api/player/weekly-summary', window.location.origin)
      if (lastDismissed) {
        url.searchParams.set('lastDismissed', lastDismissed)
      }

      const res = await fetch(url.toString(), {
        credentials: 'include',
      })

      if (!res.ok) {
        throw new Error('Failed to check weekly summary')
      }

      return res.json()
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  })
}

/**
 * Hook to get a specific week's summary
 */
export function useWeeklySummary(weekOffset: number = 1) {
  return useQuery({
    queryKey: ['weekly-summary', weekOffset],
    queryFn: async (): Promise<WeeklySummary> => {
      const res = await fetch(`/api/player/weekly-summary/${weekOffset}`, {
        credentials: 'include',
      })

      if (!res.ok) {
        throw new Error('Failed to fetch weekly summary')
      }

      return res.json()
    },
    staleTime: 60 * 1000, // 1 minute
  })
}

/**
 * Hook to get weekly history
 */
export function useWeeklyHistory(weeks: number = 4) {
  return useQuery({
    queryKey: ['weekly-history', weeks],
    queryFn: async (): Promise<WeeklyHistory> => {
      const res = await fetch(`/api/player/weekly-history?weeks=${weeks}`, {
        credentials: 'include',
      })

      if (!res.ok) {
        throw new Error('Failed to fetch weekly history')
      }

      return res.json()
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Dismiss the weekly summary for this week
 */
export function dismissWeeklySummary(weekStart: string): void {
  setLastDismissedWeek(weekStart)
}

/**
 * Format week range for display
 */
export function formatWeekRange(weekStart: string, weekEnd: string): string {
  const start = new Date(weekStart)
  const end = new Date(weekEnd)

  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
  const startStr = start.toLocaleDateString('en-US', options)
  const endStr = end.toLocaleDateString('en-US', options)

  return `${startStr} - ${endStr}`
}
