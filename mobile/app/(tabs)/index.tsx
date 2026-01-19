/**
 * Dashboard Screen - Main mobile dashboard
 * Mirrors web dashboard functionality with quest display, stats, XP progress,
 * streak tracking, system messages, and day phase awareness
 */

import { View, Text, ScrollView, RefreshControl, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { useCallback, useState, useEffect, useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

import { SystemWindow } from '@/components/SystemWindow';
import { DashboardHeader } from '@/components/DashboardHeader';
import { QuestList } from '@/components/QuestList';
import { SeasonalQuestSection } from '@/components/SeasonalQuestCard';
import { StreakBadge, StreakProgress } from '@/components/StreakBadge';
import { usePlayer } from '@/hooks/usePlayer';
import { useQuests } from '@/hooks/useQuests';
import { useDayStatus, getPhaseStyles } from '@/hooks/useDayStatus';
import { useDailyGreeting } from '@/hooks/useNarrative';
import { useHealthAuth } from '@/health/hooks/useHealthAuth';
import { syncHealthData } from '@/health/sync';

// Calculate next streak milestone
function getNextMilestone(streak: number): number {
  const milestones = [7, 14, 30, 50, 100, 150, 200, 365];
  return milestones.find((m) => m > streak) ?? streak + 50;
}

export default function DashboardScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  // Data hooks
  const { player, isLoading: playerLoading, refetch: refetchPlayer } = usePlayer();
  const { dailyQuests, rotatingQuest, coreQuests, isLoading: questsLoading, refetch: refetchQuests } = useQuests();
  const { phase, phaseStyles, shouldShowReconciliation, isDayClosed } = useDayStatus();
  const health = useHealthAuth();

  // Narrative greeting
  const { content: greeting, variant: greetingVariant } = useDailyGreeting({
    currentStreak: player?.currentStreak ?? 0,
    level: player?.level ?? 1,
    name: player?.name ?? 'Hunter',
    debuffActive: false, // TODO: get from player data
  });

  // Quest stats
  const allQuests = useMemo(
    () => [...dailyQuests, ...(rotatingQuest ? [rotatingQuest] : [])],
    [dailyQuests, rotatingQuest]
  );
  const completedCount = allQuests.filter((q) => q.status === 'COMPLETED').length;
  const totalCount = allQuests.length;
  const completionPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Request health permissions on mount
  useEffect(() => {
    if (health.isAvailable && health.needsRequest) {
      health.requestAuth();
    }
  }, [health.isAvailable, health.needsRequest]);

  // Sync health data
  const handleHealthSync = useCallback(async () => {
    if (!health.isAvailable) return;
    setSyncing(true);
    try {
      const result = await syncHealthData();
      if (result.success) {
        setLastSync(new Date());
        await refetchQuests();
      }
    } catch (error) {
      console.error('Health sync failed:', error);
    } finally {
      setSyncing(false);
    }
  }, [health.isAvailable, refetchQuests]);

  // Pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (health.isAvailable) {
      await handleHealthSync();
    }
    await Promise.all([refetchPlayer(), refetchQuests()]);
    setRefreshing(false);
  }, [refetchPlayer, refetchQuests, health.isAvailable, handleHealthSync]);

  // Navigation handlers
  const handleProfilePress = () => router.push('/profile');
  const handleStatsPress = () => router.push('/stats');
  const handleStreakPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Could show streak details modal
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: '#0A0A0F' }]}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={phaseStyles.accentColor}
          colors={[phaseStyles.accentColor]}
        />
      }
    >
      {/* Dashboard Header */}
      <DashboardHeader
        player={player}
        isLoading={playerLoading}
        phase={phase}
        phaseStyles={phaseStyles}
        onProfilePress={handleProfilePress}
        onStreakPress={handleStreakPress}
      />

      {/* System Message / Daily Greeting */}
      <SystemWindow
        variant={greetingVariant === 'success' ? 'success' : 'default'}
        style={styles.systemMessage}
      >
        <Text style={[styles.greetingText, { color: phaseStyles.textColor }]}>
          {greeting}
        </Text>
      </SystemWindow>

      {/* Health Sync Status */}
      <Pressable onPress={handleHealthSync} disabled={syncing || !health.isAvailable}>
        <SystemWindow
          variant={health.isAvailable ? 'default' : 'warning'}
          style={styles.healthSync}
        >
          <View style={styles.healthSyncRow}>
            <View style={styles.healthSyncLeft}>
              <Ionicons
                name={health.isAvailable ? 'fitness' : 'fitness-outline'}
                size={18}
                color={health.isAvailable ? '#4ADE80' : '#FBBF24'}
              />
              <View>
                <Text style={styles.healthSyncTitle}>
                  {health.isAvailable ? 'HealthKit Connected' : 'HealthKit Unavailable'}
                </Text>
                <Text style={styles.healthSyncSubtitle}>
                  {syncing
                    ? 'Syncing health data...'
                    : lastSync
                    ? `Last sync: ${lastSync.toLocaleTimeString()}`
                    : 'Pull to refresh or tap to sync'}
                </Text>
              </View>
            </View>
            {health.isAvailable && (
              <Ionicons
                name={syncing ? 'sync' : 'sync-outline'}
                size={18}
                color="#60A5FA"
                style={syncing ? styles.spinIcon : undefined}
              />
            )}
          </View>
        </SystemWindow>
      </Pressable>

      {/* Quest Progress Summary */}
      <View style={styles.progressSummary}>
        <View style={styles.progressHeader}>
          <Text style={styles.sectionTitle}>
            <Text style={{ color: phaseStyles.accentColor }}>{'>'}</Text> DAILY QUESTS
          </Text>
          <Text style={styles.progressPercent}>{completionPercent}%</Text>
        </View>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${completionPercent}%`,
                backgroundColor: completionPercent === 100 ? '#4ADE80' : phaseStyles.accentColor,
              },
            ]}
          />
        </View>
        <Text style={styles.progressSubtext}>
          {completedCount} of {totalCount} objectives complete
        </Text>
      </View>

      {/* Quest List */}
      <View style={styles.questSection}>
        {dailyQuests.map((quest) => {
          const isCompleted = quest.status === 'COMPLETED';
          return (
            <SystemWindow
              key={quest.id}
              variant={isCompleted ? 'success' : 'default'}
              style={styles.questCard}
            >
              <View style={styles.questHeader}>
                <View style={styles.questTitleRow}>
                  <Text style={styles.questIcon}>
                    {quest.category === 'STEPS' ? '👟' :
                     quest.category === 'WORKOUT' ? '💪' :
                     quest.category === 'NUTRITION' ? '🥗' :
                     quest.category === 'RECOVERY' ? '😴' : '⭐'}
                  </Text>
                  <Text style={[styles.questName, isCompleted && styles.questNameComplete]}>
                    {quest.name}
                  </Text>
                </View>
                <Text style={[styles.questXP, isCompleted && styles.questXPComplete]}>
                  +{quest.baseXP} XP
                </Text>
              </View>

              {/* Progress */}
              <View style={styles.questProgress}>
                <View style={styles.questProgressBar}>
                  <View
                    style={[
                      styles.questProgressFill,
                      {
                        width: `${quest.completionPercent}%`,
                        backgroundColor: isCompleted ? '#4ADE80' : '#60A5FA',
                      },
                    ]}
                  />
                </View>
                <Text style={styles.questProgressText}>
                  {quest.currentValue} / {quest.targetValue}
                </Text>
              </View>

              {/* Status */}
              {isCompleted && (
                <View style={styles.questCompleteBadge}>
                  <Ionicons name="checkmark-circle" size={14} color="#4ADE80" />
                  <Text style={styles.questCompleteText}>COMPLETE</Text>
                </View>
              )}
            </SystemWindow>
          );
        })}

        {/* Rotating Quest */}
        {rotatingQuest && (
          <SystemWindow
            variant={rotatingQuest.status === 'COMPLETED' ? 'success' : 'default'}
            style={{ ...styles.questCard, ...styles.rotatingQuest } as ViewStyle}
          >
            <View style={styles.rotatingBadge}>
              <Text style={styles.rotatingBadgeText}>🔄 ROTATING QUEST</Text>
            </View>
            <View style={styles.questHeader}>
              <Text style={styles.questName}>{rotatingQuest.name}</Text>
              <Text style={styles.questXP}>+{rotatingQuest.baseXP} XP</Text>
            </View>
            <View style={styles.questProgress}>
              <View style={styles.questProgressBar}>
                <View
                  style={[
                    styles.questProgressFill,
                    {
                      width: `${rotatingQuest.completionPercent}%`,
                      backgroundColor: rotatingQuest.status === 'COMPLETED' ? '#4ADE80' : '#A855F7',
                    },
                  ]}
                />
              </View>
              <Text style={styles.questProgressText}>
                {rotatingQuest.currentValue} / {rotatingQuest.targetValue}
              </Text>
            </View>
          </SystemWindow>
        )}

        {/* Empty state */}
        {dailyQuests.length === 0 && !questsLoading && (
          <SystemWindow variant="warning" style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No quests available</Text>
            <Text style={styles.emptyStateSubtext}>Check back tomorrow for new objectives</Text>
          </SystemWindow>
        )}
      </View>

      {/* Seasonal Quests Section */}
      <View style={styles.seasonalSection}>
        <Text style={styles.sectionTitle}>
          <Text style={{ color: '#A855F7' }}>{'>'}</Text> SEASONAL OBJECTIVES
        </Text>
        <SeasonalQuestSection />
      </View>

      {/* Streak Progress */}
      {player && player.currentStreak > 0 && (
        <View style={styles.streakSection}>
          <Text style={styles.sectionTitle}>
            <Text style={{ color: '#FF6600' }}>{'>'}</Text> STREAK PROGRESS
          </Text>
          <StreakProgress
            streak={player.currentStreak}
            nextMilestone={getNextMilestone(player.currentStreak)}
          />
        </View>
      )}

      {/* Reconciliation Prompt */}
      {shouldShowReconciliation && !isDayClosed && (
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push('/reconciliation');
          }}
        >
          <SystemWindow variant="warning" style={styles.reconciliationPrompt}>
            <View style={styles.reconciliationRow}>
              <View style={styles.reconciliationLeft}>
                <View style={styles.reconciliationDot} />
                <View>
                  <Text style={styles.reconciliationTitle}>Day Closing Soon</Text>
                  <Text style={styles.reconciliationSubtitle}>
                    Confirm your progress before midnight
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#A855F7" />
            </View>
          </SystemWindow>
        </Pressable>
      )}

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Pressable
          style={styles.quickActionButton}
          onPress={() => router.push('/quest-archive')}
        >
          <Ionicons name="albums-outline" size={20} color="#60A5FA" />
          <Text style={styles.quickActionText}>Quest Archive</Text>
        </Pressable>
        <Pressable
          style={styles.quickActionButton}
          onPress={() => router.push('/quest-history')}
        >
          <Ionicons name="time-outline" size={20} color="#4ADE80" />
          <Text style={styles.quickActionText}>History</Text>
        </Pressable>
      </View>

      {/* Secondary Actions */}
      <View style={styles.quickActions}>
        <Pressable
          style={styles.quickActionButton}
          onPress={handleStatsPress}
        >
          <Ionicons name="bar-chart-outline" size={20} color="#FBBF24" />
          <Text style={styles.quickActionText}>View Stats</Text>
        </Pressable>
        <Pressable
          style={styles.quickActionButton}
          onPress={() => router.push('/dungeons')}
        >
          <Ionicons name="skull-outline" size={20} color="#A855F7" />
          <Text style={styles.quickActionText}>Dungeons</Text>
        </Pressable>
      </View>

      {/* Bottom spacing */}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 20,
  },
  systemMessage: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  greetingText: {
    fontSize: 13,
    fontFamily: 'monospace',
    lineHeight: 20,
  },
  healthSync: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  healthSyncRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  healthSyncLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  healthSyncTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  healthSyncSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  spinIcon: {
    // Animation would need Animated API
  },
  progressSummary: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.2)',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#E2E8F0',
    letterSpacing: 1,
  },
  progressPercent: {
    fontSize: 14,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#4ADE80',
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
  progressSubtext: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: 'monospace',
  },
  questSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  questCard: {
    marginBottom: 10,
  },
  questHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  questTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  questIcon: {
    fontSize: 18,
  },
  questName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E2E8F0',
    flex: 1,
  },
  questNameComplete: {
    color: '#4ADE80',
    textDecorationLine: 'line-through',
  },
  questXP: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FBBF24',
    fontFamily: 'monospace',
  },
  questXPComplete: {
    color: '#4ADE80',
  },
  questProgress: {
    marginBottom: 4,
  },
  questProgressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  questProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  questProgressText: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: 'monospace',
    textAlign: 'right',
  },
  questCompleteBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  questCompleteText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#4ADE80',
    fontFamily: 'monospace',
  },
  rotatingQuest: {
    borderColor: 'rgba(168, 85, 247, 0.3)',
  },
  rotatingBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginBottom: 10,
  },
  rotatingBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#A855F7',
    fontFamily: 'monospace',
  },
  emptyState: {
    alignItems: 'center',
    padding: 24,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#FBBF24',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'monospace',
  },
  seasonalSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  streakSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  reconciliationPrompt: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  reconciliationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reconciliationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  reconciliationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#A855F7',
  },
  reconciliationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  reconciliationSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginTop: 8,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.2)',
    borderRadius: 8,
    paddingVertical: 12,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
    fontFamily: 'monospace',
  },
});
