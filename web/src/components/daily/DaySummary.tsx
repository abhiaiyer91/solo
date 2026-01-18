import { motion } from 'framer-motion'

export interface DaySummaryData {
  date: string
  dayNumber: number
  coreQuestsCompleted: number
  coreQuestsTotal: number
  bonusQuestsCompleted: number
  xpEarned: number
  xpMultiplier: number
  finalXP: number
  isPerfectDay: boolean
  streakMaintained: boolean
  currentStreak: number
  level: number
  levelProgress: {
    current: number
    needed: number
    percent: number
  }
}

interface DaySummaryProps {
  summary: DaySummaryData
  onDismiss?: () => void
}

export function DaySummary({ summary, onDismiss }: DaySummaryProps) {
  const questsComplete = summary.coreQuestsCompleted >= summary.coreQuestsTotal

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="system-window p-6"
    >
      {/* Header */}
      <div className="text-center mb-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold text-system-text">
            DAY {summary.dayNumber} COMPLETE
          </h2>
        </motion.div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-system-border to-transparent mb-6" />

      {/* Quest Completion */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-system-text-muted text-sm">Core Quests</span>
          <span className={`font-bold ${questsComplete ? 'text-system-green' : 'text-system-red'}`}>
            {summary.coreQuestsCompleted} / {summary.coreQuestsTotal}
          </span>
        </div>
        {summary.bonusQuestsCompleted > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-system-text-muted text-sm">Bonus Quests</span>
            <span className="text-system-purple font-bold">{summary.bonusQuestsCompleted}</span>
          </div>
        )}
      </motion.div>

      {/* XP Summary */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
        className="p-4 border border-system-border rounded bg-system-black/30 mb-6"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-system-text-muted text-sm">XP Earned</span>
          <span className="text-system-blue font-bold">{summary.xpEarned}</span>
        </div>
        {summary.xpMultiplier > 1 && (
          <div className="flex items-center justify-between mb-2">
            <span className="text-system-text-muted text-sm">
              Streak Multiplier ({summary.currentStreak} days)
            </span>
            <span className="text-system-gold font-bold">x{summary.xpMultiplier.toFixed(2)}</span>
          </div>
        )}
        <div className="h-px bg-system-border my-2" />
        <div className="flex items-center justify-between">
          <span className="text-system-text font-medium">Final XP</span>
          <span className="text-system-green text-xl font-bold">+{summary.finalXP}</span>
        </div>
      </motion.div>

      {/* Streak Status */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
        className={`p-4 border rounded mb-6 ${
          summary.streakMaintained
            ? 'border-system-gold/30 bg-system-gold/5'
            : 'border-system-red/30 bg-system-red/5'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-system-text-muted text-sm">Streak</span>
          <span
            className={`text-2xl font-bold ${
              summary.streakMaintained ? 'text-system-gold' : 'text-system-red'
            }`}
          >
            {summary.currentStreak} days
          </span>
        </div>
        {summary.streakMaintained ? (
          <p className="text-system-gold/70 text-xs mt-2">
            The pattern holds. Continue.
          </p>
        ) : (
          <p className="text-system-red/70 text-xs mt-2">
            The streak was broken. Begin again tomorrow.
          </p>
        )}
      </motion.div>

      {/* Level Progress */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.6 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-system-text">Level {summary.level}</span>
          <span className="text-system-blue text-sm">
            {summary.levelProgress.current} / {summary.levelProgress.needed} XP
          </span>
        </div>
        <div className="xp-bar">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${summary.levelProgress.percent}%` }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="xp-bar-fill"
          />
        </div>
      </motion.div>

      {/* Perfect Day Badge */}
      {summary.isPerfectDay && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
          className="p-4 border border-system-purple/50 bg-system-purple/10 rounded mb-6 text-center"
        >
          <span className="text-system-purple font-bold text-lg">PERFECT DAY</span>
          <p className="text-system-purple/70 text-xs mt-1">
            All quests completed. The System approves.
          </p>
        </motion.div>
      )}

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-system-border to-transparent mb-6" />

      {/* Footer Message */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="text-center"
      >
        <p className="text-system-text-muted text-sm mb-4">
          Tomorrow's quests generate at midnight.
        </p>
        <p className="text-system-text-muted text-xs">
          Rest well. The System continues.
        </p>
      </motion.div>

      {/* Dismiss Button */}
      {onDismiss && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-6"
        >
          <button
            type="button"
            onClick={onDismiss}
            className="w-full btn-secondary"
          >
            Dismiss
          </button>
        </motion.div>
      )}
    </motion.div>
  )
}

/**
 * Component shown when viewing app after day is closed
 */
interface LateNightModeProps {
  timeUntilMidnight: { hours: number; minutes: number }
  onViewSummary: () => void
}

export function LateNightMode({ timeUntilMidnight, onViewSummary }: LateNightModeProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="system-window p-6"
    >
      <div className="text-center mb-6">
        <p className="text-system-text-muted text-sm">Day is closed.</p>
        <p className="text-system-text-muted text-sm">
          Day begins at midnight.
        </p>
      </div>

      {/* Countdown */}
      <div className="text-center mb-6">
        <span className="text-system-text-muted text-sm">Time until new day:</span>
        <div className="text-3xl font-bold text-system-blue mt-2">
          {timeUntilMidnight.hours}h {timeUntilMidnight.minutes}m
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-system-border to-transparent my-6" />

      {/* System Message */}
      <div className="text-center mb-6">
        <p className="text-system-text-muted text-sm leading-relaxed">
          The System does not encourage late-night activity.
        </p>
        <p className="text-system-text-muted text-sm leading-relaxed">
          Sleep affects recovery.
        </p>
        <p className="text-system-text-muted text-sm leading-relaxed">
          Recovery affects tomorrow.
        </p>
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-system-border to-transparent my-6" />

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onViewSummary}
          className="flex-1 btn-secondary"
        >
          View Today's Summary
        </button>
      </div>
    </motion.div>
  )
}
