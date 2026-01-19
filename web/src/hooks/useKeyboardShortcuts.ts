/**
 * Keyboard Shortcuts Hook
 *
 * Provides global keyboard shortcuts for navigation and actions.
 * Uses a two-key combo system for navigation (g+key) and single keys for actions.
 */

import { useEffect, useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export interface Shortcut {
  keys: string[]
  description: string
  action: () => void
  category: 'navigation' | 'actions' | 'quests'
}

interface UseKeyboardShortcutsOptions {
  enabled?: boolean
}

export function useKeyboardShortcuts(options: UseKeyboardShortcutsOptions = {}) {
  const { enabled = true } = options
  const navigate = useNavigate()
  const [showHelp, setShowHelp] = useState(false)
  const [pendingPrefix, setPendingPrefix] = useState<string | null>(null)

  const toggleHelp = useCallback(() => setShowHelp(prev => !prev), [])
  const closeHelp = useCallback(() => setShowHelp(false), [])

  // Define all shortcuts
  const shortcuts: Shortcut[] = [
    // Navigation shortcuts (g + key)
    { keys: ['g', 'h'], description: 'Go to Dashboard (Home)', action: () => navigate('/'), category: 'navigation' },
    { keys: ['g', 'q'], description: 'Go to Quests', action: () => navigate('/quests'), category: 'navigation' },
    { keys: ['g', 's'], description: 'Go to Stats', action: () => navigate('/stats'), category: 'navigation' },
    { keys: ['g', 'p'], description: 'Go to Profile', action: () => navigate('/profile'), category: 'navigation' },
    { keys: ['g', 'l'], description: 'Go to Leaderboard', action: () => navigate('/leaderboard'), category: 'navigation' },
    { keys: ['g', 't'], description: 'Go to Titles', action: () => navigate('/titles'), category: 'navigation' },
    { keys: ['g', 'd'], description: 'Go to Dungeons', action: () => navigate('/dungeons'), category: 'navigation' },
    { keys: ['g', 'g'], description: 'Go to Guild', action: () => navigate('/guild'), category: 'navigation' },

    // Action shortcuts
    { keys: ['?'], description: 'Show keyboard shortcuts', action: toggleHelp, category: 'actions' },
    { keys: ['Escape'], description: 'Close modal / Cancel', action: closeHelp, category: 'actions' },
  ]

  useEffect(() => {
    if (!enabled) return

    let prefixTimeout: ReturnType<typeof setTimeout> | null = null

    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if typing in an input field
      const target = event.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return
      }

      const key = event.key.toLowerCase()

      // Handle Escape key
      if (key === 'escape') {
        if (showHelp) {
          closeHelp()
          event.preventDefault()
        }
        setPendingPrefix(null)
        return
      }

      // Handle ? for help (requires shift)
      if (event.key === '?' || (event.shiftKey && key === '/')) {
        toggleHelp()
        event.preventDefault()
        return
      }

      // Handle prefix key (g for "go to")
      if (key === 'g' && !pendingPrefix) {
        setPendingPrefix('g')
        // Clear prefix after 1 second if no second key pressed
        prefixTimeout = setTimeout(() => {
          setPendingPrefix(null)
        }, 1000)
        event.preventDefault()
        return
      }

      // Handle second key after prefix
      if (pendingPrefix === 'g') {
        const shortcut = shortcuts.find(
          s => s.keys.length === 2 && s.keys[0] === 'g' && s.keys[1] === key
        )
        if (shortcut) {
          shortcut.action()
          event.preventDefault()
        }
        setPendingPrefix(null)
        if (prefixTimeout) clearTimeout(prefixTimeout)
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      if (prefixTimeout) clearTimeout(prefixTimeout)
    }
  }, [enabled, pendingPrefix, showHelp, shortcuts, toggleHelp, closeHelp])

  return {
    shortcuts,
    showHelp,
    toggleHelp,
    closeHelp,
    pendingPrefix,
  }
}

/**
 * Format shortcut keys for display
 */
export function formatShortcutKeys(keys: string[]): string {
  return keys.map(key => {
    if (key === 'Escape') return 'Esc'
    return key.toUpperCase()
  }).join(' + ')
}
