/**
 * Offline Indicator Component
 * 
 * Shows offline status and sync queue information.
 */

import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native'
import { useEffect, useRef } from 'react'
import { useOffline } from '../hooks/useOffline'

interface OfflineIndicatorProps {
  /** Show even when online (for development) */
  alwaysShow?: boolean
  /** Position on screen */
  position?: 'top' | 'bottom'
}

export function OfflineIndicator({ 
  alwaysShow = false,
  position = 'bottom' 
}: OfflineIndicatorProps) {
  const { isOnline, isSyncing, queuedCount, sync } = useOffline()
  const slideAnim = useRef(new Animated.Value(100)).current

  const shouldShow = alwaysShow || !isOnline || queuedCount > 0

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: shouldShow ? 0 : 100,
      duration: 300,
      useNativeDriver: true,
    }).start()
  }, [shouldShow])

  if (!shouldShow) {
    return null
  }

  const handleSync = () => {
    if (isOnline && queuedCount > 0 && !isSyncing) {
      sync()
    }
  }

  return (
    <Animated.View 
      style={[
        styles.container,
        position === 'top' ? styles.positionTop : styles.positionBottom,
        { transform: [{ translateY: slideAnim }] }
      ]}
    >
      <View style={[
        styles.indicator,
        !isOnline && styles.indicatorOffline,
        isSyncing && styles.indicatorSyncing,
      ]}>
        {/* Status Icon */}
        <View style={[styles.dot, !isOnline && styles.dotOffline]} />

        {/* Status Text */}
        <View style={styles.textContainer}>
          <Text style={styles.statusText}>
            {!isOnline 
              ? 'Offline' 
              : isSyncing 
                ? 'Syncing...' 
                : 'Online'}
          </Text>
          
          {queuedCount > 0 && (
            <Text style={styles.queueText}>
              {queuedCount} pending {queuedCount === 1 ? 'action' : 'actions'}
            </Text>
          )}
        </View>

        {/* Sync Button */}
        {isOnline && queuedCount > 0 && !isSyncing && (
          <TouchableOpacity 
            onPress={handleSync}
            style={styles.syncButton}
          >
            <Text style={styles.syncButtonText}>Sync</Text>
          </TouchableOpacity>
        )}

        {/* Syncing Spinner */}
        {isSyncing && (
          <View style={styles.spinner}>
            <Text style={styles.spinnerText}>⟳</Text>
          </View>
        )}
      </View>
    </Animated.View>
  )
}

/**
 * Compact offline badge for headers
 */
export function OfflineBadge() {
  const { isOnline, queuedCount } = useOffline()

  if (isOnline && queuedCount === 0) {
    return null
  }

  return (
    <View style={[badgeStyles.badge, !isOnline && badgeStyles.badgeOffline]}>
      <View style={[badgeStyles.dot, !isOnline && badgeStyles.dotOffline]} />
      <Text style={badgeStyles.text}>
        {!isOnline ? 'Offline' : `${queuedCount} pending`}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
  },
  positionTop: {
    top: 50,
  },
  positionBottom: {
    bottom: 100,
  },
  indicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#22c55e',
  },
  indicatorOffline: {
    borderColor: '#ef4444',
  },
  indicatorSyncing: {
    borderColor: '#3b82f6',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22c55e',
    marginRight: 12,
  },
  dotOffline: {
    backgroundColor: '#ef4444',
  },
  textContainer: {
    flex: 1,
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  queueText: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  syncButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
  },
  syncButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  spinner: {
    marginLeft: 8,
  },
  spinnerText: {
    fontSize: 20,
    color: '#3b82f6',
  },
})

const badgeStyles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#eab308',
  },
  badgeOffline: {
    borderColor: '#ef4444',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#eab308',
    marginRight: 6,
  },
  dotOffline: {
    backgroundColor: '#ef4444',
  },
  text: {
    fontSize: 11,
    color: '#ffffff',
    fontWeight: '500',
  },
})
