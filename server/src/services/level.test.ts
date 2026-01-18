import { describe, it, expect } from 'vitest'
import {
  computeLevelThreshold,
  computeLevel,
  xpToNextLevel,
  getLevelThresholds,
} from './level'

describe('Level Service', () => {
  describe('computeLevelThreshold', () => {
    it('should return 0 for level 1', () => {
      expect(computeLevelThreshold(1)).toBe(0n)
    })

    it('should return 0 for level 0 or negative', () => {
      expect(computeLevelThreshold(0)).toBe(0n)
      expect(computeLevelThreshold(-1)).toBe(0n)
    })

    it('should return 100 XP for level 2 (BASE_XP * 1^1.5 = 100)', () => {
      // Level 2 requires completing level 1 threshold
      // XP needed from 1 to 2 = 100 * 1^1.5 = 100
      expect(computeLevelThreshold(2)).toBe(100n)
    })

    it('should calculate cumulative XP for level 3', () => {
      // Level 2: 100 * 1^1.5 = 100
      // Level 3: 100 * 2^1.5 = 282 (approx)
      // Total: 100 + 282 = 382
      const threshold = computeLevelThreshold(3)
      expect(threshold).toBe(382n)
    })

    it('should increase thresholds progressively', () => {
      const level2 = computeLevelThreshold(2)
      const level3 = computeLevelThreshold(3)
      const level4 = computeLevelThreshold(4)
      const level5 = computeLevelThreshold(5)

      // Each level requires more XP than the last
      expect(level3 > level2).toBe(true)
      expect(level4 > level3).toBe(true)
      expect(level5 > level4).toBe(true)

      // Verify the progression is increasing
      const diff23 = level3 - level2
      const diff34 = level4 - level3
      const diff45 = level5 - level4

      expect(diff34 > diff23).toBe(true)
      expect(diff45 > diff34).toBe(true)
    })
  })

  describe('computeLevel', () => {
    it('should return level 1 for 0 XP', () => {
      expect(computeLevel(0n)).toBe(1)
    })

    it('should return level 1 for XP below level 2 threshold', () => {
      expect(computeLevel(50n)).toBe(1)
      expect(computeLevel(99n)).toBe(1)
    })

    it('should return level 2 at exactly 100 XP', () => {
      expect(computeLevel(100n)).toBe(2)
    })

    it('should return level 2 for XP between level 2 and 3 thresholds', () => {
      expect(computeLevel(200n)).toBe(2)
      expect(computeLevel(381n)).toBe(2)
    })

    it('should return level 3 at 382 XP threshold', () => {
      expect(computeLevel(382n)).toBe(3)
    })

    it('should handle large XP values', () => {
      // Test with very large XP
      const level = computeLevel(1000000n)
      expect(level).toBeGreaterThan(1)
    })

    it('should be consistent with computeLevelThreshold', () => {
      // For any level, XP at threshold should compute back to that level
      for (let targetLevel = 2; targetLevel <= 10; targetLevel++) {
        const threshold = computeLevelThreshold(targetLevel)
        expect(computeLevel(threshold)).toBe(targetLevel)

        // XP just below threshold should be previous level
        if (threshold > 0n) {
          expect(computeLevel(threshold - 1n)).toBe(targetLevel - 1)
        }
      }
    })
  })

  describe('xpToNextLevel', () => {
    it('should calculate progress for level 1 player', () => {
      const result = xpToNextLevel(0n)

      expect(result.currentLevel).toBe(1)
      expect(result.xpForCurrentLevel).toBe(0n)
      expect(result.xpForNextLevel).toBe(100n)
      expect(result.xpProgress).toBe(0n)
      expect(result.xpNeeded).toBe(100n)
      expect(result.progressPercent).toBe(0)
    })

    it('should calculate progress at 50 XP', () => {
      const result = xpToNextLevel(50n)

      expect(result.currentLevel).toBe(1)
      expect(result.xpProgress).toBe(50n)
      expect(result.xpNeeded).toBe(100n)
      expect(result.progressPercent).toBe(50)
    })

    it('should calculate progress at level boundary', () => {
      const result = xpToNextLevel(100n)

      expect(result.currentLevel).toBe(2)
      expect(result.xpForCurrentLevel).toBe(100n)
      expect(result.xpProgress).toBe(0n)
      expect(result.progressPercent).toBe(0)
    })

    it('should calculate progress mid-level', () => {
      // At 200 XP, level 2
      // Level 2 starts at 100, level 3 at 382
      // Progress: 200 - 100 = 100
      // Needed: 382 - 100 = 282
      const result = xpToNextLevel(200n)

      expect(result.currentLevel).toBe(2)
      expect(result.xpProgress).toBe(100n)
      expect(result.xpNeeded).toBe(282n)
      expect(result.progressPercent).toBe(35) // 100/282 * 100 = ~35
    })

    it('should handle large XP values', () => {
      const result = xpToNextLevel(50000n)

      expect(result.currentLevel).toBeGreaterThan(1)
      expect(result.progressPercent).toBeGreaterThanOrEqual(0)
      expect(result.progressPercent).toBeLessThanOrEqual(100)
    })
  })

  describe('getLevelThresholds', () => {
    it('should return default 20 levels', () => {
      const thresholds = getLevelThresholds()

      expect(thresholds).toHaveLength(20)
    })

    it('should return correct structure for each level', () => {
      const thresholds = getLevelThresholds(5)

      expect(thresholds).toHaveLength(5)

      for (const threshold of thresholds) {
        expect(threshold).toHaveProperty('level')
        expect(threshold).toHaveProperty('totalXP')
        expect(threshold).toHaveProperty('xpToNext')
      }
    })

    it('should start at level 1 with 0 total XP', () => {
      const thresholds = getLevelThresholds(5)

      expect(thresholds[0]!.level).toBe(1)
      expect(thresholds[0]!.totalXP).toBe(0n)
    })

    it('should have increasing total XP for each level', () => {
      const thresholds = getLevelThresholds(10)

      for (let i = 1; i < thresholds.length; i++) {
        expect(thresholds[i]!.totalXP).toBeGreaterThan(thresholds[i - 1]!.totalXP)
      }
    })

    it('should have xpToNext equal to difference between levels', () => {
      const thresholds = getLevelThresholds(5)

      for (let i = 0; i < thresholds.length - 1; i++) {
        const expected = thresholds[i + 1]!.totalXP - thresholds[i]!.totalXP
        expect(thresholds[i]!.xpToNext).toBe(expected)
      }
    })

    it('should respect custom maxLevel parameter', () => {
      const thresholds3 = getLevelThresholds(3)
      const thresholds10 = getLevelThresholds(10)
      const thresholds50 = getLevelThresholds(50)

      expect(thresholds3).toHaveLength(3)
      expect(thresholds10).toHaveLength(10)
      expect(thresholds50).toHaveLength(50)
    })
  })

  describe('edge cases', () => {
    it('should handle negative XP as level 1', () => {
      // This is technically invalid input, but should not crash
      // The function uses >= comparison so negative should stay at level 1
      const level = computeLevel(-100n)
      expect(level).toBe(1)
    })

    it('should handle very high levels consistently', () => {
      // Test that high levels don't cause overflow or issues
      const threshold50 = computeLevelThreshold(50)
      expect(threshold50).toBeGreaterThan(0n)

      const level50xp = computeLevel(threshold50)
      expect(level50xp).toBe(50)
    })
  })
})
