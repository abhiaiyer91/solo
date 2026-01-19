/**
 * PerfectDay - All quests complete celebration
 */

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'

interface PerfectDayProps {
  isVisible: boolean
  onClose: () => void
  xpTotal?: number
  streak?: number
}

export function PerfectDayCelebration({
  isVisible,
  onClose,
  xpTotal = 0,
  streak = 0,
}: PerfectDayProps) {
  const [showStats, setShowStats] = useState(false)

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => setShowStats(true), 1000)
      return () => clearTimeout(timer)
    }
    setShowStats(false)
  }, [isVisible])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/90"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={onClose}
          />

          {/* Particle explosion */}
          <ParticleExplosion />

          {/* Content */}
          <motion.div
            className="relative z-10 text-center"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', damping: 15 }}
          >
            {/* Crown */}
            <motion.div
              className="text-6xl mb-4"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              👑
            </motion.div>

            {/* Title */}
            <motion.h1
              className="text-4xl font-bold font-mono text-system-xp mb-2 glow-gold"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              PERFECT DAY
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              className="text-sm font-mono text-system-text-muted mb-8 max-w-md"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              All core objectives complete.
              <br />
              The System acknowledges your compliance.
            </motion.p>

            {/* Stats */}
            <AnimatePresence>
              {showStats && (
                <motion.div
                  className="flex justify-center gap-8 mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="text-center">
                    <p className="text-3xl font-bold font-mono text-system-xp">
                      +{xpTotal}
                    </p>
                    <p className="text-xs font-mono text-system-text-muted">XP EARNED</p>
                  </div>
                  {streak > 0 && (
                    <div className="text-center">
                      <p className="text-3xl font-bold font-mono text-orange-400">
                        {streak}
                      </p>
                      <p className="text-xs font-mono text-system-text-muted">DAY STREAK</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Close button */}
            <motion.button
              className="px-6 py-2 bg-system-accent/20 hover:bg-system-accent/30 
                         border border-system-accent/50 text-system-accent font-mono 
                         rounded transition-colors"
              onClick={onClose}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
            >
              Continue
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/**
 * Particle explosion effect
 */
function ParticleExplosion() {
  const particles = Array.from({ length: 50 })

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((_, i) => {
        const angle = (i / particles.length) * 360
        const distance = 100 + Math.random() * 200
        const x = Math.cos((angle * Math.PI) / 180) * distance
        const y = Math.sin((angle * Math.PI) / 180) * distance
        const delay = Math.random() * 0.5
        const size = 4 + Math.random() * 8
        const color = ['#FFD700', '#FFA500', '#FF6B6B', '#4ADE80', '#60A5FA'][
          Math.floor(Math.random() * 5)
        ]

        return (
          <motion.div
            key={i}
            className="absolute left-1/2 top-1/2 rounded-full"
            style={{
              width: size,
              height: size,
              backgroundColor: color,
            }}
            initial={{
              x: 0,
              y: 0,
              opacity: 1,
              scale: 0,
            }}
            animate={{
              x,
              y,
              opacity: 0,
              scale: 1,
            }}
            transition={{
              duration: 1.5,
              delay,
              ease: 'easeOut',
            }}
          />
        )
      })}
    </div>
  )
}

/**
 * Simpler checkmark burst for quest completion
 */
export function QuestCompleteBurst({ x, y }: { x: number; y: number }) {
  const particles = Array.from({ length: 8 })

  return (
    <div
      className="fixed pointer-events-none z-40"
      style={{ left: x, top: y }}
    >
      {particles.map((_, i) => {
        const angle = (i / particles.length) * 360
        const distance = 30
        const px = Math.cos((angle * Math.PI) / 180) * distance
        const py = Math.sin((angle * Math.PI) / 180) * distance

        return (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full bg-system-accent"
            initial={{ x: 0, y: 0, opacity: 1 }}
            animate={{ x: px, y: py, opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        )
      })}
    </div>
  )
}
