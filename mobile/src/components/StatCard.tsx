/**
 * StatCard - Individual stat display with breakdown
 * Shows stat value, progress bar, and expandable details
 */

import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import {
  type StatType,
  type StatBreakdown,
  type StatMilestone,
  getStatColor,
  getStatIcon,
  getStatLabel,
} from '@/hooks/useStats'

interface StatCardProps {
  stat: StatType
  value: number
  breakdown?: StatBreakdown
  milestone?: StatMilestone
  isExpanded?: boolean
  onPress?: () => void
}

export function StatCard({
  stat,
  value,
  breakdown,
  milestone,
  isExpanded,
  onPress,
}: StatCardProps) {
  const color = getStatColor(stat)
  const icon = getStatIcon(stat)
  const label = getStatLabel(stat)
  const percentage = Math.min(100, value)

  return (
    <Pressable
      style={[styles.container, { borderColor: `${color}30` }]}
      onPress={onPress}
    >
      {/* Header Row */}
      <View style={styles.header}>
        <View style={styles.statInfo}>
          <Text style={styles.statIcon}>{icon}</Text>
          <View>
            <Text style={[styles.statName, { color }]}>{label}</Text>
            <Text style={styles.statAbbrev}>{stat}</Text>
          </View>
        </View>
        <View style={styles.valueContainer}>
          <Text style={[styles.statValue, { color }]}>{value.toFixed(1)}</Text>
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={16}
            color="#888888"
          />
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${percentage}%`, backgroundColor: color },
            ]}
          />
        </View>
        {milestone && (
          <Text style={styles.benchmarkLabel}>
            {milestone.current.label}
          </Text>
        )}
      </View>

      {/* Expanded Details */}
      {isExpanded && breakdown && (
        <View style={styles.expandedContent}>
          <View style={styles.divider} />

          {/* Breakdown */}
          <View style={styles.breakdownSection}>
            <Text style={styles.breakdownTitle}>{'>'} BREAKDOWN</Text>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Baseline</Text>
              <Text style={styles.breakdownValue}>+{breakdown.breakdown.baseline}</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Activity</Text>
              <Text style={styles.breakdownValue}>+{breakdown.breakdown.activity}</Text>
            </View>
            {breakdown.breakdown.streak > 0 && (
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Streak Bonus</Text>
                <Text style={styles.breakdownValue}>+{breakdown.breakdown.streak}</Text>
              </View>
            )}
          </View>

          {/* Current Benchmark */}
          {milestone && (
            <View style={styles.benchmarkSection}>
              <Text style={styles.breakdownTitle}>{'>'} CURRENT LEVEL</Text>
              <Text style={[styles.benchmarkName, { color }]}>
                {milestone.current.label}
              </Text>
              <Text style={styles.benchmarkDescription}>
                {milestone.current.realWorldEquivalent}
              </Text>
            </View>
          )}

          {/* Next Milestone */}
          {milestone?.next && (
            <View style={styles.nextMilestoneSection}>
              <Text style={styles.breakdownTitle}>{'>'} NEXT MILESTONE</Text>
              <View style={styles.nextMilestoneRow}>
                <Text style={styles.nextMilestoneName}>
                  {milestone.next.label}
                </Text>
                <Text style={styles.nextMilestoneValue}>
                  {milestone.next.value} pts
                </Text>
              </View>
              <View style={styles.nextMilestoneProgress}>
                <View style={styles.nextProgressBar}>
                  <View
                    style={[
                      styles.nextProgressFill,
                      {
                        width: `${milestone.progressToNext}%`,
                        backgroundColor: color,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.progressPercent}>
                  {milestone.progressToNext}%
                </Text>
              </View>
            </View>
          )}

          {/* How to Improve */}
          {breakdown.howToImprove && breakdown.howToImprove.length > 0 && (
            <View style={styles.improvementSection}>
              <Text style={styles.breakdownTitle}>{'>'} HOW TO IMPROVE</Text>
              {breakdown.howToImprove.slice(0, 3).map((tip, index) => (
                <View key={index} style={styles.tipRow}>
                  <Ionicons name="arrow-forward" size={12} color={color} />
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statIcon: {
    fontSize: 24,
  },
  statName: {
    fontSize: 14,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  statAbbrev: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#888888',
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  progressContainer: {
    marginTop: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  benchmarkLabel: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#888888',
    marginTop: 4,
    textAlign: 'right',
  },
  expandedContent: {
    marginTop: 12,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 12,
  },
  breakdownSection: {
    marginBottom: 16,
  },
  breakdownTitle: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#00FF00',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  breakdownLabel: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#888888',
  },
  breakdownValue: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#00FF00',
    fontWeight: 'bold',
  },
  benchmarkSection: {
    marginBottom: 16,
  },
  benchmarkName: {
    fontSize: 16,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  benchmarkDescription: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#888888',
  },
  nextMilestoneSection: {
    marginBottom: 16,
  },
  nextMilestoneRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  nextMilestoneName: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#CCCCCC',
    fontWeight: 'bold',
  },
  nextMilestoneValue: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#888888',
  },
  nextMilestoneProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nextProgressBar: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  nextProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressPercent: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#888888',
    width: 35,
    textAlign: 'right',
  },
  improvementSection: {
    marginBottom: 8,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  tipText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#CCCCCC',
    flex: 1,
  },
})
