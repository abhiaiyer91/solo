/**
 * StreakBadge - Streak display with animation
 */

import React from 'react'
import { View, Text, StyleSheet, Animated } from 'react-native'

interface StreakBadgeProps {
  streak: number
  isActive?: boolean
  size?: 'small' | 'medium' | 'large'
}

export function StreakBadge({
  streak,
  isActive = true,
  size = 'medium',
}: StreakBadgeProps) {
  // Determine milestone status
  const isMilestone = streak > 0 && (streak === 7 || streak === 30 || streak === 100 || streak % 50 === 0)
  const isPerfectWeek = streak >= 7 && streak % 7 === 0

  const sizeStyles = {
    small: { container: styles.containerSmall, value: styles.valueSmall, icon: styles.iconSmall },
    medium: { container: styles.containerMedium, value: styles.valueMedium, icon: styles.iconMedium },
    large: { container: styles.containerLarge, value: styles.valueLarge, icon: styles.iconLarge },
  }

  const sizeStyle = sizeStyles[size]

  if (streak === 0) {
    return (
      <View style={[styles.container, sizeStyle.container, styles.inactive]}>
        <Text style={[styles.icon, sizeStyle.icon]}>💤</Text>
        <Text style={[styles.value, sizeStyle.value, styles.inactiveText]}>0</Text>
      </View>
    )
  }

  return (
    <View
      style={[
        styles.container,
        sizeStyle.container,
        isActive && styles.active,
        isMilestone && styles.milestone,
      ]}
    >
      <Text style={[styles.icon, sizeStyle.icon]}>
        {isMilestone ? '🔥' : isPerfectWeek ? '✨' : '🔥'}
      </Text>
      <Text
        style={[
          styles.value,
          sizeStyle.value,
          isActive && styles.activeText,
          isMilestone && styles.milestoneText,
        ]}
      >
        {streak}
      </Text>
      {size === 'large' && (
        <Text style={styles.label}>DAY STREAK</Text>
      )}
    </View>
  )
}

/**
 * Compact streak display for headers
 */
export function StreakBadgeCompact({ streak }: { streak: number }) {
  if (streak === 0) {
    return null
  }

  return (
    <View style={styles.compactContainer}>
      <Text style={styles.compactIcon}>🔥</Text>
      <Text style={styles.compactValue}>{streak}</Text>
    </View>
  )
}

/**
 * Streak progress toward next milestone
 */
export function StreakProgress({
  streak,
  nextMilestone,
}: {
  streak: number
  nextMilestone: number
}) {
  const progress = Math.min(100, (streak / nextMilestone) * 100)

  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressLabel}>Next milestone: Day {nextMilestone}</Text>
        <Text style={styles.progressValue}>{streak}/{nextMilestone}</Text>
      </View>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 100, 0, 0.1)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  containerSmall: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  containerMedium: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  containerLarge: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    flexDirection: 'column',
    gap: 2,
  },
  active: {
    backgroundColor: 'rgba(255, 100, 0, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 100, 0, 0.4)',
  },
  inactive: {
    backgroundColor: 'rgba(100, 100, 100, 0.2)',
  },
  milestone: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderColor: 'rgba(255, 215, 0, 0.4)',
  },
  icon: {
    fontSize: 16,
  },
  iconSmall: {
    fontSize: 12,
  },
  iconMedium: {
    fontSize: 16,
  },
  iconLarge: {
    fontSize: 32,
  },
  value: {
    fontSize: 16,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#888888',
  },
  valueSmall: {
    fontSize: 12,
  },
  valueMedium: {
    fontSize: 16,
  },
  valueLarge: {
    fontSize: 36,
  },
  activeText: {
    color: '#FF6600',
  },
  inactiveText: {
    color: '#666666',
  },
  milestoneText: {
    color: '#FFD700',
  },
  label: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#888888',
    marginTop: 2,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  compactIcon: {
    fontSize: 12,
  },
  compactValue: {
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#FF6600',
  },
  progressContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
    padding: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#888888',
  },
  progressValue: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#FF6600',
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF6600',
    borderRadius: 3,
  },
})
