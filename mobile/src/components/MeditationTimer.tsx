/**
 * MeditationTimer - Mobile meditation session timer
 */

import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native'

type MeditationState = 'idle' | 'active' | 'paused' | 'completed'

interface MeditationTimerProps {
  targetMinutes?: number
  onComplete?: (minutes: number) => void
  onCancel?: () => void
}

export function MeditationTimer({
  targetMinutes = 10,
  onComplete,
  onCancel,
}: MeditationTimerProps) {
  const [state, setState] = useState<MeditationState>('idle')
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const progressAnim = useRef(new Animated.Value(0)).current

  const targetSeconds = targetMinutes * 60
  const progress = elapsedSeconds / targetSeconds
  const remainingSeconds = Math.max(0, targetSeconds - elapsedSeconds)

  // Timer effect
  useEffect(() => {
    if (state === 'active') {
      intervalRef.current = setInterval(() => {
        setElapsedSeconds((prev) => {
          const next = prev + 1
          if (next >= targetSeconds) {
            setState('completed')
            return targetSeconds
          }
          return next
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [state, targetSeconds])

  // Animate progress
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 500,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start()
  }, [progress, progressAnim])

  const start = useCallback(() => {
    setState('active')
    setElapsedSeconds(0)
  }, [])

  const pause = useCallback(() => {
    setState('paused')
  }, [])

  const resume = useCallback(() => {
    setState('active')
  }, [])

  const stop = useCallback(() => {
    setState('idle')
    setElapsedSeconds(0)
    onCancel?.()
  }, [onCancel])

  const complete = useCallback(() => {
    const minutes = Math.ceil(elapsedSeconds / 60)
    onComplete?.(minutes)
    setState('idle')
    setElapsedSeconds(0)
  }, [elapsedSeconds, onComplete])

  const getMessage = (): string => {
    switch (state) {
      case 'idle': return 'Find a quiet space. Be present.'
      case 'active': return 'Breathe. Focus on the present moment.'
      case 'paused': return 'Take your time. Return when ready.'
      case 'completed': return 'Well done. Carry this peace with you.'
    }
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.icon}>🧘</Text>
        <Text style={styles.title}>MINDFULNESS</Text>
      </View>

      {/* Timer Circle */}
      <View style={styles.timerContainer}>
        <View style={styles.circleOuter}>
          <Animated.View
            style={[
              styles.circleProgress,
              {
                transform: [
                  {
                    rotate: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg'],
                    }),
                  },
                ],
              },
            ]}
          />
          <View style={styles.circleInner}>
            <Text style={styles.timeDisplay}>
              {formatTime(state === 'completed' ? elapsedSeconds : remainingSeconds)}
            </Text>
            <Text style={styles.timeLabel}>
              {state === 'completed' ? 'completed' : 'remaining'}
            </Text>
          </View>
        </View>
      </View>

      {/* Message */}
      <Text style={styles.message}>{getMessage()}</Text>

      {/* Controls */}
      <View style={styles.controls}>
        {state === 'idle' && (
          <Pressable style={styles.primaryButton} onPress={start}>
            <Text style={styles.primaryButtonText}>Begin Session</Text>
          </Pressable>
        )}

        {state === 'active' && (
          <View style={styles.buttonRow}>
            <Pressable style={styles.secondaryButton} onPress={pause}>
              <Text style={styles.secondaryButtonText}>Pause</Text>
            </Pressable>
            <Pressable style={styles.primaryButton} onPress={complete}>
              <Text style={styles.primaryButtonText}>End Early</Text>
            </Pressable>
          </View>
        )}

        {state === 'paused' && (
          <View style={styles.buttonRow}>
            <Pressable style={styles.secondaryButton} onPress={stop}>
              <Text style={styles.secondaryButtonText}>Cancel</Text>
            </Pressable>
            <Pressable style={styles.primaryButton} onPress={resume}>
              <Text style={styles.primaryButtonText}>Resume</Text>
            </Pressable>
          </View>
        )}

        {state === 'completed' && (
          <Pressable style={styles.completeButton} onPress={complete}>
            <Text style={styles.completeButtonText}>Complete ✓</Text>
          </Pressable>
        )}
      </View>
    </View>
  )
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

/**
 * Compact meditation widget
 */
export function MeditationWidgetCompact({
  totalMinutes,
  targetMinutes,
  goalMet,
  onPress,
}: {
  totalMinutes: number
  targetMinutes: number
  goalMet: boolean
  onPress?: () => void
}) {
  const progress = Math.round((totalMinutes / targetMinutes) * 100)

  return (
    <Pressable style={styles.compactContainer} onPress={onPress}>
      <Text style={styles.compactIcon}>🧘</Text>
      <View style={styles.compactContent}>
        <View style={styles.compactTextRow}>
          <Text style={[styles.compactValue, goalMet && styles.compactValueComplete]}>
            {totalMinutes}
          </Text>
          <Text style={styles.compactTarget}>/ {targetMinutes} min</Text>
        </View>
        <View style={styles.compactProgressBar}>
          <View
            style={[
              styles.compactProgressFill,
              { width: `${Math.min(100, progress)}%` },
              goalMet && styles.compactProgressComplete,
            ]}
          />
        </View>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(45, 212, 191, 0.2)',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  icon: {
    fontSize: 24,
  },
  title: {
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#2dd4bf',
  },
  timerContainer: {
    marginBottom: 24,
  },
  circleOuter: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 4,
    borderColor: 'rgba(100, 116, 139, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleProgress: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 4,
    borderColor: '#2dd4bf',
    borderLeftColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  circleInner: {
    alignItems: 'center',
  },
  timeDisplay: {
    fontSize: 36,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  timeLabel: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#64748b',
    marginTop: 4,
  },
  message: {
    fontSize: 13,
    fontFamily: 'monospace',
    color: '#94a3b8',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 24,
  },
  controls: {
    width: '100%',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: 'rgba(45, 212, 191, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(45, 212, 191, 0.5)',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 14,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#2dd4bf',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: 'rgba(100, 116, 139, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(100, 116, 139, 0.3)',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#94a3b8',
  },
  completeButton: {
    backgroundColor: '#2dd4bf',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  completeButtonText: {
    fontSize: 14,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#0f172a',
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    borderRadius: 8,
    padding: 12,
    gap: 12,
  },
  compactIcon: {
    fontSize: 20,
  },
  compactContent: {
    flex: 1,
  },
  compactTextRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  compactValue: {
    fontSize: 14,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  compactValueComplete: {
    color: '#2dd4bf',
  },
  compactTarget: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#64748b',
    marginLeft: 2,
  },
  compactProgressBar: {
    height: 4,
    backgroundColor: 'rgba(100, 116, 139, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 4,
  },
  compactProgressFill: {
    height: '100%',
    backgroundColor: '#64748b',
    borderRadius: 2,
  },
  compactProgressComplete: {
    backgroundColor: '#2dd4bf',
  },
})
