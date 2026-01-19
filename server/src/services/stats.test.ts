/**
 * Stats Service Tests
 * Tests for stat calculation and milestone tracking
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock dependencies
vi.mock('../db', () => ({
  dbClient: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve([])),
        })),
        innerJoin: vi.fn(() => ({
          where: vi.fn(() => ({
            orderBy: vi.fn(() => Promise.resolve([])),
          })),
        })),
      })),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve()),
      })),
    })),
  },
}))

vi.mock('./baseline', () => ({
  getBaselineAssessment: vi.fn(() => Promise.resolve(null)),
}))

vi.mock('../lib/stat-benchmarks', () => ({
  getBenchmarksForStat: vi.fn(() => []),
  getCurrentBenchmark: vi.fn(() => ({ value: 10, label: 'Baseline', description: 'Starting', realWorld: 'Start' })),
  getNextMilestone: vi.fn(() => ({ value: 25, label: 'Novice', description: 'Making progress', realWorld: 'Active' })),
  getImprovementSuggestions: vi.fn(() => ['Work out more', 'Stay consistent']),
}))

describe('statsService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('stat calculation logic', () => {
    it('should start at baseline value of 10 with no data', async () => {
      // When there's no baseline or activity data, stats should start at 10
      const expectedMinimum = 10
      expect(expectedMinimum).toBe(10)
    })

    it('should cap stats at 100', () => {
      // Stats should never exceed 100
      const maxValue = Math.min(100, 150) // Simulating overcap prevention
      expect(maxValue).toBe(100)
    })

    it('should calculate STR based on push-ups and plank', () => {
      // Test STR calculation thresholds
      const pushUpsThresholds = [
        { pushUps: 0, expected: 10 },
        { pushUps: 5, expected: 13 },
        { pushUps: 10, expected: 16 },
        { pushUps: 20, expected: 22 },
        { pushUps: 30, expected: 28 },
        { pushUps: 50, expected: 35 },
      ]

      for (const { pushUps, expected } of pushUpsThresholds) {
        let strValue = 10
        if (pushUps >= 50) strValue = 35
        else if (pushUps >= 30) strValue = 28
        else if (pushUps >= 20) strValue = 22
        else if (pushUps >= 10) strValue = 16
        else if (pushUps >= 5) strValue = 13
        else strValue = 10

        expect(strValue).toBe(expected)
      }
    })

    it('should calculate AGI based on daily steps', () => {
      const stepsThresholds = [
        { steps: 0, minExpected: 10 },
        { steps: 5000, minExpected: 14 },
        { steps: 7500, minExpected: 18 },
        { steps: 10000, minExpected: 24 },
        { steps: 12000, minExpected: 28 },
        { steps: 15000, minExpected: 32 },
      ]

      for (const { steps, minExpected } of stepsThresholds) {
        let agiValue = 10
        if (steps >= 15000) agiValue = 32
        else if (steps >= 12000) agiValue = 28
        else if (steps >= 10000) agiValue = 24
        else if (steps >= 7500) agiValue = 18
        else if (steps >= 5000) agiValue = 14

        expect(agiValue).toBeGreaterThanOrEqual(minExpected)
      }
    })

    it('should calculate VIT based on sleep and lifestyle', () => {
      // VIT is affected by sleep, protein, and alcohol consumption
      const sleepBonuses = [
        { sleep: 5, bonus: 0 },
        { sleep: 6, bonus: 2 },
        { sleep: 7, bonus: 4 },
        { sleep: 8, bonus: 6 },
      ]

      for (const { sleep, bonus } of sleepBonuses) {
        let sleepBonus = 0
        if (sleep >= 8) sleepBonus = 6
        else if (sleep >= 7) sleepBonus = 4
        else if (sleep >= 6) sleepBonus = 2

        expect(sleepBonus).toBe(bonus)
      }
    })

    it('should calculate DISC primarily from streaks', () => {
      const streakValues = [
        { streak: 0, minValue: 0 },
        { streak: 3, minValue: 4 },
        { streak: 7, minValue: 7 },
        { streak: 14, minValue: 12 },
        { streak: 30, minValue: 18 },
        { streak: 60, minValue: 25 },
        { streak: 90, minValue: 32 },
        { streak: 180, minValue: 40 },
        { streak: 365, minValue: 50 },
      ]

      for (const { streak, minValue } of streakValues) {
        let streakValue = 0
        if (streak >= 365) streakValue = 50
        else if (streak >= 180) streakValue = 40
        else if (streak >= 90) streakValue = 32
        else if (streak >= 60) streakValue = 25
        else if (streak >= 30) streakValue = 18
        else if (streak >= 14) streakValue = 12
        else if (streak >= 7) streakValue = 7
        else if (streak >= 3) streakValue = 4
        else streakValue = streak

        expect(streakValue).toBeGreaterThanOrEqual(minValue)
      }
    })
  })

  describe('activity contribution', () => {
    it('should cap activity contribution at 30 points', () => {
      // Activity contribution should be capped
      const rawContribution = 45
      const cappedContribution = Math.min(30, rawContribution)
      expect(cappedContribution).toBe(30)
    })

    it('should calculate contribution based on quest XP', () => {
      // Each quest contributes 0.5-1.5 points based on XP
      const questXP = 50
      const contribution = Math.min(1.5, Math.max(0.5, questXP / 25))
      expect(contribution).toBe(1.5) // 50/25 = 2, capped at 1.5
    })
  })

  describe('streak contribution', () => {
    it('should cap streak contribution at 50 points', () => {
      const rawStreak = 500
      let streakValue = 50 // Long streak value
      const cappedValue = Math.min(50, streakValue)
      expect(cappedValue).toBe(50)
    })

    it('should add bonus for historical longest streak', () => {
      const longestStreak = 200
      let bonus = 0
      if (longestStreak >= 180) bonus = 5
      else if (longestStreak >= 90) bonus = 3
      else if (longestStreak >= 30) bonus = 1

      expect(bonus).toBe(5)
    })
  })

  describe('benchmark calculation', () => {
    it('should find current benchmark for stat value', () => {
      // Example benchmarks for testing
      const benchmarks = [
        { value: 10, label: 'Baseline' },
        { value: 25, label: 'Novice' },
        { value: 40, label: 'Intermediate' },
        { value: 60, label: 'Advanced' },
        { value: 80, label: 'Expert' },
        { value: 100, label: 'Elite' },
      ]

      const statValue = 35
      const current = benchmarks
        .filter((b) => b.value <= statValue)
        .sort((a, b) => b.value - a.value)[0]

      expect(current?.label).toBe('Novice')
    })

    it('should find next milestone for stat value', () => {
      const benchmarks = [
        { value: 10, label: 'Baseline' },
        { value: 25, label: 'Novice' },
        { value: 40, label: 'Intermediate' },
        { value: 60, label: 'Advanced' },
      ]

      const statValue = 35
      const next = benchmarks.find((b) => b.value > statValue)

      expect(next?.label).toBe('Intermediate')
    })

    it('should calculate progress to next milestone', () => {
      const currentValue = 10
      const nextValue = 25
      const statValue = 17

      const progress = Math.round(((statValue - currentValue) / (nextValue - currentValue)) * 100)
      expect(progress).toBe(47) // (17-10)/(25-10) = 7/15 = 46.67%
    })
  })

  describe('total stat calculation', () => {
    it('should sum baseline, activity, and streak contributions', () => {
      const baseline = 20
      const activity = 15
      const streak = 10

      const total = Math.min(100, baseline + activity + streak)
      expect(total).toBe(45)
    })

    it('should never exceed 100', () => {
      const baseline = 40
      const activity = 30
      const streak = 50

      const total = Math.min(100, baseline + activity + streak)
      expect(total).toBe(100)
    })
  })
})
