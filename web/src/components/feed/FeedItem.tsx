/**
 * FeedItem - Social activity feed item component
 */

import { motion } from 'framer-motion'
import {
  type FeedItem as FeedItemType,
  getFeedEventIcon,
  getFeedEventColor,
  formatFeedTime,
} from '../../hooks/useFeed'

interface FeedItemProps {
  item: FeedItemType
  isOwn?: boolean
  index?: number
}

export function FeedItem({ item, isOwn, index = 0 }: FeedItemProps) {
  const icon = getFeedEventIcon(item.eventType)
  const colorClass = getFeedEventColor(item.eventType)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`bg-system-black/50 border rounded-lg p-4 ${
        isOwn ? 'border-system-accent/30' : 'border-system-border'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <span className="text-2xl">{icon}</span>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <p className={`font-mono text-sm font-bold ${colorClass}`}>
            {item.title}
          </p>

          {/* Description */}
          <p className="font-mono text-xs text-system-text-muted mt-1">
            {item.description}
          </p>

          {/* Meta */}
          <div className="flex items-center gap-3 mt-2">
            <span className="font-mono text-xs text-system-text-muted">
              {item.userName ?? 'Anonymous Hunter'}
            </span>
            <span className="text-system-border">•</span>
            <span className="font-mono text-xs text-system-text-muted">
              {formatFeedTime(item.createdAt)}
            </span>
          </div>
        </div>

        {/* Badge for own items */}
        {isOwn && (
          <span className="text-xs font-mono text-system-accent bg-system-accent/10 px-2 py-1 rounded">
            You
          </span>
        )}
      </div>

      {/* Event-specific details */}
      {item.metadata && (
        <EventDetails item={item} />
      )}
    </motion.div>
  )
}

function EventDetails({ item }: { item: FeedItemType }) {
  const { eventType, metadata } = item

  switch (eventType) {
    case 'streak_milestone':
      return (
        <div className="mt-3 flex items-center gap-2 text-xs font-mono text-orange-400/70 bg-orange-500/10 rounded px-3 py-2">
          <span>🔥</span>
          <span>{metadata.streakDays} day streak milestone</span>
        </div>
      )

    case 'dungeon_complete':
      if (metadata.dungeonRank) {
        return (
          <div className="mt-3 flex items-center gap-2 text-xs font-mono text-purple-400/70 bg-purple-500/10 rounded px-3 py-2">
            <span>🏆</span>
            <span>Rank {metadata.dungeonRank} in {metadata.dungeonName}</span>
          </div>
        )
      }
      return null

    case 'boss_defeat':
      if (metadata.bossName) {
        return (
          <div className="mt-3 flex items-center gap-2 text-xs font-mono text-red-400/70 bg-red-500/10 rounded px-3 py-2">
            <span>☠️</span>
            <span>Defeated {metadata.bossName}</span>
          </div>
        )
      }
      return null

    default:
      return null
  }
}

/**
 * Feed item skeleton for loading
 */
export function FeedItemSkeleton() {
  return (
    <div className="bg-system-black/50 border border-system-border rounded-lg p-4 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 bg-system-border rounded" />
        <div className="flex-1">
          <div className="h-4 w-32 bg-system-border rounded mb-2" />
          <div className="h-3 w-48 bg-system-border rounded mb-2" />
          <div className="h-3 w-24 bg-system-border rounded" />
        </div>
      </div>
    </div>
  )
}

/**
 * Empty feed state
 */
export function FeedEmpty() {
  return (
    <div className="text-center py-12">
      <span className="text-4xl block mb-4">📜</span>
      <p className="font-mono text-sm text-system-text-muted">
        No activity yet
      </p>
      <p className="font-mono text-xs text-system-text-muted mt-1">
        Achievements from the community will appear here
      </p>
    </div>
  )
}
