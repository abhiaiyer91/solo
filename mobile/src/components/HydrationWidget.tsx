/**
 * HydrationWidget - Mobile hydration tracking widget
 */

import React from 'react'
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native'

interface HydrationWidgetProps {
  glasses: number
  target: number
  goalMet: boolean
  onAddGlass: () => void
  onAddMultiple: (count: number) => void
  isLoading?: boolean
}

export function HydrationWidget({
  glasses,
  target,
  goalMet,
  onAddGlass,
  onAddMultiple,
  isLoading,
}: HydrationWidgetProps) {
  const progress = Math.round((glasses / target) * 100)

  return (
    <View style={[styles.container, goalMet && styles.containerComplete]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.icon}>💧</Text>
          <Text style={styles.title}>HYDRATION</Text>
        </View>
        {goalMet && (
          <View style={styles.goalBadge}>
            <Text style={styles.goalBadgeText}>✓ GOAL MET</Text>
          </View>
        )}
      </View>

      {/* Glass visualization */}
      <View style={styles.glassRow}>
        {Array.from({ length: target }, (_, i) => (
          <GlassIcon key={i} filled={i < glasses} />
        ))}
      </View>

      {/* Progress */}
      <View style={styles.progressSection}>
        <View style={styles.progressText}>
          <Text style={styles.currentValue}>{glasses}</Text>
          <Text style={styles.targetValue}>/{target}</Text>
        </View>
        <Text style={styles.percentText}>{progress}%</Text>
      </View>

      {/* Progress bar */}
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: `${Math.min(100, progress)}%` },
            goalMet && styles.progressComplete,
          ]}
        />
      </View>

      {/* Quick add buttons */}
      {!goalMet && (
        <View style={styles.buttonRow}>
          <Pressable
            style={styles.addButton}
            onPress={onAddGlass}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#60a5fa" />
            ) : (
              <Text style={styles.addButtonText}>+1 Glass</Text>
            )}
          </Pressable>
          <Pressable
            style={styles.addButton}
            onPress={() => onAddMultiple(2)}
            disabled={isLoading}
          >
            <Text style={styles.addButtonText}>+2 Glasses</Text>
          </Pressable>
        </View>
      )}
    </View>
  )
}

function GlassIcon({ filled }: { filled: boolean }) {
  return (
    <View style={[styles.glass, filled && styles.glassFilled]}>
      {filled && <View style={styles.glassWater} />}
    </View>
  )
}

/**
 * Compact hydration widget
 */
export function HydrationWidgetCompact({
  glasses,
  target,
  goalMet,
  onAddGlass,
}: {
  glasses: number
  target: number
  goalMet: boolean
  onAddGlass: () => void
}) {
  const progress = Math.round((glasses / target) * 100)

  return (
    <View style={styles.compactContainer}>
      <Text style={styles.compactIcon}>💧</Text>
      <View style={styles.compactContent}>
        <View style={styles.compactTextRow}>
          <Text style={[styles.compactValue, goalMet && styles.compactValueComplete]}>
            {glasses}
          </Text>
          <Text style={styles.compactTarget}>/{target}</Text>
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
      {!goalMet && (
        <Pressable onPress={onAddGlass} style={styles.compactAddButton}>
          <Text style={styles.compactAddText}>+</Text>
        </Pressable>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 16,
  },
  containerComplete: {
    borderColor: 'rgba(0, 255, 0, 0.3)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  icon: {
    fontSize: 20,
  },
  title: {
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#60a5fa',
  },
  goalBadge: {
    backgroundColor: 'rgba(0, 255, 0, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  goalBadgeText: {
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#00FF00',
  },
  glassRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  glass: {
    width: 24,
    height: 32,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    borderTopLeftRadius: 1,
    borderTopRightRadius: 1,
    overflow: 'hidden',
  },
  glassFilled: {
    borderColor: '#60a5fa',
  },
  glassWater: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '80%',
    backgroundColor: 'rgba(96, 165, 250, 0.5)',
  },
  progressSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  progressText: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  currentValue: {
    fontSize: 24,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  targetValue: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#666666',
  },
  percentText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#666666',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#60a5fa',
    borderRadius: 4,
  },
  progressComplete: {
    backgroundColor: '#00FF00',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  addButton: {
    flex: 1,
    backgroundColor: 'rgba(96, 165, 250, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.5)',
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#60a5fa',
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 6,
    padding: 10,
    gap: 10,
  },
  compactIcon: {
    fontSize: 18,
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
    color: '#00FF00',
  },
  compactTarget: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#666666',
  },
  compactProgressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 4,
  },
  compactProgressFill: {
    height: '100%',
    backgroundColor: '#60a5fa',
    borderRadius: 2,
  },
  compactProgressComplete: {
    backgroundColor: '#00FF00',
  },
  compactAddButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(96, 165, 250, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactAddText: {
    fontSize: 18,
    color: '#60a5fa',
    fontWeight: 'bold',
  },
})
