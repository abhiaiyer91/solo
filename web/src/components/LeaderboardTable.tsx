import { motion } from 'framer-motion'

export interface LeaderboardEntry {
  rank: number
  displayName: string
  level: number
  xp: number
  isCurrentUser: boolean
  userId: string
}

interface LeaderboardTableProps {
  entries: LeaderboardEntry[]
  isLoading?: boolean
  emptyMessage?: string
}

export function LeaderboardTable({
  entries,
  isLoading,
  emptyMessage = 'No players found',
}: LeaderboardTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 border-2 border-system-blue border-t-transparent rounded-full animate-spin" />
          <span className="text-system-text-muted">LOADING RANKINGS...</span>
        </div>
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-12 text-system-text-muted">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-system-border">
            <th className="py-3 px-4 text-left text-system-text-muted text-sm font-medium">
              RANK
            </th>
            <th className="py-3 px-4 text-left text-system-text-muted text-sm font-medium">
              HUNTER
            </th>
            <th className="py-3 px-4 text-right text-system-text-muted text-sm font-medium">
              LEVEL
            </th>
            <th className="py-3 px-4 text-right text-system-text-muted text-sm font-medium">
              XP
            </th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, index) => (
            <motion.tr
              key={`${entry.userId}-${entry.rank}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.02 }}
              className={`border-b border-system-border/50 transition-colors ${
                entry.isCurrentUser
                  ? 'bg-system-blue/10 border-system-blue/30'
                  : 'hover:bg-system-panel/50'
              }`}
            >
              <td className="py-3 px-4">
                <RankBadge rank={entry.rank} isCurrentUser={entry.isCurrentUser} />
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <span
                    className={`font-medium ${
                      entry.isCurrentUser ? 'text-system-blue' : 'text-system-text'
                    }`}
                  >
                    {entry.displayName}
                  </span>
                  {entry.isCurrentUser && (
                    <span className="text-xs px-2 py-0.5 rounded bg-system-blue/20 text-system-blue">
                      YOU
                    </span>
                  )}
                </div>
              </td>
              <td className="py-3 px-4 text-right">
                <span className="text-system-text font-mono">
                  Lv.{entry.level}
                </span>
              </td>
              <td className="py-3 px-4 text-right">
                <span className="text-system-green font-mono font-bold">
                  {entry.xp.toLocaleString()}
                </span>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function RankBadge({
  rank,
  isCurrentUser,
}: {
  rank: number
  isCurrentUser: boolean
}) {
  // Top 3 get special styling
  if (rank === 1) {
    return (
      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 text-black font-bold text-sm">
        1
      </span>
    )
  }
  if (rank === 2) {
    return (
      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 text-black font-bold text-sm">
        2
      </span>
    )
  }
  if (rank === 3) {
    return (
      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 text-white font-bold text-sm">
        3
      </span>
    )
  }

  return (
    <span
      className={`inline-flex items-center justify-center w-8 h-8 rounded font-mono text-sm ${
        isCurrentUser
          ? 'bg-system-blue/20 text-system-blue'
          : 'bg-system-panel text-system-text-muted'
      }`}
    >
      {rank}
    </span>
  )
}

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 rounded border border-system-border text-system-text-muted hover:text-system-text hover:border-system-blue disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Previous
      </button>
      <span className="px-4 py-1 text-system-text-muted">
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 rounded border border-system-border text-system-text-muted hover:text-system-text hover:border-system-blue disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Next
      </button>
    </div>
  )
}
