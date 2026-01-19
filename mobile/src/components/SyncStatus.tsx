/**
 * SyncStatus - Health sync status indicator
 * Shows sync state and allows manual sync trigger
 */

import React from 'react'
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from 'react-native'

interface SyncStatusProps {
  lastSyncTime: Date | null
  isSyncing: boolean
  onSync: () => void
  disabled?: boolean
}

export function SyncStatus({
  lastSyncTime,
  isSyncing,
  onSync,
  disabled,
}: SyncStatusProps) {
  const getStatusText = (): string => {
    if (isSyncing) return 'Syncing...'
    if (!lastSyncTime) return 'Not synced'
    return formatTimeAgo(lastSyncTime)
  }

  const getStatusColor = (): string => {
    if (isSyncing) return '#00BFFF'
    if (!lastSyncTime) return '#666666'
    
    // Check if last sync is recent (within 5 minutes)
    const minutesAgo = (Date.now() - lastSyncTime.getTime()) / 60000
    if (minutesAgo < 5) return '#00FF00'
    if (minutesAgo < 30) return '#FFD700'
    return '#FF6600'
  }

  return (
    <Pressable
      onPress={onSync}
      disabled={isSyncing || disabled}
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <View style={styles.statusIndicator}>
        {isSyncing ? (
          <ActivityIndicator size="small" color="#00FF00" />
        ) : (
          <View
            style={[
              styles.statusDot,
              { backgroundColor: getStatusColor() },
            ]}
          />
        )}
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.label}>HEALTH SYNC</Text>
        <Text style={styles.status}>{getStatusText()}</Text>
      </View>
      <Text style={styles.syncIcon}>{isSyncing ? '⟳' : '↻'}</Text>
    </Pressable>
  )
}

/**
 * Compact sync status for header
 */
export function SyncStatusCompact({
  lastSyncTime,
  isSyncing,
  onSync,
}: SyncStatusProps) {
  const statusColor = isSyncing
    ? '#00BFFF'
    : lastSyncTime
    ? '#00FF00'
    : '#666666'

  return (
    <Pressable
      onPress={onSync}
      disabled={isSyncing}
      style={styles.compactContainer}
    >
      {isSyncing ? (
        <ActivityIndicator size="small" color="#00FF00" />
      ) : (
        <View
          style={[styles.compactDot, { backgroundColor: statusColor }]}
        />
      )}
    </Pressable>
  )
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)

  if (seconds < 60) return 'Just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    gap: 12,
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.5,
  },
  statusIndicator: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#888888',
    marginBottom: 2,
  },
  status: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#FFFFFF',
  },
  syncIcon: {
    fontSize: 20,
    color: '#00FF00',
  },
  compactContainer: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
})
