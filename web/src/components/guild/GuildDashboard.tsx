import { motion } from 'framer-motion'
import { GuildMembers } from './GuildMembers'
import { GuildInvite } from './GuildInvite'
import type { Guild } from '@/hooks/useGuild'

interface GuildDashboardProps {
  guild: Guild
  onLeave: () => void
  isLeaving: boolean
}

const RANK_COLORS: Record<string, { border: string; text: string; bg: string }> = {
  BRONZE: {
    border: 'border-amber-600',
    text: 'text-amber-500',
    bg: 'bg-amber-600/10',
  },
  SILVER: {
    border: 'border-gray-400',
    text: 'text-gray-300',
    bg: 'bg-gray-400/10',
  },
  GOLD: {
    border: 'border-yellow-400',
    text: 'text-yellow-400',
    bg: 'bg-yellow-400/10',
  },
  PLATINUM: {
    border: 'border-cyan-400',
    text: 'text-cyan-400',
    bg: 'bg-cyan-400/10',
  },
}

export function GuildDashboard({ guild, onLeave, isLeaving }: GuildDashboardProps) {
  const rankStyle = RANK_COLORS[guild.rank] ?? {
    border: 'border-amber-600',
    text: 'text-amber-500',
    bg: 'bg-amber-600/10',
  }
  const isLeader = guild.members?.some(
    (m) => m.role === 'LEADER' && m.userId === guild.leaderId
  )

  return (
    <div className="space-y-6">
      {/* Guild Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`system-window p-6 ${rankStyle.border} border-2`}
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-system-text">{guild.name}</h1>
              <span
                className={`px-2 py-0.5 rounded text-xs font-medium ${rankStyle.bg} ${rankStyle.text}`}
              >
                {guild.rank}
              </span>
            </div>
            {guild.description && (
              <p className="text-system-text-muted mb-4">{guild.description}</p>
            )}
            <div className="flex items-center gap-6 text-sm">
              <div>
                <span className="text-system-text-muted">Members: </span>
                <span className="text-system-text font-medium">
                  {guild.memberCount}/{guild.maxMembers}
                </span>
              </div>
              <div>
                <span className="text-system-text-muted">Weekly XP: </span>
                <span className="text-system-green font-medium">
                  {guild.weeklyXP.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-system-text-muted">Total XP: </span>
                <span className="text-system-blue font-medium">
                  {guild.totalXP.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Guild Settings / Leave */}
          <div className="flex gap-2">
            {!isLeader && (
              <button
                onClick={onLeave}
                disabled={isLeaving}
                className="px-4 py-2 rounded border border-system-red/50 text-system-red hover:bg-system-red/10 transition-colors disabled:opacity-50"
              >
                {isLeaving ? 'Leaving...' : 'Leave Guild'}
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Guild Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <StatCard
          label="Guild Rank"
          value={guild.rank}
          icon="shield"
          color={rankStyle.text}
        />
        <StatCard
          label="Min Level"
          value={`Lv.${guild.minLevel}+`}
          icon="level"
          color="text-system-blue"
        />
        <StatCard
          label="Visibility"
          value={guild.isPublic ? 'Public' : 'Private'}
          icon="eye"
          color={guild.isPublic ? 'text-system-green' : 'text-system-text-muted'}
        />
      </motion.div>

      {/* Members Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <GuildMembers members={guild.members} leaderId={guild.leaderId} />
      </motion.div>

      {/* Invite Section (for leaders/officers) */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <GuildInvite guildId={guild.id} />
      </motion.div>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string
  value: string
  icon: 'shield' | 'level' | 'eye'
  color: string
}) {
  const icons = {
    shield: '🛡️',
    level: '⬆️',
    eye: '👁️',
  }

  return (
    <div className="system-window p-4">
      <div className="flex items-center gap-3">
        <span className="text-xl">{icons[icon]}</span>
        <div>
          <div className="text-system-text-muted text-xs">{label}</div>
          <div className={`font-bold ${color}`}>{value}</div>
        </div>
      </div>
    </div>
  )
}
