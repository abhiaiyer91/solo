/**
 * Dungeons Screen - Browse and enter dungeons
 */

import React, { useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
  Modal,
  ActivityIndicator,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { DungeonCard } from '@/components/DungeonCard'
import { ActiveDungeon } from '@/components/ActiveDungeon'
import { DungeonHistoryItem } from '@/components/DungeonHistoryItem'
import { SystemWindow } from '@/components/SystemWindow'
import { usePlayer } from '@/hooks/usePlayer'
import { useDungeons } from '@/hooks/useDungeons'

interface EntryModalState {
  visible: boolean
  dungeon: {
    id: string
    name: string
    rank: string
    timeLimit: number
    xpReward: number
  } | null
}

export default function DungeonsScreen() {
  const router = useRouter()
  const [refreshing, setRefreshing] = useState(false)
  const [entryModal, setEntryModal] = useState<EntryModalState>({
    visible: false,
    dungeon: null,
  })

  const { data: player } = usePlayer()
  const {
    dungeons,
    activeDungeon,
    completedDungeons,
    totalCleared,
    isLoading,
    refetch,
    startDungeon,
    isStarting,
  } = useDungeons()

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await refetch()
    setRefreshing(false)
  }, [refetch])

  const handleDungeonPress = (dungeon: typeof dungeons[0]) => {
    if (activeDungeon) {
      // Can't start new dungeon while one is active
      return
    }
    setEntryModal({
      visible: true,
      dungeon: {
        id: dungeon.id,
        name: dungeon.name,
        rank: dungeon.rank,
        timeLimit: dungeon.timeLimit,
        xpReward: dungeon.xpReward,
      },
    })
  }

  const handleConfirmEntry = () => {
    if (entryModal.dungeon) {
      startDungeon(entryModal.dungeon.id)
      setEntryModal({ visible: false, dungeon: null })
    }
  }

  const playerLevel = player?.level ?? 1

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#00FF00" />
          </Pressable>
          <Text style={styles.headerTitle}>{'>'} DUNGEONS</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00FF00" />
          <Text style={styles.loadingText}>Scanning dungeons...</Text>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#00FF00" />
        </Pressable>
        <Text style={styles.headerTitle}>{'>'} DUNGEONS</Text>
        <View style={styles.headerRight}>
          <View style={styles.clearedBadge}>
            <Ionicons name="trophy" size={14} color="#FFD700" />
            <Text style={styles.clearedText}>{totalCleared}</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#00FF00"
          />
        }
      >
        {/* Stats Bar */}
        <View style={styles.statsBar}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalCleared}</Text>
            <Text style={styles.statLabel}>Cleared</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{dungeons.length}</Text>
            <Text style={styles.statLabel}>Available</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>LVL {playerLevel}</Text>
            <Text style={styles.statLabel}>Your Level</Text>
          </View>
        </View>

        {/* Active Dungeon */}
        {activeDungeon && (
          <ActiveDungeon
            dungeon={activeDungeon}
            onAbandon={() => {}}
          />
        )}

        {/* Available Dungeons */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{'>'} AVAILABLE DUNGEONS</Text>
          {dungeons.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="lock-closed" size={32} color="#444" />
              <Text style={styles.emptyText}>No dungeons available</Text>
              <Text style={styles.emptySubtext}>Level up to unlock more</Text>
            </View>
          ) : (
            dungeons.map((dungeon) => (
              <DungeonCard
                key={dungeon.id}
                dungeon={{
                  id: dungeon.id,
                  name: dungeon.name,
                  description: dungeon.description || '',
                  levelRequired: dungeon.requirements?.level ?? 1,
                  difficulty: getRankDifficulty(dungeon.rank),
                  durationDays: Math.ceil(dungeon.timeLimit / 24),
                  xpReward: dungeon.xpReward,
                  status: activeDungeon
                    ? 'locked'
                    : playerLevel >= (dungeon.requirements?.level ?? 1)
                    ? 'available'
                    : 'locked',
                }}
                playerLevel={playerLevel}
                onPress={() => handleDungeonPress(dungeon)}
              />
            ))
          )}
        </View>

        {/* Completed Dungeons */}
        {completedDungeons.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{'>'} DUNGEON HISTORY</Text>
            {completedDungeons.slice(0, 5).map((completed) => (
              <DungeonHistoryItem
                key={completed.id}
                dungeon={completed}
              />
            ))}
          </View>
        )}

        {/* Bottom spacing */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Entry Modal */}
      <Modal
        visible={entryModal.visible}
        animationType="fade"
        transparent
        onRequestClose={() => setEntryModal({ visible: false, dungeon: null })}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>ENTER DUNGEON</Text>
            
            {entryModal.dungeon && (
              <>
                <Text style={styles.dungeonName}>{entryModal.dungeon.name}</Text>
                
                <View style={styles.modalStats}>
                  <View style={styles.modalStatItem}>
                    <Text style={styles.modalStatLabel}>Rank</Text>
                    <Text style={[styles.modalStatValue, { color: getRankColor(entryModal.dungeon.rank) }]}>
                      {entryModal.dungeon.rank}
                    </Text>
                  </View>
                  <View style={styles.modalStatItem}>
                    <Text style={styles.modalStatLabel}>Time Limit</Text>
                    <Text style={styles.modalStatValue}>{entryModal.dungeon.timeLimit}h</Text>
                  </View>
                  <View style={styles.modalStatItem}>
                    <Text style={styles.modalStatLabel}>Reward</Text>
                    <Text style={[styles.modalStatValue, styles.xpValue]}>
                      {entryModal.dungeon.xpReward} XP
                    </Text>
                  </View>
                </View>

                <View style={styles.warningBox}>
                  <Ionicons name="warning" size={18} color="#FBBF24" />
                  <Text style={styles.warningText}>
                    Starting a dungeon locks you into its quests. You cannot start another dungeon until this one is completed or abandoned.
                  </Text>
                </View>
              </>
            )}

            <View style={styles.modalButtons}>
              <Pressable
                style={styles.cancelButton}
                onPress={() => setEntryModal({ visible: false, dungeon: null })}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.confirmButton, isStarting && styles.buttonDisabled]}
                onPress={handleConfirmEntry}
                disabled={isStarting}
              >
                {isStarting ? (
                  <ActivityIndicator size="small" color="#000" />
                ) : (
                  <Text style={styles.confirmButtonText}>Enter</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

function getRankDifficulty(rank: string): 'easy' | 'medium' | 'hard' | 'nightmare' {
  switch (rank) {
    case 'E': return 'easy'
    case 'D': return 'medium'
    case 'C': return 'hard'
    case 'B': case 'A': case 'S': return 'nightmare'
    default: return 'medium'
  }
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
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 255, 0, 0.2)',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#00FF00',
  },
  headerRight: {
    width: 40,
  },
  clearedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  clearedText: {
    fontSize: 14,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#FFD700',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#888888',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 16,
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginHorizontal: 16,
    backgroundColor: 'rgba(0, 255, 0, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 0, 0.2)',
    borderRadius: 8,
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#00FF00',
  },
  statLabel: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#666666',
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#00FF00',
    marginBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#888888',
    marginTop: 8,
  },
  emptySubtext: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#666666',
    marginTop: 4,
  },
  bottomSpacer: {
    height: 100,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 0, 0.3)',
    borderRadius: 12,
    padding: 24,
  },
  modalTitle: {
    fontSize: 14,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#00FF00',
    textAlign: 'center',
    marginBottom: 16,
  },
  dungeonName: {
    fontSize: 20,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  modalStatItem: {
    alignItems: 'center',
  },
  modalStatLabel: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#666666',
    marginBottom: 4,
  },
  modalStatValue: {
    fontSize: 18,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  xpValue: {
    color: '#00FF00',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    borderRadius: 8,
    marginBottom: 24,
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#FBBF24',
    lineHeight: 18,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#888888',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: '#00FF00',
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  confirmButtonText: {
    fontSize: 14,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#000000',
  },
})
