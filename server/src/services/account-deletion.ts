/**
 * Account Deletion Service
 * 
 * GDPR/CCPA compliant account deletion with 30-day grace period.
 */

import { eq, lt, or } from 'drizzle-orm'
import { dbClient as db } from '../db'
import {
  users,
  sessions,
  accounts,
  questLogs,
  xpEvents,
  dailyLogs,
  userTitles,
  healthSnapshots,
  dungeonAttempts,
  guildMembers,
  accountabilityPairs,
  baselineAssessments,
  bodyCompositionLogs,
  weeklyBodySummaries,
  psychologyProfiles,
  adaptedTargets,
} from '../db/schema'

function requireDb() {
  if (!db) {
    throw new Error('Database connection required for account deletion service')
  }
  return db
}

const GRACE_PERIOD_DAYS = 30

export interface DeletionStatus {
  deletionRequested: boolean
  requestedAt: Date | null
  daysRemaining: number | null
  scheduledDeletion: Date | null
  canCancel: boolean
}

/**
 * Request account deletion (starts 30-day grace period)
 */
export async function requestAccountDeletion(userId: string): Promise<DeletionStatus> {
  const now = new Date()
  
  await requireDb()
    .update(users)
    .set({
      deletionRequestedAt: now,
      updatedAt: now,
    })
    .where(eq(users.id, userId))

  const scheduledDeletion = new Date(now)
  scheduledDeletion.setDate(scheduledDeletion.getDate() + GRACE_PERIOD_DAYS)

  return {
    deletionRequested: true,
    requestedAt: now,
    daysRemaining: GRACE_PERIOD_DAYS,
    scheduledDeletion,
    canCancel: true,
  }
}

/**
 * Cancel a pending account deletion
 */
export async function cancelAccountDeletion(userId: string): Promise<{ success: boolean; message: string }> {
  const [user] = await requireDb()
    .select({
      deletionRequestedAt: users.deletionRequestedAt,
      deletionConfirmedAt: users.deletionConfirmedAt,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!user) {
    throw new Error('User not found')
  }

  if (!user.deletionRequestedAt) {
    return { success: false, message: 'No deletion request pending' }
  }

  if (user.deletionConfirmedAt) {
    return { success: false, message: 'Deletion already confirmed and cannot be cancelled' }
  }

  // Check if still within grace period
  const gracePeriodEnd = new Date(user.deletionRequestedAt)
  gracePeriodEnd.setDate(gracePeriodEnd.getDate() + GRACE_PERIOD_DAYS)

  if (new Date() > gracePeriodEnd) {
    return { success: false, message: 'Grace period has expired' }
  }

  // Cancel the deletion
  await requireDb()
    .update(users)
    .set({
      deletionRequestedAt: null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))

  return { success: true, message: 'Account deletion cancelled' }
}

/**
 * Get current deletion status for a user
 */
export async function getDeletionStatus(userId: string): Promise<DeletionStatus> {
  const [user] = await requireDb()
    .select({
      deletionRequestedAt: users.deletionRequestedAt,
      deletionConfirmedAt: users.deletionConfirmedAt,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!user || !user.deletionRequestedAt) {
    return {
      deletionRequested: false,
      requestedAt: null,
      daysRemaining: null,
      scheduledDeletion: null,
      canCancel: false,
    }
  }

  const now = new Date()
  const scheduledDeletion = new Date(user.deletionRequestedAt)
  scheduledDeletion.setDate(scheduledDeletion.getDate() + GRACE_PERIOD_DAYS)

  const daysRemaining = Math.max(0, Math.ceil(
    (scheduledDeletion.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  ))

  return {
    deletionRequested: true,
    requestedAt: user.deletionRequestedAt,
    daysRemaining,
    scheduledDeletion,
    canCancel: !user.deletionConfirmedAt && daysRemaining > 0,
  }
}

/**
 * Permanently delete a user and all their data
 * Should only be called after grace period expires
 */
export async function permanentlyDeleteUser(userId: string): Promise<{ success: boolean; deletedTables: string[] }> {
  const db = requireDb()
  const deletedTables: string[] = []

  // Delete in order to respect foreign key constraints
  // Start with tables that reference others, then work up

  // 1. Delete body composition data
  await db.delete(weeklyBodySummaries).where(eq(weeklyBodySummaries.userId, userId))
  await db.delete(bodyCompositionLogs).where(eq(bodyCompositionLogs.userId, userId))
  deletedTables.push('bodyComposition')

  // 2. Delete adapted targets
  await db.delete(adaptedTargets).where(eq(adaptedTargets.userId, userId))
  deletedTables.push('adaptedTargets')

  // 3. Delete psychology profiles
  await db.delete(psychologyProfiles).where(eq(psychologyProfiles.userId, userId))
  deletedTables.push('psychologyProfiles')

  // 4. Delete social data
  await db.delete(accountabilityPairs).where(or(eq(accountabilityPairs.requesterId, userId), eq(accountabilityPairs.partnerId, userId)))
  await db.delete(guildMembers).where(eq(guildMembers.userId, userId))
  deletedTables.push('socialData')

  // 5. Delete game progress
  await db.delete(dungeonAttempts).where(eq(dungeonAttempts.userId, userId))
  await db.delete(userTitles).where(eq(userTitles.userId, userId))
  deletedTables.push('gameProgress')

  // 8. Delete activity data
  await db.delete(healthSnapshots).where(eq(healthSnapshots.userId, userId))
  await db.delete(dailyLogs).where(eq(dailyLogs.userId, userId))
  await db.delete(xpEvents).where(eq(xpEvents.userId, userId))
  await db.delete(questLogs).where(eq(questLogs.userId, userId))
  deletedTables.push('activityData')

  // 9. Delete baseline
  await db.delete(baselineAssessments).where(eq(baselineAssessments.userId, userId))
  deletedTables.push('baselineAssessments')

  // 10. Delete auth data
  await db.delete(sessions).where(eq(sessions.userId, userId))
  await db.delete(accounts).where(eq(accounts.userId, userId))
  deletedTables.push('authData')

  // 11. Finally delete the user
  await db.delete(users).where(eq(users.id, userId))
  deletedTables.push('users')

  return { success: true, deletedTables }
}

/**
 * Process accounts scheduled for deletion (run as cron job)
 */
export async function processScheduledDeletions(): Promise<{
  processed: number
  deleted: string[]
  errors: Array<{ userId: string; error: string }>
}> {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - GRACE_PERIOD_DAYS)

  // Find users whose deletion request has passed the grace period
  const pendingDeletions = await requireDb()
    .select({ id: users.id, email: users.email })
    .from(users)
    .where(lt(users.deletionRequestedAt, cutoffDate))

  const deleted: string[] = []
  const errors: Array<{ userId: string; error: string }> = []

  for (const user of pendingDeletions) {
    try {
      await permanentlyDeleteUser(user.id)
      deleted.push(user.id)
    } catch (error) {
      errors.push({
        userId: user.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  return {
    processed: pendingDeletions.length,
    deleted,
    errors,
  }
}
