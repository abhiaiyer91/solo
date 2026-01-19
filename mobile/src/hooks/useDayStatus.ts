/**
 * useDayStatus - Day phase awareness hook for mobile
 * Provides time-of-day context, phase styling, and reconciliation status
 */

import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api, queryKeys } from '@/lib/api';

export type DayPhase = 'morning' | 'midday' | 'afternoon' | 'evening' | 'night' | 'closed';

interface DayStatusResponse {
  phase: DayPhase;
  currentHour: number;
  isDayClosed: boolean;
  timeUntilMidnight?: number;
  shouldShowReconciliation: boolean;
  reconciliationTime: string;
}

interface ReconciliationItem {
  id: string;
  questId: string;
  name: string;
  type: 'unconfirmed' | 'partial';
  currentValue: number;
  targetValue: number;
  baseXP: number;
}

interface ReconciliationResponse {
  items: ReconciliationItem[];
  count: number;
}

interface PhaseStyle {
  bgColor: string;
  accentColor: string;
  textColor: string;
  mutedColor: string;
  borderColor: string;
  icon: string;
  label: string;
}

/**
 * Get current day phase based on hour
 */
export function getCurrentPhase(): DayPhase {
  const hour = new Date().getHours();
  if (hour >= 23 || hour < 6) return 'night';
  if (hour < 12) return 'morning';
  if (hour < 14) return 'midday';
  if (hour < 17) return 'afternoon';
  if (hour < 21) return 'evening';
  return 'night';
}

/**
 * Get phase-specific styles for UI theming
 */
export function getPhaseStyles(phase: DayPhase): PhaseStyle {
  switch (phase) {
    case 'morning':
      return {
        bgColor: 'rgba(251, 191, 36, 0.05)',
        accentColor: '#FBBF24',
        textColor: '#FDE68A',
        mutedColor: '#92400E',
        borderColor: 'rgba(251, 191, 36, 0.2)',
        icon: '☀️',
        label: 'MORNING',
      };
    case 'midday':
      return {
        bgColor: 'rgba(96, 165, 250, 0.05)',
        accentColor: '#60A5FA',
        textColor: '#BFDBFE',
        mutedColor: '#1E40AF',
        borderColor: 'rgba(96, 165, 250, 0.2)',
        icon: '🌤️',
        label: 'MIDDAY',
      };
    case 'afternoon':
      return {
        bgColor: 'rgba(74, 222, 128, 0.05)',
        accentColor: '#4ADE80',
        textColor: '#BBF7D0',
        mutedColor: '#166534',
        borderColor: 'rgba(74, 222, 128, 0.2)',
        icon: '⛅',
        label: 'AFTERNOON',
      };
    case 'evening':
      return {
        bgColor: 'rgba(168, 85, 247, 0.08)',
        accentColor: '#A855F7',
        textColor: '#DDD6FE',
        mutedColor: '#6B21A8',
        borderColor: 'rgba(168, 85, 247, 0.3)',
        icon: '🌅',
        label: 'EVENING',
      };
    case 'night':
    case 'closed':
      return {
        bgColor: 'rgba(30, 41, 59, 0.5)',
        accentColor: '#64748B',
        textColor: '#94A3B8',
        mutedColor: '#475569',
        borderColor: 'rgba(100, 116, 139, 0.2)',
        icon: phase === 'closed' ? '🌙' : '🌃',
        label: phase === 'closed' ? 'DAY CLOSED' : 'NIGHT',
      };
    default:
      return {
        bgColor: 'rgba(96, 165, 250, 0.05)',
        accentColor: '#60A5FA',
        textColor: '#E2E8F0',
        mutedColor: '#64748B',
        borderColor: 'rgba(96, 165, 250, 0.2)',
        icon: '📍',
        label: 'NOW',
      };
  }
}

/**
 * Hook to get current day status from API or fallback to local calculation
 */
export function useDayStatus() {
  const [localPhase, setLocalPhase] = useState<DayPhase>(getCurrentPhase());

  // Update local phase every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setLocalPhase(getCurrentPhase());
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const query = useQuery({
    queryKey: ['dayStatus'],
    queryFn: async () => {
      const response = await api.get<DayStatusResponse>('/api/player/day-status');
      return response;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });

  // Use API response if available, otherwise fallback to local calculation
  const phase = query.data?.phase ?? localPhase;
  const phaseStyles = useMemo(() => getPhaseStyles(phase), [phase]);

  return {
    phase,
    phaseStyles,
    isDayClosed: query.data?.isDayClosed ?? false,
    timeUntilMidnight: query.data?.timeUntilMidnight,
    shouldShowReconciliation: query.data?.shouldShowReconciliation ?? (phase === 'evening' || phase === 'night'),
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Hook to get reconciliation items for day-end confirmation
 */
export function useReconciliationItems() {
  return useQuery({
    queryKey: ['reconciliation'],
    queryFn: async () => {
      const response = await api.get<ReconciliationResponse>('/api/quests/reconciliation');
      return response;
    },
    staleTime: 1000 * 30, // 30 seconds
  });
}

/**
 * Get greeting message based on phase and stats
 */
export function getPhaseGreeting(phase: DayPhase, streak: number, level: number): string {
  switch (phase) {
    case 'morning':
      if (streak >= 7) {
        return `Day ${streak} begins.\nThe System recognizes your persistence.\nMaintain the pattern.`;
      }
      return `A new day of growth awaits.\nYour objectives have been generated.\nBegin when ready.`;

    case 'midday':
      return `Training continues.\nMonitor your progress.\nThe System observes.`;

    case 'afternoon':
      return `Afternoon phase active.\nTime for sustained effort.\nStay focused.`;

    case 'evening':
      if (streak > 0) {
        return `Day winding down.\n${streak}-day streak at stake.\nConfirm your progress before midnight.`;
      }
      return `Evening approaches.\nTime remaining is limited.\nComplete remaining objectives.`;

    case 'night':
      return `Night mode active.\nReconcile your day.\nPrepare for tomorrow.`;

    case 'closed':
      return `Day is sealed.\nRest now, Hunter.\nTomorrow awaits.`;

    default:
      return `Level ${level} Hunter.\nDaily objectives await.\nThe System does not wait.`;
  }
}
