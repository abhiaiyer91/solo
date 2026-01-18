import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'

const navItems = [
  { path: '/', label: 'Dashboard', icon: '◈' },
  { path: '/quests', label: 'Quests', icon: '⚔' },
  { path: '/leaderboard', label: 'Rankings', icon: '◊' },
  { path: '/stats', label: 'Stats', icon: '◆' },
  { path: '/profile', label: 'Profile', icon: '◉' },
]

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)
  const { logout } = useAuth()

  return (
    <div className="md:hidden">
      {/* Hamburger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-system-text-muted hover:text-system-text"
        aria-label="Toggle menu"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 z-40"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.2 }}
              className="fixed right-0 top-0 bottom-0 w-64 bg-system-dark border-l border-system-border z-50"
            >
              <div className="p-4 h-full flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-system-blue font-bold">MENU</span>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 text-system-text-muted hover:text-system-text"
                  >
                    ✕
                  </button>
                </div>
                <nav className="space-y-2 flex-1">
                  {navItems.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.path === '/'}
                      onClick={() => setIsOpen(false)}
                      className={({ isActive }) =>
                        `block px-4 py-3 rounded transition-colors ${
                          isActive
                            ? 'bg-system-blue/20 text-system-blue'
                            : 'text-system-text-muted hover:text-system-text hover:bg-system-panel'
                        }`
                      }
                    >
                      <span className="mr-3">{item.icon}</span>
                      {item.label}
                    </NavLink>
                  ))}
                </nav>
                {/* Logout button at bottom */}
                <button
                  onClick={() => {
                    setIsOpen(false)
                    logout()
                  }}
                  className="mt-auto px-4 py-3 text-left text-system-text-muted hover:text-system-red transition-colors border-t border-system-border"
                >
                  Logout
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
