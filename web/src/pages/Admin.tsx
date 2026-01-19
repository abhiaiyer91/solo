/**
 * Admin Dashboard Page
 * 
 * Service health and metrics monitoring for administrators.
 */

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'

interface UserMetrics {
  dailyActiveUsers: number
  weeklyActiveUsers: number
  monthlyActiveUsers: number
  newUsersToday: number
  newUsersThisWeek: number
}

interface QuestMetrics {
  totalQuestsToday: number
  completedQuestsToday: number
  completionRate: number
  avgQuestsPerUser: number
}

interface PerformanceMetrics {
  avgResponseTime: number
  errorRate: number
  requestsPerMinute: number
  dbQueryTime: number
}

interface GameMetrics {
  avgPlayerLevel: number
  avgStreak: number
  activeBossFights: number
  activeGuilds: number
  totalXPToday: number
}

interface MetricsDashboard {
  users: UserMetrics
  quests: QuestMetrics
  performance: PerformanceMetrics
  game: GameMetrics
  timestamp: string
}

interface RecentError {
  timestamp: string
  message: string
  endpoint: string
}

export default function AdminPage() {
  const { user: _user } = useAuth()
  const [metrics, setMetrics] = useState<MetricsDashboard | null>(null)
  const [errors, setErrors] = useState<RecentError[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadMetrics()
    const interval = setInterval(loadMetrics, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [])

  async function loadMetrics() {
    try {
      const [metricsRes, errorsRes] = await Promise.all([
        fetch('/api/admin/metrics'),
        fetch('/api/admin/errors?limit=10'),
      ])
      
      if (!metricsRes.ok) {
        throw new Error('Failed to fetch metrics')
      }
      
      const metricsData = await metricsRes.json()
      const errorsData = await errorsRes.json()
      
      setMetrics(metricsData)
      setErrors(errorsData.errors || [])
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load metrics')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-gray-400">Loading metrics...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 mb-4">{error}</div>
          <button
            onClick={loadMetrics}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-400">
              Last updated: {metrics?.timestamp ? new Date(metrics.timestamp).toLocaleTimeString() : 'N/A'}
            </p>
          </div>
          <button
            onClick={loadMetrics}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded transition-colors"
          >
            Refresh
          </button>
        </div>

        {/* User Metrics */}
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-4 text-gray-300">User Activity</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <MetricCard label="DAU" value={metrics?.users.dailyActiveUsers ?? 0} />
            <MetricCard label="WAU" value={metrics?.users.weeklyActiveUsers ?? 0} />
            <MetricCard label="MAU" value={metrics?.users.monthlyActiveUsers ?? 0} />
            <MetricCard label="New Today" value={metrics?.users.newUsersToday ?? 0} color="green" />
            <MetricCard label="New This Week" value={metrics?.users.newUsersThisWeek ?? 0} color="green" />
          </div>
        </section>

        {/* Quest Metrics */}
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-4 text-gray-300">Quest Activity</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard label="Total Today" value={metrics?.quests.totalQuestsToday ?? 0} />
            <MetricCard label="Completed" value={metrics?.quests.completedQuestsToday ?? 0} />
            <MetricCard 
              label="Completion Rate" 
              value={`${(metrics?.quests.completionRate ?? 0).toFixed(1)}%`}
              color={metrics?.quests.completionRate && metrics.quests.completionRate > 70 ? 'green' : 'yellow'}
            />
            <MetricCard label="Avg/User" value={(metrics?.quests.avgQuestsPerUser ?? 0).toFixed(1)} />
          </div>
        </section>

        {/* Performance Metrics */}
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-4 text-gray-300">Performance</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard 
              label="Avg Response" 
              value={`${metrics?.performance.avgResponseTime ?? 0}ms`}
              color={metrics?.performance.avgResponseTime && metrics.performance.avgResponseTime < 200 ? 'green' : 'yellow'}
            />
            <MetricCard 
              label="Error Rate" 
              value={`${(metrics?.performance.errorRate ?? 0).toFixed(2)}%`}
              color={metrics?.performance.errorRate && metrics.performance.errorRate < 1 ? 'green' : 'red'}
            />
            <MetricCard label="Req/min" value={metrics?.performance.requestsPerMinute ?? 0} />
            <MetricCard label="DB Query Time" value={`${metrics?.performance.dbQueryTime ?? 0}ms`} />
          </div>
        </section>

        {/* Game Metrics */}
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-4 text-gray-300">Game Stats</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <MetricCard label="Avg Level" value={(metrics?.game.avgPlayerLevel ?? 0).toFixed(1)} />
            <MetricCard label="Avg Streak" value={(metrics?.game.avgStreak ?? 0).toFixed(1)} />
            <MetricCard label="Active Bosses" value={metrics?.game.activeBossFights ?? 0} />
            <MetricCard label="Active Guilds" value={metrics?.game.activeGuilds ?? 0} />
            <MetricCard label="XP Today" value={formatNumber(metrics?.game.totalXPToday ?? 0)} color="blue" />
          </div>
        </section>

        {/* Recent Errors */}
        <section>
          <h2 className="text-lg font-bold mb-4 text-gray-300">Recent Errors</h2>
          {errors.length === 0 ? (
            <div className="p-4 bg-gray-900 rounded border border-gray-800 text-gray-400 text-center">
              No recent errors 🎉
            </div>
          ) : (
            <div className="space-y-2">
              {errors.map((err, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-3 bg-red-900/20 rounded border border-red-800"
                >
                  <div className="flex items-center justify-between">
                    <code className="text-red-400 text-sm">{err.endpoint}</code>
                    <span className="text-xs text-gray-500">
                      {new Date(err.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 mt-1">{err.message}</p>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

interface MetricCardProps {
  label: string
  value: number | string
  color?: 'green' | 'yellow' | 'red' | 'blue'
}

function MetricCard({ label, value, color }: MetricCardProps) {
  const colorClasses = {
    green: 'text-green-400',
    yellow: 'text-yellow-400',
    red: 'text-red-400',
    blue: 'text-blue-400',
  }
  
  return (
    <div className="p-4 bg-gray-900 rounded border border-gray-800">
      <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">{label}</div>
      <div className={`text-2xl font-bold ${color ? colorClasses[color] : 'text-white'}`}>
        {value}
      </div>
    </div>
  )
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`
  }
  return num.toString()
}
