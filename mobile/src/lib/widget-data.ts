/**
 * Widget Data Provider
 *
 * Provides data for iOS WidgetKit and Android Glance widgets.
 * This module manages the shared state that widgets can read.
 *
 * Usage:
 * - Call updateWidgetData() when relevant data changes
 * - Native widgets read from UserDefaults (iOS) or SharedPreferences (Android)
 *
 * Note: Actual widget UI requires native code:
 * - iOS: WidgetKit extension in Swift
 * - Android: Glance or AppWidget in Kotlin
 */

import AsyncStorage from '@react-native-async-storage/async-storage'
import { Platform } from 'react-native'

// Widget data structure - kept minimal for widget performance
export interface WidgetData {
  // Quest progress
  questsCompletedToday: number
  questsTotalToday: number
  questsProgressPercent: number

  // Streak info
  currentStreak: number
  isStreakActive: boolean

  // XP progress
  currentLevel: number
  currentXP: number
  xpToNextLevel: number
  xpProgressPercent: number

  // Last update
  lastUpdatedAt: string
  lastUpdatedRelative: string
}

// Storage key for widget data
const WIDGET_DATA_KEY = '@journey/widget-data'

// App group identifier for iOS (must match WidgetKit extension)
const IOS_APP_GROUP = 'group.com.platformfirst.journey'

/**
 * Get current widget data from storage
 */
export async function getWidgetData(): Promise<WidgetData | null> {
  try {
    const data = await AsyncStorage.getItem(WIDGET_DATA_KEY)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error('Failed to read widget data:', error)
    return null
  }
}

/**
 * Update widget data in storage
 * Call this when quest progress, streak, or XP changes
 */
export async function updateWidgetData(data: Partial<WidgetData>): Promise<void> {
  try {
    const existing = await getWidgetData()
    const now = new Date()

    const updated: WidgetData = {
      questsCompletedToday: data.questsCompletedToday ?? existing?.questsCompletedToday ?? 0,
      questsTotalToday: data.questsTotalToday ?? existing?.questsTotalToday ?? 5,
      questsProgressPercent: 0,
      currentStreak: data.currentStreak ?? existing?.currentStreak ?? 0,
      isStreakActive: data.isStreakActive ?? existing?.isStreakActive ?? false,
      currentLevel: data.currentLevel ?? existing?.currentLevel ?? 1,
      currentXP: data.currentXP ?? existing?.currentXP ?? 0,
      xpToNextLevel: data.xpToNextLevel ?? existing?.xpToNextLevel ?? 1000,
      xpProgressPercent: 0,
      lastUpdatedAt: now.toISOString(),
      lastUpdatedRelative: 'just now',
    }

    // Calculate percentages
    updated.questsProgressPercent = updated.questsTotalToday > 0
      ? Math.round((updated.questsCompletedToday / updated.questsTotalToday) * 100)
      : 0

    updated.xpProgressPercent = updated.xpToNextLevel > 0
      ? Math.round((updated.currentXP / updated.xpToNextLevel) * 100)
      : 0

    await AsyncStorage.setItem(WIDGET_DATA_KEY, JSON.stringify(updated))

    // Notify native widgets to refresh
    if (Platform.OS === 'ios') {
      notifyIOSWidget()
    } else if (Platform.OS === 'android') {
      notifyAndroidWidget()
    }
  } catch (error) {
    console.error('Failed to update widget data:', error)
  }
}

/**
 * Clear widget data (e.g., on logout)
 */
export async function clearWidgetData(): Promise<void> {
  try {
    await AsyncStorage.removeItem(WIDGET_DATA_KEY)
  } catch (error) {
    console.error('Failed to clear widget data:', error)
  }
}

/**
 * Notify iOS WidgetKit to refresh
 * Requires native bridge implementation
 */
function notifyIOSWidget(): void {
  // TODO: Implement native bridge to call WidgetCenter.shared.reloadAllTimelines()
  // This requires a native module that exposes the WidgetKit API
  // Example native code:
  //
  // import WidgetKit
  //
  // @objc(WidgetBridge)
  // class WidgetBridge: NSObject {
  //   @objc static func reloadWidgets() {
  //     if #available(iOS 14.0, *) {
  //       WidgetCenter.shared.reloadAllTimelines()
  //     }
  //   }
  // }
  console.log('iOS widget refresh requested (native bridge not yet implemented)')
}

/**
 * Notify Android widget to refresh
 * Requires native bridge implementation
 */
function notifyAndroidWidget(): void {
  // TODO: Implement native bridge to send broadcast to AppWidgetProvider
  // This requires a native module that sends the widget update intent
  // Example native code:
  //
  // val intent = Intent(AppWidgetManager.ACTION_APPWIDGET_UPDATE)
  // intent.component = ComponentName(context, JourneyWidgetProvider::class.java)
  // context.sendBroadcast(intent)
  console.log('Android widget refresh requested (native bridge not yet implemented)')
}

/**
 * Format relative time for widget display
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  return 'yesterday'
}

/**
 * Create widget data from player state
 * Use this helper to update widgets when player data changes
 */
export function createWidgetDataFromPlayer(player: {
  level?: number
  currentXP?: number
  xpToNextLevel?: number
  streakDays?: number
  hasActiveStreak?: boolean
  questsCompleted?: number
  questsTotal?: number
}): Partial<WidgetData> {
  return {
    currentLevel: player.level ?? 1,
    currentXP: player.currentXP ?? 0,
    xpToNextLevel: player.xpToNextLevel ?? 1000,
    currentStreak: player.streakDays ?? 0,
    isStreakActive: player.hasActiveStreak ?? false,
    questsCompletedToday: player.questsCompleted ?? 0,
    questsTotalToday: player.questsTotal ?? 5,
  }
}
