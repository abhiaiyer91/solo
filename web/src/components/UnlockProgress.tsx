import { motion } from 'framer-motion'
import { useUnlocks, UnlockStatus } from '@/hooks/useUnlocks'

interface UnlockItemProps {
  unlock: UnlockStatus
  showProgress?: boolean
}

function UnlockItem({ unlock, showProgress = true }: UnlockItemProps) {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'dungeons':
        return 'text-system-red'
      case 'bosses':
        return 'text-system-purple'
      case 'social':
        return 'text-system-green'
      case 'bonuses':
        return 'text-system-gold'
      default:
        return 'text-system-blue'
    }
  }

  const getRequirementLabel = (req: UnlockStatus['requirement']) => {
    switch (req.type) {
      case 'level':
        return `Level ${req.current}/${req.value}`
      case 'days':
        return `Day ${req.current}/${req.value}`
      case 'season':
        return `Season ${req.current}/${req.value}`
      default:
        return 'Available'
    }
  }

  return (
    <div
      className={`p-3 border rounded ${
        unlock.isUnlocked
          ? 'border-system-border bg-system-black/30'
          : 'border-system-border/50 bg-system-black/10 opacity-60'
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              unlock.isUnlocked ? 'bg-system-green' : 'bg-system-text-muted'
            }`}
          />
          <span className={`text-sm font-medium ${getCategoryColor(unlock.category)}`}>
            {unlock.name}
          </span>
        </div>
        {!unlock.isUnlocked && (
          <span className="text-xs text-system-text-muted">
            {getRequirementLabel(unlock.requirement)}
          </span>
        )}
      </div>

      <p className="text-xs text-system-text-muted ml-4">{unlock.description}</p>

      {showProgress && !unlock.isUnlocked && unlock.progress > 0 && (
        <div className="mt-2 ml-4">
          <div className="h-1 bg-system-border rounded overflow-hidden">
            <div
              className="h-full bg-system-blue transition-all duration-500"
              style={{ width: `${unlock.progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

interface UnlockProgressProps {
  showAll?: boolean
  maxItems?: number
}

/**
 * Component showing unlock progression status
 */
export function UnlockProgress({ showAll = false, maxItems = 5 }: UnlockProgressProps) {
  const { unlocks, nextUnlocks, stats, isLoading } = useUnlocks()

  if (isLoading) {
    return (
      <div className="system-window p-6">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 border-2 border-system-blue border-t-transparent rounded-full animate-spin" />
          <span className="text-system-text-muted">Loading progression...</span>
        </div>
      </div>
    )
  }

  const displayUnlocks = showAll ? unlocks : nextUnlocks

  return (
    <div className="system-window p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-system-text flex items-center gap-2">
          <span className="w-2 h-2 bg-system-purple rounded-full" />
          {showAll ? 'ALL UNLOCKS' : 'NEXT UNLOCKS'}
        </h2>
        {stats && (
          <span className="text-sm text-system-text-muted">
            {stats.unlockedCount}/{stats.totalUnlocks} unlocked
          </span>
        )}
      </div>

      {/* Stats summary */}
      {stats && (
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="p-2 bg-system-black/50 border border-system-border rounded text-center">
            <div className="text-system-blue text-lg font-bold">{stats.level}</div>
            <div className="text-system-text-muted text-xs">Level</div>
          </div>
          <div className="p-2 bg-system-black/50 border border-system-border rounded text-center">
            <div className="text-system-gold text-lg font-bold">{stats.daysActive}</div>
            <div className="text-system-text-muted text-xs">Days</div>
          </div>
          <div className="p-2 bg-system-black/50 border border-system-border rounded text-center">
            <div className="text-system-purple text-lg font-bold">S{stats.currentSeason}</div>
            <div className="text-system-text-muted text-xs">Season</div>
          </div>
        </div>
      )}

      {/* Unlock list */}
      <div className="space-y-2">
        {displayUnlocks.slice(0, maxItems).map((unlock, index) => (
          <motion.div
            key={unlock.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <UnlockItem unlock={unlock} showProgress={!showAll} />
          </motion.div>
        ))}
      </div>

      {displayUnlocks.length === 0 && !showAll && (
        <div className="text-center py-4">
          <p className="text-system-text-muted text-sm">
            All available content unlocked.
          </p>
          <p className="text-system-green text-xs mt-1">
            Continue growing to unlock more.
          </p>
        </div>
      )}
    </div>
  )
}
