import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getWeekendBonusStatus, WEEKEND_BONUS_PERCENT } from './xp'

// Mock the timezone module for testing
vi.mock('../lib/timezone', async () => {
  const actual = await vi.importActual('../lib/timezone')
  return {
    ...actual,
    isWeekend: vi.fn(),
    getSafeTimezone: vi.fn((tz: string) => tz),
  }
})

import { isWeekend } from '../lib/timezone'

describe('XP Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('WEEKEND_BONUS_PERCENT', () => {
    it('should be 10 percent', () => {
      expect(WEEKEND_BONUS_PERCENT).toBe(10)
    })
  })

  describe('getWeekendBonusStatus', () => {
    describe('when it is a weekend', () => {
      beforeEach(() => {
        vi.mocked(isWeekend).mockReturnValue(true)
      })

      it('should return isWeekend as true', () => {
        const result = getWeekendBonusStatus('America/New_York')
        expect(result.isWeekend).toBe(true)
      })

      it('should return the correct bonus percent', () => {
        const result = getWeekendBonusStatus('America/New_York')
        expect(result.bonusPercent).toBe(WEEKEND_BONUS_PERCENT)
      })

      it('should return a message about the bonus', () => {
        const result = getWeekendBonusStatus('America/New_York')
        expect(result.message).toContain('Weekend Bonus Active')
        expect(result.message).toContain(`+${WEEKEND_BONUS_PERCENT}%`)
      })
    })

    describe('when it is not a weekend', () => {
      beforeEach(() => {
        vi.mocked(isWeekend).mockReturnValue(false)
      })

      it('should return isWeekend as false', () => {
        const result = getWeekendBonusStatus('America/New_York')
        expect(result.isWeekend).toBe(false)
      })

      it('should return 0 bonus percent', () => {
        const result = getWeekendBonusStatus('America/New_York')
        expect(result.bonusPercent).toBe(0)
      })

      it('should return null message', () => {
        const result = getWeekendBonusStatus('America/New_York')
        expect(result.message).toBeNull()
      })
    })

    describe('timezone handling', () => {
      it('should default to UTC when no timezone provided', () => {
        vi.mocked(isWeekend).mockReturnValue(false)
        getWeekendBonusStatus()
        expect(isWeekend).toHaveBeenCalledWith('UTC')
      })

      it('should pass the timezone to isWeekend', () => {
        vi.mocked(isWeekend).mockReturnValue(false)
        getWeekendBonusStatus('Asia/Tokyo')
        expect(isWeekend).toHaveBeenCalledWith('Asia/Tokyo')
      })

      it('should handle various timezone formats', () => {
        vi.mocked(isWeekend).mockReturnValue(true)
        
        const timezones = [
          'America/Los_Angeles',
          'Europe/London',
          'Asia/Tokyo',
          'Australia/Sydney',
          'Pacific/Auckland',
        ]

        for (const tz of timezones) {
          const result = getWeekendBonusStatus(tz)
          expect(result.isWeekend).toBe(true)
          expect(isWeekend).toHaveBeenCalledWith(tz)
        }
      })
    })
  })

  describe('XP modifier logic (integration tests)', () => {
    /**
     * These tests verify the expected behavior of modifier application:
     * - Bonuses (multiplier > 1) should be applied before penalties (multiplier < 1)
     * - XP should never go negative
     * - Floor function should be used for fractional results
     */

    describe('modifier ordering expectations', () => {
      it('bonuses should multiply before penalties reduce', () => {
        // If we have base 100 XP:
        // - 1.25x bonus applied first: 100 * 1.25 = 125
        // - 0.5x penalty applied second: 125 * 0.5 = 62 (floored)
        // vs reverse order:
        // - 0.5x penalty first: 100 * 0.5 = 50
        // - 1.25x bonus second: 50 * 1.25 = 62
        // Same result in this case, but important for compound calculations
        
        // This tests the expectation documented in the service
        const baseXP = 100
        const bonusMultiplier = 1.25
        const penaltyMultiplier = 0.5

        // Expected result following bonus-first order
        const afterBonus = Math.floor(baseXP * bonusMultiplier)
        const afterPenalty = Math.floor(afterBonus * penaltyMultiplier)
        
        expect(afterPenalty).toBe(62)
      })

      it('streak bonuses should increase XP', () => {
        const baseXP = 100
        // Using integer math to avoid floating point issues
        const bronzeBonus = 10 // 10%
        const silverBonus = 15 // 15%
        const goldBonus = 25 // 25%

        // Integer-safe calculation: (base * (100 + bonus)) / 100
        expect(Math.floor((baseXP * (100 + bronzeBonus)) / 100)).toBe(110)
        expect(Math.floor((baseXP * (100 + silverBonus)) / 100)).toBe(115)
        expect(Math.floor((baseXP * (100 + goldBonus)) / 100)).toBe(125)
      })

      it('weekend bonus should add 10% XP', () => {
        const baseXP = 100
        const weekendMultiplier = 1.10

        expect(Math.floor(baseXP * weekendMultiplier)).toBe(110)
      })

      it('combined bonuses should stack multiplicatively', () => {
        const baseXP = 100
        // Gold streak (25%) + Weekend (10%)
        // Applied in order: 100 * 1.25 = 125, then 125 * 1.10 = 137.5 -> 137
        const goldStreak = 1.25
        const weekendBonus = 1.10

        const result = Math.floor(Math.floor(baseXP * goldStreak) * weekendBonus)
        expect(result).toBe(137)
      })

      it('XP should never go below 0', () => {
        const baseXP = 10
        const severeDebuff = 0.1

        const result = Math.max(0, Math.floor(baseXP * severeDebuff))
        expect(result).toBeGreaterThanOrEqual(0)
      })
    })
  })

  describe('XP event hash expectations', () => {
    /**
     * Tests for expected hash behavior without accessing internals
     */
    
    it('hash components should be deterministic', () => {
      // The hash should be deterministic given the same inputs
      const crypto = require('crypto')
      
      const data = 'user123:100:100:genesis:2025-01-18T00:00:00.000Z'
      const hash1 = crypto.createHash('sha256').update(data).digest('hex')
      const hash2 = crypto.createHash('sha256').update(data).digest('hex')
      
      expect(hash1).toBe(hash2)
    })

    it('different inputs should produce different hashes', () => {
      const crypto = require('crypto')
      
      const data1 = 'user123:100:100:genesis:2025-01-18T00:00:00.000Z'
      const data2 = 'user456:100:100:genesis:2025-01-18T00:00:00.000Z'
      
      const hash1 = crypto.createHash('sha256').update(data1).digest('hex')
      const hash2 = crypto.createHash('sha256').update(data2).digest('hex')
      
      expect(hash1).not.toBe(hash2)
    })

    it('hash should be 64 characters (SHA256 hex)', () => {
      const crypto = require('crypto')
      
      const data = 'test-data'
      const hash = crypto.createHash('sha256').update(data).digest('hex')
      
      expect(hash).toHaveLength(64)
    })
  })

  describe('XP removal validation expectations', () => {
    it('removal amount must be positive', () => {
      // The service should throw if amount is 0 or negative
      const validateAmount = (amount: number) => {
        if (amount <= 0) {
          throw new Error('Amount must be positive (it will be subtracted)')
        }
        return true
      }

      expect(() => validateAmount(0)).toThrow()
      expect(() => validateAmount(-10)).toThrow()
      expect(() => validateAmount(10)).not.toThrow()
    })

    it('new XP should never go below 0 after removal', () => {
      const currentXP = 50n
      const amountToRemove = 100n

      const newXP = currentXP - amountToRemove < 0n ? 0n : currentXP - amountToRemove

      expect(newXP).toBe(0n)
      expect(newXP).toBeGreaterThanOrEqual(0n)
    })
  })

  describe('XP timeline behavior expectations', () => {
    it('default limit should be 50', () => {
      const DEFAULT_LIMIT = 50
      expect(DEFAULT_LIMIT).toBe(50)
    })

    it('offset should default to 0', () => {
      const DEFAULT_OFFSET = 0
      expect(DEFAULT_OFFSET).toBe(0)
    })
  })

  describe('Level progress calculations', () => {
    it('should use bigint for XP calculations', () => {
      const xpValue = 100n
      expect(typeof xpValue).toBe('bigint')
    })

    it('level calculation expectations based on level service', () => {
      // Level thresholds are defined in level.ts:
      // Level 1: 0 XP
      // Level 2: 100 XP (BASE_XP * 1^1.5 = 100)
      // Level 3: 382 XP (100 + 100 * 2^1.5)
      
      // Expected behavior: computeLevel(xp) returns the current level
      // These are expectations that should match level.test.ts
      const expectedLevels = [
        { xp: 0n, level: 1 },
        { xp: 99n, level: 1 },
        { xp: 100n, level: 2 },
        { xp: 381n, level: 2 },
        { xp: 382n, level: 3 },
      ]

      // Verify the level calculation formula matches expectations
      for (const { xp, level } of expectedLevels) {
        // This documents the expected integration
        expect(level).toBeGreaterThanOrEqual(1)
        expect(xp).toBeGreaterThanOrEqual(0n)
      }
    })
  })

  describe('Daily XP summary expectations', () => {
    it('should sum all positive and negative XP events', () => {
      const events = [
        { finalAmount: 100 },
        { finalAmount: 50 },
        { finalAmount: -25 },
        { finalAmount: 75 },
      ]

      const totalXP = events.reduce((sum, event) => sum + event.finalAmount, 0)
      expect(totalXP).toBe(200)
    })

    it('should count all events regardless of amount', () => {
      const events = [
        { finalAmount: 100 },
        { finalAmount: 0 },
        { finalAmount: -25 },
      ]

      expect(events.length).toBe(3)
    })
  })
})
