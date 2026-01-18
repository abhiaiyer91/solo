import { motion, AnimatePresence } from 'framer-motion'
import { ParticleEffect } from './ParticleEffect'
import { XPCountUp } from './CountUp'
import { playSound } from '@/lib/sounds'
import { useEffect } from 'react'

interface QuestCompleteProps {
  isVisible: boolean
  questName: string
  xpAwarded: number
  onComplete: () => void
}

/**
 * QuestComplete - Inline celebration for completing a quest
 * 
 * Appears as an overlay on the quest card with particles and XP reveal.
 */
export function QuestComplete({
  isVisible,
  questName: _questName,
  xpAwarded,
  onComplete,
}: QuestCompleteProps) {
  useEffect(() => {
    if (isVisible) {
      playSound('questComplete')
      
      // Auto-dismiss after 2.5 seconds
      const timer = setTimeout(onComplete, 2500)
      return () => clearTimeout(timer)
    }
  }, [isVisible, onComplete])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-system-panel/95 backdrop-blur-sm rounded-lg flex items-center justify-center z-10"
        >
          {/* Mini particle effect */}
          <ParticleEffect 
            count={20} 
            spread={80}
            duration={0.8}
            colors={['#4ADE80', '#22C55E', '#FBBF24']}
          />

          <div className="text-center relative z-10">
            {/* Checkmark */}
            <motion.div
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 10 }}
              className="w-12 h-12 mx-auto mb-3 bg-system-green/20 border-2 border-system-green rounded-full flex items-center justify-center"
            >
              <motion.svg
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                className="w-6 h-6 text-system-green"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <motion.path
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </motion.svg>
            </motion.div>

            {/* Quest name */}
            <motion.p
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-system-green text-xs font-medium tracking-wider mb-1"
            >
              QUEST COMPLETE
            </motion.p>

            {/* XP awarded */}
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-system-gold font-bold text-xl"
            >
              <XPCountUp amount={xpAwarded} duration={0.5} /> XP
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/**
 * StreakMilestone - Celebration for streak achievements
 */
interface StreakMilestoneProps {
  isVisible: boolean
  streakDays: number
  onComplete: () => void
}

export function StreakMilestone({
  isVisible,
  streakDays,
  onComplete,
}: StreakMilestoneProps) {
  useEffect(() => {
    if (isVisible) {
      playSound('streakMilestone')
      const timer = setTimeout(onComplete, 3000)
      return () => clearTimeout(timer)
    }
  }, [isVisible, onComplete])

  const getMilestoneText = (days: number) => {
    if (days >= 365) return 'LEGENDARY STREAK'
    if (days >= 180) return 'MASTER STREAK'
    if (days >= 90) return 'EPIC STREAK'
    if (days >= 30) return 'STRONG STREAK'
    if (days >= 14) return 'BUILDING MOMENTUM'
    if (days >= 7) return 'FIRST WEEK'
    return 'STREAK MILESTONE'
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: 'spring', damping: 20 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-40"
        >
          <div className="bg-system-panel/90 backdrop-blur-sm border border-system-blue/50 rounded-lg px-6 py-4 shadow-lg shadow-system-blue/10">
            <div className="flex items-center gap-4">
              {/* Fire icon */}
              <motion.span
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, -5, 5, 0]
                }}
                transition={{ 
                  duration: 0.5, 
                  repeat: Infinity, 
                  repeatDelay: 1 
                }}
                className="text-3xl"
              >
                🔥
              </motion.span>
              
              <div>
                <div className="text-system-blue text-xs font-medium tracking-wider">
                  {getMilestoneText(streakDays)}
                </div>
                <div className="text-system-text font-bold text-2xl">
                  {streakDays} Days
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
