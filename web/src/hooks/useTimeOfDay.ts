/**
 * useTimeOfDay - Hook for time-based UI mode detection
 */

import { useState, useEffect, useMemo } from 'react'

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night'
export type UIMode = 'default' | 'evening' | 'quiet'

export interface TimeOfDayInfo {
  timeOfDay: TimeOfDay
  uiMode: UIMode
  hour: number
  greeting: string
  message: string
  isEvening: boolean
  isQuietMode: boolean
}

/**
 * Get time of day from hour
 */
function getTimeOfDay(hour: number): TimeOfDay {
  if (hour < 5) return 'night'
  if (hour < 12) return 'morning'
  if (hour < 17) return 'afternoon'
  if (hour < 22) return 'evening'
  return 'night'
}

/**
 * Get UI mode from hour
 */
function getUIMode(hour: number): UIMode {
  if (hour >= 22 || hour < 5) return 'quiet'
  if (hour >= 20) return 'evening'
  return 'default'
}

/**
 * Get greeting based on time
 */
function getGreeting(timeOfDay: TimeOfDay): string {
  switch (timeOfDay) {
    case 'morning': return 'Good morning'
    case 'afternoon': return 'Good afternoon'
    case 'evening': return 'Good evening'
    case 'night': return 'Rest well'
  }
}

/**
 * Get motivational message based on time
 */
function getMessage(uiMode: UIMode, hour: number): string {
  switch (uiMode) {
    case 'quiet':
      return 'The day winds down. Rest and recover.'
    case 'evening':
      if (hour < 21) {
        return 'Evening approaches. Complete your remaining quests.'
      }
      return 'Time to reflect on today\'s progress.'
    default:
      return 'Stay focused on your mission.'
  }
}

/**
 * Hook for time of day detection
 */
export function useTimeOfDay(timezone?: string): TimeOfDayInfo {
  const [now, setNow] = useState(new Date())

  // Update every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date())
    }, 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  const info = useMemo(() => {
    // Get hour in user's timezone
    let hour: number
    
    if (timezone) {
      try {
        const formatter = new Intl.DateTimeFormat('en-US', {
          timeZone: timezone,
          hour: 'numeric',
          hour12: false,
        })
        hour = parseInt(formatter.format(now), 10)
      } catch {
        hour = now.getHours()
      }
    } else {
      hour = now.getHours()
    }

    const timeOfDay = getTimeOfDay(hour)
    const uiMode = getUIMode(hour)

    return {
      timeOfDay,
      uiMode,
      hour,
      greeting: getGreeting(timeOfDay),
      message: getMessage(uiMode, hour),
      isEvening: uiMode === 'evening',
      isQuietMode: uiMode === 'quiet',
    }
  }, [now, timezone])

  return info
}

/**
 * Get CSS class names for current UI mode
 */
export function getUIModeClasses(uiMode: UIMode): string {
  switch (uiMode) {
    case 'evening':
      return 'evening-mode'
    case 'quiet':
      return 'evening-mode quiet-mode'
    default:
      return ''
  }
}

/**
 * Get CSS custom property overrides for mode
 */
export function getUIModeStyles(uiMode: UIMode): React.CSSProperties {
  switch (uiMode) {
    case 'evening':
      return {
        '--system-accent': '#4ade80',
        '--system-text': '#d4d4d8',
        '--system-bg-overlay': 'rgba(0, 0, 0, 0.7)',
      } as React.CSSProperties
    case 'quiet':
      return {
        '--system-accent': '#2dd4bf',
        '--system-text': '#a1a1aa',
        '--system-bg-overlay': 'rgba(0, 0, 0, 0.85)',
      } as React.CSSProperties
    default:
      return {}
  }
}
