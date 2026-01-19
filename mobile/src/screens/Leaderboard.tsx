/**
 * Leaderboard - Main leaderboard screen
 */

import React, { useState } from 'react'
import { View, Text, StyleSheet, ScrollView, RefreshControl, Alert, ActivityIndicator, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LeaderboardTabs } from '../components/LeaderboardTabs'
import { LeaderboardRow } from '../components/LeaderboardRow'
import { useLeaderboard, type LeaderboardType, type LeaderboardEntry } from '../hooks/useLeaderboard'

export function Leaderboard() {
  const [activeTab, setActiveTab] = useState<LeaderboardType>('weekly')
  const { leaderboard, currentUserEntry, total, isLoading, isRefetching, error, refresh } = useLeaderboard(activeTab)

  const handleRowPress = (entry: LeaderboardEntry) => {
    if (entry.isOptedOut) {
      Alert.alert('Private Profile', 'This player has opted out of public profile viewing.')
      return
    }
    Alert.alert(entry.userName || 'Hunter', `Level ${entry.level}\n${entry.totalXP.toLocaleString()} XP\n${entry.currentStreak} day streak`)
  }

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>[RANKINGS]</Text>
      <Text style={styles.subtitle}>
        {activeTab === 'weekly' && 'Weekly Season Leaderboard'}
        {activeTab === 'alltime' && 'All-Time Leaderboard'}
        {activeTab === 'friends' && `Friends Leaderboard (${total})`}
        {activeTab === 'guild' && 'Guild Leaderboard'}
      </Text>
    </View>
  )

  const renderCurrentUserPin = () => {
    if (!currentUserEntry || activeTab === 'guild') return null
    return (
      <View style={styles.pinnedSection}>
        <Text style={styles.pinnedLabel}>YOUR POSITION:</Text>
        <LeaderboardRow entry={currentUserEntry} showStreak={activeTab !== 'guild'} />
      </View>
    )
  }

  const renderLeaderboard = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00FF00" />
          <Text style={styles.loadingText}>Loading rankings...</Text>
        </View>
      )
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>Failed to load leaderboard</Text>
          <Pressable onPress={refresh} style={styles.retryButton}>
            <Text style={styles.retryText}>RETRY</Text>
          </Pressable>
        </View>
      )
    }

    if (leaderboard.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>{activeTab === 'friends' ? '👥' : '📊'}</Text>
          <Text style={styles.emptyText}>
            {activeTab === 'friends' ? 'No accountability partners yet.' : 'No rankings available'}
          </Text>
        </View>
      )
    }

    return (
      <View style={styles.listContainer}>
        {leaderboard.map((entry, index) => (
          <LeaderboardRow key={entry.userId || index} entry={entry} onPress={handleRowPress} showStreak={activeTab !== 'guild'} />
        ))}
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {renderHeader()}
      <LeaderboardTabs activeTab={activeTab} onTabChange={setActiveTab} friendCount={activeTab === 'friends' ? total : 0} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refresh} tintColor="#00FF00" colors={['#00FF00']} />}
      >
        {renderCurrentUserPin()}
        {renderLeaderboard()}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  header: { paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(0, 255, 0, 0.2)' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#00FF00', letterSpacing: 2 },
  subtitle: { fontSize: 14, color: '#888888', marginTop: 4 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 16 },
  pinnedSection: { marginBottom: 20 },
  pinnedLabel: { fontSize: 12, fontWeight: 'bold', color: '#00FF00', marginBottom: 8, letterSpacing: 1 },
  listContainer: { gap: 4 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  loadingText: { fontSize: 14, color: '#888888', marginTop: 16 },
  errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  errorIcon: { fontSize: 48, marginBottom: 16 },
  errorText: { fontSize: 16, color: '#FF6B6B', textAlign: 'center', marginBottom: 24 },
  retryButton: { backgroundColor: '#00FF00', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  retryText: { fontSize: 14, fontWeight: 'bold', color: '#000000' },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyText: { fontSize: 16, color: '#888888', textAlign: 'center', lineHeight: 24 },
})
