/**
 * BodyCompositionWidget - Dashboard widget for body composition tracking
 */

import { motion } from 'framer-motion'
import { useBodySettings, useBodyProgress, formatWeight, getTrendIndicator } from '@/hooks/useBodyComposition'

export function BodyCompositionWidget() {
  const { data: settings, isLoading: loadingSettings } = useBodySettings()
  const { data: progress, isLoading: loadingProgress } = useBodyProgress(30)

  // Don't show if not tracking
  if (loadingSettings || !settings?.trackBodyComposition) {
    return null
  }

  if (loadingProgress) {
    return (
      <div className="system-window p-4 animate-pulse">
        <div className="h-4 bg-system-panel rounded w-32 mb-3" />
        <div className="h-8 bg-system-panel rounded w-24 mb-2" />
        <div className="h-16 bg-system-panel rounded w-full" />
      </div>
    )
  }

  const summary = progress?.summary
  const trend = summary?.trend ? getTrendIndicator(summary.trend) : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="system-window p-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-system-blue flex items-center gap-2">
          <span className="text-system-blue">{'>'}</span>
          BODY COMPOSITION
        </h3>
        {trend && (
          <span className={`text-xs ${trend.color}`}>
            {trend.icon} {trend.label}
          </span>
        )}
      </div>

      {/* Weight Display */}
      {summary?.currentWeight ? (
        <div className="mb-4">
          <div className="text-2xl font-bold text-system-text mb-1">
            {formatWeight(summary.currentWeight)}
          </div>
          {summary.weightChange !== null && (
            <div className={`text-sm ${summary.weightChange < 0 ? 'text-system-green' : summary.weightChange > 0 ? 'text-red-400' : 'text-system-text-muted'}`}>
              {summary.weightChange > 0 ? '+' : ''}
              {formatWeight(summary.weightChange)} this month
            </div>
          )}
        </div>
      ) : (
        <div className="mb-4 text-system-text-muted text-sm">
          No weight data logged yet
        </div>
      )}

      {/* Deficit Stats */}
      <div className="grid grid-cols-2 gap-3">
        <DeficitStat
          label="Total Deficit"
          value={`${summary?.totalDeficit?.toLocaleString() ?? 0} cal`}
          sublabel={`≈ ${((summary?.totalDeficit ?? 0) / 3500).toFixed(1)} lb`}
        />
        <DeficitStat
          label="Days Logged"
          value={String(summary?.daysLogged ?? 0)}
          sublabel="this month"
        />
      </div>

      {/* Mini Chart placeholder */}
      {(progress?.logs?.length ?? 0) > 1 && (
        <MiniWeightChart 
          logs={progress?.logs ?? []} 
        />
      )}
    </motion.div>
  )
}

function DeficitStat({
  label,
  value,
  sublabel,
}: {
  label: string
  value: string
  sublabel: string
}) {
  return (
    <div className="bg-system-panel/50 rounded p-2">
      <div className="text-xs text-system-text-muted mb-1">{label}</div>
      <div className="text-lg font-mono text-system-text">{value}</div>
      <div className="text-xs text-system-text-muted">{sublabel}</div>
    </div>
  )
}

/**
 * Mini weight chart using pure SVG
 */
function MiniWeightChart({
  logs,
}: {
  logs: Array<{ date: string; weight: number | null }>
}) {
  const validLogs = logs.filter(l => l.weight !== null) as Array<{ date: string; weight: number }>
  
  if (validLogs.length < 2) return null

  const weights = validLogs.map(l => l.weight)
  const minWeight = Math.min(...weights)
  const maxWeight = Math.max(...weights)
  const range = maxWeight - minWeight || 1

  // Generate SVG path
  const width = 100
  const height = 40
  const padding = 2

  const points = validLogs.map((log, i) => {
    const x = padding + ((width - padding * 2) / (validLogs.length - 1)) * i
    const y = height - padding - ((log.weight - minWeight) / range) * (height - padding * 2)
    return `${x},${y}`
  })

  const pathD = `M ${points.join(' L ')}`

  return (
    <div className="mt-3 pt-3 border-t border-system-text/10">
      <div className="text-xs text-system-text-muted mb-1">30-Day Trend</div>
      <svg 
        viewBox={`0 0 ${width} ${height}`} 
        className="w-full h-10"
        preserveAspectRatio="none"
      >
        {/* Gradient */}
        <defs>
          <linearGradient id="weightGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--system-blue)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--system-blue)" stopOpacity="0.8" />
          </linearGradient>
        </defs>
        
        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke="url(#weightGradient)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* End point */}
        {points.length > 0 && (
          <circle
            cx={parseFloat(points[points.length - 1]!.split(',')[0]!)}
            cy={parseFloat(points[points.length - 1]!.split(',')[1]!)}
            r="3"
            fill="var(--system-blue)"
          />
        )}
      </svg>
    </div>
  )
}
