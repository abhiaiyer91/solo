/**
 * useNarrative - Dynamic narrative content hook for mobile
 * Fetches personalized greetings and messages from the narrative system
 */

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useDayStatus, getPhaseGreeting } from './useDayStatus';

interface NarrativeGreetingParams {
  currentStreak: number;
  level: number;
  name: string;
  debuffActive?: boolean;
}

interface NarrativeResponse {
  content: string;
  variant?: 'default' | 'success' | 'warning' | 'critical';
  source?: 'ai' | 'template' | 'fallback';
}

interface SystemMessageResponse {
  message: string;
  type: 'greeting' | 'milestone' | 'warning' | 'motivation';
  variant?: 'default' | 'success' | 'warning';
}

/**
 * Get daily greeting from narrative system
 * Falls back to local phase-based message if API fails
 */
export function useDailyGreeting(params: NarrativeGreetingParams) {
  const { phase } = useDayStatus();
  const { currentStreak, level, name, debuffActive } = params;

  const query = useQuery({
    queryKey: ['narrative', 'greeting', currentStreak, level, phase],
    queryFn: async () => {
      const response = await api.get<NarrativeResponse>('/api/narrative/greeting', {
        headers: {
          'X-Player-Streak': String(currentStreak),
          'X-Player-Level': String(level),
          'X-Player-Phase': phase,
        },
      });
      return response;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: 1,
  });

  // Generate fallback message
  const fallbackContent = getPhaseGreeting(phase, currentStreak, level);

  // If debuff is active, modify the message
  const debuffMessage = debuffActive
    ? `\n\n⚠️ DEBUFF ACTIVE: Stats reduced due to broken streak.`
    : '';

  return {
    content: (query.data?.content ?? fallbackContent) + debuffMessage,
    variant: query.data?.variant ?? (currentStreak >= 7 ? 'success' : 'default'),
    source: query.data?.source ?? 'fallback',
    isLoading: query.isLoading,
    error: query.error,
  };
}

/**
 * Get system message for specific events
 */
export function useSystemMessage(trigger: string) {
  return useQuery({
    queryKey: ['narrative', 'system', trigger],
    queryFn: async () => {
      const response = await api.get<SystemMessageResponse>(`/api/narrative/system/${trigger}`);
      return response;
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
    enabled: !!trigger,
  });
}

/**
 * Get milestone celebration message
 */
export function useMilestoneMessage(milestoneType: string, value: number) {
  return useQuery({
    queryKey: ['narrative', 'milestone', milestoneType, value],
    queryFn: async () => {
      const response = await api.get<NarrativeResponse>(
        `/api/narrative/milestone/${milestoneType}?value=${value}`
      );
      return response;
    },
    enabled: !!milestoneType && value > 0,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

/**
 * Local message generators for offline/fallback use
 */
export function getStreakMessage(streak: number): string {
  if (streak === 0) return 'Start your journey today.';
  if (streak === 1) return 'Day 1 begins. Every journey starts here.';
  if (streak === 7) return '🔥 ONE WEEK. The first milestone conquered.';
  if (streak === 30) return '🏆 30 DAYS. You are becoming unstoppable.';
  if (streak === 100) return '💎 100 DAYS. Legendary status achieved.';
  if (streak >= 365) return '👑 YEAR-LONG WARRIOR. You have transcended.';
  if (streak >= 50 && streak % 50 === 0) return `🌟 ${streak} DAYS. Another milestone secured.`;
  if (streak >= 14) return `Day ${streak}. The pattern solidifies.`;
  return `Day ${streak}. Consistency logged.`;
}

export function getLevelUpMessage(newLevel: number): string {
  if (newLevel === 10) return 'LEVEL 10: Apprentice no more.';
  if (newLevel === 25) return 'LEVEL 25: Seasoned warrior status.';
  if (newLevel === 50) return 'LEVEL 50: Half-century of growth.';
  if (newLevel === 100) return 'LEVEL 100: MAXIMUM POWER ACHIEVED.';
  return `LEVEL ${newLevel}: Power increases.`;
}

export function getQuestCompleteMessage(questName: string, xpAwarded: number): string {
  const messages = [
    `${questName} complete. +${xpAwarded} XP logged.`,
    `Objective achieved. The System records +${xpAwarded} XP.`,
    `Quest logged. ${xpAwarded} XP added to your total.`,
    `Task complete. Progress recorded: +${xpAwarded} XP.`,
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}
