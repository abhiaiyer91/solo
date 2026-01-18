import { motion } from 'framer-motion'
import {
  type Dungeon,
  getRankColor,
  getRankBorderColor,
} from '@/hooks/useDungeons'

interface DungeonCardProps {
  dungeon: Dungeon
  onEnter: (dungeonId: string) => void
  isEntering?: boolean
}

export function DungeonCard({ dungeon, onEnter, isEntering }: DungeonCardProps) {
  const rankColor = getRankColor(dungeon.rank)
  const borderColor = getRankBorderColor(dungeon.rank)
  const isLocked = !dungeon.isUnlocked

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={!isLocked ? { scale: 1.02 } : undefined}
      className={`
        relative p-4 border rounded transition-colors
        ${borderColor}
        ${isLocked ? 'opacity-50 bg-system-black/30' : 'bg-system-panel/30'}
      `}
    >
      {/* Rank badge */}
      <div className={`absolute -top-2 -left-2 w-8 h-8 rounded-full bg-system-black border ${borderColor} flex items-center justify-center`}>
        <span className={`font-bold text-sm ${rankColor}`}>{dungeon.rank}</span>
      </div>

      {/* Header */}
      <div className="ml-4">
        <h3 className={`font-bold ${rankColor}`}>{dungeon.name}</h3>
        <p className="text-system-text-muted text-sm mt-1">
          {dungeon.description}
        </p>
      </div>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-2 text-system-text-muted">
          <span>⏱️</span>
          <span>{dungeon.durationHours}h duration</span>
        </div>
        <div className="flex items-center gap-2 text-system-text-muted">
          <span>✨</span>
          <span>{dungeon.xpMultiplier}x XP</span>
        </div>
      </div>

      {/* Objectives preview */}
      <div className="mt-3 text-xs text-system-text-muted">
        <span className="font-medium">{dungeon.objectives.length} objectives</span>
      </div>

      {/* Requirements */}
      {isLocked && dungeon.unlockReason && (
        <div className="mt-3 p-2 bg-system-red/10 border border-system-red/30 rounded">
          <div className="flex items-center gap-2 text-xs text-system-red">
            <span>🔒</span>
            <span>{dungeon.unlockReason}</span>
          </div>
        </div>
      )}

      {/* Enter button */}
      {!isLocked && dungeon.status === 'available' && (
        <button
          type="button"
          onClick={() => onEnter(dungeon.id)}
          disabled={isEntering}
          className={`
            mt-4 w-full py-2 border rounded text-sm font-medium transition-colors
            ${borderColor} ${rankColor}
            hover:bg-white/5
            disabled:opacity-50
          `}
        >
          {isEntering ? 'Entering...' : 'Enter Dungeon'}
        </button>
      )}

      {dungeon.status === 'completed' && (
        <div className="mt-4 py-2 text-center text-xs text-system-green">
          ✓ Completed
        </div>
      )}
    </motion.div>
  )
}
