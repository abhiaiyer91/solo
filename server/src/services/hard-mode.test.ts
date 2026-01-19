import { describe, it, expect, vi } from 'vitest'
import {
  isHardModeUnlocked,
  enableHardMode,
  disableHardMode,
  getHardModeStatus,
  getHardModeMultipliers,
  calculateHardModeXP,
  getHardModeQuests,
  type HardModeStatus,
  type HardModeMultipliers,
  HARD_MODE_UNLOCK_LEVEL,
  HARD_MODE_MULTIPLIER,
} from './hard-mode'

// Mock database
vi.mock('../db', () => ({
  dbClient: null,
}))

describe('Hard Mode Service', () => {
  describe('isHardModeUnlocked', () => {
    it('should reject if database is not connected', async () => {
      await expect(isHardModeUnlocked('user-1')).rejects.toThrow(
        'Database connection required'
      )
    })
  })

  describe('enableHardMode', () => {
    it('should reject if database is not connected', async () => {
      await expect(enableHardMode('user-1')).rejects.toThrow(
        'Database connection required'
      )
    })
  })

  describe('disableHardMode', () => {
    it('should reject if database is not connected', async () => {
      await expect(disableHardMode('user-1')).rejects.toThrow(
        'Database connection required'
      )
    })
  })

  describe('getHardModeStatus', () => {
    it('should reject if database is not connected', async () => {
      await expect(getHardModeStatus('user-1')).rejects.toThrow(
        'Database connection required'
      )
    })
  })

  describe('getHardModeMultipliers', () => {
    it('should return multipliers for hard mode', () => {
      const multipliers = getHardModeMultipliers()
      
      expect(multipliers.xpMultiplier).toBeGreaterThan(1)
      expect(multipliers.streakPenaltyMultiplier).toBeGreaterThan(1)
      expect(multipliers.questDifficultyMultiplier).toBeGreaterThan(1)
    })

    it('should have XP multiplier matching constant', () => {
      const multipliers = getHardModeMultipliers()
      expect(multipliers.xpMultiplier).toBe(HARD_MODE_MULTIPLIER)
    })
  })

  describe('calculateHardModeXP', () => {
    it('should multiply base XP by hard mode multiplier', () => {
      const baseXP = 100
      const hardModeXP = calculateHardModeXP(baseXP)
      
      expect(hardModeXP).toBe(baseXP * HARD_MODE_MULTIPLIER)
    })

    it('should handle zero XP', () => {
      expect(calculateHardModeXP(0)).toBe(0)
    })

    it('should round to nearest integer', () => {
      const xp = calculateHardModeXP(33)
      expect(Number.isInteger(xp)).toBe(true)
    })
  })

  describe('getHardModeQuests', () => {
    it('should return hard mode quest variants', async () => {
      const quests = await getHardModeQuests()
      
      expect(Array.isArray(quests)).toBe(true)
      
      for (const quest of quests) {
        expect(quest.isHardMode).toBe(true)
        expect(quest.targetValue).toBeGreaterThan(0)
        expect(quest.xpReward).toBeGreaterThan(0)
      }
    })
  })

  describe('Constants', () => {
    it('should export HARD_MODE_UNLOCK_LEVEL', () => {
      expect(HARD_MODE_UNLOCK_LEVEL).toBeGreaterThan(0)
      expect(HARD_MODE_UNLOCK_LEVEL).toBe(25)
    })

    it('should export HARD_MODE_MULTIPLIER', () => {
      expect(HARD_MODE_MULTIPLIER).toBeGreaterThan(1)
      expect(HARD_MODE_MULTIPLIER).toBe(1.5)
    })
  })

  describe('HardModeStatus type', () => {
    it('should have required properties', () => {
      const status: HardModeStatus = {
        unlocked: true,
        enabled: true,
        unlockedAt: new Date().toISOString(),
        enabledAt: new Date().toISOString(),
        totalHardModeXP: 5000,
        hardModeStreak: 14,
      }
      
      expect(status.unlocked).toBe(true)
      expect(status.enabled).toBe(true)
    })
  })

  describe('HardModeMultipliers type', () => {
    it('should define all multiplier fields', () => {
      const multipliers: HardModeMultipliers = {
        xpMultiplier: 1.5,
        streakPenaltyMultiplier: 2.0,
        questDifficultyMultiplier: 1.25,
        bossRequirementMultiplier: 1.5,
      }
      
      expect(Object.keys(multipliers).length).toBe(4)
    })
  })
})
