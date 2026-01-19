/**
 * Dungeon Card Component (Mobile)
 * 
 * Displays a dungeon with touch-optimized interactions.
 */

import { View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native'

interface Dungeon {
  id: string
  name: string
  description: string
  levelRequired: number
  difficulty: 'easy' | 'medium' | 'hard' | 'nightmare'
  durationDays: number
  xpReward: number
  status: 'locked' | 'available' | 'active' | 'completed'
  progress?: number
}

interface DungeonCardProps {
  dungeon: Dungeon
  playerLevel: number
  onPress: () => void
}

export function DungeonCard({ dungeon, playerLevel, onPress }: DungeonCardProps) {
  const isLocked = dungeon.status === 'locked' || playerLevel < dungeon.levelRequired
  const isActive = dungeon.status === 'active'
  const isCompleted = dungeon.status === 'completed'

  const difficultyColors = {
    easy: '#22c55e',
    medium: '#eab308',
    hard: '#f97316',
    nightmare: '#ef4444',
  }

  const statusLabels = {
    locked: 'Locked',
    available: 'Enter',
    active: 'In Progress',
    completed: 'Completed',
  }

  return (
    <Pressable
      onPress={isLocked ? undefined : onPress}
      style={({ pressed }) => [
        styles.card,
        isLocked && styles.cardLocked,
        isActive && styles.cardActive,
        isCompleted && styles.cardCompleted,
        pressed && !isLocked && styles.cardPressed,
      ]}
    >
      {/* Difficulty Badge */}
      <View style={[styles.difficultyBadge, { backgroundColor: difficultyColors[dungeon.difficulty] + '20', borderColor: difficultyColors[dungeon.difficulty] }]}>
        <Text style={[styles.difficultyText, { color: difficultyColors[dungeon.difficulty] }]}>
          {dungeon.difficulty.toUpperCase()}
        </Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={[styles.name, isLocked && styles.textLocked]}>
          {dungeon.name}
        </Text>
        <Text style={[styles.description, isLocked && styles.textLocked]} numberOfLines={2}>
          {dungeon.description}
        </Text>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Level</Text>
            <Text style={[styles.statValue, playerLevel < dungeon.levelRequired && styles.statLocked]}>
              {dungeon.levelRequired}
            </Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Duration</Text>
            <Text style={styles.statValue}>{dungeon.durationDays}d</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>XP</Text>
            <Text style={[styles.statValue, styles.xpValue]}>{dungeon.xpReward}</Text>
          </View>
        </View>

        {/* Progress Bar (for active dungeons) */}
        {isActive && dungeon.progress !== undefined && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${dungeon.progress}%` }]} />
            </View>
            <Text style={styles.progressText}>{dungeon.progress}%</Text>
          </View>
        )}

        {/* Status Button */}
        <View style={[styles.statusButton, isActive && styles.statusButtonActive, isCompleted && styles.statusButtonCompleted]}>
          <Text style={[styles.statusButtonText, isCompleted && styles.statusButtonTextCompleted]}>
            {isLocked && playerLevel < dungeon.levelRequired
              ? `Unlocks at Level ${dungeon.levelRequired}`
              : statusLabels[dungeon.status]}
          </Text>
        </View>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2a4e',
    overflow: 'hidden',
    marginBottom: 12,
  },
  cardLocked: {
    opacity: 0.6,
  },
  cardActive: {
    borderColor: '#3b82f6',
    backgroundColor: '#1a1a3e',
  },
  cardCompleted: {
    borderColor: '#22c55e',
    backgroundColor: '#1a2e1a',
  },
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  difficultyBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  content: {
    padding: 16,
    paddingTop: 20,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 12,
  },
  textLocked: {
    color: '#6b7280',
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  stat: {
    flex: 1,
  },
  statLabel: {
    fontSize: 10,
    color: '#6b7280',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  statLocked: {
    color: '#ef4444',
  },
  xpValue: {
    color: '#3b82f6',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#2a2a4e',
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  statusButton: {
    backgroundColor: '#2a2a4e',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  statusButtonActive: {
    backgroundColor: '#3b82f620',
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  statusButtonCompleted: {
    backgroundColor: '#22c55e20',
    borderWidth: 1,
    borderColor: '#22c55e',
  },
  statusButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#9ca3af',
  },
  statusButtonTextCompleted: {
    color: '#22c55e',
  },
})
