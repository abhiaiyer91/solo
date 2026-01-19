/**
 * useQuestTemplates - Hook for fetching and managing quest templates
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export type QuestCategory = 'MOVEMENT' | 'TRAINING' | 'RECOVERY' | 'MINDSET' | 'NUTRITION'
export type QuestType = 'DAILY' | 'WEEKLY' | 'ROTATING' | 'BONUS' | 'DUNGEON' | 'BOSS'

export interface QuestRequirement {
  type: 'numeric' | 'boolean' | 'time'
  metric?: string
  operator?: 'gte' | 'lte' | 'eq'
  value?: number
}

export interface QuestTemplate {
  id: string
  name: string
  description: string
  type: QuestType
  category: QuestCategory
  baseXP: number
  statType: 'STR' | 'AGI' | 'VIT' | 'DISC'
  statBonus: number
  isCore: boolean
  isActive?: boolean
  requirement?: QuestRequirement
  allowPartial?: boolean
  minPartialPercent?: number
}

interface QuestTemplatesResponse {
  core: QuestTemplate[]
  bonus: QuestTemplate[]
  weekly: QuestTemplate[]
  special: QuestTemplate[]
}

async function fetchQuestTemplates(): Promise<QuestTemplatesResponse> {
  return api.get<QuestTemplatesResponse>('/api/quests/templates')
}

async function toggleQuestActive(params: { templateId: string; isActive: boolean }): Promise<void> {
  await api.post('/api/quests/templates/toggle', params)
}

export function useQuestTemplates() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['quest-templates'],
    queryFn: fetchQuestTemplates,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const toggleMutation = useMutation({
    mutationFn: toggleQuestActive,
    onMutate: async (params) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['quest-templates'] })
      
      const previous = queryClient.getQueryData<QuestTemplatesResponse>(['quest-templates'])
      
      if (previous) {
        const updated = { ...previous }
        // Update the bonus quest
        updated.bonus = updated.bonus.map((q) =>
          q.id === params.templateId ? { ...q, isActive: params.isActive } : q
        )
        queryClient.setQueryData(['quest-templates'], updated)
      }

      return { previous }
    },
    onError: (_, __, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['quest-templates'], context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['quest-templates'] })
      queryClient.invalidateQueries({ queryKey: ['quests'] })
    },
  })

  // Activate/deactivate functions for individual quests
  const activateQuest = (templateId: string, options?: { onSuccess?: () => void; onError?: () => void }) => {
    toggleMutation.mutate(
      { templateId, isActive: true },
      {
        onSuccess: options?.onSuccess,
        onError: options?.onError,
      }
    )
  }

  const deactivateQuest = (templateId: string, options?: { onSuccess?: () => void; onError?: () => void }) => {
    toggleMutation.mutate(
      { templateId, isActive: false },
      {
        onSuccess: options?.onSuccess,
        onError: options?.onError,
      }
    )
  }

  return {
    coreQuests: query.data?.core ?? [],
    bonusQuests: query.data?.bonus ?? [],
    bonusDaily: query.data?.bonus ?? [], // Alias for compatibility
    weeklyQuests: query.data?.weekly ?? [],
    specialQuests: query.data?.special ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    toggleQuest: toggleMutation.mutate,
    activateQuest,
    deactivateQuest,
    activatingId: toggleMutation.isPending && toggleMutation.variables?.isActive ? toggleMutation.variables.templateId : undefined,
    deactivatingId: toggleMutation.isPending && !toggleMutation.variables?.isActive ? toggleMutation.variables.templateId : undefined,
    isToggling: toggleMutation.isPending,
  }
}

/**
 * Hook for bonus quest management
 */
export function useBonusQuests() {
  const { bonusQuests, toggleQuest, isToggling } = useQuestTemplates()
  
  const activeQuests = bonusQuests.filter((q) => q.isActive !== false)
  const inactiveQuests = bonusQuests.filter((q) => q.isActive === false)

  return {
    activeQuests,
    inactiveQuests,
    allQuests: bonusQuests,
    toggleQuest,
    isToggling,
  }
}
