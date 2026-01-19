/**
 * Theme Picker Component
 * Color theme selection with preview
 */

import { useState } from 'react'
import { useGameSounds } from '../../hooks/useSound'

interface Theme {
  id: string
  name: string
  colors: { primary: string; bg: string }
  unlocked: boolean
  selected: boolean
  requirement?: {
    type: string
    value?: number
  } | null
}

interface ThemePickerProps {
  themes: Theme[]
  onSelect: (themeId: string) => void
  disabled?: boolean
}

export function ThemePicker({ themes, onSelect, disabled }: ThemePickerProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const { playClick } = useGameSounds()

  const handleSelect = (theme: Theme) => {
    if (!theme.unlocked || disabled) return

    if (!theme.selected) {
      playClick()
      onSelect(theme.id)
    }
  }

  const getRequirementText = (req: Theme['requirement']): string => {
    if (!req) return ''

    switch (req.type) {
      case 'level':
        return `Reach level ${req.value}`
      case 'streak':
        return `${req.value} day streak`
      case 'boss_defeats':
        return `Defeat ${req.value} bosses`
      case 'season_completion':
        return `Complete ${req.value} seasons`
      default:
        return 'Unknown requirement'
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-zinc-400">Theme</h3>

      <div className="grid grid-cols-4 gap-3">
        {themes.map((theme) => (
          <div
            key={theme.id}
            className="relative"
            onMouseEnter={() => setHoveredId(theme.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <button
              onClick={() => handleSelect(theme)}
              disabled={!theme.unlocked || disabled}
              className={`
                w-full aspect-square rounded-lg overflow-hidden
                transition-all duration-200
                ${
                  theme.selected
                    ? 'ring-2 ring-white shadow-lg'
                    : theme.unlocked
                      ? 'hover:ring-1 hover:ring-zinc-600'
                      : 'opacity-50 cursor-not-allowed'
                }
              `}
            >
              {/* Theme preview */}
              <div
                className="w-full h-full flex items-center justify-center"
                style={{ backgroundColor: theme.colors.bg }}
              >
                <div
                  className="w-1/2 h-1/2 rounded-full"
                  style={{ backgroundColor: theme.colors.primary }}
                />
              </div>

              {/* Lock overlay */}
              {!theme.unlocked && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <span className="text-lg">🔒</span>
                </div>
              )}

              {/* Selected checkmark */}
              {theme.selected && (
                <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-white flex items-center justify-center">
                  <span className="text-xs">✓</span>
                </div>
              )}
            </button>

            {/* Tooltip */}
            {hoveredId === theme.id && (
              <div
                className="absolute z-10 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2
                           bg-zinc-800 rounded-lg shadow-lg text-center min-w-[100px]"
              >
                <p className="text-sm font-medium text-white">{theme.name}</p>
                {!theme.unlocked && theme.requirement && (
                  <p className="text-xs text-zinc-400 mt-1">
                    {getRequirementText(theme.requirement)}
                  </p>
                )}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-800" />
              </div>
            )}
          </div>
        ))}
      </div>

      <p className="text-xs text-zinc-500">
        {themes.filter((t) => t.unlocked).length} of {themes.length} unlocked
      </p>
    </div>
  )
}

/**
 * Frame Picker Component
 * Similar to ThemePicker but for profile frames
 */

interface Frame {
  id: string
  name: string
  style: string
  unlocked: boolean
  selected: boolean
  requirement?: {
    type: string
    value?: number
    titleId?: string
  } | null
}

interface FramePickerProps {
  frames: Frame[]
  onSelect: (frameId: string) => void
  disabled?: boolean
}

export function FramePicker({ frames, onSelect, disabled }: FramePickerProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const { playClick } = useGameSounds()

  const handleSelect = (frame: Frame) => {
    if (!frame.unlocked || disabled) return

    if (!frame.selected) {
      playClick()
      onSelect(frame.id)
    }
  }

  const getFrameStyle = (style: string): string => {
    const styles: Record<string, string> = {
      none: 'border-2 border-dashed border-zinc-700',
      bronze: 'ring-2 ring-amber-700',
      silver: 'ring-2 ring-zinc-400',
      gold: 'ring-2 ring-yellow-400',
      diamond: 'ring-2 ring-cyan-300',
      fire: 'ring-2 ring-orange-500',
      ice: 'ring-2 ring-blue-400',
      shadow: 'ring-2 ring-purple-700',
      legendary: 'ring-2 ring-pink-500',
    }
    return styles[style] ?? ''
  }

  const getRequirementText = (req: Frame['requirement']): string => {
    if (!req) return ''

    switch (req.type) {
      case 'level':
        return `Reach level ${req.value}`
      case 'streak':
        return `${req.value} day streak`
      case 'boss_defeats':
        return `Defeat ${req.value} bosses`
      case 'dungeon_clears':
        return `Clear ${req.value} dungeons`
      case 'title':
        return 'Earn legendary title'
      default:
        return 'Unknown requirement'
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-zinc-400">Frame</h3>

      <div className="grid grid-cols-3 gap-3">
        {frames.map((frame) => (
          <div
            key={frame.id}
            className="relative"
            onMouseEnter={() => setHoveredId(frame.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <button
              onClick={() => handleSelect(frame)}
              disabled={!frame.unlocked || disabled}
              className={`
                w-full aspect-square rounded-lg bg-zinc-900 flex items-center justify-center
                transition-all duration-200
                ${getFrameStyle(frame.style)}
                ${
                  frame.selected
                    ? 'shadow-lg'
                    : frame.unlocked
                      ? 'hover:bg-zinc-800'
                      : 'opacity-50 cursor-not-allowed'
                }
              `}
            >
              {/* Preview circle */}
              <div className="w-8 h-8 rounded-full bg-indigo-600" />

              {/* Lock overlay */}
              {!frame.unlocked && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                  <span className="text-lg">🔒</span>
                </div>
              )}

              {/* Selected indicator */}
              {frame.selected && (
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                  <span className="text-xs text-white">✓</span>
                </div>
              )}
            </button>

            {/* Tooltip */}
            {hoveredId === frame.id && (
              <div
                className="absolute z-10 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2
                           bg-zinc-800 rounded-lg shadow-lg text-center min-w-[100px]"
              >
                <p className="text-sm font-medium text-white">{frame.name}</p>
                {!frame.unlocked && frame.requirement && (
                  <p className="text-xs text-zinc-400 mt-1">
                    {getRequirementText(frame.requirement)}
                  </p>
                )}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-800" />
              </div>
            )}
          </div>
        ))}
      </div>

      <p className="text-xs text-zinc-500">
        {frames.filter((f) => f.unlocked).length} of {frames.length} unlocked
      </p>
    </div>
  )
}

export default ThemePicker
