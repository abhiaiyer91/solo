import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { formatDungeonResponse, formatAttemptResponse } from './dungeon'
import type { Dungeon, DungeonAttempt, DungeonProgress } from '../db/schema'

describe('Dungeon Service', () => {
  describe('formatDungeonResponse', () => {
    it('should format a dungeon for API response', () => {
      const dungeon: Dungeon = {
        id: 'dungeon-1',
        name: 'Morning Training',
        description: 'Complete your morning routine within 2 hours',
        difficulty: 'E_RANK',
        xpMultiplier: 1.5,
        durationMinutes: 120,
        cooldownHours: 24,
        baseXpReward: 50,
        seasonId: null,
        requirements: { levelRequired: 3 },
        challenges: [
          { type: 'workout_minutes', description: '30 minutes of exercise', target: 30 },
          { type: 'steps', description: '5000 steps', target: 5000 },
        ],
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
      }

      const result = formatDungeonResponse(dungeon)

      expect(result).toEqual({
        id: 'dungeon-1',
        name: 'Morning Training',
        description: 'Complete your morning routine within 2 hours',
        difficulty: 'E_RANK',
        xpMultiplier: 1.5,
        durationMinutes: 120,
        cooldownHours: 24,
        baseXpReward: 50,
        requirements: { levelRequired: 3 },
        challenges: [
          { type: 'workout_minutes', description: '30 minutes of exercise', target: 30 },
          { type: 'steps', description: '5000 steps', target: 5000 },
        ],
        levelRequired: 3, // E_RANK default
      })
    })

    it('should return correct level requirements for each difficulty', () => {
      const difficulties = [
        { difficulty: 'E_RANK', expected: 3 },
        { difficulty: 'D_RANK', expected: 6 },
        { difficulty: 'C_RANK', expected: 10 },
        { difficulty: 'B_RANK', expected: 15 },
        { difficulty: 'A_RANK', expected: 20 },
        { difficulty: 'S_RANK', expected: 25 },
      ] as const

      for (const { difficulty, expected } of difficulties) {
        const dungeon: Dungeon = {
          id: `dungeon-${difficulty}`,
          name: `${difficulty} Dungeon`,
          description: 'Test dungeon',
          difficulty,
          xpMultiplier: 1.0,
          durationMinutes: 60,
          cooldownHours: 24,
          baseXpReward: 50,
          seasonId: null,
          requirements: {},
          challenges: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        const result = formatDungeonResponse(dungeon)
        expect(result.levelRequired).toBe(expected)
      }
    })
  })

  describe('formatAttemptResponse', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should format an active attempt with time remaining', () => {
      const now = new Date('2026-01-18T10:00:00Z')
      vi.setSystemTime(now)

      const startedAt = new Date('2026-01-18T09:00:00Z')
      const expiresAt = new Date('2026-01-18T11:00:00Z') // 1 hour remaining

      const attempt: DungeonAttempt = {
        id: 'attempt-1',
        userId: 'user-1',
        dungeonId: 'dungeon-1',
        status: 'IN_PROGRESS',
        progress: {
          challengesCompleted: 1,
          challengeStatus: { 0: true },
          lastUpdated: now.toISOString(),
        } as DungeonProgress,
        startedAt,
        expiresAt,
        completedAt: null,
        xpAwarded: null,
        debuffActiveAtEntry: null,
        createdAt: startedAt,
        updatedAt: now,
      }

      const result = formatAttemptResponse(attempt)

      expect(result).toEqual({
        id: 'attempt-1',
        dungeonId: 'dungeon-1',
        status: 'IN_PROGRESS',
        progress: {
          challengesCompleted: 1,
          challengeStatus: { 0: true },
          lastUpdated: now.toISOString(),
        },
        startedAt: startedAt.toISOString(),
        expiresAt: expiresAt.toISOString(),
        completedAt: null,
        xpAwarded: null,
        isExpired: false,
        timeRemainingMinutes: 60, // 1 hour = 60 minutes
        debuffActiveAtEntry: false,
      })
    })

    it('should mark attempt as expired when past expiresAt', () => {
      const now = new Date('2026-01-18T12:00:00Z')
      vi.setSystemTime(now)

      const startedAt = new Date('2026-01-18T09:00:00Z')
      const expiresAt = new Date('2026-01-18T11:00:00Z') // 1 hour ago

      const attempt: DungeonAttempt = {
        id: 'attempt-1',
        userId: 'user-1',
        dungeonId: 'dungeon-1',
        status: 'IN_PROGRESS',
        progress: {
          challengesCompleted: 0,
          challengeStatus: {},
          lastUpdated: startedAt.toISOString(),
        } as DungeonProgress,
        startedAt,
        expiresAt,
        completedAt: null,
        xpAwarded: null,
        debuffActiveAtEntry: null,
        createdAt: startedAt,
        updatedAt: startedAt,
      }

      const result = formatAttemptResponse(attempt)

      expect(result.isExpired).toBe(true)
      expect(result.timeRemainingMinutes).toBe(0)
    })

    it('should format a completed attempt correctly', () => {
      const now = new Date('2026-01-18T10:30:00Z')
      vi.setSystemTime(now)

      const startedAt = new Date('2026-01-18T09:00:00Z')
      const expiresAt = new Date('2026-01-18T11:00:00Z')
      const completedAt = new Date('2026-01-18T10:30:00Z')

      const attempt: DungeonAttempt = {
        id: 'attempt-1',
        userId: 'user-1',
        dungeonId: 'dungeon-1',
        status: 'CLEARED',
        progress: {
          challengesCompleted: 3,
          challengeStatus: { 0: true, 1: true, 2: true },
          lastUpdated: completedAt.toISOString(),
        } as DungeonProgress,
        startedAt,
        expiresAt,
        completedAt,
        xpAwarded: 75,
        debuffActiveAtEntry: null,
        createdAt: startedAt,
        updatedAt: completedAt,
      }

      const result = formatAttemptResponse(attempt)

      expect(result.status).toBe('CLEARED')
      expect(result.completedAt).toBe(completedAt.toISOString())
      expect(result.xpAwarded).toBe(75)
      expect(result.debuffActiveAtEntry).toBe(false)
    })

    it('should show debuffActiveAtEntry as true when debuff was active', () => {
      const now = new Date('2026-01-18T10:00:00Z')
      vi.setSystemTime(now)

      const startedAt = new Date('2026-01-18T09:00:00Z')
      const expiresAt = new Date('2026-01-18T11:00:00Z')
      const debuffUntil = new Date('2026-01-18T15:00:00Z')

      const attempt: DungeonAttempt = {
        id: 'attempt-1',
        userId: 'user-1',
        dungeonId: 'dungeon-1',
        status: 'IN_PROGRESS',
        progress: {
          challengesCompleted: 0,
          challengeStatus: {},
          lastUpdated: startedAt.toISOString(),
        } as DungeonProgress,
        startedAt,
        expiresAt,
        completedAt: null,
        xpAwarded: null,
        debuffActiveAtEntry: debuffUntil, // Debuff was active
        createdAt: startedAt,
        updatedAt: startedAt,
      }

      const result = formatAttemptResponse(attempt)

      expect(result.debuffActiveAtEntry).toBe(true)
    })

    it('should calculate time remaining correctly for partial minutes', () => {
      const now = new Date('2026-01-18T10:00:00Z')
      vi.setSystemTime(now)

      const startedAt = new Date('2026-01-18T09:00:00Z')
      const expiresAt = new Date('2026-01-18T10:45:30Z') // 45.5 minutes remaining

      const attempt: DungeonAttempt = {
        id: 'attempt-1',
        userId: 'user-1',
        dungeonId: 'dungeon-1',
        status: 'IN_PROGRESS',
        progress: {
          challengesCompleted: 0,
          challengeStatus: {},
          lastUpdated: startedAt.toISOString(),
        } as DungeonProgress,
        startedAt,
        expiresAt,
        completedAt: null,
        xpAwarded: null,
        debuffActiveAtEntry: null,
        createdAt: startedAt,
        updatedAt: startedAt,
      }

      const result = formatAttemptResponse(attempt)

      // Should floor to 45 minutes
      expect(result.timeRemainingMinutes).toBe(45)
    })
  })
})
