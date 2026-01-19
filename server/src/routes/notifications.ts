import { Hono } from 'hono'
import { requireAuth } from '../middleware/auth'
import { logger } from '../lib/logger'
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
import {
  isEmailEnabled,
  sendNotificationEmail,
} from '../services/email'
import { dbClient as db } from '../db'
import { users } from '../db/schema'
import { eq } from 'drizzle-orm'

const notificationRoutes = new Hono()

// Get notification preferences
notificationRoutes.get('/notifications/preferences', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const preferences = await getNotificationPreferences(user.id)
    return c.json({ preferences })
  } catch (error) {
    logger.error('Get notification preferences error', { error })
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
    logger.error('Update notification preferences error', { error })
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
    logger.error('Enable all notifications error', { error })
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
    logger.error('Disable all notifications error', { error })
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
    logger.error('Push subscribe error', { error })
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
    logger.error('Push unsubscribe error', { error })
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
    logger.error('Push status error', { error })
    return c.json({ error: 'Failed to get push status' }, 500)
  }
})

// ==========================================
// Email Notification Endpoints
// ==========================================

// Get email notification preferences
notificationRoutes.get('/notifications/email/preferences', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    if (!db) {
      return c.json({ error: 'Database not available' }, 500)
    }

    const [result] = await db
      .select({
        emailEnabled: users.notifyEmailEnabled,
        weeklySummary: users.notifyEmailWeeklySummary,
      })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1)

    return c.json({
      preferences: {
        emailEnabled: result?.emailEnabled ?? false,
        weeklySummary: result?.weeklySummary ?? false,
      },
    })
  } catch (error) {
    logger.error('Get email preferences error', { error })
    return c.json({ error: 'Failed to get email preferences' }, 500)
  }
})

// Update email notification preferences
notificationRoutes.patch('/notifications/email/preferences', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    if (!db) {
      return c.json({ error: 'Database not available' }, 500)
    }

    const body = await c.req.json<{
      emailEnabled?: boolean
      weeklySummary?: boolean
    }>()

    const updates: Record<string, boolean> = {}
    if (body.emailEnabled !== undefined) {
      updates.notifyEmailEnabled = body.emailEnabled
    }
    if (body.weeklySummary !== undefined) {
      updates.notifyEmailWeeklySummary = body.weeklySummary
    }

    if (Object.keys(updates).length > 0) {
      await db
        .update(users)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(users.id, user.id))
    }

    const [result] = await db
      .select({
        emailEnabled: users.notifyEmailEnabled,
        weeklySummary: users.notifyEmailWeeklySummary,
      })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1)

    return c.json({
      preferences: {
        emailEnabled: result?.emailEnabled ?? false,
        weeklySummary: result?.weeklySummary ?? false,
      },
      message: '[SYSTEM] Email preferences updated.',
    })
  } catch (error) {
    logger.error('Update email preferences error', { error })
    return c.json({ error: 'Failed to update email preferences' }, 500)
  }
})

// Enable email notifications
notificationRoutes.post('/notifications/email/enable', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    if (!db) {
      return c.json({ error: 'Database not available' }, 500)
    }

    await db
      .update(users)
      .set({
        notifyEmailEnabled: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id))

    return c.json({
      emailEnabled: true,
      message: '[SYSTEM] Email notifications enabled.',
    })
  } catch (error) {
    logger.error('Enable email error', { error })
    return c.json({ error: 'Failed to enable email' }, 500)
  }
})

// Disable email notifications
notificationRoutes.post('/notifications/email/disable', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    if (!db) {
      return c.json({ error: 'Database not available' }, 500)
    }

    await db
      .update(users)
      .set({
        notifyEmailEnabled: false,
        notifyEmailWeeklySummary: false,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id))

    return c.json({
      emailEnabled: false,
      message: '[SYSTEM] Email notifications disabled.',
    })
  } catch (error) {
    logger.error('Disable email error', { error })
    return c.json({ error: 'Failed to disable email' }, 500)
  }
})

// Check email notification status
notificationRoutes.get('/notifications/email/status', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const enabled = await isEmailEnabled(user.id)

    return c.json({
      emailEnabled: enabled,
    })
  } catch (error) {
    logger.error('Email status error', { error })
    return c.json({ error: 'Failed to get email status' }, 500)
  }
})

// Test email notification (for debugging/testing)
notificationRoutes.post('/notifications/email/test', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const success = await sendNotificationEmail(user.id, 'milestone', {
      milestoneName: 'Test Email Configuration',
    })

    if (success) {
      return c.json({
        sent: true,
        message: '[SYSTEM] Test email sent. Check your inbox.',
      })
    } else {
      return c.json({
        sent: false,
        message: '[SYSTEM] Email notifications not enabled or email not configured.',
      })
    }
  } catch (error) {
    logger.error('Test email error', { error })
    return c.json({ error: 'Failed to send test email' }, 500)
  }
})

export default notificationRoutes
