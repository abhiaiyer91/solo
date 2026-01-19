/**
 * Weekly Summary Component
 * Modal displayed on Monday mornings summarizing the previous week
 */

import { motion, AnimatePresence } from 'framer-motion'
import { SystemMessage } from '@/components/system'
import { CountUp } from '@/components/animations/CountUp'
import type { WeeklySummary as WeeklySummaryData } from '@/hooks/useWeeklySummary'
import { formatWeekRange } from '@/hooks/useWeeklySummary'

interface WeeklySummaryProps {
  isVisible: boolean
  summary: WeeklySummaryData
  onDismiss: () => void
}

/**
 * Trend indicator arrow
 */
function TrendIndicator({ value }: { value: number }) {
  if (value > 5) {
    return <span className="text-system-green text-xs">+{value}%</span>
  } else if (value < -5) {
    return <span className="text-system-red text-xs">{value}%</span>
  }
  return <span className="text-system-text-muted text-xs">--</span>
}

/**
 * Stat box for displaying metrics
 */
function StatBox({
  label,
  value,
  unit,
  trend,
  highlight,
}: {
  label: string
  value: number | string
  unit?: string
  trend?: number
  highlight?: 'gold' | 'green' | 'blue'
}) {
  const colorClass = {
    gold: 'text-system-gold',
    green: 'text-system-green',
    blue: 'text-system-blue',
  }[highlight ?? 'blue']

  return (
    <div className="bg-system-bg/50 border border-system-border rounded-lg p-4">
      <p className="text-xs text-system-text-muted uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-2xl font-bold ${colorClass}`}>
        {typeof value === 'number' ? <CountUp from={0} to={value} duration={0.8} /> : value}
        {unit && <span className="text-sm ml-1">{unit}</span>}
      </p>
      {trend !== undefined && (
        <div className="mt-1">
          <TrendIndicator value={trend} />
          <span className="text-xs text-system-text-muted ml-1">vs last week</span>
        </div>
      )}
    </div>
  )
}

export function WeeklySummary({ isVisible, summary, onDismiss }: WeeklySummaryProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={onDismiss}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="bg-system-panel border border-system-border rounded-xl max-w-md w-full overflow-hidden"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-system-bg/50 px-6 py-4 border-b border-system-border">
              <p className="text-system-blue text-xs font-bold tracking-[0.2em] uppercase mb-1">
                [SYSTEM] Weekly Report
              </p>
              <p className="text-system-text font-medium">
                {formatWeekRange(summary.weekStart, summary.weekEnd)}
              </p>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Narrative observation */}
              <SystemMessage variant="default">
                {summary.observation}
              </SystemMessage>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-3">
                <StatBox
                  label="Days Completed"
                  value={summary.daysCompleted}
                  unit={`/${summary.totalDays}`}
                  trend={summary.comparedToLastWeek?.daysChange}
                  highlight="blue"
                />
                <StatBox
                  label="Core Completion"
                  value={summary.coreCompletionRate}
                  unit="%"
                  trend={summary.comparedToLastWeek?.completionChange}
                  highlight={summary.coreCompletionRate >= 80 ? 'green' : 'blue'}
                />
                <StatBox
                  label="XP Earned"
                  value={summary.xpEarned}
                  trend={summary.comparedToLastWeek?.xpChange}
                  highlight="gold"
                />
                <StatBox
                  label="Current Streak"
                  value={summary.currentStreak}
                  unit="days"
                  highlight={summary.currentStreak >= 7 ? 'gold' : 'blue'}
                />
              </div>

              {/* Perfect days indicator */}
              {summary.perfectDays > 0 && (
                <div className="flex items-center gap-2 text-system-green">
                  <span>+</span>
                  <span className="text-sm">
                    {summary.perfectDays} perfect day{summary.perfectDays !== 1 ? 's' : ''} achieved
                  </span>
                </div>
              )}

              {/* Achievements */}
              {summary.achievements.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-system-text-muted uppercase tracking-wider">
                    Achievements
                  </p>
                  <div className="space-y-1">
                    {summary.achievements.map((achievement, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 bg-system-green/10 border border-system-green/30 rounded px-3 py-2"
                      >
                        <span className="text-system-green">+</span>
                        <span className="text-sm text-system-green">{achievement}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New week message */}
              <div className="text-center text-system-text-muted text-sm pt-2 border-t border-system-border">
                This week's slate is clean.
                <br />
                What you did last week is recorded.
                <br />
                What you do this week is undetermined.
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-system-bg/30 border-t border-system-border">
              <button
                type="button"
                onClick={onDismiss}
                className="w-full py-2 px-4 rounded-lg bg-system-blue/20 border border-system-blue/50 text-system-blue text-sm font-medium hover:bg-system-blue/30 transition-colors"
              >
                Begin the Week
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/**
 * Compact weekly summary card for stats page
 */
export function WeeklySummaryCard({ summary }: { summary: WeeklySummaryData }) {
  return (
    <div className="bg-system-panel border border-system-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-system-text">
          {formatWeekRange(summary.weekStart, summary.weekEnd)}
        </p>
        <span
          className={`text-xs px-2 py-1 rounded ${
            summary.coreCompletionRate >= 80
              ? 'bg-system-green/20 text-system-green'
              : summary.coreCompletionRate >= 50
                ? 'bg-system-gold/20 text-system-gold'
                : 'bg-system-text-muted/20 text-system-text-muted'
          }`}
        >
          {summary.coreCompletionRate}%
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-lg font-bold text-system-blue">{summary.daysCompleted}/7</p>
          <p className="text-xs text-system-text-muted">days</p>
        </div>
        <div>
          <p className="text-lg font-bold text-system-gold">+{summary.xpEarned}</p>
          <p className="text-xs text-system-text-muted">XP</p>
        </div>
        <div>
          <p className="text-lg font-bold text-system-green">{summary.perfectDays}</p>
          <p className="text-xs text-system-text-muted">perfect</p>
        </div>
      </div>

      {summary.achievements.length > 0 && (
        <div className="mt-3 pt-3 border-t border-system-border">
          <p className="text-xs text-system-text-muted">
            {summary.achievements.length} achievement{summary.achievements.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  )
}

export default WeeklySummary
