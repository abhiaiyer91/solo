/**
 * Analytics Page - Player analytics dashboard
 */

import { useState } from 'react'
import { useAnalyticsSummary, useQuestTrend, useXPTrend, useActivityHeatmap, usePersonalBests } from '../hooks/useAnalytics'
import { TrendChart } from '../components/analytics/TrendChart'
import { HeatmapCalendar } from '../components/analytics/HeatmapCalendar'

type Period = 'week' | 'month' | 'alltime'

export default function Analytics() {
  const [period, setPeriod] = useState<Period>('week')
  const days = period === 'week' ? 7 : period === 'month' ? 30 : 365

  const { data: summary, isLoading: summaryLoading } = useAnalyticsSummary(period)
  const { data: questTrend, isLoading: questLoading } = useQuestTrend(days)
  const { data: xpTrend, isLoading: xpLoading } = useXPTrend(days)
  const { data: heatmap, isLoading: heatmapLoading } = useActivityHeatmap(90)
  const { data: personalBests, isLoading: bestsLoading } = usePersonalBests()

  const formatXP = (xp: number): string => {
    if (xp >= 1000000) return `${(xp / 1000000).toFixed(1)}M`
    if (xp >= 1000) return `${(xp / 1000).toFixed(1)}k`
    return xp.toString()
  }

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const getTrendIcon = (trend: number): string => {
    if (trend > 5) return '↑'
    if (trend < -5) return '↓'
    return '→'
  }

  const getTrendColor = (trend: number): string => {
    if (trend > 5) return 'text-green-400'
    if (trend < -5) return 'text-red-400'
    return 'text-gray-400'
  }

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Analytics</h1>
            <p className="text-gray-400 text-sm mt-1">Track your progress and patterns</p>
          </div>

          {/* Period selector */}
          <div className="flex gap-2">
            {(['week', 'month', 'alltime'] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  period === p
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {p === 'week' ? '7 Days' : p === 'month' ? '30 Days' : 'All Time'}
              </button>
            ))}
          </div>
        </div>

        {/* Summary Cards */}
        {summaryLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-gray-900/50 rounded-lg border border-gray-800 p-4 animate-pulse">
                <div className="h-4 bg-gray-800 rounded w-1/2 mb-2" />
                <div className="h-8 bg-gray-800 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : summary ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {/* Quest Completion */}
            <div className="bg-gray-900/50 rounded-lg border border-gray-800 p-4">
              <div className="flex justify-between items-start">
                <span className="text-sm text-gray-400">Quest Completion</span>
                <span className={`text-xs ${getTrendColor(summary.questCompletion.trend)}`}>
                  {getTrendIcon(summary.questCompletion.trend)} {Math.abs(summary.questCompletion.trend)}%
                </span>
              </div>
              <p className="text-3xl font-bold text-white mt-1">{summary.questCompletion.rate}%</p>
              <p className="text-xs text-gray-500 mt-1">
                {summary.questCompletion.completed}/{summary.questCompletion.total} quests
              </p>
            </div>

            {/* XP Earned */}
            <div className="bg-gray-900/50 rounded-lg border border-gray-800 p-4">
              <div className="flex justify-between items-start">
                <span className="text-sm text-gray-400">XP Earned</span>
                <span className={`text-xs ${getTrendColor(summary.xpEarned.trend)}`}>
                  {getTrendIcon(summary.xpEarned.trend)} {Math.abs(summary.xpEarned.trend)}%
                </span>
              </div>
              <p className="text-3xl font-bold text-blue-400 mt-1">{formatXP(summary.xpEarned.total)}</p>
              <p className="text-xs text-gray-500 mt-1">{formatXP(summary.xpEarned.average)} avg/day</p>
            </div>

            {/* Streaks */}
            <div className="bg-gray-900/50 rounded-lg border border-gray-800 p-4">
              <span className="text-sm text-gray-400">Streak</span>
              <p className="text-3xl font-bold text-orange-400 mt-1">{summary.streaks.current}</p>
              <p className="text-xs text-gray-500 mt-1">
                Longest: {summary.streaks.longest} • {summary.streaks.perfectDays} perfect days
              </p>
            </div>

            {/* Best Day */}
            <div className="bg-gray-900/50 rounded-lg border border-gray-800 p-4">
              <span className="text-sm text-gray-400">Best Day</span>
              {summary.bestDay ? (
                <>
                  <p className="text-3xl font-bold text-green-400 mt-1">{formatXP(summary.bestDay.xpEarned)}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDate(summary.bestDay.date)} • {summary.bestDay.questsCompleted} quests
                  </p>
                </>
              ) : (
                <p className="text-xl text-gray-500 mt-1">No data yet</p>
              )}
            </div>
          </div>
        ) : null}

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Quest Trend */}
          <div>
            {questLoading ? (
              <div className="bg-gray-900/50 rounded-lg border border-gray-800 p-4 h-64 animate-pulse" />
            ) : (
              <TrendChart
                data={questTrend ?? []}
                title="Quest Completion Rate"
                color="#22c55e"
                valueFormatter={(v) => `${v}%`}
              />
            )}
          </div>

          {/* XP Trend */}
          <div>
            {xpLoading ? (
              <div className="bg-gray-900/50 rounded-lg border border-gray-800 p-4 h-64 animate-pulse" />
            ) : (
              <TrendChart data={xpTrend ?? []} title="XP Earned" color="#3b82f6" valueFormatter={formatXP} />
            )}
          </div>
        </div>

        {/* Activity Heatmap */}
        <div className="mb-8">
          {heatmapLoading ? (
            <div className="bg-gray-900/50 rounded-lg border border-gray-800 p-4 h-64 animate-pulse" />
          ) : (
            <HeatmapCalendar data={heatmap ?? []} title="Activity Patterns (Last 90 Days)" />
          )}
        </div>

        {/* Personal Bests */}
        <div className="bg-gray-900/50 rounded-lg border border-gray-800 p-6">
          <h3 className="text-lg font-medium text-white mb-4">Personal Records</h3>

          {bestsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-800 rounded w-1/2 mb-2" />
                  <div className="h-8 bg-gray-800 rounded w-3/4" />
                </div>
              ))}
            </div>
          ) : personalBests ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Best Day XP */}
              <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                <div className="text-4xl mb-2">🔥</div>
                <p className="text-sm text-gray-400 mb-1">Best Single Day</p>
                {personalBests.bestDayXP ? (
                  <>
                    <p className="text-2xl font-bold text-blue-400">{formatXP(personalBests.bestDayXP.xp)} XP</p>
                    <p className="text-xs text-gray-500 mt-1">{formatDate(personalBests.bestDayXP.date)}</p>
                  </>
                ) : (
                  <p className="text-lg text-gray-500">No record yet</p>
                )}
              </div>

              {/* Best Week */}
              <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                <div className="text-4xl mb-2">📈</div>
                <p className="text-sm text-gray-400 mb-1">Best Week</p>
                {personalBests.bestWeek ? (
                  <>
                    <p className="text-2xl font-bold text-green-400">{formatXP(personalBests.bestWeek.xp)} XP</p>
                    <p className="text-xs text-gray-500 mt-1">Week of {formatDate(personalBests.bestWeek.startDate)}</p>
                  </>
                ) : (
                  <p className="text-lg text-gray-500">No record yet</p>
                )}
              </div>

              {/* Most Quests */}
              <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                <div className="text-4xl mb-2">⚔️</div>
                <p className="text-sm text-gray-400 mb-1">Most Quests (1 Day)</p>
                {personalBests.mostQuestsInDay ? (
                  <>
                    <p className="text-2xl font-bold text-purple-400">{personalBests.mostQuestsInDay.completed} quests</p>
                    <p className="text-xs text-gray-500 mt-1">{formatDate(personalBests.mostQuestsInDay.date)}</p>
                  </>
                ) : (
                  <p className="text-lg text-gray-500">No record yet</p>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
