/**
 * GuildFeed - Narrative-framed guild event feed
 */

import { motion, AnimatePresence } from 'framer-motion'

export type GuildEventType =
  | 'member_joined'
  | 'member_left'
  | 'member_absent'
  | 'member_returned'
  | 'streak_milestone'
  | 'collective_milestone'
  | 'raid_started'
  | 'raid_phase'
  | 'raid_complete'
  | 'weekly_summary'

export interface GuildEvent {
  id: string
  type: GuildEventType
  title: string
  narrative: string
  timestamp: string
  metadata?: {
    memberName?: string
    memberCount?: number
    streak?: number
    phase?: number
    xp?: number
  }
}

interface GuildFeedProps {
  events: GuildEvent[]
  isLoading?: boolean
}

export function GuildFeed({ events, isLoading }: GuildFeedProps) {
  if (isLoading) {
    return (
      <div className="text-center py-8">
        <span className="font-mono text-sm text-system-text-muted">Loading feed...</span>
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <span className="text-3xl block mb-4">📜</span>
        <p className="font-mono text-sm text-system-text-muted">
          No guild events yet
        </p>
        <p className="font-mono text-xs text-system-text-muted mt-1">
          Activity from your cohort will appear here
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {events.map((event, i) => (
          <GuildEventCard key={event.id} event={event} index={i} />
        ))}
      </AnimatePresence>
    </div>
  )
}

function GuildEventCard({ event, index }: { event: GuildEvent; index: number }) {
  const icon = getEventIcon(event.type)
  const colorClass = getEventColor(event.type)

  const timeAgo = formatTimeAgo(event.timestamp)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`bg-system-black/50 border rounded-lg p-4 ${colorClass}`}
    >
      <div className="flex items-start gap-3">
        <span className="text-xl">{icon}</span>
        <div className="flex-1 min-w-0">
          <p className="font-mono text-xs text-system-text-muted mb-1">
            {event.title} • {timeAgo}
          </p>
          <p className="font-mono text-sm text-gray-300 whitespace-pre-line">
            {event.narrative}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

function getEventIcon(type: GuildEventType): string {
  const icons: Record<GuildEventType, string> = {
    member_joined: '👤',
    member_left: '👋',
    member_absent: '⚠️',
    member_returned: '🔙',
    streak_milestone: '🔥',
    collective_milestone: '🏆',
    raid_started: '⚔️',
    raid_phase: '📍',
    raid_complete: '🎉',
    weekly_summary: '📊',
  }
  return icons[type]
}

function getEventColor(type: GuildEventType): string {
  const colors: Record<GuildEventType, string> = {
    member_joined: 'border-green-500/30',
    member_left: 'border-gray-500/30',
    member_absent: 'border-yellow-500/30',
    member_returned: 'border-blue-500/30',
    streak_milestone: 'border-orange-500/30',
    collective_milestone: 'border-purple-500/30',
    raid_started: 'border-red-500/30',
    raid_phase: 'border-red-500/20',
    raid_complete: 'border-yellow-500/30',
    weekly_summary: 'border-system-border',
  }
  return colors[type]
}

function formatTimeAgo(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  
  return date.toLocaleDateString()
}

/**
 * Shadow link narrative for accountability partners
 */
export function ShadowLinkNarrative({
  partnerName,
  type,
  metadata,
}: {
  partnerName: string
  type: 'linked' | 'struggling' | 'milestone'
  metadata?: { days?: number; milestone?: string }
}) {
  let narrative = ''
  let icon = '👥'
  let borderColor = 'border-purple-500/30'

  switch (type) {
    case 'linked':
      narrative = `SHADOW LINK ESTABLISHED\n\nYou and ${partnerName} are now connected.\n\nTheir data is visible to you.\nYour data is visible to them.\nNeither can hide.\n\nThis is not friendship.\nThis is mutual accountability.`
      icon = '🔗'
      break
    case 'struggling':
      narrative = `SHADOW ALERT\n\n${partnerName} has missed ${metadata?.days ?? 0} consecutive days.\n\nTheir shadow grows weaker.\nThe link between you stretches thin.`
      icon = '⚠️'
      borderColor = 'border-yellow-500/30'
      break
    case 'milestone':
      narrative = `SHADOW CELEBRATION\n\n${partnerName} has achieved ${metadata?.milestone ?? 'a milestone'}.\n\nYour shadow link contributed to this.`
      icon = '✨'
      borderColor = 'border-green-500/30'
      break
  }

  return (
    <div className={`bg-purple-950/20 border rounded-lg p-4 ${borderColor}`}>
      <div className="flex items-start gap-3">
        <span className="text-xl">{icon}</span>
        <p className="font-mono text-sm text-gray-300 whitespace-pre-line">
          {narrative}
        </p>
      </div>
    </div>
  )
}

/**
 * Raid boss narrative display
 */
export function RaidBossNarrative({
  bossName,
  narrative,
  phase,
}: {
  bossName: string
  narrative: string
  phase?: 'announcement' | 'active' | 'defeat'
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-red-950/20 border border-red-500/30 rounded-lg p-6"
    >
      <div className="text-center mb-4">
        <span className="text-3xl block mb-2">⚔️</span>
        <h3 className="font-mono text-lg text-red-400 font-bold">
          {bossName}
        </h3>
        {phase === 'announcement' && (
          <p className="font-mono text-xs text-red-400/70 mt-1">
            RAID BOSS DETECTED
          </p>
        )}
        {phase === 'defeat' && (
          <p className="font-mono text-xs text-green-400 mt-1">
            DEFEATED
          </p>
        )}
      </div>

      <div className="border-t border-red-500/20 pt-4">
        <p className="font-mono text-sm text-gray-300 whitespace-pre-line text-center">
          {narrative}
        </p>
      </div>
    </motion.div>
  )
}
