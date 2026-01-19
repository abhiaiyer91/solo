import { describe, it, expect, vi } from 'vitest'
import {
  createPartnership,
  getPartner,
  getPendingRequests,
  respondToRequest,
  dissolvePartnership,
  getPartnerActivity,
  type PartnershipStatus,
} from './accountability'

// Mock database
vi.mock('../db', () => ({
  dbClient: null,
}))

describe('Accountability Service', () => {
  describe('createPartnership', () => {
    it('should reject if database is not connected', async () => {
      await expect(createPartnership('user-1', 'user-2')).rejects.toThrow(
        'Database connection required'
      )
    })
  })

  describe('getPartner', () => {
    it('should reject if database is not connected', async () => {
      await expect(getPartner('user-1')).rejects.toThrow(
        'Database connection required'
      )
    })
  })

  describe('getPendingRequests', () => {
    it('should reject if database is not connected', async () => {
      await expect(getPendingRequests('user-1')).rejects.toThrow(
        'Database connection required'
      )
    })
  })

  describe('respondToRequest', () => {
    it('should reject if database is not connected', async () => {
      await expect(respondToRequest('user-1', 'request-1', 'ACCEPTED')).rejects.toThrow(
        'Database connection required'
      )
    })
  })

  describe('dissolvePartnership', () => {
    it('should reject if database is not connected', async () => {
      await expect(dissolvePartnership('user-1')).rejects.toThrow(
        'Database connection required'
      )
    })
  })

  describe('getPartnerActivity', () => {
    it('should reject if database is not connected', async () => {
      await expect(getPartnerActivity('user-1')).rejects.toThrow(
        'Database connection required'
      )
    })
  })

  describe('PartnershipStatus type', () => {
    it('should accept valid partnership statuses', () => {
      const statuses: PartnershipStatus[] = ['PENDING', 'ACTIVE', 'DISSOLVED']
      expect(statuses.length).toBe(3)
    })
  })
})
