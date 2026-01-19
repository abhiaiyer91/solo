/**
 * useQuietHours - Hook for quiet hours detection and management
 */

import { useState, useEffect, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'

export interface QuietHoursSettings {
  enabled: boolean
  startTime: string // "22:00"
  endTime: string // "07:00"
  timezone: string
}

export interface QuietHoursState {
  isActive: boolean
  currentPhase: 'day' | 'evening' | 'quiet'
  nextPhaseAt: Date | null
  message: string
}

const DEFAULT_SETTINGS: QuietHoursSettings = {
  enabled: true,
  startTime: '22:00',
  endTime: '07:00',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
}

/**
 * Hook for quiet hours settings
 */
export function useQuietHoursSettings() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['quiet-hours', 'settings'],
    queryFn: async () => {
      try {
        const response = await api.get<{ settings: QuietHoursSettings }>('/api/player/quiet-hours')
        return response.settings
      } catch {
        return DEFAULT_SETTINGS
      }
    },
    staleTime: 5 * 60 * 1000,
  })

  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<QuietHoursSettings>) => {
      return api.put<{ settings: QuietHoursSettings }>('/api/player/quiet-hours', updates)
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['quiet-hours', 'settings'], data.settings)
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
 * Hook for detecting current quiet hours state
 */
export function useQuietHoursState(settings?: QuietHoursSettings): QuietHoursState {
  const [now, setNow] = useState(new Date())

  // Update every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date())
    }, 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  return useMemo(() => {
    if (!settings?.enabled) {
      return {
        isActive: false,
        currentPhase: 'day' as const,
        nextPhaseAt: null,
        message: '',
      }
    }

    const { startTime, endTime, timezone } = settings

    // Get current hour in user's timezone
    let currentHour: number
    try {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        hour: 'numeric',
        hour12: false,
      })
      currentHour = parseInt(formatter.format(now), 10)
    } catch {
      currentHour = now.getHours()
    }

    const [startHour] = startTime.split(':').map(Number)
    const [endHour] = endTime.split(':').map(Number)

    // Check if in quiet hours
    let isActive = false
    if (startHour! > endHour!) {
      // Overnight (e.g., 22:00 - 07:00)
      isActive = currentHour >= startHour! || currentHour < endHour!
    } else {
      // Same day
      isActive = currentHour >= startHour! && currentHour < endHour!
    }

    // Determine phase
    let currentPhase: 'day' | 'evening' | 'quiet' = 'day'
    if (isActive) {
      currentPhase = 'quiet'
    } else if (currentHour >= 20) {
      currentPhase = 'evening'
    }

    // Calculate next phase time
    let nextPhaseAt: Date | null = null
    const nextDate = new Date(now)
    
    if (currentPhase === 'day') {
      nextDate.setHours(20, 0, 0, 0)
      if (nextDate <= now) nextDate.setDate(nextDate.getDate() + 1)
      nextPhaseAt = nextDate
    } else if (currentPhase === 'evening') {
      nextDate.setHours(startHour!, 0, 0, 0)
      if (nextDate <= now) nextDate.setDate(nextDate.getDate() + 1)
      nextPhaseAt = nextDate
    } else {
      nextDate.setHours(endHour!, 0, 0, 0)
      if (nextDate <= now) nextDate.setDate(nextDate.getDate() + 1)
      nextPhaseAt = nextDate
    }

    // Get message
    const message = getQuietHoursMessage(currentPhase, isActive)

    return {
      isActive,
      currentPhase,
      nextPhaseAt,
      message,
    }
  }, [now, settings])
}

function getQuietHoursMessage(phase: 'day' | 'evening' | 'quiet', _isActive: boolean): string {
  if (phase === 'quiet') {
    return 'Quiet hours active. Rest well, Hunter.'
  }
  if (phase === 'evening') {
    return 'The day winds down. Complete remaining quests.'
  }
  return ''
}

/**
 * Check if a notification should be suppressed
 */
export function shouldSuppressNotification(
  settings: QuietHoursSettings,
  timezone?: string
): boolean {
  if (!settings.enabled) return false

  const tz = timezone ?? settings.timezone
  const now = new Date()

  let currentHour: number
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      hour: 'numeric',
      hour12: false,
    })
    currentHour = parseInt(formatter.format(now), 10)
  } catch {
    currentHour = now.getHours()
  }

  const [startHour] = settings.startTime.split(':').map(Number)
  const [endHour] = settings.endTime.split(':').map(Number)

  if (startHour! > endHour!) {
    return currentHour >= startHour! || currentHour < endHour!
  }
  return currentHour >= startHour! && currentHour < endHour!
}

/**
 * Format time range for display
 */
export function formatQuietHoursRange(startTime: string, endTime: string): string {
  const formatTime = (time: string): string => {
    const [h, m] = time.split(':').map(Number)
    const period = h! >= 12 ? 'PM' : 'AM'
    const hour12 = h! % 12 || 12
    return `${hour12}:${m!.toString().padStart(2, '0')} ${period}`
  }

  return `${formatTime(startTime)} - ${formatTime(endTime)}`
}
