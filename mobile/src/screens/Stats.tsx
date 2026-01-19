/**
 * Stats Screen - Detailed player statistics
 * Shows stat radar, individual breakdowns, streaks, and weekly history
 */

import React, { useCallback, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
  Dimensions,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { StatsRadar } from '@/components/StatsRadar'
import { StatCard } from '@/components/StatCard'
import { StreakStats } from '@/components/StreakStats'
import { WeeklyHistoryCard } from '@/components/WeeklyHistoryCard'
import { SystemWindow } from '@/components/SystemWindow'
import { usePlayer } from '@/hooks/usePlayer'
import {
  useAllStats,
  useAllStatBreakdowns,
  useMilestones,
  type StatType,
  getStatColor,
  getStatIcon,
  getStatLabel,
} from '@/hooks/useStats'

const screenWidth = Dimensions.get('window').width

export default function StatsScreen() {
  const router = useRouter()
  const [refreshing, setRefreshing] = useState(false)
  const [expandedStat, setExpandedStat] = useState<StatType | null>(null)

  const { data: player, isLoading: playerLoading, refetch: refetchPlayer } = usePlayer()
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useAllStats()
  const { data: breakdowns, isLoading: breakdownsLoading, refetch: refetchBreakdowns } = useAllStatBreakdowns()
  const { milestones, isLoading: milestonesLoading, refetch: refetchMilestones } = useMilestones()

  const isLoading = playerLoading || statsLoading

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await Promise.all([
      refetchPlayer(),
      refetchStats(),
      refetchBreakdowns(),
      refetchMilestones(),
    ])
    setRefreshing(false)
  }, [refetchPlayer, refetchStats, refetchBreakdowns, refetchMilestones])

  const handleStatPress = (stat: StatType) => {
    setExpandedStat(expandedStat === stat ? null : stat)
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#00FF00" />
        </Pressable>
        <Text style={styles.headerTitle}>{'>'} PLAYER STATS</Text>
        <View style={styles.headerRight}>
          <Text style={styles.levelBadge}>LVL {player?.level ?? 1}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#00FF00"
          />
        }
      >
        {/* Total XP Display */}
        <SystemWindow title="EXPERIENCE POINTS" style={styles.xpSection}>
          <View style={styles.xpContent}>
            <Text style={styles.totalXpLabel}>Total XP Earned</Text>
            <Text style={styles.totalXpValue}>
              {(player?.totalXP ?? 0).toLocaleString()}
            </Text>
          </View>
          <View style={styles.levelProgress}>
            <Text style={styles.levelProgressText}>
              Level {player?.level ?? 1} → {(player?.level ?? 1) + 1}
            </Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.min(100, (player?.totalXP ?? 0) % 100)}%` },
                ]}
              />
            </View>
          </View>
        </SystemWindow>

        {/* Stats Radar */}
        <StatsRadar
          stats={stats || null}
          isLoading={isLoading}
          showLabels
          showValues
        />

        {/* Individual Stat Cards */}
        <View style={styles.statCardsSection}>
          <Text style={styles.sectionTitle}>{'>'} STAT BREAKDOWN</Text>
          {(['STR', 'AGI', 'VIT', 'DISC'] as StatType[]).map((stat) => (
            <StatCard
              key={stat}
              stat={stat}
              value={stats?.[stat] ?? 0}
              breakdown={breakdowns?.[stat] ?? undefined}
              isExpanded={expandedStat === stat}
              onPress={() => handleStatPress(stat)}
              milestone={milestones?.find((m) => m.stat === stat)}
            />
          ))}
        </View>

        {/* Streak Statistics */}
        <StreakStats
          currentStreak={player?.currentStreak ?? 0}
          longestStreak={player?.longestStreak ?? 0}
          perfectStreak={player?.perfectStreak ?? 0}
        />

        {/* Weekly History */}
        <WeeklyHistoryCard />

        {/* Bottom spacing */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 255, 0, 0.2)',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#00FF00',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelBadge: {
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#FFD700',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    overflow: 'hidden',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 16,
  },
  xpSection: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  xpContent: {
    alignItems: 'center',
    marginBottom: 16,
  },
  totalXpLabel: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#888888',
  },
  totalXpValue: {
    fontSize: 32,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#00FF00',
  },
  levelProgress: {
    marginTop: 8,
  },
  levelProgressText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#888888',
    textAlign: 'center',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00FF00',
    borderRadius: 4,
  },
  statCardsSection: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#00FF00',
    marginBottom: 12,
  },
  bottomSpacer: {
    height: 100,
  },
})
