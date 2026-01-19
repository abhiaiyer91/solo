/**
 * EveningMessage - Evening mode specific UI elements
 */

import { motion, AnimatePresence } from 'framer-motion'
import { useTimeOfDay, type UIMode } from '../hooks/useTimeOfDay'

interface EveningMessageProps {
  playerName?: string
  questsRemaining?: number
  hasScreenSunsetQuest?: boolean
}

export function EveningMessage({
  playerName = 'Hunter',
  questsRemaining = 0,
  hasScreenSunsetQuest = false,
}: EveningMessageProps) {
  const { uiMode, message, greeting } = useTimeOfDay()

  if (uiMode === 'default') return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-lg p-4 mb-4 ${
        uiMode === 'quiet'
          ? 'bg-slate-900/80 border border-slate-700/50'
          : 'bg-gradient-to-r from-slate-900/80 to-purple-950/30 border border-purple-900/30'
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="text-xl">
          {uiMode === 'quiet' ? '🌙' : '🌆'}
        </span>
        <div className="flex-1">
          <p className={`font-mono text-sm ${
            uiMode === 'quiet' ? 'text-slate-300' : 'text-purple-200'
          }`}>
            {greeting}, {playerName}.
          </p>
          <p className={`font-mono text-xs mt-1 ${
            uiMode === 'quiet' ? 'text-slate-500' : 'text-purple-400/70'
          }`}>
            {message}
          </p>

          {/* Quest status */}
          {questsRemaining > 0 && uiMode === 'evening' && (
            <p className="font-mono text-xs text-amber-400/80 mt-2">
              {questsRemaining} quest{questsRemaining > 1 ? 's' : ''} remaining.
            </p>
          )}

          {/* Screen Sunset reminder */}
          {hasScreenSunsetQuest && uiMode === 'evening' && (
            <div className="mt-3 flex items-center gap-2 text-xs font-mono text-purple-300/70">
              <span>📵</span>
              <span>Screen Sunset quest active - consider winding down screens</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

/**
 * Evening mode banner for header
 */
export function EveningBanner() {
  const { uiMode, isQuietMode } = useTimeOfDay()

  if (uiMode === 'default') return null

  return (
    <div className={`text-center py-1 text-xs font-mono ${
      isQuietMode 
        ? 'bg-slate-800/50 text-slate-400' 
        : 'bg-purple-900/30 text-purple-300'
    }`}>
      {isQuietMode ? '🌙 Quiet Mode' : '🌆 Evening Mode'}
    </div>
  )
}

/**
 * Night mode overlay effect
 */
export function NightOverlay({ children }: { children: React.ReactNode }) {
  const { uiMode } = useTimeOfDay()

  return (
    <div className="relative">
      {children}
      <AnimatePresence>
        {uiMode === 'quiet' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="fixed inset-0 pointer-events-none bg-gradient-to-b from-transparent to-black/20 z-50"
          />
        )}
      </AnimatePresence>
    </div>
  )
}

/**
 * Get evening-appropriate system messages
 */
export function getEveningSystemMessage(uiMode: UIMode, hour: number): string | null {
  if (uiMode === 'default') return null

  if (uiMode === 'quiet') {
    if (hour >= 23) {
      return 'The System recommends rest. Tomorrow awaits.'
    }
    return 'Quiet hours active. Notifications paused.'
  }

  if (hour >= 21) {
    return 'Consider completing remaining quests before rest.'
  }
  if (hour >= 20) {
    return 'Evening approaches. Reflect on today\'s progress.'
  }
  
  return null
}
