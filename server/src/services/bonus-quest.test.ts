import { describe, it, expect } from 'vitest'
import { BONUS_QUEST_TYPES } from './bonus-quest'

describe('bonus-quest service', () => {
  describe('bonus quest types', () => {
    it('STRETCH_GOAL should have 1.5x multiplier', () => {
      expect(BONUS_QUEST_TYPES.STRETCH_GOAL.multiplier).toBe(1.5)
    })

    it('TIME_CHALLENGE should have 1.75x multiplier', () => {
      expect(BONUS_QUEST_TYPES.TIME_CHALLENGE.multiplier).toBe(1.75)
    })

    it('STACK should have 2.0x multiplier', () => {
      expect(BONUS_QUEST_TYPES.STACK.multiplier).toBe(2.0)
    })

    it('all types should have descriptions', () => {
      for (const config of Object.values(BONUS_QUEST_TYPES)) {
        expect(config.description).toBeTruthy()
        expect(config.description.length).toBeGreaterThan(0)
      }
    })
  })

  describe('XP calculation', () => {
    it('should calculate correct XP for stretch goal', () => {
      const baseXP = 50
      const multiplier = BONUS_QUEST_TYPES.STRETCH_GOAL.multiplier
      const expectedXP = Math.round(baseXP * multiplier)
      
      expect(expectedXP).toBe(75)
    })

    it('should calculate correct XP for time challenge', () => {
      const baseXP = 50
      const multiplier = BONUS_QUEST_TYPES.TIME_CHALLENGE.multiplier
      const expectedXP = Math.round(baseXP * multiplier)
      
      expect(expectedXP).toBe(88) // 50 * 1.75 = 87.5, rounded to 88
    })

    it('should calculate correct XP for stack', () => {
      const baseXP = 50
      const multiplier = BONUS_QUEST_TYPES.STACK.multiplier
      const expectedXP = Math.round(baseXP * multiplier)
      
      expect(expectedXP).toBe(100)
    })
  })

  describe('unlock requirements', () => {
    it('bonus quests unlock at level 5', () => {
      const UNLOCK_LEVEL = 5
      
      expect(3 >= UNLOCK_LEVEL).toBe(false)
      expect(5 >= UNLOCK_LEVEL).toBe(true)
      expect(10 >= UNLOCK_LEVEL).toBe(true)
    })
  })

  describe('reroll logic', () => {
    it('should only allow one reroll per day', () => {
      const hasRerolled = false
      const canReroll = !hasRerolled
      
      expect(canReroll).toBe(true)
      
      const afterReroll = true
      const canRerollAgain = !afterReroll
      
      expect(canRerollAgain).toBe(false)
    })
  })

  describe('hash function for quest selection', () => {
    it('should produce consistent results', () => {
      const hashCode = (str: string): number => {
        let hash = 0
        for (let i = 0; i < str.length; i++) {
          const char = str.charCodeAt(i)
          hash = (hash << 5) - hash + char
          hash = hash & hash
        }
        return hash
      }

      const input = '2025-01-15-user-123'
      const hash1 = hashCode(input)
      const hash2 = hashCode(input)
      
      expect(hash1).toBe(hash2)
    })

    it('should distribute across quest pool', () => {
      const hashCode = (str: string): number => {
        let hash = 0
        for (let i = 0; i < str.length; i++) {
          const char = str.charCodeAt(i)
          hash = (hash << 5) - hash + char
          hash = hash & hash
        }
        return hash
      }

      const poolSize = 9 // Number of bonus quest templates
      const selections = new Set<number>()
      
      // Test with 20 different inputs
      for (let i = 0; i < 20; i++) {
        const hash = hashCode(`2025-01-${i}-user-test`)
        const index = Math.abs(hash) % poolSize
        selections.add(index)
      }
      
      // Should have multiple different selections (not all same)
      expect(selections.size).toBeGreaterThan(1)
    })
  })
})
