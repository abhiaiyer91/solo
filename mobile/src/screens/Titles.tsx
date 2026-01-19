/**
 * Titles - Title collection screen
 */

import React, { useState, useMemo } from 'react'
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTitles, useSetActiveTitle, sortTitles, filterTitles, Title } from '../hooks/useTitles'
import { TitleCard } from '../components/TitleCard'
import { TitleDetailModal } from '../components/TitleDetailModal'

type FilterType = 'all' | 'unlocked' | 'locked'
type SortType = 'rarity' | 'recency' | 'alphabetical'

interface TitlesProps {
  onClose?: () => void
}

export function Titles({ onClose }: TitlesProps) {
  const { data, isLoading, refetch } = useTitles()
  const setActiveTitleMutation = useSetActiveTitle()

  const [filter, setFilter] = useState<FilterType>('all')
  const [sort, setSort] = useState<SortType>('rarity')
  const [selectedTitle, setSelectedTitle] = useState<Title | null>(null)

  const filteredAndSortedTitles = useMemo(() => {
    if (!data?.titles) return []
    const filtered = filterTitles(data.titles, filter)
    return sortTitles(filtered, sort)
  }, [data?.titles, filter, sort])

  const handleEquip = async (titleId: string) => {
    await setActiveTitleMutation.mutateAsync(titleId)
    setSelectedTitle(null)
    refetch()
  }

  const handleUnequip = async () => {
    await setActiveTitleMutation.mutateAsync(null)
    setSelectedTitle(null)
    refetch()
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Loading titles...</Text>
        </View>
      </SafeAreaView>
    )
  }

  const earnedCount = data?.totalEarned ?? 0
  const totalCount = data?.totalAvailable ?? 0

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.title}>Title Collection</Text>
            <Text style={styles.subtitle}>
              {earnedCount} of {totalCount} titles earned
            </Text>
          </View>
          {onClose && (
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>×</Text>
            </Pressable>
          )}
        </View>

        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(earnedCount / totalCount) * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>{Math.round((earnedCount / totalCount) * 100)}%</Text>
        </View>
      </View>

      {/* Active Title */}
      {data?.activeTitle && (
        <View style={styles.activeTitleContainer}>
          <Text style={styles.activeTitleLabel}>Currently Equipped</Text>
          <TitleCard title={data.activeTitle} compact onPress={() => setSelectedTitle(data.activeTitle)} />
        </View>
      )}

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <View style={styles.filterRow}>
          {(['all', 'unlocked', 'locked'] as FilterType[]).map((f) => (
            <Pressable
              key={f}
              style={[styles.filterButton, filter === f && styles.filterButtonActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.filterButtonText, filter === f && styles.filterButtonTextActive]}>
                {f === 'all' ? 'All' : f === 'unlocked' ? 'Unlocked' : 'Locked'}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.sortContainer}>
          <Text style={styles.sortLabel}>Sort:</Text>
          <Pressable
            style={styles.sortButton}
            onPress={() => {
              const sortOptions: SortType[] = ['rarity', 'recency', 'alphabetical']
              const currentIndex = sortOptions.indexOf(sort)
              setSort(sortOptions[(currentIndex + 1) % sortOptions.length])
            }}
          >
            <Text style={styles.sortButtonText}>
              {sort === 'rarity' ? '⭐ Rarity' : sort === 'recency' ? '🕐 Recent' : '🔤 A-Z'}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Title Grid */}
      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {filteredAndSortedTitles.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📜</Text>
            <Text style={styles.emptyText}>
              {filter === 'locked' ? 'All titles unlocked!' : filter === 'unlocked' ? 'No titles unlocked yet' : 'No titles found'}
            </Text>
          </View>
        ) : (
          filteredAndSortedTitles.map((title) => (
            <TitleCard key={title.id} title={title} onPress={() => setSelectedTitle(title)} />
          ))
        )}
      </ScrollView>

      {/* Detail Modal */}
      <TitleDetailModal
        title={selectedTitle}
        visible={!!selectedTitle}
        onClose={() => setSelectedTitle(null)}
        onEquip={handleEquip}
        onUnequip={handleUnequip}
        isLoading={setActiveTitleMutation.isPending}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1e',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a4e',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2a2a4e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: '#ffffff',
    lineHeight: 24,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#2a2a4e',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  activeTitleContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a4e',
  },
  activeTitleLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  filtersContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a4e',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#1a1a2e',
    borderWidth: 1,
    borderColor: '#2a2a4e',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#3b82f620',
    borderColor: '#3b82f6',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6b7280',
  },
  filterButtonTextActive: {
    color: '#3b82f6',
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sortLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  sortButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#2a2a4e',
  },
  sortButtonText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    padding: 48,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#9ca3af',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#9ca3af',
  },
})
