import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, queryKeys } from '@/lib/api';

interface Quest {
  id: string;
  templateId: string;
  name: string;
  description?: string;
  type: string;
  category: string;
  requirement: unknown;
  baseXP: number;
  statType?: string;
  statBonus?: number;
  allowPartial?: boolean;
  minPartialPercent?: number;
  isCore: boolean;
  status: 'ACTIVE' | 'COMPLETED' | 'FAILED';
  currentValue: number;
  targetValue: number;
  completionPercent: number;
  completedAt?: string;
  xpAwarded?: number;
  questDate: string;
}

export type { Quest };

interface QuestsResponse {
  quests: Quest[];
  coreQuests: Quest[];
  rotatingQuest?: Quest;
  rotatingUnlockStatus?: {
    unlocked: boolean;
    currentStreak: number;
    requiredStreak: number;
    daysUntilUnlock: number;
  };
  date: string;
}

interface CompleteQuestResponse {
  success: boolean;
  xpAwarded: number;
  quest: Quest;
}

export function useQuests() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.questsToday(),
    queryFn: async () => {
      const response = await api.get<QuestsResponse>('/api/quests');
      return response;
    },
    staleTime: 1000 * 30, // 30 seconds
  });

  const completeQuestMutation = useMutation({
    mutationFn: async ({ questId, value }: { questId: string; value?: number }) => {
      return api.post<CompleteQuestResponse>(`/api/quests/${questId}/complete`, { value });
    },
    onSuccess: () => {
      // Invalidate both quests and player to update XP
      queryClient.invalidateQueries({ queryKey: queryKeys.quests() });
      queryClient.invalidateQueries({ queryKey: queryKeys.player() });
    },
  });

  const updateProgressMutation = useMutation({
    mutationFn: async ({ questId, progress }: { questId: string; progress: number }) => {
      return api.patch<Quest>(`/api/quests/${questId}/progress`, { progress });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.quests() });
    },
  });

  return {
    // Raw response data
    quests: query.data,
    // Convenience accessors matching UI expectations
    dailyQuests: query.data?.quests ?? [],
    coreQuests: query.data?.coreQuests ?? [],
    rotatingQuest: query.data?.rotatingQuest,
    rotatingUnlockStatus: query.data?.rotatingUnlockStatus,

    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,

    completeQuest: completeQuestMutation.mutate,
    isCompleting: completeQuestMutation.isPending,

    updateProgress: updateProgressMutation.mutate,
    isUpdating: updateProgressMutation.isPending,
  };
}
