/**
 * HealthKit Background Sync
 * Registers background fetch task to sync health data periodically
 */

import { syncHealthData, shouldAutoSync } from './sync'
import { useHealthStore } from '../stores/health'

// Task identifier
const HEALTH_SYNC_TASK = 'health-sync-background'

/**
 * Background task result types (matches expo-background-fetch)
 */
export enum BackgroundFetchResult {
  NoData = 1,
  NewData = 2,
  Failed = 3,
}

/**
 * Background task handler
 * Note: Actual expo-background-fetch integration requires:
 * npx expo install expo-background-fetch expo-task-manager
 */
export async function handleBackgroundSync(): Promise<BackgroundFetchResult> {
  try {
    console.log('[Background] Starting health sync...')
    
    // Check if we recently synced (avoid redundant syncs)
    const state = useHealthStore.getState()
    if (!shouldAutoSync(state.lastSyncTime)) {
      console.log('[Background] Skipping sync, too recent')
      return BackgroundFetchResult.NoData
    }

    // Perform sync
    const result = await syncHealthData()

    if (result.success) {
      console.log('[Background] Health sync complete:', result.questsCompleted, 'quests completed')
      return BackgroundFetchResult.NewData
    } else {
      console.log('[Background] Health sync failed:', result.error)
      return BackgroundFetchResult.Failed
    }
  } catch (error) {
    console.error('[Background] Health sync error:', error)
    return BackgroundFetchResult.Failed
  }
}

/**
 * Register background sync task
 * Call this when health permissions are granted
 * 
 * Note: This is a stub until expo-background-fetch is installed.
 * Real implementation:
 * 
 * ```
 * import * as BackgroundFetch from 'expo-background-fetch'
 * import * as TaskManager from 'expo-task-manager'
 * 
 * TaskManager.defineTask(HEALTH_SYNC_TASK, handleBackgroundSync)
 * 
 * await BackgroundFetch.registerTaskAsync(HEALTH_SYNC_TASK, {
 *   minimumInterval: 15 * 60,
 *   stopOnTerminate: false,
 *   startOnBoot: true,
 * })
 * ```
 */
export async function registerBackgroundSync(): Promise<void> {
  try {
    // Stub - logs intention but doesn't register actual task
    console.log('[Background] Would register health sync task (stub)')
    console.log('[Background] Install expo-background-fetch to enable')
  } catch (error) {
    console.error('[Background] Failed to register task:', error)
  }
}

/**
 * Unregister background sync task
 */
export async function unregisterBackgroundSync(): Promise<void> {
  try {
    console.log('[Background] Would unregister health sync task (stub)')
  } catch (error) {
    console.error('[Background] Failed to unregister task:', error)
  }
}

/**
 * Get current background sync status
 */
export async function getBackgroundSyncStatus(): Promise<{
  isRegistered: boolean
  minimumInterval: number
}> {
  // Stub - returns not registered
  return {
    isRegistered: false,
    minimumInterval: 15 * 60,
  }
}

/**
 * Check if background fetch is available
 */
export async function isBackgroundFetchAvailable(): Promise<boolean> {
  // Background fetch requires native module
  // Will return true once expo-background-fetch is installed
  return false
}
