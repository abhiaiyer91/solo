import { Hono } from 'hono'
import { requireAuth } from '../middleware/auth'
import {
  getNotificationPreferences,
  updateNotificationPreferences,
} from '../services/notification'
import {
  registerPushSubscription,
  unregisterPushSubscription,
  hasPushEnabled,
  getVapidPublicKey,
  type PushSubscription,
} from '../services/push'

const notificationRoutes = new Hono()

// Get notification preferences
notificationRoutes.get('/notifications/preferences', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const preferences = await getNotificationPreferences(user.id)
    return c.json({ preferences })
  } catch (error) {
    console.error('Get notification preferences error:', error)
    return c.json({ error: 'Failed to get preferences' }, 500)
  }
})

// Update notification preferences
notificationRoutes.patch('/notifications/preferences', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const body = await c.req.json<{
      morningQuests?: boolean
      milestones?: boolean
      afternoonStatus?: boolean
      reconciliation?: boolean
      streaks?: boolean
      levelUp?: boolean
      boss?: boolean
      quietHoursStart?: number
      quietHoursEnd?: number
    }>()

    const preferences = await updateNotificationPreferences(user.id, body)

    return c.json({
      preferences,
      message: '[SYSTEM] Notification preferences updated.',
    })
  } catch (error) {
    console.error('Update notification preferences error:', error)
    return c.json({ error: 'Failed to update preferences' }, 500)
  }
})

// Enable all notifications
notificationRoutes.post('/notifications/enable-all', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const preferences = await updateNotificationPreferences(user.id, {
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
  } catch (error) {
    console.error('Enable all notifications error:', error)
    return c.json({ error: 'Failed to enable notifications' }, 500)
  }
})

// Disable all notifications
notificationRoutes.post('/notifications/disable-all', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const preferences = await updateNotificationPreferences(user.id, {
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
  } catch (error) {
    console.error('Disable all notifications error:', error)
    return c.json({ error: 'Failed to disable notifications' }, 500)
  }
})

// ==========================================
// Push Notification Endpoints
// ==========================================

// Get VAPID public key for client subscription
notificationRoutes.get('/notifications/push/vapid-key', async (c) => {
  const publicKey = getVapidPublicKey()

  if (!publicKey) {
    return c.json({
      available: false,
      message: 'Push notifications not configured',
    })
  }

  return c.json({
    available: true,
    publicKey,
  })
})

// Register push subscription
notificationRoutes.post('/notifications/push/subscribe', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const subscription = await c.req.json<PushSubscription>()

    if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      return c.json({ error: 'Invalid subscription format' }, 400)
    }

    const success = await registerPushSubscription(user.id, subscription)

    if (success) {
      return c.json({
        subscribed: true,
        message: '[SYSTEM] Push notifications enabled.',
      })
    } else {
      return c.json({ error: 'Failed to register subscription' }, 500)
    }
  } catch (error) {
    console.error('Push subscribe error:', error)
    return c.json({ error: 'Failed to subscribe to push' }, 500)
  }
})

// Unregister push subscription
notificationRoutes.post('/notifications/push/unsubscribe', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    await unregisterPushSubscription(user.id)

    return c.json({
      subscribed: false,
      message: '[SYSTEM] Push notifications disabled.',
    })
  } catch (error) {
    console.error('Push unsubscribe error:', error)
    return c.json({ error: 'Failed to unsubscribe from push' }, 500)
  }
})

// Check push subscription status
notificationRoutes.get('/notifications/push/status', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const enabled = await hasPushEnabled(user.id)

    return c.json({
      pushEnabled: enabled,
    })
  } catch (error) {
    console.error('Push status error:', error)
    return c.json({ error: 'Failed to get push status' }, 500)
  }
})

export default notificationRoutes
