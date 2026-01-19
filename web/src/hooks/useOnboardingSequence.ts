/**
 * useOnboardingSequence - Sequence state management for cinematic onboarding
 */

import { useState, useCallback } from 'react'

export type OnboardingStep =
  | 'detection'
  | 'assessment'
  | 'terms'
  | 'accept'
  | 'origin'
  | 'baseline'
  | 'first-quest'
  | 'interface-reveal'
  | 'complete'

const STEP_ORDER: OnboardingStep[] = [
  'detection',
  'assessment',
  'terms',
  'accept',
  'origin',
  'baseline',
  'first-quest',
  'interface-reveal',
  'complete',
]

interface UseOnboardingSequenceReturn {
  currentStep: OnboardingStep
  stepIndex: number
  totalSteps: number
  isComplete: boolean
  advance: () => void
  goToStep: (step: OnboardingStep) => void
  skipToEnd: () => void
  canSkip: boolean
  skipTapCount: number
  handleSkipTap: () => void
}

/**
 * Hook for managing onboarding sequence flow
 */
export function useOnboardingSequence(): UseOnboardingSequenceReturn {
  const [stepIndex, setStepIndex] = useState(0)
  const [skipTapCount, setSkipTapCount] = useState(0)

  const currentStep = STEP_ORDER[stepIndex] ?? 'complete'
  const isComplete = currentStep === 'complete'
  const totalSteps = STEP_ORDER.length - 1 // Exclude 'complete'

  const advance = useCallback(() => {
    setStepIndex((prev) => Math.min(prev + 1, STEP_ORDER.length - 1))
  }, [])

  const goToStep = useCallback((step: OnboardingStep) => {
    const index = STEP_ORDER.indexOf(step)
    if (index !== -1) {
      setStepIndex(index)
    }
  }, [])

  const skipToEnd = useCallback(() => {
    goToStep('complete')
  }, [goToStep])

  // Hidden skip: triple tap to skip
  const handleSkipTap = useCallback(() => {
    setSkipTapCount((prev) => {
      const newCount = prev + 1
      if (newCount >= 3) {
        skipToEnd()
        return 0
      }
      // Reset after 1 second
      setTimeout(() => setSkipTapCount(0), 1000)
      return newCount
    })
  }, [skipToEnd])

  // Can only skip after terms
  const canSkip = stepIndex >= STEP_ORDER.indexOf('accept')

  return {
    currentStep,
    stepIndex,
    totalSteps,
    isComplete,
    advance,
    goToStep,
    skipToEnd,
    canSkip,
    skipTapCount,
    handleSkipTap,
  }
}

/**
 * Sequential typewriter lines
 */
export interface TypewriterLine {
  text: string
  delay: number // Delay after this line (ms)
}

/**
 * Detection screen lines
 */
export const DETECTION_LINES: TypewriterLine[] = [
  { text: 'A dormant capability has been detected.', delay: 2000 },
  { text: '', delay: 1500 },
  { text: 'Physical output: underdeveloped', delay: 500 },
  { text: 'Recovery capacity: unstable', delay: 500 },
  { text: 'Discipline coefficient: unknown', delay: 500 },
  { text: '', delay: 2000 },
  { text: 'You have been granted access to the System.', delay: 0 },
]

/**
 * Terms screen lines
 */
export const TERMS_LINES: TypewriterLine[] = [
  { text: 'This interface will not motivate you.', delay: 1500 },
  { text: 'It will not encourage you.', delay: 1500 },
  { text: '', delay: 2000 },
  { text: 'It will only record what you do.', delay: 0 },
]

/**
 * Assessment lines (can be personalized)
 */
export function getAssessmentLines(capabilities?: {
  steps?: number
  workouts?: number
}): TypewriterLine[] {
  return [
    { text: 'Scanning current state...', delay: 1000 },
    { text: '', delay: 500 },
    { text: `Daily movement: ${capabilities?.steps ?? 'minimal'}`, delay: 400 },
    { text: `Training frequency: ${capabilities?.workouts ?? 'sporadic'}`, delay: 400 },
    { text: 'Sleep quality: unknown', delay: 400 },
    { text: 'Nutritional consistency: unknown', delay: 400 },
    { text: '', delay: 1500 },
    { text: 'Baseline established.', delay: 0 },
  ]
}
