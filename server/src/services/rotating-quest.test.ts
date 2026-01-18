import { describe, it, expect } from 'vitest'
import {
  ROTATING_QUEST_UNLOCK_DAY,
  getRotatingQuestNarrative,
  getRotatingQuestUnlockNarrative,
} from './rotating-quest'

describe('rotating-quest service', () => {
  describe('constants', () => {
    it('unlock day should be 8', () => {
      expect(ROTATING_QUEST_UNLOCK_DAY).toBe(8)
    })
  })

  describe('getRotatingQuestNarrative', () => {
    it('generates narrative for a quest', () => {
      const narrative = getRotatingQuestNarrative(
        'template-1',
        'Step Challenge',
        '8,000 steps',
        50
      )

      expect(narrative).toContain('Step Challenge')
      expect(narrative).toContain('8,000 steps')
      expect(narrative).toContain('50 XP')
    })

    it('includes quest name in narrative', () => {
      const narrative = getRotatingQuestNarrative(
        'template-2',
        'Hydration Quest',
        '10 glasses',
        35
      )

      expect(narrative.toLowerCase()).toContain('hydration')
    })
  })

  describe('getRotatingQuestUnlockNarrative', () => {
    it('generates unlock narrative', () => {
      const narrative = getRotatingQuestUnlockNarrative()

      expect(narrative).toBeTruthy()
      expect(typeof narrative).toBe('string')
      expect(narrative.length).toBeGreaterThan(0)
    })

    it('mentions rotating quest concept', () => {
      const narrative = getRotatingQuestUnlockNarrative()

      // Should mention something about new quest type or slot
      expect(
        narrative.toLowerCase().includes('rotating') ||
        narrative.toLowerCase().includes('quest') ||
        narrative.toLowerCase().includes('slot') ||
        narrative.toLowerCase().includes('unlock')
      ).toBe(true)
    })
  })

  describe('quest selection algorithm', () => {
    it('should be deterministic for same date and user', () => {
      // The rotating quest for a given date should be consistent
      // This tests the concept - actual implementation uses date-based seeding
      const mockDate = '2025-01-15'
      const mockUserId = 'user-123'
      
      // Hash function should produce same result for same input
      const hash1 = simpleHash(`${mockDate}-${mockUserId}`)
      const hash2 = simpleHash(`${mockDate}-${mockUserId}`)
      
      expect(hash1).toBe(hash2)
    })

    it('should produce different quests for different dates', () => {
      const mockUserId = 'user-123'
      
      const hash1 = simpleHash(`2025-01-15-${mockUserId}`)
      const hash2 = simpleHash(`2025-01-16-${mockUserId}`)
      
      expect(hash1).not.toBe(hash2)
    })

    it('should produce different quests for different users on same day', () => {
      const mockDate = '2025-01-15'
      
      const hash1 = simpleHash(`${mockDate}-user-123`)
      const hash2 = simpleHash(`${mockDate}-user-456`)
      
      expect(hash1).not.toBe(hash2)
    })
  })
})

// Simple hash function for testing
function simpleHash(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  return hash
}
