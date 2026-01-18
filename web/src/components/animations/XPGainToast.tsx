import { motion, AnimatePresence } from 'framer-motion'
import { XPCountUp } from './CountUp'
import { playSound } from '@/lib/sounds'
import { useEffect } from 'react'

interface XPGainToastProps {
  isVisible: boolean
  amount: number
  source: string
  bonus?: number
  onComplete: () => void
}

/**
 * XPGainToast - Animated toast notification for XP gains
 * 
 * Slides in from the right with animated counter.
 */
export function XPGainToast({
  isVisible,
  amount,
  source,
  bonus,
  onComplete,
}: XPGainToastProps) {
  useEffect(() => {
    if (isVisible) {
      playSound('xpGain')
      
      // Auto-dismiss after 3 seconds
      const timer = setTimeout(onComplete, 3000)
      return () => clearTimeout(timer)
    }
  }, [isVisible, onComplete])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="fixed top-4 right-4 z-40"
        >
          <div className="bg-system-panel/90 backdrop-blur-sm border border-system-gold/50 rounded-lg px-4 py-3 shadow-lg shadow-system-gold/10">
            <div className="flex items-center gap-3">
              {/* Lightning icon */}
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ delay: 0.1 }}
                className="text-system-gold text-xl"
              >
                ⚡
              </motion.span>
              
              {/* XP amount */}
              <div>
                <div className="text-system-gold font-bold text-lg">
                  <XPCountUp amount={amount} duration={0.5} />
                  <span className="text-sm ml-1">XP</span>
                </div>
                
                <div className="text-system-text-muted text-xs">
                  {source}
                </div>
              </div>

              {/* Bonus indicator */}
              {bonus && bonus > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="bg-system-green/20 border border-system-green/50 rounded px-2 py-0.5"
                >
                  <span className="text-system-green text-xs font-medium">
                    +{bonus}% BONUS
                  </span>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/**
 * XPGainStack - Stack of multiple XP gain toasts
 */
interface XPGain {
  id: string
  amount: number
  source: string
  bonus?: number
}

interface XPGainStackProps {
  gains: XPGain[]
  onDismiss: (id: string) => void
}

export function XPGainStack({ gains, onDismiss }: XPGainStackProps) {
  return (
    <div className="fixed top-4 right-4 z-40 space-y-2">
      <AnimatePresence>
        {gains.map((gain, index) => (
          <motion.div
            key={gain.id}
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            transition={{ 
              type: 'spring', 
              damping: 20, 
              stiffness: 300,
              delay: index * 0.1
            }}
          >
            <div className="bg-system-panel/90 backdrop-blur-sm border border-system-gold/50 rounded-lg px-4 py-3 shadow-lg shadow-system-gold/10">
              <div className="flex items-center gap-3">
                <span className="text-system-gold text-lg">⚡</span>
                <div>
                  <div className="text-system-gold font-bold">
                    +{gain.amount} XP
                  </div>
                  <div className="text-system-text-muted text-xs">
                    {gain.source}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onDismiss(gain.id)}
                  className="text-system-text-muted hover:text-system-text ml-2"
                >
                  ×
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
