/**
 * useHealthSync - React hook for health data syncing
 */

import { useCallback } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { syncHealthData, shouldAutoSync } from '../health/sync'
import { useHealthStore } from '../stores/health'
import { getTodayHealthData } from '../health/queries'

/**
 * Hook for syncing health data
 */
export function useHealthSync() {
  const queryClient = useQueryClient()
  const { 
    lastSyncTime, 
    setSyncing, 
    setSyncSuccess, 
    setSyncError,
    clearSyncError,
  } = useHealthStore()

  const mutation = useMutation({
    mutationFn: async () => {
      setSyncing()
      
      // Get local health data first
      const healthData = await getTodayHealthData()
      
      // Sync to backend
      const result = await syncHealthData()
      
      if (result.success) {
        setSyncSuccess(healthData, result)
      } else {
        setSyncError(result.error ?? 'Sync failed')
      }
      
      return result
    },
    onSuccess: (result) => {
      if (result.success) {
        // Invalidate relevant queries to refresh UI
        queryClient.invalidateQueries({ queryKey: ['quests'] })
        queryClient.invalidateQueries({ queryKey: ['health'] })
        queryClient.invalidateQueries({ queryKey: ['player'] })
      }
    },
    onError: (error) => {
      setSyncError(error instanceof Error ? error.message : 'Sync failed')
    },
  })

  const sync = useCallback(() => {
    mutation.mutate()
  }, [mutation])

  const syncIfNeeded = useCallback(() => {
    if (shouldAutoSync(lastSyncTime)) {
      sync()
    }
  }, [lastSyncTime, sync])

  return {
    sync,
    syncIfNeeded,
    syncAsync: mutation.mutateAsync,
    isSyncing: mutation.isPending,
    lastResult: mutation.data,
    error: mutation.error,
    clearError: clearSyncError,
  }
}

/**
 * Hook for pull-to-refresh with health sync
 */
export function usePullToRefresh() {
  const { sync, isSyncing } = useHealthSync()
  const queryClient = useQueryClient()

  const onRefresh = useCallback(async () => {
    // Sync health data
    sync()
    
    // Also refresh quests
    await queryClient.invalidateQueries({ queryKey: ['quests'] })
  }, [sync, queryClient])

  return {
    refreshing: isSyncing,
    onRefresh,
  }
}
