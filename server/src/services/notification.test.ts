import { describe, it, expect, vi } from 'vitest'
import {
  createNotification,
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  deleteNotification,
  type NotificationType,
  type CreateNotificationInput,
} from './notification'

// Mock database
vi.mock('../db', () => ({
  dbClient: null,
}))

describe('Notification Service', () => {
  describe('createNotification', () => {
    it('should reject if database is not connected', async () => {
      const input: CreateNotificationInput = {
        userId: 'user-1',
        type: 'quest_complete',
        title: 'Quest Complete',
        body: 'You completed a quest!',
      }
      
      await expect(createNotification(input)).rejects.toThrow(
        'Database connection required'
      )
    })
  })

  describe('getNotifications', () => {
    it('should reject if database is not connected', async () => {
      await expect(getNotifications('user-1')).rejects.toThrow(
        'Database connection required'
      )
    })

    it('should accept limit parameter', async () => {
      await expect(getNotifications('user-1', 10)).rejects.toThrow(
        'Database connection required'
      )
    })
  })

  describe('markAsRead', () => {
    it('should reject if database is not connected', async () => {
      await expect(markAsRead('notification-1', 'user-1')).rejects.toThrow(
        'Database connection required'
      )
    })
  })

  describe('markAllAsRead', () => {
    it('should reject if database is not connected', async () => {
      await expect(markAllAsRead('user-1')).rejects.toThrow(
        'Database connection required'
      )
    })
  })

  describe('getUnreadCount', () => {
    it('should reject if database is not connected', async () => {
      await expect(getUnreadCount('user-1')).rejects.toThrow(
        'Database connection required'
      )
    })
  })

  describe('deleteNotification', () => {
    it('should reject if database is not connected', async () => {
      await expect(deleteNotification('notification-1', 'user-1')).rejects.toThrow(
        'Database connection required'
      )
    })
  })

  describe('NotificationType', () => {
    it('should define valid notification types', () => {
      const types: NotificationType[] = [
        'quest_complete',
        'level_up',
        'streak_milestone',
        'boss_available',
        'guild_invite',
        'partner_request',
        'system_message',
      ]
      expect(types.length).toBeGreaterThan(0)
    })
  })
})
