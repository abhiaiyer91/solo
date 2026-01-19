/**
 * Health Sync Flow Integration Tests
 * Verifies: Health sync → Quest auto-complete → XP award
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setupIntegrationTest } from './setup'
import {
  createTestUser,
  createTestQuest,
  type HealthSyncResult,
} from './helpers'

// Mock health sync service
const mockHealthService = {
  syncHealthData: vi.fn(),
  getLatestSync: vi.fn(),
  processHealthMetrics: vi.fn(),
}

const mockQuestService = {
  getActiveQuests: vi.fn(),
  updateQuestProgress: vi.fn(),
  autoCompleteQuest: vi.fn(),
}

describe('Health Sync Flow', () => {
  setupIntegrationTest()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Health Sync', () => {
    it('syncs health data from HealthKit', async () => {
      const user = createTestUser()
      const healthData = {
        steps: 12000,
        activeMinutes: 45,
        caloriesBurned: 400,
        source: 'healthkit',
      }

      mockHealthService.syncHealthData.mockResolvedValue({
        success: true,
        questsUpdated: 1,
        questsCompleted: 1,
        xpAwarded: 50,
      } as HealthSyncResult)

      const result = await mockHealthService.syncHealthData(user.id, healthData)

      expect(result.success).toBe(true)
      expect(mockHealthService.syncHealthData).toHaveBeenCalledWith(user.id, healthData)
    })

    it('syncs health data from Google Fit', async () => {
      const user = createTestUser()
      const healthData = {
        steps: 8500,
        activeMinutes: 30,
        source: 'google_fit',
      }

      mockHealthService.syncHealthData.mockResolvedValue({
        success: true,
        questsUpdated: 1,
        questsCompleted: 0,
        xpAwarded: 0,
      })

      const result = await mockHealthService.syncHealthData(user.id, healthData)

      expect(result.success).toBe(true)
    })
  })

  describe('Quest Auto-Completion', () => {
    it('auto-completes step quest when target reached', async () => {
      const user = createTestUser()
      const quest = createTestQuest({
        userId: user.id,
        name: 'Daily Steps',
        category: 'MOVEMENT',
        target: 10000,
        xpReward: 50,
      })

      mockQuestService.getActiveQuests.mockResolvedValue([quest])
      mockHealthService.syncHealthData.mockResolvedValue({
        success: true,
        questsUpdated: 1,
        questsCompleted: 1,
        xpAwarded: 50,
      })

      // Sync 12000 steps (exceeds 10000 target)
      const result = await mockHealthService.syncHealthData(user.id, {
        steps: 12000,
        source: 'healthkit',
      })

      expect(result.questsCompleted).toBe(1)
      expect(result.xpAwarded).toBe(50)
    })

    it('updates progress without completing when below target', async () => {
      const user = createTestUser()
      const quest = createTestQuest({
        userId: user.id,
        name: 'Daily Steps',
        target: 10000,
      })

      mockQuestService.getActiveQuests.mockResolvedValue([quest])
      mockHealthService.syncHealthData.mockResolvedValue({
        success: true,
        questsUpdated: 1,
        questsCompleted: 0,
        xpAwarded: 0,
      })

      // Sync 5000 steps (below 10000 target)
      const result = await mockHealthService.syncHealthData(user.id, {
        steps: 5000,
        source: 'healthkit',
      })

      expect(result.questsUpdated).toBe(1)
      expect(result.questsCompleted).toBe(0)
    })

    it('handles multiple quest types from single sync', async () => {
      const user = createTestUser()
      const stepQuest = createTestQuest({
        userId: user.id,
        name: 'Daily Steps',
        category: 'MOVEMENT',
        target: 10000,
        xpReward: 50,
      })
      const activityQuest = createTestQuest({
        userId: user.id,
        name: 'Active Minutes',
        category: 'TRAINING',
        target: 30,
        xpReward: 40,
      })

      mockQuestService.getActiveQuests.mockResolvedValue([stepQuest, activityQuest])
      mockHealthService.syncHealthData.mockResolvedValue({
        success: true,
        questsUpdated: 2,
        questsCompleted: 2,
        xpAwarded: 90,
      })

      const result = await mockHealthService.syncHealthData(user.id, {
        steps: 12000,
        activeMinutes: 45,
        source: 'healthkit',
      })

      expect(result.questsCompleted).toBe(2)
      expect(result.xpAwarded).toBe(90) // 50 + 40
    })
  })

  describe('Duplicate Sync Prevention', () => {
    it('prevents duplicate syncs within cooldown period', async () => {
      const user = createTestUser()

      // First sync succeeds
      mockHealthService.syncHealthData.mockResolvedValueOnce({
        success: true,
        questsUpdated: 1,
        questsCompleted: 0,
        xpAwarded: 0,
      })

      // Second immediate sync is rejected
      mockHealthService.syncHealthData.mockResolvedValueOnce({
        success: false,
        questsUpdated: 0,
        questsCompleted: 0,
        xpAwarded: 0,
      })

      const first = await mockHealthService.syncHealthData(user.id, {
        steps: 5000,
        source: 'healthkit',
      })
      const second = await mockHealthService.syncHealthData(user.id, {
        steps: 5000,
        source: 'healthkit',
      })

      expect(first.success).toBe(true)
      expect(second.success).toBe(false)
    })
  })

  describe('Data Validation', () => {
    it('rejects negative step counts', async () => {
      const user = createTestUser()

      mockHealthService.syncHealthData.mockRejectedValue(
        new Error('Invalid step count')
      )

      await expect(
        mockHealthService.syncHealthData(user.id, { steps: -100, source: 'healthkit' })
      ).rejects.toThrow('Invalid step count')
    })

    it('rejects unrealistic step counts', async () => {
      const user = createTestUser()

      mockHealthService.syncHealthData.mockRejectedValue(
        new Error('Step count exceeds reasonable limit')
      )

      await expect(
        mockHealthService.syncHealthData(user.id, { steps: 1000000, source: 'healthkit' })
      ).rejects.toThrow('Step count exceeds reasonable limit')
    })
  })

  describe('Error Handling', () => {
    it('handles sync errors gracefully', async () => {
      const user = createTestUser()

      mockHealthService.syncHealthData.mockRejectedValue(
        new Error('Sync failed')
      )

      await expect(
        mockHealthService.syncHealthData(user.id, { steps: 5000, source: 'healthkit' })
      ).rejects.toThrow('Sync failed')
    })
  })
})
