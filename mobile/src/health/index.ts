/**
 * Health module exports
 * Provides HealthKit integration for iOS and Health Connect for Android
 */

import { Platform } from 'react-native'

// Types
export * from './types'

// Providers - Platform specific
export * from './providers/healthkit'
export * from './providers/healthconnect'

// Queries
export * from './queries'

// Sync
export * from './sync'

// Hooks
export * from './hooks/useHealthAuth'
export * from './hooks/useHealthConnectAuth'

// Platform-aware health provider selection
export const isIOS = Platform.OS === 'ios'
export const isAndroid = Platform.OS === 'android'

/**
 * Get the appropriate health provider for the current platform
 */
export function getHealthProvider() {
  if (isIOS) {
    return import('./providers/healthkit')
  } else if (isAndroid) {
    return import('./providers/healthconnect')
  }
  return null
}
