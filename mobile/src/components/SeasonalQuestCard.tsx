/**
 * SeasonalQuestCard - Seasonal/Weekly quest display for mobile
 * Shows special time-limited quests with progress and rewards
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { api, queryKeys } from '@/lib/api';

interface SeasonalQuest {
  id: string;
  name: string;
  description?: string;
  type: 'weekly' | 'seasonal' | 'event';
  category: string;
  progress: number;
  target: number;
  xpReward: number;
  status: 'ACTIVE' | 'COMPLETED' | 'EXPIRED';
  expiresAt?: string;
  completedAt?: string;
  rewards?: {
    xp: number;
    title?: string;
    badge?: string;
  };
}

interface SeasonalQuestsResponse {
  quests: SeasonalQuest[];
  season?: {
    name: string;
    startDate: string;
    endDate: string;
    daysRemaining: number;
  };
}

interface SeasonalQuestCardProps {
  quest: SeasonalQuest;
  onPress?: (quest: SeasonalQuest) => void;
  compact?: boolean;
}

export function SeasonalQuestCard({ quest, onPress, compact }: SeasonalQuestCardProps) {
  const progressPercent = Math.min(100, (quest.progress / quest.target) * 100);
  const isComplete = quest.status === 'COMPLETED';
  const isExpired = quest.status === 'EXPIRED';

  const getTypeIcon = () => {
    switch (quest.type) {
      case 'weekly':
        return '📅';
      case 'seasonal':
        return '🌟';
      case 'event':
        return '🎯';
      default:
        return '⭐';
    }
  };

  const getTypeColor = () => {
    switch (quest.type) {
      case 'weekly':
        return '#60A5FA';
      case 'seasonal':
        return '#A855F7';
      case 'event':
        return '#FBBF24';
      default:
        return '#4ADE80';
    }
  };

  const typeColor = getTypeColor();

  if (compact) {
    return (
      <Pressable
        onPress={() => onPress?.(quest)}
        style={[styles.compactContainer, isComplete && styles.compactComplete]}
      >
        <Text style={styles.compactIcon}>{getTypeIcon()}</Text>
        <View style={styles.compactContent}>
          <Text style={[styles.compactName, isComplete && styles.textComplete]} numberOfLines={1}>
            {quest.name}
          </Text>
          <View style={styles.compactProgress}>
            <View style={styles.compactProgressBar}>
              <View
                style={[
                  styles.compactProgressFill,
                  { width: `${progressPercent}%`, backgroundColor: isComplete ? '#4ADE80' : typeColor },
                ]}
              />
            </View>
            <Text style={styles.compactProgressText}>
              {quest.progress}/{quest.target}
            </Text>
          </View>
        </View>
        <Text style={[styles.compactXP, isComplete && styles.textComplete]}>+{quest.xpReward}</Text>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={() => onPress?.(quest)}
      style={({ pressed }) => [
        styles.container,
        { borderColor: isComplete ? 'rgba(74, 222, 128, 0.4)' : `${typeColor}33` },
        isExpired && styles.containerExpired,
        pressed && styles.pressed,
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.typeIcon}>{getTypeIcon()}</Text>
          <View style={styles.titleContainer}>
            <Text style={[styles.name, isComplete && styles.textComplete]}>
              {quest.name}
            </Text>
            <View style={[styles.typeBadge, { backgroundColor: `${typeColor}20` }]}>
              <Text style={[styles.typeText, { color: typeColor }]}>
                {quest.type.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.rewardContainer}>
          <Text style={[styles.xpReward, isComplete && styles.textComplete]}>
            +{quest.xpReward}
          </Text>
          <Text style={styles.xpLabel}>XP</Text>
        </View>
      </View>

      {/* Description */}
      {quest.description && (
        <Text style={styles.description} numberOfLines={2}>
          {quest.description}
        </Text>
      )}

      {/* Progress */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${progressPercent}%`,
                backgroundColor: isComplete ? '#4ADE80' : typeColor,
              },
            ]}
          />
        </View>
        <View style={styles.progressLabels}>
          <Text style={styles.progressText}>
            {quest.progress} / {quest.target}
          </Text>
          {quest.expiresAt && !isComplete && !isExpired && (
            <Text style={styles.expiresText}>
              Expires: {new Date(quest.expiresAt).toLocaleDateString()}
            </Text>
          )}
        </View>
      </View>

      {/* Status Badge */}
      {(isComplete || isExpired) && (
        <View style={[styles.statusBadge, isComplete ? styles.completeBadge : styles.expiredBadge]}>
          <Ionicons
            name={isComplete ? 'checkmark-circle' : 'close-circle'}
            size={14}
            color={isComplete ? '#4ADE80' : '#EF4444'}
          />
          <Text style={[styles.statusText, isComplete ? styles.completeText : styles.expiredText]}>
            {isComplete ? 'COMPLETED' : 'EXPIRED'}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

/**
 * Section component that fetches and displays all seasonal quests
 */
export function SeasonalQuestSection() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['seasonalQuests'],
    queryFn: async () => {
      const response = await api.get<SeasonalQuestsResponse>('/api/quests/seasonal');
      return response;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#A855F7" />
        <Text style={styles.loadingText}>Loading seasonal objectives...</Text>
      </View>
    );
  }

  if (error || !data?.quests.length) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🌙</Text>
        <Text style={styles.emptyText}>No seasonal quests active</Text>
        <Text style={styles.emptySubtext}>Check back for special events</Text>
      </View>
    );
  }

  const activeQuests = data.quests.filter((q) => q.status !== 'EXPIRED');

  return (
    <View style={styles.sectionContainer}>
      {data.season && (
        <View style={styles.seasonHeader}>
          <Text style={styles.seasonName}>{data.season.name}</Text>
          <Text style={styles.seasonDays}>{data.season.daysRemaining} days remaining</Text>
        </View>
      )}
      {activeQuests.map((quest) => (
        <SeasonalQuestCard key={quest.id} quest={quest} compact />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    marginVertical: 6,
  },
  containerExpired: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    gap: 10,
  },
  typeIcon: {
    fontSize: 22,
  },
  titleContainer: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#E2E8F0',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  textComplete: {
    color: '#4ADE80',
  },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeText: {
    fontSize: 9,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  rewardContainer: {
    alignItems: 'flex-end',
  },
  xpReward: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FBBF24',
    fontFamily: 'monospace',
  },
  xpLabel: {
    fontSize: 10,
    color: '#64748B',
    fontFamily: 'monospace',
  },
  description: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 12,
    lineHeight: 18,
  },
  progressContainer: {
    marginBottom: 4,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressText: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: 'monospace',
  },
  expiresText: {
    fontSize: 10,
    color: '#FBBF24',
    fontFamily: 'monospace',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 6,
    borderRadius: 4,
    marginTop: 8,
  },
  completeBadge: {
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
  },
  expiredBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  completeText: {
    color: '#4ADE80',
  },
  expiredText: {
    color: '#EF4444',
  },

  // Compact styles
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
    padding: 10,
    marginVertical: 4,
    gap: 10,
  },
  compactComplete: {
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
  },
  compactIcon: {
    fontSize: 16,
  },
  compactContent: {
    flex: 1,
  },
  compactName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#E2E8F0',
    marginBottom: 4,
  },
  compactProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  compactProgressBar: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  compactProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  compactProgressText: {
    fontSize: 10,
    color: '#64748B',
    fontFamily: 'monospace',
    minWidth: 35,
    textAlign: 'right',
  },
  compactXP: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FBBF24',
    fontFamily: 'monospace',
  },

  // Section styles
  sectionContainer: {
    marginTop: 8,
  },
  seasonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  seasonName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#A855F7',
    fontFamily: 'monospace',
  },
  seasonDays: {
    fontSize: 10,
    color: '#64748B',
    fontFamily: 'monospace',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'monospace',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 20,
  },
  emptyIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'monospace',
  },
  emptySubtext: {
    fontSize: 10,
    color: '#475569',
    fontFamily: 'monospace',
    marginTop: 4,
  },
});
