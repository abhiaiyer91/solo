/**
 * HealthKit type definitions
 * Defines the health data types we read/write from Apple Health
 */

/**
 * HealthKit quantity type identifiers
 */
export const HEALTH_READ_TYPES = [
  'HKQuantityTypeIdentifierStepCount',
  'HKQuantityTypeIdentifierActiveEnergyBurned',
  'HKQuantityTypeIdentifierAppleExerciseTime',
  'HKQuantityTypeIdentifierDistanceWalkingRunning',
  'HKCategoryTypeIdentifierSleepAnalysis',
  'HKWorkoutType',
] as const

export type HealthReadType = (typeof HEALTH_READ_TYPES)[number]

/**
 * HealthKit authorization status
 */
export type HealthAuthStatus =
  | 'notDetermined'
  | 'sharingDenied'
  | 'sharingAuthorized'

/**
 * Aggregated health data for a day
 */
export interface HealthData {
  steps: number
  activeCalories: number
  exerciseMinutes: number
  distanceMeters: number
  sleepMinutes: number | null
  workouts: Workout[]
  syncedAt: Date
}

/**
 * Workout session data
 */
export interface Workout {
  id: string
  type: WorkoutType
  name: string
  durationMinutes: number
  calories?: number
  distanceMeters?: number
  startTime: Date
  endTime?: Date
}

/**
 * Common workout types from HealthKit
 */
export type WorkoutType =
  | 'running'
  | 'walking'
  | 'cycling'
  | 'swimming'
  | 'strength'
  | 'hiit'
  | 'yoga'
  | 'other'

/**
 * Map HKWorkoutActivityType to our simpler types
 */
export const WORKOUT_TYPE_MAP: Record<number, WorkoutType> = {
  37: 'running', // HKWorkoutActivityTypeRunning
  52: 'walking', // HKWorkoutActivityTypeWalking
  13: 'cycling', // HKWorkoutActivityTypeCycling
  46: 'swimming', // HKWorkoutActivityTypeSwimming
  50: 'strength', // HKWorkoutActivityTypeTraditionalStrengthTraining
  63: 'hiit', // HKWorkoutActivityTypeHighIntensityIntervalTraining
  66: 'yoga', // HKWorkoutActivityTypeYoga
}

/**
 * Sync result from backend
 */
export interface HealthSyncResult {
  success: boolean
  snapshotId?: string
  questsCompleted: number
  completedQuestIds: string[]
  error?: string
}

/**
 * Health store state
 */
export interface HealthStoreState {
  authStatus: HealthAuthStatus
  lastSyncTime: Date | null
  syncStatus: 'idle' | 'syncing' | 'error'
  currentData: HealthData | null
  error: string | null
}
