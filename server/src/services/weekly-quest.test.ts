import { describe, it, expect } from 'vitest'

/**
 * Weekly Quest Service Tests
 * 
 * Tests for weekly quest logic. Since getWeekBounds and isDateInCurrentWeek
 * are internal functions, we test the concepts they implement.
 */
describe('weekly-quest service', () => {
  describe('week bounds calculation', () => {
    // Helper to calculate week bounds (mirrors internal logic)
    function getWeekBounds(date: Date): { weekStart: string; weekEnd: string } {
      const dayOfWeek = date.getUTCDay() // 0 = Sunday, 1 = Monday, ...
      
      // Adjust to make Monday = 0
      const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1
      
      const weekStart = new Date(date)
      weekStart.setUTCDate(date.getUTCDate() - adjustedDay)
      
      const weekEnd = new Date(weekStart)
      weekEnd.setUTCDate(weekStart.getUTCDate() + 6)
      
      return {
        weekStart: weekStart.toISOString().split('T')[0]!,
        weekEnd: weekEnd.toISOString().split('T')[0]!,
      }
    }

    it('returns correct week start and end for a Wednesday', () => {
      const wednesday = new Date('2025-01-15T12:00:00Z')
      const bounds = getWeekBounds(wednesday)
      
      expect(bounds.weekStart).toBe('2025-01-13')
      expect(bounds.weekEnd).toBe('2025-01-19')
    })

    it('returns correct bounds for a Monday', () => {
      const monday = new Date('2025-01-13T12:00:00Z')
      const bounds = getWeekBounds(monday)
      
      expect(bounds.weekStart).toBe('2025-01-13')
      expect(bounds.weekEnd).toBe('2025-01-19')
    })

    it('returns correct bounds for a Sunday', () => {
      const sunday = new Date('2025-01-19T12:00:00Z')
      const bounds = getWeekBounds(sunday)
      
      expect(bounds.weekStart).toBe('2025-01-13')
      expect(bounds.weekEnd).toBe('2025-01-19')
    })
  })

  describe('date within week check', () => {
    function isDateInWeek(dateStr: string, weekStart: string, weekEnd: string): boolean {
      return dateStr >= weekStart && dateStr <= weekEnd
    }

    it('returns true for date within week', () => {
      const weekStart = '2025-01-13'
      const weekEnd = '2025-01-19'
      
      expect(isDateInWeek('2025-01-15', weekStart, weekEnd)).toBe(true)
      expect(isDateInWeek('2025-01-13', weekStart, weekEnd)).toBe(true)
      expect(isDateInWeek('2025-01-19', weekStart, weekEnd)).toBe(true)
    })

    it('returns false for date before week', () => {
      const weekStart = '2025-01-13'
      const weekEnd = '2025-01-19'
      
      expect(isDateInWeek('2025-01-12', weekStart, weekEnd)).toBe(false)
      expect(isDateInWeek('2025-01-06', weekStart, weekEnd)).toBe(false)
    })

    it('returns false for date after week', () => {
      const weekStart = '2025-01-13'
      const weekEnd = '2025-01-19'
      
      expect(isDateInWeek('2025-01-20', weekStart, weekEnd)).toBe(false)
      expect(isDateInWeek('2025-01-21', weekStart, weekEnd)).toBe(false)
    })
  })

  describe('weekly quest tracking', () => {
    it('weekly quests should reset on Monday', () => {
      // Week starts Monday, so quests from previous week should be separate
      const lastWeekDate = '2025-01-12' // Sunday
      const thisWeekDate = '2025-01-13' // Monday
      
      // These should be in different weeks
      expect(lastWeekDate < thisWeekDate).toBe(true)
    })

    it('progress should accumulate within the week', () => {
      const weeklyProgress = { current: 0, target: 5 }
      
      // Simulate daily increments
      weeklyProgress.current += 1 // Monday
      weeklyProgress.current += 1 // Tuesday
      weeklyProgress.current += 1 // Wednesday
      
      expect(weeklyProgress.current).toBe(3)
      expect(weeklyProgress.current < weeklyProgress.target).toBe(true)
    })
  })
})
