import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  type ActiveDungeon as ActiveDungeonType,
  getRankColor,
  getRankBorderColor,
  useAbandonDungeon,
} from '@/hooks/useDungeons'

interface ActiveDungeonProps {
  dungeon: ActiveDungeonType
}

export function ActiveDungeon({ dungeon }: ActiveDungeonProps) {
  const [showAbandonConfirm, setShowAbandonConfirm] = useState(false)
  const abandonMutation = useAbandonDungeon()
  const rankColor = getRankColor(dungeon.rank)
  const borderColor = getRankBorderColor(dungeon.rank)

  const handleAbandon = () => {
    abandonMutation.mutate(dungeon.dungeonId)
    setShowAbandonConfirm(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-6 border-2 rounded-lg bg-system-panel/50 ${borderColor}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full border-2 ${borderColor} flex items-center justify-center`}>
            <span className={`font-bold ${rankColor}`}>{dungeon.rank}</span>
          </div>
          <div>
            <h2 className={`text-lg font-bold ${rankColor}`}>
              {dungeon.dungeonName}
            </h2>
            <p className="text-system-text-muted text-sm">Active Dungeon</p>
          </div>
        </div>

        {/* Timer */}
        <div className="text-right">
          <div className={`text-2xl font-bold ${dungeon.hoursRemaining <= 6 ? 'text-system-red' : rankColor}`}>
            {dungeon.hoursRemaining}h
          </div>
          <div className="text-system-text-muted text-xs">remaining</div>
        </div>
      </div>

      {/* Overall progress */}
      <div className="mt-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-system-text-muted">Overall Progress</span>
          <span className={rankColor}>{dungeon.overallProgress}%</span>
        </div>
        <div className="h-3 bg-system-border rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-system-purple to-system-blue"
            initial={{ width: 0 }}
            animate={{ width: `${dungeon.overallProgress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Objectives */}
      <div className="mt-6 space-y-3">
        <h3 className="text-sm font-medium text-system-text">Objectives</h3>
        {dungeon.objectives.map((objective) => (
          <div
            key={objective.id}
            className={`p-3 border rounded ${objective.isCompleted ? 'border-system-green/50 bg-system-green/10' : 'border-system-border'}`}
          >
            <div className="flex items-center justify-between">
              <span className={objective.isCompleted ? 'text-system-green' : 'text-system-text'}>
                {objective.isCompleted ? '✓ ' : ''}{objective.description}
              </span>
              <span className="text-system-text-muted text-sm">
                {objective.currentValue}/{objective.targetValue}
              </span>
            </div>
            {!objective.isCompleted && (
              <div className="mt-2 h-1.5 bg-system-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-system-purple"
                  style={{ width: `${Math.min(100, (objective.currentValue / objective.targetValue) * 100)}%` }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Abandon button */}
      <div className="mt-6 pt-4 border-t border-system-border">
        {showAbandonConfirm ? (
          <div className="flex items-center justify-between">
            <span className="text-system-red text-sm">Abandon this dungeon?</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowAbandonConfirm(false)}
                className="px-3 py-1 text-xs text-system-text-muted hover:text-system-text"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAbandon}
                disabled={abandonMutation.isPending}
                className="px-3 py-1 text-xs border border-system-red/50 text-system-red rounded hover:bg-system-red/10"
              >
                {abandonMutation.isPending ? 'Abandoning...' : 'Confirm Abandon'}
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowAbandonConfirm(true)}
            className="text-xs text-system-text-muted hover:text-system-red transition-colors"
          >
            Abandon Dungeon
          </button>
        )}
      </div>
    </motion.div>
  )
}
