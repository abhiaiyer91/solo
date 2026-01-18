/**
 * Push Notification Service
 *
 * Handles Web Push notifications using the Web Push API.
 * Supports browser notifications with VAPID authentication.
 */

// Database imports available for production use
// import { dbClient as db } from '../db'
// import { users } from '../db/schema'
// import { eq } from 'drizzle-orm'

// Types for Web Push
export interface PushSubscription {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

export interface PushPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  tag?: string
  data?: Record<string, unknown>
  actions?: { action: string; title: string }[]
}

export type NotificationType =
  | 'morning_quests'
  | 'milestone'
  | 'afternoon_status'
  | 'reconciliation'
  | 'streak_warning'
  | 'level_up'
  | 'boss_available'

// Store subscriptions in memory for now (in production, use database)
const subscriptionStore = new Map<string, PushSubscription>()

/**
 * Register a push subscription for a user
 */
export async function registerPushSubscription(
  userId: string,
  subscription: PushSubscription
): Promise<boolean> {
  try {
    // Store subscription
    subscriptionStore.set(userId, subscription)

    // In production, store in database:
    // await requireDb()
    //   .update(users)
    //   .set({ pushSubscription: JSON.stringify(subscription) })
    //   .where(eq(users.id, userId))

    return true
  } catch (error) {
    console.error('Failed to register push subscription:', error)
    return false
  }
}

/**
 * Unregister a push subscription
 */
export async function unregisterPushSubscription(userId: string): Promise<boolean> {
  try {
    subscriptionStore.delete(userId)
    return true
  } catch (error) {
    console.error('Failed to unregister push subscription:', error)
    return false
  }
}

/**
 * Get user's push subscription
 */
export async function getPushSubscription(userId: string): Promise<PushSubscription | null> {
  return subscriptionStore.get(userId) ?? null
}

/**
 * Check if user has push notifications enabled
 */
export async function hasPushEnabled(userId: string): Promise<boolean> {
  return subscriptionStore.has(userId)
}

/**
 * Send a push notification to a user
 */
export async function sendPushNotification(
  userId: string,
  payload: PushPayload
): Promise<boolean> {
  const subscription = await getPushSubscription(userId)

  if (!subscription) {
    console.log(`No push subscription for user ${userId}`)
    return false
  }

  try {
    // In production with web-push library:
    // const vapidKeys = {
    //   publicKey: process.env.VAPID_PUBLIC_KEY,
    //   privateKey: process.env.VAPID_PRIVATE_KEY,
    // }
    //
    // await webpush.sendNotification(
    //   subscription,
    //   JSON.stringify(payload),
    //   { vapidDetails: { subject: 'mailto:...', ...vapidKeys } }
    // )

    console.log(`[Push] Would send to ${userId}:`, payload.title)
    return true
  } catch (error) {
    console.error('Failed to send push notification:', error)

    // If subscription is invalid, remove it
    if (error instanceof Error && error.message.includes('expired')) {
      await unregisterPushSubscription(userId)
    }

    return false
  }
}

/**
 * Create notification payload for different types
 */
export function createPushPayload(
  type: NotificationType,
  data?: Record<string, unknown>
): PushPayload {
  switch (type) {
    case 'morning_quests':
      return {
        title: 'Daily Quests Available',
        body: 'Your quests for today are ready. Begin when you are.',
        icon: '/icons/quest.png',
        tag: 'morning-quests',
        data: { url: '/', type },
      }

    case 'milestone':
      return {
        title: 'Milestone Reached',
        body: data?.message as string ?? 'You have achieved a new milestone.',
        icon: '/icons/milestone.png',
        tag: 'milestone',
        data: { url: '/stats', type, ...data },
      }

    case 'afternoon_status':
      const progress = data?.progress as number ?? 0
      return {
        title: 'Afternoon Check-In',
        body: progress >= 50
          ? `${progress}% complete. Strong progress.`
          : `${progress}% complete. Time remains.`,
        icon: '/icons/status.png',
        tag: 'afternoon-status',
        data: { url: '/', type },
      }

    case 'reconciliation':
      return {
        title: 'Day Closing Soon',
        body: 'Confirm your progress before the day ends.',
        icon: '/icons/reconcile.png',
        tag: 'reconciliation',
        data: { url: '/', type },
        actions: [
          { action: 'close-day', title: 'Close Day' },
        ],
      }

    case 'streak_warning':
      return {
        title: 'Streak At Risk',
        body: `Your ${data?.streak ?? 0}-day streak is at risk. Complete today's quests.`,
        icon: '/icons/streak.png',
        tag: 'streak-warning',
        data: { url: '/', type },
      }

    case 'level_up':
      return {
        title: 'Level Up!',
        body: `You have reached Level ${data?.level ?? 0}.`,
        icon: '/icons/level.png',
        tag: 'level-up',
        data: { url: '/profile', type, ...data },
      }

    case 'boss_available':
      return {
        title: 'Boss Available',
        body: data?.bossName
          ? `${data.bossName} has appeared. Challenge when ready.`
          : 'A boss challenge awaits.',
        icon: '/icons/boss.png',
        tag: 'boss',
        data: { url: '/', type, ...data },
      }

    default:
      return {
        title: 'SOLO Notification',
        body: 'You have a new notification.',
        data: { type },
      }
  }
}

/**
 * Get VAPID public key for client subscription
 */
export function getVapidPublicKey(): string | null {
  return process.env.VAPID_PUBLIC_KEY ?? null
}

/**
 * Batch send notifications to multiple users
 */
export async function sendBatchPushNotifications(
  userIds: string[],
  payload: PushPayload
): Promise<{ success: number; failed: number }> {
  let success = 0
  let failed = 0

  for (const userId of userIds) {
    const result = await sendPushNotification(userId, payload)
    if (result) {
      success++
    } else {
      failed++
    }
  }

  return { success, failed }
}
