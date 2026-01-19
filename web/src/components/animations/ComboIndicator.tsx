/**
 * ComboIndicator - Shows when completing multiple quests quickly
 */

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState, useCallback } from 'react'

interface ComboIndicatorProps {
  count: number
  isVisible: boolean
  onHide: () => void
}

export function ComboIndicator({ count, isVisible, onHide }: ComboIndicatorProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onHide, 2000)
      return () => clearTimeout(timer)
    }
  }, [isVisible, onHide])

  if (count < 2) return null

  const getComboColor = (count: number) => {
    if (count >= 5) return 'text-purple-400 border-purple-500'
    if (count >= 3) return 'text-orange-400 border-orange-500'
    return 'text-blue-400 border-blue-500'
  }

  const getComboLabel = (count: number) => {
    if (count >= 5) return 'ULTRA COMBO!'
    if (count >= 3) return 'COMBO!'
    return 'COMBO'
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed top-20 right-4 z-40"
          initial={{ scale: 0, rotate: -15, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          exit={{ scale: 0, rotate: 15, opacity: 0 }}
          transition={{ type: 'spring', damping: 15 }}
        >
          <div
            className={`bg-black/80 border-2 rounded-lg px-4 py-2 ${getComboColor(count)}`}
          >
            <div className="flex items-center gap-2">
              <motion.span
                className="text-2xl font-bold font-mono"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.3 }}
              >
                {count}x
              </motion.span>
              <span className="text-sm font-mono font-bold">
                {getComboLabel(count)}
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/**
 * Hook to track quest completion combo
 */
export function useComboTracker(comboWindowMs: number = 5000) {
  const [completions, setCompletions] = useState<number[]>([])
  const [showCombo, setShowCombo] = useState(false)

  const recordCompletion = useCallback(() => {
    const now = Date.now()
    
    // Remove old completions outside the window
    const recentCompletions = completions.filter(
      (t) => now - t < comboWindowMs
    )
    
    // Add new completion
    const newCompletions = [...recentCompletions, now]
    setCompletions(newCompletions)

    // Show combo if 2+ completions
    if (newCompletions.length >= 2) {
      setShowCombo(true)
    }
  }, [completions, comboWindowMs])

  const hideCombo = useCallback(() => {
    setShowCombo(false)
  }, [])

  const comboCount = completions.filter(
    (t) => Date.now() - t < comboWindowMs
  ).length

  return {
    recordCompletion,
    comboCount,
    showCombo,
    hideCombo,
  }
}

/**
 * Streak increment animation
 */
export function StreakIncrement({
  newStreak,
  isVisible,
  onHide,
}: {
  newStreak: number
  isVisible: boolean
  onHide: () => void
}) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onHide, 3000)
      return () => clearTimeout(timer)
    }
  }, [isVisible, onHide])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
        >
          <div className="bg-orange-500/20 border border-orange-500/50 rounded-lg px-6 py-3">
            <div className="flex items-center gap-3">
              <motion.span
                className="text-3xl"
                animate={{ scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5 }}
              >
                🔥
              </motion.span>
              <div>
                <p className="text-lg font-bold font-mono text-orange-400">
                  {newStreak} Day Streak!
                </p>
                <p className="text-xs font-mono text-orange-300/70">
                  Keep the fire burning
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
