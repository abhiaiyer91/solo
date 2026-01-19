/**
 * Player Analytics Hooks
 * Data aggregation and insights for player behavior
 */

import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

export interface DailyStats {
  date: string
  questsCompleted: number
  questsTotal: number
  completionRate: number
  xpEarned: number
  streakDay: number
  wasPerfect: boolean
}

export interface QuestAnalytics {
  questId: string
  questName: string
  category: string
  completionRate: number
  avgCompletionTime: string | null
  streakDays: number
  totalCompletions: number
  missedDays: number
}

export interface TimeAnalytics {
  hour: number
  completions: number
  avgCompletionRate: number
}

export interface WeekdayAnalytics {
  day: string
  dayIndex: number
  completionRate: number
  avgXp: number
  perfectDays: number
  totalDays: number
}

export interface PlayerInsights {
  totalDays: number
  activeDays: number
  perfectDays: number
  totalXp: number
  avgDailyXp: number
  currentStreak: number
  longestStreak: number
  bestDay: { date: string; xp: number } | null
  worstDay: { date: string; completionRate: number } | null
  strongestQuest: QuestAnalytics | null
  weakestQuest: QuestAnalytics | null
  peakHour: TimeAnalytics | null
  weakestWeekday: WeekdayAnalytics | null
}

export interface AnalyticsData {
  dailyStats: DailyStats[]
  questAnalytics: QuestAnalytics[]
  timeAnalytics: TimeAnalytics[]
  weekdayAnalytics: WeekdayAnalytics[]
  insights: PlayerInsights
}

// ═══════════════════════════════════════════════════════════
// HOOKS
// ═══════════════════════════════════════════════════════════

/**
 * Fetch player analytics data
 */
export function usePlayerAnalytics(days = 30) {
  return useQuery({
    queryKey: ['analytics', days],
    queryFn: async (): Promise<AnalyticsData> => {
      const response = await api.get<AnalyticsData>(`/api/player/analytics?days=${days}`)
      return response
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Calculate trend direction from daily stats
 */
export function useTrend(data: DailyStats[], metricKey: keyof DailyStats) {
  if (!data || data.length < 7) return { direction: 'stable' as const, percentage: 0 }

  const recent = data.slice(-7)
  const previous = data.slice(-14, -7)

  if (previous.length === 0) return { direction: 'stable' as const, percentage: 0 }

  const recentAvg = recent.reduce((sum, d) => sum + (d[metricKey] as number), 0) / recent.length
  const previousAvg = previous.reduce((sum, d) => sum + (d[metricKey] as number), 0) / previous.length

  if (previousAvg === 0) return { direction: 'stable' as const, percentage: 0 }

  const change = ((recentAvg - previousAvg) / previousAvg) * 100

  return {
    direction: change > 5 ? 'up' as const : change < -5 ? 'down' as const : 'stable' as const,
    percentage: Math.abs(Math.round(change)),
  }
}

// ═══════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════

/**
 * Format percentage for display
 */
export function formatPercentage(value: number): string {
  return `${Math.round(value * 100)}%`
}

/**
 * Get color based on completion rate
 */
export function getCompletionColor(rate: number): string {
  if (rate >= 0.9) return 'text-green-400'
  if (rate >= 0.7) return 'text-yellow-400'
  if (rate >= 0.5) return 'text-orange-400'
  return 'text-red-400'
}

/**
 * Get color for bar chart
 */
export function getBarColor(rate: number): string {
  if (rate >= 0.9) return 'bg-green-500'
  if (rate >= 0.7) return 'bg-yellow-500'
  if (rate >= 0.5) return 'bg-orange-500'
  return 'bg-red-500'
}

/**
 * Format weekday name
 */
export function formatWeekday(dayIndex: number): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  return days[dayIndex] ?? ''
}

/**
 * Format hour for display
 */
export function formatHour(hour: number): string {
  if (hour === 0) return '12am'
  if (hour === 12) return '12pm'
  if (hour < 12) return `${hour}am`
  return `${hour - 12}pm`
}

/**
 * Generate insight message based on data
 */
export function generateInsightMessages(insights: PlayerInsights): string[] {
  const messages: string[] = []

  // Streak insight
  if (insights.currentStreak >= 7) {
    messages.push(`Your ${insights.currentStreak}-day streak shows strong consistency.`)
  } else if (insights.longestStreak > insights.currentStreak + 10) {
    messages.push(`Your longest streak was ${insights.longestStreak} days. You can rebuild.`)
  }

  // Perfect days insight
  const perfectRate = insights.perfectDays / Math.max(insights.activeDays, 1)
  if (perfectRate >= 0.5) {
    messages.push(`${Math.round(perfectRate * 100)}% of your days are perfect. Elite consistency.`)
  }

  // Weakest quest insight
  if (insights.weakestQuest && insights.weakestQuest.completionRate < 0.6) {
    messages.push(
      `${insights.weakestQuest.questName} has ${formatPercentage(insights.weakestQuest.completionRate)} completion. Consider adjusting targets.`
    )
  }

  // Weakest weekday insight
  if (insights.weakestWeekday && insights.weakestWeekday.completionRate < 0.7) {
    messages.push(
      `${insights.weakestWeekday.day}s are your weakest day at ${formatPercentage(insights.weakestWeekday.completionRate)}.`
    )
  }

  // Peak hour insight
  if (insights.peakHour) {
    messages.push(`You're most productive around ${formatHour(insights.peakHour.hour)}.`)
  }

  return messages
}

/**
 * Calculate weekly summary from daily stats
 */
export function getWeeklySummary(dailyStats: DailyStats[]) {
  const thisWeek = dailyStats.slice(-7)
  const lastWeek = dailyStats.slice(-14, -7)

  const thisWeekXp = thisWeek.reduce((sum, d) => sum + d.xpEarned, 0)
  const lastWeekXp = lastWeek.reduce((sum, d) => sum + d.xpEarned, 0)

  const thisWeekPerfect = thisWeek.filter((d) => d.wasPerfect).length
  const thisWeekCompletionRate =
    thisWeek.reduce((sum, d) => sum + d.completionRate, 0) / Math.max(thisWeek.length, 1)

  return {
    xpEarned: thisWeekXp,
    xpChange: lastWeekXp > 0 ? ((thisWeekXp - lastWeekXp) / lastWeekXp) * 100 : 0,
    perfectDays: thisWeekPerfect,
    avgCompletionRate: thisWeekCompletionRate,
    activeDays: thisWeek.filter((d) => d.questsCompleted > 0).length,
  }
}
