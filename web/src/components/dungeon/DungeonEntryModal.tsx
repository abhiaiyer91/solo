import { motion } from 'framer-motion'
import { type Dungeon, getRankColor, getRankBorderColor } from '@/hooks/useDungeons'

interface DungeonEntryModalProps {
  dungeon: Dungeon
  onConfirm: () => void
  onCancel: () => void
  isEntering: boolean
}

export function DungeonEntryModal({
  dungeon,
  onConfirm,
  onCancel,
  isEntering,
}: DungeonEntryModalProps) {
  const rankColor = getRankColor(dungeon.rank)
  const borderColor = getRankBorderColor(dungeon.rank)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-system-black/80"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className={`w-full max-w-md p-6 border-2 rounded-lg bg-system-panel ${borderColor}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full border-2 ${borderColor} flex items-center justify-center`}>
            <span className={`font-bold text-xl ${rankColor}`}>{dungeon.rank}</span>
          </div>
          <div>
            <h2 className={`text-xl font-bold ${rankColor}`}>
              {dungeon.name}
            </h2>
            <p className="text-system-text-muted text-sm">Dungeon Entry</p>
          </div>
        </div>

        {/* Description */}
        <p className="mt-4 text-system-text">
          {dungeon.description}
        </p>

        {/* Stats */}
        <div className="mt-4 p-4 bg-system-black/50 rounded border border-system-border">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-system-text-muted">Duration</div>
              <div className="font-bold text-system-text">{dungeon.durationHours} hours</div>
            </div>
            <div>
              <div className="text-system-text-muted">XP Multiplier</div>
              <div className="font-bold text-system-text">{dungeon.xpMultiplier}x</div>
            </div>
          </div>
        </div>

        {/* Objectives */}
        <div className="mt-4">
          <h3 className="text-sm font-medium text-system-text-muted mb-2">Objectives</h3>
          <ul className="space-y-2">
            {dungeon.objectives.map((objective) => (
              <li key={objective.id} className="flex items-center gap-2 text-sm text-system-text">
                <span className="w-1.5 h-1.5 bg-system-purple rounded-full" />
                {objective.description} ({objective.targetValue})
              </li>
            ))}
          </ul>
        </div>

        {/* Warning */}
        <div className="mt-4 p-3 bg-system-yellow/10 border border-system-yellow/30 rounded">
          <p className="text-xs text-system-yellow">
            ⚠️ Once entered, you must complete objectives within {dungeon.durationHours} hours or the dungeon will fail.
          </p>
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isEntering}
            className="flex-1 py-2 border border-system-border rounded text-system-text-muted hover:text-system-text hover:border-system-text transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isEntering}
            className={`flex-1 py-2 border rounded font-medium transition-colors ${borderColor} ${rankColor} hover:bg-white/5 disabled:opacity-50`}
          >
            {isEntering ? 'Entering...' : 'Enter Dungeon'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
