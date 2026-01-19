import { useQuery, useQueryClient, useQueries } from '@tanstack/react-query';
import { api, queryKeys } from '@/lib/api';

interface TitleResponse {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  unlockedAt: string;
}

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
  perfectDays?: number;
  titlesCount?: number;
  timezone?: string;
  activeTitle?: string;
  debuffActive: boolean;
  debuffActiveUntil?: string | null;
  stats: PlayerStats;
  onboardingCompleted: boolean;
}

// Server returns player data directly (not wrapped)
interface PlayerResponse {
  id: string;
  name: string;
  email: string;
  level: number;
  totalXP: number;
  currentStreak: number;
  longestStreak: number;
  perfectStreak?: number;
  timezone?: string;
  debuffActive?: boolean;
  debuffActiveUntil?: string | null;
  weekendBonusActive?: boolean;
  weekendBonusPercent?: number;
  onboardingCompleted?: boolean;
  // Stats come as individual fields from server
  str?: number;
  agi?: number;
  vit?: number;
  disc?: number;
}

// XP required for each level (cumulative formula)
function getXPForLevel(level: number): number {
  // Base 100 XP, increases by 50 each level
  return 100 + (level - 1) * 50;
}

function calculateXPProgress(level: number, totalXP: number) {
  // Calculate total XP needed to reach current level
  let xpForPreviousLevels = 0;
  for (let i = 1; i < level; i++) {
    xpForPreviousLevels += getXPForLevel(i);
  }

  const xpToNextLevel = getXPForLevel(level);
  const currentXP = totalXP - xpForPreviousLevels;
  const xpProgress = Math.min(100, Math.round((currentXP / xpToNextLevel) * 100));

  return { currentXP: Math.max(0, currentXP), xpToNextLevel, xpProgress };
}

function getRankForLevel(level: number): string {
  if (level >= 50) return 'S';
  if (level >= 40) return 'A';
  if (level >= 30) return 'B';
  if (level >= 20) return 'C';
  if (level >= 10) return 'D';
  return 'E';
}

export function usePlayer() {
  const queryClient = useQueryClient();

  // Fetch player data and titles in parallel
  const results = useQueries({
    queries: [
      {
        queryKey: queryKeys.player(),
        queryFn: async () => api.get<PlayerResponse>('/api/player'),
        staleTime: 1000 * 60, // 1 minute
      },
      {
        queryKey: queryKeys.playerTitles(),
        queryFn: async () => {
          try {
            const titles = await api.get<TitleResponse[]>('/api/player/titles');
            return titles;
          } catch {
            // Titles endpoint may not exist yet, return empty
            return [] as TitleResponse[];
          }
        },
        staleTime: 1000 * 60 * 5, // 5 minutes (titles change rarely)
      },
    ],
  });

  const [playerResult, titlesResult] = results;
  const isLoading = playerResult.isLoading || titlesResult.isLoading;
  const isError = playerResult.isError;
  const error = playerResult.error;

  // Combine player data with active title
  const player = playerResult.data
    ? (() => {
        const response = playerResult.data;
        const titles = titlesResult.data ?? [];
        const activeTitle = titles.find((t) => t.isActive)?.name;

        const { currentXP, xpToNextLevel, xpProgress } = calculateXPProgress(
          response.level ?? 1,
          response.totalXP ?? 0
        );

        return {
          id: response.id,
          name: response.name,
          email: response.email,
          level: response.level ?? 1,
          rank: getRankForLevel(response.level ?? 1),
          totalXP: response.totalXP ?? 0,
          currentXP,
          xpToNextLevel,
          xpProgress,
          currentStreak: response.currentStreak ?? 0,
          longestStreak: response.longestStreak ?? 0,
          timezone: response.timezone,
          activeTitle,
          debuffActive: response.debuffActive ?? false,
          debuffActiveUntil: response.debuffActiveUntil,
          stats: {
            strength: response.str ?? 10,
            agility: response.agi ?? 10,
            vitality: response.vit ?? 10,
            discipline: response.disc ?? 10,
          },
          onboardingCompleted: response.onboardingCompleted ?? false,
        } as Player;
      })()
    : undefined;

  const refetch = async () => {
    await Promise.all([playerResult.refetch(), titlesResult.refetch()]);
  };

  return {
    player,
    isLoading,
    isError,
    error,
    refetch,
    invalidate: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.player() });
      queryClient.invalidateQueries({ queryKey: queryKeys.playerTitles() });
    },
  };
}
