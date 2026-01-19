/**
 * StatHistory - Historical overlay layer for stat hexagon
 */

import { motion } from 'framer-motion'
import {
  type StatSnapshot,
  type StatValue,
  getPolygonPoints,
  getStatPosition,
  getStatColor,
  STAT_ACHIEVEMENTS,
} from '../../hooks/useStatHistory'

interface StatHistoryProps {
  history: StatSnapshot[]
  centerX: number
  centerY: number
  maxRadius: number
}

/**
 * History trail showing previous stat values
 */
export function StatHistoryTrail({
  history,
  centerX,
  centerY,
  maxRadius,
}: StatHistoryProps) {
  // Show last 3 snapshots
  const snapshots = history.slice(-3)

  return (
    <g className="stat-history">
      {snapshots.map((snapshot, i) => (
        <polygon
          key={snapshot.date}
          points={getPolygonPoints(snapshot.stats, centerX, centerY, maxRadius)}
          fill="none"
          stroke="currentColor"
          strokeWidth={1}
          strokeDasharray="4 2"
          className="text-gray-700"
          style={{ opacity: 0.15 + i * 0.1 }}
        />
      ))}
    </g>
  )
}

interface StatComparisonProps {
  userStats: StatValue[]
  comparisonStats: StatValue[]
  comparisonLabel: string
  centerX: number
  centerY: number
  maxRadius: number
}

/**
 * Comparison overlay (You vs Shadow/Average)
 */
export function StatComparison({
  userStats: _userStats,
  comparisonStats,
  comparisonLabel: _comparisonLabel,
  centerX,
  centerY,
  maxRadius,
}: StatComparisonProps) {
  return (
    <g className="stat-comparison">
      <motion.polygon
        points={getPolygonPoints(comparisonStats, centerX, centerY, maxRadius)}
        fill="rgba(168, 85, 247, 0.1)"
        stroke="#a855f7"
        strokeWidth={1.5}
        strokeDasharray="4 2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      />
    </g>
  )
}

interface AchievementMarkersProps {
  stats: StatValue[]
  centerX: number
  centerY: number
  maxRadius: number
}

/**
 * Achievement markers at threshold values
 */
export function AchievementMarkers({
  stats,
  centerX,
  centerY,
  maxRadius,
}: AchievementMarkersProps) {
  return (
    <g className="achievement-markers">
      {stats.map((stat, i) => {
        const achievements = STAT_ACHIEVEMENTS[stat.label as keyof typeof STAT_ACHIEVEMENTS]
        if (!achievements) return null

        return achievements.map((achievement) => {
          const pos = getStatPosition(
            i,
            stats.length,
            achievement.value,
            centerX,
            centerY,
            maxRadius
          )

          const isAchieved = stat.value >= achievement.value

          return (
            <motion.circle
              key={`${stat.label}-${achievement.value}`}
              cx={pos.x}
              cy={pos.y}
              r={3}
              fill={isAchieved ? '#ffd700' : 'none'}
              stroke={isAchieved ? '#ffd700' : '#4a4a4a'}
              strokeWidth={1}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.1 }}
            />
          )
        })
      })}
    </g>
  )
}

interface GlowingStatPointsProps {
  stats: StatValue[]
  recentlyChanged: string[]
  centerX: number
  centerY: number
  maxRadius: number
}

/**
 * Stat points with glow for recent changes
 */
export function GlowingStatPoints({
  stats,
  recentlyChanged,
  centerX,
  centerY,
  maxRadius,
}: GlowingStatPointsProps) {
  return (
    <g className="stat-points">
      {stats.map((stat, i) => {
        const pos = getStatPosition(i, stats.length, stat.value, centerX, centerY, maxRadius)
        const isRecent = recentlyChanged.includes(stat.label)
        const color = getStatColor(stat.label)

        return (
          <g key={stat.label}>
            {/* Glow effect for recent changes */}
            {isRecent && (
              <motion.circle
                cx={pos.x}
                cy={pos.y}
                r={12}
                fill={color}
                initial={{ opacity: 0.8, scale: 1 }}
                animate={{
                  opacity: [0.8, 0.3, 0.8],
                  scale: [1, 1.5, 1],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  ease: 'easeInOut',
                }}
                className="blur-sm"
              />
            )}

            {/* Main point */}
            <motion.circle
              cx={pos.x}
              cy={pos.y}
              r={4}
              fill={color}
              whileHover={{ r: 6 }}
            />
          </g>
        )
      })}
    </g>
  )
}

interface DangerZoneProps {
  stats: StatValue[]
}

/**
 * Warning for low stats
 */
export function DangerZoneWarning({ stats }: DangerZoneProps) {
  const dangerStats = stats.filter((s) => s.value < 20)

  if (dangerStats.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute -bottom-8 left-1/2 -translate-x-1/2"
    >
      <span className="text-xs font-mono text-red-400 uppercase">
        ⚠ {dangerStats.map((s) => s.label).join(', ')} low
      </span>
    </motion.div>
  )
}
