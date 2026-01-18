import { motion } from 'framer-motion'
import type { GuildMember } from '@/hooks/useGuild'

interface GuildMembersProps {
  members: GuildMember[]
  leaderId: string
}

const ROLE_BADGES: Record<string, { label: string; color: string }> = {
  LEADER: { label: 'Leader', color: 'text-system-gold' },
  OFFICER: { label: 'Officer', color: 'text-system-blue' },
  MEMBER: { label: 'Member', color: 'text-system-text-muted' },
}

export function GuildMembers({ members, leaderId: _leaderId }: GuildMembersProps) {
  // Sort members: Leader first, then Officers, then Members by XP
  const sortedMembers = [...members].sort((a, b) => {
    if (a.role === 'LEADER') return -1
    if (b.role === 'LEADER') return 1
    if (a.role === 'OFFICER' && b.role !== 'OFFICER') return -1
    if (b.role === 'OFFICER' && a.role !== 'OFFICER') return 1
    return b.contributedXP - a.contributedXP
  })

  return (
    <div className="system-window p-6">
      <h2 className="text-lg font-bold text-system-text mb-4 flex items-center gap-2">
        <span className="text-system-blue">{'>'}</span>
        GUILD MEMBERS
        <span className="text-system-text-muted font-normal text-sm ml-2">
          ({members.length})
        </span>
      </h2>

      <div className="space-y-2">
        {sortedMembers.map((member, index) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center justify-between p-3 rounded bg-system-panel/50 hover:bg-system-panel transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-system-text-muted text-sm w-6">
                #{index + 1}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-system-text font-medium">
                    Player {member.userId.slice(-4)}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${ROLE_BADGES[member.role]?.color ?? 'text-system-text-muted'} bg-system-black/50`}
                  >
                    {ROLE_BADGES[member.role]?.label ?? 'Member'}
                  </span>
                </div>
                <div className="text-system-text-muted text-xs">
                  Joined {new Date(member.joinedAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-system-green font-medium">
                +{member.contributedXP.toLocaleString()} XP
              </div>
              <div className="text-system-text-muted text-xs">contributed</div>
            </div>
          </motion.div>
        ))}

        {members.length === 0 && (
          <div className="text-center text-system-text-muted py-8">
            No members yet. Invite hunters to join!
          </div>
        )}
      </div>
    </div>
  )
}
