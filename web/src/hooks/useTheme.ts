/**
 * Theme Hook
 *
 * Manages dark/light theme state with localStorage persistence
 * and system preference detection.
 */

import { useState, useEffect, useCallback } from 'react'

export type Theme = 'dark' | 'light' | 'system'

const THEME_KEY = 'journey-theme'

/**
 * Get the effective theme based on preference and system settings
 */
function getEffectiveTheme(preference: Theme): 'dark' | 'light' {
  if (preference === 'system') {
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
  }
  return preference
}

/**
 * Apply theme to the document
 */
function applyTheme(theme: 'dark' | 'light') {
  document.documentElement.setAttribute('data-theme', theme)

  // Also update meta theme-color for mobile browsers
  const metaThemeColor = document.querySelector('meta[name="theme-color"]')
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', theme === 'light' ? '#f5f5f7' : '#0a0a0f')
  }
}

export function useTheme() {
  // Initialize from localStorage or default to 'dark'
  const [preference, setPreference] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'dark'
    const saved = localStorage.getItem(THEME_KEY) as Theme | null
    return saved || 'dark'
  })

  const [effectiveTheme, setEffectiveTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window === 'undefined') return 'dark'
    return getEffectiveTheme(preference)
  })

  // Apply theme on mount and when preference changes
  useEffect(() => {
    const effective = getEffectiveTheme(preference)
    setEffectiveTheme(effective)
    applyTheme(effective)
    localStorage.setItem(THEME_KEY, preference)
  }, [preference])

  // Listen for system theme changes when preference is 'system'
  useEffect(() => {
    if (preference !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: light)')

    const handleChange = (e: MediaQueryListEvent) => {
      const newTheme = e.matches ? 'light' : 'dark'
      setEffectiveTheme(newTheme)
      applyTheme(newTheme)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [preference])

  const setTheme = useCallback((newTheme: Theme) => {
    setPreference(newTheme)
  }, [])

  const toggleTheme = useCallback(() => {
    setPreference(prev => {
      if (prev === 'dark') return 'light'
      if (prev === 'light') return 'dark'
      // If system, toggle to the opposite of effective
      return effectiveTheme === 'dark' ? 'light' : 'dark'
    })
  }, [effectiveTheme])

  const isDark = effectiveTheme === 'dark'
  const isLight = effectiveTheme === 'light'

  return {
    theme: preference,
    effectiveTheme,
    setTheme,
    toggleTheme,
    isDark,
    isLight,
  }
}
