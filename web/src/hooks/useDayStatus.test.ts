import { describe, it, expect } from 'vitest'
import { getPhaseStyles, getPhaseGreeting, type DayPhase } from './useDayStatus'

describe('useDayStatus utilities', () => {
  describe('getPhaseStyles', () => {
    it('should return correct styles for morning phase', () => {
      const styles = getPhaseStyles('morning')

      expect(styles.bgClass).toBe('')
      expect(styles.textClass).toBe('text-system-text')
      expect(styles.accentClass).toBe('text-system-gold')
    })

    it('should return correct styles for midday phase', () => {
      const styles = getPhaseStyles('midday')

      expect(styles.bgClass).toBe('')
      expect(styles.textClass).toBe('text-system-text')
      expect(styles.accentClass).toBe('text-system-blue')
    })

    it('should return correct styles for afternoon phase', () => {
      const styles = getPhaseStyles('afternoon')

      expect(styles.bgClass).toBe('')
      expect(styles.textClass).toBe('text-system-text')
      expect(styles.accentClass).toBe('text-system-orange')
    })

    it('should return correct styles for evening phase', () => {
      const styles = getPhaseStyles('evening')

      expect(styles.bgClass).toBe('evening-mode')
      expect(styles.textClass).toBe('text-system-text/90')
      expect(styles.accentClass).toBe('text-system-purple')
    })

    it('should return correct styles for night phase', () => {
      const styles = getPhaseStyles('night')

      expect(styles.bgClass).toBe('night-mode')
      expect(styles.textClass).toBe('text-system-text/80')
      expect(styles.accentClass).toBe('text-system-text-muted')
    })

    it('should return correct styles for closed phase', () => {
      const styles = getPhaseStyles('closed')

      expect(styles.bgClass).toBe('night-mode')
      expect(styles.textClass).toBe('text-system-text/80')
      expect(styles.accentClass).toBe('text-system-text-muted')
    })

    it('should return default styles for unknown phase', () => {
      // @ts-expect-error - testing unknown phase
      const styles = getPhaseStyles('unknown')

      expect(styles.bgClass).toBe('')
      expect(styles.textClass).toBe('text-system-text')
      expect(styles.accentClass).toBe('text-system-blue')
    })

    it('should return all required style properties', () => {
      const phases: DayPhase[] = ['morning', 'midday', 'afternoon', 'evening', 'night', 'closed']

      for (const phase of phases) {
        const styles = getPhaseStyles(phase)
        expect(styles).toHaveProperty('bgClass')
        expect(styles).toHaveProperty('textClass')
        expect(styles).toHaveProperty('accentClass')
        expect(typeof styles.bgClass).toBe('string')
        expect(typeof styles.textClass).toBe('string')
        expect(typeof styles.accentClass).toBe('string')
      }
    })
  })

  describe('getPhaseGreeting', () => {
    it('should return morning greeting', () => {
      expect(getPhaseGreeting('morning')).toBe('Morning quests await.')
    })

    it('should return midday greeting', () => {
      expect(getPhaseGreeting('midday')).toBe('The System is recording.')
    })

    it('should return afternoon greeting', () => {
      expect(getPhaseGreeting('afternoon')).toBe('Time remaining is limited.')
    })

    it('should return evening greeting', () => {
      expect(getPhaseGreeting('evening')).toBe('The day winds down.')
    })

    it('should return night greeting', () => {
      expect(getPhaseGreeting('night')).toBe('Day closing soon.')
    })

    it('should return closed greeting', () => {
      expect(getPhaseGreeting('closed')).toBe('Day is closed.')
    })

    it('should return default greeting for unknown phase', () => {
      // @ts-expect-error - testing unknown phase
      expect(getPhaseGreeting('unknown')).toBe('The System awaits.')
    })

    it('should return strings without exclamation marks (System style)', () => {
      const phases: DayPhase[] = ['morning', 'midday', 'afternoon', 'evening', 'night', 'closed']

      for (const phase of phases) {
        const greeting = getPhaseGreeting(phase)
        expect(greeting).not.toContain('!')
      }
    })

    it('should return non-empty strings', () => {
      const phases: DayPhase[] = ['morning', 'midday', 'afternoon', 'evening', 'night', 'closed']

      for (const phase of phases) {
        const greeting = getPhaseGreeting(phase)
        expect(greeting.length).toBeGreaterThan(0)
      }
    })
  })

  describe('DayPhase type', () => {
    it('should support all expected phases', () => {
      const phases: DayPhase[] = ['morning', 'midday', 'afternoon', 'evening', 'night', 'closed']
      expect(phases.length).toBe(6)
    })
  })

  describe('Phase transitions', () => {
    it('should have progressively dimmer styles as day progresses', () => {
      // Morning and midday should be bright (no bg class)
      expect(getPhaseStyles('morning').bgClass).toBe('')
      expect(getPhaseStyles('midday').bgClass).toBe('')

      // Afternoon still bright
      expect(getPhaseStyles('afternoon').bgClass).toBe('')

      // Evening starts dimming
      expect(getPhaseStyles('evening').bgClass).toBe('evening-mode')

      // Night is darkest
      expect(getPhaseStyles('night').bgClass).toBe('night-mode')
    })

    it('should have urgency-themed greetings in later phases', () => {
      // Morning is calm
      expect(getPhaseGreeting('morning')).not.toContain('limited')

      // Afternoon has urgency
      expect(getPhaseGreeting('afternoon')).toContain('limited')

      // Night indicates closing
      expect(getPhaseGreeting('night')).toContain('closing')

      // Closed is final
      expect(getPhaseGreeting('closed')).toContain('closed')
    })
  })
})
