/**
 * HealthKit query functions
 * Note: These are stubs until @kingstinct/react-native-healthkit is installed
 */

import type { Workout, WorkoutType } from './types'

/**
 * Get today's step count
 */
export async function getTodaySteps(): Promise<number> {
  // Stub - returns 0 until native module is installed
  // Real implementation:
  // const samples = await queryQuantitySamples({
  //   quantityType: 'HKQuantityTypeIdentifierStepCount',
  //   from: startOfDay,
  //   to: now,
  // })
  // return samples.reduce((total, sample) => total + sample.quantity, 0)
  
  console.log('[HealthKit] getTodaySteps() - stub')
  return 0
}

/**
 * Get today's exercise minutes
 */
export async function getTodayExerciseMinutes(): Promise<number> {
  // Stub
  console.log('[HealthKit] getTodayExerciseMinutes() - stub')
  return 0
}

/**
 * Get today's active calories burned
 */
export async function getTodayActiveCalories(): Promise<number> {
  // Stub
  console.log('[HealthKit] getTodayActiveCalories() - stub')
  return 0
}

/**
 * Get today's workouts
 */
export async function getTodayWorkouts(): Promise<Workout[]> {
  // Stub
  console.log('[HealthKit] getTodayWorkouts() - stub')
  return []
}

/**
 * Get last night's sleep in minutes
 */
export async function getLastNightSleep(): Promise<number | null> {
  // Stub
  console.log('[HealthKit] getLastNightSleep() - stub')
  return null
}

/**
 * Get today's walking/running distance in meters
 */
export async function getTodayDistance(): Promise<number> {
  // Stub
  console.log('[HealthKit] getTodayDistance() - stub')
  return 0
}

/**
 * Get all today's health data in one call
 */
export async function getTodayHealthData() {
  const [steps, exerciseMinutes, activeCalories, workouts, sleepMinutes, distance] =
    await Promise.all([
      getTodaySteps(),
      getTodayExerciseMinutes(),
      getTodayActiveCalories(),
      getTodayWorkouts(),
      getLastNightSleep(),
      getTodayDistance(),
    ])

  return {
    steps,
    exerciseMinutes,
    activeCalories,
    workouts,
    sleepMinutes,
    distanceMeters: distance,
    syncedAt: new Date(),
  }
}
