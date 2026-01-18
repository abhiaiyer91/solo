import { motion, AnimatePresence } from 'framer-motion'
import { UnlockStatus } from '@/hooks/useUnlocks'
import { TypewriterText } from '@/components/system'

interface UnlockCelebrationProps {
  unlock: UnlockStatus | null
  onDismiss: () => void
}

/**
 * Modal celebration when a new feature is unlocked
 */
export function UnlockCelebration({ unlock, onDismiss }: UnlockCelebrationProps) {
  if (!unlock) return null

  const getCategoryConfig = (category: string) => {
    switch (category) {
      case 'dungeons':
        return {
          color: 'system-red',
          icon: '!',
          label: 'DUNGEON ACCESS',
        }
      case 'bosses':
        return {
          color: 'system-purple',
          icon: '!',
          label: 'THREAT DETECTED',
        }
      case 'social':
        return {
          color: 'system-green',
          icon: '+',
          label: 'SYSTEM EXPANDED',
        }
      case 'bonuses':
        return {
          color: 'system-gold',
          icon: '+',
          label: 'BONUS ACTIVATED',
        }
      default:
        return {
          color: 'system-blue',
          icon: '+',
          label: 'NEW UNLOCK',
        }
    }
  }

  const config = getCategoryConfig(unlock.category)

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
        onClick={onDismiss}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="max-w-md w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div className={`system-window p-8 border-${config.color}/50`}>
            {/* Animated header */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-6"
            >
              {/* Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
                className={`w-16 h-16 mx-auto mb-4 border-2 border-${config.color} rounded-lg flex items-center justify-center`}
              >
                <span className={`text-${config.color} text-3xl font-bold`}>
                  {config.icon}
                </span>
              </motion.div>

              {/* Category label */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className={`text-${config.color} text-sm font-medium mb-2`}
              >
                {config.label}
              </motion.div>

              {/* Unlock name */}
              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-system-text text-xl font-bold"
              >
                {unlock.name}
              </motion.h2>
            </motion.div>

            {/* Narrative text */}
            {unlock.narrative && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mb-6 p-4 bg-system-black/50 border border-system-border rounded"
              >
                <TypewriterText
                  text={unlock.narrative}
                  speed={20}
                />
              </motion.div>
            )}

            {/* Description */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-system-text-muted text-sm text-center mb-6"
            >
              {unlock.description}
            </motion.p>

            {/* Dismiss button */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              type="button"
              onClick={onDismiss}
              className={`w-full py-3 border border-${config.color}/50 rounded bg-${config.color}/10 text-${config.color} hover:bg-${config.color}/20 transition-colors font-medium`}
            >
              ACKNOWLEDGED
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
