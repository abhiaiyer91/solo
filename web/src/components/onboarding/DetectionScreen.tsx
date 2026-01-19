/**
 * DetectionScreen - Initial detection sequence
 */

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DETECTION_LINES } from '../../hooks/useOnboardingSequence'
import { TypewriterSimple } from '../system/TypewriterText'

interface DetectionScreenProps {
  onComplete: () => void
  onSkipTap?: () => void
}

export function DetectionScreen({ onComplete, onSkipTap }: DetectionScreenProps) {
  const [currentLineIndex, setCurrentLineIndex] = useState(0)
  const [displayedLines, setDisplayedLines] = useState<string[]>([])
  const [isTyping, setIsTyping] = useState(false)

  const currentLine = DETECTION_LINES[currentLineIndex]

  const advanceLine = useCallback(() => {
    if (currentLineIndex >= DETECTION_LINES.length - 1) {
      // All lines complete, wait then call onComplete
      setTimeout(onComplete, 2000)
      return
    }

    const delay = currentLine?.delay ?? 0
    setTimeout(() => {
      setCurrentLineIndex((prev) => prev + 1)
    }, delay)
  }, [currentLineIndex, currentLine, onComplete])

  const handleLineComplete = useCallback(() => {
    if (currentLine) {
      setDisplayedLines((prev) => [...prev, currentLine.text])
    }
    setIsTyping(false)
    advanceLine()
  }, [currentLine, advanceLine])

  useEffect(() => {
    setIsTyping(true)
  }, [currentLineIndex])

  return (
    <motion.div
      className="fixed inset-0 bg-black flex items-center justify-center cursor-pointer"
      onClick={onSkipTap}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="max-w-lg text-center px-8">
        {/* Previously displayed lines */}
        <div className="space-y-4">
          {displayedLines.map((line, i) => (
            <p
              key={i}
              className="font-mono text-lg text-gray-300"
            >
              {line}
            </p>
          ))}
        </div>

        {/* Currently typing line */}
        <AnimatePresence>
          {isTyping && currentLine && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-mono text-lg text-white mt-4"
            >
              <TypewriterSimple
                text={currentLine.text}
                speed={30}
                onComplete={handleLineComplete}
              />
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

/**
 * Assessment screen - Capability scanning
 */
export function AssessmentScreen({
  onComplete,
  onSkipTap,
}: {
  onComplete: () => void
  onSkipTap?: () => void
}) {
  const [phase, setPhase] = useState<'scanning' | 'results' | 'complete'>('scanning')

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase('results'), 2000),
      setTimeout(() => setPhase('complete'), 5000),
      setTimeout(onComplete, 6500),
    ]
    return () => timers.forEach(clearTimeout)
  }, [onComplete])

  return (
    <motion.div
      className="fixed inset-0 bg-black flex items-center justify-center cursor-pointer"
      onClick={onSkipTap}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="text-center">
        {phase === 'scanning' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="font-mono text-gray-400">Scanning current state...</p>
            <motion.div
              className="mt-4 h-1 w-48 bg-gray-800 rounded-full overflow-hidden mx-auto"
            >
              <motion.div
                className="h-full bg-gray-600"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 2 }}
              />
            </motion.div>
          </motion.div>
        )}

        {phase === 'results' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {[
              'Physical output: underdeveloped',
              'Recovery capacity: unstable',
              'Discipline coefficient: unknown',
              'Nutritional consistency: unknown',
            ].map((line, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.3 }}
                className="font-mono text-sm text-gray-500"
              >
                {line}
              </motion.p>
            ))}
          </motion.div>
        )}

        {phase === 'complete' && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-mono text-gray-300"
          >
            Baseline established.
          </motion.p>
        )}
      </div>
    </motion.div>
  )
}
