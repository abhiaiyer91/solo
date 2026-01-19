/**
 * QuestCard - Mobile quest card component
 * Displays quest progress, status, and XP reward
 */

import React from 'react'
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native'

export type QuestStatus = 'ACTIVE' | 'COMPLETED' | 'FAILED' | 'LOCKED'
export type QuestSource = 'MANUAL' | 'HEALTHKIT' | 'GOOGLE_FIT'

export interface Quest {
  id: string
  title: string
  description?: string
  category: 'STEPS' | 'WORKOUT' | 'NUTRITION' | 'MINDSET' | 'RECOVERY'
  status: QuestStatus
  progress: number
  target: number
  unit: string
  xpReward: number
  source?: QuestSource
  isAutoTracked: boolean
  completedAt?: string
}

interface QuestCardProps {
  quest: Quest
  onPress?: (quest: Quest) => void
  onComplete?: (quest: Quest) => void
  isLoading?: boolean
}

export function QuestCard({
  quest,
  onPress,
  onComplete,
  isLoading,
}: QuestCardProps) {
  const progressPercent = Math.min(100, (quest.progress / quest.target) * 100)
  const isComplete = quest.status === 'COMPLETED'

  const getCategoryIcon = (): string => {
    switch (quest.category) {
      case 'STEPS': return '👟'
      case 'WORKOUT': return '💪'
      case 'NUTRITION': return '🥗'
      case 'MINDSET': return '🧠'
      case 'RECOVERY': return '😴'
      default: return '⭐'
    }
  }

  return (
    <Pressable
      onPress={() => onPress?.(quest)}
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
        isComplete && styles.completed,
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.icon}>{getCategoryIcon()}</Text>
          <Text style={[styles.title, isComplete && styles.completedText]}>
            {quest.title}
          </Text>
        </View>
        <Text style={[styles.xp, isComplete && styles.completedXp]}>
          +{quest.xpReward} XP
        </Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${progressPercent}%` },
              isComplete && styles.progressComplete,
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {formatProgress(quest.progress, quest.unit)} / {formatProgress(quest.target, quest.unit)}
        </Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        {quest.isAutoTracked ? (
          <View style={styles.autoTrackBadge}>
            <Text style={styles.autoTrackText}>
              {quest.source === 'HEALTHKIT' ? '❤️ HealthKit' : '📊 Auto'}
            </Text>
          </View>
        ) : !isComplete ? (
          <Pressable
            onPress={() => onComplete?.(quest)}
            disabled={isLoading}
            style={[styles.completeButton, isLoading && styles.buttonDisabled]}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <Text style={styles.completeButtonText}>COMPLETE</Text>
            )}
          </Pressable>
        ) : (
          <View style={styles.completedBadge}>
            <Text style={styles.completedBadgeText}>✓ DONE</Text>
          </View>
        )}
      </View>
    </Pressable>
  )
}

function formatProgress(value: number, unit: string): string {
  if (unit === 'steps' && value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`
  }
  return `${Math.round(value)}${unit ? ` ${unit}` : ''}`
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 0, 0.2)',
    borderRadius: 8,
    padding: 16,
    marginVertical: 6,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  completed: {
    borderColor: 'rgba(0, 255, 0, 0.5)',
    backgroundColor: 'rgba(0, 255, 0, 0.05)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  icon: {
    fontSize: 20,
  },
  title: {
    fontSize: 16,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
  },
  completedText: {
    color: '#00FF00',
  },
  xp: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#FFD700',
    fontWeight: 'bold',
  },
  completedXp: {
    color: '#00FF00',
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00BFFF',
    borderRadius: 4,
  },
  progressComplete: {
    backgroundColor: '#00FF00',
  },
  progressText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#888888',
    textAlign: 'right',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  autoTrackBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  autoTrackText: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#888888',
  },
  completeButton: {
    backgroundColor: '#00FF00',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    minWidth: 100,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  completeButtonText: {
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#000000',
  },
  completedBadge: {
    backgroundColor: 'rgba(0, 255, 0, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  completedBadgeText: {
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#00FF00',
  },
})
