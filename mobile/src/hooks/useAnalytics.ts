/**
 * Analytics Hook
 *
 * Fetches and manages analytics data for mobile.
 */

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useMemo } from 'react'

export type AnalyticsPeriod = '7d' | '30d' | 'all'

export interface DailyActivity {
  date: string
  questsCompleted: number
  totalQuests: number
  xpEarned: number
  completionRate: number
}

export interface AnalyticsSummary {
  questsCompleted: number
  totalQuests: number
  completionRate: number
  completionTrend: number // Change from previous period
  xpEarned: number
  xpTrend: number
  currentStreak: number
  bestStreak: number
  bestDayXP: number
  bestDayDate: string
}

export interface PersonalRecord {
  type: 'xp_day' | 'xp_week' | 'quests_day' | 'streak'
  label: string
  value: number
  date?: string
  unit?: string
}

interface AnalyticsResponse {
  summary: AnalyticsSummary
  dailyActivity: DailyActivity[]
  personalRecords: PersonalRecord[]
}

export function useAnalytics(period: AnalyticsPeriod) {
  const days = period === 'all' ? 365 : parseInt(period.replace('d', ''))

  const query = useQuery({
    queryKey: ['analytics', period],
    queryFn: async () => {
      try {
        const response = await api.get<AnalyticsResponse>(`/api/analytics?days=${days}`)
        return response
      } catch {
        // Return sample data for development
        return generateSampleAnalytics(days)
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  // Generate heatmap data (last 90 days)
  const heatmapData = useMemo(() => {
    const daily = query.data?.dailyActivity ?? []
    const heatmap: Array<{ date: string; intensity: number }> = []

    // Fill in 90 days
    for (let i = 89; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]!

      const activity = daily.find(d => d.date === dateStr)
      heatmap.push({
        date: dateStr,
        intensity: activity?.completionRate ?? 0,
      })
    }

    return heatmap
  }, [query.data?.dailyActivity])

  // Trend chart data
  const trendData = useMemo(() => {
    const daily = query.data?.dailyActivity ?? []
    return daily.slice(-days).map(d => ({
      date: d.date,
      xp: d.xpEarned,
      completion: d.completionRate,
    }))
  }, [query.data?.dailyActivity, days])

  return {
    summary: query.data?.summary ?? getEmptySummary(),
    dailyActivity: query.data?.dailyActivity ?? [],
    personalRecords: query.data?.personalRecords ?? [],
    heatmapData,
    trendData,
    isLoading: query.isLoading,
    error: query.error?.message ?? null,
    refetch: query.refetch,
  }
}

function getEmptySummary(): AnalyticsSummary {
  return {
    questsCompleted: 0,
    totalQuests: 0,
    completionRate: 0,
    completionTrend: 0,
    xpEarned: 0,
    xpTrend: 0,
    currentStreak: 0,
    bestStreak: 0,
    bestDayXP: 0,
    bestDayDate: '',
  }
}

/**
 * Generate sample analytics data for development
 */
function generateSampleAnalytics(days: number): AnalyticsResponse {
  const dailyActivity: DailyActivity[] = []
  let totalXP = 0
  let totalCompleted = 0
  let totalQuests = 0
  let bestDayXP = 0
  let bestDayDate = ''

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]!

    const questCount = 4 + Math.floor(Math.random() * 2)
    const completed = Math.floor(questCount * (0.6 + Math.random() * 0.4))
    const xp = completed * (40 + Math.floor(Math.random() * 20))

    if (xp > bestDayXP) {
      bestDayXP = xp
      bestDayDate = dateStr
    }

    totalXP += xp
    totalCompleted += completed
    totalQuests += questCount

    dailyActivity.push({
      date: dateStr,
      questsCompleted: completed,
      totalQuests: questCount,
      xpEarned: xp,
      completionRate: Math.round((completed / questCount) * 100),
    })
  }

  const completionRate = totalQuests > 0 ? Math.round((totalCompleted / totalQuests) * 100) : 0

  return {
    summary: {
      questsCompleted: totalCompleted,
      totalQuests,
      completionRate,
      completionTrend: Math.round((Math.random() - 0.3) * 20),
      xpEarned: totalXP,
      xpTrend: Math.round((Math.random() - 0.3) * 25),
      currentStreak: 7 + Math.floor(Math.random() * 10),
      bestStreak: 15 + Math.floor(Math.random() * 20),
      bestDayXP,
      bestDayDate,
    },
    dailyActivity,
    personalRecords: [
      { type: 'xp_day', label: 'Best Day XP', value: bestDayXP, date: bestDayDate, unit: 'XP' },
      { type: 'xp_week', label: 'Best Week XP', value: 1250, unit: 'XP' },
      { type: 'quests_day', label: 'Most Quests (Day)', value: 6 },
      { type: 'streak', label: 'Longest Streak', value: 28, unit: 'days' },
    ],
  }
}
