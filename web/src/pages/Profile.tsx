import { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usePlayer } from '@/hooks/usePlayer'
import { useAuth } from '@/hooks/useAuth'
import { TimezoneSelect, NotificationSettings } from '@/components/profile'
import { ArchivesHistory } from '@/components/ArchiveModal'
import { api, queryKeys } from '@/lib/api'
import { toast } from '@/components/ui/toast'

export function Profile() {
  const { data: player, isLoading: playerLoading } = usePlayer()
  const { logout } = useAuth()
  const queryClient = useQueryClient()

  const [timezone, setTimezone] = useState<string | null>(null)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const updateMutation = useMutation({
    mutationFn: (data: { timezone?: string; name?: string }) =>
      api.patch<{ message: string }>('/api/player', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.player() })
    },
  })

  const handleTimezoneChange = (newTimezone: string) => {
    setTimezone(newTimezone)
    updateMutation.mutate({ timezone: newTimezone })
  }

  const handleLogout = () => {
    logout()
  }

  if (playerLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="system-window p-8">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 border-2 border-system-blue border-t-transparent rounded-full animate-spin" />
            <span className="text-system-text-muted">LOADING PROFILE...</span>
          </div>
        </div>
      </div>
    )
  }

  const currentTimezone = timezone ?? player?.timezone ?? 'UTC'

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="system-window p-6"
      >
        <h1 className="text-xl font-bold text-system-blue mb-2">
          HUNTER PROFILE
        </h1>
        <p className="text-system-text-muted text-sm">
          Manage your account settings and preferences.
        </p>
      </motion.div>

      {/* Account Info */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="system-window p-6"
      >
        <h2 className="text-lg font-bold text-system-text mb-4 flex items-center gap-2">
          <span className="w-2 h-2 bg-system-blue rounded-full" />
          ACCOUNT INFO
        </h2>

        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b border-system-border">
            <span className="text-system-text-muted">Name</span>
            <span className="text-system-text font-bold">
              {player?.name || 'Hunter'}
            </span>
          </div>

          <div className="flex justify-between items-center py-3 border-b border-system-border">
            <span className="text-system-text-muted">Email</span>
            <span className="text-system-text">{player?.email}</span>
          </div>

          <div className="flex justify-between items-center py-3 border-b border-system-border">
            <span className="text-system-text-muted">Level</span>
            <span className="text-system-blue font-bold">
              Level {player?.level ?? 1}
            </span>
          </div>

          <div className="flex justify-between items-center py-3">
            <span className="text-system-text-muted">Total XP</span>
            <span className="text-system-green font-bold">
              {player?.totalXP ?? 0} XP
            </span>
          </div>
        </div>
      </motion.div>

      {/* Timezone Settings */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="system-window p-6"
      >
        <h2 className="text-lg font-bold text-system-text mb-4 flex items-center gap-2">
          <span className="w-2 h-2 bg-system-gold rounded-full" />
          TIMEZONE
        </h2>

        <p className="text-system-text-muted text-sm mb-4">
          Your timezone is used to determine when daily quests reset and when
          streaks are calculated.
        </p>

        <TimezoneSelect
          value={currentTimezone}
          onChange={handleTimezoneChange}
          disabled={updateMutation.isPending}
        />

        {updateMutation.isSuccess && (
          <p className="text-system-green text-sm mt-2">
            Timezone updated successfully.
          </p>
        )}

        {updateMutation.isError && (
          <p className="text-system-red text-sm mt-2">
            Failed to update timezone.
          </p>
        )}
      </motion.div>

      {/* Notification Settings */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="system-window p-6"
      >
        <h2 className="text-lg font-bold text-system-text mb-4 flex items-center gap-2">
          <span className="w-2 h-2 bg-system-green rounded-full" />
          NOTIFICATIONS
        </h2>

        <p className="text-system-text-muted text-sm mb-4">
          All notifications are opt-in and respect quiet hours.
        </p>

        <NotificationSettings />
      </motion.div>

      {/* Account Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="system-window p-6"
      >
        <h2 className="text-lg font-bold text-system-text mb-4 flex items-center gap-2">
          <span className="w-2 h-2 bg-system-purple rounded-full" />
          STATISTICS
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 border border-system-border rounded text-center">
            <div className="text-2xl font-bold text-system-gold">
              {player?.currentStreak ?? 0}
            </div>
            <div className="text-system-text-muted text-xs">Current Streak</div>
          </div>

          <div className="p-4 border border-system-border rounded text-center">
            <div className="text-2xl font-bold text-system-text">
              {player?.longestStreak ?? 0}
            </div>
            <div className="text-system-text-muted text-xs">Longest Streak</div>
          </div>

          <div className="p-4 border border-system-border rounded text-center">
            <div className="text-2xl font-bold text-system-purple">
              {player?.perfectStreak ?? 0}
            </div>
            <div className="text-system-text-muted text-xs">Perfect Days</div>
          </div>

          <div className="p-4 border border-system-border rounded text-center">
            <div className="text-2xl font-bold text-system-blue">
              {player?.level ?? 1}
            </div>
            <div className="text-system-text-muted text-xs">Current Level</div>
          </div>
        </div>
      </motion.div>

      {/* Hard Mode */}
      <HardModeSection level={player?.level ?? 1} />

      {/* Archived Runs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="system-window p-6"
      >
        <h2 className="text-lg font-bold text-system-text mb-4 flex items-center gap-2">
          <span className="w-2 h-2 bg-system-purple rounded-full" />
          ARCHIVED RUNS
        </h2>
        <p className="text-system-text-muted text-xs mb-4">
          Previous runs that have been archived. Each archive preserves a snapshot of your progress.
        </p>
        <ArchivesHistory />
      </motion.div>

      {/* Logout */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="system-window p-6"
      >
        <h2 className="text-lg font-bold text-system-text mb-4 flex items-center gap-2">
          <span className="w-2 h-2 bg-system-red rounded-full" />
          SESSION
        </h2>

        {!showLogoutConfirm ? (
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full py-3 border border-system-red/50 rounded text-system-red
                       hover:bg-system-red/10 transition-colors"
          >
            Logout
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-system-text-muted text-sm text-center">
              Are you sure you want to logout?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-3 border border-system-border rounded text-system-text-muted
                           hover:bg-system-panel transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-3 bg-system-red/20 border border-system-red rounded text-system-red
                           hover:bg-system-red/30 transition-colors"
              >
                Confirm Logout
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}

// Hard Mode Section Component
interface HardModeStatus {
  isUnlocked: boolean
  isEnabled: boolean
  unlockReason: string | null
  stats: {
    questsCompleted: number
    dungeonsCleared: number
    perfectDays: number
  }
}

function HardModeSection({ level }: { level: number }) {
  const queryClient = useQueryClient()

  const { data: status, isLoading } = useQuery<HardModeStatus>({
    queryKey: ['hard-mode'],
    queryFn: async () => {
      const res = await api.get('/api/player/hard-mode') as Response
      if (!res.ok) throw new Error('Failed to get hard mode status')
      return res.json() as Promise<HardModeStatus>
    },
  })

  const enableMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/api/player/hard-mode/enable') as Response
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to enable')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hard-mode'] })
      toast.success('Hard Mode activated')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to enable')
    },
  })

  const disableMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/api/player/hard-mode/disable') as Response
      if (!res.ok) throw new Error('Failed to disable')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hard-mode'] })
      toast.system('Hard Mode deactivated')
    },
  })

  const isProcessing = enableMutation.isPending || disableMutation.isPending
  const isUnlocked = status?.isUnlocked ?? level >= 25

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="system-window p-6"
    >
      <h2 className="text-lg font-bold text-system-text mb-4 flex items-center gap-2">
        <span className="w-2 h-2 bg-system-gold rounded-full" />
        HARD MODE
      </h2>

      {isLoading ? (
        <div className="flex items-center gap-2 py-4">
          <div className="w-4 h-4 border-2 border-system-gold border-t-transparent rounded-full animate-spin" />
          <span className="text-system-text-muted text-sm">Loading...</span>
        </div>
      ) : !isUnlocked ? (
        <div className="p-4 border border-system-border rounded bg-system-black/30">
          <p className="text-system-text-muted text-sm">
            Hard Mode unlocks at Level 25 or Season 3.
          </p>
          <p className="text-system-text-muted text-xs mt-2">
            Current: Level {level}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-system-border rounded">
            <div>
              <div className="text-system-text font-medium">
                {status?.isEnabled ? 'Hard Mode Active' : 'Enable Hard Mode'}
              </div>
              <p className="text-system-text-muted text-xs mt-1">
                {status?.isEnabled
                  ? '1.5x XP • Stricter requirements • No partial credit'
                  : 'Challenging content for experienced players'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => status?.isEnabled ? disableMutation.mutate() : enableMutation.mutate()}
              disabled={isProcessing}
              className={`
                w-14 h-7 rounded-full transition-colors relative
                ${status?.isEnabled ? 'bg-system-gold' : 'bg-system-border'}
                ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
              aria-label={status?.isEnabled ? 'Disable hard mode' : 'Enable hard mode'}
            >
              <span
                className={`
                  absolute top-1 w-5 h-5 rounded-full bg-white transition-transform
                  ${status?.isEnabled ? 'translate-x-8' : 'translate-x-1'}
                `}
              />
            </button>
          </div>

          {status?.isEnabled && (
            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 border border-system-gold/30 rounded text-center bg-system-gold/5">
                <div className="text-lg font-bold text-system-gold">
                  {status.stats.questsCompleted}
                </div>
                <div className="text-system-text-muted text-xs">Quests</div>
              </div>
              <div className="p-3 border border-system-gold/30 rounded text-center bg-system-gold/5">
                <div className="text-lg font-bold text-system-gold">
                  {status.stats.dungeonsCleared}
                </div>
                <div className="text-system-text-muted text-xs">Dungeons</div>
              </div>
              <div className="p-3 border border-system-gold/30 rounded text-center bg-system-gold/5">
                <div className="text-lg font-bold text-system-gold">
                  {status.stats.perfectDays}
                </div>
                <div className="text-system-text-muted text-xs">Perfect</div>
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}
