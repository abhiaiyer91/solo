/**
 * StreakStats - Display streak statistics
 * Shows current streak, longest streak, and perfect days
 */

import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { SystemWindow } from './SystemWindow'

interface StreakStatsProps {
  currentStreak: number
  longestStreak: number
  perfectStreak: number
}

export function StreakStats({
  currentStreak,
  longestStreak,
  perfectStreak,
}: StreakStatsProps) {
  return (
    <SystemWindow title="STREAK RECORDS" style={styles.container}>
      <View style={styles.statsGrid}>
        <StreakItem
          icon="flame"
          iconColor="#FF6B6B"
          label="Current"
          value={currentStreak}
          unit="days"
          highlight={currentStreak > 0}
        />
        <StreakItem
          icon="trophy"
          iconColor="#FFD700"
          label="Longest"
          value={longestStreak}
          unit="days"
          highlight={false}
        />
        <StreakItem
          icon="star"
          iconColor="#4ADE80"
          label="Perfect"
          value={perfectStreak}
          unit="days"
          highlight={false}
        />
      </View>

      {/* Streak message */}
      <View style={styles.messageContainer}>
        {currentStreak === 0 ? (
          <Text style={styles.messageText}>
            <Ionicons name="information-circle" size={14} color="#888888" />{' '}
            Complete today's quests to start a streak
          </Text>
        ) : currentStreak >= longestStreak ? (
          <Text style={[styles.messageText, styles.messageHighlight]}>
            <Ionicons name="flame" size={14} color="#FFD700" /> New record! Keep going!
          </Text>
        ) : (
          <Text style={styles.messageText}>
            <Ionicons name="trending-up" size={14} color="#4ADE80" />{' '}
            {longestStreak - currentStreak} days until new record
          </Text>
        )}
      </View>
    </SystemWindow>
  )
}

interface StreakItemProps {
  icon: keyof typeof Ionicons.glyphMap
  iconColor: string
  label: string
  value: number
  unit: string
  highlight?: boolean
}

function StreakItem({ icon, iconColor, label, value, unit, highlight }: StreakItemProps) {
  return (
    <View style={[styles.streakItem, highlight && styles.streakItemHighlight]}>
      <View style={[styles.iconContainer, { backgroundColor: `${iconColor}20` }]}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <View style={styles.streakContent}>
        <Text style={styles.streakLabel}>{label}</Text>
        <View style={styles.streakValueRow}>
          <Text style={[styles.streakValue, highlight && styles.streakValueHighlight]}>
            {value}
          </Text>
          <Text style={styles.streakUnit}>{unit}</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  streakItem: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  streakItemHighlight: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  streakContent: {
    alignItems: 'center',
  },
  streakLabel: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#888888',
    marginBottom: 4,
  },
  streakValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  streakValue: {
    fontSize: 20,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  streakValueHighlight: {
    color: '#FF6B6B',
  },
  streakUnit: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#666666',
  },
  messageContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 6,
    alignItems: 'center',
  },
  messageText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#888888',
  },
  messageHighlight: {
    color: '#FFD700',
  },
})
