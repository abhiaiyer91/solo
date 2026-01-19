import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  createGuild,
  getGuild,
  getUserGuild,
  joinGuild,
  leaveGuild,
  inviteToGuild,
  getPublicGuilds,
  getGuildLeaderboard,
  addGuildXP,
  MAX_MEMBERS_DEFAULT,
  type CreateGuildInput,
} from './guild'

// Mock database - guild service requires DB
vi.mock('../db', () => ({
  dbClient: null,
}))

describe('Guild Service', () => {
  describe('createGuild', () => {
    it('should reject if database is not connected', async () => {
      const input: CreateGuildInput = {
        name: 'Test Guild',
        description: 'A test guild',
        isPublic: true,
      }

      await expect(createGuild('user-1', input)).rejects.toThrow(
        'Database connection required'
      )
    })
  })

  describe('getGuild', () => {
    it('should reject if database is not connected', async () => {
      await expect(getGuild('guild-1')).rejects.toThrow(
        'Database connection required'
      )
    })
  })

  describe('getUserGuild', () => {
    it('should reject if database is not connected', async () => {
      await expect(getUserGuild('user-1')).rejects.toThrow(
        'Database connection required'
      )
    })
  })

  describe('joinGuild', () => {
    it('should reject if database is not connected', async () => {
      await expect(joinGuild('user-1', 'guild-1')).rejects.toThrow(
        'Database connection required'
      )
    })
  })

  describe('leaveGuild', () => {
    it('should reject if database is not connected', async () => {
      await expect(leaveGuild('user-1')).rejects.toThrow(
        'Database connection required'
      )
    })
  })

  describe('inviteToGuild', () => {
    it('should reject if database is not connected', async () => {
      await expect(inviteToGuild('user-1', 'user-2')).rejects.toThrow(
        'Database connection required'
      )
    })
  })

  describe('getPublicGuilds', () => {
    it('should reject if database is not connected', async () => {
      await expect(getPublicGuilds()).rejects.toThrow(
        'Database connection required'
      )
    })
  })

  describe('getGuildLeaderboard', () => {
    it('should reject if database is not connected', async () => {
      await expect(getGuildLeaderboard()).rejects.toThrow(
        'Database connection required'
      )
    })
  })

  describe('addGuildXP', () => {
    it('should reject if database is not connected', async () => {
      await expect(addGuildXP('user-1', 100)).rejects.toThrow(
        'Database connection required'
      )
    })
  })

  describe('Constants', () => {
    it('should export MAX_MEMBERS_DEFAULT', () => {
      expect(MAX_MEMBERS_DEFAULT).toBe(10)
    })
  })
})
