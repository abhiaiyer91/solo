/**
 * Health sync service - Queries HealthKit and syncs to backend
 */

import { api } from '../lib/api'
import { getTodayHealthData } from './queries'
import type { HealthData, HealthSyncResult, Workout } from './types'

export interface HealthSyncRequest {
  source: 'HEALTHKIT' | 'GOOGLE_FIT'
  data: {
    steps: number
    exerciseMinutes: number
    activeCalories: number
    sleepMinutes?: number
    workouts: Array<{
      type: string
      durationMinutes: number
      calories?: number
      distance?: number
      startTime: string
      endTime?: string
      externalId: string
    }>
  }
  rawData?: object
}

export interface HealthSyncResponse {
  success: boolean
  snapshotId: string
  questsCompleted: number
  questResults: Array<{
    questId: string
    title: string
    wasCompleted: boolean
  }>
  snapshot: {
    id: string
    steps: number
    exerciseMinutes: number
    workoutCount: number
    sleepMinutes: number | null
    activeCalories: number
    syncedAt: string
  }
}

/**
 * Sync health data from device to backend
 */
export async function syncHealthData(): Promise<HealthSyncResult> {
  try {
    // Get today's health data from HealthKit
    const healthData = await getTodayHealthData()

    // Format request for backend
    const request: HealthSyncRequest = {
      source: 'HEALTHKIT',
      data: {
        steps: healthData.steps,
        exerciseMinutes: healthData.exerciseMinutes,
        activeCalories: healthData.activeCalories,
        sleepMinutes: healthData.sleepMinutes ?? undefined,
        workouts: healthData.workouts.map((w: Workout) => ({
          type: w.type,
          durationMinutes: w.durationMinutes,
          calories: w.calories,
          distance: w.distanceMeters,
          startTime: w.startTime.toISOString(),
          endTime: w.endTime?.toISOString(),
          externalId: w.id,
        })),
      },
      rawData: {
        healthkit: {
          stepCount: healthData.steps,
          activeEnergyBurned: healthData.activeCalories,
          appleExerciseTime: healthData.exerciseMinutes,
          sleepAnalysis: healthData.sleepMinutes 
            ? { asleep: healthData.sleepMinutes } 
            : undefined,
        },
      },
    }

    // Send to backend
    const response = await api.post<HealthSyncResponse>('/api/health/sync', request)

    return {
      success: true,
      snapshotId: response.snapshotId,
      questsCompleted: response.questsCompleted,
      completedQuestIds: response.questResults
        .filter(q => q.wasCompleted)
        .map(q => q.questId),
    }
  } catch (error) {
    console.error('[HealthSync] Sync failed:', error)
    return {
      success: false,
      questsCompleted: 0,
      completedQuestIds: [],
      error: error instanceof Error ? error.message : 'Sync failed',
    }
  }
}

/**
 * Check if we should auto-sync (e.g., app foregrounded)
 */
export function shouldAutoSync(lastSyncTime: Date | null): boolean {
  if (!lastSyncTime) return true
  
  const minutesSinceSync = (Date.now() - lastSyncTime.getTime()) / (1000 * 60)
  
  // Auto-sync if last sync was more than 5 minutes ago
  return minutesSinceSync > 5
}
