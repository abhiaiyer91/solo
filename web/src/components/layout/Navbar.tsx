import { NavLink } from 'react-router-dom'

const navItems = [
  { path: '/', label: 'Dashboard', icon: '◈' },
  { path: '/quests', label: 'Quests', icon: '⚔' },
  { path: '/dungeons', label: 'Dungeons', icon: '🏰' },
  { path: '/guild', label: 'Guild', icon: '⚑' },
  { path: '/titles', label: 'Titles', icon: '🏆' },
  { path: '/leaderboard', label: 'Rankings', icon: '◊' },
  { path: '/stats', label: 'Stats', icon: '◆' },
  { path: '/profile', label: 'Profile', icon: '◉' },
]

export function Navbar() {
  return (
    <nav className="hidden md:flex items-center gap-1">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === '/'}
          className={({ isActive }) =>
            `px-4 py-2 rounded text-sm font-medium transition-colors ${
              isActive
                ? 'bg-system-blue/20 text-system-blue'
                : 'text-system-text-muted hover:text-system-text hover:bg-system-panel'
            }`
          }
        >
          <span className="mr-2">{item.icon}</span>
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}
