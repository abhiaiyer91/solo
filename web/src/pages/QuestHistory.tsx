/**
 * Quest History Page
 * 
 * Shows historical quest completion data and statistics.
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuestHistory, type QuestHistoryEntry } from '../hooks/useQuestHistory'

type DateRange = '7d' | '30d' | '90d' | 'all'
type QuestFilter = 'all' | 'completed' | 'partial' | 'missed'

export default function QuestHistoryPage() {
  const [dateRange, setDateRange] = useState<DateRange>('30d')
  const [filter, setFilter] = useState<QuestFilter>('all')
  
  const { history, stats, isLoading, error } = useQuestHistory({ dateRange, filter })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-gray-400">Loading history...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-red-400">{error}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-6" data-testid="quest-history-page">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Quest History</h1>
          <p className="text-gray-400">Track your progress over time</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8">
          {/* Date Range */}
          <div className="flex gap-2">
            {(['7d', '30d', '90d', 'all'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-4 py-2 rounded transition-colors ${
                  dateRange === range
                    ? 'bg-system-blue text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {range === 'all' ? 'All Time' : range.replace('d', ' days')}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            {(['all', 'completed', 'partial', 'missed'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded transition-colors capitalize ${
                  filter === f
                    ? 'bg-system-blue text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Quests" value={stats.totalQuests} />
          <StatCard 
            label="Completed" 
            value={stats.completed} 
            percentage={stats.completionRate}
            color="green"
          />
          <StatCard 
            label="Partial" 
            value={stats.partial}
            color="yellow"
          />
          <StatCard 
            label="Missed" 
            value={stats.missed}
            color="red"
          />
        </div>

        {/* Completion Rate Chart */}
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-4 text-gray-300">Completion Trend</h2>
          <QuestHistoryChart data={stats.dailyRates} />
        </div>

        {/* History List */}
        <div>
          <h2 className="text-lg font-bold mb-4 text-gray-300">Quest Log</h2>
          <div className="space-y-2">
            {history.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No quest history for selected filters
              </div>
            ) : (
              history.map((entry, i) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <QuestHistoryItem entry={entry} />
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

interface StatCardProps {
  label: string
  value: number
  percentage?: number
  color?: 'green' | 'yellow' | 'red'
}

function StatCard({ label, value, percentage, color }: StatCardProps) {
  const colorClasses = {
    green: 'text-green-400',
    yellow: 'text-yellow-400',
    red: 'text-red-400',
  }

  return (
    <div className="p-4 bg-gray-900 rounded border border-gray-800">
      <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">{label}</div>
      <div className={`text-2xl font-bold ${color ? colorClasses[color] : 'text-white'}`}>
        {value}
        {percentage !== undefined && (
          <span className="text-sm text-gray-400 ml-2">({percentage}%)</span>
        )}
      </div>
    </div>
  )
}

interface QuestHistoryChartProps {
  data: Array<{ date: string; rate: number }>
}

function QuestHistoryChart({ data }: QuestHistoryChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-40 bg-gray-900 rounded border border-gray-800 flex items-center justify-center text-gray-500">
        No data available
      </div>
    )
  }

  const maxRate = 100
  
  return (
    <div className="h-40 bg-gray-900 rounded border border-gray-800 p-4">
      <div className="h-full flex items-end gap-1">
        {data.map((point, i) => (
          <motion.div
            key={point.date}
            initial={{ height: 0 }}
            animate={{ height: `${(point.rate / maxRate) * 100}%` }}
            transition={{ delay: i * 0.02, duration: 0.3 }}
            className="flex-1 bg-system-blue/80 rounded-t min-h-[4px]"
            title={`${point.date}: ${point.rate}%`}
          />
        ))}
      </div>
      <div className="flex justify-between text-xs text-gray-500 mt-2">
        <span>{data[0]?.date}</span>
        <span>{data[data.length - 1]?.date}</span>
      </div>
    </div>
  )
}

function QuestHistoryItem({ entry }: { entry: QuestHistoryEntry }) {
  const statusColors = {
    completed: 'border-green-500 bg-green-500/10',
    partial: 'border-yellow-500 bg-yellow-500/10',
    missed: 'border-red-500 bg-red-500/10',
  }

  const statusIcons = {
    completed: '✓',
    partial: '◐',
    missed: '✗',
  }

  return (
    <div className={`p-3 rounded border ${statusColors[entry.status]}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-lg">{statusIcons[entry.status]}</span>
          <div>
            <div className="font-medium">{entry.questName}</div>
            <div className="text-sm text-gray-400">{entry.date}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-system-blue font-bold">+{entry.xpEarned} XP</div>
          <div className="text-xs text-gray-500">{entry.questType}</div>
        </div>
      </div>
    </div>
  )
}
