import { motion } from 'framer-motion'
import type { XPEvent } from '@/hooks/useXPTimeline'

interface XPTimelineItemProps {
  event: XPEvent
  onClick: () => void
}

const sourceIcons: Record<string, string> = {
  QUEST_COMPLETION: '⚔',
  STREAK_BONUS: '🔥',
  BOSS_DEFEAT: '👹',
  DUNGEON_CLEAR: '🏰',
  SEASON_BONUS: '🌟',
  TITLE_BONUS: '👑',
  MANUAL_ADJUSTMENT: '⚙',
}

const sourceColors: Record<string, string> = {
  QUEST_COMPLETION: 'text-system-blue',
  STREAK_BONUS: 'text-system-gold',
  BOSS_DEFEAT: 'text-system-purple',
  DUNGEON_CLEAR: 'text-system-green',
  SEASON_BONUS: 'text-system-gold',
  TITLE_BONUS: 'text-system-purple',
  MANUAL_ADJUSTMENT: 'text-system-text-muted',
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)

  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`

  return date.toLocaleDateString()
}

export function XPTimelineItem({ event, onClick }: XPTimelineItemProps) {
  const isLevelUp = event.levelAfter > event.levelBefore
  const isLevelDown = event.levelAfter < event.levelBefore
  const isNegative = event.finalAmount < 0
  const hasModifiers = event.finalAmount !== event.baseAmount && !isNegative
  const icon = sourceIcons[event.source] || '◈'
  const color = sourceColors[event.source] || 'text-system-text-muted'

  const timeAgo = getTimeAgo(new Date(event.createdAt))

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      onClick={onClick}
      className={`
        flex items-start gap-3 p-3 rounded border cursor-pointer transition-colors
        ${isLevelUp
          ? 'border-system-gold/50 bg-system-gold/5'
          : isNegative
            ? 'border-system-red/30 bg-system-red/5'
            : 'border-system-border hover:border-system-blue/30 hover:bg-system-panel/50'
        }
      `}
    >
      {/* Icon */}
      <div className={`text-xl ${color}`}>{icon}</div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-system-text text-sm truncate">
            {event.description}
          </span>
          <span className={`font-bold text-sm whitespace-nowrap ${isNegative ? 'text-system-red' : 'text-system-green'}`}>
            {isNegative ? '' : '+'}{event.finalAmount} XP
          </span>
        </div>

        <div className="flex items-center gap-2 mt-1">
          <span className="text-system-text-muted text-xs">{timeAgo}</span>
          {hasModifiers && (
            <span className="text-system-gold text-xs">
              (base: {event.baseAmount})
            </span>
          )}
          {isLevelUp && (
            <span className="px-1.5 py-0.5 text-xs bg-system-gold/20 text-system-gold rounded">
              LEVEL {event.levelAfter}
            </span>
          )}
          {isLevelDown && (
            <span className="px-1.5 py-0.5 text-xs bg-system-red/20 text-system-red rounded">
              LEVEL {event.levelAfter}
            </span>
          )}
        </div>
      </div>

      {/* Expand indicator */}
      <div className="text-system-text-muted text-xs">›</div>
    </motion.div>
  )
}
