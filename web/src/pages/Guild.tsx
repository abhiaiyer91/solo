import { useState } from 'react'
import { useUserGuild, useLeaveGuild } from '@/hooks/useGuild'
import { useSession } from '@/lib/auth-client'
import { GuildDashboard, GuildBrowser, CreateGuildModal } from '@/components/guild'

export function Guild() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const { data: session } = useSession()
  const { data: guildData, isLoading } = useUserGuild()
  const leaveMutation = useLeaveGuild()

  // Get user level from session (default to 1)
  const userLevel = (session?.user as { level?: number } | undefined)?.level ?? 1

  const handleLeave = async () => {
    if (!confirm('Are you sure you want to leave the guild?')) return

    try {
      await leaveMutation.mutateAsync()
    } catch (err) {
      console.error('Failed to leave guild:', err)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="system-window p-8">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 border-2 border-system-blue border-t-transparent rounded-full animate-spin" />
            <span className="text-system-text-muted">LOADING GUILD DATA...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {guildData?.guild ? (
        // User has a guild - show dashboard
        <GuildDashboard
          guild={guildData.guild}
          onLeave={handleLeave}
          isLeaving={leaveMutation.isPending}
        />
      ) : (
        // User has no guild - show browser
        <GuildBrowser onCreateClick={() => setShowCreateModal(true)} />
      )}

      {/* Create Guild Modal */}
      <CreateGuildModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        userLevel={userLevel}
      />
    </>
  )
}
