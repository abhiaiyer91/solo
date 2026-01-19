/**
 * Permission utilities for mobile app
 * Handles camera and other permission requests
 */

import { Linking, Platform } from 'react-native'

/**
 * Open app settings for manual permission granting
 */
export async function openSettings(): Promise<void> {
  if (Platform.OS === 'ios') {
    await Linking.openURL('app-settings:')
  } else {
    await Linking.openSettings()
  }
}

/**
 * Permission status types
 */
export type PermissionStatus = 'granted' | 'denied' | 'undetermined'

/**
 * Format permission status from expo-camera format
 */
export function formatPermissionStatus(
  granted: boolean,
  canAskAgain: boolean
): PermissionStatus {
  if (granted) return 'granted'
  if (!canAskAgain) return 'denied'
  return 'undetermined'
}

/**
 * Check if permission is permanently denied (can't ask again)
 */
export function isPermanentlyDenied(canAskAgain: boolean, granted: boolean): boolean {
  return !granted && !canAskAgain
}
