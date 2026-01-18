import { motion, AnimatePresence } from 'framer-motion'
import { ParticleEffect, ConfettiEffect } from './ParticleEffect'
import { CountUp } from './CountUp'
import { SystemMessage } from '@/components/system'
import { playSound } from '@/lib/sounds'
import { useEffect } from 'react'

interface LevelUpCelebrationProps {
  isVisible: boolean
  previousLevel: number
  newLevel: number
  onComplete: () => void
}

/**
 * LevelUpCelebration - Full-screen celebration for level ups
 * 
 * Features particle effects, animated level counter, and System message.
 */
export function LevelUpCelebration({
  isVisible,
  previousLevel,
  newLevel,
  onComplete,
}: LevelUpCelebrationProps) {
  useEffect(() => {
    if (isVisible) {
      playSound('levelUp')
    }
  }, [isVisible])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
          onClick={onComplete}
        >
          {/* Particle effects */}
          <ParticleEffect 
            count={60} 
            spread={250}
            duration={1.5}
            colors={['#60A5FA', '#3B82F6', '#2563EB', '#FBBF24']}
          />
          <ConfettiEffect count={40} />

          {/* Main content */}
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ 
              type: 'spring', 
              damping: 15, 
              stiffness: 200,
              delay: 0.2 
            }}
            className="text-center z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Level Up text */}
            <motion.div
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <h1 className="text-system-gold text-sm font-bold tracking-[0.3em] mb-2">
                LEVEL UP
              </h1>
            </motion.div>

            {/* Level number */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, type: 'spring' }}
              className="relative"
            >
              {/* Glow effect */}
              <div className="absolute inset-0 blur-xl bg-system-blue/30 rounded-full" />
              
              <div className="relative text-8xl font-bold text-system-blue">
                <CountUp 
                  from={previousLevel} 
                  to={newLevel} 
                  duration={1} 
                />
              </div>
            </motion.div>

            {/* System message */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="mt-8 max-w-sm mx-auto"
            >
              <SystemMessage variant="success">
                The System acknowledges your progress.
                {newLevel % 5 === 0 && ' A milestone has been reached.'}
              </SystemMessage>
            </motion.div>

            {/* Dismiss hint */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
              className="mt-6 text-system-text-muted text-sm"
            >
              Click anywhere to continue
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
