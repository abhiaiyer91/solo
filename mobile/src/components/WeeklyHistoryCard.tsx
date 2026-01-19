/**
 * WeeklyHistoryCard - Display weekly progress history
 * Shows last 4 weeks of quest completion and XP earned
 */

import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { SystemWindow } from './SystemWindow'

interface WeeklySummary {
  weekStart: string
  weekEnd: string
  weekNumber: number
  questsCompleted: number
  totalQuests: number
  xpEarned: number
  perfectDays: number
  streakMaintained: boolean
}

interface WeeklySummaryResponse {
  summaries: WeeklySummary[]
  currentWeek: WeeklySummary | null
}

async function fetchWeeklySummary(): Promise<WeeklySummaryResponse> {
  return api.get<WeeklySummaryResponse>('/api/weekly-summary/history')
}

export function WeeklyHistoryCard() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['weekly-summary', 'history'],
    queryFn: fetchWeeklySummary,
    staleTime: 60 * 1000,
  })

  if (isLoading) {
    return (
      <SystemWindow title="WEEKLY HISTORY" style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#00FF00" />
          <Text style={styles.loadingText}>Loading history...</Text>
        </View>
      </SystemWindow>
    )
  }

  if (isError || !data) {
    return (
      <SystemWindow title="WEEKLY HISTORY" style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={32} color="#444444" />
          <Text style={styles.emptyText}>History not available</Text>
        </View>
      </SystemWindow>
    )
  }

  const weeks = data.summaries || []

  if (weeks.length === 0) {
    return (
      <SystemWindow title="WEEKLY HISTORY" style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={32} color="#444444" />
          <Text style={styles.emptyText}>No weekly data yet</Text>
          <Text style={styles.emptySubtext}>Complete a full week to see history</Text>
        </View>
      </SystemWindow>
    )
  }

  return (
    <SystemWindow title="WEEKLY HISTORY" style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {weeks.map((week, index) => (
          <WeekCard
            key={week.weekStart}
            week={week}
            isCurrentWeek={index === 0 && data.currentWeek !== null}
          />
        ))}
      </ScrollView>
    </SystemWindow>
  )
}

interface WeekCardProps {
  week: WeeklySummary
  isCurrentWeek?: boolean
}

function WeekCard({ week, isCurrentWeek }: WeekCardProps) {
  const completionRate = week.totalQuests > 0
    ? Math.round((week.questsCompleted / week.totalQuests) * 100)
    : 0

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <View style={[styles.weekCard, isCurrentWeek && styles.currentWeekCard]}>
      {/* Week Header */}
      <View style={styles.weekHeader}>
        <Text style={styles.weekNumber}>
          {isCurrentWeek ? 'This Week' : `Week ${week.weekNumber}`}
        </Text>
        <Text style={styles.weekDates}>
          {formatDate(week.weekStart)} - {formatDate(week.weekEnd)}
        </Text>
      </View>

      {/* Completion Ring */}
      <View style={styles.completionContainer}>
        <View style={styles.completionRing}>
          <Text style={styles.completionPercent}>{completionRate}%</Text>
        </View>
        <Text style={styles.completionLabel}>Completion</Text>
      </View>

      {/* Stats */}
      <View style={styles.weekStats}>
        <View style={styles.weekStatItem}>
          <Ionicons name="checkmark-circle" size={14} color="#4ADE80" />
          <Text style={styles.weekStatValue}>{week.questsCompleted}</Text>
          <Text style={styles.weekStatLabel}>Quests</Text>
        </View>
        <View style={styles.weekStatItem}>
          <Ionicons name="flash" size={14} color="#FFD700" />
          <Text style={styles.weekStatValue}>{week.xpEarned}</Text>
          <Text style={styles.weekStatLabel}>XP</Text>
        </View>
        <View style={styles.weekStatItem}>
          <Ionicons name="star" size={14} color="#60A5FA" />
          <Text style={styles.weekStatValue}>{week.perfectDays}</Text>
          <Text style={styles.weekStatLabel}>Perfect</Text>
        </View>
      </View>

      {/* Streak indicator */}
      {week.streakMaintained && (
        <View style={styles.streakBadge}>
          <Ionicons name="flame" size={12} color="#FF6B6B" />
          <Text style={styles.streakBadgeText}>Streak Kept</Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#888888',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#888888',
    marginTop: 8,
  },
  emptySubtext: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#666666',
    marginTop: 4,
  },
  scrollContent: {
    paddingVertical: 8,
    gap: 12,
  },
  weekCard: {
    width: 160,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
  },
  currentWeekCard: {
    borderColor: 'rgba(0, 255, 0, 0.3)',
    backgroundColor: 'rgba(0, 255, 0, 0.05)',
  },
  weekHeader: {
    marginBottom: 12,
  },
  weekNumber: {
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#00FF00',
  },
  weekDates: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#666666',
    marginTop: 2,
  },
  completionContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  completionRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: '#00FF00',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  completionPercent: {
    fontSize: 16,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  completionLabel: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#888888',
  },
  weekStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  weekStatItem: {
    alignItems: 'center',
    gap: 2,
  },
  weekStatValue: {
    fontSize: 14,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  weekStatLabel: {
    fontSize: 8,
    fontFamily: 'monospace',
    color: '#666666',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderRadius: 4,
  },
  streakBadgeText: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#FF6B6B',
    fontWeight: 'bold',
  },
})
