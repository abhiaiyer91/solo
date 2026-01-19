/**
 * Quest Templates Hook
 *
 * Fetches and manages quest templates for activation/deactivation.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, queryKeys } from '@/lib/api';

export type QuestType = 'DAILY' | 'WEEKLY' | 'DUNGEON' | 'BOSS';
export type QuestCategory = 'MOVEMENT' | 'STRENGTH' | 'RECOVERY' | 'NUTRITION' | 'DISCIPLINE';
export type StatType = 'STR' | 'AGI' | 'VIT' | 'DISC';

export interface QuestTemplate {
  id: string;
  name: string;
  description: string;
  type: QuestType;
  category: QuestCategory;
  baseXP: number;
  statType: StatType;
  statBonus: number;
  isCore: boolean;
  isActive: boolean;
}

interface QuestTemplatesResponse {
  templates: QuestTemplate[];
}

interface ActivateResponse {
  quest: unknown;
  message: string;
}

interface DeactivateResponse {
  deactivated: boolean;
  message: string;
}

export function useQuestTemplates() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['quest-templates'],
    queryFn: async () => {
      try {
        const response = await api.get<QuestTemplatesResponse>('/api/quests/templates');
        return response.templates ?? [];
      } catch {
        // Return sample data for development
        return generateSampleTemplates();
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const activateMutation = useMutation({
    mutationFn: async (templateId: string) => {
      return api.post<ActivateResponse>(`/api/quests/activate/${templateId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quest-templates'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.quests() });
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: async (templateId: string) => {
      return api.post<DeactivateResponse>(`/api/quests/deactivate/${templateId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quest-templates'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.quests() });
    },
  });

  const templates = query.data ?? [];

  // Group by type
  const coreQuests = templates.filter((t) => t.isCore);
  const bonusDaily = templates.filter((t) => t.type === 'DAILY' && !t.isCore);
  const weeklyQuests = templates.filter((t) => t.type === 'WEEKLY');
  const specialQuests = templates.filter((t) => !['DAILY', 'WEEKLY'].includes(t.type));

  return {
    templates,
    coreQuests,
    bonusDaily,
    weeklyQuests,
    specialQuests,

    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,

    activateQuest: activateMutation.mutate,
    isActivating: activateMutation.isPending,
    activatingId: activateMutation.variables,

    deactivateQuest: deactivateMutation.mutate,
    isDeactivating: deactivateMutation.isPending,
    deactivatingId: deactivateMutation.variables,
  };
}

/**
 * Generate sample template data for development
 */
function generateSampleTemplates(): QuestTemplate[] {
  return [
    // Core quests
    {
      id: 'core-steps',
      name: 'Walk 10,000 Steps',
      description: 'Track your daily steps to build endurance.',
      type: 'DAILY',
      category: 'MOVEMENT',
      baseXP: 50,
      statType: 'AGI',
      statBonus: 1,
      isCore: true,
      isActive: true,
    },
    {
      id: 'core-workout',
      name: 'Complete a Workout',
      description: 'Any physical exercise counts towards your strength.',
      type: 'DAILY',
      category: 'STRENGTH',
      baseXP: 75,
      statType: 'STR',
      statBonus: 1,
      isCore: true,
      isActive: true,
    },
    {
      id: 'core-sleep',
      name: 'Get 7+ Hours of Sleep',
      description: 'Rest is essential for recovery and growth.',
      type: 'DAILY',
      category: 'RECOVERY',
      baseXP: 50,
      statType: 'VIT',
      statBonus: 1,
      isCore: true,
      isActive: true,
    },

    // Bonus daily
    {
      id: 'bonus-meditation',
      name: '10 Min Meditation',
      description: 'Clear your mind and build mental discipline.',
      type: 'DAILY',
      category: 'DISCIPLINE',
      baseXP: 40,
      statType: 'DISC',
      statBonus: 1,
      isCore: false,
      isActive: false,
    },
    {
      id: 'bonus-hydration',
      name: 'Drink 8 Glasses of Water',
      description: 'Stay hydrated to maintain peak performance.',
      type: 'DAILY',
      category: 'NUTRITION',
      baseXP: 30,
      statType: 'VIT',
      statBonus: 1,
      isCore: false,
      isActive: true,
    },
    {
      id: 'bonus-stretch',
      name: 'Morning Stretch Routine',
      description: 'Increase flexibility and prevent injuries.',
      type: 'DAILY',
      category: 'RECOVERY',
      baseXP: 25,
      statType: 'AGI',
      statBonus: 1,
      isCore: false,
      isActive: false,
    },

    // Weekly
    {
      id: 'weekly-consistency',
      name: 'Weekly Consistency',
      description: 'Complete all core quests for 5 days this week.',
      type: 'WEEKLY',
      category: 'DISCIPLINE',
      baseXP: 200,
      statType: 'DISC',
      statBonus: 3,
      isCore: false,
      isActive: true,
    },
    {
      id: 'weekly-steps',
      name: 'Weekly Steps Challenge',
      description: 'Accumulate 70,000 steps over the week.',
      type: 'WEEKLY',
      category: 'MOVEMENT',
      baseXP: 150,
      statType: 'AGI',
      statBonus: 2,
      isCore: false,
      isActive: true,
    },

    // Special
    {
      id: 'dungeon-fasting',
      name: 'Intermittent Fasting',
      description: 'Complete a 16-hour fasting window.',
      type: 'DUNGEON',
      category: 'DISCIPLINE',
      baseXP: 100,
      statType: 'DISC',
      statBonus: 2,
      isCore: false,
      isActive: false,
    },
  ];
}
