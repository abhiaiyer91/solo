/**
 * OriginSelection - Origin story selection component
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export type OriginType = 
  | 'health_concern'
  | 'self_improvement'
  | 'accountability'
  | 'curiosity'
  | 'skip'

interface Origin {
  id: OriginType
  name: string
  subtitle: string
  intro: string[]
}

const ORIGINS: Origin[] = [
  {
    id: 'health_concern',
    name: 'For Those Who Need Me',
    subtitle: 'Health responsibility',
    intro: [
      'You did not come here for vanity.',
      'You came because something reminded you:',
      'the body is not infinite.',
      '',
      'The System acknowledges this weight.',
      'It will not make it lighter.',
      'But it will help you carry it further.',
    ],
  },
  {
    id: 'self_improvement',
    name: 'Becoming',
    subtitle: 'Self-transformation',
    intro: [
      'You suspect there is another version of you.',
      'Stronger. More disciplined. More present.',
      '',
      'The System does not know if that version exists.',
      'But it can help you find out.',
    ],
  },
  {
    id: 'accountability',
    name: 'The Promise',
    subtitle: 'Breaking patterns',
    intro: [
      'How many times have you promised yourself?',
      'How many Mondays? How many "starting tomorrow"?',
      '',
      'The System does not judge the past.',
      'The System only asks:',
      'Will this time be different?',
    ],
  },
  {
    id: 'curiosity',
    name: 'The Question',
    subtitle: 'Testing limits',
    intro: [
      'A question brought you here:',
      'What am I actually capable of?',
      '',
      'The System cannot answer this for you.',
      'But it can help you collect the data.',
    ],
  },
]

interface OriginSelectionProps {
  onSelect: (origin: OriginType) => void
  onSkipTap?: () => void
}

export function OriginSelection({ onSelect, onSkipTap }: OriginSelectionProps) {
  const [selectedOrigin, setSelectedOrigin] = useState<Origin | null>(null)
  const [showIntro, setShowIntro] = useState(false)

  const handleSelect = (origin: Origin) => {
    setSelectedOrigin(origin)
    setShowIntro(true)
  }

  const handleConfirm = () => {
    if (selectedOrigin) {
      onSelect(selectedOrigin.id)
    }
  }

  const handleSkip = () => {
    onSelect('skip')
  }

  return (
    <motion.div
      className="fixed inset-0 bg-black flex items-center justify-center cursor-pointer"
      onClick={onSkipTap}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <AnimatePresence mode="wait">
        {!showIntro ? (
          <motion.div
            key="selection"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-lg px-8"
          >
            <h2 className="font-mono text-lg text-gray-300 text-center mb-2">
              Why are you here?
            </h2>
            <p className="font-mono text-xs text-gray-600 text-center mb-8">
              This shapes how the System speaks to you.
            </p>

            <div className="space-y-3">
              {ORIGINS.map((origin, i) => (
                <motion.button
                  key={origin.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleSelect(origin)
                  }}
                  className="w-full text-left p-4 border border-gray-800 
                             hover:border-gray-600 rounded transition-colors"
                >
                  <span className="font-mono text-sm text-gray-300 block">
                    {origin.name}
                  </span>
                  <span className="font-mono text-xs text-gray-600">
                    {origin.subtitle}
                  </span>
                </motion.button>
              ))}
            </div>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              onClick={(e) => {
                e.stopPropagation()
                handleSkip()
              }}
              className="w-full mt-6 p-3 text-gray-600 hover:text-gray-400 
                         font-mono text-xs transition-colors"
            >
              Skip this step
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-md px-8 text-center"
          >
            <div className="space-y-4 mb-8">
              {selectedOrigin?.intro.map((line, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.4 }}
                  className={`font-mono text-base ${
                    line === '' ? 'h-4' : 'text-gray-300'
                  }`}
                >
                  {line}
                </motion.p>
              ))}
            </div>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: (selectedOrigin?.intro.length ?? 0) * 0.4 + 0.5 }}
              onClick={(e) => {
                e.stopPropagation()
                handleConfirm()
              }}
              className="px-8 py-3 border border-blue-500 text-blue-400 
                         font-mono text-sm hover:bg-blue-500/10 transition-colors"
            >
              Continue
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
