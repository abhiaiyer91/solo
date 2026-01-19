/**
 * HealthSummary - Today's health data at a glance
 * Displays steps, exercise, workouts, and calories
 */

import React from 'react'
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native'
import type { HealthData } from '../health/types'

interface HealthSummaryProps {
  data: HealthData | null
  isLoading?: boolean
  targetSteps?: number
}

export function HealthSummary({
  data,
  isLoading,
  targetSteps = 10000,
}: HealthSummaryProps) {
  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{'>'} TODAY'S ACTIVITY</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#00FF00" />
          <Text style={styles.loadingText}>Loading health data...</Text>
        </View>
      </View>
    )
  }

  if (!data) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{'>'} TODAY'S ACTIVITY</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No health data available</Text>
          <Text style={styles.emptySubtext}>Connect Apple Health to sync</Text>
        </View>
      </View>
    )
  }

  const stepsProgress = Math.min(100, (data.steps / targetSteps) * 100)

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{'>'} TODAY'S ACTIVITY</Text>
        <Text style={styles.syncTime}>
          {formatSyncTime(data.syncedAt)}
        </Text>
      </View>

      {/* Steps Progress */}
      <View style={styles.stepsSection}>
        <View style={styles.stepsHeader}>
          <Text style={styles.stepsValue}>
            {data.steps.toLocaleString()}
          </Text>
          <Text style={styles.stepsTarget}>/ {targetSteps.toLocaleString()}</Text>
        </View>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${stepsProgress}%` },
              stepsProgress >= 100 && styles.progressComplete,
            ]}
          />
        </View>
        <Text style={styles.stepsLabel}>STEPS</Text>
      </View>

      {/* Stats Grid */}
      <View style={styles.grid}>
        <StatItem
          label="EXERCISE"
          value={`${data.exerciseMinutes}`}
          unit="min"
          icon="🏃"
        />
        <StatItem
          label="WORKOUTS"
          value={`${data.workouts.length}`}
          unit=""
          icon="💪"
        />
        <StatItem
          label="CALORIES"
          value={`${data.activeCalories}`}
          unit="cal"
          icon="🔥"
        />
        <StatItem
          label="DISTANCE"
          value={`${(data.distanceMeters / 1000).toFixed(1)}`}
          unit="km"
          icon="📍"
        />
      </View>

      {/* Sleep (if available) */}
      {data.sleepMinutes !== null && (
        <View style={styles.sleepSection}>
          <Text style={styles.sleepIcon}>😴</Text>
          <Text style={styles.sleepValue}>
            {formatSleepTime(data.sleepMinutes)}
          </Text>
          <Text style={styles.sleepLabel}>SLEEP</Text>
        </View>
      )}
    </View>
  )
}

function StatItem({
  label,
  value,
  unit,
  icon,
}: {
  label: string
  value: string
  unit: string
  icon: string
}) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statIcon}>{icon}</Text>
      <View style={styles.statContent}>
        <View style={styles.statValueRow}>
          <Text style={styles.statValue}>{value}</Text>
          {unit && <Text style={styles.statUnit}>{unit}</Text>}
        </View>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </View>
  )
}

function formatSyncTime(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return 'Just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  return `${Math.floor(seconds / 3600)}h ago`
}

function formatSleepTime(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}h ${mins}m`
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 0, 0.2)',
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#00FF00',
    fontWeight: 'bold',
  },
  syncTime: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#666666',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#888888',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#888888',
  },
  emptySubtext: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#666666',
    marginTop: 4,
  },
  stepsSection: {
    marginBottom: 16,
  },
  stepsHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  stepsValue: {
    fontSize: 32,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  stepsTarget: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#666666',
    marginLeft: 4,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00FF00',
    borderRadius: 2,
  },
  progressComplete: {
    backgroundColor: '#FFD700',
  },
  stepsLabel: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#666666',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  statItem: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    gap: 8,
  },
  statIcon: {
    fontSize: 20,
  },
  statContent: {
    flex: 1,
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  statValue: {
    fontSize: 18,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statUnit: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#666666',
    marginLeft: 2,
  },
  statLabel: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#666666',
  },
  sleepSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    gap: 8,
  },
  sleepIcon: {
    fontSize: 20,
  },
  sleepValue: {
    fontSize: 18,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  sleepLabel: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#666666',
  },
})
