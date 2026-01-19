/**
 * HardModeToggle - Toggle for hard mode feature
 * Only shows when unlocked (level 10+)
 */

import React from 'react'
import { View, Text, StyleSheet, Switch } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { usePlayer } from '@/hooks/usePlayer'
import { SystemWindow } from './SystemWindow'

interface HardModeStatus {
  isUnlocked: boolean
  isEnabled: boolean
  unlockLevel: number
  bonuses: {
    xpMultiplier: number
    streakBonus: number
  }
}

async function fetchHardModeStatus(): Promise<HardModeStatus> {
  return api.get<HardModeStatus>('/api/player/hard-mode')
}

async function toggleHardMode(enabled: boolean): Promise<HardModeStatus> {
  return api.post<HardModeStatus>('/api/player/hard-mode', { enabled })
}

export function HardModeToggle() {
  const queryClient = useQueryClient()
  const { player } = usePlayer()
  
  const { data: hardMode, isLoading } = useQuery({
    queryKey: ['hard-mode'],
    queryFn: fetchHardModeStatus,
    enabled: (player?.level ?? 0) >= 10,
  })

  const mutation = useMutation({
    mutationFn: toggleHardMode,
    onSuccess: (data) => {
      queryClient.setQueryData(['hard-mode'], data)
    },
  })

  // Don't show if level too low
  if (!player || player.level < 10) {
    return null
  }

  // Show locked state if not yet unlocked via different criteria
  if (hardMode && !hardMode.isUnlocked) {
    return (
      <SystemWindow title="HARD MODE" style={styles.container}>
        <View style={styles.lockedContent}>
          <Ionicons name="lock-closed" size={24} color="#666666" />
          <Text style={styles.lockedText}>
            Complete more challenges to unlock Hard Mode
          </Text>
        </View>
      </SystemWindow>
    )
  }

  return (
    <SystemWindow title="HARD MODE" style={styles.container}>
      {/* Description */}
      <Text style={styles.description}>
        Hard Mode increases difficulty but grants bonus XP and enhanced streak rewards.
      </Text>

      {/* Toggle */}
      <View style={styles.toggleRow}>
        <View style={styles.toggleInfo}>
          <View style={styles.labelRow}>
            <Ionicons name="flame" size={18} color="#FF6B6B" />
            <Text style={styles.toggleLabel}>Enable Hard Mode</Text>
          </View>
          <Text style={styles.toggleDescription}>
            {hardMode?.isEnabled 
              ? 'Currently active - stricter requirements'
              : 'Standard difficulty mode'}
          </Text>
        </View>
        <Switch
          value={hardMode?.isEnabled ?? false}
          onValueChange={(value) => mutation.mutate(value)}
          disabled={mutation.isPending || isLoading}
          trackColor={{ false: '#444', true: '#FF6B6B' }}
          thumbColor="#fff"
        />
      </View>

      {/* Bonuses */}
      {hardMode?.isEnabled && (
        <View style={styles.bonusesContainer}>
          <Text style={styles.bonusesTitle}>{'>'} ACTIVE BONUSES</Text>
          <View style={styles.bonusRow}>
            <Ionicons name="flash" size={14} color="#FFD700" />
            <Text style={styles.bonusText}>
              {((hardMode.bonuses.xpMultiplier - 1) * 100).toFixed(0)}% bonus XP
            </Text>
          </View>
          <View style={styles.bonusRow}>
            <Ionicons name="trending-up" size={14} color="#4ADE80" />
            <Text style={styles.bonusText}>
              +{hardMode.bonuses.streakBonus} streak bonus points
            </Text>
          </View>
        </View>
      )}

      {/* Warning */}
      {hardMode?.isEnabled && (
        <View style={styles.warningContainer}>
          <Ionicons name="warning" size={14} color="#FBBF24" />
          <Text style={styles.warningText}>
            Quest targets are increased and streak requirements are stricter
          </Text>
        </View>
      )}
    </SystemWindow>
  )
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  description: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#888888',
    marginBottom: 16,
    lineHeight: 18,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  toggleInfo: {
    flex: 1,
    marginRight: 16,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  toggleLabel: {
    fontSize: 14,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  toggleDescription: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#666666',
  },
  bonusesContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
  },
  bonusesTitle: {
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 8,
  },
  bonusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  bonusText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#CCCCCC',
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    padding: 8,
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    borderRadius: 6,
  },
  warningText: {
    flex: 1,
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#FBBF24',
    lineHeight: 14,
  },
  lockedContent: {
    alignItems: 'center',
    padding: 16,
    gap: 8,
  },
  lockedText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#666666',
    textAlign: 'center',
  },
})
