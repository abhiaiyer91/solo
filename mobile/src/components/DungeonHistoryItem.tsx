/**
 * DungeonHistoryItem - Display a completed dungeon in history
 */

import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface CompletedDungeon {
  id: string
  dungeonName: string
  rank: string
  xpEarned: number
  completedAt: string
}

interface DungeonHistoryItemProps {
  dungeon: CompletedDungeon
}

export function DungeonHistoryItem({ dungeon }: DungeonHistoryItemProps) {
  const rankColor = getRankColor(dungeon.rank)
  const completedDate = formatDate(dungeon.completedAt)

  return (
    <View style={styles.container}>
      <View style={[styles.rankBadge, { backgroundColor: `${rankColor}20`, borderColor: rankColor }]}>
        <Text style={[styles.rankText, { color: rankColor }]}>{dungeon.rank}</Text>
      </View>
      
      <View style={styles.info}>
        <Text style={styles.name}>{dungeon.dungeonName}</Text>
        <Text style={styles.date}>{completedDate}</Text>
      </View>

      <View style={styles.xpContainer}>
        <Ionicons name="flash" size={14} color="#00FF00" />
        <Text style={styles.xpValue}>+{dungeon.xpEarned}</Text>
      </View>
    </View>
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

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 8,
    marginBottom: 8,
    gap: 12,
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
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  date: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#666666',
    marginTop: 2,
  },
  xpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 255, 0, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  xpValue: {
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#00FF00',
  },
})
