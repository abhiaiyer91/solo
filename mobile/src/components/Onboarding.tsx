/**
 * Mobile Onboarding Flow Components
 */

import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native'

const { width, height } = Dimensions.get('window')

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

type OnboardingStep =
  | 'detection'
  | 'terms'
  | 'accept'
  | 'origin'
  | 'assessment'
  | 'reveal'

interface OnboardingProps {
  onComplete: (data: OnboardingData) => void
}

export interface OnboardingData {
  origin?: string
  acceptedAt: string
  completedAt: string
}

const STEPS: OnboardingStep[] = ['detection', 'terms', 'accept', 'origin', 'reveal']

// ═══════════════════════════════════════════════════════════
// NARRATIVE CONTENT
// ═══════════════════════════════════════════════════════════

const DETECTION_LINES = [
  'Scanning...',
  'New subject detected.',
  'Analyzing behavioral patterns...',
  'Previous attempts: Multiple.',
  'Success rate: Insufficient.',
  'Potential identified.',
  'Access granted.',
]

const TERMS_LINES = [
  'TERMS OF OBSERVATION',
  '',
  'The System will observe your actions.',
  'The System will report what it sees.',
  'The System will not lie to you.',
  '',
  'Progress requires consistency.',
  'Excuses are noted but not accepted.',
  'You will face yourself.',
]

const ORIGINS = [
  {
    id: 'fresh-start',
    title: 'The Fresh Start',
    subtitle: 'Beginning with nothing to prove',
    description: 'No history. No expectations. Just potential.',
  },
  {
    id: 'comeback',
    title: 'The Comeback',
    subtitle: 'Returning from a fall',
    description: 'You have failed before. You choose to try again.',
  },
  {
    id: 'evolution',
    title: 'The Evolution',
    subtitle: 'Upgrading an existing foundation',
    description: 'Already moving. Ready to move faster.',
  },
  {
    id: 'survivor',
    title: 'The Survivor',
    subtitle: 'Rebuilding after circumstance',
    description: 'Life intervened. You are taking control back.',
  },
]

// ═══════════════════════════════════════════════════════════
// STEP PROGRESS INDICATOR
// ═══════════════════════════════════════════════════════════

function StepProgress({ currentStep }: { currentStep: OnboardingStep }) {
  const currentIndex = STEPS.indexOf(currentStep)

  return (
    <View style={styles.progressContainer}>
      {STEPS.map((step, index) => (
        <View
          key={step}
          style={[
            styles.progressDot,
            index <= currentIndex && styles.progressDotActive,
            index === currentIndex && styles.progressDotCurrent,
          ]}
        />
      ))}
    </View>
  )
}

// ═══════════════════════════════════════════════════════════
// TYPEWRITER COMPONENT
// ═══════════════════════════════════════════════════════════

function TypewriterText({
  text,
  onComplete,
  delay = 50,
}: {
  text: string
  onComplete?: () => void
  delay?: number
}) {
  const [displayedText, setDisplayedText] = useState('')
  const [isComplete, setIsComplete] = useState(false)
  const onCompleteRef = useRef(onComplete)

  // Keep ref updated without triggering effect
  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    setDisplayedText('')
    setIsComplete(false)
    let index = 0

    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1))
        index++
      } else {
        setIsComplete(true)
        clearInterval(timer)
        onCompleteRef.current?.()
      }
    }, delay)

    return () => clearInterval(timer)
  }, [text, delay])

  return (
    <Text style={styles.typewriterText}>
      {displayedText}
      {!isComplete && <Text style={styles.cursor}>_</Text>}
    </Text>
  )
}

// ═══════════════════════════════════════════════════════════
// DETECTION SCREEN
// ═══════════════════════════════════════════════════════════

function DetectionScreen({ onNext }: { onNext: () => void }) {
  const [lineIndex, setLineIndex] = useState(0)
  const [fadeAnim] = useState(new Animated.Value(0))

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start()
  }, [fadeAnim])

  const handleLineComplete = useCallback(() => {
    setTimeout(() => {
      if (lineIndex < DETECTION_LINES.length - 1) {
        setLineIndex((prev) => prev + 1)
      } else {
        setTimeout(onNext, 1500)
      }
    }, 500)
  }, [lineIndex, onNext])

  return (
    <Animated.View style={[styles.screen, { opacity: fadeAnim }]}>
      <View style={styles.terminalContainer}>
        {DETECTION_LINES.slice(0, lineIndex + 1).map((line, i) => (
          <View key={i} style={styles.terminalLine}>
            <Text style={styles.terminalPrefix}>&gt;</Text>
            {i === lineIndex ? (
              <TypewriterText text={line} onComplete={handleLineComplete} />
            ) : (
              <Text style={styles.typewriterText}>{line}</Text>
            )}
          </View>
        ))}
      </View>
    </Animated.View>
  )
}

// ═══════════════════════════════════════════════════════════
// TERMS SCREEN
// ═══════════════════════════════════════════════════════════

function TermsScreen({ onNext }: { onNext: () => void }) {
  const [showAllText, setShowAllText] = useState(false)

  // Show all text after a short delay, then show button
  useEffect(() => {
    const timer = setTimeout(() => setShowAllText(true), 500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.termsContent}>
        <Text style={[styles.termsText, styles.termsTitle]}>TERMS OF OBSERVATION</Text>

        {showAllText && (
          <>
            <View style={{ height: 16 }} />
            <Text style={styles.termsText}>The System will observe your actions.</Text>
            <Text style={styles.termsText}>The System will report what it sees.</Text>
            <Text style={styles.termsText}>The System will not lie to you.</Text>
            <View style={{ height: 16 }} />
            <Text style={styles.termsText}>Progress requires consistency.</Text>
            <Text style={styles.termsText}>Excuses are noted but not accepted.</Text>
            <Text style={styles.termsText}>You will face yourself.</Text>
          </>
        )}
      </ScrollView>

      {showAllText && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.primaryButton} onPress={onNext}>
            <Text style={styles.primaryButtonText}>I Understand</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

// ═══════════════════════════════════════════════════════════
// ACCEPT SCREEN
// ═══════════════════════════════════════════════════════════

function AcceptScreen({ onNext }: { onNext: () => void }) {
  const [pulseAnim] = useState(new Animated.Value(1))
  const [accepted, setAccepted] = useState(false)

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    )
    pulse.start()
    return () => pulse.stop()
  }, [pulseAnim])

  const handleAccept = () => {
    setAccepted(true)
    setTimeout(onNext, 1000)
  }

  return (
    <View style={styles.screen}>
      <View style={styles.acceptContent}>
        <Text style={styles.acceptQuestion}>
          Are you ready to see yourself clearly?
        </Text>

        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <TouchableOpacity
            style={[styles.acceptButton, accepted && styles.acceptButtonActive]}
            onPress={handleAccept}
            disabled={accepted}
          >
            <Text style={styles.acceptButtonText}>
              {accepted ? 'ACCESS GRANTED' : 'ACCEPT ACCESS'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  )
}

// ═══════════════════════════════════════════════════════════
// ORIGIN SELECTION
// ═══════════════════════════════════════════════════════════

function OriginScreen({
  onNext,
  onSelect,
}: {
  onNext: () => void
  onSelect: (origin: string) => void
}) {
  const [selected, setSelected] = useState<string | null>(null)

  const handleSelect = (originId: string) => {
    setSelected(originId)
  }

  const handleContinue = () => {
    if (selected) {
      onSelect(selected)
      onNext()
    }
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.originTitle}>SELECT YOUR ORIGIN</Text>
      <Text style={styles.originSubtitle}>
        Where does your journey begin?
      </Text>

      <ScrollView style={styles.originList}>
        {ORIGINS.map((origin) => (
          <TouchableOpacity
            key={origin.id}
            style={[
              styles.originCard,
              selected === origin.id && styles.originCardSelected,
            ]}
            onPress={() => handleSelect(origin.id)}
          >
            <Text style={styles.originCardTitle}>{origin.title}</Text>
            <Text style={styles.originCardSubtitle}>{origin.subtitle}</Text>
            <Text style={styles.originCardDescription}>{origin.description}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {selected && (
        <TouchableOpacity style={styles.primaryButton} onPress={handleContinue}>
          <Text style={styles.primaryButtonText}>Continue</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

// ═══════════════════════════════════════════════════════════
// REVEAL SCREEN
// ═══════════════════════════════════════════════════════════

function RevealScreen({ onComplete }: { onComplete: () => void }) {
  const [fadeAnim] = useState(new Animated.Value(0))
  const [scaleAnim] = useState(new Animated.Value(0.8))

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start()
  }, [fadeAnim, scaleAnim])

  return (
    <View style={styles.screen}>
      <Animated.View
        style={[
          styles.revealContent,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        ]}
      >
        <Text style={styles.revealTitle}>THE SYSTEM</Text>
        <Text style={styles.revealSubtitle}>IS NOW OBSERVING</Text>

        <View style={styles.revealDivider} />

        <Text style={styles.revealMessage}>
          Your journey begins now.{'\n'}
          The data will speak for itself.
        </Text>

        <TouchableOpacity style={styles.beginButton} onPress={onComplete}>
          <Text style={styles.beginButtonText}>BEGIN</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  )
}

// ═══════════════════════════════════════════════════════════
// MAIN ONBOARDING COMPONENT
// ═══════════════════════════════════════════════════════════

export function MobileOnboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState<OnboardingStep>('detection')
  const [origin, setOrigin] = useState<string | undefined>()
  const [acceptedAt, setAcceptedAt] = useState<string>('')

  const handleAccept = () => {
    setAcceptedAt(new Date().toISOString())
    setStep('origin')
  }

  const handleComplete = () => {
    onComplete({
      origin,
      acceptedAt,
      completedAt: new Date().toISOString(),
    })
  }

  return (
    <View style={styles.container}>
      {/* Step Progress Indicator */}
      <StepProgress currentStep={step} />

      {step === 'detection' && (
        <DetectionScreen onNext={() => setStep('terms')} />
      )}
      {step === 'terms' && (
        <TermsScreen onNext={() => setStep('accept')} />
      )}
      {step === 'accept' && (
        <AcceptScreen onNext={handleAccept} />
      )}
      {step === 'origin' && (
        <OriginScreen
          onNext={() => setStep('reveal')}
          onSelect={setOrigin}
        />
      )}
      {step === 'reveal' && (
        <RevealScreen onComplete={handleComplete} />
      )}
    </View>
  )
}

// ═══════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingTop: 60,
    paddingBottom: 20,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1E293B',
  },
  progressDotActive: {
    backgroundColor: '#60A5FA',
  },
  progressDotCurrent: {
    transform: [{ scale: 1.25 }],
  },
  screen: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  terminalContainer: {
    padding: 16,
  },
  terminalLine: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  terminalPrefix: {
    fontFamily: 'monospace',
    fontSize: 14,
    color: '#22c55e',
    marginRight: 8,
  },
  typewriterText: {
    fontFamily: 'monospace',
    fontSize: 14,
    color: '#d1d5db',
    flex: 1,
  },
  cursor: {
    color: '#22c55e',
  },
  termsContent: {
    paddingVertical: 40,
  },
  termsLine: {
    marginBottom: 8,
  },
  termsText: {
    fontFamily: 'monospace',
    fontSize: 14,
    color: '#d1d5db',
    textAlign: 'center',
  },
  termsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  buttonContainer: {
    paddingVertical: 24,
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 24,
  },
  primaryButtonText: {
    fontFamily: 'monospace',
    fontSize: 16,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  acceptContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  acceptQuestion: {
    fontFamily: 'monospace',
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 48,
  },
  acceptButton: {
    borderWidth: 2,
    borderColor: '#3b82f6',
    paddingVertical: 20,
    paddingHorizontal: 48,
    borderRadius: 8,
  },
  acceptButtonActive: {
    backgroundColor: '#3b82f6',
  },
  acceptButtonText: {
    fontFamily: 'monospace',
    fontSize: 18,
    color: '#ffffff',
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  originTitle: {
    fontFamily: 'monospace',
    fontSize: 18,
    color: '#ffffff',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  originSubtitle: {
    fontFamily: 'monospace',
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 24,
  },
  originList: {
    flex: 1,
    marginBottom: 24,
  },
  originCard: {
    backgroundColor: 'rgba(50, 50, 50, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(100, 100, 100, 0.3)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  originCardSelected: {
    borderColor: '#3b82f6',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  originCardTitle: {
    fontFamily: 'monospace',
    fontSize: 16,
    color: '#ffffff',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  originCardSubtitle: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#3b82f6',
    marginBottom: 8,
  },
  originCardDescription: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#9ca3af',
  },
  revealContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  revealTitle: {
    fontFamily: 'monospace',
    fontSize: 32,
    color: '#ffffff',
    fontWeight: 'bold',
    letterSpacing: 4,
  },
  revealSubtitle: {
    fontFamily: 'monospace',
    fontSize: 14,
    color: '#9ca3af',
    letterSpacing: 2,
    marginTop: 8,
  },
  revealDivider: {
    width: 100,
    height: 1,
    backgroundColor: 'rgba(100, 100, 100, 0.5)',
    marginVertical: 32,
  },
  revealMessage: {
    fontFamily: 'monospace',
    fontSize: 14,
    color: '#d1d5db',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 48,
  },
  beginButton: {
    backgroundColor: '#22c55e',
    paddingVertical: 16,
    paddingHorizontal: 64,
    borderRadius: 8,
  },
  beginButtonText: {
    fontFamily: 'monospace',
    fontSize: 18,
    color: '#ffffff',
    fontWeight: 'bold',
    letterSpacing: 3,
  },
})

export default MobileOnboarding
