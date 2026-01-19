/**
 * QuestList - Container for quest cards
 */

import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
} from 'react-native'
import { QuestCard, type Quest } from './QuestCard'

interface QuestListProps {
  quests: Quest[]
  isLoading?: boolean
  onQuestPress?: (quest: Quest) => void
  onQuestComplete?: (quest: Quest) => void
  completingQuestId?: string | null
}

export function QuestList({
  quests,
  isLoading,
  onQuestPress,
  onQuestComplete,
  completingQuestId,
}: QuestListProps) {
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00FF00" />
        <Text style={styles.loadingText}>Loading quests...</Text>
      </View>
    )
  }

  if (quests.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📜</Text>
        <Text style={styles.emptyTitle}>No Active Quests</Text>
        <Text style={styles.emptyText}>
          Check back tomorrow for new challenges
        </Text>
      </View>
    )
  }

  // Separate active and completed quests
  const activeQuests = quests.filter(q => q.status !== 'COMPLETED')
  const completedQuests = quests.filter(q => q.status === 'COMPLETED')

  return (
    <View style={styles.container}>
      {/* Active Quests */}
      {activeQuests.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {'>'} ACTIVE QUESTS ({activeQuests.length})
          </Text>
          {activeQuests.map(quest => (
            <QuestCard
              key={quest.id}
              quest={quest}
              onPress={onQuestPress}
              onComplete={onQuestComplete}
              isLoading={completingQuestId === quest.id}
            />
          ))}
        </View>
      )}

      {/* Completed Quests */}
      {completedQuests.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {'>'} COMPLETED ({completedQuests.length})
          </Text>
          {completedQuests.map(quest => (
            <QuestCard
              key={quest.id}
              quest={quest}
              onPress={onQuestPress}
            />
          ))}
        </View>
      )}
    </View>
  )
}

/**
 * Compact quest list for dashboard
 */
export function QuestListCompact({
  quests,
  maxItems = 3,
}: {
  quests: Quest[]
  maxItems?: number
}) {
  const displayQuests = quests.slice(0, maxItems)
  const remainingCount = quests.length - maxItems

  return (
    <View style={styles.compactContainer}>
      {displayQuests.map(quest => (
        <CompactQuestRow key={quest.id} quest={quest} />
      ))}
      {remainingCount > 0 && (
        <Text style={styles.remainingText}>
          +{remainingCount} more quest{remainingCount > 1 ? 's' : ''}
        </Text>
      )}
    </View>
  )
}

function CompactQuestRow({ quest }: { quest: Quest }) {
  const progress = Math.round((quest.progress / quest.target) * 100)
  const isComplete = quest.status === 'COMPLETED'

  return (
    <View style={styles.compactRow}>
      <View style={styles.compactInfo}>
        <Text style={[styles.compactTitle, isComplete && styles.compactComplete]}>
          {quest.title}
        </Text>
        <View style={styles.compactProgress}>
          <View
            style={[
              styles.compactProgressFill,
              { width: `${Math.min(100, progress)}%` },
              isComplete && styles.compactProgressComplete,
            ]}
          />
        </View>
      </View>
      <Text style={[styles.compactPercent, isComplete && styles.compactComplete]}>
        {progress}%
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#888888',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#888888',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#00FF00',
    marginBottom: 12,
  },
  compactContainer: {
    gap: 8,
  },
  compactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  compactInfo: {
    flex: 1,
  },
  compactTitle: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  compactComplete: {
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
    backgroundColor: '#00BFFF',
    borderRadius: 2,
  },
  compactProgressComplete: {
    backgroundColor: '#00FF00',
  },
  compactPercent: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#888888',
    width: 40,
    textAlign: 'right',
  },
  remainingText: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#666666',
    textAlign: 'center',
    marginTop: 4,
  },
})
