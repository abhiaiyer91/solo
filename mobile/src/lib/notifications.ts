/**
 * Notification Utilities
 * 
 * Helper functions for handling notifications in the mobile app.
 */

import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'

export type NotificationType =
  | 'morning_quests'
  | 'milestone'
  | 'afternoon_status'
  | 'reconciliation'
  | 'streak'
  | 'level_up'
  | 'boss'
  | 'partner_activity'
  | 'guild_update'
  | 'system'

export interface NotificationContent {
  type: NotificationType
  title: string
  body: string
  data?: Record<string, unknown>
}

/**
 * Parse notification data from raw push payload
 */
export function parseNotification(
  notification: Notifications.Notification
): NotificationContent {
  const { title, body, data } = notification.request.content
  
  return {
    type: (data?.type as NotificationType) ?? 'system',
    title: title ?? '[SYSTEM]',
    body: body ?? '',
    data: data as Record<string, unknown>,
  }
}

/**
 * Get the screen to navigate to for a notification type
 */
export function getNotificationScreen(type: NotificationType): string {
  switch (type) {
    case 'morning_quests':
    case 'afternoon_status':
      return '/(tabs)/'
    case 'reconciliation':
      return '/reconciliation'
    case 'streak':
    case 'level_up':
      return '/stats'
    case 'milestone':
      return '/achievements'
    case 'boss':
      return '/dungeons'
    case 'partner_activity':
      return '/accountability'
    case 'guild_update':
      return '/guild'
    default:
      return '/(tabs)/'
  }
}

/**
 * Get notification icon for a type
 */
export function getNotificationIcon(type: NotificationType): string {
  switch (type) {
    case 'morning_quests':
      return '🌅'
    case 'milestone':
      return '🏆'
    case 'afternoon_status':
      return '☀️'
    case 'reconciliation':
      return '🌙'
    case 'streak':
      return '🔥'
    case 'level_up':
      return '⬆️'
    case 'boss':
      return '👹'
    case 'partner_activity':
      return '🤝'
    case 'guild_update':
      return '⚔️'
    default:
      return '📢'
  }
}

/**
 * Check if notifications are enabled
 */
export async function areNotificationsEnabled(): Promise<boolean> {
  const { status } = await Notifications.getPermissionsAsync()
  return status === 'granted'
}

/**
 * Request notification permissions
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync()
  return status === 'granted'
}

/**
 * Setup Android notification channels
 */
export async function setupNotificationChannels() {
  if (Platform.OS !== 'android') return

  // Default channel for all notifications
  await Notifications.setNotificationChannelAsync('default', {
    name: 'Default',
    description: 'General notifications from the System',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#60A5FA',
    sound: 'default',
  })

  // Quest channel for quest-related notifications
  await Notifications.setNotificationChannelAsync('quests', {
    name: 'Quest Updates',
    description: 'Daily quest assignments and progress',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 100, 100, 100],
    lightColor: '#4ADE80',
    sound: 'default',
  })

  // Streak channel for streak-related notifications
  await Notifications.setNotificationChannelAsync('streaks', {
    name: 'Streak Alerts',
    description: 'Streak milestones and warnings',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 500, 250, 500],
    lightColor: '#FF6600',
    sound: 'default',
  })

  // Boss channel for boss battles
  await Notifications.setNotificationChannelAsync('bosses', {
    name: 'Boss Battles',
    description: 'Weekly boss encounter updates',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 300, 100, 300, 100, 300],
    lightColor: '#EF4444',
    sound: 'default',
  })

  // Social channel for partner/guild notifications
  await Notifications.setNotificationChannelAsync('social', {
    name: 'Social',
    description: 'Partner and guild updates',
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 100],
    lightColor: '#A855F7',
    sound: 'default',
  })
}

/**
 * Get the appropriate channel ID for a notification type
 */
export function getChannelId(type: NotificationType): string {
  switch (type) {
    case 'morning_quests':
    case 'afternoon_status':
    case 'reconciliation':
      return 'quests'
    case 'streak':
      return 'streaks'
    case 'boss':
      return 'bosses'
    case 'partner_activity':
    case 'guild_update':
      return 'social'
    default:
      return 'default'
  }
}

/**
 * Format notification for display
 */
export function formatNotification(content: NotificationContent): {
  icon: string
  title: string
  body: string
  timestamp: string
} {
  return {
    icon: getNotificationIcon(content.type),
    title: content.title.replace('[SYSTEM] ', ''),
    body: content.body,
    timestamp: new Date().toLocaleTimeString(),
  }
}
