/**
 * HealthKit provider wrapper
 * Provides type-safe access to Apple HealthKit data
 */

import type { HealthData, Workout, WorkoutType } from '../types'
import Constants from 'expo-constants'
import { Platform } from 'react-native'

// Conditional import for HealthKit - will be available in EAS builds
let healthkitModule: typeof import('@kingstinct/react-native-healthkit') | null = null

try {
  healthkitModule = require('@kingstinct/react-native-healthkit')
} catch {
  // HealthKit not available (Expo Go or web)
  console.log('[HealthKit] Native module not available - using stubs')
}

// Check if running in simulator - multiple detection methods
const isSimulator =
  !Constants.isDevice ||
  Platform.OS === 'ios' && !healthkitModule ||
  __DEV__ && !Constants.isDevice

console.log('[HealthKit] Environment check:', {
  isDevice: Constants.isDevice,
  isSimulator,
  platform: Platform.OS,
  hasModule: !!healthkitModule,
  isDev: __DEV__,
})

/**
 * Generate mock health data for simulator testing
 */
function getMockHealthData(): HealthData {
  const now = new Date()
  const hourOfDay = now.getHours()

  // Simulate realistic data that increases throughout the day
  const stepsPerHour = 500
  const baseSteps = Math.floor(hourOfDay * stepsPerHour + Math.random() * 1000)

  return {
    steps: baseSteps,
    activeCalories: Math.floor(baseSteps * 0.04), // ~40 cal per 1000 steps
    exerciseMinutes: Math.floor(hourOfDay * 3 + Math.random() * 10),
    distanceMeters: Math.floor(baseSteps * 0.75), // ~0.75m per step
    sleepMinutes: hourOfDay < 12 ? Math.floor(420 + Math.random() * 60) : null, // 7-8 hours if morning
    workouts: getMockWorkouts(),
    syncedAt: now,
  }
}

/**
 * Generate mock workouts for simulator
 */
function getMockWorkouts(): Workout[] {
  const now = new Date()
  const hourOfDay = now.getHours()

  // Only show workouts if it's afternoon (simulating morning workout)
  if (hourOfDay < 10) return []

  const workoutStart = new Date(now)
  workoutStart.setHours(7, 30, 0, 0)

  const workoutEnd = new Date(workoutStart)
  workoutEnd.setMinutes(workoutEnd.getMinutes() + 45)

  return [
    {
      id: 'mock-workout-1',
      type: 'strength',
      name: 'Strength Training',
      durationMinutes: 45,
      calories: 280,
      distanceMeters: undefined,
      startTime: workoutStart,
      endTime: workoutEnd,
    },
  ]
}

/**
 * Check if HealthKit is available on this device
 */
export async function isHealthKitAvailable(): Promise<boolean> {
  // Always return true on simulator for dev testing
  if (isSimulator) {
    console.log('[HealthKit] Simulator detected - using mock data')
    return true
  }

  if (!healthkitModule) return false

  try {
    return await healthkitModule.isHealthDataAvailable()
  } catch {
    return false
  }
}

/**
 * Request authorization to read health data
 */
export async function requestHealthKitAuthorization(): Promise<{
  granted: boolean
  status: 'authorized' | 'denied' | 'notDetermined'
}> {
  // Auto-grant on simulator
  if (isSimulator) {
    console.log('[HealthKit] Simulator - auto-granting authorization')
    return { granted: true, status: 'authorized' }
  }

  if (!healthkitModule) {
    return { granted: false, status: 'notDetermined' }
  }

  try {
    const readTypes = [
      healthkitModule.HKQuantityTypeIdentifier.stepCount,
      healthkitModule.HKQuantityTypeIdentifier.activeEnergyBurned,
      healthkitModule.HKQuantityTypeIdentifier.appleExerciseTime,
      healthkitModule.HKQuantityTypeIdentifier.distanceWalkingRunning,
      healthkitModule.HKCategoryTypeIdentifier.sleepAnalysis,
      healthkitModule.HKWorkoutTypeIdentifier, // Workouts
    ]

    await healthkitModule.requestAuthorization(readTypes, [])

    // HealthKit doesn't provide auth status for reading, so we assume success
    return { granted: true, status: 'authorized' }
  } catch (error) {
    console.error('[HealthKit] Authorization error:', error)
    return { granted: false, status: 'denied' }
  }
}

/**
 * Get today's health data
 */
export async function getTodayHealthData(): Promise<HealthData> {
  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  return getHealthDataForRange(startOfDay, now)
}

/**
 * Get health data for a date range
 */
export async function getHealthDataForRange(
  startDate: Date,
  endDate: Date
): Promise<HealthData> {
  // Return mock data on simulator or when HealthKit isn't available
  if (isSimulator || !healthkitModule) {
    console.log('[HealthKit] Returning mock health data (simulator or no module)')
    return getMockHealthData()
  }

  try {
    const [steps, activeCalories, exerciseMinutes, distance, sleepMinutes, workouts] = await Promise.all([
      getStepCount(startDate, endDate),
      getActiveCalories(startDate, endDate),
      getExerciseMinutes(startDate, endDate),
      getDistance(startDate, endDate),
      getSleepData(startDate, endDate),
      getWorkouts(startDate, endDate),
    ])

    return {
      steps,
      activeCalories,
      exerciseMinutes,
      distanceMeters: distance,
      sleepMinutes,
      workouts,
      syncedAt: new Date(),
    }
  } catch (error) {
    console.error('[HealthKit] Error fetching health data:', error)
    return {
      steps: 0,
      activeCalories: 0,
      exerciseMinutes: 0,
      distanceMeters: 0,
      sleepMinutes: null,
      workouts: [],
      syncedAt: new Date(),
    }
  }
}

/**
 * Get step count for a date range
 */
export async function getStepCount(
  startDate: Date,
  endDate: Date
): Promise<number> {
  if (!healthkitModule) return 0

  try {
    const samples = await healthkitModule.queryQuantitySamples(
      healthkitModule.HKQuantityTypeIdentifier.stepCount,
      {
        from: startDate,
        to: endDate,
      }
    )
    return samples.reduce((sum, sample) => sum + sample.quantity, 0)
  } catch (error) {
    console.error('[HealthKit] Error getting steps:', error)
    return 0
  }
}

/**
 * Get active calories for a date range
 */
export async function getActiveCalories(
  startDate: Date,
  endDate: Date
): Promise<number> {
  if (!healthkitModule) return 0

  try {
    const samples = await healthkitModule.queryQuantitySamples(
      healthkitModule.HKQuantityTypeIdentifier.activeEnergyBurned,
      {
        from: startDate,
        to: endDate,
      }
    )
    return Math.round(samples.reduce((sum, sample) => sum + sample.quantity, 0))
  } catch (error) {
    console.error('[HealthKit] Error getting calories:', error)
    return 0
  }
}

/**
 * Get exercise minutes for a date range
 */
export async function getExerciseMinutes(
  startDate: Date,
  endDate: Date
): Promise<number> {
  if (!healthkitModule) return 0

  try {
    const samples = await healthkitModule.queryQuantitySamples(
      healthkitModule.HKQuantityTypeIdentifier.appleExerciseTime,
      {
        from: startDate,
        to: endDate,
      }
    )
    return Math.round(samples.reduce((sum, sample) => sum + sample.quantity, 0))
  } catch (error) {
    console.error('[HealthKit] Error getting exercise minutes:', error)
    return 0
  }
}

/**
 * Get distance in meters for a date range
 */
export async function getDistance(
  startDate: Date,
  endDate: Date
): Promise<number> {
  if (!healthkitModule) return 0

  try {
    const samples = await healthkitModule.queryQuantitySamples(
      healthkitModule.HKQuantityTypeIdentifier.distanceWalkingRunning,
      {
        from: startDate,
        to: endDate,
      }
    )
    // Distance is returned in meters
    return Math.round(samples.reduce((sum, sample) => sum + sample.quantity, 0))
  } catch (error) {
    console.error('[HealthKit] Error getting distance:', error)
    return 0
  }
}

/**
 * Get workouts for a date range
 */
export async function getWorkouts(
  startDate: Date,
  endDate: Date
): Promise<Workout[]> {
  if (!healthkitModule) return []

  try {
    const workouts = await healthkitModule.queryWorkoutSamples({
      from: startDate,
      to: endDate,
    })

    return workouts.map((workout) => ({
      id: workout.uuid,
      type: mapWorkoutType(workout.workoutActivityType),
      name: getWorkoutTypeName(mapWorkoutType(workout.workoutActivityType)),
      durationMinutes: Math.round(workout.duration / 60),
      calories: workout.totalEnergyBurned ? Math.round(workout.totalEnergyBurned) : undefined,
      distanceMeters: workout.totalDistance ? Math.round(workout.totalDistance) : undefined,
      startTime: new Date(workout.startDate),
      endTime: workout.endDate ? new Date(workout.endDate) : undefined,
    }))
  } catch (error) {
    console.error('[HealthKit] Error getting workouts:', error)
    return []
  }
}

/**
 * Get sleep data for a date range
 */
export async function getSleepData(
  startDate: Date,
  endDate: Date
): Promise<number | null> {
  if (!healthkitModule) return null

  try {
    const samples = await healthkitModule.queryCategorySamples(
      healthkitModule.HKCategoryTypeIdentifier.sleepAnalysis,
      {
        from: startDate,
        to: endDate,
      }
    )

    // Filter for actual sleep (not "in bed")
    // Value 1 = asleep (core), 2 = asleep (deep), 3 = asleep (REM)
    const sleepSamples = samples.filter((s) => s.value >= 1 && s.value <= 5)

    // Calculate total minutes
    const totalMinutes = sleepSamples.reduce((sum, sample) => {
      const start = new Date(sample.startDate).getTime()
      const end = new Date(sample.endDate).getTime()
      return sum + (end - start) / 60000
    }, 0)

    return totalMinutes > 0 ? Math.round(totalMinutes) : null
  } catch (error) {
    console.error('[HealthKit] Error getting sleep:', error)
    return null
  }
}

/**
 * Convert HKWorkoutActivityType to our WorkoutType
 */
export function mapWorkoutType(hkType: number): WorkoutType {
  const typeMap: Record<number, WorkoutType> = {
    37: 'running', // HKWorkoutActivityTypeRunning
    52: 'walking', // HKWorkoutActivityTypeWalking
    13: 'cycling', // HKWorkoutActivityTypeCycling
    46: 'swimming', // HKWorkoutActivityTypeSwimming
    50: 'strength', // HKWorkoutActivityTypeTraditionalStrengthTraining
    63: 'hiit', // HKWorkoutActivityTypeHighIntensityIntervalTraining
    66: 'yoga', // HKWorkoutActivityTypeYoga
  }

  return typeMap[hkType] ?? 'other'
}

/**
 * Get workout type display name
 */
export function getWorkoutTypeName(type: WorkoutType): string {
  const names: Record<WorkoutType, string> = {
    running: 'Running',
    walking: 'Walking',
    cycling: 'Cycling',
    swimming: 'Swimming',
    strength: 'Strength Training',
    hiit: 'HIIT',
    yoga: 'Yoga',
    other: 'Workout',
  }

  return names[type]
}

/**
 * Enable background delivery for health types
 * Must be called after authorization
 */
export async function enableBackgroundDelivery(): Promise<boolean> {
  if (!healthkitModule) return false

  try {
    // Enable background delivery for step count
    await healthkitModule.enableBackgroundDelivery(
      healthkitModule.HKQuantityTypeIdentifier.stepCount,
      healthkitModule.HKUpdateFrequency.hourly
    )

    // Enable background delivery for active calories
    await healthkitModule.enableBackgroundDelivery(
      healthkitModule.HKQuantityTypeIdentifier.activeEnergyBurned,
      healthkitModule.HKUpdateFrequency.hourly
    )

    // Enable background delivery for exercise time
    await healthkitModule.enableBackgroundDelivery(
      healthkitModule.HKQuantityTypeIdentifier.appleExerciseTime,
      healthkitModule.HKUpdateFrequency.hourly
    )

    console.log('[HealthKit] Background delivery enabled')
    return true
  } catch (error) {
    console.error('[HealthKit] Error enabling background delivery:', error)
    return false
  }
}

/**
 * Subscribe to health data changes
 */
export function subscribeToHealthUpdates(
  onUpdate: (type: string) => void
): () => void {
  if (!healthkitModule) return () => {}

  const unsubscribers: (() => void)[] = []

  try {
    // Subscribe to step count changes
    const stepsUnsub = healthkitModule.subscribeToChanges(
      healthkitModule.HKQuantityTypeIdentifier.stepCount,
      () => onUpdate('steps')
    )
    unsubscribers.push(stepsUnsub)

    // Subscribe to workout changes
    // Note: Workout subscriptions may require different API
  } catch (error) {
    console.error('[HealthKit] Error subscribing to updates:', error)
  }

  return () => {
    unsubscribers.forEach((unsub) => unsub())
  }
}
