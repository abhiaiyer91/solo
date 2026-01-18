import { motion } from 'framer-motion'
import type { Quest } from '@/hooks/useQuests'

interface QuestCardProps {
  quest: Quest
  onClick: () => void
  isCompleting?: boolean
  onReset?: () => void
  isResetting?: boolean
  onRemove?: () => void
  isRemoving?: boolean
}

export function QuestCard({ quest, onClick, isCompleting, onReset, isResetting, onRemove, isRemoving }: QuestCardProps) {
  const isCompleted = quest.status === 'COMPLETED'
  const isFailed = quest.status === 'FAILED'
  const isActive = quest.status === 'ACTIVE'
  const canRemove = !quest.isCore && isActive && onRemove

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      onClick={isCompleted || isFailed ? undefined : onClick}
      className={`
        p-4 border rounded transition-colors
        ${isCompleted
          ? 'border-system-green/50 bg-system-green/5 cursor-default'
          : isFailed
            ? 'border-system-red/50 bg-system-red/5 cursor-default'
            : 'border-system-border hover:border-system-blue/50 cursor-pointer'}
      `}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-system-text font-medium">{quest.name}</span>
            <span className={`px-2 py-0.5 text-xs rounded ${
              quest.isCore
                ? 'bg-system-purple/20 text-system-purple'
                : 'bg-system-border text-system-text-muted'
            }`}>
              {quest.category}
            </span>
            {quest.isCore && (
              <span className="px-2 py-0.5 text-xs bg-system-gold/20 text-system-gold rounded">
                CORE
              </span>
            )}
          </div>
          <p className="text-system-text-muted text-sm mt-1">
            {quest.description}
          </p>
        </div>
        <div className="text-right">
          <div className={`font-bold ${
            isCompleted ? 'text-system-green' : isFailed ? 'text-system-red' : 'text-system-blue'
          }`}>
            {isCompleted ? (
              <>+{quest.xpAwarded ?? quest.baseXP} XP</>
            ) : (
              <>+{quest.baseXP} XP</>
            )}
          </div>
          <div className={`text-xs ${
            isCompleted ? 'text-system-green' : isFailed ? 'text-system-red' : 'text-system-text-muted'
          }`}>
            {isCompleting ? (
              <span className="flex items-center gap-1 justify-end">
                <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                COMPLETING...
              </span>
            ) : (
              quest.status
            )}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-3 h-1 bg-system-border rounded overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${quest.completionPercent ?? 0}%` }}
          className={`h-full ${
            isCompleted ? 'bg-system-green' : isFailed ? 'bg-system-red' : 'bg-system-blue/50'
          }`}
        />
      </div>

      {!isCompleted && !isFailed && (
        <div className="mt-2 text-xs text-system-text-muted text-right">
          {quest.currentValue ?? 0} / {quest.targetValue}
        </div>
      )}

      {/* Action buttons */}
      <div className="mt-3 flex gap-2">
        {isCompleted && onReset && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onReset()
            }}
            disabled={isResetting}
            className="flex-1 py-1.5 text-xs border border-system-border rounded
                       text-system-text-muted hover:border-system-red hover:text-system-red
                       transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isResetting ? 'Undoing...' : 'Undo Completion'}
          </button>
        )}

        {canRemove && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
            disabled={isRemoving}
            className="py-1.5 px-3 text-xs border border-system-border rounded
                       text-system-text-muted hover:border-system-red hover:text-system-red
                       transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRemoving ? 'Removing...' : 'Remove'}
          </button>
        )}
      </div>
    </motion.div>
  )
}
