import { describe, it, expect } from 'vitest'
import type { Quest, QuestsResponse, CompleteQuestResult, ResetQuestResult } from './useQuests'

describe('useQuests types', () => {
  describe('Quest type', () => {
    it('should have all required properties', () => {
      const quest: Quest = {
        id: 'quest-1',
        templateId: 'template-1',
        name: 'Daily Steps',
        description: 'Walk 10,000 steps',
        type: 'DAILY',
        category: 'MOVEMENT',
        requirement: { type: 'numeric', metric: 'steps', operator: 'gte', value: 10000 },
        baseXP: 50,
        statType: 'AGI',
        statBonus: 1,
        allowPartial: false,
        minPartialPercent: null,
        isCore: true,
        status: 'ACTIVE',
        currentValue: 5000,
        targetValue: 10000,
        completionPercent: 50,
        completedAt: null,
        xpAwarded: null,
        questDate: '2026-01-18',
      }

      expect(quest.id).toBe('quest-1')
      expect(quest.name).toBe('Daily Steps')
      expect(quest.baseXP).toBe(50)
      expect(quest.isCore).toBe(true)
    })

    it('should support all quest types', () => {
      const types: Quest['type'][] = ['DAILY', 'WEEKLY', 'DUNGEON', 'BOSS']
      expect(types.length).toBe(4)
    })

    it('should support all quest categories', () => {
      const categories: Quest['category'][] = [
        'MOVEMENT',
        'STRENGTH',
        'RECOVERY',
        'NUTRITION',
        'DISCIPLINE',
      ]
      expect(categories.length).toBe(5)
    })

    it('should support all stat types', () => {
      const statTypes: Quest['statType'][] = ['STR', 'AGI', 'VIT', 'DISC']
      expect(statTypes.length).toBe(4)
    })

    it('should support all status values', () => {
      const statuses: Quest['status'][] = ['ACTIVE', 'COMPLETED', 'FAILED', 'EXPIRED']
      expect(statuses.length).toBe(4)
    })

    it('should handle completed quest with awarded XP', () => {
      const completedQuest: Quest = {
        id: 'quest-2',
        templateId: 'template-2',
        name: 'Morning Workout',
        description: '30 minute workout',
        type: 'DAILY',
        category: 'STRENGTH',
        requirement: { type: 'boolean', metric: 'workout_completed', expected: true },
        baseXP: 75,
        statType: 'STR',
        statBonus: 2,
        allowPartial: false,
        minPartialPercent: null,
        isCore: true,
        status: 'COMPLETED',
        currentValue: 1,
        targetValue: 1,
        completionPercent: 100,
        completedAt: '2026-01-18T09:00:00Z',
        xpAwarded: 82, // With bonuses
        questDate: '2026-01-18',
      }

      expect(completedQuest.status).toBe('COMPLETED')
      expect(completedQuest.xpAwarded).toBe(82)
      expect(completedQuest.completionPercent).toBe(100)
      expect(completedQuest.completedAt).not.toBeNull()
    })

    it('should handle partial completion quests', () => {
      const partialQuest: Quest = {
        id: 'quest-3',
        templateId: 'template-3',
        name: 'Read Books',
        description: 'Read for 60 minutes',
        type: 'DAILY',
        category: 'DISCIPLINE',
        requirement: { type: 'numeric', metric: 'reading_minutes', operator: 'gte', value: 60 },
        baseXP: 40,
        statType: 'DISC',
        statBonus: 1,
        allowPartial: true,
        minPartialPercent: 50,
        isCore: false,
        status: 'ACTIVE',
        currentValue: 30,
        targetValue: 60,
        completionPercent: 50,
        completedAt: null,
        xpAwarded: null,
        questDate: '2026-01-18',
      }

      expect(partialQuest.allowPartial).toBe(true)
      expect(partialQuest.minPartialPercent).toBe(50)
      expect(partialQuest.completionPercent).toBe(50)
    })
  })

  describe('QuestsResponse type', () => {
    it('should have quests array and date', () => {
      const response: QuestsResponse = {
        quests: [
          {
            id: 'quest-1',
            templateId: 'template-1',
            name: 'Quest 1',
            description: 'Description',
            type: 'DAILY',
            category: 'MOVEMENT',
            requirement: {},
            baseXP: 50,
            statType: 'AGI',
            statBonus: 1,
            allowPartial: false,
            minPartialPercent: null,
            isCore: true,
            status: 'ACTIVE',
            currentValue: 0,
            targetValue: 100,
            completionPercent: 0,
            completedAt: null,
            xpAwarded: null,
            questDate: '2026-01-18',
          },
        ],
        date: '2026-01-18',
      }

      expect(response.quests.length).toBe(1)
      expect(response.date).toBe('2026-01-18')
    })

    it('should handle empty quests array', () => {
      const response: QuestsResponse = {
        quests: [],
        date: '2026-01-18',
      }

      expect(response.quests.length).toBe(0)
      expect(response.date).toBe('2026-01-18')
    })
  })

  describe('CompleteQuestResult type', () => {
    it('should have all required properties for basic completion', () => {
      const result: CompleteQuestResult = {
        quest: {
          id: 'quest-1',
          templateId: 'template-1',
          name: 'Completed Quest',
          description: 'Description',
          type: 'DAILY',
          category: 'MOVEMENT',
          requirement: {},
          baseXP: 50,
          statType: 'AGI',
          statBonus: 1,
          allowPartial: false,
          minPartialPercent: null,
          isCore: true,
          status: 'COMPLETED',
          currentValue: 100,
          targetValue: 100,
          completionPercent: 100,
          completedAt: '2026-01-18T10:00:00Z',
          xpAwarded: 55,
          questDate: '2026-01-18',
        },
        xpAwarded: 55,
        leveledUp: false,
        message: 'Quest completed.',
      }

      expect(result.xpAwarded).toBe(55)
      expect(result.leveledUp).toBe(false)
      expect(result.message).toBe('Quest completed.')
    })

    it('should include newLevel when leveledUp is true', () => {
      const result: CompleteQuestResult = {
        quest: {
          id: 'quest-1',
          templateId: 'template-1',
          name: 'Level Up Quest',
          description: 'Description',
          type: 'DAILY',
          category: 'MOVEMENT',
          requirement: {},
          baseXP: 100,
          statType: 'AGI',
          statBonus: 1,
          allowPartial: false,
          minPartialPercent: null,
          isCore: true,
          status: 'COMPLETED',
          currentValue: 100,
          targetValue: 100,
          completionPercent: 100,
          completedAt: '2026-01-18T10:00:00Z',
          xpAwarded: 110,
          questDate: '2026-01-18',
        },
        xpAwarded: 110,
        leveledUp: true,
        newLevel: 5,
        message: 'Level 5 achieved.',
      }

      expect(result.leveledUp).toBe(true)
      expect(result.newLevel).toBe(5)
    })
  })

  describe('ResetQuestResult type', () => {
    it('should have all required properties', () => {
      const result: ResetQuestResult = {
        quest: {
          id: 'quest-1',
          templateId: 'template-1',
          name: 'Reset Quest',
          description: 'Description',
          type: 'DAILY',
          category: 'MOVEMENT',
          requirement: {},
          baseXP: 50,
          statType: 'AGI',
          statBonus: 1,
          allowPartial: false,
          minPartialPercent: null,
          isCore: true,
          status: 'ACTIVE',
          currentValue: 0,
          targetValue: 100,
          completionPercent: 0,
          completedAt: null,
          xpAwarded: null,
          questDate: '2026-01-18',
        },
        xpRemoved: 55,
        message: 'Quest reset.',
      }

      expect(result.xpRemoved).toBe(55)
      expect(result.message).toBe('Quest reset.')
      expect(result.quest.status).toBe('ACTIVE')
      expect(result.quest.xpAwarded).toBeNull()
    })
  })
})
