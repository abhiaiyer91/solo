import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/components/ui/toast'

export type DungeonRank = 'E' | 'D' | 'C' | 'B' | 'A' | 'S'
export type DungeonStatus = 'available' | 'active' | 'completed' | 'locked'

export interface Dungeon {
  id: string
  name: string
  description: string
  rank: DungeonRank
  durationHours: number
  xpMultiplier: number
  objectives: DungeonObjective[]
  requirements: DungeonRequirement[]
  status: DungeonStatus
  isUnlocked: boolean
  unlockReason?: string
}

export interface DungeonObjective {
  id: string
  description: string
  targetValue: number
  currentValue: number
  isCompleted: boolean
}

export interface DungeonRequirement {
  type: 'level' | 'title' | 'dungeon_clear'
  value: string | number
  isMet: boolean
}

export interface ActiveDungeon {
  id: string
  dungeonId: string
  dungeonName: string
  rank: DungeonRank
  startedAt: string
  expiresAt: string
  hoursRemaining: number
  objectives: DungeonObjective[]
  overallProgress: number
}

export interface CompletedDungeon {
  id: string
  dungeonName: string
  rank: DungeonRank
  completedAt: string
  xpEarned: number
  timeTaken: number // hours
}

export interface DungeonsResponse {
  dungeons: Dungeon[]
  activeDungeon: ActiveDungeon | null
  completedDungeons: CompletedDungeon[]
  totalCleared: number
}

async function fetchDungeons(): Promise<DungeonsResponse> {
  const res = await fetch('/api/dungeons', {
    credentials: 'include',
  })

  if (!res.ok) {
    throw new Error('Failed to fetch dungeons')
  }

  return res.json()
}

async function enterDungeon(dungeonId: string): Promise<ActiveDungeon> {
  const res = await fetch(`/api/dungeons/${dungeonId}/enter`, {
    method: 'POST',
    credentials: 'include',
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || 'Failed to enter dungeon')
  }

  return res.json()
}

async function abandonDungeon(dungeonId: string): Promise<void> {
  const res = await fetch(`/api/dungeons/${dungeonId}/abandon`, {
    method: 'POST',
    credentials: 'include',
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || 'Failed to abandon dungeon')
  }
}

export function useDungeons() {
  return useQuery({
    queryKey: ['dungeons'],
    queryFn: fetchDungeons,
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

export function useEnterDungeon() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: enterDungeon,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['dungeons'] })
      toast.success(`Entered dungeon: ${data.dungeonName}`)
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to enter dungeon')
    },
  })
}

export function useAbandonDungeon() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: abandonDungeon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dungeons'] })
      toast.warning('Dungeon abandoned')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to abandon dungeon')
    },
  })
}

export function getRankColor(rank: DungeonRank): string {
  switch (rank) {
    case 'E':
      return 'text-gray-400'
    case 'D':
      return 'text-green-400'
    case 'C':
      return 'text-blue-400'
    case 'B':
      return 'text-purple-400'
    case 'A':
      return 'text-orange-400'
    case 'S':
      return 'text-red-400'
    default:
      return 'text-system-text'
  }
}

export function getRankBorderColor(rank: DungeonRank): string {
  switch (rank) {
    case 'E':
      return 'border-gray-400/50'
    case 'D':
      return 'border-green-400/50'
    case 'C':
      return 'border-blue-400/50'
    case 'B':
      return 'border-purple-400/50'
    case 'A':
      return 'border-orange-400/50'
    case 'S':
      return 'border-red-400/50'
    default:
      return 'border-system-border'
  }
}
