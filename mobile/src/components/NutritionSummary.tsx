/**
 * NutritionSummary - Daily nutrition progress display
 */

import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

interface NutritionSummaryProps {
  totals: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
  targets: {
    calories: number | null
    protein: number | null
  }
  progress: {
    proteinPercent: number
    proteinGoalMet: boolean
  }
}

export function NutritionSummary({
  totals,
  targets,
  progress,
}: NutritionSummaryProps) {
  const proteinTarget = targets.protein ?? 150

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{'>'} FUEL</Text>
      </View>

      {/* Main Protein Progress */}
      <View style={styles.proteinSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.label}>Protein</Text>
          <Text style={styles.value}>
            {Math.round(totals.protein)}g / {proteinTarget}g
          </Text>
        </View>
        
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${Math.min(progress.proteinPercent, 100)}%` },
              progress.proteinGoalMet && styles.progressComplete,
            ]}
          />
        </View>
        
        {progress.proteinGoalMet && (
          <Text style={styles.goalMet}>✓ Target achieved</Text>
        )}
      </View>

      {/* Macro Summary */}
      <View style={styles.macroRow}>
        <MacroStat 
          label="Cals" 
          value={totals.calories} 
          target={targets.calories}
        />
        <MacroStat 
          label="Carbs" 
          value={`${Math.round(totals.carbs)}g`} 
        />
        <MacroStat 
          label="Fat" 
          value={`${Math.round(totals.fat)}g`} 
        />
      </View>
    </View>
  )
}

function MacroStat({
  label,
  value,
  target,
}: {
  label: string
  value: string | number
  target?: number | null
}) {
  return (
    <View style={styles.macroStat}>
      <Text style={styles.macroValue}>{value}</Text>
      <Text style={styles.macroLabel}>{label}</Text>
      {target && (
        <Text style={styles.macroTarget}>/ {target}</Text>
      )}
    </View>
  )
}

/**
 * Compact version for dashboard
 */
export function NutritionSummaryCompact({
  protein,
  target,
  goalMet,
}: {
  protein: number
  target: number
  goalMet: boolean
}) {
  const percent = Math.min(100, Math.round((protein / target) * 100))

  return (
    <View style={styles.compactContainer}>
      <View style={styles.compactHeader}>
        <Text style={styles.compactLabel}>Protein</Text>
        <Text style={[styles.compactValue, goalMet && styles.compactGoalMet]}>
          {Math.round(protein)}g / {target}g
        </Text>
      </View>
      <View style={styles.compactProgress}>
        <View
          style={[
            styles.compactProgressFill,
            { width: `${percent}%` },
            goalMet && styles.compactProgressComplete,
          ]}
        />
      </View>
    </View>
  )
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
    marginBottom: 12,
  },
  title: {
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#00FF00',
  },
  proteinSection: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#FFFFFF',
  },
  value: {
    fontSize: 16,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00FF00',
    borderRadius: 4,
  },
  progressComplete: {
    backgroundColor: '#FFD700',
  },
  goalMet: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#00FF00',
    marginTop: 4,
    textAlign: 'right',
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  macroStat: {
    alignItems: 'center',
  },
  macroValue: {
    fontSize: 18,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  macroLabel: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#666666',
    marginTop: 2,
  },
  macroTarget: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#444444',
  },
  compactContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 6,
    padding: 12,
  },
  compactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  compactLabel: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#888888',
  },
  compactValue: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#FFFFFF',
  },
  compactGoalMet: {
    color: '#00FF00',
  },
  compactProgress: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  compactProgressFill: {
    height: '100%',
    backgroundColor: '#00FF00',
    borderRadius: 2,
  },
  compactProgressComplete: {
    backgroundColor: '#FFD700',
  },
})
