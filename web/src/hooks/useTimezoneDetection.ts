/**
 * useTimezoneDetection - Hook for detecting timezone changes
 */

import { useState, useEffect, useCallback } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'

export interface TimezoneChange {
  detected: boolean
  oldTimezone: string
  newTimezone: string
  prompted: boolean
}

const STORAGE_KEY = 'timezone-prompt-dismissed'

/**
 * Get the browser's current timezone
 */
function getBrowserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}

/**
 * Hook for detecting timezone changes
 */
export function useTimezoneDetection(userTimezone: string | undefined) {
  const [change, setChange] = useState<TimezoneChange | null>(null)
  const [isDismissed, setIsDismissed] = useState(false)

  // Check for timezone mismatch
  useEffect(() => {
    if (!userTimezone) return

    const browserTimezone = getBrowserTimezone()
    
    // Check if we've already prompted for this change
    const dismissedKey = localStorage.getItem(STORAGE_KEY)
    if (dismissedKey === `${userTimezone}-${browserTimezone}`) {
      setIsDismissed(true)
      return
    }

    // Detect if timezone differs
    if (browserTimezone !== userTimezone) {
      setChange({
        detected: true,
        oldTimezone: userTimezone,
        newTimezone: browserTimezone,
        prompted: false,
      })
    } else {
      setChange(null)
    }
  }, [userTimezone])

  const dismiss = useCallback(() => {
    if (change) {
      localStorage.setItem(STORAGE_KEY, `${change.oldTimezone}-${change.newTimezone}`)
    }
    setIsDismissed(true)
    setChange(null)
  }, [change])

  return {
    change,
    shouldPrompt: change?.detected && !isDismissed,
    dismiss,
  }
}

/**
 * Hook for updating user timezone
 */
export function useUpdateTimezone() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (timezone: string) => {
      return api.put<{ success: boolean }>('/api/player/timezone', { timezone })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['player'] })
      // Clear the dismissed storage since we've updated
      localStorage.removeItem(STORAGE_KEY)
    },
  })
}

/**
 * Get friendly timezone name
 */
export function getTimezoneName(timezone: string): string {
  try {
    // Get current offset
    const now = new Date()
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'short',
    })
    const parts = formatter.formatToParts(now)
    const tzPart = parts.find(p => p.type === 'timeZoneName')
    
    // Clean up the timezone string
    const cleanName = timezone.replace(/_/g, ' ').split('/').pop() ?? timezone
    
    return `${cleanName} (${tzPart?.value ?? timezone})`
  } catch {
    return timezone
  }
}

/**
 * Get timezone offset difference
 */
export function getTimezoneOffsetDiff(tz1: string, tz2: string): number {
  const now = new Date()
  
  const getOffset = (tz: string): number => {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
    })
    const time = formatter.format(now)
    const [h, m] = time.split(':').map(Number)
    return (h ?? 0) * 60 + (m ?? 0)
  }

  try {
    return getOffset(tz2) - getOffset(tz1)
  } catch {
    return 0
  }
}

/**
 * Format offset difference for display
 */
export function formatOffsetDiff(minutes: number): string {
  const sign = minutes >= 0 ? '+' : '-'
  const absMinutes = Math.abs(minutes)
  const hours = Math.floor(absMinutes / 60)
  const mins = absMinutes % 60

  if (hours === 0) return `${sign}${mins}m`
  if (mins === 0) return `${sign}${hours}h`
  return `${sign}${hours}h ${mins}m`
}
