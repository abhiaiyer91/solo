import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/components/ui/toast'

export interface Quest {
  id: string
  templateId: string
  name: string
  description: string
  type: 'DAILY' | 'WEEKLY' | 'DUNGEON' | 'BOSS'
  category: 'MOVEMENT' | 'STRENGTH' | 'RECOVERY' | 'NUTRITION' | 'DISCIPLINE'
  requirement: unknown
  baseXP: number
  statType: 'STR' | 'AGI' | 'VIT' | 'DISC'
  statBonus: number
  allowPartial: boolean
  minPartialPercent: number | null
  isCore: boolean
  status: 'ACTIVE' | 'COMPLETED' | 'FAILED' | 'EXPIRED'
  currentValue: number | null
  targetValue: number
  completionPercent: number | null
  completedAt: string | null
  xpAwarded: number | null
  questDate: string
}

export interface QuestsResponse {
  quests: Quest[]
  date: string
}

export interface CompleteQuestResult {
  quest: Quest
  xpAwarded: number
  leveledUp: boolean
  newLevel?: number
  message: string
}

export interface WeeklyQuest {
  id: string
  templateId: string
  name: string
  description: string
  category: string
  baseXP: number
  statType: 'STR' | 'AGI' | 'VIT' | 'DISC'
  statBonus: number
  currentValue: number
  targetValue: number
  completionPercent: number
  isCompleted: boolean
  weekStart: string
  weekEnd: string
}

export interface WeeklyQuestsResponse {
  quests: WeeklyQuest[]
  weekStart: string | null
  weekEnd: string | null
}

async function fetchQuests(): Promise<QuestsResponse> {
  const res = await fetch('/api/quests', {
    credentials: 'include',
  })

  if (!res.ok) {
    throw new Error('Failed to fetch quests')
  }

  return res.json()
}

async function fetchQuest(questId: string): Promise<Quest> {
  const res = await fetch(`/api/quests/${questId}`, {
    credentials: 'include',
  })

  if (!res.ok) {
    throw new Error('Failed to fetch quest')
  }

  return res.json()
}

async function completeQuest(
  questId: string,
  data: Record<string, number | boolean>
): Promise<CompleteQuestResult> {
  const res = await fetch(`/api/quests/${questId}/complete`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ data }),
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || 'Failed to complete quest')
  }

  return res.json()
}

export interface ResetQuestResult {
  quest: Quest
  xpRemoved: number
  message: string
}

export interface RemoveQuestResult {
  removed: boolean
  message: string
}

async function resetQuestApi(questId: string): Promise<ResetQuestResult> {
  const res = await fetch(`/api/quests/${questId}/reset`, {
    method: 'POST',
    credentials: 'include',
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || 'Failed to reset quest')
  }

  return res.json()
}

async function removeQuestApi(questId: string): Promise<RemoveQuestResult> {
  const res = await fetch(`/api/quests/${questId}`, {
    method: 'DELETE',
    credentials: 'include',
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || 'Failed to remove quest')
  }

  return res.json()
}

async function fetchWeeklyQuests(): Promise<WeeklyQuestsResponse> {
  const res = await fetch('/api/quests/weekly', {
    credentials: 'include',
  })

  if (!res.ok) {
    throw new Error('Failed to fetch weekly quests')
  }

  return res.json()
}

export function useQuests() {
  return useQuery({
    queryKey: ['quests'],
    queryFn: fetchQuests,
    staleTime: 1000 * 60, // 1 minute
  })
}

export function useQuest(questId: string) {
  return useQuery({
    queryKey: ['quests', questId],
    queryFn: () => fetchQuest(questId),
    enabled: !!questId,
  })
}

export function useCompleteQuest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ questId, data }: { questId: string; data: Record<string, number | boolean> }) =>
      completeQuest(questId, data),
    onSuccess: (result) => {
      // Show toast notifications
      if (result.xpAwarded > 0) {
        toast.xp(result.xpAwarded, result.quest.name)
      }
      if (result.leveledUp && result.newLevel) {
        toast.levelUp(result.newLevel)
      }
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['quests'] })
      queryClient.invalidateQueries({ queryKey: ['player'] })
    },
    onError: (error) => {
      toast.error('Quest completion failed', {
        description: error instanceof Error ? error.message : 'The System will retry.',
      })
    },
  })
}

export function useResetQuest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (questId: string) => resetQuestApi(questId),
    onSuccess: (result) => {
      if (result.xpRemoved > 0) {
        toast.warning(`-${result.xpRemoved} XP`, {
          description: 'Quest reset. Progress reverted.',
        })
      }
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['quests'] })
      queryClient.invalidateQueries({ queryKey: ['player'] })
    },
    onError: (error) => {
      toast.error('Quest reset failed', {
        description: error instanceof Error ? error.message : 'Try again.',
      })
    },
  })
}

export function useRemoveQuest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (questId: string) => removeQuestApi(questId),
    onSuccess: () => {
      toast.success('Quest removed', {
        description: 'Quest has been removed from your active log.',
      })
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['quests'] })
      queryClient.invalidateQueries({ queryKey: ['quest-templates'] })
    },
    onError: (error) => {
      toast.error('Failed to remove quest', {
        description: error instanceof Error ? error.message : 'Try again.',
      })
    },
  })
}

export function useWeeklyQuests() {
  return useQuery({
    queryKey: ['quests', 'weekly'],
    queryFn: fetchWeeklyQuests,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
