import { describe, it, expect, vi } from 'vitest'
import {
  createDailyLog,
  getDailyLog,
  getDailyLogs,
  updateDailyLog,
  getDayStatus,
  getWeeklySummary,
  getMonthlySummary,
  type DailyLog,
  type DayStatus,
  type WeeklySummary,
} from './daily-log'

// Mock database
vi.mock('../db', () => ({
  dbClient: null,
}))

describe('Daily Log Service', () => {
  describe('createDailyLog', () => {
    it('should reject if database is not connected', async () => {
      await expect(createDailyLog('user-1', '2026-01-18')).rejects.toThrow(
        'Database connection required'
      )
    })
  })

  describe('getDailyLog', () => {
    it('should reject if database is not connected', async () => {
      await expect(getDailyLog('user-1', '2026-01-18')).rejects.toThrow(
        'Database connection required'
      )
    })
  })

  describe('getDailyLogs', () => {
    it('should reject if database is not connected', async () => {
      await expect(getDailyLogs('user-1', '2026-01-01', '2026-01-31')).rejects.toThrow(
        'Database connection required'
      )
    })
  })

  describe('updateDailyLog', () => {
    it('should reject if database is not connected', async () => {
      await expect(updateDailyLog('user-1', '2026-01-18', {
        xpEarned: 100,
        questsCompleted: 3,
      })).rejects.toThrow(
        'Database connection required'
      )
    })
  })

  describe('getDayStatus', () => {
    it('should reject if database is not connected', async () => {
      await expect(getDayStatus('user-1', '2026-01-18')).rejects.toThrow(
        'Database connection required'
      )
    })
  })

  describe('getWeeklySummary', () => {
    it('should reject if database is not connected', async () => {
      await expect(getWeeklySummary('user-1', '2026-01-18')).rejects.toThrow(
        'Database connection required'
      )
    })
  })

  describe('getMonthlySummary', () => {
    it('should reject if database is not connected', async () => {
      await expect(getMonthlySummary('user-1', 2026, 1)).rejects.toThrow(
        'Database connection required'
      )
    })
  })

  describe('DailyLog type', () => {
    it('should define daily log structure', () => {
      const log: DailyLog = {
        id: 'log-1',
        userId: 'user-1',
        date: '2026-01-18',
        xpEarned: 250,
        questsCompleted: 5,
        questsTotal: 6,
        isPerfectDay: false,
        streakDay: 14,
        healthSync: {
          steps: 8500,
          activeCalories: 350,
          exerciseMinutes: 45,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      
      expect(log.questsCompleted).toBe(5)
    })
  })

  describe('DayStatus type', () => {
    it('should define status values', () => {
      const statuses: DayStatus[] = ['incomplete', 'partial', 'complete', 'perfect']
      expect(statuses.length).toBe(4)
    })
  })

  describe('WeeklySummary type', () => {
    it('should aggregate weekly data', () => {
      const summary: WeeklySummary = {
        weekStart: '2026-01-13',
        weekEnd: '2026-01-19',
        totalXP: 1750,
        avgDailyXP: 250,
        questsCompleted: 35,
        perfectDays: 3,
        currentStreak: 14,
        bestDay: '2026-01-15',
        bestDayXP: 400,
      }
      
      expect(summary.perfectDays).toBeLessThanOrEqual(7)
    })
  })
})
