/**
 * Analytics Screen
 *
 * Shows analytics dashboard with progress tracking, trend charts,
 * activity heatmap, and personal records.
 */

import React, { useState, useCallback } from 'react'
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
import * as Haptics from 'expo-haptics'

import { SystemWindow } from '@/components/SystemWindow'
import { useAnalytics, type AnalyticsPeriod } from '@/hooks/useAnalytics'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

// Period options
const PERIODS: { value: AnalyticsPeriod; label: string }[] = [
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: 'all', label: 'All Time' },
]

interface SummaryCardProps {
  label: string
  value: string | number
  trend?: number
  icon: keyof typeof Ionicons.glyphMap
  color: string
}

function SummaryCard({ label, value, trend, icon, color }: SummaryCardProps) {
  return (
    <View style={[styles.summaryCard, { borderColor: `${color}30` }]}>
      <View style={styles.summaryHeader}>
        <Ionicons name={icon} size={18} color={color} />
        <Text style={styles.summaryLabel}>{label}</Text>
      </View>
      <View style={styles.summaryValueRow}>
        <Text style={[styles.summaryValue, { color }]}>{value}</Text>
        {trend !== undefined && trend !== 0 && (
          <View style={[styles.trendBadge, { backgroundColor: trend > 0 ? '#4ADE8020' : '#EF444420' }]}>
            <Ionicons
              name={trend > 0 ? 'trending-up' : 'trending-down'}
              size={12}
              color={trend > 0 ? '#4ADE80' : '#EF4444'}
            />
            <Text style={[styles.trendText, { color: trend > 0 ? '#4ADE80' : '#EF4444' }]}>
              {Math.abs(trend)}%
            </Text>
          </View>
        )}
      </View>
    </View>
  )
}

interface TrendChartProps {
  data: Array<{ date: string; xp: number; completion: number }>
  type: 'xp' | 'completion'
}

function TrendChart({ data, type }: TrendChartProps) {
  if (data.length === 0) {
    return (
      <View style={styles.emptyChart}>
        <Text style={styles.emptyChartText}>No data available</Text>
      </View>
    )
  }

  const values = data.map(d => type === 'xp' ? d.xp : d.completion)
  const maxValue = Math.max(...values, 1)
  const barWidth = Math.max(4, (SCREEN_WIDTH - 80) / data.length - 2)
  const color = type === 'xp' ? '#60A5FA' : '#4ADE80'

  return (
    <View style={styles.chartContainer}>
      <View style={styles.chartBars}>
        {data.map((point, i) => (
          <View
            key={point.date}
            style={[
              styles.chartBar,
              {
                width: barWidth,
                height: `${(values[i]! / maxValue) * 100}%`,
                backgroundColor: color,
              },
            ]}
          />
        ))}
      </View>
      <View style={styles.chartLabels}>
        <Text style={styles.chartLabel}>{data[0]?.date.slice(5)}</Text>
        <Text style={styles.chartLabel}>{data[data.length - 1]?.date.slice(5)}</Text>
      </View>
    </View>
  )
}

interface HeatmapProps {
  data: Array<{ date: string; intensity: number }>
}

function HeatmapCalendar({ data }: HeatmapProps) {
  // Group by weeks (7 days per row)
  const weeks: Array<Array<{ date: string; intensity: number }>> = []
  for (let i = 0; i < data.length; i += 7) {
    weeks.push(data.slice(i, i + 7))
  }

  const getColor = (intensity: number) => {
    if (intensity === 0) return '#1E293B'
    if (intensity < 25) return '#4ADE8030'
    if (intensity < 50) return '#4ADE8060'
    if (intensity < 75) return '#4ADE8090'
    return '#4ADE80'
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.heatmapScroll}>
      <View style={styles.heatmapContainer}>
        {weeks.map((week, weekIndex) => (
          <View key={weekIndex} style={styles.heatmapWeek}>
            {week.map((day) => (
              <View
                key={day.date}
                style={[styles.heatmapCell, { backgroundColor: getColor(day.intensity) }]}
              />
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  )
}

interface PersonalBestProps {
  records: Array<{
    type: string
    label: string
    value: number
    date?: string
    unit?: string
  }>
}

function PersonalBests({ records }: PersonalBestProps) {
  const getIcon = (type: string): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'xp_day': return 'star'
      case 'xp_week': return 'trophy'
      case 'quests_day': return 'checkmark-done'
      case 'streak': return 'flame'
      default: return 'ribbon'
    }
  }

  return (
    <View style={styles.recordsGrid}>
      {records.map((record) => (
        <View key={record.type} style={styles.recordCard}>
          <Ionicons name={getIcon(record.type)} size={20} color="#FBBF24" />
          <Text style={styles.recordValue}>
            {record.value}
            {record.unit && <Text style={styles.recordUnit}> {record.unit}</Text>}
          </Text>
          <Text style={styles.recordLabel}>{record.label}</Text>
          {record.date && (
            <Text style={styles.recordDate}>{record.date}</Text>
          )}
        </View>
      ))}
    </View>
  )
}

export default function AnalyticsScreen() {
  const router = useRouter()
  const [period, setPeriod] = useState<AnalyticsPeriod>('30d')
  const [refreshing, setRefreshing] = useState(false)

  const { summary, trendData, heatmapData, personalRecords, isLoading, refetch } = useAnalytics(period)

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await refetch()
    setRefreshing(false)
  }, [refetch])

  const handlePeriodChange = (newPeriod: AnalyticsPeriod) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setPeriod(newPeriod)
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#60A5FA" />
        </Pressable>
        <Text style={styles.headerTitle}>{'>'} ANALYTICS</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#60A5FA" />
        }
      >
        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {PERIODS.map((p) => (
            <Pressable
              key={p.value}
              style={[styles.periodButton, period === p.value && styles.periodButtonActive]}
              onPress={() => handlePeriodChange(p.value)}
            >
              <Text style={[styles.periodText, period === p.value && styles.periodTextActive]}>
                {p.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryGrid}>
          <SummaryCard
            label="Completion Rate"
            value={`${summary.completionRate}%`}
            trend={summary.completionTrend}
            icon="checkmark-circle"
            color="#4ADE80"
          />
          <SummaryCard
            label="XP Earned"
            value={summary.xpEarned.toLocaleString()}
            trend={summary.xpTrend}
            icon="flash"
            color="#60A5FA"
          />
          <SummaryCard
            label="Current Streak"
            value={summary.currentStreak}
            icon="flame"
            color="#FF6600"
          />
          <SummaryCard
            label="Best Day"
            value={`${summary.bestDayXP} XP`}
            icon="star"
            color="#FBBF24"
          />
        </View>

        {/* XP Trend */}
        <SystemWindow title="XP TREND" style={styles.section}>
          <TrendChart data={trendData} type="xp" />
        </SystemWindow>

        {/* Completion Trend */}
        <SystemWindow title="COMPLETION TREND" style={styles.section}>
          <TrendChart data={trendData} type="completion" />
        </SystemWindow>

        {/* Activity Heatmap */}
        <SystemWindow title="ACTIVITY (90 DAYS)" style={styles.section}>
          <HeatmapCalendar data={heatmapData} />
          <View style={styles.heatmapLegend}>
            <Text style={styles.legendText}>Less</Text>
            <View style={[styles.legendCell, { backgroundColor: '#1E293B' }]} />
            <View style={[styles.legendCell, { backgroundColor: '#4ADE8030' }]} />
            <View style={[styles.legendCell, { backgroundColor: '#4ADE8060' }]} />
            <View style={[styles.legendCell, { backgroundColor: '#4ADE80' }]} />
            <Text style={styles.legendText}>More</Text>
          </View>
        </SystemWindow>

        {/* Personal Records */}
        <SystemWindow title="PERSONAL RECORDS" style={styles.section}>
          <PersonalBests records={personalRecords} />
        </SystemWindow>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
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
    borderBottomColor: 'rgba(96, 165, 250, 0.2)',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#60A5FA',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  periodButtonActive: {
    backgroundColor: '#60A5FA',
  },
  periodText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  periodTextActive: {
    color: '#FFF',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  summaryCard: {
    width: '48%',
    backgroundColor: '#0F172A',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 11,
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  trendText: {
    fontSize: 10,
    fontWeight: '600',
  },
  section: {
    marginBottom: 16,
  },
  emptyChart: {
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyChartText: {
    color: '#64748B',
    fontSize: 12,
  },
  chartContainer: {
    height: 120,
  },
  chartBars: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
  },
  chartBar: {
    borderRadius: 2,
    minHeight: 4,
    opacity: 0.8,
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  chartLabel: {
    fontSize: 10,
    color: '#64748B',
  },
  heatmapScroll: {
    marginBottom: 8,
  },
  heatmapContainer: {
    flexDirection: 'row',
    gap: 3,
  },
  heatmapWeek: {
    gap: 3,
  },
  heatmapCell: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  heatmapLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: 4,
  },
  legendText: {
    fontSize: 10,
    color: '#64748B',
  },
  legendCell: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  recordsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  recordCard: {
    width: '47%',
    backgroundColor: '#0F172A',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FBBF2430',
  },
  recordValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#E2E8F0',
    marginTop: 8,
    fontFamily: 'monospace',
  },
  recordUnit: {
    fontSize: 12,
    fontWeight: '400',
    color: '#64748B',
  },
  recordLabel: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
  },
  recordDate: {
    fontSize: 9,
    color: '#475569',
    marginTop: 2,
  },
  bottomSpacer: {
    height: 100,
  },
})
