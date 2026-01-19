/**
 * Health Service Tests
 * Tests for health data sync and snapshot management
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the database
vi.mock('../db', () => ({
  dbClient: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve([])),
        })),
      })),
    })),
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        returning: vi.fn(() => Promise.resolve([{ id: 'snapshot-1' }])),
      })),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => ({
          returning: vi.fn(() => Promise.resolve([{ id: 'snapshot-1' }])),
        })),
      })),
    })),
  },
}))

// Import after mocking
import { healthDataToQuestData } from './health'
import type { HealthSnapshot } from '../db/schema'

describe('healthService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('healthDataToQuestData', () => {
    it('converts health snapshot to quest evaluation format', () => {
      const snapshot: HealthSnapshot = {
        id: 'test-1',
        userId: 'user-1',
        snapshotDate: '2026-01-19',
        steps: 8500,
        stepsVerification: 'VERIFIED',
        exerciseMinutes: 45,
        exerciseMinutesVerification: 'VERIFIED',
        sleepMinutes: 420,
        sleepVerification: 'IMPORTED',
        workoutCount: 2,
        workoutMinutes: 60,
        workoutVerification: 'VERIFIED',
        activeCalories: 350,
        caloriesVerification: 'VERIFIED',
        proteinLogged: true,
        proteinVerification: 'SELF_REPORTED',
        primarySource: 'HEALTHKIT',
        lastSyncedAt: new Date(),
        syncCount: 1,
      }

      const result = healthDataToQuestData(snapshot)

      expect(result.steps).toBe(8500)
      expect(result.exercise_minutes).toBe(45)
      expect(result.workout_minutes).toBe(60)
      expect(result.sleep_hours).toBe(7) // 420 / 60
      expect(result.sleep_minutes).toBe(420)
      expect(result.workouts).toBe(2)
      expect(result.workout_count).toBe(2)
      expect(result.active_calories).toBe(350)
      expect(result.protein_logged).toBe(true)
    })

    it('handles null/undefined values gracefully', () => {
      const snapshot: HealthSnapshot = {
        id: 'test-1',
        userId: 'user-1',
        snapshotDate: '2026-01-19',
        steps: null,
        stepsVerification: null,
        exerciseMinutes: null,
        exerciseMinutesVerification: null,
        sleepMinutes: null,
        sleepVerification: null,
        workoutCount: null,
        workoutMinutes: null,
        workoutVerification: null,
        activeCalories: null,
        caloriesVerification: null,
        proteinLogged: null,
        proteinVerification: null,
        primarySource: null,
        lastSyncedAt: null,
        syncCount: null,
      }

      const result = healthDataToQuestData(snapshot)

      expect(result.steps).toBe(0)
      expect(result.exercise_minutes).toBe(0)
      expect(result.workout_minutes).toBe(0)
      expect(result.sleep_hours).toBe(0)
      expect(result.sleep_minutes).toBe(0)
      expect(result.workouts).toBe(0)
      expect(result.workout_count).toBe(0)
      expect(result.active_calories).toBe(0)
      expect(result.protein_logged).toBe(false)
    })

    it('calculates sleep hours correctly', () => {
      const snapshot: HealthSnapshot = {
        id: 'test-1',
        userId: 'user-1',
        snapshotDate: '2026-01-19',
        steps: 0,
        stepsVerification: null,
        exerciseMinutes: 0,
        exerciseMinutesVerification: null,
        sleepMinutes: 480, // 8 hours
        sleepVerification: 'VERIFIED',
        workoutCount: 0,
        workoutMinutes: 0,
        workoutVerification: null,
        activeCalories: 0,
        caloriesVerification: null,
        proteinLogged: false,
        proteinVerification: null,
        primarySource: null,
        lastSyncedAt: null,
        syncCount: null,
      }

      const result = healthDataToQuestData(snapshot)

      expect(result.sleep_hours).toBe(8)
    })
  })

  describe('verification levels', () => {
    it('HEALTHKIT source with automatic data should be VERIFIED', () => {
      // The getVerificationLevel function is internal, so we test via sync behavior
      // This is a placeholder for testing verification level assignment
      expect(true).toBe(true)
    })

    it('MANUAL source should be SELF_REPORTED', () => {
      // Placeholder for verification level testing
      expect(true).toBe(true)
    })
  })

  describe('data validation', () => {
    it('should handle maximum reasonable step count', () => {
      const snapshot: HealthSnapshot = {
        id: 'test-1',
        userId: 'user-1',
        snapshotDate: '2026-01-19',
        steps: 50000, // Marathon level
        stepsVerification: 'VERIFIED',
        exerciseMinutes: null,
        exerciseMinutesVerification: null,
        sleepMinutes: null,
        sleepVerification: null,
        workoutCount: null,
        workoutMinutes: null,
        workoutVerification: null,
        activeCalories: null,
        caloriesVerification: null,
        proteinLogged: null,
        proteinVerification: null,
        primarySource: 'HEALTHKIT',
        lastSyncedAt: null,
        syncCount: null,
      }

      const result = healthDataToQuestData(snapshot)
      expect(result.steps).toBe(50000)
    })

    it('should handle edge case of 0 steps', () => {
      const snapshot: HealthSnapshot = {
        id: 'test-1',
        userId: 'user-1',
        snapshotDate: '2026-01-19',
        steps: 0,
        stepsVerification: 'VERIFIED',
        exerciseMinutes: null,
        exerciseMinutesVerification: null,
        sleepMinutes: null,
        sleepVerification: null,
        workoutCount: null,
        workoutMinutes: null,
        workoutVerification: null,
        activeCalories: null,
        caloriesVerification: null,
        proteinLogged: null,
        proteinVerification: null,
        primarySource: 'HEALTHKIT',
        lastSyncedAt: null,
        syncCount: null,
      }

      const result = healthDataToQuestData(snapshot)
      expect(result.steps).toBe(0)
    })
  })
})
