import { describe, it, expect } from 'vitest'
import {
  getAllBosses,
  getBossById,
  formatBossResponse,
  formatAttemptResponse,
  type BossAttempt,
} from './boss'

describe('Boss Service', () => {
  describe('getAllBosses', () => {
    it('should return an array of bosses', async () => {
      const bosses = await getAllBosses()

      expect(Array.isArray(bosses)).toBe(true)
      expect(bosses.length).toBeGreaterThan(0)
    })

    it('should include the expected bosses', async () => {
      const bosses = await getAllBosses()
      const bossNames = bosses.map((b) => b.name)

      expect(bossNames).toContain('The Inconsistent One')
      expect(bossNames).toContain('The Excuse Maker')
      expect(bossNames).toContain('The Comfortable Self')
    })

    it('should have valid boss structures', async () => {
      const bosses = await getAllBosses()

      for (const boss of bosses) {
        expect(boss.id).toBeDefined()
        expect(boss.name).toBeDefined()
        expect(boss.description).toBeDefined()
        expect(boss.levelRequirement).toBeGreaterThan(0)
        expect(boss.totalDurationDays).toBeGreaterThan(0)
        expect(boss.xpReward).toBeGreaterThan(0)
        expect(['NORMAL', 'HARD', 'NIGHTMARE']).toContain(boss.difficulty)
        expect(boss.phases.length).toBeGreaterThan(0)
      }
    })

    it('should have valid phase structures', async () => {
      const bosses = await getAllBosses()

      for (const boss of bosses) {
        for (const phase of boss.phases) {
          expect(phase.phaseNumber).toBeGreaterThan(0)
          expect(phase.name).toBeDefined()
          expect(phase.durationDays).toBeGreaterThan(0)
          expect(phase.requirements.length).toBeGreaterThan(0)
          expect(phase.narrativeIntro).toBeDefined()
          expect(phase.narrativeVictory).toBeDefined()

          for (const req of phase.requirements) {
            expect(['streak', 'perfect_days', 'dungeon_clears', 'quest_completion_rate']).toContain(
              req.type
            )
            expect(req.value).toBeGreaterThan(0)
            expect(req.description).toBeDefined()
          }
        }
      }
    })
  })

  describe('getBossById', () => {
    it('should return the correct boss by ID', async () => {
      const boss = await getBossById('boss-inconsistent-one')

      expect(boss).not.toBeNull()
      expect(boss?.name).toBe('The Inconsistent One')
      expect(boss?.difficulty).toBe('NORMAL')
      expect(boss?.levelRequirement).toBe(5)
    })

    it('should return null for non-existent boss', async () => {
      const boss = await getBossById('boss-does-not-exist')

      expect(boss).toBeNull()
    })

    it('should return The Excuse Maker correctly', async () => {
      const boss = await getBossById('boss-excuse-maker')

      expect(boss).not.toBeNull()
      expect(boss?.name).toBe('The Excuse Maker')
      expect(boss?.difficulty).toBe('HARD')
      expect(boss?.levelRequirement).toBe(10)
      expect(boss?.xpReward).toBe(1000)
    })

    it('should return The Comfortable Self correctly', async () => {
      const boss = await getBossById('boss-comfortable-self')

      expect(boss).not.toBeNull()
      expect(boss?.name).toBe('The Comfortable Self')
      expect(boss?.difficulty).toBe('NIGHTMARE')
      expect(boss?.levelRequirement).toBe(20)
      expect(boss?.totalDurationDays).toBe(42)
      expect(boss?.xpReward).toBe(2500)
    })
  })

  describe('formatBossResponse', () => {
    it('should format a boss for API response', async () => {
      const boss = (await getBossById('boss-inconsistent-one'))!

      const result = formatBossResponse(boss)

      expect(result).toEqual({
        id: 'boss-inconsistent-one',
        name: 'The Inconsistent One',
        description: boss.description,
        systemMessage: boss.systemMessage,
        levelRequirement: 5,
        totalDurationDays: 21,
        xpReward: 500,
        difficulty: 'NORMAL',
        phases: expect.arrayContaining([
          expect.objectContaining({
            phaseNumber: 1,
            name: 'Phase 1: Breaking the Pattern',
            durationDays: 7,
            requirements: expect.arrayContaining([
              expect.objectContaining({
                type: 'streak',
                value: 7,
                description: 'Maintain a 7-day streak',
              }),
            ]),
          }),
        ]),
      })
    })

    it('should include all three phases for a boss', async () => {
      const boss = (await getBossById('boss-inconsistent-one'))!

      const result = formatBossResponse(boss)

      expect(result.phases.length).toBe(3)
      expect(result.phases[0]!.phaseNumber).toBe(1)
      expect(result.phases[1]!.phaseNumber).toBe(2)
      expect(result.phases[2]!.phaseNumber).toBe(3)
    })

    it('should format complex requirements correctly', async () => {
      const boss = (await getBossById('boss-comfortable-self'))!

      const result = formatBossResponse(boss)

      // Phase 3 has multiple requirements
      const phase3 = result.phases[2]
      expect(phase3).toBeDefined()
      expect(phase3!.requirements.length).toBe(3)

      const requirementTypes = phase3!.requirements.map((r) => r.type)
      expect(requirementTypes).toContain('streak')
      expect(requirementTypes).toContain('perfect_days')
      expect(requirementTypes).toContain('quest_completion_rate')
    })

    it('should not include titleRewardId in response', async () => {
      const boss = (await getBossById('boss-inconsistent-one'))!

      const result = formatBossResponse(boss)

      expect(result).not.toHaveProperty('titleRewardId')
    })

    it('should not include narratives in phase response', async () => {
      const boss = (await getBossById('boss-inconsistent-one'))!

      const result = formatBossResponse(boss)

      for (const phase of result.phases) {
        expect(phase).not.toHaveProperty('narrativeIntro')
        expect(phase).not.toHaveProperty('narrativeVictory')
      }
    })
  })

  describe('formatAttemptResponse', () => {
    it('should format an in-progress attempt correctly', () => {
      const attempt: BossAttempt = {
        id: 'attempt-123',
        bossId: 'boss-inconsistent-one',
        userId: 'user-1',
        status: 'IN_PROGRESS',
        currentPhase: 1,
        phaseStartDate: '2026-01-10',
        attemptStartDate: '2026-01-10',
        phasesCompleted: [],
        dailyProgress: {
          '2026-01-10': true,
          '2026-01-11': true,
          '2026-01-12': false,
        },
        completedAt: null,
        abandonedAt: null,
      }

      const result = formatAttemptResponse(attempt)

      expect(result).toEqual({
        id: 'attempt-123',
        bossId: 'boss-inconsistent-one',
        status: 'IN_PROGRESS',
        currentPhase: 1,
        phaseStartDate: '2026-01-10',
        attemptStartDate: '2026-01-10',
        phasesCompleted: [],
        completedAt: null,
        abandonedAt: null,
      })
    })

    it('should format a completed attempt correctly', () => {
      const attempt: BossAttempt = {
        id: 'attempt-456',
        bossId: 'boss-inconsistent-one',
        userId: 'user-1',
        status: 'VICTORY',
        currentPhase: 3,
        phaseStartDate: '2026-01-24',
        attemptStartDate: '2026-01-10',
        phasesCompleted: [1, 2, 3],
        dailyProgress: {},
        completedAt: '2026-01-31',
        abandonedAt: null,
      }

      const result = formatAttemptResponse(attempt)

      expect(result.status).toBe('VICTORY')
      expect(result.phasesCompleted).toEqual([1, 2, 3])
      expect(result.completedAt).toBe('2026-01-31')
    })

    it('should format an abandoned attempt correctly', () => {
      const attempt: BossAttempt = {
        id: 'attempt-789',
        bossId: 'boss-excuse-maker',
        userId: 'user-1',
        status: 'ABANDONED',
        currentPhase: 2,
        phaseStartDate: '2026-01-17',
        attemptStartDate: '2026-01-10',
        phasesCompleted: [1],
        dailyProgress: {},
        completedAt: null,
        abandonedAt: '2026-01-20',
      }

      const result = formatAttemptResponse(attempt)

      expect(result.status).toBe('ABANDONED')
      expect(result.phasesCompleted).toEqual([1])
      expect(result.abandonedAt).toBe('2026-01-20')
      expect(result.completedAt).toBeNull()
    })

    it('should not include userId in response', () => {
      const attempt: BossAttempt = {
        id: 'attempt-123',
        bossId: 'boss-inconsistent-one',
        userId: 'user-secret-id',
        status: 'IN_PROGRESS',
        currentPhase: 1,
        phaseStartDate: '2026-01-10',
        attemptStartDate: '2026-01-10',
        phasesCompleted: [],
        dailyProgress: {},
        completedAt: null,
        abandonedAt: null,
      }

      const result = formatAttemptResponse(attempt)

      expect(result).not.toHaveProperty('userId')
    })

    it('should not include dailyProgress in response', () => {
      const attempt: BossAttempt = {
        id: 'attempt-123',
        bossId: 'boss-inconsistent-one',
        userId: 'user-1',
        status: 'IN_PROGRESS',
        currentPhase: 1,
        phaseStartDate: '2026-01-10',
        attemptStartDate: '2026-01-10',
        phasesCompleted: [],
        dailyProgress: {
          '2026-01-10': true,
          '2026-01-11': true,
        },
        completedAt: null,
        abandonedAt: null,
      }

      const result = formatAttemptResponse(attempt)

      expect(result).not.toHaveProperty('dailyProgress')
    })
  })

  describe('Boss difficulty progression', () => {
    it('should have increasing level requirements by difficulty', async () => {
      const bosses = await getAllBosses()

      const bossLevels = {
        NORMAL: bosses.find((b) => b.difficulty === 'NORMAL')?.levelRequirement ?? 0,
        HARD: bosses.find((b) => b.difficulty === 'HARD')?.levelRequirement ?? 0,
        NIGHTMARE: bosses.find((b) => b.difficulty === 'NIGHTMARE')?.levelRequirement ?? 0,
      }

      expect(bossLevels.NORMAL).toBeLessThan(bossLevels.HARD)
      expect(bossLevels.HARD).toBeLessThan(bossLevels.NIGHTMARE)
    })

    it('should have increasing XP rewards by difficulty', async () => {
      const bosses = await getAllBosses()

      const bossXP = {
        NORMAL: bosses.find((b) => b.difficulty === 'NORMAL')?.xpReward ?? 0,
        HARD: bosses.find((b) => b.difficulty === 'HARD')?.xpReward ?? 0,
        NIGHTMARE: bosses.find((b) => b.difficulty === 'NIGHTMARE')?.xpReward ?? 0,
      }

      expect(bossXP.NORMAL).toBeLessThan(bossXP.HARD)
      expect(bossXP.HARD).toBeLessThan(bossXP.NIGHTMARE)
    })

    it('should have increasing duration by difficulty', async () => {
      const bosses = await getAllBosses()

      const normal = bosses.find((b) => b.difficulty === 'NORMAL')
      const nightmare = bosses.find((b) => b.difficulty === 'NIGHTMARE')

      // Nightmare should be longer or equal to normal
      expect(nightmare?.totalDurationDays).toBeGreaterThanOrEqual(normal?.totalDurationDays ?? 0)
    })
  })
})
