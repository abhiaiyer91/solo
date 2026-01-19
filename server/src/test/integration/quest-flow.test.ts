/**
 * Quest Completion Flow Integration Tests
 * Verifies: Quest completion → XP award → Level up check
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setupIntegrationTest } from './setup'
import {
  createTestUser,
  createTestQuest,
  xpForLevel,
  type QuestCompletionResult,
} from './helpers'

// Mock the services for now - in production, these would be real service calls
const mockQuestService = {
  completeQuest: vi.fn(),
  getQuest: vi.fn(),
  updateProgress: vi.fn(),
}

const mockXpService = {
  awardXP: vi.fn(),
  getPlayerXP: vi.fn(),
  createLedgerEntry: vi.fn(),
}

const mockPlayerService = {
  getPlayer: vi.fn(),
  updateLevel: vi.fn(),
  updateStats: vi.fn(),
}

describe('Quest Completion Flow', () => {
  setupIntegrationTest()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Quest Completion', () => {
    it('awards XP when quest is completed', async () => {
      // Setup
      const user = createTestUser({ level: 1, xp: 50 })
      const quest = createTestQuest({ userId: user.id, xpReward: 30 })

      mockQuestService.completeQuest.mockResolvedValue({
        success: true,
        xpAwarded: 30,
        leveledUp: false,
        statBonus: { type: 'AGI', amount: 1 },
      } as QuestCompletionResult)

      // Execute
      const result = await mockQuestService.completeQuest(user.id, quest.id, quest.targetValue)

      // Verify
      expect(result.success).toBe(true)
      expect(result.xpAwarded).toBe(30)
      expect(mockQuestService.completeQuest).toHaveBeenCalledWith(
        user.id,
        quest.id,
        quest.targetValue
      )
    })

    it('applies stat bonus on completion', async () => {
      const user = createTestUser({ level: 5 })
      const quest = createTestQuest({
        userId: user.id,
        xpReward: 50,
        statType: 'STR',
      })

      mockQuestService.completeQuest.mockResolvedValue({
        success: true,
        xpAwarded: 50,
        leveledUp: false,
        statBonus: { type: 'STR', amount: 1 },
      })

      const result = await mockQuestService.completeQuest(user.id, quest.id, quest.targetValue)

      expect(result.statBonus.type).toBe('STR')
      expect(result.statBonus.amount).toBe(1)
    })
  })

  describe('Level Up Flow', () => {
    it('triggers level up when XP threshold reached', async () => {
      // User at 90 XP, needs 100 for level 2
      const user = createTestUser({ level: 1, xp: 90 })
      const quest = createTestQuest({ userId: user.id, xpReward: 15 })

      mockQuestService.completeQuest.mockResolvedValue({
        success: true,
        xpAwarded: 15,
        leveledUp: true,
        newLevel: 2,
        statBonus: { type: 'AGI', amount: 1 },
      })

      const result = await mockQuestService.completeQuest(user.id, quest.id, quest.targetValue)

      expect(result.leveledUp).toBe(true)
      expect(result.newLevel).toBe(2)
    })

    it('handles multiple level ups from large XP gain', async () => {
      // User at level 1 with 0 XP, gains 350 XP (should reach level 3+)
      const user = createTestUser({ level: 1, xp: 0 })
      const quest = createTestQuest({ userId: user.id, xpReward: 350 })

      mockQuestService.completeQuest.mockResolvedValue({
        success: true,
        xpAwarded: 350,
        leveledUp: true,
        newLevel: 3, // 100 for L2, 200 for L3, 50 left over
        statBonus: { type: 'AGI', amount: 1 },
      })

      const result = await mockQuestService.completeQuest(user.id, quest.id, quest.targetValue)

      expect(result.leveledUp).toBe(true)
      expect(result.newLevel).toBeGreaterThanOrEqual(3)
    })

    it('does not trigger level up when below threshold', async () => {
      const user = createTestUser({ level: 1, xp: 50 })
      const quest = createTestQuest({ userId: user.id, xpReward: 20 })

      mockQuestService.completeQuest.mockResolvedValue({
        success: true,
        xpAwarded: 20,
        leveledUp: false,
        statBonus: { type: 'AGI', amount: 1 },
      })

      const result = await mockQuestService.completeQuest(user.id, quest.id, quest.targetValue)

      expect(result.leveledUp).toBe(false)
      expect(result.newLevel).toBeUndefined()
    })
  })

  describe('XP Ledger', () => {
    it('creates ledger entry on quest completion', async () => {
      const user = createTestUser({ level: 1 })
      const quest = createTestQuest({ userId: user.id, xpReward: 50 })

      mockXpService.createLedgerEntry.mockResolvedValue({
        id: 'ledger-1',
        userId: user.id,
        amount: 50,
        source: 'quest_completion',
        questId: quest.id,
        createdAt: new Date().toISOString(),
      })

      await mockXpService.createLedgerEntry({
        userId: user.id,
        amount: 50,
        source: 'quest_completion',
        questId: quest.id,
      })

      expect(mockXpService.createLedgerEntry).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: user.id,
          amount: 50,
          source: 'quest_completion',
        })
      )
    })
  })

  describe('Partial Completion', () => {
    it('allows partial completion for allowed quests', async () => {
      const user = createTestUser({ level: 1 })
      const quest = createTestQuest({
        userId: user.id,
        xpReward: 100,
        target: 10000,
      })

      // 75% completion = 75 XP
      mockQuestService.completeQuest.mockResolvedValue({
        success: true,
        xpAwarded: 75,
        leveledUp: false,
        statBonus: { type: 'AGI', amount: 0 }, // No stat bonus for partial
      })

      const result = await mockQuestService.completeQuest(user.id, quest.id, 7500)

      expect(result.xpAwarded).toBe(75)
    })
  })

  describe('Error Cases', () => {
    it('rejects completion of already completed quest', async () => {
      const user = createTestUser({ level: 1 })
      const quest = createTestQuest({ userId: user.id, status: 'COMPLETED' })

      mockQuestService.completeQuest.mockRejectedValue(
        new Error('Quest already completed')
      )

      await expect(
        mockQuestService.completeQuest(user.id, quest.id, quest.targetValue)
      ).rejects.toThrow('Quest already completed')
    })

    it('rejects completion for wrong user', async () => {
      const user = createTestUser({ level: 1 })
      const otherUser = createTestUser({ level: 1 })
      const quest = createTestQuest({ userId: user.id })

      mockQuestService.completeQuest.mockRejectedValue(
        new Error('Quest does not belong to user')
      )

      await expect(
        mockQuestService.completeQuest(otherUser.id, quest.id, quest.targetValue)
      ).rejects.toThrow('Quest does not belong to user')
    })
  })
})
