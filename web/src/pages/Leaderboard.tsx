import { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  LeaderboardTable,
  Pagination,
  type LeaderboardEntry,
} from '@/components/LeaderboardTable'

type LeaderboardType = 'global' | 'weekly' | 'seasonal'

interface LeaderboardResponse {
  entries: LeaderboardEntry[]
  totalPlayers: number
  currentPage: number
  totalPages: number
  pageSize: number
  seasonName?: string | null
}

interface PlayerRanks {
  global: { rank: number; total: number } | null
  weekly: { rank: number; total: number } | null
  seasonal: { rank: number; total: number; seasonName: string } | null
}

interface LeaderboardPreferences {
  optIn: boolean
  displayName: string | null
}

async function fetchLeaderboard(
  type: LeaderboardType,
  page: number
): Promise<LeaderboardResponse> {
  const res = await fetch(`/api/leaderboards/${type}?page=${page}`, {
    credentials: 'include',
  })
  if (!res.ok) throw new Error('Failed to fetch leaderboard')
  return res.json()
}

async function fetchPlayerRanks(): Promise<PlayerRanks> {
  const res = await fetch('/api/leaderboards/me', {
    credentials: 'include',
  })
  if (!res.ok) throw new Error('Failed to fetch player ranks')
  return res.json()
}

async function fetchPreferences(): Promise<LeaderboardPreferences> {
  const res = await fetch('/api/leaderboards/preferences', {
    credentials: 'include',
  })
  if (!res.ok) throw new Error('Failed to fetch preferences')
  return res.json()
}

async function updatePreferences(
  optIn: boolean,
  displayName?: string
): Promise<LeaderboardPreferences> {
  const res = await fetch('/api/leaderboards/preferences', {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ optIn, displayName }),
  })
  if (!res.ok) throw new Error('Failed to update preferences')
  return res.json()
}

export function Leaderboard() {
  const [activeTab, setActiveTab] = useState<LeaderboardType>('global')
  const [page, setPage] = useState(1)
  const [showSettings, setShowSettings] = useState(false)
  const queryClient = useQueryClient()

  // Fetch leaderboard data
  const { data: leaderboard, isLoading: leaderboardLoading } = useQuery({
    queryKey: ['leaderboard', activeTab, page],
    queryFn: () => fetchLeaderboard(activeTab, page),
  })

  // Fetch player's ranks
  const { data: playerRanks } = useQuery({
    queryKey: ['leaderboard', 'me'],
    queryFn: fetchPlayerRanks,
  })

  // Fetch preferences
  const { data: preferences } = useQuery({
    queryKey: ['leaderboard', 'preferences'],
    queryFn: fetchPreferences,
  })

  // Update preferences mutation
  const preferencesMutation = useMutation({
    mutationFn: ({ optIn, displayName }: { optIn: boolean; displayName?: string }) =>
      updatePreferences(optIn, displayName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] })
    },
  })

  const handleTabChange = (tab: LeaderboardType) => {
    setActiveTab(tab)
    setPage(1)
  }

  const tabs: { id: LeaderboardType; label: string; description: string }[] = [
    { id: 'global', label: 'GLOBAL', description: 'All-time total XP' },
    { id: 'weekly', label: 'WEEKLY', description: 'XP earned this week' },
    { id: 'seasonal', label: 'SEASONAL', description: 'Current season XP' },
  ]

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
              HUNTER RANKINGS
            </h1>
            <p className="text-system-text-muted text-sm">
              The System records all. Your position among hunters is revealed.
            </p>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="px-4 py-2 rounded border border-system-border text-system-text-muted hover:text-system-text hover:border-system-blue transition-colors"
          >
            {showSettings ? 'Hide Settings' : 'Privacy Settings'}
          </button>
        </div>

        {/* Privacy Settings Panel */}
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-system-border"
          >
            <h3 className="text-sm font-medium text-system-text mb-3">
              Display Preferences
            </h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences?.optIn ?? false}
                  onChange={(e) =>
                    preferencesMutation.mutate({
                      optIn: e.target.checked,
                      displayName: preferences?.displayName ?? undefined,
                    })
                  }
                  className="w-4 h-4 rounded border-system-border bg-system-black text-system-blue focus:ring-system-blue"
                />
                <span className="text-system-text-muted text-sm">
                  Show my name on the leaderboard (default: anonymous)
                </span>
              </label>
              {preferences?.optIn && (
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="Custom display name (optional)"
                    defaultValue={preferences?.displayName ?? ''}
                    onBlur={(e) =>
                      preferencesMutation.mutate({
                        optIn: preferences.optIn,
                        displayName: e.target.value || undefined,
                      })
                    }
                    className="flex-1 px-3 py-2 rounded border border-system-border bg-system-black text-system-text placeholder:text-system-text-muted focus:border-system-blue focus:outline-none"
                  />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Your Rank Summary */}
      {playerRanks && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="system-window p-6"
        >
          <h2 className="text-lg font-bold text-system-text mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-system-gold rounded-full" />
            YOUR RANKINGS
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <RankCard
              label="Global Rank"
              rank={playerRanks.global?.rank ?? null}
              total={playerRanks.global?.total ?? 0}
              color="blue"
            />
            <RankCard
              label="Weekly Rank"
              rank={playerRanks.weekly?.rank ?? null}
              total={playerRanks.weekly?.total ?? 0}
              color="green"
              emptyText="No weekly activity"
            />
            <RankCard
              label={playerRanks.seasonal?.seasonName ?? 'Seasonal Rank'}
              rank={playerRanks.seasonal?.rank ?? null}
              total={playerRanks.seasonal?.total ?? 0}
              color="purple"
              emptyText="Not in a season"
            />
          </div>
        </motion.div>
      )}

      {/* Leaderboard Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="system-window"
      >
        {/* Tab Navigation */}
        <div className="border-b border-system-border p-1 flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex-1 px-4 py-3 rounded-t text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-system-panel text-system-blue border-b-2 border-system-blue'
                  : 'text-system-text-muted hover:text-system-text hover:bg-system-panel/50'
              }`}
            >
              {tab.label}
              <span className="block text-xs opacity-60 mt-0.5">
                {tab.description}
              </span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'seasonal' && leaderboard?.seasonName && (
            <div className="mb-4 text-center text-system-text-muted text-sm">
              Current Season: <span className="text-system-purple">{leaderboard.seasonName}</span>
            </div>
          )}

          <LeaderboardTable
            entries={leaderboard?.entries ?? []}
            isLoading={leaderboardLoading}
            emptyMessage={
              activeTab === 'weekly'
                ? 'No weekly activity yet. Complete quests to appear!'
                : activeTab === 'seasonal'
                  ? 'No active season or no participants yet.'
                  : 'No players found.'
            }
          />

          <Pagination
            currentPage={leaderboard?.currentPage ?? 1}
            totalPages={leaderboard?.totalPages ?? 1}
            onPageChange={setPage}
          />

          {leaderboard && leaderboard.totalPlayers > 0 && (
            <div className="mt-4 text-center text-system-text-muted text-sm">
              {leaderboard.totalPlayers.toLocaleString()} total hunters
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

function RankCard({
  label,
  rank,
  total,
  color,
  emptyText = 'Not ranked',
}: {
  label: string
  rank: number | null
  total: number
  color: 'blue' | 'green' | 'purple' | 'gold'
  emptyText?: string
}) {
  const colorClasses = {
    blue: 'border-system-blue/30 bg-system-blue/5',
    green: 'border-system-green/30 bg-system-green/5',
    purple: 'border-system-purple/30 bg-system-purple/5',
    gold: 'border-system-gold/30 bg-system-gold/5',
  }

  const textColors = {
    blue: 'text-system-blue',
    green: 'text-system-green',
    purple: 'text-system-purple',
    gold: 'text-system-gold',
  }

  return (
    <div className={`p-4 border rounded ${colorClasses[color]}`}>
      <div className="text-system-text-muted text-sm mb-1">{label}</div>
      {rank !== null ? (
        <>
          <div className={`text-2xl font-bold ${textColors[color]}`}>
            #{rank}
          </div>
          <div className="text-system-text-muted text-xs">
            of {total.toLocaleString()}
          </div>
        </>
      ) : (
        <div className="text-system-text-muted text-lg">{emptyText}</div>
      )}
    </div>
  )
}
