/**
 * Offline Utilities
 * 
 * Handles offline storage, queuing, and sync for mobile app.
 */

import AsyncStorage from '@react-native-async-storage/async-storage'

const KEYS = {
  PLAYER_CACHE: '@offline/player',
  QUESTS_CACHE: '@offline/quests',
  SYNC_QUEUE: '@offline/sync-queue',
  LAST_SYNC: '@offline/last-sync',
}

/**
 * Queued action for offline sync
 */
export interface QueuedAction {
  id: string
  type: 'quest_complete' | 'health_sync' | 'profile_update'
  payload: Record<string, unknown>
  createdAt: string
  retries: number
}

/**
 * Sync result
 */
export interface SyncResult {
  success: boolean
  synced: number
  failed: number
  errors: string[]
}

/**
 * Cache player data locally
 */
export async function cachePlayerData(data: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.PLAYER_CACHE, JSON.stringify({
      data,
      cachedAt: new Date().toISOString(),
    }))
  } catch (e) {
    console.error('[Offline] Failed to cache player data:', e)
  }
}

/**
 * Get cached player data
 */
export async function getCachedPlayerData<T>(): Promise<T | null> {
  try {
    const cached = await AsyncStorage.getItem(KEYS.PLAYER_CACHE)
    if (!cached) return null
    
    const { data } = JSON.parse(cached)
    return data as T
  } catch (e) {
    console.error('[Offline] Failed to get cached player data:', e)
    return null
  }
}

/**
 * Cache quests locally
 */
export async function cacheQuests(quests: unknown[]): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.QUESTS_CACHE, JSON.stringify({
      quests,
      cachedAt: new Date().toISOString(),
    }))
  } catch (e) {
    console.error('[Offline] Failed to cache quests:', e)
  }
}

/**
 * Get cached quests
 */
export async function getCachedQuests<T>(): Promise<T[] | null> {
  try {
    const cached = await AsyncStorage.getItem(KEYS.QUESTS_CACHE)
    if (!cached) return null
    
    const { quests } = JSON.parse(cached)
    return quests as T[]
  } catch (e) {
    console.error('[Offline] Failed to get cached quests:', e)
    return null
  }
}

/**
 * Add action to sync queue
 */
export async function queueAction(
  type: QueuedAction['type'],
  payload: Record<string, unknown>
): Promise<void> {
  try {
    const queue = await getSyncQueue()
    
    const action: QueuedAction = {
      id: `action-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      payload,
      createdAt: new Date().toISOString(),
      retries: 0,
    }
    
    queue.push(action)
    await AsyncStorage.setItem(KEYS.SYNC_QUEUE, JSON.stringify(queue))
  } catch (e) {
    console.error('[Offline] Failed to queue action:', e)
  }
}

/**
 * Get sync queue
 */
export async function getSyncQueue(): Promise<QueuedAction[]> {
  try {
    const queue = await AsyncStorage.getItem(KEYS.SYNC_QUEUE)
    return queue ? JSON.parse(queue) : []
  } catch (e) {
    console.error('[Offline] Failed to get sync queue:', e)
    return []
  }
}

/**
 * Process sync queue
 */
export async function processSyncQueue(
  syncFn: (action: QueuedAction) => Promise<boolean>
): Promise<SyncResult> {
  const queue = await getSyncQueue()
  const result: SyncResult = {
    success: true,
    synced: 0,
    failed: 0,
    errors: [],
  }
  
  const remaining: QueuedAction[] = []
  
  for (const action of queue) {
    try {
      const success = await syncFn(action)
      
      if (success) {
        result.synced++
      } else {
        action.retries++
        
        if (action.retries < 3) {
          remaining.push(action)
        } else {
          result.failed++
          result.errors.push(`Action ${action.id} failed after 3 retries`)
        }
      }
    } catch (e) {
      action.retries++
      
      if (action.retries < 3) {
        remaining.push(action)
      } else {
        result.failed++
        result.errors.push(`Action ${action.id}: ${e instanceof Error ? e.message : 'Unknown error'}`)
      }
    }
  }
  
  // Update queue with remaining items
  await AsyncStorage.setItem(KEYS.SYNC_QUEUE, JSON.stringify(remaining))
  
  if (result.failed > 0) {
    result.success = false
  }
  
  return result
}

/**
 * Clear sync queue
 */
export async function clearSyncQueue(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEYS.SYNC_QUEUE)
  } catch (e) {
    console.error('[Offline] Failed to clear sync queue:', e)
  }
}

/**
 * Get last sync timestamp
 */
export async function getLastSync(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(KEYS.LAST_SYNC)
  } catch (e) {
    return null
  }
}

/**
 * Update last sync timestamp
 */
export async function updateLastSync(): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.LAST_SYNC, new Date().toISOString())
  } catch (e) {
    console.error('[Offline] Failed to update last sync:', e)
  }
}

/**
 * Clear all cached data
 */
export async function clearAllOfflineData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      KEYS.PLAYER_CACHE,
      KEYS.QUESTS_CACHE,
      KEYS.SYNC_QUEUE,
      KEYS.LAST_SYNC,
    ])
  } catch (e) {
    console.error('[Offline] Failed to clear offline data:', e)
  }
}

/**
 * Get cache age in minutes
 */
export async function getCacheAge(key: 'player' | 'quests'): Promise<number | null> {
  try {
    const cacheKey = key === 'player' ? KEYS.PLAYER_CACHE : KEYS.QUESTS_CACHE
    const cached = await AsyncStorage.getItem(cacheKey)
    
    if (!cached) return null
    
    const { cachedAt } = JSON.parse(cached)
    const ageMs = Date.now() - new Date(cachedAt).getTime()
    return Math.floor(ageMs / 60000)
  } catch (e) {
    return null
  }
}
