/**
 * DailyXPSummary - Shows XP earned today
 */

import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

interface DailyXPSummaryProps {
  xpEarned: number
  xpPotential: number
  questsCompleted: number
  questsTotal: number
  streak?: number
}

export function DailyXPSummary({
  xpEarned,
  xpPotential,
  questsCompleted,
  questsTotal,
  streak,
}: DailyXPSummaryProps) {
  const xpProgress = Math.min(100, (xpEarned / xpPotential) * 100)

  return (
    <View style={styles.container}>
      {/* Main XP Display */}
      <View style={styles.mainRow}>
        <View style={styles.xpDisplay}>
          <Text style={styles.xpValue}>{xpEarned}</Text>
          <Text style={styles.xpLabel}>/ {xpPotential} XP</Text>
        </View>
        
        {streak !== undefined && streak > 0 && (
          <View style={styles.streakBadge}>
            <Text style={styles.streakIcon}>🔥</Text>
            <Text style={styles.streakValue}>{streak}</Text>
          </View>
        )}
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: `${xpProgress}%` },
            xpProgress >= 100 && styles.progressComplete,
          ]}
        />
      </View>

      {/* Quest Count */}
      <View style={styles.questRow}>
        <Text style={styles.questText}>
          QUESTS: {questsCompleted}/{questsTotal}
        </Text>
        {questsCompleted === questsTotal && questsTotal > 0 && (
          <Text style={styles.perfectText}>PERFECT DAY!</Text>
        )}
      </View>
    </View>
  )
}

/**
 * Compact version for header
 */
export function DailyXPCompact({
  xpEarned,
  streak,
}: {
  xpEarned: number
  streak?: number
}) {
  return (
    <View style={styles.compactContainer}>
      <Text style={styles.compactXP}>{xpEarned} XP</Text>
      {streak !== undefined && streak > 0 && (
        <View style={styles.compactStreak}>
          <Text style={styles.compactStreakIcon}>🔥</Text>
          <Text style={styles.compactStreakValue}>{streak}</Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  mainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  xpDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  xpValue: {
    fontSize: 32,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#FFD700',
  },
  xpLabel: {
    fontSize: 16,
    fontFamily: 'monospace',
    color: '#888888',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 100, 0, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  streakIcon: {
    fontSize: 16,
  },
  streakValue: {
    fontSize: 16,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#FF6600',
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 3,
  },
  progressComplete: {
    backgroundColor: '#00FF00',
  },
  questRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  questText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#888888',
  },
  perfectText: {
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#00FF00',
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  compactXP: {
    fontSize: 14,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#FFD700',
  },
  compactStreak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  compactStreakIcon: {
    fontSize: 12,
  },
  compactStreakValue: {
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#FF6600',
  },
})
