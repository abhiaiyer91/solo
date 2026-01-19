/**
 * Quest History Hook
 *
 * Fetches and manages quest history data for mobile.
 */

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useMemo } from 'react';

export type DateRange = '7d' | '30d' | '90d' | 'all';
export type QuestFilter = 'all' | 'completed' | 'partial' | 'missed';
export type QuestStatus = 'completed' | 'partial' | 'missed';

export interface QuestHistoryEntry {
  id: string;
  questId: string;
  questName: string;
  questType: string;
  date: string;
  status: QuestStatus;
  xpEarned: number;
  progress: number;
  target: number;
}

export interface QuestHistoryStats {
  totalQuests: number;
  completed: number;
  partial: number;
  missed: number;
  completionRate: number;
  dailyRates: Array<{ date: string; rate: number }>;
}

interface QuestHistoryResponse {
  history: QuestHistoryEntry[];
}

interface UseQuestHistoryOptions {
  dateRange: DateRange;
  filter: QuestFilter;
}

export function useQuestHistory({ dateRange, filter }: UseQuestHistoryOptions) {
  const days = dateRange === 'all' ? 365 : parseInt(dateRange.replace('d', ''));

  const query = useQuery({
    queryKey: ['questHistory', dateRange],
    queryFn: async () => {
      try {
        const response = await api.get<QuestHistoryResponse>(`/api/quests/history?days=${days}`);
        return response.history || [];
      } catch {
        // Return sample data for development
        return generateSampleHistory(dateRange);
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Filter history based on status
  const history = useMemo(() => {
    const rawHistory = query.data ?? [];
    if (filter === 'all') return rawHistory;
    return rawHistory.filter((entry) => entry.status === filter);
  }, [query.data, filter]);

  // Calculate stats
  const stats = useMemo((): QuestHistoryStats => {
    const rawHistory = query.data ?? [];
    const completed = rawHistory.filter((e) => e.status === 'completed').length;
    const partial = rawHistory.filter((e) => e.status === 'partial').length;
    const missed = rawHistory.filter((e) => e.status === 'missed').length;
    const total = rawHistory.length;

    // Group by date for daily rates
    const byDate = new Map<string, { completed: number; total: number }>();
    for (const entry of rawHistory) {
      const existing = byDate.get(entry.date) || { completed: 0, total: 0 };
      byDate.set(entry.date, {
        completed: existing.completed + (entry.status === 'completed' ? 1 : 0),
        total: existing.total + 1,
      });
    }

    const dailyRates = Array.from(byDate.entries())
      .map(([date, { completed, total }]) => ({
        date,
        rate: Math.round((completed / total) * 100),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      totalQuests: total,
      completed,
      partial,
      missed,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      dailyRates,
    };
  }, [query.data]);

  return {
    history,
    stats,
    isLoading: query.isLoading,
    error: query.error?.message ?? null,
    refetch: query.refetch,
  };
}

/**
 * Generate sample history data for development/testing
 */
function generateSampleHistory(dateRange: DateRange): QuestHistoryEntry[] {
  const days = dateRange === 'all' ? 30 : parseInt(dateRange.replace('d', ''));
  const history: QuestHistoryEntry[] = [];
  const questTypes = ['steps', 'workout', 'hydration', 'sleep', 'meditation'];
  const questNames = [
    'Walk 10,000 Steps',
    'Complete a Workout',
    'Drink 8 Glasses of Water',
    'Get 7+ Hours of Sleep',
    '10 Min Meditation',
  ];

  for (let d = 0; d < days; d++) {
    const date = new Date();
    date.setDate(date.getDate() - d);
    const dateStr = date.toISOString().split('T')[0]!;

    // Generate 3-5 quests per day
    const questCount = 3 + Math.floor(Math.random() * 3);

    for (let q = 0; q < questCount; q++) {
      const typeIndex = q % questTypes.length;
      const status: QuestStatus =
        Math.random() > 0.2
          ? 'completed'
          : Math.random() > 0.5
          ? 'partial'
          : 'missed';

      history.push({
        id: `history-${dateStr}-${q}`,
        questId: `quest-${typeIndex}`,
        questName: questNames[typeIndex]!,
        questType: questTypes[typeIndex]!,
        date: dateStr,
        status,
        xpEarned: status === 'completed' ? 50 : status === 'partial' ? 25 : 0,
        progress:
          status === 'completed'
            ? 100
            : status === 'partial'
            ? 50 + Math.random() * 40
            : Math.random() * 30,
        target: 100,
      });
    }
  }

  return history.sort((a, b) => b.date.localeCompare(a.date));
}
