import { describe, it, expect, vi } from 'vitest'
import {
  getPlayerProgression,
  updateProgression,
  getUnlocks,
  checkUnlockEligibility,
  grantUnlock,
  getProgressionMilestones,
  calculateProgressToNextLevel,
  type PlayerProgression,
  type Unlock,
  type ProgressionMilestone,
} from './progression'

// Mock database
vi.mock('../db', () => ({
  dbClient: null,
}))

describe('Progression Service', () => {
  describe('getPlayerProgression', () => {
    it('should reject if database is not connected', async () => {
      await expect(getPlayerProgression('user-1')).rejects.toThrow(
        'Database connection required'
      )
    })
  })

  describe('updateProgression', () => {
    it('should reject if database is not connected', async () => {
      await expect(updateProgression('user-1', { xp: 100 })).rejects.toThrow(
        'Database connection required'
      )
    })
  })

  describe('getUnlocks', () => {
    it('should reject if database is not connected', async () => {
      await expect(getUnlocks('user-1')).rejects.toThrow(
        'Database connection required'
      )
    })
  })

  describe('checkUnlockEligibility', () => {
    it('should reject if database is not connected', async () => {
      await expect(checkUnlockEligibility('user-1', 'feature-bosses')).rejects.toThrow(
        'Database connection required'
      )
    })
  })

  describe('grantUnlock', () => {
    it('should reject if database is not connected', async () => {
      await expect(grantUnlock('user-1', 'feature-bosses')).rejects.toThrow(
        'Database connection required'
      )
    })
  })

  describe('getProgressionMilestones', () => {
    it('should return all progression milestones', async () => {
      const milestones = await getProgressionMilestones()
      
      expect(Array.isArray(milestones)).toBe(true)
      expect(milestones.length).toBeGreaterThan(0)
      
      for (const milestone of milestones) {
        expect(milestone.id).toBeDefined()
        expect(milestone.name).toBeDefined()
        expect(milestone.levelRequired).toBeGreaterThan(0)
        expect(milestone.type).toBeDefined()
      }
    })

    it('should include boss system unlock', async () => {
      const milestones = await getProgressionMilestones()
      const bossUnlock = milestones.find(m => m.id === 'feature-bosses')
      
      expect(bossUnlock).toBeDefined()
      expect(bossUnlock?.levelRequired).toBe(5)
    })

    it('should include dungeon system unlock', async () => {
      const milestones = await getProgressionMilestones()
      const dungeonUnlock = milestones.find(m => m.id === 'feature-dungeons')
      
      expect(dungeonUnlock).toBeDefined()
      expect(dungeonUnlock?.levelRequired).toBe(10)
    })
  })

  describe('calculateProgressToNextLevel', () => {
    it('should calculate progress percentage', () => {
      const progress = calculateProgressToNextLevel(5, 2500)
      
      expect(progress.currentLevel).toBe(5)
      expect(progress.currentXP).toBe(2500)
      expect(progress.xpToNextLevel).toBeGreaterThan(0)
      expect(progress.progressPercent).toBeGreaterThanOrEqual(0)
      expect(progress.progressPercent).toBeLessThanOrEqual(100)
    })

    it('should handle level 1', () => {
      const progress = calculateProgressToNextLevel(1, 50)
      
      expect(progress.currentLevel).toBe(1)
      expect(progress.progressPercent).toBeGreaterThan(0)
    })

    it('should handle max level', () => {
      const progress = calculateProgressToNextLevel(100, 999999)
      
      expect(progress.currentLevel).toBe(100)
      expect(progress.xpToNextLevel).toBe(0)
      expect(progress.progressPercent).toBe(100)
    })
  })

  describe('PlayerProgression type', () => {
    it('should define progression structure', () => {
      const progression: PlayerProgression = {
        userId: 'user-1',
        level: 15,
        currentXP: 7500,
        totalXP: 25000,
        streak: 14,
        longestStreak: 30,
        perfectDays: 45,
        questsCompleted: 350,
        unlockedFeatures: ['bosses', 'dungeons', 'guilds'],
      }
      
      expect(progression.level).toBe(15)
    })
  })

  describe('Unlock type', () => {
    it('should define unlock structure', () => {
      const unlock: Unlock = {
        id: 'feature-bosses',
        name: 'Boss Fights',
        description: 'Challenge powerful bosses',
        type: 'feature',
        levelRequired: 5,
        unlockedAt: new Date().toISOString(),
      }
      
      expect(unlock.type).toBe('feature')
    })
  })

  describe('ProgressionMilestone type', () => {
    it('should define milestone structure', () => {
      const milestone: ProgressionMilestone = {
        id: 'feature-hard-mode',
        name: 'Hard Mode',
        description: 'Unlock the ultimate challenge',
        type: 'feature',
        levelRequired: 25,
        reward: {
          type: 'title',
          value: 'The Ambitious',
        },
      }
      
      expect(milestone.reward?.type).toBe('title')
    })
  })
})
