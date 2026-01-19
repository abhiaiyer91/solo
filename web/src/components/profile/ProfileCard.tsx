/**
 * Profile Card Component
 * Shareable profile card with customizable appearance
 */

import { useRef, useCallback } from 'react'

interface ProfileCardProps {
  displayName: string
  level: number
  title?: string
  avatar: { id: string; icon: string }
  frame: { id: string; style: string }
  theme: { id: string; colors: { primary: string; bg: string } }
  streakDays?: number
  stats?: { STR: number; AGI: number; VIT: number; DISC: number }
  settings: {
    showLevel: boolean
    showStreak: boolean
    showTitle: boolean
    showStats: boolean
  }
  onExport?: () => void
}

export function ProfileCard({
  displayName,
  level,
  title,
  avatar,
  frame,
  theme,
  streakDays = 0,
  stats,
  settings,
}: ProfileCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  // Frame styles
  const getFrameStyle = (style: string): string => {
    const styles: Record<string, string> = {
      none: '',
      bronze: 'ring-2 ring-amber-700 shadow-lg shadow-amber-700/30',
      silver: 'ring-2 ring-zinc-400 shadow-lg shadow-zinc-400/30',
      gold: 'ring-2 ring-yellow-400 shadow-lg shadow-yellow-400/30',
      diamond: 'ring-2 ring-cyan-300 shadow-lg shadow-cyan-300/30',
      fire: 'ring-2 ring-orange-500 shadow-lg shadow-orange-500/40 animate-pulse',
      ice: 'ring-2 ring-blue-400 shadow-lg shadow-blue-400/30',
      shadow: 'ring-2 ring-purple-700 shadow-lg shadow-purple-700/40',
      legendary: 'ring-4 ring-gradient-to-r from-yellow-400 via-pink-500 to-purple-500',
    }
    return styles[style] ?? ''
  }

  // Export card as image
  const handleExport = useCallback(async () => {
    if (!cardRef.current) return

    try {
      // Dynamic import html2canvas to reduce bundle size
      const { default: html2canvas } = await import('html2canvas')

      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: theme.colors.bg,
        scale: 2, // Higher resolution
      })

      // Create download link
      const link = document.createElement('a')
      link.download = `${displayName.replace(/\s+/g, '-')}-profile.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (error) {
      console.error('Failed to export profile card:', error)
    }
  }, [displayName, theme.colors.bg])

  return (
    <div className="space-y-4">
      {/* Profile Card */}
      <div
        ref={cardRef}
        className={`
          relative p-6 rounded-2xl overflow-hidden
          ${getFrameStyle(frame.style)}
        `}
        style={{ backgroundColor: theme.colors.bg }}
      >
        {/* Background pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `radial-gradient(${theme.colors.primary} 1px, transparent 1px)`,
            backgroundSize: '20px 20px',
          }}
        />

        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Avatar */}
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center text-5xl mb-4"
            style={{ backgroundColor: `${theme.colors.primary}20` }}
          >
            {avatar.icon}
          </div>

          {/* Display Name */}
          <h2 className="text-2xl font-bold text-white">{displayName}</h2>

          {/* Title */}
          {settings.showTitle && title && (
            <p className="text-sm mt-1" style={{ color: theme.colors.primary }}>
              {title}
            </p>
          )}

          {/* Level */}
          {settings.showLevel && (
            <div className="mt-3 px-4 py-1 rounded-full bg-black/30">
              <span className="text-sm font-medium text-white">Level {level}</span>
            </div>
          )}

          {/* Streak */}
          {settings.showStreak && streakDays > 0 && (
            <div className="mt-2 flex items-center gap-1 text-orange-400">
              <span>🔥</span>
              <span className="text-sm font-medium">{streakDays} day streak</span>
            </div>
          )}

          {/* Stats */}
          {settings.showStats && stats && (
            <div className="mt-4 grid grid-cols-4 gap-4 w-full max-w-xs">
              <StatBox label="STR" value={stats.STR} color={theme.colors.primary} />
              <StatBox label="AGI" value={stats.AGI} color={theme.colors.primary} />
              <StatBox label="VIT" value={stats.VIT} color={theme.colors.primary} />
              <StatBox label="DISC" value={stats.DISC} color={theme.colors.primary} />
            </div>
          )}
        </div>

        {/* Watermark */}
        <div className="absolute bottom-2 right-3 text-xs text-zinc-600">
          Journey
        </div>
      </div>

      {/* Export Button */}
      <button
        onClick={handleExport}
        className="w-full py-2 px-4 rounded-lg bg-zinc-800 hover:bg-zinc-700
                   text-sm font-medium text-zinc-300 transition-colors"
      >
        Export as Image
      </button>
    </div>
  )
}

function StatBox({
  label,
  value,
  color,
}: {
  label: string
  value: number
  color: string
}) {
  return (
    <div className="text-center">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="text-lg font-bold" style={{ color }}>
        {value}
      </p>
    </div>
  )
}

export default ProfileCard
