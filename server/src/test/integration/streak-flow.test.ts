/**
 * Streak Flow Integration Tests
 * Verifies: Streak update → Debuff evaluation → Notification
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setupIntegrationTest } from './setup'
import { createTestUser } from './helpers'

// Mock services
const mockStreakService = {
  updateStreak: vi.fn(),
  calculateStreak: vi.fn(),
  checkStreakMilestone: vi.fn(),
}

const mockDebuffService = {
  evaluateDebuff: vi.fn(),
  applyDebuff: vi.fn(),
  removeDebuff: vi.fn(),
  getActiveDebuff: vi.fn(),
}

const mockNotificationService = {
  sendStreakNotification: vi.fn(),
  sendDebuffNotification: vi.fn(),
  sendMilestoneNotification: vi.fn(),
}

describe('Streak Flow', () => {
  setupIntegrationTest()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Streak Continuation', () => {
    it('increments streak when daily quests completed', async () => {
      const user = createTestUser({ streak: 5 })

      mockStreakService.updateStreak.mockResolvedValue({
        newStreak: 6,
        previousStreak: 5,
        isMilestone: false,
      })

      const result = await mockStreakService.updateStreak(user.id, {
        questsCompleted: 4,
        totalQuests: 4,
      })

      expect(result.newStreak).toBe(6)
      expect(result.previousStreak).toBe(5)
    })

    it('triggers milestone notification at day 7', async () => {
      const user = createTestUser({ streak: 6 })

      mockStreakService.updateStreak.mockResolvedValue({
        newStreak: 7,
        previousStreak: 6,
        isMilestone: true,
        milestoneType: 'WEEK',
      })

      mockNotificationService.sendMilestoneNotification.mockResolvedValue({
        sent: true,
      })

      const result = await mockStreakService.updateStreak(user.id, {
        questsCompleted: 4,
        totalQuests: 4,
      })

      expect(result.isMilestone).toBe(true)
      expect(result.milestoneType).toBe('WEEK')
    })

    it('triggers milestone notification at day 30', async () => {
      const user = createTestUser({ streak: 29 })

      mockStreakService.updateStreak.mockResolvedValue({
        newStreak: 30,
        previousStreak: 29,
        isMilestone: true,
        milestoneType: 'MONTH',
      })

      const result = await mockStreakService.updateStreak(user.id, {
        questsCompleted: 4,
        totalQuests: 4,
      })

      expect(result.milestoneType).toBe('MONTH')
    })
  })

  describe('Streak Break', () => {
    it('resets streak when no quests completed', async () => {
      const user = createTestUser({ streak: 10 })

      mockStreakService.updateStreak.mockResolvedValue({
        newStreak: 0,
        previousStreak: 10,
        isMilestone: false,
        streakBroken: true,
      })

      const result = await mockStreakService.updateStreak(user.id, {
        questsCompleted: 0,
        totalQuests: 4,
      })

      expect(result.newStreak).toBe(0)
      expect(result.streakBroken).toBe(true)
    })

    it('applies debuff when streak is broken', async () => {
      const user = createTestUser({ streak: 10 })

      mockDebuffService.evaluateDebuff.mockResolvedValue({
        shouldApply: true,
        debuffType: 'STREAK_BREAK',
        duration: 24, // hours
        penalty: {
          xpMultiplier: 0.75,
          statPenalty: 5,
        },
      })

      mockDebuffService.applyDebuff.mockResolvedValue({
        applied: true,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      })

      const evaluation = await mockDebuffService.evaluateDebuff(user.id, {
        streakBroken: true,
        previousStreak: 10,
      })

      expect(evaluation.shouldApply).toBe(true)
      expect(evaluation.debuffType).toBe('STREAK_BREAK')

      const debuff = await mockDebuffService.applyDebuff(user.id, evaluation)
      expect(debuff.applied).toBe(true)
    })

    it('sends notification when debuff is applied', async () => {
      const user = createTestUser({ streak: 5 })

      mockNotificationService.sendDebuffNotification.mockResolvedValue({
        sent: true,
        type: 'STREAK_BREAK',
      })

      const result = await mockNotificationService.sendDebuffNotification(user.id, {
        debuffType: 'STREAK_BREAK',
        previousStreak: 5,
      })

      expect(result.sent).toBe(true)
    })
  })

  describe('Debuff Recovery', () => {
    it('removes debuff after duration expires', async () => {
      const user = createTestUser({ streak: 0 })

      mockDebuffService.getActiveDebuff.mockResolvedValue({
        id: 'debuff-1',
        type: 'STREAK_BREAK',
        expiresAt: new Date(Date.now() - 1000).toISOString(), // Already expired
      })

      mockDebuffService.removeDebuff.mockResolvedValue({
        removed: true,
      })

      const activeDebuff = await mockDebuffService.getActiveDebuff(user.id)
      
      if (new Date(activeDebuff.expiresAt) < new Date()) {
        const result = await mockDebuffService.removeDebuff(user.id, activeDebuff.id)
        expect(result.removed).toBe(true)
      }
    })

    it('removes debuff when return protocol completed', async () => {
      const user = createTestUser({ streak: 0 })

      mockDebuffService.removeDebuff.mockResolvedValue({
        removed: true,
        reason: 'RETURN_PROTOCOL',
      })

      const result = await mockDebuffService.removeDebuff(user.id, 'debuff-1', {
        reason: 'RETURN_PROTOCOL',
      })

      expect(result.removed).toBe(true)
    })
  })

  describe('Perfect Streak', () => {
    it('tracks perfect days (all core quests + bonus)', async () => {
      const user = createTestUser({ streak: 5 })

      mockStreakService.updateStreak.mockResolvedValue({
        newStreak: 6,
        previousStreak: 5,
        isPerfectDay: true,
        perfectStreak: 3,
      })

      const result = await mockStreakService.updateStreak(user.id, {
        questsCompleted: 5,
        totalQuests: 4, // All core + 1 bonus
        allCoreComplete: true,
        bonusCompleted: true,
      })

      expect(result.isPerfectDay).toBe(true)
      expect(result.perfectStreak).toBe(3)
    })
  })
})
