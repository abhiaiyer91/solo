import { useState } from 'react'
import { motion } from 'framer-motion'
import { useInviteToGuild } from '@/hooks/useGuild'

interface GuildInviteProps {
  guildId: string
}

export function GuildInvite({ guildId }: GuildInviteProps) {
  const [userId, setUserId] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  )

  const inviteMutation = useInviteToGuild()

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    if (!userId.trim()) {
      setMessage({ type: 'error', text: 'Please enter a user ID' })
      return
    }

    try {
      await inviteMutation.mutateAsync(userId)
      setMessage({ type: 'success', text: 'Invitation sent!' })
      setUserId('')
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to send invite',
      })
    }
  }

  return (
    <div className="system-window p-6">
      <h2 className="text-lg font-bold text-system-text mb-4 flex items-center gap-2">
        <span className="text-system-purple">{'>'}</span>
        INVITE HUNTERS
      </h2>

      <p className="text-system-text-muted text-sm mb-4">
        Leaders and officers can invite players to join the guild.
      </p>

      <form onSubmit={handleInvite} className="space-y-4">
        <div className="flex gap-3">
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="Enter player ID"
            className="flex-1 px-4 py-2 rounded border border-system-border bg-system-black text-system-text placeholder:text-system-text-muted focus:border-system-purple focus:outline-none"
          />
          <button
            type="submit"
            disabled={inviteMutation.isPending || !userId.trim()}
            className="px-6 py-2 rounded bg-system-purple text-white font-medium hover:bg-system-purple/90 transition-colors disabled:opacity-50"
          >
            {inviteMutation.isPending ? 'Sending...' : 'Invite'}
          </button>
        </div>

        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-3 rounded text-sm ${
              message.type === 'success'
                ? 'bg-system-green/10 border border-system-green/50 text-system-green'
                : 'bg-system-red/10 border border-system-red/50 text-system-red'
            }`}
          >
            {message.text}
          </motion.div>
        )}
      </form>

      <div className="mt-6 pt-4 border-t border-system-border">
        <h3 className="text-sm font-medium text-system-text-muted mb-2">
          Share Guild Link
        </h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={`${window.location.origin}/guild/join/${guildId}`}
            readOnly
            className="flex-1 px-3 py-2 rounded border border-system-border bg-system-panel text-system-text-muted text-sm"
          />
          <button
            onClick={() => {
              navigator.clipboard.writeText(
                `${window.location.origin}/guild/join/${guildId}`
              )
              setMessage({ type: 'success', text: 'Link copied!' })
            }}
            className="px-4 py-2 rounded border border-system-border text-system-text-muted hover:text-system-text hover:border-system-blue transition-colors"
          >
            Copy
          </button>
        </div>
      </div>
    </div>
  )
}
