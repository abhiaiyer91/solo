import { describe, it, expect, vi } from 'vitest'
import {
  createPsychologyProfile,
  getPsychologyProfile,
  updatePsychologyProfile,
  analyzePlayerPatterns,
  generatePersonalizedInsights,
  getMotivationStyle,
  type PsychologyProfile,
  type MotivationStyle,
  type PersonalizedInsight,
} from './psychology'

// Mock database
vi.mock('../db', () => ({
  dbClient: null,
}))

describe('Psychology Service', () => {
  describe('createPsychologyProfile', () => {
    it('should reject if database is not connected', async () => {
      await expect(createPsychologyProfile('user-1', {
        motivationStyle: 'intrinsic',
        accountabilityPreference: 'self',
      })).rejects.toThrow(
        'Database connection required'
      )
    })
  })

  describe('getPsychologyProfile', () => {
    it('should reject if database is not connected', async () => {
      await expect(getPsychologyProfile('user-1')).rejects.toThrow(
        'Database connection required'
      )
    })
  })

  describe('updatePsychologyProfile', () => {
    it('should reject if database is not connected', async () => {
      await expect(updatePsychologyProfile('user-1', {
        motivationStyle: 'extrinsic',
      })).rejects.toThrow(
        'Database connection required'
      )
    })
  })

  describe('analyzePlayerPatterns', () => {
    it('should reject if database is not connected', async () => {
      await expect(analyzePlayerPatterns('user-1')).rejects.toThrow(
        'Database connection required'
      )
    })
  })

  describe('generatePersonalizedInsights', () => {
    it('should reject if database is not connected', async () => {
      await expect(generatePersonalizedInsights('user-1')).rejects.toThrow(
        'Database connection required'
      )
    })
  })

  describe('getMotivationStyle', () => {
    it('should return valid motivation styles', () => {
      const styles = getMotivationStyle()
      
      expect(Array.isArray(styles)).toBe(true)
      expect(styles).toContain('intrinsic')
      expect(styles).toContain('extrinsic')
      expect(styles).toContain('social')
      expect(styles).toContain('achievement')
    })
  })

  describe('PsychologyProfile type', () => {
    it('should define profile structure', () => {
      const profile: PsychologyProfile = {
        userId: 'user-1',
        motivationStyle: 'intrinsic',
        accountabilityPreference: 'partner',
        challengePreference: 'gradual',
        feedbackFrequency: 'frequent',
        narrativeEngagement: 'high',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      
      expect(profile.motivationStyle).toBe('intrinsic')
    })
  })

  describe('MotivationStyle type', () => {
    it('should define valid styles', () => {
      const styles: MotivationStyle[] = ['intrinsic', 'extrinsic', 'social', 'achievement']
      expect(styles.length).toBe(4)
    })
  })

  describe('PersonalizedInsight type', () => {
    it('should define insight structure', () => {
      const insight: PersonalizedInsight = {
        id: 'insight-1',
        type: 'pattern',
        title: 'Morning Person',
        message: 'You complete most quests before noon.',
        confidence: 0.85,
        actionable: true,
        action: 'Schedule important quests in the morning',
      }
      
      expect(insight.confidence).toBeGreaterThan(0)
      expect(insight.confidence).toBeLessThanOrEqual(1)
    })
  })
})
