import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api, queryKeys } from '@/lib/api';

interface PlayerStats {
  strength: number;
  agility: number;
  vitality: number;
  discipline: number;
}

interface Player {
  id: string;
  name: string;
  email: string;
  level: number;
  rank: string;
  currentXP: number;
  totalXP: number;
  xpToNextLevel: number;
  xpProgress: number; // 0-100 percentage
  currentStreak: number;
  longestStreak: number;
  timezone?: string;
  activeTitle?: string;
  stats: PlayerStats;
}

interface PlayerResponse {
  player: Player;
}

export function usePlayer() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.player(),
    queryFn: async () => {
      const response = await api.get<PlayerResponse>('/api/player');
      return response.player;
    },
    staleTime: 1000 * 60, // 1 minute
  });

  return {
    player: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    invalidate: () => queryClient.invalidateQueries({ queryKey: queryKeys.player() }),
  };
}
