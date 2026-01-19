/**
 * HealthKit query functions
 * Re-exports from healthkit.ts provider for convenience
 */

import {
  getTodayHealthData as getHealthKitTodayData,
  getStepCount,
  getActiveCalories,
  getExerciseMinutes,
  getDistance,
  getWorkouts,
  getSleepData,
} from './providers/healthkit'

/**
 * Get today's step count
 */
export async function getTodaySteps(): Promise<number> {
  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return getStepCount(startOfDay, now)
}

/**
 * Get today's exercise minutes
 */
export async function getTodayExerciseMinutes(): Promise<number> {
  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return getExerciseMinutes(startOfDay, now)
}

/**
 * Get today's active calories burned
 */
export async function getTodayActiveCalories(): Promise<number> {
  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return getActiveCalories(startOfDay, now)
}

/**
 * Get today's workouts
 */
export async function getTodayWorkouts() {
  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return getWorkouts(startOfDay, now)
}

/**
 * Get last night's sleep in minutes
 */
export async function getLastNightSleep(): Promise<number | null> {
  // Look at sleep from yesterday evening to this morning
  const now = new Date()
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 18, 0) // 6 PM yesterday
  const thisMorning = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0) // Noon today
  return getSleepData(yesterday, thisMorning)
}

/**
 * Get today's walking/running distance in meters
 */
export async function getTodayDistance(): Promise<number> {
  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return getDistance(startOfDay, now)
}

/**
 * Get all today's health data in one call
 */
export async function getTodayHealthData() {
  return getHealthKitTodayData()
}
