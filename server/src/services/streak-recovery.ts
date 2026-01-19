/**
 * Streak Recovery Service
 * 
 * Handles grace period system for streak recovery.
 */

import { dbClient as db } from '../db'

function requireDb() {
  if (!db) {
    throw new Error('Database connection required for streak recovery service')
  }
  return db
}

/**
 * Constants
 */
export const GRACE_TOKEN_EARN_DAYS = 7 // Earn a token every 7 consecutive days
export const GRACE_PERIOD_HOURS = 24 // Hours to use token after streak break
export const MAX_GRACE_TOKENS = 3 // Maximum tokens that can be stored

/**
 * Grace token status
 */
export interface GraceTokenStatus {
  tokens: number
  maxTokens: number
  nextTokenIn: number // Days until next token
  canRecover: boolean
  recoveryExpiresAt: string | null
}

/**
 * Streak recovery result
 */
export interface RecoveryResult {
  success: boolean
  tokensRemaining: number
  streakRestored: number
  message: string
}

/**
 * Get player's grace token status
 */
export async function getGraceTokenStatus(playerId: string): Promise<GraceTokenStatus> {
  requireDb()
  
  // Would query from database
  // For now, return stub data
  return {
    tokens: 0,
    maxTokens: MAX_GRACE_TOKENS,
    nextTokenIn: 7,
    canRecover: false,
    recoveryExpiresAt: null,
  }
}

/**
 * Check if player can earn a new grace token
 */
export async function checkTokenEarning(
  playerId: string,
  currentStreak: number
): Promise<{ earned: boolean; newTotal: number }> {
  const status = await getGraceTokenStatus(playerId)
  
  // Can only earn if below max
  if (status.tokens >= MAX_GRACE_TOKENS) {
    return { earned: false, newTotal: status.tokens }
  }
  
  // Earn a token every 7 consecutive days
  if (currentStreak > 0 && currentStreak % GRACE_TOKEN_EARN_DAYS === 0) {
    const newTotal = Math.min(status.tokens + 1, MAX_GRACE_TOKENS)
    
    // Would update database
    requireDb()
    
    return { earned: true, newTotal }
  }
  
  return { earned: false, newTotal: status.tokens }
}

/**
 * Handle streak break - set up potential recovery
 */
export async function handleStreakBreak(
  playerId: string,
  brokenStreak: number
): Promise<{
  canRecover: boolean
  expiresAt: string | null
  tokensAvailable: number
}> {
  const status = await getGraceTokenStatus(playerId)
  
  if (status.tokens <= 0) {
    return {
      canRecover: false,
      expiresAt: null,
      tokensAvailable: 0,
    }
  }
  
  // Set recovery window
  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + GRACE_PERIOD_HOURS)
  
  // Would store in database
  requireDb()
  
  return {
    canRecover: true,
    expiresAt: expiresAt.toISOString(),
    tokensAvailable: status.tokens,
  }
}

/**
 * Use a grace token to recover streak
 */
export async function recoverStreak(playerId: string): Promise<RecoveryResult> {
  const status = await getGraceTokenStatus(playerId)
  
  // Check if recovery is available
  if (!status.canRecover) {
    return {
      success: false,
      tokensRemaining: status.tokens,
      streakRestored: 0,
      message: 'No recovery available. Complete quests to earn grace tokens.',
    }
  }
  
  // Check if within time window
  if (status.recoveryExpiresAt) {
    const expires = new Date(status.recoveryExpiresAt)
    if (new Date() > expires) {
      return {
        success: false,
        tokensRemaining: status.tokens,
        streakRestored: 0,
        message: 'Recovery window expired. The grace period has passed.',
      }
    }
  }
  
  // Check if has tokens
  if (status.tokens <= 0) {
    return {
      success: false,
      tokensRemaining: 0,
      streakRestored: 0,
      message: 'No grace tokens available.',
    }
  }
  
  // Use token and restore streak
  // Would update database
  requireDb()
  
  const tokensRemaining = status.tokens - 1
  
  return {
    success: true,
    tokensRemaining,
    streakRestored: 1, // Would be actual streak value from database
    message: 'Streak recovered! Continue your journey.',
  }
}

/**
 * Check if recovery is still available
 */
export async function isRecoveryAvailable(playerId: string): Promise<boolean> {
  const status = await getGraceTokenStatus(playerId)
  
  if (!status.canRecover || status.tokens <= 0) {
    return false
  }
  
  if (status.recoveryExpiresAt) {
    const expires = new Date(status.recoveryExpiresAt)
    return new Date() <= expires
  }
  
  return false
}

/**
 * Get time remaining for recovery
 */
export async function getRecoveryTimeRemaining(
  playerId: string
): Promise<{ hours: number; minutes: number } | null> {
  const status = await getGraceTokenStatus(playerId)
  
  if (!status.canRecover || !status.recoveryExpiresAt) {
    return null
  }
  
  const expires = new Date(status.recoveryExpiresAt)
  const now = new Date()
  
  if (now > expires) {
    return null
  }
  
  const diffMs = expires.getTime() - now.getTime()
  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  
  return { hours, minutes }
}

/**
 * Get streak recovery history
 */
export async function getRecoveryHistory(
  playerId: string
): Promise<Array<{
  date: string
  streakRecovered: number
  tokensUsed: number
}>> {
  requireDb()
  
  // Would query from database
  return []
}
