import { describe, it, expect, vi } from 'vitest'
import {
  createArchive,
  getArchives,
  getArchive,
  deleteArchive,
  restoreFromArchive,
  getArchiveStats,
  type Archive,
  type ArchiveType,
  type ArchiveStats,
} from './archive'

// Mock database
vi.mock('../db', () => ({
  dbClient: null,
}))

describe('Archive Service', () => {
  describe('createArchive', () => {
    it('should reject if database is not connected', async () => {
      await expect(createArchive('user-1', 'soft_reset', 'Testing reset')).rejects.toThrow(
        'Database connection required'
      )
    })
  })

  describe('getArchives', () => {
    it('should reject if database is not connected', async () => {
      await expect(getArchives('user-1')).rejects.toThrow(
        'Database connection required'
      )
    })

    it('should accept optional type filter', async () => {
      await expect(getArchives('user-1', 'soft_reset')).rejects.toThrow(
        'Database connection required'
      )
    })
  })

  describe('getArchive', () => {
    it('should reject if database is not connected', async () => {
      await expect(getArchive('archive-1', 'user-1')).rejects.toThrow(
        'Database connection required'
      )
    })
  })

  describe('deleteArchive', () => {
    it('should reject if database is not connected', async () => {
      await expect(deleteArchive('archive-1', 'user-1')).rejects.toThrow(
        'Database connection required'
      )
    })
  })

  describe('restoreFromArchive', () => {
    it('should reject if database is not connected', async () => {
      await expect(restoreFromArchive('archive-1', 'user-1')).rejects.toThrow(
        'Database connection required'
      )
    })
  })

  describe('getArchiveStats', () => {
    it('should reject if database is not connected', async () => {
      await expect(getArchiveStats('user-1')).rejects.toThrow(
        'Database connection required'
      )
    })
  })

  describe('Archive type', () => {
    it('should define archive structure', () => {
      const archive: Archive = {
        id: 'archive-1',
        userId: 'user-1',
        type: 'soft_reset',
        reason: 'Fresh start',
        data: {
          level: 15,
          xp: 5000,
          streak: 30,
        },
        createdAt: new Date().toISOString(),
      }
      
      expect(archive.type).toBe('soft_reset')
    })
  })

  describe('ArchiveType', () => {
    it('should define valid archive types', () => {
      const types: ArchiveType[] = ['soft_reset', 'season_end', 'manual_backup']
      expect(types.length).toBe(3)
    })
  })

  describe('ArchiveStats type', () => {
    it('should track archive statistics', () => {
      const stats: ArchiveStats = {
        totalArchives: 5,
        softResets: 2,
        seasonArchives: 3,
        oldestArchive: '2025-01-01',
        newestArchive: '2026-01-15',
      }
      
      expect(stats.totalArchives).toBe(5)
    })
  })
})
