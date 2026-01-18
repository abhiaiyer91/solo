import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, queryKeys } from '@/lib/api';

interface Quest {
  id: string;
  title: string;
  description?: string;
  category: string;
  target: number;
  progress: number;
  unit: string;
  xpReward: number;
  completed: boolean;
  completedAt?: string;
}

interface QuestsResponse {
  dailyQuests: Quest[];
  weeklyQuests?: Quest[];
  bonusQuests?: Quest[];
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
      const response = await api.get<QuestsResponse>('/api/quests/today');
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
    quests: query.data,
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
