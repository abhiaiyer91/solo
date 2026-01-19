/**
 * useWeeklySummary hook
 * Fetches and manages weekly summary data for mobile display
 */

import { useQuery } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '@/lib/api';

export interface WeeklySummary {
  weekStart: string;
  weekEnd: string;
  daysCompleted: number;
  totalDays: number;
  coreCompletionRate: number;
  xpEarned: number;
  streakMaintained: boolean;
  currentStreak: number;
  perfectDays: number;
  comparedToLastWeek?: {
    daysChange: number;
    xpChange: number;
    completionChange: number;
  };
  achievements: string[];
  observation: string;
}

export interface WeeklySummaryCheck {
  show: boolean;
  summary: WeeklySummary | null;
}

const STORAGE_KEY = 'weeklySummary:lastDismissed';

/**
 * Get the dismissed week key from AsyncStorage
 */
async function getLastDismissedWeek(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

/**
 * Set the dismissed week key in AsyncStorage
 */
export async function dismissWeeklySummary(weekStart: string): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, weekStart);
  } catch {
    // Ignore storage errors
  }
}

/**
 * Hook to check if weekly summary should be shown (Monday)
 */
export function useWeeklySummaryCheck() {
  return useQuery({
    queryKey: ['weekly-summary-check'],
    queryFn: async (): Promise<WeeklySummaryCheck> => {
      const lastDismissed = await getLastDismissedWeek();

      try {
        const endpoint = lastDismissed
          ? `/api/player/weekly-summary?lastDismissed=${encodeURIComponent(lastDismissed)}`
          : '/api/player/weekly-summary';

        const response = await api.get<WeeklySummaryCheck>(endpoint);
        return response;
      } catch {
        // Return sample data for development
        return generateSampleSummaryCheck();
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to get a specific week's summary
 */
export function useWeeklySummary(weekOffset: number = 1) {
  return useQuery({
    queryKey: ['weekly-summary', weekOffset],
    queryFn: async (): Promise<WeeklySummary> => {
      try {
        const response = await api.get<WeeklySummary>(`/api/player/weekly-summary/${weekOffset}`);
        return response;
      } catch {
        // Return sample data for development
        return generateSampleSummary();
      }
    },
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Hook to get weekly history
 */
export function useWeeklyHistory(weeks: number = 4) {
  return useQuery({
    queryKey: ['weekly-history', weeks],
    queryFn: async (): Promise<{ summaries: WeeklySummary[]; totalWeeks: number }> => {
      try {
        const response = await api.get<{ summaries: WeeklySummary[]; totalWeeks: number }>(
          `/api/player/weekly-history?weeks=${weeks}`
        );
        return response;
      } catch {
        // Return sample data for development
        return {
          summaries: [generateSampleSummary(), generateSampleSummary()],
          totalWeeks: 2,
        };
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Format week range for display
 */
export function formatWeekRange(weekStart: string, weekEnd: string): string {
  const start = new Date(weekStart);
  const end = new Date(weekEnd);

  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  const startStr = start.toLocaleDateString('en-US', options);
  const endStr = end.toLocaleDateString('en-US', options);

  return `${startStr} - ${endStr}`;
}

/**
 * Generate sample summary for development
 */
function generateSampleSummary(): WeeklySummary {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const diff = dayOfWeek === 0 ? 7 : dayOfWeek;

  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - diff - 6);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  return {
    weekStart: weekStart.toISOString().split('T')[0]!,
    weekEnd: weekEnd.toISOString().split('T')[0]!,
    daysCompleted: 5,
    totalDays: 7,
    coreCompletionRate: 72,
    xpEarned: 450,
    streakMaintained: true,
    currentStreak: 12,
    perfectDays: 2,
    comparedToLastWeek: {
      daysChange: 14,
      xpChange: 8,
      completionChange: 5,
    },
    achievements: ['7 Day Streak', 'Early Riser (3 days)'],
    observation: 'Your consistency improved this week. The morning workouts seem to be working.',
  };
}

/**
 * Generate sample check response for development
 */
function generateSampleSummaryCheck(): WeeklySummaryCheck {
  const today = new Date();
  const isMonday = today.getDay() === 1;

  if (isMonday) {
    return {
      show: true,
      summary: generateSampleSummary(),
    };
  }

  return {
    show: false,
    summary: null,
  };
}
