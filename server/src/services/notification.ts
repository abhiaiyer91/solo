/**
 * Notification Service
 *
 * Handles notification preferences and delivery.
 * All notifications are opt-in and respect quiet hours.
 */

import { dbClient as db } from '../db'
import { users } from '../db/schema'
import { eq } from 'drizzle-orm'
import { getCurrentTimeInTimezone, getSafeTimezone, type Timezone } from '../lib/timezone'

function requireDb() {
  if (!db) {
    throw new Error('Database connection required for notification service')
  }
  return db
}

export interface NotificationPreferences {
  morningQuests: boolean
  milestones: boolean
  afternoonStatus: boolean
  reconciliation: boolean
  streaks: boolean
  levelUp: boolean
  boss: boolean
  quietHoursStart: number // Hour 0-23
  quietHoursEnd: number // Hour 0-23
}

export type NotificationType =
  | 'morning_quests'
  | 'milestone'
  | 'afternoon_status'
  | 'reconciliation'
  | 'streak'
  | 'level_up'
  | 'boss'

export interface Notification {
  type: NotificationType
  title: string
  body: string
  data?: Record<string, unknown>
}

/**
 * Get notification preferences for a user
 */
export async function getNotificationPreferences(
  userId: string
): Promise<NotificationPreferences> {
  const [user] = await requireDb()
    .select({
      morningQuests: users.notifyMorningQuests,
      milestones: users.notifyMilestones,
      afternoonStatus: users.notifyAfternoonStatus,
      reconciliation: users.notifyReconciliation,
      streaks: users.notifyStreaks,
      levelUp: users.notifyLevelUp,
      boss: users.notifyBoss,
      quietHoursStart: users.quietHoursStart,
      quietHoursEnd: users.quietHoursEnd,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!user) {
    throw new Error('User not found')
  }

  return user
}

/**
 * Update notification preferences for a user
 */
export async function updateNotificationPreferences(
  userId: string,
  preferences: Partial<NotificationPreferences>
): Promise<NotificationPreferences> {
  const updates: Record<string, boolean | number> = {}

  if (preferences.morningQuests !== undefined) {
    updates.notifyMorningQuests = preferences.morningQuests
  }
  if (preferences.milestones !== undefined) {
    updates.notifyMilestones = preferences.milestones
  }
  if (preferences.afternoonStatus !== undefined) {
    updates.notifyAfternoonStatus = preferences.afternoonStatus
  }
  if (preferences.reconciliation !== undefined) {
    updates.notifyReconciliation = preferences.reconciliation
  }
  if (preferences.streaks !== undefined) {
    updates.notifyStreaks = preferences.streaks
  }
  if (preferences.levelUp !== undefined) {
    updates.notifyLevelUp = preferences.levelUp
  }
  if (preferences.boss !== undefined) {
    updates.notifyBoss = preferences.boss
  }
  if (preferences.quietHoursStart !== undefined) {
    const hour = Math.max(0, Math.min(23, preferences.quietHoursStart))
    updates.quietHoursStart = hour
  }
  if (preferences.quietHoursEnd !== undefined) {
    const hour = Math.max(0, Math.min(23, preferences.quietHoursEnd))
    updates.quietHoursEnd = hour
  }

  if (Object.keys(updates).length > 0) {
    await requireDb()
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, userId))
  }

  return getNotificationPreferences(userId)
}

/**
 * Check if current time is within quiet hours
 */
export function isQuietHours(
  quietHoursStart: number,
  quietHoursEnd: number,
  timezone: Timezone = 'UTC'
): boolean {
  const safeTimezone = getSafeTimezone(timezone)
  const { hour } = getCurrentTimeInTimezone(safeTimezone)

  // Handle wraparound (e.g., 22:00 to 07:00)
  if (quietHoursStart > quietHoursEnd) {
    // Quiet hours cross midnight
    return hour >= quietHoursStart || hour < quietHoursEnd
  } else {
    // Normal case (e.g., 01:00 to 06:00)
    return hour >= quietHoursStart && hour < quietHoursEnd
  }
}

/**
 * Check if a notification should be sent based on preferences
 */
export async function shouldSendNotification(
  userId: string,
  type: NotificationType
): Promise<boolean> {
  const [user] = await requireDb()
    .select({
      morningQuests: users.notifyMorningQuests,
      milestones: users.notifyMilestones,
      afternoonStatus: users.notifyAfternoonStatus,
      reconciliation: users.notifyReconciliation,
      streaks: users.notifyStreaks,
      levelUp: users.notifyLevelUp,
      boss: users.notifyBoss,
      quietHoursStart: users.quietHoursStart,
      quietHoursEnd: users.quietHoursEnd,
      timezone: users.timezone,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!user) return false

  // Check quiet hours
  if (isQuietHours(user.quietHoursStart, user.quietHoursEnd, user.timezone)) {
    return false
  }

  // Check specific preference
  switch (type) {
    case 'morning_quests':
      return user.morningQuests
    case 'milestone':
      return user.milestones
    case 'afternoon_status':
      return user.afternoonStatus
    case 'reconciliation':
      return user.reconciliation
    case 'streak':
      return user.streaks
    case 'level_up':
      return user.levelUp
    case 'boss':
      return user.boss
    default:
      return false
  }
}

/**
 * Create notification content (data-only, never motivational)
 */
export function createNotificationContent(
  type: NotificationType,
  data: Record<string, unknown>
): Notification {
  switch (type) {
    case 'morning_quests':
      return {
        type,
        title: '[SYSTEM] Daily Objectives',
        body: `${data.questCount ?? 4} quests assigned. The System is recording.`,
        data,
      }

    case 'milestone':
      return {
        type,
        title: '[SYSTEM] Milestone Reached',
        body: `${data.milestoneName}. Progress recorded.`,
        data,
      }

    case 'afternoon_status':
      return {
        type,
        title: '[SYSTEM] Status Update',
        body: `Movement: ${data.steps ?? 0}/10,000. The System is recording.`,
        data,
      }

    case 'reconciliation':
      return {
        type,
        title: '[SYSTEM] Day Closing',
        body: `${data.pendingCount ?? 0} items pending confirmation.`,
        data,
      }

    case 'streak':
      return {
        type,
        title: '[SYSTEM] Streak Update',
        body: `Current streak: ${data.streakDays ?? 0} days.`,
        data,
      }

    case 'level_up':
      return {
        type,
        title: '[SYSTEM] Level Increased',
        body: `Level ${data.newLevel}. Growth recorded.`,
        data,
      }

    case 'boss':
      return {
        type,
        title: '[SYSTEM] Boss Encounter',
        body: `${data.bossName}: Day ${data.dayNumber ?? 1}. ${data.status ?? 'Active'}.`,
        data,
      }

    default:
      return {
        type,
        title: '[SYSTEM]',
        body: 'Update available.',
        data,
      }
  }
}

/**
 * Queue a notification for delivery
 * For now, this is a placeholder - actual push notification delivery
 * would require integration with a service like Firebase/OneSignal
 */
export async function queueNotification(
  userId: string,
  type: NotificationType,
  data: Record<string, unknown>
): Promise<boolean> {
  const shouldSend = await shouldSendNotification(userId, type)

  if (!shouldSend) {
    return false
  }

  const notification = createNotificationContent(type, data)

  // Send push notification via Expo Push API
  try {
    const { sendPushToUser } = await import('./push-provider')
    const result = await sendPushToUser(userId, {
      title: notification.title,
      body: notification.body,
      data: notification.data,
    })
    
    console.log('[NOTIFICATION] Sent:', { 
      userId, 
      type, 
      sent: result.sent, 
      failed: result.failed 
    })
    
    return result.sent > 0
  } catch (error) {
    console.error('[NOTIFICATION] Failed to send push:', error)
    return false
  }
}
