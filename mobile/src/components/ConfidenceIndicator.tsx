/**
 * ConfidenceIndicator - Visual display of AI detection confidence
 * Shows colored bar and percentage based on confidence level
 */

import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Animated, {
  useAnimatedStyle,
  withTiming,
  useSharedValue,
  withDelay,
} from 'react-native-reanimated'
import { useEffect } from 'react'

interface ConfidenceIndicatorProps {
  confidence: number // 0-1
  showLabel?: boolean
  size?: 'small' | 'medium' | 'large'
  animated?: boolean
}

/**
 * Get color based on confidence level
 * High (>85%): Green
 * Medium (60-85%): Yellow
 * Low (<60%): Red
 */
function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.85) return '#00FF00' // Green
  if (confidence >= 0.6) return '#FFB800' // Yellow/Gold
  return '#FF4444' // Red
}

/**
 * Get label based on confidence level
 */
function getConfidenceLabel(confidence: number): string {
  if (confidence >= 0.85) return 'High'
  if (confidence >= 0.6) return 'Medium'
  return 'Low'
}

/**
 * Main confidence indicator with animated bar
 */
export function ConfidenceIndicator({
  confidence,
  showLabel = true,
  size = 'medium',
  animated = true,
}: ConfidenceIndicatorProps) {
  const progress = useSharedValue(0)
  const color = getConfidenceColor(confidence)
  const percent = Math.round(confidence * 100)

  useEffect(() => {
    if (animated) {
      progress.value = withDelay(200, withTiming(confidence, { duration: 600 }))
    } else {
      progress.value = confidence
    }
  }, [confidence, animated, progress])

  const animatedBarStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }))

  const heights = {
    small: 4,
    medium: 6,
    large: 8,
  }

  const barHeight = heights[size]

  return (
    <View style={styles.container}>
      {/* Background track */}
      <View style={[styles.track, { height: barHeight }]}>
        {/* Animated fill */}
        <Animated.View
          style={[
            styles.fill,
            { backgroundColor: color, height: barHeight },
            animatedBarStyle,
          ]}
        />
      </View>

      {/* Label */}
      {showLabel && (
        <Text style={[styles.label, { color }]}>
          {percent}%
        </Text>
      )}
    </View>
  )
}

/**
 * Compact inline confidence badge
 */
export function ConfidenceBadge({
  confidence,
}: {
  confidence: number
}) {
  const color = getConfidenceColor(confidence)
  const label = getConfidenceLabel(confidence)
  const percent = Math.round(confidence * 100)

  return (
    <View style={[styles.badge, { borderColor: color }]}>
      <View style={[styles.badgeDot, { backgroundColor: color }]} />
      <Text style={[styles.badgeText, { color }]}>
        {percent}% {label}
      </Text>
    </View>
  )
}

/**
 * Minimal dot indicator for list items
 */
export function ConfidenceDot({
  confidence,
  size = 8,
}: {
  confidence: number
  size?: number
}) {
  const color = getConfidenceColor(confidence)

  return (
    <View
      style={[
        styles.dot,
        {
          backgroundColor: color,
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
    />
  )
}

/**
 * Full width bar with segments
 */
export function ConfidenceBar({
  confidence,
  height = 8,
}: {
  confidence: number
  height?: number
}) {
  const color = getConfidenceColor(confidence)
  const percent = Math.round(confidence * 100)

  return (
    <View style={styles.barContainer}>
      <View style={[styles.barTrack, { height }]}>
        <View
          style={[
            styles.barFill,
            {
              backgroundColor: color,
              width: `${percent}%`,
              height,
            },
          ]}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  track: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: 4,
  },
  label: {
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    minWidth: 36,
    textAlign: 'right',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  dot: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  barContainer: {
    width: '100%',
  },
  barTrack: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    borderRadius: 4,
  },
})

export { getConfidenceColor, getConfidenceLabel }
