/**
 * Service Worker for Push Notifications
 *
 * Handles background push events and notification clicks.
 */

// eslint-disable-next-line no-undef
const SW_VERSION = '1.0.0'

// Install event
self.addEventListener('install', (event) => {
  console.log(`[SW v${SW_VERSION}] Installing...`)
  self.skipWaiting()
})

// Activate event
self.addEventListener('activate', (event) => {
  console.log(`[SW v${SW_VERSION}] Activating...`)
  event.waitUntil(self.clients.claim())
})

// Push event - receive push notification
self.addEventListener('push', (event) => {
  console.log('[SW] Push received')

  if (!event.data) {
    console.log('[SW] No payload')
    return
  }

  try {
    const payload = event.data.json()

    const options = {
      body: payload.body || 'You have a new notification',
      icon: payload.icon || '/icons/icon-192.png',
      badge: payload.badge || '/icons/badge-72.png',
      tag: payload.tag || 'solo-notification',
      data: payload.data || {},
      requireInteraction: false,
      silent: false,
      vibrate: [100, 50, 100],
      actions: payload.actions || [],
    }

    event.waitUntil(
      self.registration.showNotification(payload.title || 'SOLO', options)
    )
  } catch (error) {
    console.error('[SW] Error processing push:', error)

    // Fallback to text
    const text = event.data.text()
    event.waitUntil(
      self.registration.showNotification('SOLO', {
        body: text,
        icon: '/icons/icon-192.png',
      })
    )
  }
})

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.notification.tag)

  event.notification.close()

  const data = event.notification.data || {}
  let targetUrl = data.url || '/'

  // Handle action buttons
  if (event.action) {
    console.log('[SW] Action clicked:', event.action)

    switch (event.action) {
      case 'close-day':
        targetUrl = '/?action=reconcile'
        break
      case 'view':
        // Use default URL from data
        break
      default:
        break
    }
  }

  // Open or focus the app
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Try to focus existing window
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(targetUrl)
          return client.focus()
        }
      }

      // Open new window if none exists
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl)
      }
    })
  )
})

// Notification close event (optional analytics)
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification closed:', event.notification.tag)
})

// Push subscription change event
self.addEventListener('pushsubscriptionchange', (event) => {
  console.log('[SW] Push subscription changed')

  // Attempt to resubscribe
  event.waitUntil(
    self.registration.pushManager
      .subscribe({
        userVisibleOnly: true,
        // applicationServerKey would need to be stored/retrieved
      })
      .then((subscription) => {
        console.log('[SW] Resubscribed:', subscription.endpoint)
        // Would need to send new subscription to server
      })
      .catch((error) => {
        console.error('[SW] Resubscription failed:', error)
      })
  )
})
