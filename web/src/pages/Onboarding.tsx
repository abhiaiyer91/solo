import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { TypewriterText } from '@/components/system'
import { api } from '@/lib/api'

// Onboarding steps content
const STEPS = {
  detection: {
    title: 'SYSTEM DETECTION',
    content: `A dormant capability has been detected.

Physical output: underdeveloped
Recovery capacity: unstable
Discipline coefficient: unknown

You have been granted access to the System.`,
  },
  explanation: {
    title: 'SYSTEM EXPLANATION',
    content: `The System will assign you daily quests.

Complete them to grow stronger.
Fail them, and face consequences.

Your stats track your true capabilities:
STR - Physical power and endurance
AGI - Speed and flexibility
VIT - Health and recovery
DISC - Mental fortitude and consistency

Each day is a test. Each quest is an opportunity.
The System rewards those who persist.`,
  },
  accept: {
    title: 'TERMS OF AWAKENING',
    content: `By accepting, you agree to:

1. Complete daily quests assigned by the System
2. Track your progress honestly
3. Push beyond perceived limits
4. Never skip a day without consequence

The System does not negotiate.
The System does not forgive.
The System only observes what you become.

Do you accept these terms?`,
  },
  quests: {
    title: 'DAILY QUESTS',
    content: `Your journey begins with daily objectives.

Each day, the System will assign quests:
- Physical training challenges
- Recovery requirements
- Discipline tests

Complete all quests to maintain your streak.
Consecutive days unlock greater rewards.
The System tracks everything.

Your first quests await on the dashboard.`,
  },
  title: {
    title: 'TITLE ASSIGNED',
    content: `TITLE ASSIGNED: The Beginner

You begin with nothing proven.
Your capabilities are unknown.
The System will observe what you become.

Your daily quests await.`,
  },
}

type StepKey = keyof typeof STEPS

const STEP_ORDER: StepKey[] = ['detection', 'explanation', 'accept', 'quests', 'title']

interface CompleteOnboardingResponse {
  success: boolean
  player: {
    onboardingCompleted: boolean
    currentTitle: string
  }
}

export function Onboarding() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [isTypingComplete, setIsTypingComplete] = useState(false)
  const [showSkip, setShowSkip] = useState(false)

  const currentStepKey = STEP_ORDER[currentStepIndex] as StepKey
  const currentStep = STEPS[currentStepKey]
  const isLastStep = currentStepIndex === STEP_ORDER.length - 1
  const isAcceptStep = currentStepKey === 'accept'

  // Mutation to complete onboarding
  const completeOnboarding = useMutation({
    mutationFn: async () => {
      return api.post<CompleteOnboardingResponse>('/api/player/onboarding/complete')
    },
    onSuccess: () => {
      // Invalidate player query to refetch with updated onboardingCompleted status
      queryClient.invalidateQueries({ queryKey: ['player'] })
      navigate('/', { replace: true })
    },
  })

  const handleTypingComplete = useCallback(() => {
    setIsTypingComplete(true)
    // Show skip button after first step completes
    if (currentStepIndex >= 0) {
      setShowSkip(true)
    }
  }, [currentStepIndex])

  const handleNext = useCallback(() => {
    if (isLastStep) {
      completeOnboarding.mutate()
    } else {
      setIsTypingComplete(false)
      setCurrentStepIndex((prev) => prev + 1)
    }
  }, [isLastStep, completeOnboarding])

  const handleSkip = useCallback(() => {
    completeOnboarding.mutate()
  }, [completeOnboarding])

  // Get button text based on current step
  const getButtonText = () => {
    if (completeOnboarding.isPending) {
      return 'INITIALIZING...'
    }
    if (isLastStep) {
      return 'BEGIN JOURNEY'
    }
    if (isAcceptStep) {
      return 'I ACCEPT'
    }
    return 'CONTINUE'
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl"
      >
        {/* System Window */}
        <div className="system-window p-8 relative">
          {/* Step indicator */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-system-blue rounded-full animate-pulse" />
              <span className="text-system-text-muted text-xs uppercase tracking-wider">
                SYSTEM
              </span>
            </div>
            <div className="flex gap-1">
              {STEP_ORDER.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index <= currentStepIndex
                      ? 'bg-system-blue'
                      : 'bg-system-border'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Step title */}
          <AnimatePresence mode="wait">
            <motion.h2
              key={currentStep.title}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="text-xl font-bold text-system-blue mb-6 tracking-wider"
            >
              {currentStep.title}
            </motion.h2>
          </AnimatePresence>

          {/* Step content with typewriter effect */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStepKey}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="min-h-[200px] mb-8"
            >
              <div className="text-system-text font-mono text-sm leading-relaxed whitespace-pre-wrap">
                <TypewriterText
                  text={currentStep.content}
                  speed={20}
                  onComplete={handleTypingComplete}
                  showCursor={!isTypingComplete}
                />
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Buttons */}
          <AnimatePresence>
            {isTypingComplete && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-between"
              >
                {/* Skip button - only show after first step */}
                {showSkip && !isLastStep ? (
                  <button
                    onClick={handleSkip}
                    disabled={completeOnboarding.isPending}
                    className="text-system-text-muted text-sm hover:text-system-text transition-colors disabled:opacity-50"
                  >
                    Skip to Dashboard
                  </button>
                ) : (
                  <div />
                )}

                {/* Main action button */}
                <button
                  onClick={handleNext}
                  disabled={completeOnboarding.isPending}
                  className={`btn-primary ${
                    isAcceptStep
                      ? 'bg-gradient-to-r from-system-purple to-system-blue'
                      : ''
                  } ${
                    isLastStep
                      ? 'bg-gradient-to-r from-system-gold/80 to-system-gold text-system-black'
                      : ''
                  }`}
                >
                  {getButtonText()}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading overlay */}
          {completeOnboarding.isPending && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-system-black/50 backdrop-blur-sm flex items-center justify-center rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 border-2 border-system-blue border-t-transparent rounded-full animate-spin" />
                <span className="text-system-text-muted">
                  INITIALIZING HUNTER PROTOCOL...
                </span>
              </div>
            </motion.div>
          )}

          {/* Error message */}
          {completeOnboarding.isError && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 p-3 border border-system-red/50 rounded bg-system-red/10 text-system-red text-sm"
            >
              System error. Please try again.
            </motion.div>
          )}
        </div>

        {/* Decorative elements */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ delay: 0.5 }}
          className="absolute top-1/4 left-10 w-px h-32 bg-gradient-to-b from-transparent via-system-blue to-transparent"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ delay: 0.7 }}
          className="absolute top-1/3 right-10 w-px h-24 bg-gradient-to-b from-transparent via-system-purple to-transparent"
        />
      </motion.div>
    </div>
  )
}
