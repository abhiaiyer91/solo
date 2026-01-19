/**
 * Push Notifications Hook
 * 
 * Handles registration for push notifications and token management.
 * Uses Expo Push Notifications for both iOS and Android.
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import Constants from 'expo-constants'
import { Platform } from 'react-native'
import { useRouter } from 'expo-router'

import { api } from '@/lib/api'
import { useAuthStore } from '@/stores/auth'

// Configure notification handling
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
})

interface PushNotificationState {
  token: string | null
  isRegistered: boolean
  isLoading: boolean
  error: string | null
  permission: 'undetermined' | 'granted' | 'denied'
}

interface NotificationData {
  type?: string
  screen?: string
  params?: Record<string, unknown>
}

/**
 * Hook for managing push notifications
 */
export function usePushNotifications() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  
  const [state, setState] = useState<PushNotificationState>({
    token: null,
    isRegistered: false,
    isLoading: true,
    error: null,
    permission: 'undetermined',
  })
  
  const notificationListener = useRef<Notifications.Subscription>()
  const responseListener = useRef<Notifications.Subscription>()
  const lastNotificationId = useRef<string>()

  /**
   * Register for push notifications
   */
  const registerForPushNotifications = useCallback(async (): Promise<string | null> => {
    // Check if running on a physical device
    if (!Device.isDevice) {
      console.log('[PUSH] Must use physical device for push notifications')
      setState(prev => ({ ...prev, isLoading: false, error: 'Physical device required' }))
      return null
    }

    // Check existing permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    let finalStatus = existingStatus
    
    setState(prev => ({ ...prev, permission: existingStatus }))

    // Request permissions if not determined
    if (existingStatus === 'undetermined') {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
      setState(prev => ({ ...prev, permission: status }))
    }

    if (finalStatus !== 'granted') {
      console.log('[PUSH] Permission not granted:', finalStatus)
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Notification permission denied',
        permission: finalStatus,
      }))
      return null
    }

    try {
      // Get Expo push token
      const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId
      
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId,
      })
      
      const token = tokenData.data
      console.log('[PUSH] Got Expo push token:', token)

      // Register token with backend
      if (isAuthenticated) {
        await registerTokenWithServer(token)
      }

      setState(prev => ({
        ...prev,
        token,
        isRegistered: true,
        isLoading: false,
        error: null,
      }))

      return token
    } catch (error) {
      console.error('[PUSH] Registration failed:', error)
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Registration failed',
      }))
      return null
    }
  }, [isAuthenticated])

  /**
   * Register token with backend server
   */
  const registerTokenWithServer = useCallback(async (token: string) => {
    try {
      await api.post('/api/devices/register', {
        pushToken: token,
        platform: Platform.OS,
        deviceName: Device.deviceName,
        appVersion: Constants.expoConfig?.version,
      })
      console.log('[PUSH] Token registered with server')
    } catch (error) {
      console.error('[PUSH] Failed to register token with server:', error)
      // Don't fail the hook - token is still valid locally
    }
  }, [])

  /**
   * Unregister from push notifications
   */
  const unregisterFromPushNotifications = useCallback(async () => {
    if (!state.token) return

    try {
      await api.post('/api/devices/unregister', {
        pushToken: state.token,
      })
      
      setState(prev => ({
        ...prev,
        isRegistered: false,
        token: null,
      }))
      
      console.log('[PUSH] Unregistered from push notifications')
    } catch (error) {
      console.error('[PUSH] Failed to unregister:', error)
    }
  }, [state.token])

  /**
   * Handle notification tap (navigation)
   */
  const handleNotificationResponse = useCallback((response: Notifications.NotificationResponse) => {
    const data = response.notification.request.content.data as NotificationData
    
    // Prevent duplicate handling
    const notificationId = response.notification.request.identifier
    if (notificationId === lastNotificationId.current) return
    lastNotificationId.current = notificationId

    console.log('[PUSH] Notification tapped:', data)

    // Navigate based on notification type
    if (data.screen) {
      router.push(data.screen as never)
    } else if (data.type) {
      // Map notification types to screens
      switch (data.type) {
        case 'morning_quests':
        case 'afternoon_status':
        case 'reconciliation':
          router.push('/(tabs)/')
          break
        case 'streak':
        case 'level_up':
          router.push('/stats')
          break
        case 'milestone':
          router.push('/achievements')
          break
        case 'boss':
          router.push('/dungeons')
          break
        default:
          router.push('/(tabs)/')
      }
    }
  }, [router])

  // Setup listeners on mount
  useEffect(() => {
    // Initial registration
    registerForPushNotifications()

    // Listen for notifications received while app is in foreground
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('[PUSH] Received notification:', notification.request.content)
    })

    // Listen for notification taps
    responseListener.current = Notifications.addNotificationResponseReceivedListener(handleNotificationResponse)

    // Android: Create notification channel
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#60A5FA',
      })
    }

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current)
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current)
      }
    }
  }, [registerForPushNotifications, handleNotificationResponse])

  // Re-register when user logs in
  useEffect(() => {
    if (isAuthenticated && state.token && !state.isRegistered) {
      registerTokenWithServer(state.token)
      setState(prev => ({ ...prev, isRegistered: true }))
    }
  }, [isAuthenticated, state.token, state.isRegistered, registerTokenWithServer])

  return {
    ...state,
    register: registerForPushNotifications,
    unregister: unregisterFromPushNotifications,
    requestPermission: registerForPushNotifications,
  }
}

/**
 * Schedule a local notification (for testing or offline)
 */
export async function scheduleLocalNotification(
  content: {
    title: string
    body: string
    data?: Record<string, unknown>
  },
  trigger?: Notifications.NotificationTriggerInput
) {
  return Notifications.scheduleNotificationAsync({
    content: {
      title: content.title,
      body: content.body,
      data: content.data,
      sound: 'default',
    },
    trigger: trigger ?? null, // null = immediate
  })
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync()
}

/**
 * Get badge count
 */
export async function getBadgeCount(): Promise<number> {
  return Notifications.getBadgeCountAsync()
}

/**
 * Set badge count
 */
export async function setBadgeCount(count: number) {
  await Notifications.setBadgeCountAsync(count)
}
