/**
 * AcceptScreen - The dramatic accept button
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface AcceptScreenProps {
  onAccept: () => void
  onSkipTap?: () => void
}

export function AcceptScreen({ onAccept, onSkipTap }: AcceptScreenProps) {
  const [showButton, setShowButton] = useState(false)
  const [isAccepting, setIsAccepting] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShowButton(true), 1500)
    return () => clearTimeout(timer)
  }, [])

  const handleAccept = () => {
    setIsAccepting(true)
    // Play accept animation then proceed
    setTimeout(onAccept, 1000)
  }

  return (
    <motion.div
      className="fixed inset-0 bg-black flex items-center justify-center cursor-pointer"
      onClick={onSkipTap}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <AnimatePresence>
        {showButton && !isAccepting && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={(e) => {
              e.stopPropagation()
              handleAccept()
            }}
            className="px-10 py-5 border-2 border-blue-500 text-blue-400 
                       font-mono font-bold uppercase tracking-[0.2em] text-lg
                       hover:bg-blue-500/10 transition-colors
                       focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            Accept Access
          </motion.button>
        )}

        {isAccepting && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <motion.div
              className="w-16 h-16 border-2 border-blue-500 rounded-full mx-auto mb-4
                         flex items-center justify-center"
              animate={{ 
                borderColor: ['#3b82f6', '#22c55e', '#22c55e'],
                scale: [1, 1.1, 1],
              }}
              transition={{ duration: 0.5 }}
            >
              <motion.svg
                viewBox="0 0 24 24"
                className="w-8 h-8 text-green-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <motion.path
                  d="M5 12l5 5L20 7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                />
              </motion.svg>
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="font-mono text-sm text-green-400"
            >
              Access Granted
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/**
 * Terms screen - System personality establishment
 */
export function TermsScreen({
  onComplete,
  onSkipTap,
}: {
  onComplete: () => void
  onSkipTap?: () => void
}) {
  const [lineIndex, setLineIndex] = useState(0)
  
  const lines = [
    'This interface will not motivate you.',
    'It will not encourage you.',
    '',
    'It will only record what you do.',
  ]

  useEffect(() => {
    if (lineIndex >= lines.length) {
      setTimeout(onComplete, 2500)
      return
    }

    const delay = lines[lineIndex] === '' ? 2000 : 1500
    const timer = setTimeout(() => {
      setLineIndex((prev) => prev + 1)
    }, delay)

    return () => clearTimeout(timer)
  }, [lineIndex, lines, onComplete])

  return (
    <motion.div
      className="fixed inset-0 bg-black flex items-center justify-center cursor-pointer"
      onClick={onSkipTap}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="max-w-md text-center px-8">
        <div className="space-y-6">
          {lines.slice(0, lineIndex + 1).map((line, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`font-mono text-lg ${
                line === '' ? 'h-4' : 'text-gray-300'
              }`}
            >
              {line}
            </motion.p>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
