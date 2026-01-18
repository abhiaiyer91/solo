import { motion } from 'framer-motion'
import { usePublicGuilds, useJoinGuild, type Guild } from '@/hooks/useGuild'

interface GuildBrowserProps {
  onCreateClick: () => void
}

const RANK_COLORS: Record<string, { border: string; text: string }> = {
  BRONZE: { border: 'border-amber-600/30', text: 'text-amber-500' },
  SILVER: { border: 'border-gray-400/30', text: 'text-gray-300' },
  GOLD: { border: 'border-yellow-400/30', text: 'text-yellow-400' },
  PLATINUM: { border: 'border-cyan-400/30', text: 'text-cyan-400' },
}

export function GuildBrowser({ onCreateClick }: GuildBrowserProps) {
  const { data, isLoading } = usePublicGuilds(20)
  const joinMutation = useJoinGuild()

  const handleJoin = async (guildId: string) => {
    try {
      await joinMutation.mutateAsync(guildId)
    } catch (err) {
      console.error('Failed to join guild:', err)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="system-window p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-system-blue mb-2">
              GUILD HALL
            </h1>
            <p className="text-system-text-muted text-sm">
              Join forces with other hunters. Together, you are stronger.
            </p>
          </div>
          <button
            onClick={onCreateClick}
            className="px-6 py-2 rounded bg-system-blue text-system-black font-medium hover:bg-system-blue/90 transition-colors"
          >
            Create Guild
          </button>
        </div>
      </motion.div>

      {/* Guild List */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="system-window p-6"
      >
        <h2 className="text-lg font-bold text-system-text mb-4">
          AVAILABLE GUILDS
        </h2>

        {isLoading ? (
          <div className="text-center py-12 text-system-text-muted">
            Loading guilds...
          </div>
        ) : data?.guilds && data.guilds.length > 0 ? (
          <div className="grid gap-4">
            {data.guilds.map((guild, index) => (
              <GuildCard
                key={guild.id}
                guild={guild}
                index={index}
                onJoin={() => handleJoin(guild.id)}
                isJoining={joinMutation.isPending}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🏰</div>
            <p className="text-system-text-muted mb-2">No guilds available</p>
            <p className="text-system-text text-sm">
              Be the first to create one!
            </p>
          </div>
        )}
      </motion.div>
    </div>
  )
}

function GuildCard({
  guild,
  index,
  onJoin,
  isJoining,
}: {
  guild: Guild
  index: number
  onJoin: () => void
  isJoining: boolean
}) {
  const rankStyle = RANK_COLORS[guild.rank] ?? { border: 'border-amber-600/30', text: 'text-amber-500' }
  const isFull = guild.memberCount >= guild.maxMembers

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`p-4 rounded border ${rankStyle.border} bg-system-panel/30 hover:bg-system-panel/50 transition-colors`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-system-text">{guild.name}</h3>
            <span className={`text-xs px-2 py-0.5 rounded ${rankStyle.text} bg-system-black/50`}>
              {guild.rank}
            </span>
          </div>
          {guild.description && (
            <p className="text-system-text-muted text-sm mb-2 line-clamp-1">
              {guild.description}
            </p>
          )}
          <div className="flex items-center gap-4 text-xs text-system-text-muted">
            <span>
              Members: {guild.memberCount}/{guild.maxMembers}
            </span>
            <span>Min Level: {guild.minLevel}</span>
            <span className="text-system-green">
              {guild.weeklyXP.toLocaleString()} weekly XP
            </span>
          </div>
        </div>

        <button
          onClick={onJoin}
          disabled={isJoining || isFull}
          className={`px-4 py-2 rounded font-medium transition-colors ${
            isFull
              ? 'bg-system-border text-system-text-muted cursor-not-allowed'
              : 'bg-system-green text-system-black hover:bg-system-green/90'
          }`}
        >
          {isFull ? 'Full' : isJoining ? 'Joining...' : 'Join'}
        </button>
      </div>
    </motion.div>
  )
}
