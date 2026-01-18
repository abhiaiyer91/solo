import { describe, it, expect } from 'vitest'
import { evaluateRequirement } from './quest'
import type { RequirementDSL } from '../db/schema'

describe('Quest Service', () => {
  describe('evaluateRequirement', () => {
    describe('numeric requirements', () => {
      it('should evaluate gte (greater than or equal) correctly', () => {
        const requirement: RequirementDSL = {
          type: 'numeric',
          metric: 'steps',
          operator: 'gte',
          value: 10000,
        }

        // Exact match
        expect(evaluateRequirement(requirement, { steps: 10000 })).toEqual({
          met: true,
          progress: 100,
          target: 10000,
        })

        // Over target
        expect(evaluateRequirement(requirement, { steps: 15000 })).toEqual({
          met: true,
          progress: 100, // Capped at 100
          target: 10000,
        })

        // Under target
        expect(evaluateRequirement(requirement, { steps: 5000 })).toEqual({
          met: false,
          progress: 50,
          target: 10000,
        })

        // Zero value
        expect(evaluateRequirement(requirement, { steps: 0 })).toEqual({
          met: false,
          progress: 0,
          target: 10000,
        })
      })

      it('should evaluate lte (less than or equal) correctly', () => {
        const requirement: RequirementDSL = {
          type: 'numeric',
          metric: 'screen_time',
          operator: 'lte',
          value: 120,
        }

        // Under target (good)
        expect(evaluateRequirement(requirement, { screen_time: 60 })).toEqual({
          met: true,
          progress: 50,
          target: 120,
        })

        // Exact match
        expect(evaluateRequirement(requirement, { screen_time: 120 })).toEqual({
          met: true,
          progress: 100,
          target: 120,
        })

        // Over target (bad)
        expect(evaluateRequirement(requirement, { screen_time: 180 })).toEqual({
          met: false,
          progress: 100, // Capped at 100
          target: 120,
        })
      })

      it('should evaluate eq (equals) correctly', () => {
        const requirement: RequirementDSL = {
          type: 'numeric',
          metric: 'workouts',
          operator: 'eq',
          value: 1,
        }

        expect(evaluateRequirement(requirement, { workouts: 1 })).toEqual({
          met: true,
          progress: 100,
          target: 1,
        })

        expect(evaluateRequirement(requirement, { workouts: 0 })).toEqual({
          met: false,
          progress: 0,
          target: 1,
        })

        expect(evaluateRequirement(requirement, { workouts: 2 })).toEqual({
          met: false,
          progress: 100, // Progress capped at 100
          target: 1,
        })
      })

      it('should evaluate gt (greater than) correctly', () => {
        const requirement: RequirementDSL = {
          type: 'numeric',
          metric: 'calories_burned',
          operator: 'gt',
          value: 500,
        }

        expect(evaluateRequirement(requirement, { calories_burned: 501 })).toEqual({
          met: true,
          progress: 100,
          target: 500,
        })

        expect(evaluateRequirement(requirement, { calories_burned: 500 })).toEqual({
          met: false,
          progress: 100,
          target: 500,
        })

        expect(evaluateRequirement(requirement, { calories_burned: 250 })).toEqual({
          met: false,
          progress: 50,
          target: 500,
        })
      })

      it('should evaluate lt (less than) correctly', () => {
        const requirement: RequirementDSL = {
          type: 'numeric',
          metric: 'caffeine_mg',
          operator: 'lt',
          value: 400,
        }

        expect(evaluateRequirement(requirement, { caffeine_mg: 399 })).toEqual({
          met: true,
          progress: 99.75,
          target: 400,
        })

        expect(evaluateRequirement(requirement, { caffeine_mg: 400 })).toEqual({
          met: false,
          progress: 100,
          target: 400,
        })
      })

      it('should handle missing metric by defaulting to 0', () => {
        const requirement: RequirementDSL = {
          type: 'numeric',
          metric: 'steps',
          operator: 'gte',
          value: 10000,
        }

        expect(evaluateRequirement(requirement, {})).toEqual({
          met: false,
          progress: 0,
          target: 10000,
        })

        expect(evaluateRequirement(requirement, { other_metric: 5000 })).toEqual({
          met: false,
          progress: 0,
          target: 10000,
        })
      })
    })

    describe('boolean requirements', () => {
      it('should evaluate expected true correctly', () => {
        const requirement: RequirementDSL = {
          type: 'boolean',
          metric: 'meditation_completed',
          expected: true,
        }

        expect(evaluateRequirement(requirement, { meditation_completed: true })).toEqual({
          met: true,
          progress: 100,
          target: 1,
        })

        expect(evaluateRequirement(requirement, { meditation_completed: false })).toEqual({
          met: false,
          progress: 0,
          target: 1,
        })
      })

      it('should evaluate expected false correctly', () => {
        const requirement: RequirementDSL = {
          type: 'boolean',
          metric: 'skipped_workout',
          expected: false,
        }

        expect(evaluateRequirement(requirement, { skipped_workout: false })).toEqual({
          met: true,
          progress: 100,
          target: 1,
        })

        expect(evaluateRequirement(requirement, { skipped_workout: true })).toEqual({
          met: false,
          progress: 0,
          target: 1,
        })
      })

      it('should handle missing boolean metric as undefined', () => {
        const requirement: RequirementDSL = {
          type: 'boolean',
          metric: 'journal_entry',
          expected: true,
        }

        expect(evaluateRequirement(requirement, {})).toEqual({
          met: false,
          progress: 0,
          target: 1,
        })
      })
    })

    describe('compound requirements', () => {
      it('should evaluate AND compound correctly - all met', () => {
        const requirement: RequirementDSL = {
          type: 'compound',
          operator: 'and',
          requirements: [
            { type: 'numeric', metric: 'steps', operator: 'gte', value: 10000 },
            { type: 'numeric', metric: 'exercise_minutes', operator: 'gte', value: 30 },
          ],
        }

        const result = evaluateRequirement(requirement, {
          steps: 12000,
          exercise_minutes: 45,
        })

        expect(result.met).toBe(true)
        expect(result.progress).toBe(100)
      })

      it('should evaluate AND compound correctly - one not met', () => {
        const requirement: RequirementDSL = {
          type: 'compound',
          operator: 'and',
          requirements: [
            { type: 'numeric', metric: 'steps', operator: 'gte', value: 10000 },
            { type: 'numeric', metric: 'exercise_minutes', operator: 'gte', value: 30 },
          ],
        }

        const result = evaluateRequirement(requirement, {
          steps: 12000,
          exercise_minutes: 15,
        })

        expect(result.met).toBe(false)
        // Average of 100% and 50% = 75%
        expect(result.progress).toBe(75)
      })

      it('should evaluate AND compound correctly - none met', () => {
        const requirement: RequirementDSL = {
          type: 'compound',
          operator: 'and',
          requirements: [
            { type: 'numeric', metric: 'steps', operator: 'gte', value: 10000 },
            { type: 'numeric', metric: 'exercise_minutes', operator: 'gte', value: 30 },
          ],
        }

        const result = evaluateRequirement(requirement, {
          steps: 5000,
          exercise_minutes: 15,
        })

        expect(result.met).toBe(false)
        // Average of 50% and 50% = 50%
        expect(result.progress).toBe(50)
      })

      it('should evaluate OR compound correctly - one met', () => {
        const requirement: RequirementDSL = {
          type: 'compound',
          operator: 'or',
          requirements: [
            { type: 'numeric', metric: 'steps', operator: 'gte', value: 10000 },
            { type: 'numeric', metric: 'cycling_minutes', operator: 'gte', value: 30 },
          ],
        }

        const result = evaluateRequirement(requirement, {
          steps: 12000,
          cycling_minutes: 0,
        })

        expect(result.met).toBe(true)
        expect(result.progress).toBe(100) // Max progress
      })

      it('should evaluate OR compound correctly - none met', () => {
        const requirement: RequirementDSL = {
          type: 'compound',
          operator: 'or',
          requirements: [
            { type: 'numeric', metric: 'steps', operator: 'gte', value: 10000 },
            { type: 'numeric', metric: 'cycling_minutes', operator: 'gte', value: 30 },
          ],
        }

        const result = evaluateRequirement(requirement, {
          steps: 5000,
          cycling_minutes: 10,
        })

        expect(result.met).toBe(false)
        // Max of 50% and 33.33% = 50%
        expect(result.progress).toBe(50)
      })

      it('should handle nested compound requirements', () => {
        const requirement: RequirementDSL = {
          type: 'compound',
          operator: 'and',
          requirements: [
            { type: 'numeric', metric: 'steps', operator: 'gte', value: 10000 },
            {
              type: 'compound',
              operator: 'or',
              requirements: [
                { type: 'numeric', metric: 'running_minutes', operator: 'gte', value: 30 },
                { type: 'numeric', metric: 'cycling_minutes', operator: 'gte', value: 30 },
              ],
            },
          ],
        }

        // Steps met + cycling met
        const result1 = evaluateRequirement(requirement, {
          steps: 12000,
          running_minutes: 0,
          cycling_minutes: 45,
        })
        expect(result1.met).toBe(true)

        // Steps not met
        const result2 = evaluateRequirement(requirement, {
          steps: 5000,
          running_minutes: 0,
          cycling_minutes: 45,
        })
        expect(result2.met).toBe(false)
      })

      it('should handle mixed numeric and boolean in compound', () => {
        const requirement: RequirementDSL = {
          type: 'compound',
          operator: 'and',
          requirements: [
            { type: 'numeric', metric: 'steps', operator: 'gte', value: 10000 },
            { type: 'boolean', metric: 'meditation_completed', expected: true },
          ],
        }

        expect(
          evaluateRequirement(requirement, {
            steps: 12000,
            meditation_completed: true,
          }).met
        ).toBe(true)

        expect(
          evaluateRequirement(requirement, {
            steps: 12000,
            meditation_completed: false,
          }).met
        ).toBe(false)
      })
    })

    describe('edge cases', () => {
      it('should handle unknown requirement type', () => {
        const requirement = {
          type: 'unknown',
          metric: 'something',
        } as unknown as RequirementDSL

        expect(evaluateRequirement(requirement, { something: 100 })).toEqual({
          met: false,
          progress: 0,
          target: 0,
        })
      })

      it('should handle very large numbers', () => {
        const requirement: RequirementDSL = {
          type: 'numeric',
          metric: 'score',
          operator: 'gte',
          value: 1000000,
        }

        expect(evaluateRequirement(requirement, { score: 2000000 })).toEqual({
          met: true,
          progress: 100,
          target: 1000000,
        })
      })

      it('should handle decimal values', () => {
        const requirement: RequirementDSL = {
          type: 'numeric',
          metric: 'sleep_hours',
          operator: 'gte',
          value: 7.5,
        }

        expect(evaluateRequirement(requirement, { sleep_hours: 8.25 })).toEqual({
          met: true,
          progress: 100,
          target: 7.5,
        })

        const result = evaluateRequirement(requirement, { sleep_hours: 6 })
        expect(result.met).toBe(false)
        expect(result.progress).toBe(80) // 6/7.5 = 0.8 = 80%
      })
    })
  })
})
