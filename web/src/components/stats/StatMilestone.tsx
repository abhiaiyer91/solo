/**
 * StatMilestone - Shows progress to next stat milestone
 */

import { motion } from 'framer-motion'
import {
  type StatType,
  type StatBenchmark,
  getStatColor,
  getStatBorderColor,
} from '@/hooks/useStats'

interface StatMilestoneProps {
  stat: StatType
  value: number
  current: StatBenchmark
  next: StatBenchmark | null
  progressToNext: number
}

export function StatMilestone({
  stat,
  value,
  current,
  next,
  progressToNext,
}: StatMilestoneProps) {
  const statColor = getStatColor(stat)
  const borderColor = getStatBorderColor(stat)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-lg border ${borderColor} bg-system-panel/50 p-4`}
    >
      {/* Current Benchmark */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className={`font-bold ${statColor}`}>{stat}</span>
          <span className="text-system-text font-mono text-lg">{value}</span>
        </div>
        <div className="text-sm text-system-text-muted">
          {current.label}: {current.realWorldEquivalent}
        </div>
      </div>

      {/* Progress to Next */}
      {next && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-system-text-muted">Next: {next.label}</span>
            <span className="text-system-text-muted">{next.value}</span>
          </div>

          {/* Progress Bar */}
          <div className="h-2 bg-system-black rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, progressToNext)}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={`h-full bg-gradient-to-r ${
                stat === 'STR' ? 'from-red-600 to-red-400' :
                stat === 'AGI' ? 'from-green-600 to-green-400' :
                stat === 'VIT' ? 'from-blue-600 to-blue-400' :
                'from-purple-600 to-purple-400'
              }`}
            />
          </div>

          {/* Points to Go */}
          <div className="text-xs text-system-text-muted text-right">
            {next.value - value} points to go
          </div>
        </div>
      )}

      {/* Max Level Indicator */}
      {!next && (
        <div className="text-center py-2">
          <span className="text-system-gold text-sm font-bold">MAX LEVEL REACHED</span>
        </div>
      )}
    </motion.div>
  )
}

/**
 * StatMilestoneCompact - Compact version for lists
 */
interface StatMilestoneCompactProps {
  stat: StatType
  value: number
  current: StatBenchmark
  next: StatBenchmark | null
  progressToNext: number
}

export function StatMilestoneCompact({
  stat,
  value,
  current: _current,
  next,
  progressToNext,
}: StatMilestoneCompactProps) {
  const statColor = getStatColor(stat)

  return (
    <div className="flex items-center gap-3 p-2 rounded bg-system-panel/30">
      <span className={`font-bold w-12 ${statColor}`}>{stat}</span>
      <span className="font-mono w-8 text-right">{value}</span>
      
      <div className="flex-1">
        <div className="h-1.5 bg-system-black rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, progressToNext)}%` }}
            transition={{ duration: 0.5 }}
            className={`h-full ${
              stat === 'STR' ? 'bg-red-500' :
              stat === 'AGI' ? 'bg-green-500' :
              stat === 'VIT' ? 'bg-blue-500' :
              'bg-purple-500'
            }`}
          />
        </div>
      </div>
      
      <span className="text-xs text-system-text-muted w-20 text-right">
        {next ? `→ ${next.label}` : 'MAX'}
      </span>
    </div>
  )
}
