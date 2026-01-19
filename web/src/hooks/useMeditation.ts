/**
 * useMeditation - Hook for meditation/mindfulness tracking
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'

export type MeditationState = 'idle' | 'active' | 'paused' | 'completed'

export interface MeditationSession {
  state: MeditationState
  targetMinutes: number
  elapsedSeconds: number
  startedAt: Date | null
  completedAt: Date | null
}

export interface DailyMeditation {
  date: string
  totalMinutes: number
  targetMinutes: number
  sessions: number
  goalMet: boolean
}

/**
 * Timer hook for meditation sessions
 */
export function useMeditationTimer(targetMinutes: number = 10) {
  const [state, setState] = useState<MeditationState>('idle')
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [startedAt, setStartedAt] = useState<Date | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const targetSeconds = targetMinutes * 60

  const start = useCallback(() => {
    setState('active')
    setStartedAt(new Date())
    setElapsedSeconds(0)
  }, [])

  const pause = useCallback(() => {
    setState('paused')
  }, [])

  const resume = useCallback(() => {
    setState('active')
  }, [])

  const stop = useCallback(() => {
    setState('idle')
    setElapsedSeconds(0)
    setStartedAt(null)
  }, [])

  const complete = useCallback(() => {
    setState('completed')
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
  }, [])

  // Timer effect
  useEffect(() => {
    if (state === 'active') {
      intervalRef.current = setInterval(() => {
        setElapsedSeconds((prev) => {
          const next = prev + 1
          // Auto-complete when target reached
          if (next >= targetSeconds) {
            complete()
            return targetSeconds
          }
          return next
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [state, targetSeconds, complete])

  const progress = Math.min(100, (elapsedSeconds / targetSeconds) * 100)
  const remainingSeconds = Math.max(0, targetSeconds - elapsedSeconds)

  return {
    state,
    elapsedSeconds,
    remainingSeconds,
    progress,
    targetMinutes,
    startedAt,
    isActive: state === 'active',
    isPaused: state === 'paused',
    isCompleted: state === 'completed',
    start,
    pause,
    resume,
    stop,
    complete,
  }
}

/**
 * Hook for logging meditation sessions
 */
export function useLogMeditation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { minutes: number; source?: 'manual' | 'timer' | 'healthkit' }) => {
      return api.post<{ success: boolean; dailyTotal: number }>('/api/meditation/log', data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meditation'] })
      queryClient.invalidateQueries({ queryKey: ['quests'] })
    },
  })
}

/**
 * Hook for today's meditation progress
 */
export function useMeditationProgress() {
  return useQuery({
    queryKey: ['meditation', 'today'],
    queryFn: async () => {
      try {
        return await api.get<DailyMeditation>('/api/meditation/today')
      } catch {
        return {
          date: new Date().toISOString().split('T')[0]!,
          totalMinutes: 0,
          targetMinutes: 10,
          sessions: 0,
          goalMet: false,
        }
      }
    },
    staleTime: 30 * 1000,
  })
}

/**
 * Format seconds to MM:SS
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

/**
 * Get calming message for meditation context
 */
export function getCalmingMessage(state: MeditationState): string {
  switch (state) {
    case 'idle':
      return 'Find a quiet space. Be present.'
    case 'active':
      return 'Breathe. Focus on the present moment.'
    case 'paused':
      return 'Take your time. Return when ready.'
    case 'completed':
      return 'Well done. Carry this peace with you.'
  }
}
