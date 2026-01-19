import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Navbar } from './Navbar'
import { MobileNav } from './MobileNav'
import { useAuth } from '@/hooks/useAuth'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { KeyboardShortcutsHelp } from '@/components/KeyboardShortcutsHelp'

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const { user, logout } = useAuth()
  const { shortcuts, showHelp, closeHelp, pendingPrefix } = useKeyboardShortcuts()

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-system-black/95 backdrop-blur border-b border-system-border">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo / Brand */}
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold text-system-blue tracking-wider">
              JOURNEY
            </h1>
            <Navbar />
          </div>

          {/* User info & mobile nav */}
          <div className="flex items-center gap-4">
            {/* Player badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-system-panel rounded border border-system-border">
              <span className="text-system-blue font-bold">
                Lv.{user?.level ?? 1}
              </span>
              <span className="text-system-text-muted text-sm">
                {user?.name || 'Hunter'}
              </span>
            </div>

            {/* Logout button (desktop) */}
            <button
              onClick={logout}
              className="hidden md:block px-3 py-1.5 text-sm text-system-text-muted hover:text-system-text transition-colors"
            >
              Logout
            </button>

            {/* Mobile navigation */}
            <MobileNav />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="max-w-7xl mx-auto px-4 py-6"
        >
          {children}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-system-border py-4">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-4">
          <span className="text-system-text-muted text-xs">
            Journey Fitness Quest System
          </span>
          <span className="text-system-text-muted text-xs hidden sm:inline">
            Press <kbd className="px-1 py-0.5 bg-system-panel border border-system-border rounded text-[10px]">?</kbd> for shortcuts
          </span>
        </div>
      </footer>

      {/* Keyboard shortcut prefix indicator */}
      {pendingPrefix && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40">
          <div className="px-4 py-2 bg-system-panel border border-system-blue rounded-lg shadow-lg">
            <span className="text-system-blue font-mono text-sm">
              g + <span className="animate-pulse">_</span>
            </span>
          </div>
        </div>
      )}

      {/* Keyboard shortcuts help modal */}
      <KeyboardShortcutsHelp
        isOpen={showHelp}
        onClose={closeHelp}
        shortcuts={shortcuts}
      />
    </div>
  )
}
