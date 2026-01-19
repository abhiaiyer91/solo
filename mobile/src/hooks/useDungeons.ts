/**
 * Dungeons Hook (Mobile)
 *
 * Manages dungeon data and actions.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, queryKeys } from '../lib/api'

interface Dungeon {
  id: string
  name: string
  description?: string
  rank: string
  timeLimit: number
  xpReward: number
  requirements?: { level?: number }
  isActive?: boolean
}

interface ActiveDungeon {
  id: string
  name: string
  rank: string
  progress: number
  timeRemaining: number
  questsCompleted: number
  totalQuests: number
}

interface CompletedDungeon {
  id: string
  dungeonName: string
  rank: string
  xpEarned: number
  completedAt: string
}

interface DungeonsResponse {
  dungeons: Dungeon[]
  activeDungeon: ActiveDungeon | null
  completedDungeons: CompletedDungeon[]
  totalCleared: number
}

export function useDungeons() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['dungeons'],
    queryFn: async () => {
      try {
        const response = await api.get<DungeonsResponse>('/api/dungeons')
        return response
      } catch {
        // Return sample data for development
        return {
          dungeons: getSampleDungeons(),
          activeDungeon: null,
          completedDungeons: [],
          totalCleared: 0,
        }
      }
    },
    staleTime: 1000 * 30, // 30 seconds
  })

  const startMutation = useMutation({
    mutationFn: async (dungeonId: string) => {
      return api.post(`/api/dungeons/${dungeonId}/start`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dungeons'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.quests() })
    },
  })

  const abandonMutation = useMutation({
    mutationFn: async (dungeonId: string) => {
      return api.post(`/api/dungeons/${dungeonId}/abandon`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dungeons'] })
    },
  })

  return {
    dungeons: query.data?.dungeons ?? [],
    activeDungeon: query.data?.activeDungeon ?? null,
    completedDungeons: query.data?.completedDungeons ?? [],
    totalCleared: query.data?.totalCleared ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    startDungeon: startMutation.mutate,
    abandonDungeon: abandonMutation.mutate,
    isStarting: startMutation.isPending,
    isAbandoning: abandonMutation.isPending,
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
      rank: 'E',
      timeLimit: 60,
      xpReward: 500,
      requirements: { level: 5 },
    },
    {
      id: 'dungeon-2',
      name: 'The Tower of Endurance',
      description: 'Push your limits with enhanced workout requirements.',
      rank: 'D',
      timeLimit: 90,
      xpReward: 1000,
      requirements: { level: 10 },
    },
    {
      id: 'dungeon-3',
      name: 'The Abyss of Discipline',
      description: 'Face the ultimate test of mental and physical fortitude.',
      rank: 'C',
      timeLimit: 120,
      xpReward: 2000,
      requirements: { level: 20 },
    },
    {
      id: 'dungeon-4',
      name: 'The Void',
      description: 'A nightmare dungeon for only the most dedicated Hunters.',
      rank: 'B',
      timeLimit: 180,
      xpReward: 5000,
      requirements: { level: 30 },
    },
  ]
}
