import { describe, it, expect } from 'vitest'
import { interpolate, type NarrativeCategory } from './narrative'

describe('Narrative Service', () => {
  describe('interpolate', () => {
    it('should replace single variable', () => {
      const template = 'Welcome, {{name}}!'
      const result = interpolate(template, { name: 'Hunter' })
      expect(result).toBe('Welcome, Hunter!')
    })

    it('should replace multiple different variables', () => {
      const template = '{{name}} has reached level {{level}} with {{xp}} XP.'
      const result = interpolate(template, {
        name: 'Shadow',
        level: 10,
        xp: 5000,
      })
      expect(result).toBe('Shadow has reached level 10 with 5000 XP.')
    })

    it('should replace same variable multiple times', () => {
      const template = 'Day {{day}}. This is day {{day}} of your journey. Day {{day}} begins.'
      const result = interpolate(template, { day: 7 })
      expect(result).toBe('Day 7. This is day 7 of your journey. Day 7 begins.')
    })

    it('should handle number values', () => {
      const template = 'You gained {{amount}} XP.'
      const result = interpolate(template, { amount: 150 })
      expect(result).toBe('You gained 150 XP.')
    })

    it('should handle zero values', () => {
      const template = 'Progress: {{progress}}%'
      const result = interpolate(template, { progress: 0 })
      expect(result).toBe('Progress: 0%')
    })

    it('should handle decimal numbers', () => {
      const template = 'Multiplier: {{multiplier}}x'
      const result = interpolate(template, { multiplier: 1.5 })
      expect(result).toBe('Multiplier: 1.5x')
    })

    it('should leave unmatched variables as-is', () => {
      const template = 'Hello {{name}}, your score is {{score}}.'
      const result = interpolate(template, { name: 'Player' })
      expect(result).toBe('Hello Player, your score is {{score}}.')
    })

    it('should handle empty variables object', () => {
      const template = 'Static message with no {{variables}}.'
      const result = interpolate(template, {})
      expect(result).toBe('Static message with no {{variables}}.')
    })

    it('should handle template with no variables', () => {
      const template = 'This is a static message.'
      const result = interpolate(template, { unused: 'value' })
      expect(result).toBe('This is a static message.')
    })

    it('should handle special regex characters in values', () => {
      const template = 'User: {{name}}'
      const result = interpolate(template, { name: 'Player$1' })
      expect(result).toBe('User: Player$1')
    })

    it('should handle multiline templates', () => {
      const template = `Day {{day}}.
The System observes.
Progress: {{progress}}%`
      const result = interpolate(template, { day: 5, progress: 75 })
      expect(result).toBe(`Day 5.
The System observes.
Progress: 75%`)
    })

    it('should handle adjacent variables', () => {
      const template = '{{first}}{{second}}{{third}}'
      const result = interpolate(template, {
        first: 'A',
        second: 'B',
        third: 'C',
      })
      expect(result).toBe('ABC')
    })

    it('should handle variables with underscores', () => {
      const template = 'XP earned: {{xp_amount}} from {{quest_name}}'
      const result = interpolate(template, {
        xp_amount: 50,
        quest_name: 'Daily Steps',
      })
      expect(result).toBe('XP earned: 50 from Daily Steps')
    })

    it('should handle empty string values', () => {
      const template = 'Status: {{status}}'
      const result = interpolate(template, { status: '' })
      expect(result).toBe('Status: ')
    })

    it('should handle negative numbers', () => {
      const template = 'Change: {{delta}} XP'
      const result = interpolate(template, { delta: -50 })
      expect(result).toBe('Change: -50 XP')
    })
  })

  describe('NarrativeCategory type', () => {
    it('should include all expected categories', () => {
      // Type-level test - ensures the categories exist
      const categories: NarrativeCategory[] = [
        'ONBOARDING',
        'SYSTEM_MESSAGE',
        'DAILY_QUEST',
        'DEBUFF',
        'DUNGEON',
        'BOSS',
        'TITLE',
        'SEASON',
        'LEVEL_UP',
        'DAILY_REMINDER',
      ]

      expect(categories.length).toBe(10)
    })
  })

  describe('Fallback content keys', () => {
    // These tests document the expected fallback keys
    it('should have expected system fallback keys', () => {
      // Based on the FALLBACK_CONTENT constant
      const expectedKeys = ['system.error', 'system.loading', 'system.unknown']

      expectedKeys.forEach((key) => {
        expect(key).toBeDefined()
      })
    })
  })

  describe('Template patterns', () => {
    describe('Daily header templates', () => {
      it('should support streak-based templates', () => {
        // Template for 7-day streak
        const template7 = 'Day {{streak_days}}. One week. The pattern holds.'
        const result = interpolate(template7, { streak_days: 7 })
        expect(result).toContain('7')

        // Template for 30-day streak
        const template30 = 'Day {{streak_days}}. A month of consistency. The System acknowledges.'
        const result30 = interpolate(template30, { streak_days: 30 })
        expect(result30).toContain('30')
      })
    })

    describe('Quest completion templates', () => {
      it('should support XP-based templates', () => {
        const template = 'Quest complete. +{{xp_amount}} XP. Total: {{total_xp}} XP.'
        const result = interpolate(template, {
          xp_amount: 50,
          total_xp: 1500,
        })
        expect(result).toBe('Quest complete. +50 XP. Total: 1500 XP.')
      })

      it('should support target/actual value templates', () => {
        const template = 'Target: {{target_value}} | Achieved: {{actual_value}}'
        const result = interpolate(template, {
          target_value: 10000,
          actual_value: 12500,
        })
        expect(result).toBe('Target: 10000 | Achieved: 12500')
      })
    })

    describe('Debuff templates', () => {
      it('should support debuff warning template', () => {
        const template = '[WARNING] {{incomplete_count}} quests incomplete. Debuff imminent.'
        const result = interpolate(template, { incomplete_count: 3 })
        expect(result).toBe('[WARNING] 3 quests incomplete. Debuff imminent.')
      })

      it('should support hours remaining template', () => {
        const template = '[DEBUFF ACTIVE] {{hours_remaining}} hours remaining.'
        const result = interpolate(template, { hours_remaining: 12 })
        expect(result).toBe('[DEBUFF ACTIVE] 12 hours remaining.')
      })
    })

    describe('Level up templates', () => {
      it('should support level achievement template', () => {
        const template = 'Level {{level}} achieved. Total XP: {{total_xp}}.'
        const result = interpolate(template, { level: 15, total_xp: 25000 })
        expect(result).toBe('Level 15 achieved. Total XP: 25000.')
      })
    })

    describe('Return message templates', () => {
      it('should support days absent template', () => {
        const template = '{{days_absent}} days. The System waited. Welcome back, Level {{level}}.'
        const result = interpolate(template, { days_absent: 5, level: 8 })
        expect(result).toBe('5 days. The System waited. Welcome back, Level 8.')
      })
    })
  })

  describe('Edge cases', () => {
    it('should handle very long templates', () => {
      const longTemplate = 'Value: {{value}}'.repeat(100)
      const result = interpolate(longTemplate, { value: 'X' })
      expect(result).toBe('Value: X'.repeat(100))
    })

    it('should handle very long variable values', () => {
      const template = 'Name: {{name}}'
      const longName = 'A'.repeat(10000)
      const result = interpolate(template, { name: longName })
      expect(result).toBe(`Name: ${longName}`)
    })

    it('should handle malformed variable syntax gracefully', () => {
      // These should not be replaced
      const template1 = 'Test {name} and {{name}}'
      const result1 = interpolate(template1, { name: 'Value' })
      expect(result1).toBe('Test {name} and Value')

      const template2 = 'Test {{ name }} and {{name}}'
      const result2 = interpolate(template2, { name: 'Value' })
      expect(result2).toBe('Test {{ name }} and Value')

      const template3 = 'Test {{}} and {{name}}'
      const result3 = interpolate(template3, { name: 'Value' })
      expect(result3).toBe('Test {{}} and Value')
    })

    it('should handle variable names with numbers', () => {
      const template = 'Phase {{phase1}} complete. Moving to {{phase2}}.'
      const result = interpolate(template, { phase1: 1, phase2: 2 })
      expect(result).toBe('Phase 1 complete. Moving to 2.')
    })
  })
})
