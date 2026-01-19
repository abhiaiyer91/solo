/**
 * Dungeons Hook (Mobile)
 * 
 * Manages dungeon data and actions.
 */

import { useState, useEffect, useCallback } from 'react'
import { api } from '../lib/api'

interface Dungeon {
  id: string
  name: string
  description: string
  levelRequired: number
  difficulty: 'easy' | 'medium' | 'hard' | 'nightmare'
  durationDays: number
  xpReward: number
  status: 'locked' | 'available' | 'active' | 'completed'
  progress?: number
}

interface DungeonDetails extends Dungeon {
  phases: Array<{
    phaseNumber: number
    name: string
    durationDays: number
    requirements: Array<{
      type: string
      value: number
      description: string
    }>
  }>
  currentPhase?: number
  phaseProgress?: number
}

interface UseDungeonsReturn {
  dungeons: Dungeon[]
  activeDungeon: DungeonDetails | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
  enterDungeon: (dungeonId: string) => Promise<{ success: boolean; error?: string }>
  abandonDungeon: () => Promise<{ success: boolean; error?: string }>
}

export function useDungeons(): UseDungeonsReturn {
  const [dungeons, setDungeons] = useState<Dungeon[]>([])
  const [activeDungeon, setActiveDungeon] = useState<DungeonDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDungeons = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await api.get('/dungeons')
      
      if (response.error) {
        throw new Error(response.error)
      }

      setDungeons(response.dungeons || [])
      setActiveDungeon(response.active || null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load dungeons')
      // Set sample data for development
      setDungeons(getSampleDungeons())
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDungeons()
  }, [fetchDungeons])

  const enterDungeon = useCallback(async (dungeonId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await api.post(`/dungeons/${dungeonId}/enter`)
      
      if (response.error) {
        return { success: false, error: response.error }
      }

      // Refetch to update state
      await fetchDungeons()
      return { success: true }
    } catch (e) {
      return { success: false, error: 'Failed to enter dungeon' }
    }
  }, [fetchDungeons])

  const abandonDungeon = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    if (!activeDungeon) {
      return { success: false, error: 'No active dungeon' }
    }

    try {
      const response = await api.post(`/dungeons/${activeDungeon.id}/abandon`)
      
      if (response.error) {
        return { success: false, error: response.error }
      }

      setActiveDungeon(null)
      await fetchDungeons()
      return { success: true }
    } catch (e) {
      return { success: false, error: 'Failed to abandon dungeon' }
    }
  }, [activeDungeon, fetchDungeons])

  return {
    dungeons,
    activeDungeon,
    isLoading,
    error,
    refetch: fetchDungeons,
    enterDungeon,
    abandonDungeon,
  }
}

/**
 * Sample dungeon data for development
 */
function getSampleDungeons(): Dungeon[] {
  return [
    {
      id: 'dungeon-1',
      name: 'The Cave of Consistency',
      description: 'Master the art of daily discipline through 7 days of unbroken habit.',
      levelRequired: 5,
      difficulty: 'easy',
      durationDays: 7,
      xpReward: 500,
      status: 'available',
    },
    {
      id: 'dungeon-2',
      name: 'The Tower of Endurance',
      description: 'Push your limits with enhanced workout requirements.',
      levelRequired: 10,
      difficulty: 'medium',
      durationDays: 14,
      xpReward: 1000,
      status: 'locked',
    },
    {
      id: 'dungeon-3',
      name: 'The Abyss of Discipline',
      description: 'Face the ultimate test of mental and physical fortitude.',
      levelRequired: 20,
      difficulty: 'hard',
      durationDays: 21,
      xpReward: 2000,
      status: 'locked',
    },
    {
      id: 'dungeon-4',
      name: 'The Void',
      description: 'A nightmare dungeon for only the most dedicated Hunters.',
      levelRequired: 30,
      difficulty: 'nightmare',
      durationDays: 30,
      xpReward: 5000,
      status: 'locked',
    },
  ]
}
