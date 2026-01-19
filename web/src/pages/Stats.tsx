import { motion } from 'framer-motion'
import { usePlayer, useLevelProgress } from '@/hooks/usePlayer'
import { StatHexagon, StatCard } from '@/components/stats'
import { useWeeklyHistory } from '@/hooks/useWeeklySummary'
import { WeeklySummaryCard } from '@/components/weekly/WeeklySummary'

// Stat colors matching the design system
const STAT_COLORS = {
  STR: '#ff6b6b',
  AGI: '#4ecdc4',
  VIT: '#ffe66d',
  DISC: '#c792ea',
}

export function Stats() {
  const { data: player, isLoading: playerLoading } = usePlayer()
  const { data: levelProgress } = useLevelProgress()
  const { data: weeklyHistory } = useWeeklyHistory(4)

  if (playerLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="system-window p-8">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 border-2 border-system-blue border-t-transparent rounded-full animate-spin" />
            <span className="text-system-text-muted">LOADING STATS...</span>
          </div>
        </div>
      </div>
    )
  }

  const stats = [
    {
      label: 'STR',
      value: player?.str ?? 10,
      color: STAT_COLORS.STR,
      description: 'Strength from workout completion',
    },
    {
      label: 'AGI',
      value: player?.agi ?? 10,
      color: STAT_COLORS.AGI,
      description: 'Agility from movement quests',
    },
    {
      label: 'VIT',
      value: player?.vit ?? 10,
      color: STAT_COLORS.VIT,
      description: 'Vitality from recovery tasks',
    },
    {
      label: 'DISC',
      value: player?.disc ?? 10,
      color: STAT_COLORS.DISC,
      description: 'Discipline from consistency',
    },
  ]

  const totalStats = stats.reduce((sum, s) => sum + s.value, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="system-window p-6"
      >
        <h1 className="text-xl font-bold text-system-blue mb-2">
          HUNTER STATISTICS
        </h1>
        <p className="text-system-text-muted text-sm">
          Level {player?.level ?? 1} • {player?.name || 'Hunter'} • Total Stat
          Points: {totalStats}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stat Hexagon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="system-window p-6 flex items-center justify-center"
        >
          <StatHexagon stats={stats} size={300} />
        </motion.div>

        {/* Stat Cards */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
            >
              <StatCard
                label={stat.label}
                value={stat.value}
                color={stat.color}
                description={stat.description}
                maxValue={100}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Level Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="system-window p-6"
      >
        <h2 className="text-lg font-bold text-system-text mb-4 flex items-center gap-2">
          <span className="w-2 h-2 bg-system-blue rounded-full" />
          LEVEL PROGRESS
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 border border-system-border rounded">
            <div className="text-3xl font-bold text-system-blue">
              {player?.level ?? 1}
            </div>
            <div className="text-system-text-muted text-sm">Current Level</div>
          </div>

          <div className="text-center p-4 border border-system-border rounded">
            <div className="text-3xl font-bold text-system-green">
              {levelProgress?.totalXP ?? 0}
            </div>
            <div className="text-system-text-muted text-sm">Total XP</div>
          </div>

          <div className="text-center p-4 border border-system-border rounded">
            <div className="text-3xl font-bold text-system-gold">
              {player?.currentStreak ?? 0}
            </div>
            <div className="text-system-text-muted text-sm">Day Streak</div>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="mt-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-system-text-muted">Progress to Level {(player?.level ?? 0) + 1}</span>
            <span className="text-system-blue">
              {levelProgress?.xpProgress ?? 0} / {levelProgress?.xpNeeded ?? 100} XP
            </span>
          </div>
          <div className="h-3 bg-system-black rounded-full overflow-hidden border border-system-border">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${levelProgress?.progressPercent ?? 0}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-system-blue to-system-purple"
            />
          </div>
        </div>
      </motion.div>

      {/* Streak Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="system-window p-6"
      >
        <h2 className="text-lg font-bold text-system-text mb-4 flex items-center gap-2">
          <span className="w-2 h-2 bg-system-gold rounded-full" />
          CONSISTENCY RECORD
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border border-system-gold/30 rounded bg-system-gold/5">
            <div className="text-2xl font-bold text-system-gold">
              {player?.currentStreak ?? 0}
            </div>
            <div className="text-system-text-muted text-sm">Current Streak</div>
          </div>

          <div className="p-4 border border-system-border rounded">
            <div className="text-2xl font-bold text-system-text">
              {player?.longestStreak ?? 0}
            </div>
            <div className="text-system-text-muted text-sm">Longest Streak</div>
          </div>

          <div className="p-4 border border-system-purple/30 rounded bg-system-purple/5">
            <div className="text-2xl font-bold text-system-purple">
              {player?.perfectStreak ?? 0}
            </div>
            <div className="text-system-text-muted text-sm">Perfect Days</div>
          </div>
        </div>
      </motion.div>

      {/* Weekly History */}
      {weeklyHistory && weeklyHistory.summaries.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="system-window p-6"
        >
          <h2 className="text-lg font-bold text-system-text mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-system-purple rounded-full" />
            WEEKLY HISTORY
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {weeklyHistory.summaries.map((summary, i) => (
              <motion.div
                key={summary.weekStart}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
              >
                <WeeklySummaryCard summary={summary} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
