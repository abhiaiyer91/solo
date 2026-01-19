import { describe, it, expect, vi } from 'vitest'
import {
  createRaidBoss,
  getActiveRaid,
  getGuildRaidProgress,
  contributeToRaid,
  checkRaidCompletion,
  getAvailableRaids,
  type RaidBoss,
  type RaidProgress,
  type RaidContribution,
} from './raid'

// Mock database
vi.mock('../db', () => ({
  dbClient: null,
}))

describe('Raid Service', () => {
  describe('createRaidBoss', () => {
    it('should reject if database is not connected', async () => {
      await expect(createRaidBoss('guild-1', 'raid-boss-1')).rejects.toThrow(
        'Database connection required'
      )
    })
  })

  describe('getActiveRaid', () => {
    it('should reject if database is not connected', async () => {
      await expect(getActiveRaid('guild-1')).rejects.toThrow(
        'Database connection required'
      )
    })
  })

  describe('getGuildRaidProgress', () => {
    it('should reject if database is not connected', async () => {
      await expect(getGuildRaidProgress('guild-1')).rejects.toThrow(
        'Database connection required'
      )
    })
  })

  describe('contributeToRaid', () => {
    it('should reject if database is not connected', async () => {
      await expect(contributeToRaid('user-1', 'raid-1', 100)).rejects.toThrow(
        'Database connection required'
      )
    })
  })

  describe('checkRaidCompletion', () => {
    it('should reject if database is not connected', async () => {
      await expect(checkRaidCompletion('raid-1')).rejects.toThrow(
        'Database connection required'
      )
    })
  })

  describe('getAvailableRaids', () => {
    it('should return available raid templates', async () => {
      const raids = await getAvailableRaids()
      
      expect(Array.isArray(raids)).toBe(true)
      expect(raids.length).toBeGreaterThan(0)
      
      for (const raid of raids) {
        expect(raid.id).toBeDefined()
        expect(raid.name).toBeDefined()
        expect(raid.healthPoints).toBeGreaterThan(0)
        expect(raid.durationDays).toBeGreaterThan(0)
        expect(raid.minGuildLevel).toBeGreaterThanOrEqual(1)
      }
    })

    it('should include The Collective Excuse', async () => {
      const raids = await getAvailableRaids()
      const collectiveExcuse = raids.find(r => r.id === 'raid-collective-excuse')
      
      expect(collectiveExcuse).toBeDefined()
      expect(collectiveExcuse?.name).toBe('The Collective Excuse')
    })
  })

  describe('RaidBoss type', () => {
    it('should have required properties', () => {
      const raid: RaidBoss = {
        id: 'raid-1',
        name: 'Test Raid',
        description: 'A test raid boss',
        healthPoints: 10000,
        currentHealth: 10000,
        durationDays: 7,
        minGuildLevel: 5,
        xpRewardPerMember: 500,
      }
      
      expect(raid.healthPoints).toBe(10000)
    })
  })

  describe('RaidProgress type', () => {
    it('should track damage and contributors', () => {
      const progress: RaidProgress = {
        raidId: 'raid-1',
        guildId: 'guild-1',
        damageDealt: 5000,
        contributors: ['user-1', 'user-2'],
        startedAt: new Date().toISOString(),
        status: 'in_progress',
      }
      
      expect(progress.contributors.length).toBe(2)
    })
  })

  describe('RaidContribution type', () => {
    it('should track individual contributions', () => {
      const contribution: RaidContribution = {
        userId: 'user-1',
        raidId: 'raid-1',
        damageAmount: 100,
        contributedAt: new Date().toISOString(),
        source: 'quest_completion',
      }
      
      expect(contribution.source).toBe('quest_completion')
    })
  })
})
