/**
 * GuildCard - Guild list item component
 */

import React from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import type { Guild } from '../hooks/useGuild'

interface GuildCardProps {
  guild: Guild
  onPress?: () => void
  canJoin?: boolean
  playerLevel?: number
}

export function GuildCard({ guild, onPress, canJoin = false, playerLevel = 1 }: GuildCardProps) {
  const meetsLevel = playerLevel >= guild.minLevel
  const hasSpace = guild.memberCount < guild.maxMembers

  const formatXP = (xp: number): string => {
    if (xp >= 1000000) return `${(xp / 1000000).toFixed(1)}M`
    if (xp >= 1000) return `${(xp / 1000).toFixed(1)}k`
    return xp.toString()
  }

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.container, pressed && styles.pressed]}>
      <View style={styles.header}>
        <Text style={styles.name} numberOfLines={1}>{guild.name}</Text>
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>Lv {guild.minLevel}+</Text>
        </View>
      </View>

      {guild.description && (
        <Text style={styles.description} numberOfLines={2}>{guild.description}</Text>
      )}

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{guild.memberCount}/{guild.maxMembers}</Text>
          <Text style={styles.statLabel}>Members</Text>
        </View>
        <View style={styles.stat}>
          <Text style={[styles.statValue, styles.xpValue]}>{formatXP(guild.weeklyXP)}</Text>
          <Text style={styles.statLabel}>Weekly</Text>
        </View>
        <View style={styles.stat}>
          <Text style={[styles.statValue, styles.xpValue]}>{formatXP(guild.totalXP)}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
      </View>

      {canJoin && (
        <View style={styles.footer}>
          {!meetsLevel ? (
            <Text style={styles.requirementText}>Requires Level {guild.minLevel}</Text>
          ) : !hasSpace ? (
            <Text style={styles.fullText}>Guild Full</Text>
          ) : (
            <Text style={styles.joinText}>Tap to view</Text>
          )}
        </View>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2a4e',
    padding: 16,
    marginBottom: 12,
  },
  pressed: { opacity: 0.8 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  name: { fontSize: 18, fontWeight: 'bold', color: '#ffffff', flex: 1 },
  levelBadge: { backgroundColor: '#2a2a4e', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  levelText: { fontSize: 12, fontWeight: 'bold', color: '#3b82f6' },
  description: { fontSize: 14, color: '#9ca3af', marginBottom: 12, lineHeight: 20 },
  stats: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 8 },
  stat: { alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: 'bold', color: '#ffffff' },
  xpValue: { color: '#3b82f6' },
  statLabel: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  footer: { marginTop: 12, alignItems: 'center' },
  requirementText: { fontSize: 12, color: '#ef4444' },
  fullText: { fontSize: 12, color: '#f59e0b' },
  joinText: { fontSize: 12, color: '#3b82f6' },
})
