/**
 * ActiveDungeon - Display current dungeon progress
 */

import React from 'react'
import { View, Text, StyleSheet, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { SystemWindow } from './SystemWindow'

interface ActiveDungeonData {
  id: string
  name: string
  rank: string
  progress: number
  timeRemaining: number
  questsCompleted: number
  totalQuests: number
}

interface ActiveDungeonProps {
  dungeon: ActiveDungeonData
  onAbandon: () => void
}

export function ActiveDungeon({ dungeon, onAbandon }: ActiveDungeonProps) {
  const timeHours = Math.floor(dungeon.timeRemaining)
  const timeMinutes = Math.round((dungeon.timeRemaining % 1) * 60)
  const rankColor = getRankColor(dungeon.rank)

  return (
    <SystemWindow 
      title="ACTIVE DUNGEON" 
      style={styles.container}
    >
      <View style={styles.header}>
        <View style={[styles.rankBadge, { backgroundColor: `${rankColor}20`, borderColor: rankColor }]}>
          <Text style={[styles.rankText, { color: rankColor }]}>{dungeon.rank}</Text>
        </View>
        <Text style={styles.dungeonName}>{dungeon.name}</Text>
      </View>

      {/* Progress */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Progress</Text>
          <Text style={styles.progressPercent}>{dungeon.progress}%</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${dungeon.progress}%` }]} />
        </View>
        <Text style={styles.questProgress}>
          {dungeon.questsCompleted} / {dungeon.totalQuests} quests completed
        </Text>
      </View>

      {/* Time Remaining */}
      <View style={styles.timeSection}>
        <Ionicons name="time-outline" size={18} color="#60A5FA" />
        <Text style={styles.timeLabel}>Time Remaining:</Text>
        <Text style={styles.timeValue}>
          {timeHours}h {timeMinutes}m
        </Text>
      </View>

      {/* Warning if low time */}
      {timeHours < 12 && (
        <View style={styles.warningBox}>
          <Ionicons name="warning" size={14} color="#FBBF24" />
          <Text style={styles.warningText}>Time running low! Complete remaining quests.</Text>
        </View>
      )}

      {/* Abandon Button */}
      <Pressable style={styles.abandonButton} onPress={onAbandon}>
        <Text style={styles.abandonText}>Abandon Dungeon</Text>
      </Pressable>
    </SystemWindow>
  )
}

function getRankColor(rank: string): string {
  switch (rank) {
    case 'E': return '#22C55E'
    case 'D': return '#3B82F6'
    case 'C': return '#A855F7'
    case 'B': return '#F59E0B'
    case 'A': return '#EF4444'
    case 'S': return '#FFD700'
    default: return '#888888'
  }
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderColor: 'rgba(59, 130, 246, 0.5)',
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontSize: 14,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  dungeonName: {
    fontSize: 16,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
  },
  progressSection: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#888888',
  },
  progressPercent: {
    fontSize: 14,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#00FF00',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 4,
  },
  questProgress: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#666666',
    textAlign: 'center',
  },
  timeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: 'rgba(96, 165, 250, 0.1)',
    borderRadius: 6,
    marginBottom: 12,
  },
  timeLabel: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#60A5FA',
    flex: 1,
  },
  timeValue: {
    fontSize: 16,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#60A5FA',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    borderRadius: 6,
    marginBottom: 12,
  },
  warningText: {
    flex: 1,
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#FBBF24',
  },
  abandonButton: {
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    marginTop: 8,
  },
  abandonText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#EF4444',
  },
})
