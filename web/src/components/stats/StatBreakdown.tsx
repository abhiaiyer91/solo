/**
 * StatBreakdown - Shows detailed stat breakdown with real-world context
 */

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import {
  type StatType,
  type StatBreakdown as StatBreakdownType,
  getStatColor,
  getStatBgColor,
  getStatBorderColor,
  getStatIcon,
} from '@/hooks/useStats'

interface StatBreakdownCardProps {
  data: StatBreakdownType
}

export function StatBreakdownCard({ data }: StatBreakdownCardProps) {
  const [showDetails, setShowDetails] = useState(false)
  const statColor = getStatColor(data.stat)
  const bgColor = getStatBgColor(data.stat)
  const borderColor = getStatBorderColor(data.stat)
  const icon = getStatIcon(data.stat)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`rounded-lg border ${borderColor} ${bgColor} p-4 cursor-pointer`}
      onClick={() => setShowDetails(!showDetails)}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <span className={`font-bold text-lg ${statColor}`}>{data.stat}</span>
        </div>
        <span className="font-mono text-2xl text-system-text">{data.value}</span>
      </div>

      {/* Current Benchmark */}
      <div className="mb-3">
        <div className={`text-sm font-medium ${statColor}`}>
          {data.benchmark.current.label}
        </div>
        <div className="text-xs text-system-text-muted">
          {data.benchmark.current.realWorldEquivalent}
        </div>
      </div>

      {/* Progress Bar */}
      {data.benchmark.next && (
        <div className="mb-3">
          <div className="h-2 bg-system-black/50 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${data.benchmark.progressToNext}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={`h-full ${
                data.stat === 'STR' ? 'bg-red-500' :
                data.stat === 'AGI' ? 'bg-green-500' :
                data.stat === 'VIT' ? 'bg-blue-500' :
                'bg-purple-500'
              }`}
            />
          </div>
          <div className="flex justify-between text-xs mt-1">
            <span className="text-system-text-muted">
              {data.benchmark.progressToNext}% to {data.benchmark.next.label}
            </span>
            <span className="text-system-text-muted">
              {data.benchmark.next.value - data.value} pts
            </span>
          </div>
        </div>
      )}

      {/* Expandable Details */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            {/* Breakdown */}
            <div className="pt-3 border-t border-system-text/10">
              <div className="text-xs text-system-text-muted mb-2">BREAKDOWN</div>
              <div className="space-y-1">
                <BreakdownRow 
                  label="Baseline" 
                  value={data.breakdown.baseline} 
                  color="text-system-text-muted" 
                />
                <BreakdownRow 
                  label="Activity" 
                  value={data.breakdown.activity} 
                  color="text-system-green" 
                />
                {data.breakdown.streak > 0 && (
                  <BreakdownRow 
                    label="Streak Bonus" 
                    value={data.breakdown.streak} 
                    color="text-system-gold" 
                  />
                )}
              </div>
            </div>

            {/* How to Improve */}
            <div className="pt-3 mt-3 border-t border-system-text/10">
              <div className="text-xs text-system-text-muted mb-2">HOW TO IMPROVE</div>
              <ul className="space-y-1">
                {data.howToImprove.slice(0, 3).map((tip, i) => (
                  <li key={i} className="text-xs text-system-text flex items-start gap-2">
                    <span className="text-system-blue">{'>'}</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expand Hint */}
      <div className="text-center mt-2">
        <span className="text-xs text-system-text-muted">
          {showDetails ? 'Click to collapse' : 'Click for details'}
        </span>
      </div>
    </motion.div>
  )
}

function BreakdownRow({
  label,
  value,
  color,
}: {
  label: string
  value: number
  color: string
}) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-xs text-system-text">{label}</span>
      <span className={`text-xs font-mono ${color}`}>+{value}</span>
    </div>
  )
}

/**
 * StatBreakdownTooltip - Hover tooltip version
 */
interface StatBreakdownTooltipProps {
  stat: StatType
  baseline: number
  activity: number
  streak?: number
}

export function StatBreakdownTooltip({
  stat,
  baseline,
  activity,
  streak = 0,
}: StatBreakdownTooltipProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative inline-block">
      <button
        className="text-xs text-system-text-muted hover:text-system-text underline"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        View breakdown
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-40 p-2 bg-system-panel border border-system-text/10 rounded shadow-lg z-10"
          >
            <div className="text-xs font-bold mb-1">{stat} Breakdown</div>
            <BreakdownRow label="Baseline" value={baseline} color="text-system-text-muted" />
            <BreakdownRow label="Activity" value={activity} color="text-system-green" />
            {streak > 0 && (
              <BreakdownRow label="Streak" value={streak} color="text-system-gold" />
            )}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-system-panel border-r border-b border-system-text/10" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
