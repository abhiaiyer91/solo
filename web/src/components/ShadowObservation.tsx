import { motion } from 'framer-motion'
import { useShadowObservation, useShadowAggregates } from '@/hooks/useShadow'
import { TypewriterText } from '@/components/system'

interface ShadowObservationProps {
  className?: string
}

const shadowTypeLabels: Record<string, string> = {
  level: 'LEVEL SHADOW',
  streak: 'STREAK SHADOW',
  time: 'TIME SHADOW',
  title: 'TITLE SHADOW',
}

const shadowTypeBorders: Record<string, string> = {
  level: 'border-system-purple/30',
  streak: 'border-system-gold/30',
  time: 'border-system-blue/30',
  title: 'border-system-green/30',
}

const shadowTypeGlows: Record<string, string> = {
  level: 'shadow-system-purple/5',
  streak: 'shadow-system-gold/5',
  time: 'shadow-system-blue/5',
  title: 'shadow-system-green/5',
}

const shadowTypeDotColors: Record<string, string> = {
  level: 'bg-system-purple',
  streak: 'bg-system-gold',
  time: 'bg-system-blue',
  title: 'bg-system-green',
}

export function ShadowObservation({ className = '' }: ShadowObservationProps) {
  const { data: observation, isLoading, error } = useShadowObservation()
  const { data: aggregates } = useShadowAggregates()

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`p-4 border border-system-border/30 rounded bg-system-panel/30 ${className}`}
      >
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 border-2 border-system-purple border-t-transparent rounded-full animate-spin" />
          <span className="text-system-text-muted text-sm">SCANNING FOR SHADOWS...</span>
        </div>
      </motion.div>
    )
  }

  if (error || !observation) {
    // Silent fail - shadows are optional ambient content
    return null
  }

  const borderColor = shadowTypeBorders[observation.type] || shadowTypeBorders.level
  const glowColor = shadowTypeGlows[observation.type] || shadowTypeGlows.level
  const dotColor = shadowTypeDotColors[observation.type] || shadowTypeDotColors.level
  const typeLabel = shadowTypeLabels[observation.type] || 'SHADOW DETECTED'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className={`
        p-4 rounded border bg-system-black/30 backdrop-blur-sm
        shadow-lg ${glowColor} ${borderColor} ${className}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="text-system-text-muted text-xs uppercase tracking-wider flex items-center gap-2">
          <span className={`w-1.5 h-1.5 ${dotColor} rounded-full animate-pulse`} />
          {typeLabel}
        </div>
        {observation.shadowData.playerCount !== undefined && observation.shadowData.playerCount > 0 && (
          <span className="text-system-text-muted text-xs">
            {observation.shadowData.playerCount} observed
          </span>
        )}
      </div>

      {/* Narrative Content */}
      <div className="text-system-text font-mono text-sm leading-relaxed whitespace-pre-wrap">
        <TypewriterText text={observation.narrative} speed={15} />
      </div>

      {/* Comparison Stats */}
      {(observation.shadowData.shadowLevel !== undefined ||
        observation.shadowData.shadowStreak !== undefined) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-4 pt-3 border-t border-system-border/20"
        >
          <div className="grid grid-cols-2 gap-4 text-xs">
            {/* Shadow Stats */}
            <div className="space-y-1">
              <div className="text-system-text-muted uppercase tracking-wider">Shadow</div>
              {observation.shadowData.shadowLevel !== undefined && (
                <div className="text-system-purple">
                  Level {observation.shadowData.shadowLevel}
                </div>
              )}
              {observation.shadowData.shadowStreak !== undefined && (
                <div className="text-system-gold">
                  {observation.shadowData.shadowStreak} day streak
                </div>
              )}
            </div>

            {/* Player Stats */}
            <div className="space-y-1 text-right">
              <div className="text-system-text-muted uppercase tracking-wider">You</div>
              <div className="text-system-text">
                Level {observation.playerData.level}
              </div>
              <div className="text-system-text">
                {observation.playerData.streak} day streak
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Global Aggregates (if available) */}
      {aggregates && aggregates.totalActivePlayers > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-4 pt-3 border-t border-system-border/20"
        >
          <div className="text-system-text-muted text-xs space-y-1">
            <div className="flex justify-between">
              <span>Active Players</span>
              <span className="text-system-text">{aggregates.totalActivePlayers.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Completed Today</span>
              <span className="text-system-green">{aggregates.playersCompletedToday.toLocaleString()}</span>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
