/**
 * LeaderboardRow - Individual ranking row component
 */

import React from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import type { LeaderboardEntry } from '../hooks/useLeaderboard'

interface LeaderboardRowProps {
  entry: LeaderboardEntry
  onPress?: (entry: LeaderboardEntry) => void
  showStreak?: boolean
}

export function LeaderboardRow({ entry, onPress, showStreak = false }: LeaderboardRowProps) {
  const getRankDisplay = (): string => {
    if (!entry.rank) return '--'
    if (entry.rank === 1) return '🥇'
    if (entry.rank === 2) return '🥈'
    if (entry.rank === 3) return '🥉'
    return `#${entry.rank}`
  }

  const formatXP = (xp: number): string => {
    if (xp >= 1000000) return `${(xp / 1000000).toFixed(1)}M`
    if (xp >= 1000) return `${(xp / 1000).toFixed(1)}k`
    return xp.toString()
  }

  return (
    <Pressable
      onPress={() => onPress?.(entry)}
      style={({ pressed }) => [
        styles.container,
        entry.isCurrentUser && styles.highlighted,
        pressed && styles.pressed,
      ]}
      disabled={!onPress}
    >
      <View style={styles.rankContainer}>
        <Text style={[styles.rank, entry.isCurrentUser && styles.highlightedText]}>
          {getRankDisplay()}
        </Text>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.nameRow}>
          <Text
            style={[
              styles.name,
              entry.isCurrentUser && styles.highlightedText,
              entry.isOptedOut && styles.optedOutText,
            ]}
            numberOfLines={1}
          >
            {entry.isOptedOut ? '[Private]' : entry.userName || 'Hunter'}
          </Text>
          {entry.activeTitle && (
            <Text style={styles.title} numberOfLines={1}>
              {entry.activeTitle}
            </Text>
          )}
        </View>
        <View style={styles.statsRow}>
          <Text style={styles.level}>Lvl {entry.level}</Text>
          {showStreak && entry.currentStreak > 0 && (
            <>
              <Text style={styles.separator}>•</Text>
              <Text style={styles.streak}>🔥 {entry.currentStreak}</Text>
            </>
          )}
        </View>
      </View>

      <View style={styles.xpContainer}>
        <Text style={[styles.xp, entry.isCurrentUser && styles.highlightedXP]}>
          {formatXP(entry.totalXP)}
        </Text>
        <Text style={styles.xpLabel}>XP</Text>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginVertical: 4,
    gap: 12,
  },
  highlighted: {
    backgroundColor: 'rgba(0, 255, 0, 0.1)',
    borderColor: 'rgba(0, 255, 0, 0.3)',
    borderWidth: 2,
  },
  pressed: { opacity: 0.7 },
  rankContainer: { width: 50, alignItems: 'center' },
  rank: { fontSize: 18, fontWeight: 'bold', color: '#888888' },
  infoContainer: { flex: 1, gap: 4 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF', flex: 1 },
  title: { fontSize: 12, color: '#FFD700', fontStyle: 'italic' },
  optedOutText: { color: '#888888', fontStyle: 'italic' },
  highlightedText: { color: '#00FF00' },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  level: { fontSize: 13, color: '#00BFFF' },
  separator: { fontSize: 13, color: '#444444' },
  streak: { fontSize: 13, color: '#FF6B35' },
  xpContainer: { alignItems: 'flex-end', minWidth: 70 },
  xp: { fontSize: 18, fontWeight: 'bold', color: '#FFD700' },
  highlightedXP: { color: '#00FF00' },
  xpLabel: { fontSize: 11, color: '#888888' },
})
