/**
 * Dungeon List Component (Mobile)
 * 
 * Displays all available dungeons in a scrollable list.
 */

import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native'
import { useState, useCallback } from 'react'
import { DungeonCard } from './DungeonCard'

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

interface DungeonListProps {
  dungeons: Dungeon[]
  playerLevel: number
  onDungeonPress: (dungeon: Dungeon) => void
  onRefresh?: () => Promise<void>
  ListHeaderComponent?: React.ReactElement
}

export function DungeonList({
  dungeons,
  playerLevel,
  onDungeonPress,
  onRefresh,
  ListHeaderComponent,
}: DungeonListProps) {
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = useCallback(async () => {
    if (!onRefresh) return
    setRefreshing(true)
    await onRefresh()
    setRefreshing(false)
  }, [onRefresh])

  const renderDungeon = useCallback(
    ({ item }: { item: Dungeon }) => (
      <DungeonCard
        dungeon={item}
        playerLevel={playerLevel}
        onPress={() => onDungeonPress(item)}
      />
    ),
    [playerLevel, onDungeonPress]
  )

  const keyExtractor = useCallback((item: Dungeon) => item.id, [])

  if (dungeons.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🏰</Text>
        <Text style={styles.emptyTitle}>No Dungeons Available</Text>
        <Text style={styles.emptySubtitle}>
          Level up to unlock new dungeons and challenges
        </Text>
      </View>
    )
  }

  // Group dungeons by status
  const activeDungeons = dungeons.filter(d => d.status === 'active')
  const availableDungeons = dungeons.filter(d => d.status === 'available')
  const completedDungeons = dungeons.filter(d => d.status === 'completed')
  const lockedDungeons = dungeons.filter(d => d.status === 'locked')

  const sections = [
    { title: 'Active', data: activeDungeons },
    { title: 'Available', data: availableDungeons },
    { title: 'Completed', data: completedDungeons },
    { title: 'Locked', data: lockedDungeons },
  ].filter(section => section.data.length > 0)

  return (
    <FlatList
      data={dungeons}
      renderItem={renderDungeon}
      keyExtractor={keyExtractor}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={ListHeaderComponent}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#3b82f6"
          />
        ) : undefined
      }
    />
  )
}

/**
 * Active Dungeon Progress Summary
 */
interface ActiveDungeonSummaryProps {
  dungeon: Dungeon
  onPress: () => void
}

export function ActiveDungeonSummary({ dungeon, onPress }: ActiveDungeonSummaryProps) {
  return (
    <View style={summaryStyles.container}>
      <Text style={summaryStyles.label}>ACTIVE DUNGEON</Text>
      
      <View style={summaryStyles.card}>
        <View style={summaryStyles.header}>
          <Text style={summaryStyles.name}>{dungeon.name}</Text>
          <Text style={summaryStyles.progress}>{dungeon.progress ?? 0}%</Text>
        </View>
        
        <View style={summaryStyles.progressBar}>
          <View style={[summaryStyles.progressFill, { width: `${dungeon.progress ?? 0}%` }]} />
        </View>
        
        <Text style={summaryStyles.xp}>
          Reward: <Text style={summaryStyles.xpValue}>{dungeon.xpReward} XP</Text>
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  list: {
    padding: 16,
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#9ca3af',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
})

const summaryStyles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  label: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#3b82f6',
    letterSpacing: 1,
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#1a1a3e',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3b82f6',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  progress: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#2a2a4e',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 4,
  },
  xp: {
    fontSize: 12,
    color: '#9ca3af',
  },
  xpValue: {
    color: '#3b82f6',
    fontWeight: 'bold',
  },
})
