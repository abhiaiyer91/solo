/**
 * ProfileHeader - User profile display header
 */

import React from 'react'
import { View, Text, StyleSheet, Image } from 'react-native'

interface ProfileHeaderProps {
  name: string
  level: number
  totalXP: number
  currentStreak: number
  avatarUrl?: string
}

export function ProfileHeader({
  name,
  level,
  totalXP,
  currentStreak,
  avatarUrl,
}: ProfileHeaderProps) {
  return (
    <View style={styles.container}>
      {/* Avatar */}
      <View style={styles.avatarContainer}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {name.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>{level}</Text>
        </View>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.xp}>{totalXP.toLocaleString()} XP</Text>
        
        {currentStreak > 0 && (
          <View style={styles.streakRow}>
            <Text style={styles.streakIcon}>🔥</Text>
            <Text style={styles.streakValue}>{currentStreak} day streak</Text>
          </View>
        )}
      </View>
    </View>
  )
}

/**
 * Compact profile header for settings
 */
export function ProfileHeaderCompact({
  name,
  level,
}: {
  name: string
  level: number
}) {
  return (
    <View style={styles.compactContainer}>
      <View style={styles.compactAvatar}>
        <Text style={styles.compactAvatarText}>
          {name.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View>
        <Text style={styles.compactName}>{name}</Text>
        <Text style={styles.compactLevel}>Level {level}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 0, 0.2)',
    borderRadius: 12,
    padding: 20,
    gap: 16,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#00FF00',
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 255, 0, 0.2)',
    borderWidth: 2,
    borderColor: '#00FF00',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#00FF00',
  },
  levelBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#00FF00',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelText: {
    fontSize: 14,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#000',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 22,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  xp: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#FFD700',
    marginBottom: 8,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  streakIcon: {
    fontSize: 14,
  },
  streakValue: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#FF6600',
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  compactAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 255, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactAvatarText: {
    fontSize: 18,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#00FF00',
  },
  compactName: {
    fontSize: 16,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  compactLevel: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#888888',
  },
})
