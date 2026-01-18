import { useQuery } from '@tanstack/react-query'
import type { ReconciliationItem, DaySummaryData } from '@/components/daily'

export type DayPhase = 'morning' | 'midday' | 'afternoon' | 'evening' | 'night' | 'closed'

export interface DayStatus {
  date: string
  phase: DayPhase
  isDayClosed: boolean
  closedAt: string | null
  shouldShowReconciliation: boolean
  timeUntilMidnight: { hours: number; minutes: number } | null
  reconciliationTime: number
}

export interface ReconciliationResponse {
  items: ReconciliationItem[]
  isDayClosed: boolean
}

export interface DaySummaryResponse {
  summary: DaySummaryData
  isDayClosed: boolean
}

async function fetchDayStatus(): Promise<DayStatus> {
  const res = await fetch('/api/day/status', {
    credentials: 'include',
  })

  if (!res.ok) {
    throw new Error('Failed to fetch day status')
  }

  return res.json()
}

async function fetchReconciliationItems(): Promise<ReconciliationResponse> {
  const res = await fetch('/api/day/reconciliation', {
    credentials: 'include',
  })

  if (!res.ok) {
    throw new Error('Failed to fetch reconciliation items')
  }

  return res.json()
}

async function fetchDaySummary(): Promise<DaySummaryResponse> {
  const res = await fetch('/api/day/summary', {
    credentials: 'include',
  })

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error('No daily log found')
    }
    throw new Error('Failed to fetch day summary')
  }

  return res.json()
}

/**
 * Hook to get current day status including phase and reconciliation timing
 */
export function useDayStatus() {
  return useQuery({
    queryKey: ['dayStatus'],
    queryFn: fetchDayStatus,
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60, // Refetch every minute to update phase
  })
}

/**
 * Hook to get items pending reconciliation
 */
export function useReconciliationItems() {
  return useQuery({
    queryKey: ['reconciliation'],
    queryFn: fetchReconciliationItems,
    staleTime: 1000 * 30, // 30 seconds
  })
}

/**
 * Hook to get day summary
 */
export function useDaySummary() {
  return useQuery({
    queryKey: ['daySummary'],
    queryFn: fetchDaySummary,
    staleTime: 1000 * 60, // 1 minute
  })
}

/**
 * Get CSS class modifiers based on day phase
 */
export function getPhaseStyles(phase: DayPhase): {
  bgClass: string
  textClass: string
  accentClass: string
} {
  switch (phase) {
    case 'morning':
      return {
        bgClass: '',
        textClass: 'text-system-text',
        accentClass: 'text-system-gold',
      }
    case 'midday':
      return {
        bgClass: '',
        textClass: 'text-system-text',
        accentClass: 'text-system-blue',
      }
    case 'afternoon':
      return {
        bgClass: '',
        textClass: 'text-system-text',
        accentClass: 'text-system-orange',
      }
    case 'evening':
      return {
        bgClass: 'evening-mode',
        textClass: 'text-system-text/90',
        accentClass: 'text-system-purple',
      }
    case 'night':
    case 'closed':
      return {
        bgClass: 'night-mode',
        textClass: 'text-system-text/80',
        accentClass: 'text-system-text-muted',
      }
    default:
      return {
        bgClass: '',
        textClass: 'text-system-text',
        accentClass: 'text-system-blue',
      }
  }
}

/**
 * Get phase-appropriate greeting
 */
export function getPhaseGreeting(phase: DayPhase): string {
  switch (phase) {
    case 'morning':
      return 'Morning quests await.'
    case 'midday':
      return 'The System is recording.'
    case 'afternoon':
      return 'Time remaining is limited.'
    case 'evening':
      return 'The day winds down.'
    case 'night':
      return 'Day closing soon.'
    case 'closed':
      return 'Day is closed.'
    default:
      return 'The System awaits.'
  }
}
