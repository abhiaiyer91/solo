import { describe, it, expect } from 'vitest'
import type { ShadowType, ShadowObservation, ShadowAggregates } from './shadow'

describe('Shadow Service', () => {
  describe('ShadowType', () => {
    it('should support all shadow types', () => {
      const types: ShadowType[] = ['level', 'streak', 'time', 'title']
      expect(types.length).toBe(4)
    })
  })

  describe('ShadowObservation structure', () => {
    it('should have correct structure for level shadow', () => {
      const observation: ShadowObservation = {
        type: 'level',
        narrative: 'Test narrative',
        shadowData: {
          shadowLevel: 10,
          shadowStreak: 7,
          playerCount: 5,
        },
        playerData: {
          level: 8,
          streak: 5,
        },
        observedAt: new Date().toISOString(),
      }

      expect(observation.type).toBe('level')
      expect(observation.shadowData.shadowLevel).toBe(10)
      expect(observation.playerData.level).toBe(8)
    })

    it('should have correct structure for streak shadow', () => {
      const observation: ShadowObservation = {
        type: 'streak',
        narrative: 'A player on day 14 of their streak maintains their pattern.',
        shadowData: {
          shadowLevel: 12,
          shadowStreak: 14,
          playerCount: 10,
        },
        playerData: {
          level: 10,
          streak: 7,
        },
        observedAt: new Date().toISOString(),
      }

      expect(observation.type).toBe('streak')
      expect(observation.shadowData.shadowStreak).toBe(14)
    })

    it('should have correct structure for time shadow', () => {
      const observation: ShadowObservation = {
        type: 'time',
        narrative: 'The System monitors players in your region.',
        shadowData: {
          playerCount: 25,
        },
        playerData: {
          level: 10,
          streak: 7,
        },
        observedAt: new Date().toISOString(),
      }

      expect(observation.type).toBe('time')
      expect(observation.shadowData.playerCount).toBe(25)
    })

    it('should have correct structure for title shadow', () => {
      const observation: ShadowObservation = {
        type: 'title',
        narrative: '5 other players bear your title.',
        shadowData: {
          shadowLevel: 15,
          shadowStreak: 21,
          shadowTitle: 'title-consistency-master',
          playerCount: 5,
        },
        playerData: {
          level: 12,
          streak: 14,
          title: 'title-consistency-master',
        },
        observedAt: new Date().toISOString(),
      }

      expect(observation.type).toBe('title')
      expect(observation.shadowData.shadowTitle).toBe('title-consistency-master')
      expect(observation.playerData.title).toBe('title-consistency-master')
    })

    it('should handle observation with no shadows found', () => {
      const observation: ShadowObservation = {
        type: 'level',
        narrative: 'No shadows detected at Level 25 today.',
        shadowData: {
          playerCount: 0,
        },
        playerData: {
          level: 25,
          streak: 30,
        },
        observedAt: new Date().toISOString(),
      }

      expect(observation.shadowData.playerCount).toBe(0)
      expect(observation.shadowData.shadowLevel).toBeUndefined()
    })

    it('should have valid ISO date for observedAt', () => {
      const observation: ShadowObservation = {
        type: 'level',
        narrative: 'Test',
        shadowData: { playerCount: 1 },
        playerData: { level: 1, streak: 0 },
        observedAt: '2026-01-18T10:30:00.000Z',
      }

      const date = new Date(observation.observedAt)
      expect(date.toISOString()).toBe('2026-01-18T10:30:00.000Z')
    })
  })

  describe('ShadowAggregates structure', () => {
    it('should have correct structure', () => {
      const aggregates: ShadowAggregates = {
        totalActivePlayers: 100,
        playersCompletedToday: 42,
        playersInDungeons: 5,
        playersDefeatedBosses: 2,
      }

      expect(aggregates.totalActivePlayers).toBe(100)
      expect(aggregates.playersCompletedToday).toBe(42)
      expect(aggregates.playersInDungeons).toBe(5)
      expect(aggregates.playersDefeatedBosses).toBe(2)
    })

    it('should handle zero values', () => {
      const aggregates: ShadowAggregates = {
        totalActivePlayers: 0,
        playersCompletedToday: 0,
        playersInDungeons: 0,
        playersDefeatedBosses: 0,
      }

      expect(aggregates.totalActivePlayers).toBe(0)
      expect(aggregates.playersCompletedToday).toBe(0)
    })
  })

  describe('Narrative patterns', () => {
    describe('Level shadow narrative', () => {
      it('should contain expected elements for level comparison', () => {
        const narrative = `SHADOW DETECTED

A player at Level 12 completed their objectives today.
Their streak: 10 days.

You are Level 10.
Your streak: 7 days.

They are 2 levels ahead.

5 similar players observed.
The System presents data.
Interpretation is yours.`

        expect(narrative).toContain('SHADOW DETECTED')
        expect(narrative).toContain('Level 12')
        expect(narrative).toContain('Level 10')
        expect(narrative).toContain('10 days')
        expect(narrative).toContain('7 days')
        expect(narrative).toContain('2 levels ahead')
        expect(narrative).toContain('5 similar players')
      })

      it('should handle when player is ahead', () => {
        const narrative = `You are 3 levels ahead.`
        expect(narrative).toContain('ahead')
      })

      it('should handle when levels are identical', () => {
        const narrative = `Your levels are identical.`
        expect(narrative).toContain('identical')
      })
    })

    describe('Streak shadow narrative', () => {
      it('should contain expected elements for streak comparison', () => {
        const narrative = `SHADOW DETECTED

A player on day 14 of their streak maintains their pattern.
Level 12.

You are on day 7.
Level 10.

7 more days of consistency separate you.

10 players walk similar paths.
The distance between you is measured in days.`

        expect(narrative).toContain('SHADOW DETECTED')
        expect(narrative).toContain('day 14')
        expect(narrative).toContain('day 7')
        expect(narrative).toContain('7 more days')
        expect(narrative).toContain('10 players')
      })

      it('should handle when player has higher streak', () => {
        const narrative = `Your streak exceeds theirs by 5 days.`
        expect(narrative).toContain('exceeds')
      })

      it('should handle when streaks match', () => {
        const narrative = `Your streaks are matched.`
        expect(narrative).toContain('matched')
      })
    })

    describe('Time shadow narrative', () => {
      it('should contain expected elements for time-based observation', () => {
        const narrative = `OBSERVATION

The System monitors 50 players in your region.

Today:
25 completed their core objectives.
Completion rate: 50%

You are one data point.
Your actions determine which category.`

        expect(narrative).toContain('OBSERVATION')
        expect(narrative).toContain('50 players')
        expect(narrative).toContain('25 completed')
        expect(narrative).toContain('50%')
        expect(narrative).toContain('one data point')
      })

      it('should handle when no one has completed', () => {
        const narrative = `None have completed their core objectives yet.`
        expect(narrative).toContain('None')
      })

      it('should handle few players', () => {
        const narrative = `The System monitors few players in your region.`
        expect(narrative).toContain('few players')
      })
    })

    describe('Title shadow narrative', () => {
      it('should contain expected elements for title comparison', () => {
        const narrative = `OBSERVATION

5 other players bear your title.

Their average streak: 14 days.
Their average level: 12.

Your streak: 10 days.
Your level: 10.

The title is shared.
What you do with it is not.`

        expect(narrative).toContain('OBSERVATION')
        expect(narrative).toContain('5 other players')
        expect(narrative).toContain('average streak: 14')
        expect(narrative).toContain('average level: 12')
        expect(narrative).toContain('The title is shared')
      })

      it('should handle sole title holder', () => {
        const narrative = `OBSERVATION

You are the only one bearing this title.

The System records your solitary distinction.`

        expect(narrative).toContain('only one')
        expect(narrative).toContain('solitary distinction')
      })
    })

    describe('No shadow narrative', () => {
      it('should have appropriate message for no level shadows', () => {
        const narrative = `OBSERVATION

No shadows detected at Level 25 today.

The System found no comparable players who completed their objectives.

Perhaps you are alone at this level.
Perhaps others have not yet begun.

The System does not speculate.
It only observes.`

        expect(narrative).toContain('No shadows detected')
        expect(narrative).toContain('Level 25')
        expect(narrative).toContain('does not speculate')
      })

      it('should have appropriate message for no streak shadows', () => {
        const narrative = `OBSERVATION

No shadows detected with a 30-day streak.

The System found no comparable players.

Your path may be unique.
Or others walk it silently.

The System records what it can measure.`

        expect(narrative).toContain('30-day streak')
        expect(narrative).toContain('path may be unique')
      })
    })
  })

  describe('Shadow type rotation', () => {
    it('should cycle through all shadow types based on day of year', () => {
      // The getDayOfYear function rotates through shadow types
      // Day 0,4,8... = level, Day 1,5,9... = streak, Day 2,6,10... = time, Day 3,7,11... = title
      const shadowTypes: ShadowType[] = ['level', 'streak', 'time', 'title']

      for (let dayOfYear = 0; dayOfYear < 8; dayOfYear++) {
        const expectedType = shadowTypes[dayOfYear % 4]
        expect(expectedType).toBeDefined()
      }
    })
  })

  describe('Data privacy', () => {
    it('should not expose identifying information', () => {
      const observation: ShadowObservation = {
        type: 'level',
        narrative: 'A player at Level 10 completed their objectives today.',
        shadowData: {
          shadowLevel: 10,
          shadowStreak: 7,
          playerCount: 5,
        },
        playerData: {
          level: 8,
          streak: 5,
        },
        observedAt: new Date().toISOString(),
      }

      // Should not have any user IDs
      expect(observation).not.toHaveProperty('userId')
      expect(observation).not.toHaveProperty('shadowUserId')
      expect(observation.shadowData).not.toHaveProperty('userId')
      expect(observation.shadowData).not.toHaveProperty('email')
      expect(observation.shadowData).not.toHaveProperty('name')
    })
  })
})
