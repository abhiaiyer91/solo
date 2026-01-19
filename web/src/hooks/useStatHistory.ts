/**
 * useStatHistory - Track stat changes for visualization
 */

import { useState, useEffect, useMemo } from 'react'

export interface StatValue {
  label: 'STR' | 'AGI' | 'VIT' | 'DISC'
  value: number
  color: string
}

export interface StatSnapshot {
  date: string
  stats: StatValue[]
}

export interface StatChange {
  label: 'STR' | 'AGI' | 'VIT' | 'DISC'
  oldValue: number
  newValue: number
  delta: number
}

const STAT_COLORS = {
  STR: '#ef4444', // red
  AGI: '#22c55e', // green
  VIT: '#3b82f6', // blue
  DISC: '#a855f7', // purple
}

/**
 * Hook for tracking stat history and changes
 */
export function useStatHistory(currentStats: StatValue[]) {
  const [history, setHistory] = useState<StatSnapshot[]>([])
  const [previousStats, setPreviousStats] = useState<StatValue[]>([])
  const [recentlyChanged, setRecentlyChanged] = useState<string[]>([])

  // Detect changes
  useEffect(() => {
    if (previousStats.length === 0) {
      setPreviousStats(currentStats)
      return
    }

    const changes: string[] = []
    currentStats.forEach((stat) => {
      const prev = previousStats.find((p) => p.label === stat.label)
      if (prev && prev.value !== stat.value) {
        changes.push(stat.label)
      }
    })

    if (changes.length > 0) {
      // Add to history
      setHistory((prev) => [
        ...prev.slice(-9), // Keep last 10
        {
          date: new Date().toISOString(),
          stats: previousStats,
        },
      ])

      setRecentlyChanged(changes)
      setPreviousStats(currentStats)

      // Clear recently changed after 3 seconds
      const timer = setTimeout(() => {
        setRecentlyChanged([])
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [currentStats, previousStats])

  // Calculate changes
  const changes = useMemo((): StatChange[] => {
    if (previousStats.length === 0) return []

    return currentStats
      .map((stat) => {
        const prev = previousStats.find((p) => p.label === stat.label)
        if (!prev || prev.value === stat.value) return null
        return {
          label: stat.label,
          oldValue: prev.value,
          newValue: stat.value,
          delta: stat.value - prev.value,
        }
      })
      .filter((c): c is StatChange => c !== null)
  }, [currentStats, previousStats])

  return {
    history,
    recentlyChanged,
    changes,
    hasRecentChanges: recentlyChanged.length > 0,
  }
}

/**
 * Get color for stat type
 */
export function getStatColor(label: string): string {
  return STAT_COLORS[label as keyof typeof STAT_COLORS] ?? '#888888'
}

/**
 * Convert stat points to polygon coordinates
 */
export function getPolygonPoints(
  stats: StatValue[],
  centerX: number,
  centerY: number,
  maxRadius: number
): string {
  const points = stats.map((stat, i) => {
    const angle = (i / stats.length) * 2 * Math.PI - Math.PI / 2
    const radius = (stat.value / 100) * maxRadius
    const x = centerX + radius * Math.cos(angle)
    const y = centerY + radius * Math.sin(angle)
    return `${x},${y}`
  })
  return points.join(' ')
}

/**
 * Get position for a stat point
 */
export function getStatPosition(
  index: number,
  total: number,
  value: number,
  centerX: number,
  centerY: number,
  maxRadius: number
): { x: number; y: number } {
  const angle = (index / total) * 2 * Math.PI - Math.PI / 2
  const radius = (value / 100) * maxRadius
  return {
    x: centerX + radius * Math.cos(angle),
    y: centerY + radius * Math.sin(angle),
  }
}

/**
 * Stat achievements/milestones
 */
export const STAT_ACHIEVEMENTS = {
  STR: [
    { value: 25, label: '20-30 push-ups' },
    { value: 50, label: 'Intermediate lifter' },
    { value: 75, label: 'Advanced lifter' },
  ],
  AGI: [
    { value: 30, label: '10K capable' },
    { value: 50, label: 'Half-marathon ready' },
    { value: 75, label: 'Marathon runner' },
  ],
  VIT: [
    { value: 30, label: 'Recovery basics' },
    { value: 50, label: 'Consistent sleep' },
    { value: 75, label: 'Optimal recovery' },
  ],
  DISC: [
    { value: 30, label: 'Habit forming' },
    { value: 50, label: 'Consistent' },
    { value: 75, label: 'Disciplined' },
  ],
}
