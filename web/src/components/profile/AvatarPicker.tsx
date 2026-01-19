/**
 * Avatar Picker Component
 * Grid of avatars with unlock status
 */

import { useState } from 'react'
import { useGameSounds } from '../../hooks/useSound'

interface Avatar {
  id: string
  name: string
  icon: string
  unlocked: boolean
  selected: boolean
  requirement?: {
    type: string
    value?: number
    stat?: string
  } | null
}

interface AvatarPickerProps {
  avatars: Avatar[]
  onSelect: (avatarId: string) => void
  disabled?: boolean
}

export function AvatarPicker({ avatars, onSelect, disabled }: AvatarPickerProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const { playClick, playUnlock } = useGameSounds()

  const handleSelect = (avatar: Avatar) => {
    if (!avatar.unlocked || disabled) return

    if (!avatar.selected) {
      playClick()
      onSelect(avatar.id)
    }
  }

  const getRequirementText = (req: Avatar['requirement']): string => {
    if (!req) return ''

    switch (req.type) {
      case 'level':
        return `Reach level ${req.value}`
      case 'streak':
        return `${req.value} day streak`
      case 'stat':
        return `${req.value} ${req.stat} points`
      case 'boss_defeats':
        return `Defeat ${req.value} bosses`
      case 'dungeon_clears':
        return `Clear ${req.value} dungeons`
      case 'perfect_days':
        return `${req.value} perfect days`
      case 'special':
        return 'Special achievement'
      default:
        return 'Unknown requirement'
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-zinc-400">Avatar</h3>

      <div className="grid grid-cols-4 gap-3">
        {avatars.map((avatar) => (
          <div
            key={avatar.id}
            className="relative"
            onMouseEnter={() => setHoveredId(avatar.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <button
              onClick={() => handleSelect(avatar)}
              disabled={!avatar.unlocked || disabled}
              className={`
                w-full aspect-square rounded-lg flex items-center justify-center text-3xl
                transition-all duration-200
                ${
                  avatar.selected
                    ? 'bg-indigo-600 ring-2 ring-indigo-400 shadow-lg shadow-indigo-500/30'
                    : avatar.unlocked
                      ? 'bg-zinc-800 hover:bg-zinc-700 hover:ring-1 hover:ring-zinc-600'
                      : 'bg-zinc-900 opacity-50 cursor-not-allowed'
                }
              `}
            >
              {avatar.icon}

              {/* Lock overlay for locked avatars */}
              {!avatar.unlocked && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                  <span className="text-lg">🔒</span>
                </div>
              )}
            </button>

            {/* Tooltip */}
            {hoveredId === avatar.id && (
              <div
                className="absolute z-10 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2
                           bg-zinc-800 rounded-lg shadow-lg text-center min-w-[120px]"
              >
                <p className="text-sm font-medium text-white">{avatar.name}</p>
                {!avatar.unlocked && avatar.requirement && (
                  <p className="text-xs text-zinc-400 mt-1">
                    {getRequirementText(avatar.requirement)}
                  </p>
                )}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-800" />
              </div>
            )}
          </div>
        ))}
      </div>

      <p className="text-xs text-zinc-500">
        {avatars.filter((a) => a.unlocked).length} of {avatars.length} unlocked
      </p>
    </div>
  )
}

export default AvatarPicker
