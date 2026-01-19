/**
 * OnboardingProgress - Phase progress indicator for onboarding
 */

import { motion } from 'framer-motion'
import type { OnboardingPhase } from '@/hooks/useOnboarding'

interface OnboardingProgressProps {
  phase: OnboardingPhase
}

const PHASES: { key: OnboardingPhase; label: string; number: number }[] = [
  { key: 'narrative', label: 'DETECTION', number: 1 },
  { key: 'baseline', label: 'ASSESSMENT', number: 2 },
  { key: 'psychology', label: 'CALIBRATION', number: 3 },
]

export function OnboardingProgress({ phase }: OnboardingProgressProps) {
  const currentIndex = PHASES.findIndex(p => p.key === phase)
  const progressPercent = phase === 'complete' 
    ? 100 
    : ((currentIndex + 1) / PHASES.length) * 100

  return (
    <div className="w-full max-w-md mx-auto mb-6">
      {/* Progress Bar */}
      <div className="mb-2">
        <div className="h-2 bg-system-black rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-system-blue to-system-purple"
          />
        </div>
      </div>

      {/* Phase Labels */}
      <div className="flex justify-between text-xs">
        {PHASES.map((p, i) => {
          const isCurrent = p.key === phase
          const isComplete = currentIndex > i || phase === 'complete'

          return (
            <div
              key={p.key}
              className={`flex items-center gap-1 ${
                isCurrent ? 'text-system-blue' :
                isComplete ? 'text-system-green' :
                'text-system-text-muted'
              }`}
            >
              <span className="font-mono">
                {isComplete ? '[x]' : isCurrent ? '[>]' : '[ ]'}
              </span>
              <span className="hidden sm:inline">{p.label}</span>
              <span className="sm:hidden">{p.number}</span>
            </div>
          )
        })}
      </div>

      {/* Current Phase Indicator */}
      <div className="text-center mt-3">
        <span className="text-system-blue font-mono text-sm">
          {'>'} PHASE {currentIndex + 1} OF {PHASES.length}: {PHASES[currentIndex]?.label ?? 'COMPLETE'}
        </span>
      </div>
    </div>
  )
}

/**
 * Mini progress for inline use
 */
export function OnboardingProgressMini({ phase }: OnboardingProgressProps) {
  const currentIndex = PHASES.findIndex(p => p.key === phase)
  const progressBlocks = PHASES.map((_, i) => 
    i < currentIndex ? '█' : i === currentIndex ? '░' : '·'
  ).join('')

  return (
    <div className="text-center font-mono text-xs text-system-text-muted">
      [{progressBlocks}] Phase {currentIndex + 1}/{PHASES.length}
    </div>
  )
}
