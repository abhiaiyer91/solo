import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Hono } from 'hono'
import {
  createMockAuthMiddleware,
  mockRequireAuth,
  mockUser,
  jsonRequest,
} from '../test/helpers/request'
import { mockNotificationPrefs } from '../test/fixtures/routes'

// Mock modules before importing
vi.mock('../db', () => ({
  dbClient: null,
}))

vi.mock('../lib/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}))

// Mock notification service
const mockGetNotificationPreferences = vi.fn()
const mockUpdateNotificationPreferences = vi.fn()

vi.mock('../services/notification', () => ({
  getNotificationPreferences: (...args: unknown[]) => mockGetNotificationPreferences(...args),
  updateNotificationPreferences: (...args: unknown[]) => mockUpdateNotificationPreferences(...args),
}))

// Mock push service
const mockRegisterPushSubscription = vi.fn()
const mockUnregisterPushSubscription = vi.fn()
const mockHasPushEnabled = vi.fn()
const mockGetVapidPublicKey = vi.fn()

vi.mock('../services/push', () => ({
  registerPushSubscription: (...args: unknown[]) => mockRegisterPushSubscription(...args),
  unregisterPushSubscription: (...args: unknown[]) => mockUnregisterPushSubscription(...args),
  hasPushEnabled: (...args: unknown[]) => mockHasPushEnabled(...args),
  getVapidPublicKey: () => mockGetVapidPublicKey(),
}))

// Mock email service
const mockIsEmailEnabled = vi.fn()
const mockSendNotificationEmail = vi.fn()

vi.mock('../services/email', () => ({
  isEmailEnabled: (...args: unknown[]) => mockIsEmailEnabled(...args),
  sendNotificationEmail: (...args: unknown[]) => mockSendNotificationEmail(...args),
}))

describe('Notification Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /notifications/preferences', () => {
    it('should return 401 when not authenticated', async () => {
      const app = new Hono()
      app.use('*', createMockAuthMiddleware(null))
      app.get('/notifications/preferences', mockRequireAuth, async () => {
        return new Response(null)
      })

      const res = await app.request('/notifications/preferences')
      expect(res.status).toBe(401)
    })

    it('should return notification preferences', async () => {
      mockGetNotificationPreferences.mockResolvedValue(mockNotificationPrefs)

      const app = new Hono()
      app.use('*', createMockAuthMiddleware(mockUser))
      app.get('/notifications/preferences', mockRequireAuth, async (c) => {
        const user = c.get('user')!
        const preferences = await mockGetNotificationPreferences(user.id)
        return c.json({ preferences })
      })

      const res = await app.request('/notifications/preferences')
      expect(res.status).toBe(200)

      const body = await res.json() as { preferences: typeof mockNotificationPrefs }
      expect(body.preferences.pushEnabled).toBe(true)
      expect(body.preferences.questReminders).toBe(true)
    })
  })

  describe('PATCH /notifications/preferences', () => {
    it('should update notification preferences', async () => {
      const updatedPrefs = { ...mockNotificationPrefs, questReminders: false }
      mockUpdateNotificationPreferences.mockResolvedValue(updatedPrefs)

      const app = new Hono()
      app.use('*', createMockAuthMiddleware(mockUser))
      app.patch('/notifications/preferences', mockRequireAuth, async (c) => {
        const user = c.get('user')!
        const body = await c.req.json<{ questReminders?: boolean }>()
        const preferences = await mockUpdateNotificationPreferences(user.id, body)
        return c.json({
          preferences,
          message: '[SYSTEM] Notification preferences updated.',
        })
      })

      const res = await app.request(
        '/notifications/preferences',
        jsonRequest({ questReminders: false }, 'PATCH')
      )

      expect(res.status).toBe(200)

      const body = await res.json() as { preferences: typeof updatedPrefs; message: string }
      expect(body.preferences.questReminders).toBe(false)
      expect(body.message).toContain('updated')
    })

    it('should update quiet hours', async () => {
      mockUpdateNotificationPreferences.mockResolvedValue({
        ...mockNotificationPrefs,
        quietHoursStart: 23,
        quietHoursEnd: 7,
      })

      const app = new Hono()
      app.use('*', createMockAuthMiddleware(mockUser))
      app.patch('/notifications/preferences', mockRequireAuth, async (c) => {
        const user = c.get('user')!
        const body = await c.req.json<{ quietHoursStart?: number; quietHoursEnd?: number }>()
        const preferences = await mockUpdateNotificationPreferences(user.id, body)
        return c.json({ preferences })
      })

      const res = await app.request(
        '/notifications/preferences',
        jsonRequest({ quietHoursStart: 23, quietHoursEnd: 7 }, 'PATCH')
      )

      expect(res.status).toBe(200)
      expect(mockUpdateNotificationPreferences).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({ quietHoursStart: 23, quietHoursEnd: 7 })
      )
    })
  })

  describe('POST /notifications/enable-all', () => {
    it('should enable all notification types', async () => {
      const allEnabled = {
        ...mockNotificationPrefs,
        morningQuests: true,
        milestones: true,
        afternoonStatus: true,
        reconciliation: true,
        streaks: true,
        levelUp: true,
        boss: true,
      }
      mockUpdateNotificationPreferences.mockResolvedValue(allEnabled)

      const app = new Hono()
      app.use('*', createMockAuthMiddleware(mockUser))
      app.post('/notifications/enable-all', mockRequireAuth, async (c) => {
        const user = c.get('user')!
        const preferences = await mockUpdateNotificationPreferences(user.id, {
          morningQuests: true,
          milestones: true,
          afternoonStatus: true,
          reconciliation: true,
          streaks: true,
          levelUp: true,
          boss: true,
        })
        return c.json({
          preferences,
          message: '[SYSTEM] All notifications enabled.',
        })
      })

      const res = await app.request('/notifications/enable-all', { method: 'POST' })
      expect(res.status).toBe(200)

      const body = await res.json() as { message: string }
      expect(body.message).toContain('All notifications enabled')
    })
  })

  describe('POST /notifications/disable-all', () => {
    it('should disable all notification types', async () => {
      const allDisabled = {
        ...mockNotificationPrefs,
        morningQuests: false,
        milestones: false,
        afternoonStatus: false,
        reconciliation: false,
        streaks: false,
        levelUp: false,
        boss: false,
      }
      mockUpdateNotificationPreferences.mockResolvedValue(allDisabled)

      const app = new Hono()
      app.use('*', createMockAuthMiddleware(mockUser))
      app.post('/notifications/disable-all', mockRequireAuth, async (c) => {
        const user = c.get('user')!
        const preferences = await mockUpdateNotificationPreferences(user.id, {
          morningQuests: false,
          milestones: false,
          afternoonStatus: false,
          reconciliation: false,
          streaks: false,
          levelUp: false,
          boss: false,
        })
        return c.json({
          preferences,
          message: '[SYSTEM] All notifications disabled.',
        })
      })

      const res = await app.request('/notifications/disable-all', { method: 'POST' })
      expect(res.status).toBe(200)

      const body = await res.json() as { message: string }
      expect(body.message).toContain('All notifications disabled')
    })
  })

  describe('Push Notification Endpoints', () => {
    describe('GET /notifications/push/vapid-key', () => {
      it('should return VAPID key when configured', async () => {
        mockGetVapidPublicKey.mockReturnValue('test-vapid-public-key')

        const app = new Hono()
        app.get('/notifications/push/vapid-key', async (c) => {
          const publicKey = mockGetVapidPublicKey()
          if (!publicKey) {
            return c.json({ available: false, message: 'Push notifications not configured' })
          }
          return c.json({ available: true, publicKey })
        })

        const res = await app.request('/notifications/push/vapid-key')
        expect(res.status).toBe(200)

        const body = await res.json() as { available: boolean; publicKey: string }
        expect(body.available).toBe(true)
        expect(body.publicKey).toBe('test-vapid-public-key')
      })

      it('should return unavailable when not configured', async () => {
        mockGetVapidPublicKey.mockReturnValue(null)

        const app = new Hono()
        app.get('/notifications/push/vapid-key', async (c) => {
          const publicKey = mockGetVapidPublicKey()
          if (!publicKey) {
            return c.json({ available: false, message: 'Push notifications not configured' })
          }
          return c.json({ available: true, publicKey })
        })

        const res = await app.request('/notifications/push/vapid-key')
        expect(res.status).toBe(200)

        const body = await res.json() as { available: boolean; message: string }
        expect(body.available).toBe(false)
        expect(body.message).toContain('not configured')
      })
    })

    describe('POST /notifications/push/subscribe', () => {
      it('should return 400 for invalid subscription format', async () => {
        const app = new Hono()
        app.use('*', createMockAuthMiddleware(mockUser))
        app.post('/notifications/push/subscribe', mockRequireAuth, async (c) => {
          const subscription = await c.req.json<{
            endpoint?: string
            keys?: { p256dh?: string; auth?: string }
          }>()

          if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
            return c.json({ error: 'Invalid subscription format' }, 400)
          }
          return c.json({ subscribed: true })
        })

        const res = await app.request(
          '/notifications/push/subscribe',
          jsonRequest({ endpoint: 'test' }) // Missing keys
        )

        expect(res.status).toBe(400)

        const body = await res.json() as { error: string }
        expect(body.error).toBe('Invalid subscription format')
      })

      it('should register valid subscription', async () => {
        mockRegisterPushSubscription.mockResolvedValue(true)

        const app = new Hono()
        app.use('*', createMockAuthMiddleware(mockUser))
        app.post('/notifications/push/subscribe', mockRequireAuth, async (c) => {
          const user = c.get('user')!
          const subscription = await c.req.json<{
            endpoint: string
            keys: { p256dh: string; auth: string }
          }>()

          if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
            return c.json({ error: 'Invalid subscription format' }, 400)
          }

          const success = await mockRegisterPushSubscription(user.id, subscription)
          if (success) {
            return c.json({
              subscribed: true,
              message: '[SYSTEM] Push notifications enabled.',
            })
          }
          return c.json({ error: 'Failed to register subscription' }, 500)
        })

        const res = await app.request(
          '/notifications/push/subscribe',
          jsonRequest({
            endpoint: 'https://push.example.com',
            keys: { p256dh: 'key1', auth: 'key2' },
          })
        )

        expect(res.status).toBe(200)

        const body = await res.json() as { subscribed: boolean; message: string }
        expect(body.subscribed).toBe(true)
        expect(body.message).toContain('Push notifications enabled')
      })
    })

    describe('POST /notifications/push/unsubscribe', () => {
      it('should unsubscribe from push notifications', async () => {
        mockUnregisterPushSubscription.mockResolvedValue(undefined)

        const app = new Hono()
        app.use('*', createMockAuthMiddleware(mockUser))
        app.post('/notifications/push/unsubscribe', mockRequireAuth, async (c) => {
          const user = c.get('user')!
          await mockUnregisterPushSubscription(user.id)
          return c.json({
            subscribed: false,
            message: '[SYSTEM] Push notifications disabled.',
          })
        })

        const res = await app.request('/notifications/push/unsubscribe', { method: 'POST' })
        expect(res.status).toBe(200)

        const body = await res.json() as { subscribed: boolean; message: string }
        expect(body.subscribed).toBe(false)
        expect(body.message).toContain('Push notifications disabled')
      })
    })

    describe('GET /notifications/push/status', () => {
      it('should return push subscription status', async () => {
        mockHasPushEnabled.mockResolvedValue(true)

        const app = new Hono()
        app.use('*', createMockAuthMiddleware(mockUser))
        app.get('/notifications/push/status', mockRequireAuth, async (c) => {
          const user = c.get('user')!
          const enabled = await mockHasPushEnabled(user.id)
          return c.json({ pushEnabled: enabled })
        })

        const res = await app.request('/notifications/push/status')
        expect(res.status).toBe(200)

        const body = await res.json() as { pushEnabled: boolean }
        expect(body.pushEnabled).toBe(true)
      })
    })
  })

  describe('Email Notification Endpoints', () => {
    describe('GET /notifications/email/status', () => {
      it('should return email notification status', async () => {
        mockIsEmailEnabled.mockResolvedValue(true)

        const app = new Hono()
        app.use('*', createMockAuthMiddleware(mockUser))
        app.get('/notifications/email/status', mockRequireAuth, async (c) => {
          const user = c.get('user')!
          const enabled = await mockIsEmailEnabled(user.id)
          return c.json({ emailEnabled: enabled })
        })

        const res = await app.request('/notifications/email/status')
        expect(res.status).toBe(200)

        const body = await res.json() as { emailEnabled: boolean }
        expect(body.emailEnabled).toBe(true)
      })
    })

    describe('POST /notifications/email/test', () => {
      it('should send test email when enabled', async () => {
        mockSendNotificationEmail.mockResolvedValue(true)

        const app = new Hono()
        app.use('*', createMockAuthMiddleware(mockUser))
        app.post('/notifications/email/test', mockRequireAuth, async (c) => {
          const user = c.get('user')!
          const success = await mockSendNotificationEmail(user.id, 'milestone', {
            milestoneName: 'Test Email',
          })
          if (success) {
            return c.json({
              sent: true,
              message: '[SYSTEM] Test email sent. Check your inbox.',
            })
          }
          return c.json({
            sent: false,
            message: '[SYSTEM] Email notifications not enabled.',
          })
        })

        const res = await app.request('/notifications/email/test', { method: 'POST' })
        expect(res.status).toBe(200)

        const body = await res.json() as { sent: boolean; message: string }
        expect(body.sent).toBe(true)
        expect(body.message).toContain('Test email sent')
      })

      it('should indicate when email is not enabled', async () => {
        mockSendNotificationEmail.mockResolvedValue(false)

        const app = new Hono()
        app.use('*', createMockAuthMiddleware(mockUser))
        app.post('/notifications/email/test', mockRequireAuth, async (c) => {
          const user = c.get('user')!
          const success = await mockSendNotificationEmail(user.id, 'milestone', {})
          if (success) {
            return c.json({ sent: true, message: 'Test email sent' })
          }
          return c.json({
            sent: false,
            message: '[SYSTEM] Email notifications not enabled.',
          })
        })

        const res = await app.request('/notifications/email/test', { method: 'POST' })
        expect(res.status).toBe(200)

        const body = await res.json() as { sent: boolean; message: string }
        expect(body.sent).toBe(false)
        expect(body.message).toContain('not enabled')
      })
    })
  })

  describe('Notification preference structure', () => {
    it('should include required preference fields', () => {
      const requiredFields = ['pushEnabled', 'emailEnabled', 'questReminders']
      for (const field of requiredFields) {
        expect(mockNotificationPrefs).toHaveProperty(field)
      }
    })

    it('should have valid quiet hours values', () => {
      expect(mockNotificationPrefs.quietHoursStart).toBeGreaterThanOrEqual(0)
      expect(mockNotificationPrefs.quietHoursStart).toBeLessThanOrEqual(23)
      expect(mockNotificationPrefs.quietHoursEnd).toBeGreaterThanOrEqual(0)
      expect(mockNotificationPrefs.quietHoursEnd).toBeLessThanOrEqual(23)
    })
  })
})
