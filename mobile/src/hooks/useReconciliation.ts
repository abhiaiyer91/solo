/**
 * useReconciliation - Hook for day reconciliation functionality
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../stores/auth';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

export interface ReconciliationItem {
  questId: string;
  questName: string;
  type: 'numeric' | 'boolean';
  category: string;
  currentValue: number | null;
  targetValue: number;
  metric: string;
  isComplete: boolean;
}

export interface DayStatus {
  phase: 'morning' | 'afternoon' | 'evening' | 'night';
  isReconciliationTime: boolean;
  isClosed: boolean;
  minutesToMidnight: number;
  pendingItems: ReconciliationItem[];
  completedToday: number;
  totalToday: number;
}

export interface DaySummary {
  questsCompleted: number;
  questsTotal: number;
  xpEarned: number;
  streakMaintained: boolean;
  currentStreak: number;
  perfectDay: boolean;
}

/**
 * Hook for reconciliation data and actions
 */
export function useReconciliation() {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  // Fetch day status
  const dayStatusQuery = useQuery<DayStatus>({
    queryKey: ['dayStatus'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/day/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch day status');
      return res.json();
    },
    enabled: !!token,
    refetchInterval: 60000, // Refresh every minute
  });

  // Submit reconciliation for a quest
  const submitMutation = useMutation({
    mutationFn: async ({
      questId,
      data,
    }: {
      questId: string;
      data: Record<string, number | boolean>;
    }) => {
      const res = await fetch(`${API_URL}/api/day/reconciliation/${questId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ data }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to submit reconciliation');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dayStatus'] });
      queryClient.invalidateQueries({ queryKey: ['quests'] });
      queryClient.invalidateQueries({ queryKey: ['player'] });
    },
  });

  // Close the day
  const closeDayMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_URL}/api/day/close`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to close day');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dayStatus'] });
      queryClient.invalidateQueries({ queryKey: ['quests'] });
      queryClient.invalidateQueries({ queryKey: ['player'] });
    },
  });

  // Helper to check if it's reconciliation time
  const isReconciliationTime = dayStatusQuery.data?.isReconciliationTime ?? false;
  const phase = dayStatusQuery.data?.phase ?? 'morning';
  const pendingItems = dayStatusQuery.data?.pendingItems ?? [];
  const minutesToMidnight = dayStatusQuery.data?.minutesToMidnight ?? 0;
  const isClosed = dayStatusQuery.data?.isClosed ?? false;

  return {
    // Data
    dayStatus: dayStatusQuery.data,
    isReconciliationTime,
    phase,
    pendingItems,
    minutesToMidnight,
    isClosed,
    isLoading: dayStatusQuery.isLoading,
    error: dayStatusQuery.error,

    // Actions
    submitReconciliation: submitMutation.mutate,
    closeDay: closeDayMutation.mutate,
    isSubmitting: submitMutation.isPending,
    isClosing: closeDayMutation.isPending,
    submitError: submitMutation.error,
    closeError: closeDayMutation.error,

    // Refetch
    refetch: dayStatusQuery.refetch,
  };
}

/**
 * Format minutes to midnight as a readable string
 */
export function formatTimeToMidnight(minutes: number): string {
  if (minutes <= 0) return 'Midnight';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
}

/**
 * Get phase display name
 */
export function getPhaseDisplay(phase: DayStatus['phase']): string {
  switch (phase) {
    case 'morning':
      return 'Morning';
    case 'afternoon':
      return 'Afternoon';
    case 'evening':
      return 'Evening';
    case 'night':
      return 'Night';
  }
}

export type { DayStatus as DayStatusType };
