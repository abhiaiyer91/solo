/**
 * Metrics Service
 * 
 * Collects and provides metrics for admin dashboard.
 */

import { dbClient as db } from '../db'

function requireDb() {
  if (!db) {
    throw new Error('Database connection required for metrics service')
  }
  return db
}

/**
 * User activity metrics
 */
export interface UserMetrics {
  dailyActiveUsers: number
  weeklyActiveUsers: number
  monthlyActiveUsers: number
  newUsersToday: number
  newUsersThisWeek: number
}

/**
 * Quest metrics
 */
export interface QuestMetrics {
  totalQuestsToday: number
  completedQuestsToday: number
  completionRate: number
  avgQuestsPerUser: number
}

/**
 * Performance metrics
 */
export interface PerformanceMetrics {
  avgResponseTime: number
  errorRate: number
  requestsPerMinute: number
  dbQueryTime: number
}

/**
 * Game metrics
 */
export interface GameMetrics {
  avgPlayerLevel: number
  avgStreak: number
  activeBossFights: number
  activeGuilds: number
  totalXPToday: number
}

/**
 * Full metrics dashboard
 */
export interface MetricsDashboard {
  users: UserMetrics
  quests: QuestMetrics
  performance: PerformanceMetrics
  game: GameMetrics
  timestamp: string
}

// In-memory metrics storage (would use Redis/time-series DB in production)
const metricsStore: {
  requests: Array<{ timestamp: number; duration: number; error: boolean }>
  errors: Array<{ timestamp: number; message: string; endpoint: string }>
} = {
  requests: [],
  errors: [],
}

/**
 * Get user activity metrics
 */
export async function getUserMetrics(): Promise<UserMetrics> {
  // Would query from database
  requireDb()
  
  // Stub implementation
  return {
    dailyActiveUsers: 0,
    weeklyActiveUsers: 0,
    monthlyActiveUsers: 0,
    newUsersToday: 0,
    newUsersThisWeek: 0,
  }
}

/**
 * Get quest metrics
 */
export async function getQuestMetrics(): Promise<QuestMetrics> {
  requireDb()
  
  return {
    totalQuestsToday: 0,
    completedQuestsToday: 0,
    completionRate: 0,
    avgQuestsPerUser: 0,
  }
}

/**
 * Get performance metrics
 */
export function getPerformanceMetrics(): PerformanceMetrics {
  const now = Date.now()
  const oneMinuteAgo = now - 60000
  
  const recentRequests = metricsStore.requests.filter(
    r => r.timestamp > oneMinuteAgo
  )
  
  const avgResponseTime = recentRequests.length > 0
    ? recentRequests.reduce((sum, r) => sum + r.duration, 0) / recentRequests.length
    : 0
  
  const errorCount = recentRequests.filter(r => r.error).length
  const errorRate = recentRequests.length > 0
    ? (errorCount / recentRequests.length) * 100
    : 0
  
  return {
    avgResponseTime: Math.round(avgResponseTime),
    errorRate: Math.round(errorRate * 100) / 100,
    requestsPerMinute: recentRequests.length,
    dbQueryTime: 0, // Would measure actual DB queries
  }
}

/**
 * Get game metrics
 */
export async function getGameMetrics(): Promise<GameMetrics> {
  requireDb()
  
  return {
    avgPlayerLevel: 0,
    avgStreak: 0,
    activeBossFights: 0,
    activeGuilds: 0,
    totalXPToday: 0,
  }
}

/**
 * Get full metrics dashboard
 */
export async function getMetricsDashboard(): Promise<MetricsDashboard> {
  const [users, quests, game] = await Promise.all([
    getUserMetrics(),
    getQuestMetrics(),
    getGameMetrics(),
  ])
  
  const performance = getPerformanceMetrics()
  
  return {
    users,
    quests,
    performance,
    game,
    timestamp: new Date().toISOString(),
  }
}

/**
 * Record a request for metrics
 */
export function recordRequest(duration: number, error: boolean = false): void {
  const now = Date.now()
  
  metricsStore.requests.push({
    timestamp: now,
    duration,
    error,
  })
  
  // Clean up old entries (keep last 5 minutes)
  const fiveMinutesAgo = now - 300000
  metricsStore.requests = metricsStore.requests.filter(
    r => r.timestamp > fiveMinutesAgo
  )
}

/**
 * Record an error for metrics
 */
export function recordError(message: string, endpoint: string): void {
  const now = Date.now()
  
  metricsStore.errors.push({
    timestamp: now,
    message,
    endpoint,
  })
  
  // Clean up old entries (keep last hour)
  const oneHourAgo = now - 3600000
  metricsStore.errors = metricsStore.errors.filter(
    e => e.timestamp > oneHourAgo
  )
}

/**
 * Get recent errors
 */
export function getRecentErrors(limit: number = 10): Array<{
  timestamp: string
  message: string
  endpoint: string
}> {
  return metricsStore.errors
    .slice(-limit)
    .reverse()
    .map(e => ({
      timestamp: new Date(e.timestamp).toISOString(),
      message: e.message,
      endpoint: e.endpoint,
    }))
}

/**
 * Get metrics time series (for charts)
 */
export function getMetricsTimeSeries(
  metric: 'requests' | 'errors',
  intervalMinutes: number = 5,
  periodHours: number = 1
): Array<{ time: string; value: number }> {
  const now = Date.now()
  const periodMs = periodHours * 3600000
  const intervalMs = intervalMinutes * 60000
  const buckets: Map<number, number> = new Map()
  
  // Initialize buckets
  for (let t = now - periodMs; t <= now; t += intervalMs) {
    buckets.set(Math.floor(t / intervalMs) * intervalMs, 0)
  }
  
  // Fill buckets
  const data = metric === 'requests' ? metricsStore.requests : metricsStore.errors
  for (const item of data) {
    if (item.timestamp > now - periodMs) {
      const bucket = Math.floor(item.timestamp / intervalMs) * intervalMs
      buckets.set(bucket, (buckets.get(bucket) ?? 0) + 1)
    }
  }
  
  // Convert to array
  return Array.from(buckets.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([time, value]) => ({
      time: new Date(time).toISOString(),
      value,
    }))
}
