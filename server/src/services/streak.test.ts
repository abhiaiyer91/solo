import { describe, it, expect } from 'vitest'
import { getStreakBonus } from './streak'

describe('Streak Service', () => {
  describe('getStreakBonus', () => {
    describe('no bonus tier (0-6 days)', () => {
      it('should return no bonus for 0 days', () => {
        const result = getStreakBonus(0)
        expect(result.tier).toBe('none')
        expect(result.percent).toBe(0)
      })

      it('should return no bonus for 1 day', () => {
        const result = getStreakBonus(1)
        expect(result.tier).toBe('none')
        expect(result.percent).toBe(0)
      })

      it('should return no bonus for 6 days', () => {
        const result = getStreakBonus(6)
        expect(result.tier).toBe('none')
        expect(result.percent).toBe(0)
      })
    })

    describe('bronze tier (7-13 days)', () => {
      it('should return bronze bonus at exactly 7 days', () => {
        const result = getStreakBonus(7)
        expect(result.tier).toBe('bronze')
        expect(result.percent).toBe(10)
      })

      it('should return bronze bonus at 10 days', () => {
        const result = getStreakBonus(10)
        expect(result.tier).toBe('bronze')
        expect(result.percent).toBe(10)
      })

      it('should return bronze bonus at 13 days', () => {
        const result = getStreakBonus(13)
        expect(result.tier).toBe('bronze')
        expect(result.percent).toBe(10)
      })
    })

    describe('silver tier (14-29 days)', () => {
      it('should return silver bonus at exactly 14 days', () => {
        const result = getStreakBonus(14)
        expect(result.tier).toBe('silver')
        expect(result.percent).toBe(15)
      })

      it('should return silver bonus at 20 days', () => {
        const result = getStreakBonus(20)
        expect(result.tier).toBe('silver')
        expect(result.percent).toBe(15)
      })

      it('should return silver bonus at 29 days', () => {
        const result = getStreakBonus(29)
        expect(result.tier).toBe('silver')
        expect(result.percent).toBe(15)
      })
    })

    describe('gold tier (30+ days)', () => {
      it('should return gold bonus at exactly 30 days', () => {
        const result = getStreakBonus(30)
        expect(result.tier).toBe('gold')
        expect(result.percent).toBe(25)
      })

      it('should return gold bonus at 60 days', () => {
        const result = getStreakBonus(60)
        expect(result.tier).toBe('gold')
        expect(result.percent).toBe(25)
      })

      it('should return gold bonus at 365 days', () => {
        const result = getStreakBonus(365)
        expect(result.tier).toBe('gold')
        expect(result.percent).toBe(25)
      })

      it('should handle very large streak values', () => {
        const result = getStreakBonus(10000)
        expect(result.tier).toBe('gold')
        expect(result.percent).toBe(25)
      })
    })

    describe('boundary conditions', () => {
      it('should transition from none to bronze at day 7', () => {
        const day6 = getStreakBonus(6)
        const day7 = getStreakBonus(7)

        expect(day6.tier).toBe('none')
        expect(day7.tier).toBe('bronze')
        expect(day7.percent - day6.percent).toBe(10)
      })

      it('should transition from bronze to silver at day 14', () => {
        const day13 = getStreakBonus(13)
        const day14 = getStreakBonus(14)

        expect(day13.tier).toBe('bronze')
        expect(day14.tier).toBe('silver')
        expect(day14.percent - day13.percent).toBe(5)
      })

      it('should transition from silver to gold at day 30', () => {
        const day29 = getStreakBonus(29)
        const day30 = getStreakBonus(30)

        expect(day29.tier).toBe('silver')
        expect(day30.tier).toBe('gold')
        expect(day30.percent - day29.percent).toBe(10)
      })
    })

    describe('edge cases', () => {
      it('should handle negative values as no bonus', () => {
        const result = getStreakBonus(-1)
        expect(result.tier).toBe('none')
        expect(result.percent).toBe(0)
      })

      it('should handle decimal values by using numeric comparison', () => {
        // 6.9 is less than 7, so no bonus
        const result1 = getStreakBonus(6.9)
        expect(result1.tier).toBe('none')

        // 7.0 is exactly 7, so bronze
        const result2 = getStreakBonus(7.0)
        expect(result2.tier).toBe('bronze')
      })
    })
  })

  describe('streak bonus progression', () => {
    it('should have progressively higher bonuses', () => {
      const bonuses = [
        getStreakBonus(0),
        getStreakBonus(7),
        getStreakBonus(14),
        getStreakBonus(30),
      ]

      for (let i = 1; i < bonuses.length; i++) {
        expect(bonuses[i]!.percent).toBeGreaterThan(bonuses[i - 1]!.percent)
      }
    })

    it('should have consistent tier names', () => {
      const tiers = ['none', 'bronze', 'silver', 'gold'] as const

      expect(getStreakBonus(0).tier).toBe(tiers[0])
      expect(getStreakBonus(7).tier).toBe(tiers[1])
      expect(getStreakBonus(14).tier).toBe(tiers[2])
      expect(getStreakBonus(30).tier).toBe(tiers[3])
    })
  })
})
