/**
 * Keyboard Shortcuts Help Modal
 *
 * Displays all available keyboard shortcuts in a system-themed modal.
 */

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shortcut } from '@/hooks/useKeyboardShortcuts'

interface KeyboardShortcutsHelpProps {
  isOpen: boolean
  onClose: () => void
  shortcuts: Shortcut[]
}

export function KeyboardShortcutsHelp({ isOpen, onClose, shortcuts }: KeyboardShortcutsHelpProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  // Group shortcuts by category
  const navigationShortcuts = shortcuts.filter(s => s.category === 'navigation')
  const actionShortcuts = shortcuts.filter(s => s.category === 'actions')
  const questShortcuts = shortcuts.filter(s => s.category === 'quests')

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return

    const handleClick = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
        >
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.15 }}
            className="w-full max-w-lg bg-system-black border border-system-border rounded-lg shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-system-border bg-system-panel/50">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-system-blue">
                  {'>'} KEYBOARD SHORTCUTS
                </h2>
                <button
                  onClick={onClose}
                  className="text-system-text-muted hover:text-system-text transition-colors"
                >
                  <span className="sr-only">Close</span>
                  <kbd className="px-2 py-1 text-xs bg-system-panel border border-system-border rounded">
                    ESC
                  </kbd>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
              {/* Navigation */}
              {navigationShortcuts.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-bold text-system-green mb-3">
                    NAVIGATION
                  </h3>
                  <div className="space-y-2">
                    {navigationShortcuts.map((shortcut, i) => (
                      <ShortcutRow key={i} shortcut={shortcut} />
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              {actionShortcuts.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-bold text-system-green mb-3">
                    ACTIONS
                  </h3>
                  <div className="space-y-2">
                    {actionShortcuts.map((shortcut, i) => (
                      <ShortcutRow key={i} shortcut={shortcut} />
                    ))}
                  </div>
                </div>
              )}

              {/* Quests */}
              {questShortcuts.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-bold text-system-green mb-3">
                    QUESTS
                  </h3>
                  <div className="space-y-2">
                    {questShortcuts.map((shortcut, i) => (
                      <ShortcutRow key={i} shortcut={shortcut} />
                    ))}
                  </div>
                </div>
              )}

              {/* Tip */}
              <div className="mt-4 p-3 bg-system-panel/50 border border-system-border rounded text-xs text-system-text-muted">
                <span className="text-system-blue font-bold">TIP:</span> Press{' '}
                <kbd className="px-1.5 py-0.5 bg-system-panel border border-system-border rounded">G</kbd>
                {' '}then a letter key to navigate quickly.
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function ShortcutRow({ shortcut }: { shortcut: Shortcut }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-system-text-muted">
        {shortcut.description}
      </span>
      <ShortcutKeys keys={shortcut.keys} />
    </div>
  )
}

function ShortcutKeys({ keys }: { keys: string[] }) {
  return (
    <div className="flex items-center gap-1">
      {keys.map((key, i) => (
        <span key={i} className="flex items-center gap-1">
          <kbd className="px-2 py-1 text-xs font-mono bg-system-panel border border-system-border rounded min-w-[24px] text-center">
            {key === 'Escape' ? 'Esc' : key.toUpperCase()}
          </kbd>
          {i < keys.length - 1 && (
            <span className="text-system-text-muted text-xs">then</span>
          )}
        </span>
      ))}
    </div>
  )
}
