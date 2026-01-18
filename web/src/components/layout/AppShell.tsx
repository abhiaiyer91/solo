import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Navbar } from './Navbar'
import { MobileNav } from './MobileNav'
import { useAuth } from '@/hooks/useAuth'

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const { user, logout } = useAuth()

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
        <div className="max-w-7xl mx-auto px-4 text-center text-system-text-muted text-xs">
          Journey Fitness Quest System
        </div>
      </footer>
    </div>
  )
}
