/**
 * Offline Status Hook
 * 
 * Manages offline state and sync for mobile app.
 */

import { useState, useEffect, useCallback } from 'react'
import NetInfo, { NetInfoState } from '@react-native-community/netinfo'
import {
  getSyncQueue,
  processSyncQueue,
  updateLastSync,
  getLastSync,
  type QueuedAction,
  type SyncResult,
} from '../lib/offline'
import { api } from '../lib/api'

interface UseOfflineReturn {
  /** Whether device is currently online */
  isOnline: boolean
  
  /** Whether currently syncing queued actions */
  isSyncing: boolean
  
  /** Number of queued actions waiting to sync */
  queuedCount: number
  
  /** Last successful sync timestamp */
  lastSync: string | null
  
  /** Last sync result */
  lastSyncResult: SyncResult | null
  
  /** Manually trigger sync */
  sync: () => Promise<SyncResult>
  
  /** Refresh queue count */
  refreshQueue: () => Promise<void>
}

export function useOffline(): UseOfflineReturn {
  const [isOnline, setIsOnline] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [queuedCount, setQueuedCount] = useState(0)
  const [lastSync, setLastSync] = useState<string | null>(null)
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null)

  // Monitor network state
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const online = state.isConnected === true && state.isInternetReachable !== false
      setIsOnline(online)
      
      // Auto-sync when coming back online
      if (online && queuedCount > 0) {
        sync()
      }
    })

    // Initial check
    NetInfo.fetch().then((state) => {
      setIsOnline(state.isConnected === true && state.isInternetReachable !== false)
    })

    return () => unsubscribe()
  }, [queuedCount])

  // Load initial state
  useEffect(() => {
    refreshQueue()
    loadLastSync()
  }, [])

  const loadLastSync = useCallback(async () => {
    const timestamp = await getLastSync()
    setLastSync(timestamp)
  }, [])

  const refreshQueue = useCallback(async () => {
    const queue = await getSyncQueue()
    setQueuedCount(queue.length)
  }, [])

  const sync = useCallback(async (): Promise<SyncResult> => {
    if (!isOnline) {
      return {
        success: false,
        synced: 0,
        failed: 0,
        errors: ['Device is offline'],
      }
    }

    setIsSyncing(true)

    try {
      const result = await processSyncQueue(async (action: QueuedAction) => {
        // Process each action type
        switch (action.type) {
          case 'quest_complete':
            const questRes = await api.post(`/quests/${action.payload.questId}/complete`, {
              value: action.payload.value,
              completedAt: action.payload.completedAt,
            })
            return !questRes.error

          case 'health_sync':
            const healthRes = await api.post('/health/sync', action.payload)
            return !healthRes.error

          case 'profile_update':
            const profileRes = await api.patch('/player/profile', action.payload)
            return !profileRes.error

          default:
            console.warn(`Unknown action type: ${action.type}`)
            return false
        }
      })

      if (result.success) {
        await updateLastSync()
        await loadLastSync()
      }

      setLastSyncResult(result)
      await refreshQueue()

      return result
    } catch (e) {
      const errorResult: SyncResult = {
        success: false,
        synced: 0,
        failed: 0,
        errors: [e instanceof Error ? e.message : 'Sync failed'],
      }
      setLastSyncResult(errorResult)
      return errorResult
    } finally {
      setIsSyncing(false)
    }
  }, [isOnline, refreshQueue, loadLastSync])

  return {
    isOnline,
    isSyncing,
    queuedCount,
    lastSync,
    lastSyncResult,
    sync,
    refreshQueue,
  }
}
