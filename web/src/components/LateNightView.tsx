/**
 * LateNightView - Post-day-close UI component
 * Shows when app is opened after quiet hours begin
 */

import { motion } from 'framer-motion'
import { useQuietHoursState, formatQuietHoursRange } from '../hooks/useQuietHours'

interface LateNightViewProps {
  settings: {
    enabled: boolean
    startTime: string
    endTime: string
    timezone: string
  }
  daySummary?: {
    questsCompleted: number
    totalQuests: number
    xpEarned: number
    streak: number
  }
  onDismiss?: () => void
}

export function LateNightView({ settings, daySummary, onDismiss }: LateNightViewProps) {
  const state = useQuietHoursState(settings)

  if (!state.isActive) return null

  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-slate-950/95 z-50 flex items-center justify-center p-6"
    >
      <div className="max-w-md w-full text-center">
        {/* Moon icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-6xl mb-6"
        >
          🌙
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="font-mono text-xl text-slate-300 mb-2"
        >
          The Day Has Closed
        </motion.h1>

        {/* Message */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="font-mono text-sm text-slate-500 mb-8"
        >
          Tomorrow begins at midnight. Rest now.
        </motion.p>

        {/* Day Summary */}
        {daySummary && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 mb-8"
          >
            <p className="font-mono text-xs text-slate-600 mb-3">TODAY'S SUMMARY</p>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-mono text-2xl text-white">
                  {daySummary.questsCompleted}/{daySummary.totalQuests}
                </p>
                <p className="font-mono text-xs text-slate-500">Quests</p>
              </div>
              <div>
                <p className="font-mono text-2xl text-amber-400">
                  +{daySummary.xpEarned}
                </p>
                <p className="font-mono text-xs text-slate-500">XP Earned</p>
              </div>
            </div>

            {daySummary.streak > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-800">
                <p className="font-mono text-sm text-orange-400">
                  🔥 {daySummary.streak} day streak maintained
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* Quiet hours info */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="font-mono text-xs text-slate-600 mb-6"
        >
          Quiet hours: {formatQuietHoursRange(settings.startTime, settings.endTime)}
        </motion.p>

        {/* Dismiss button */}
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          onClick={onDismiss}
          className="px-6 py-2 bg-slate-800/50 hover:bg-slate-800 
                     border border-slate-700 text-slate-400 font-mono 
                     text-sm rounded transition-colors"
        >
          Continue Anyway
        </motion.button>
      </div>
    </motion.div>
  )
}

/**
 * Quiet hours banner for regular views
 */
export function QuietHoursBanner({ 
  endTime,
  onDismiss,
}: { 
  endTime: string
  onDismiss?: () => void 
}) {
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="bg-slate-900/80 border-b border-slate-800"
    >
      <div className="max-w-4xl mx-auto px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span>🌙</span>
          <span className="font-mono text-xs text-slate-400">
            Quiet hours active until {formatTime(endTime)}
          </span>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-slate-600 hover:text-slate-400 text-xs"
          >
            ✕
          </button>
        )}
      </div>
    </motion.div>
  )
}

function formatTime(time24: string): string {
  const [h, m] = time24.split(':').map(Number)
  const period = h! >= 12 ? 'PM' : 'AM'
  const hour12 = h! % 12 || 12
  return `${hour12}:${m!.toString().padStart(2, '0')} ${period}`
}

/**
 * Sleep encouragement message
 */
export function SleepEncouragement() {
  return (
    <div className="bg-indigo-950/30 border border-indigo-900/30 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <span className="text-xl">😴</span>
        <div>
          <p className="font-mono text-sm text-indigo-300">
            Sleep is recovery.
          </p>
          <p className="font-mono text-xs text-indigo-400/70 mt-1">
            Adequate rest improves performance, focus, and discipline.
            Tomorrow's quests await.
          </p>
        </div>
      </div>
    </div>
  )
}
