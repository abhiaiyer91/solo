/**
 * Push Notification Client Library
 *
 * Handles service worker registration and push subscription management.
 */

// Check if push notifications are supported
export function isPushSupported(): boolean {
  return (
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  )
}

// Check current notification permission
export function getNotificationPermission(): NotificationPermission {
  if (!('Notification' in window)) {
    return 'denied'
  }
  return Notification.permission
}

// Request notification permission
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return 'denied'
  }

  const permission = await Notification.requestPermission()
  return permission
}

// Register service worker
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    console.log('Service workers not supported')
    return null
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    })

    console.log('Service worker registered:', registration.scope)
    return registration
  } catch (error) {
    console.error('Service worker registration failed:', error)
    return null
  }
}

// Get VAPID public key from server
async function getVapidPublicKey(): Promise<string | null> {
  try {
    const res = await fetch('/api/notifications/push/vapid-key', {
      credentials: 'include',
    })

    if (!res.ok) return null

    const data = await res.json()
    return data.available ? data.publicKey : null
  } catch (error) {
    console.error('Failed to get VAPID key:', error)
    return null
  }
}

// Convert VAPID key to Uint8Array for subscription
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }

  return outputArray
}

// Subscribe to push notifications
export async function subscribeToPush(): Promise<boolean> {
  if (!isPushSupported()) {
    console.log('Push not supported')
    return false
  }

  // Request permission
  const permission = await requestNotificationPermission()
  if (permission !== 'granted') {
    console.log('Notification permission denied')
    return false
  }

  // Register service worker
  const registration = await registerServiceWorker()
  if (!registration) {
    return false
  }

  // Get VAPID key
  const vapidKey = await getVapidPublicKey()
  if (!vapidKey) {
    console.log('VAPID key not available')
    return false
  }

  try {
    // Subscribe to push
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidKey) as BufferSource,
    })

    // Send subscription to server
    const res = await fetch('/api/notifications/push/subscribe', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endpoint: subscription.endpoint,
        keys: {
          p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))),
          auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!))),
        },
      }),
    })

    if (!res.ok) {
      throw new Error('Failed to register subscription on server')
    }

    console.log('Push subscription successful')
    return true
  } catch (error) {
    console.error('Push subscription failed:', error)
    return false
  }
}

// Unsubscribe from push notifications
export async function unsubscribeFromPush(): Promise<boolean> {
  if (!isPushSupported()) {
    return false
  }

  try {
    const registration = await navigator.serviceWorker.ready

    const subscription = await registration.pushManager.getSubscription()
    if (subscription) {
      await subscription.unsubscribe()
    }

    // Notify server
    await fetch('/api/notifications/push/unsubscribe', {
      method: 'POST',
      credentials: 'include',
    })

    console.log('Push unsubscription successful')
    return true
  } catch (error) {
    console.error('Push unsubscription failed:', error)
    return false
  }
}

// Check if currently subscribed
export async function isPushSubscribed(): Promise<boolean> {
  if (!isPushSupported()) {
    return false
  }

  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()
    return subscription !== null
  } catch (error) {
    return false
  }
}

// Get push subscription status from server
export async function getPushStatus(): Promise<boolean> {
  try {
    const res = await fetch('/api/notifications/push/status', {
      credentials: 'include',
    })

    if (!res.ok) return false

    const data = await res.json()
    return data.pushEnabled ?? false
  } catch (error) {
    return false
  }
}
