/**
 * Push Notification Provider
 * 
 * Abstract interface for push notification delivery.
 * Supports Expo Push Notifications (default) with fallback handling.
 */

import { dbClient as db } from '../db'
import { deviceTokens } from '../db/schema/devices'
import { eq, and, sql } from 'drizzle-orm'

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send'
const MAX_BATCH_SIZE = 100
const MAX_FAILURES_BEFORE_DISABLE = 5

export interface PushMessage {
  to: string // Push token
  title: string
  body: string
  data?: Record<string, unknown>
  sound?: 'default' | null
  badge?: number
  channelId?: string // Android notification channel
  priority?: 'default' | 'normal' | 'high'
  categoryId?: string // For actionable notifications
}

export interface PushResult {
  success: boolean
  token: string
  ticketId?: string
  error?: string
  errorType?: 'DeviceNotRegistered' | 'MessageTooBig' | 'MessageRateExceeded' | 'InvalidCredentials' | 'Unknown'
}

interface ExpoTicket {
  status: 'ok' | 'error'
  id?: string
  message?: string
  details?: {
    error?: string
  }
}

interface ExpoResponse {
  data: ExpoTicket[]
}

function requireDb() {
  if (!db) {
    throw new Error('Database connection required for push provider')
  }
  return db
}

/**
 * Register or update a device push token
 */
export async function registerPushToken(
  userId: string,
  pushToken: string,
  options: {
    platform: 'ios' | 'android' | 'web'
    deviceId?: string
    deviceName?: string
    appVersion?: string
  }
): Promise<{ id: string; isNew: boolean }> {
  const database = requireDb()
  
  // Check if token already exists
  const existing = await database
    .select()
    .from(deviceTokens)
    .where(eq(deviceTokens.pushToken, pushToken))
    .limit(1)
  
  if (existing.length > 0) {
    // Update existing token
    await database
      .update(deviceTokens)
      .set({
        userId, // Transfer to new user if needed
        platform: options.platform,
        deviceId: options.deviceId,
        deviceName: options.deviceName,
        appVersion: options.appVersion,
        isActive: true,
        lastUsedAt: new Date(),
        failedAttempts: '0',
        updatedAt: new Date(),
      })
      .where(eq(deviceTokens.pushToken, pushToken))
    
    return { id: existing[0].id, isNew: false }
  }
  
  // Create new token
  const [newToken] = await database
    .insert(deviceTokens)
    .values({
      userId,
      pushToken,
      platform: options.platform,
      deviceId: options.deviceId,
      deviceName: options.deviceName,
      appVersion: options.appVersion,
      lastUsedAt: new Date(),
    })
    .returning({ id: deviceTokens.id })
  
  return { id: newToken.id, isNew: true }
}

/**
 * Unregister a device push token
 */
export async function unregisterPushToken(pushToken: string): Promise<boolean> {
  const database = requireDb()
  
  const result = await database
    .update(deviceTokens)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(deviceTokens.pushToken, pushToken))
  
  return (result.rowCount ?? 0) > 0
}

/**
 * Get all active push tokens for a user
 */
export async function getUserPushTokens(userId: string): Promise<Array<{
  id: string
  pushToken: string
  platform: 'ios' | 'android' | 'web'
}>> {
  const database = requireDb()
  
  const tokens = await database
    .select({
      id: deviceTokens.id,
      pushToken: deviceTokens.pushToken,
      platform: deviceTokens.platform,
    })
    .from(deviceTokens)
    .where(
      and(
        eq(deviceTokens.userId, userId),
        eq(deviceTokens.isActive, true)
      )
    )
  
  return tokens as Array<{ id: string; pushToken: string; platform: 'ios' | 'android' | 'web' }>
}

/**
 * Send push notifications via Expo Push API
 */
export async function sendPushNotifications(
  messages: PushMessage[]
): Promise<PushResult[]> {
  if (messages.length === 0) {
    return []
  }
  
  const results: PushResult[] = []
  
  // Process in batches
  for (let i = 0; i < messages.length; i += MAX_BATCH_SIZE) {
    const batch = messages.slice(i, i + MAX_BATCH_SIZE)
    const batchResults = await sendExpoPushBatch(batch)
    results.push(...batchResults)
  }
  
  // Handle failed tokens
  await handleFailedTokens(results)
  
  return results
}

/**
 * Send a batch of push notifications to Expo
 */
async function sendExpoPushBatch(messages: PushMessage[]): Promise<PushResult[]> {
  try {
    const response = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages.map(msg => ({
        to: msg.to,
        title: msg.title,
        body: msg.body,
        data: msg.data,
        sound: msg.sound ?? 'default',
        badge: msg.badge,
        channelId: msg.channelId ?? 'default',
        priority: msg.priority ?? 'high',
        categoryId: msg.categoryId,
      }))),
    })
    
    if (!response.ok) {
      console.error('[PUSH] Expo API error:', response.status, response.statusText)
      return messages.map(msg => ({
        success: false,
        token: msg.to,
        error: `HTTP ${response.status}`,
        errorType: 'Unknown' as const,
      }))
    }
    
    const data: ExpoResponse = await response.json()
    
    return messages.map((msg, index) => {
      const ticket = data.data[index]
      
      if (ticket.status === 'ok') {
        return {
          success: true,
          token: msg.to,
          ticketId: ticket.id,
        }
      }
      
      const errorType = mapExpoError(ticket.details?.error)
      
      return {
        success: false,
        token: msg.to,
        error: ticket.message ?? 'Unknown error',
        errorType,
      }
    })
  } catch (error) {
    console.error('[PUSH] Failed to send batch:', error)
    return messages.map(msg => ({
      success: false,
      token: msg.to,
      error: error instanceof Error ? error.message : 'Network error',
      errorType: 'Unknown' as const,
    }))
  }
}

/**
 * Map Expo error codes to our error types
 */
function mapExpoError(expoError?: string): PushResult['errorType'] {
  switch (expoError) {
    case 'DeviceNotRegistered':
      return 'DeviceNotRegistered'
    case 'MessageTooBig':
      return 'MessageTooBig'
    case 'MessageRateExceeded':
      return 'MessageRateExceeded'
    case 'InvalidCredentials':
      return 'InvalidCredentials'
    default:
      return 'Unknown'
  }
}

/**
 * Handle failed push tokens (disable after too many failures)
 */
async function handleFailedTokens(results: PushResult[]): Promise<void> {
  const database = requireDb()
  
  const failedResults = results.filter(r => !r.success)
  
  for (const result of failedResults) {
    // Device not registered - immediately disable token
    if (result.errorType === 'DeviceNotRegistered') {
      await database
        .update(deviceTokens)
        .set({
          isActive: false,
          lastFailure: new Date(),
          lastFailureReason: result.error,
          updatedAt: new Date(),
        })
        .where(eq(deviceTokens.pushToken, result.token))
      
      continue
    }
    
    // Other errors - increment failure count
    await database
      .update(deviceTokens)
      .set({
        failedAttempts: sql`CAST(COALESCE(${deviceTokens.failedAttempts}, '0') AS INTEGER) + 1`,
        lastFailure: new Date(),
        lastFailureReason: result.error,
        updatedAt: new Date(),
      })
      .where(eq(deviceTokens.pushToken, result.token))
    
    // Check if we should disable the token
    const [token] = await database
      .select({ failedAttempts: deviceTokens.failedAttempts })
      .from(deviceTokens)
      .where(eq(deviceTokens.pushToken, result.token))
      .limit(1)
    
    if (token && parseInt(token.failedAttempts ?? '0') >= MAX_FAILURES_BEFORE_DISABLE) {
      await database
        .update(deviceTokens)
        .set({ isActive: false, updatedAt: new Date() })
        .where(eq(deviceTokens.pushToken, result.token))
    }
  }
}

/**
 * Send push notification to all devices for a user
 */
export async function sendPushToUser(
  userId: string,
  notification: {
    title: string
    body: string
    data?: Record<string, unknown>
    badge?: number
    categoryId?: string
  }
): Promise<{ sent: number; failed: number }> {
  const tokens = await getUserPushTokens(userId)
  
  if (tokens.length === 0) {
    return { sent: 0, failed: 0 }
  }
  
  const messages: PushMessage[] = tokens.map(token => ({
    to: token.pushToken,
    title: notification.title,
    body: notification.body,
    data: notification.data,
    badge: notification.badge,
    categoryId: notification.categoryId,
    priority: 'high',
  }))
  
  const results = await sendPushNotifications(messages)
  
  const sent = results.filter(r => r.success).length
  const failed = results.filter(r => !r.success).length
  
  return { sent, failed }
}
