import { motion } from 'framer-motion'
import { useSeasonalQuests, type SeasonalQuest as SeasonalQuestType } from '@/hooks/useSeasonalQuests'

interface SeasonalQuestCardProps {
  quest: SeasonalQuestType
}

function SeasonalQuestCard({ quest }: SeasonalQuestCardProps) {
  const progressPercent = Math.min(100, Math.round((quest.currentValue / quest.targetValue) * 100))

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 border border-system-purple/50 rounded bg-system-purple/5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="text-system-purple text-sm font-medium">
            {quest.name}
          </div>
          <p className="text-system-text-muted text-xs mt-1">
            {quest.description}
          </p>
        </div>
        
        {quest.isCompleted ? (
          <div className="px-2 py-1 bg-system-green/20 border border-system-green/50 rounded">
            <span className="text-system-green text-xs font-medium">COMPLETE</span>
          </div>
        ) : (
          <div className="text-right">
            <div className="text-system-purple text-sm font-bold">
              +{quest.xpReward} XP
            </div>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="mt-3">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-system-text-muted">
            {quest.currentValue}/{quest.targetValue}
          </span>
          <span className="text-system-purple">{progressPercent}%</span>
        </div>
        <div className="h-2 bg-system-border rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-system-purple"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Week info */}
      <div className="mt-2 text-xs text-system-text-muted">
        Week ends: {new Date(quest.weekEnd).toLocaleDateString()}
      </div>
    </motion.div>
  )
}

export function SeasonalQuestSection() {
  const { data, isLoading, error } = useSeasonalQuests()

  if (isLoading) {
    return (
      <div className="p-4 border border-system-border rounded">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-system-purple border-t-transparent rounded-full animate-spin" />
          <span className="text-system-text-muted text-sm">Loading seasonal quests...</span>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return null
  }

  // Not unlocked yet
  if (!data.isUnlocked) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-4 border border-system-border/50 rounded bg-system-black/30"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 border border-system-border rounded flex items-center justify-center">
            <span className="text-system-text-muted">🔒</span>
          </div>
          <div>
            <div className="text-system-text-muted text-sm font-medium">
              Seasonal Quests
            </div>
            <p className="text-system-text-muted text-xs">
              Unlocks in Season {data.unlockSeason}
            </p>
          </div>
        </div>
      </motion.div>
    )
  }

  // No active season
  if (!data.season) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-4 border border-system-border/50 rounded"
      >
        <div className="text-system-text-muted text-sm text-center">
          No active season
        </div>
      </motion.div>
    )
  }

  // No quests available
  if (data.quests.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-4 border border-system-purple/30 rounded bg-system-purple/5"
      >
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-system-purple rounded-full animate-pulse" />
          <div>
            <div className="text-system-purple text-sm font-medium">
              {data.season.name}
            </div>
            <p className="text-system-text-muted text-xs">
              {data.season.theme} • No weekly objectives this week
            </p>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      {/* Season header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-system-purple rounded-full animate-pulse" />
          <span className="text-system-purple text-sm font-medium">
            {data.season.name}
          </span>
        </div>
        <span className="text-system-text-muted text-xs">
          {data.season.theme}
        </span>
      </div>

      {/* Quest cards */}
      <div className="space-y-2">
        {data.quests.map((quest) => (
          <SeasonalQuestCard key={quest.id} quest={quest} />
        ))}
      </div>
    </motion.div>
  )
}

export default SeasonalQuestSection
