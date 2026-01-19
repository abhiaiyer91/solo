/**
 * LeaderboardTabs - Tab navigation for leaderboard types
 */

import React from 'react'
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native'
import type { LeaderboardType } from '../hooks/useLeaderboard'

interface Tab {
  type: LeaderboardType
  label: string
  icon: string
}

const TABS: Tab[] = [
  { type: 'weekly', label: 'Weekly', icon: '📅' },
  { type: 'alltime', label: 'All-Time', icon: '🏆' },
  { type: 'friends', label: 'Friends', icon: '👥' },
  { type: 'guild', label: 'Guilds', icon: '⚔️' },
]

interface LeaderboardTabsProps {
  activeTab: LeaderboardType
  onTabChange: (type: LeaderboardType) => void
  friendCount?: number
}

export function LeaderboardTabs({ activeTab, onTabChange, friendCount = 0 }: LeaderboardTabsProps) {
  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.type
          const isDisabled = tab.type === 'friends' && friendCount === 0

          return (
            <Pressable
              key={tab.type}
              onPress={() => onTabChange(tab.type)}
              disabled={isDisabled}
              style={({ pressed }) => [
                styles.tab,
                isActive && styles.activeTab,
                isDisabled && styles.disabledTab,
                pressed && !isDisabled && styles.pressedTab,
              ]}
            >
              <Text style={styles.icon}>{tab.icon}</Text>
              <Text style={[styles.label, isActive && styles.activeLabel, isDisabled && styles.disabledLabel]}>
                {tab.label}
              </Text>
              {tab.type === 'friends' && friendCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{friendCount}</Text>
                </View>
              )}
            </Pressable>
          )
        })}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.1)' },
  scrollContent: { paddingHorizontal: 8, paddingVertical: 12, gap: 8 },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  activeTab: { backgroundColor: 'rgba(0, 255, 0, 0.1)', borderColor: 'rgba(0, 255, 0, 0.4)', borderWidth: 2 },
  disabledTab: { opacity: 0.4 },
  pressedTab: { opacity: 0.7 },
  icon: { fontSize: 18 },
  label: { fontSize: 14, fontWeight: '600', color: '#CCCCCC' },
  activeLabel: { color: '#00FF00', fontWeight: 'bold' },
  disabledLabel: { color: '#666666' },
  badge: {
    backgroundColor: '#FF6B35',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    marginLeft: 4,
  },
  badgeText: { fontSize: 11, fontWeight: 'bold', color: '#FFFFFF' },
})
