/**
 * LoreReveal - Special modal for lore fragment reveals
 */

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TypewriterText } from './system/TypewriterText'

export interface LoreFragment {
  id: string
  title: string
  content: string
  unlockCondition: string
  unlockedAt?: string
  isUnlocked: boolean
  fragmentNumber: number
  totalFragments: number
}

interface LoreRevealProps {
  fragment: LoreFragment
  isVisible: boolean
  onComplete: () => void
}

export function LoreReveal({ fragment, isVisible, onComplete }: LoreRevealProps) {
  const [phase, setPhase] = useState<'header' | 'content' | 'footer'>('header')
  const [paragraphIndex, setParagraphIndex] = useState(0)

  const paragraphs = fragment.content.split('\n\n').filter((p) => p.trim())

  useEffect(() => {
    if (isVisible) {
      setPhase('header')
      setParagraphIndex(0)
    }
  }, [isVisible])

  const advanceContent = useCallback(() => {
    if (paragraphIndex < paragraphs.length - 1) {
      setParagraphIndex((prev) => prev + 1)
    } else {
      setPhase('footer')
    }
  }, [paragraphIndex, paragraphs.length])

  const handleHeaderComplete = () => {
    setPhase('content')
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 bg-black flex items-center justify-center p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            if (phase === 'footer') {
              onComplete()
            }
          }}
        >
          <motion.div
            className="max-w-2xl w-full"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {/* Header */}
            {phase === 'header' && (
              <motion.div
                className="text-center mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <p className="font-mono text-xs text-purple-400 tracking-wider mb-2">
                  ◆ LORE FRAGMENT UNLOCKED ◆
                </p>
                <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent mb-6" />
                <motion.h2
                  className="font-mono text-xl text-white"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  onAnimationComplete={handleHeaderComplete}
                >
                  "{fragment.title}"
                </motion.h2>
              </motion.div>
            )}

            {/* Content */}
            {phase === 'content' && (
              <motion.div
                className="text-center space-y-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <p className="font-mono text-xs text-purple-400/50 tracking-wider mb-4">
                  ◆ {fragment.title.toUpperCase()} ◆
                </p>

                {paragraphs.slice(0, paragraphIndex + 1).map((paragraph, i) => (
                  <motion.p
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="font-mono text-sm text-gray-300 leading-relaxed"
                  >
                    {i === paragraphIndex ? (
                      <TypewriterText
                        text={paragraph}
                        onComplete={advanceContent}
                      />
                    ) : (
                      paragraph
                    )}
                  </motion.p>
                ))}
              </motion.div>
            )}

            {/* Footer */}
            {phase === 'footer' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <p className="font-mono text-xs text-purple-400/50 tracking-wider mb-4">
                  ◆ {fragment.title.toUpperCase()} ◆
                </p>
                
                {paragraphs.map((paragraph, i) => (
                  <p
                    key={i}
                    className="font-mono text-sm text-gray-300 leading-relaxed mb-4"
                  >
                    {paragraph}
                  </p>
                ))}

                <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent my-8" />

                <button
                  onClick={onComplete}
                  className="px-8 py-3 border border-purple-500/50 text-purple-400 
                             font-mono text-sm hover:bg-purple-500/10 transition-colors"
                >
                  Continue
                </button>

                <p className="font-mono text-xs text-gray-600 mt-4">
                  Fragment {fragment.fragmentNumber} of {fragment.totalFragments} Collected
                </p>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/**
 * Lore collection entry
 */
export function LoreEntry({
  fragment,
  onClick,
}: {
  fragment: LoreFragment
  onClick?: () => void
}) {
  return (
    <motion.button
      onClick={onClick}
      disabled={!fragment.isUnlocked}
      className={`w-full text-left p-4 rounded-lg border transition-colors ${
        fragment.isUnlocked
          ? 'bg-purple-950/20 border-purple-500/30 hover:border-purple-500/50 cursor-pointer'
          : 'bg-gray-900/20 border-gray-800 cursor-not-allowed opacity-60'
      }`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={fragment.isUnlocked ? { x: 5 } : undefined}
    >
      <div className="flex items-start gap-3">
        <span className={`font-mono text-lg ${fragment.isUnlocked ? 'text-purple-400' : 'text-gray-600'}`}>
          {fragment.isUnlocked ? '◆' : '◇'}
        </span>
        <div className="flex-1">
          <h3 className={`font-mono text-sm ${fragment.isUnlocked ? 'text-white' : 'text-gray-500'}`}>
            {fragment.isUnlocked ? fragment.title : '???'}
          </h3>
          <p className="font-mono text-xs text-gray-500 mt-1">
            {fragment.isUnlocked
              ? `Unlocked ${new Date(fragment.unlockedAt!).toLocaleDateString()}`
              : fragment.unlockCondition}
          </p>
        </div>
      </div>
    </motion.button>
  )
}

/**
 * Lore collection page header
 */
export function LoreCollectionHeader({
  unlockedCount,
  totalCount,
}: {
  unlockedCount: number
  totalCount: number
}) {
  const progress = (unlockedCount / totalCount) * 100

  return (
    <div className="mb-8">
      <h1 className="font-mono text-lg text-purple-400 mb-2">LORE COLLECTION</h1>
      <div className="h-px bg-purple-500/30 mb-4" />
      
      <div className="flex items-center gap-4">
        <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-purple-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <span className="font-mono text-xs text-gray-400">
          {unlockedCount}/{totalCount}
        </span>
      </div>
    </div>
  )
}
