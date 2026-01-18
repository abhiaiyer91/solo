# G6: Build AppShell and Navigation

## Overview

Create the core layout components that wrap all pages - AppShell provides consistent structure, and Navbar enables navigation between sections.

## Context

**Current State:**
- Pages render directly without shared layout
- No navigation between Dashboard/Quests/Stats/Profile
- User must manually change URLs

**Design Requirements:**
- Dark theme matching existing CSS variables
- System window aesthetic
- Player info visible in header
- Mobile-responsive

## Acceptance Criteria

- [ ] `AppShell` wraps all authenticated pages
- [ ] `Navbar` shows navigation links
- [ ] Active route highlighted in nav
- [ ] Player level/name shown in header
- [ ] Logout button accessible
- [ ] Mobile hamburger menu (responsive)
- [ ] Smooth page transitions

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `web/src/components/layout/AppShell.tsx` | Create | Main layout wrapper |
| `web/src/components/layout/Navbar.tsx` | Create | Navigation component |
| `web/src/components/layout/MobileNav.tsx` | Create | Mobile navigation |
| `web/src/App.tsx` | Modify | Wrap routes with AppShell |

## Implementation Guide

### Step 1: Create Navbar Component

Create `web/src/components/layout/Navbar.tsx`:

```typescript
import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'

const navItems = [
  { path: '/', label: 'Dashboard', icon: '◈' },
  { path: '/quests', label: 'Quests', icon: '⚔' },
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
```

### Step 2: Create Mobile Navigation

Create `web/src/components/layout/MobileNav.tsx`:

```typescript
import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

const navItems = [
  { path: '/', label: 'Dashboard', icon: '◈' },
  { path: '/quests', label: 'Quests', icon: '⚔' },
  { path: '/stats', label: 'Stats', icon: '◆' },
  { path: '/profile', label: 'Profile', icon: '◉' },
]

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)

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
              <div className="p-4">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-system-blue font-bold">MENU</span>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 text-system-text-muted hover:text-system-text"
                  >
                    ✕
                  </button>
                </div>
                <nav className="space-y-2">
                  {navItems.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
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
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
```

### Step 3: Create AppShell Component

Create `web/src/components/layout/AppShell.tsx`:

```typescript
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
```

### Step 4: Create Layout Index

Create `web/src/components/layout/index.ts`:

```typescript
export { AppShell } from './AppShell'
export { Navbar } from './Navbar'
export { MobileNav } from './MobileNav'
```

### Step 5: Update App.tsx

Modify `web/src/App.tsx` to use AppShell:

```typescript
import { Routes, Route, Navigate } from 'react-router-dom'
import { Login } from '@/pages/Login'
import { Signup } from '@/pages/Signup'
import { Dashboard } from '@/pages/Dashboard'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { AppShell } from '@/components/layout'
import { useSession } from '@/lib/auth-client'

function App() {
  return (
    <div className="min-h-screen bg-system-black text-system-text font-mono">
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
        <Route path="/signup" element={<AuthRoute><Signup /></AuthRoute>} />

        {/* Protected routes with AppShell */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppShell>
                <Dashboard />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/quests"
          element={
            <ProtectedRoute>
              <AppShell>
                <Dashboard /> {/* Replace with Quests page when ready */}
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/stats"
          element={
            <ProtectedRoute>
              <AppShell>
                <Dashboard /> {/* Replace with Stats page when ready */}
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <AppShell>
                <Dashboard /> {/* Replace with Profile page when ready */}
              </AppShell>
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

// ... AuthRoute component unchanged
```

### Step 6: Update Dashboard

Remove the header/logout from Dashboard since AppShell handles it now:

```typescript
// Remove the header section from Dashboard.tsx
// Remove the logout button
// Keep just the main content grid
```

## Testing

1. **Navigation:**
   - Click each nav item
   - Verify correct page loads
   - Verify active state highlights

2. **Mobile:**
   - Resize to mobile width
   - Tap hamburger menu
   - Verify menu opens/closes
   - Tap nav item, verify page changes and menu closes

3. **User Info:**
   - Verify player level and name shown
   - Verify logout works

4. **Page Transitions:**
   - Navigate between pages
   - Verify smooth fade/slide animation

## Definition of Done

- [ ] All acceptance criteria checked
- [ ] AppShell wraps authenticated routes
- [ ] Navigation works on desktop
- [ ] Mobile menu works
- [ ] Active route highlighted
- [ ] Player info displayed
- [ ] Logout functional
- [ ] No layout shift on navigation
