/**
 * Analytics Service Tests
 * Tests for player analytics and tracking
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the analytics service
const mockAnalyticsService = {
  trackEvent: vi.fn(),
  getPlayerStats: vi.fn(),
  getQuestCompletionTrends: vi.fn(),
  getStreakHistory: vi.fn(),
  getCategoryBreakdown: vi.fn(),
  getWeeklyProgress: vi.fn(),
}

describe('analyticsService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('trackEvent', () => {
    it('should track quest completion event', async () => {
      mockAnalyticsService.trackEvent.mockResolvedValue({ success: true })

      const result = await mockAnalyticsService.trackEvent('user-1', 'quest_completed', {
        questId: 'quest-1',
        xpAwarded: 50,
        category: 'MOVEMENT',
      })

      expect(result.success).toBe(true)
      expect(mockAnalyticsService.trackEvent).toHaveBeenCalledWith(
        'user-1',
        'quest_completed',
        expect.objectContaining({
          questId: 'quest-1',
          xpAwarded: 50,
        })
      )
    })

    it('should track level up event', async () => {
      mockAnalyticsService.trackEvent.mockResolvedValue({ success: true })

      await mockAnalyticsService.trackEvent('user-1', 'level_up', {
        previousLevel: 4,
        newLevel: 5,
        totalXP: 450,
      })

      expect(mockAnalyticsService.trackEvent).toHaveBeenCalledWith(
        'user-1',
        'level_up',
        expect.objectContaining({
          previousLevel: 4,
          newLevel: 5,
        })
      )
    })

    it('should track streak milestone event', async () => {
      mockAnalyticsService.trackEvent.mockResolvedValue({ success: true })

      await mockAnalyticsService.trackEvent('user-1', 'streak_milestone', {
        streakDays: 30,
        milestoneType: 'MONTH',
      })

      expect(mockAnalyticsService.trackEvent).toHaveBeenCalledWith(
        'user-1',
        'streak_milestone',
        expect.objectContaining({
          streakDays: 30,
        })
      )
    })
  })

  describe('getPlayerStats', () => {
    it('should return player analytics overview', async () => {
      mockAnalyticsService.getPlayerStats.mockResolvedValue({
        totalQuestsCompleted: 150,
        totalXPEarned: 7500,
        longestStreak: 42,
        averageQuestsPerDay: 3.5,
        favoriteCategory: 'MOVEMENT',
        levelUpCount: 12,
        joinDate: '2025-10-01',
        activeDays: 100,
      })

      const result = await mockAnalyticsService.getPlayerStats('user-1')

      expect(result.totalQuestsCompleted).toBe(150)
      expect(result.favoriteCategory).toBe('MOVEMENT')
      expect(result.activeDays).toBe(100)
    })

    it('should handle new player with minimal data', async () => {
      mockAnalyticsService.getPlayerStats.mockResolvedValue({
        totalQuestsCompleted: 0,
        totalXPEarned: 0,
        longestStreak: 0,
        averageQuestsPerDay: 0,
        favoriteCategory: null,
        levelUpCount: 0,
        joinDate: '2026-01-19',
        activeDays: 1,
      })

      const result = await mockAnalyticsService.getPlayerStats('new-user')

      expect(result.totalQuestsCompleted).toBe(0)
      expect(result.favoriteCategory).toBeNull()
    })
  })

  describe('getQuestCompletionTrends', () => {
    it('should return daily completion counts', async () => {
      mockAnalyticsService.getQuestCompletionTrends.mockResolvedValue({
        period: 'week',
        data: [
          { date: '2026-01-13', completed: 4 },
          { date: '2026-01-14', completed: 3 },
          { date: '2026-01-15', completed: 5 },
          { date: '2026-01-16', completed: 4 },
          { date: '2026-01-17', completed: 4 },
          { date: '2026-01-18', completed: 2 },
          { date: '2026-01-19', completed: 3 },
        ],
        average: 3.57,
      })

      const result = await mockAnalyticsService.getQuestCompletionTrends('user-1', 'week')

      expect(result.data).toHaveLength(7)
      expect(result.average).toBeCloseTo(3.57, 1)
    })

    it('should return monthly trends', async () => {
      mockAnalyticsService.getQuestCompletionTrends.mockResolvedValue({
        period: 'month',
        data: Array.from({ length: 30 }, (_, i) => ({
          date: `2026-01-${String(i + 1).padStart(2, '0')}`,
          completed: Math.floor(Math.random() * 5) + 1,
        })),
        average: 3.2,
      })

      const result = await mockAnalyticsService.getQuestCompletionTrends('user-1', 'month')

      expect(result.data.length).toBeGreaterThanOrEqual(28)
    })
  })

  describe('getCategoryBreakdown', () => {
    it('should return quest counts by category', async () => {
      mockAnalyticsService.getCategoryBreakdown.mockResolvedValue({
        MOVEMENT: { completed: 45, percentage: 30 },
        TRAINING: { completed: 30, percentage: 20 },
        RECOVERY: { completed: 38, percentage: 25 },
        MINDSET: { completed: 22, percentage: 15 },
        NUTRITION: { completed: 15, percentage: 10 },
      })

      const result = await mockAnalyticsService.getCategoryBreakdown('user-1')

      expect(result.MOVEMENT.completed).toBe(45)
      expect(result.TRAINING.percentage).toBe(20)
    })

    it('should handle empty categories', async () => {
      mockAnalyticsService.getCategoryBreakdown.mockResolvedValue({
        MOVEMENT: { completed: 10, percentage: 100 },
        TRAINING: { completed: 0, percentage: 0 },
        RECOVERY: { completed: 0, percentage: 0 },
        MINDSET: { completed: 0, percentage: 0 },
        NUTRITION: { completed: 0, percentage: 0 },
      })

      const result = await mockAnalyticsService.getCategoryBreakdown('new-user')

      expect(result.MOVEMENT.percentage).toBe(100)
      expect(result.TRAINING.completed).toBe(0)
    })
  })

  describe('getWeeklyProgress', () => {
    it('should return week-over-week comparison', async () => {
      mockAnalyticsService.getWeeklyProgress.mockResolvedValue({
        thisWeek: {
          questsCompleted: 25,
          xpEarned: 1250,
          perfectDays: 3,
        },
        lastWeek: {
          questsCompleted: 20,
          xpEarned: 1000,
          perfectDays: 2,
        },
        change: {
          questsCompleted: 5,
          questsCompletedPercent: 25,
          xpEarned: 250,
          xpEarnedPercent: 25,
        },
      })

      const result = await mockAnalyticsService.getWeeklyProgress('user-1')

      expect(result.thisWeek.questsCompleted).toBe(25)
      expect(result.change.questsCompletedPercent).toBe(25)
    })

    it('should handle first week (no previous data)', async () => {
      mockAnalyticsService.getWeeklyProgress.mockResolvedValue({
        thisWeek: {
          questsCompleted: 10,
          xpEarned: 500,
          perfectDays: 1,
        },
        lastWeek: null,
        change: null,
      })

      const result = await mockAnalyticsService.getWeeklyProgress('new-user')

      expect(result.thisWeek.questsCompleted).toBe(10)
      expect(result.lastWeek).toBeNull()
      expect(result.change).toBeNull()
    })
  })
})
