/**
 * Mobile Quest Widgets - Hydration and Meditation trackers
 */

import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native'

// ═══════════════════════════════════════════════════════════
// HYDRATION WIDGET
// ═══════════════════════════════════════════════════════════

interface HydrationWidgetProps {
  currentGlasses: number
  goalGlasses: number
  onAddGlass: () => void
  onSetGlasses: (count: number) => void
}

export function HydrationWidget({
  currentGlasses,
  goalGlasses,
  onAddGlass,
  onSetGlasses,
}: HydrationWidgetProps) {
  const progress = Math.min(currentGlasses / goalGlasses, 1)
  const isComplete = currentGlasses >= goalGlasses

  return (
    <View style={[styles.widget, isComplete && styles.widgetComplete]}>
      <View style={styles.header}>
        <Text style={styles.emoji}>💧</Text>
        <Text style={styles.title}>HYDRATION</Text>
      </View>

      <View style={styles.glassGrid}>
        {Array.from({ length: goalGlasses }).map((_, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => onSetGlasses(i + 1)}
            style={[
              styles.glass,
              i < currentGlasses && styles.glassFilled,
            ]}
          >
            <Text style={styles.glassIcon}>
              {i < currentGlasses ? '🥤' : '⬜'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
      </View>

      <Text style={styles.progressText}>
        {currentGlasses}/{goalGlasses} glasses
      </Text>

      <TouchableOpacity
        style={[styles.addButton, isComplete && styles.addButtonComplete]}
        onPress={onAddGlass}
        disabled={isComplete}
      >
        <Text style={styles.addButtonText}>
          {isComplete ? '✓ Complete' : '+ Add Glass'}
        </Text>
      </TouchableOpacity>
    </View>
  )
}

export function HydrationWidgetCompact({
  currentGlasses,
  goalGlasses,
  onAddGlass,
}: Omit<HydrationWidgetProps, 'onSetGlasses'>) {
  const progress = Math.min(currentGlasses / goalGlasses, 1)
  const isComplete = currentGlasses >= goalGlasses

  return (
    <TouchableOpacity
      style={[styles.compactWidget, isComplete && styles.widgetComplete]}
      onPress={onAddGlass}
      disabled={isComplete}
    >
      <Text style={styles.compactEmoji}>💧</Text>
      <View style={styles.compactProgress}>
        <View style={[styles.compactBar, { width: `${progress * 100}%` }]} />
      </View>
      <Text style={styles.compactText}>
        {currentGlasses}/{goalGlasses}
      </Text>
    </TouchableOpacity>
  )
}

// ═══════════════════════════════════════════════════════════
// MEDITATION WIDGET
// ═══════════════════════════════════════════════════════════

type MeditationState = 'idle' | 'running' | 'paused' | 'completed'

interface MeditationWidgetProps {
  targetMinutes: number
  onSessionComplete: (durationSeconds: number) => void
}

export function MeditationWidget({
  targetMinutes,
  onSessionComplete,
}: MeditationWidgetProps) {
  const [state, setState] = useState<MeditationState>('idle')
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [pulseAnim] = useState(new Animated.Value(1))

  const targetSeconds = targetMinutes * 60
  const progress = Math.min(elapsedSeconds / targetSeconds, 1)

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (state === 'running') {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => {
          const newValue = prev + 1
          if (newValue >= targetSeconds) {
            setState('completed')
            onSessionComplete(newValue)
          }
          return newValue
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [state, targetSeconds, onSessionComplete])

  // Pulse animation
  useEffect(() => {
    if (state === 'running') {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      )
      pulse.start()
      return () => pulse.stop()
    }
    return undefined
  }, [state, pulseAnim])

  const handleStart = useCallback(() => {
    setState('running')
    setElapsedSeconds(0)
  }, [])

  const handlePause = useCallback(() => {
    setState('paused')
  }, [])

  const handleResume = useCallback(() => {
    setState('running')
  }, [])

  const handleEnd = useCallback(() => {
    if (elapsedSeconds > 60) {
      onSessionComplete(elapsedSeconds)
      setState('completed')
    } else {
      setState('idle')
      setElapsedSeconds(0)
    }
  }, [elapsedSeconds, onSessionComplete])

  const handleReset = useCallback(() => {
    setState('idle')
    setElapsedSeconds(0)
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getMessage = () => {
    if (state === 'completed') return 'Session complete. Peace retained.'
    if (state === 'running') return 'Breathe. The System waits.'
    if (state === 'paused') return 'Paused. Resume when ready.'
    return 'Begin when ready.'
  }

  return (
    <View style={styles.widget}>
      <View style={styles.header}>
        <Text style={styles.emoji}>🧘</Text>
        <Text style={styles.title}>MEDITATION</Text>
      </View>

      {/* Timer display */}
      <Animated.View style={[styles.timerCircle, { transform: [{ scale: pulseAnim }] }]}>
        <Text style={styles.timerText}>{formatTime(elapsedSeconds)}</Text>
        <Text style={styles.timerSubtext}>/ {formatTime(targetSeconds)}</Text>
      </Animated.View>

      {/* Progress */}
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, styles.meditationProgress, { width: `${progress * 100}%` }]} />
      </View>

      {/* Message */}
      <Text style={styles.meditationMessage}>{getMessage()}</Text>

      {/* Controls */}
      <View style={styles.controlRow}>
        {state === 'idle' && (
          <TouchableOpacity style={styles.primaryButton} onPress={handleStart}>
            <Text style={styles.primaryButtonText}>Begin</Text>
          </TouchableOpacity>
        )}

        {state === 'running' && (
          <>
            <TouchableOpacity style={styles.secondaryButton} onPress={handlePause}>
              <Text style={styles.secondaryButtonText}>Pause</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.outlineButton} onPress={handleEnd}>
              <Text style={styles.outlineButtonText}>End Early</Text>
            </TouchableOpacity>
          </>
        )}

        {state === 'paused' && (
          <>
            <TouchableOpacity style={styles.primaryButton} onPress={handleResume}>
              <Text style={styles.primaryButtonText}>Resume</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.outlineButton} onPress={handleEnd}>
              <Text style={styles.outlineButtonText}>End Session</Text>
            </TouchableOpacity>
          </>
        )}

        {state === 'completed' && (
          <TouchableOpacity style={styles.successButton} onPress={handleReset}>
            <Text style={styles.successButtonText}>✓ Complete - Start New</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

export function MeditationWidgetCompact({
  todayMinutes,
  goalMinutes,
  onPress,
}: {
  todayMinutes: number
  goalMinutes: number
  onPress: () => void
}) {
  const progress = Math.min(todayMinutes / goalMinutes, 1)
  const isComplete = todayMinutes >= goalMinutes

  return (
    <TouchableOpacity
      style={[styles.compactWidget, isComplete && styles.widgetComplete]}
      onPress={onPress}
    >
      <Text style={styles.compactEmoji}>🧘</Text>
      <View style={styles.compactProgress}>
        <View style={[styles.compactBar, styles.meditationBar, { width: `${progress * 100}%` }]} />
      </View>
      <Text style={styles.compactText}>
        {todayMinutes}/{goalMinutes}m
      </Text>
    </TouchableOpacity>
  )
}

// ═══════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════

const { width } = Dimensions.get('window')

const styles = StyleSheet.create({
  widget: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(100, 100, 100, 0.3)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  widgetComplete: {
    borderColor: 'rgba(34, 197, 94, 0.5)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  emoji: {
    fontSize: 24,
    marginRight: 8,
  },
  title: {
    fontFamily: 'monospace',
    fontSize: 14,
    fontWeight: 'bold',
    color: '#9ca3af',
    letterSpacing: 1,
  },
  glassGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  glass: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glassFilled: {},
  glassIcon: {
    fontSize: 20,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: 'rgba(100, 100, 100, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 2,
  },
  meditationProgress: {
    backgroundColor: '#8b5cf6',
  },
  progressText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 12,
  },
  addButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonComplete: {
    backgroundColor: '#22c55e',
  },
  addButtonText: {
    fontFamily: 'monospace',
    fontSize: 14,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  compactWidget: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(100, 100, 100, 0.3)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  compactEmoji: {
    fontSize: 20,
    marginRight: 10,
  },
  compactProgress: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(100, 100, 100, 0.3)',
    borderRadius: 2,
    marginRight: 10,
  },
  compactBar: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 2,
  },
  meditationBar: {
    backgroundColor: '#8b5cf6',
  },
  compactText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#9ca3af',
    minWidth: 40,
    textAlign: 'right',
  },
  timerCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#8b5cf6',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  timerText: {
    fontFamily: 'monospace',
    fontSize: 28,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  timerSubtext: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#9ca3af',
  },
  meditationMessage: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 16,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#8b5cf6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  primaryButtonText: {
    fontFamily: 'monospace',
    fontSize: 14,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderWidth: 1,
    borderColor: '#8b5cf6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  secondaryButtonText: {
    fontFamily: 'monospace',
    fontSize: 14,
    color: '#8b5cf6',
    fontWeight: 'bold',
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: 'rgba(100, 100, 100, 0.5)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  outlineButtonText: {
    fontFamily: 'monospace',
    fontSize: 14,
    color: '#9ca3af',
  },
  successButton: {
    backgroundColor: '#22c55e',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  successButtonText: {
    fontFamily: 'monospace',
    fontSize: 14,
    color: '#ffffff',
    fontWeight: 'bold',
  },
})

export default {
  HydrationWidget,
  HydrationWidgetCompact,
  MeditationWidget,
  MeditationWidgetCompact,
}
