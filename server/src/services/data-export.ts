/**
 * Data Export Service
 * 
 * GDPR/CCPA compliant data export functionality.
 * Exports all user data as structured JSON.
 */

import { eq, or } from 'drizzle-orm'
import { dbClient as db } from '../db'
import {
  users,
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
} from '../db/schema'

function requireDb() {
  if (!db) {
    throw new Error('Database connection required for data export service')
  }
  return db
}

export interface UserDataExport {
  exportedAt: string
  account: {
    id: string
    email: string
    name: string | null
    timezone: string
    createdAt: Date
    level: number
    totalXP: number
    currentStreak: number
    longestStreak: number
    perfectStreak: number
    stats: { STR: number; AGI: number; VIT: number; DISC: number }
    onboardingCompleted: boolean
    leaderboardOptIn: boolean
  }
  baseline: object | null
  questHistory: object[]
  xpTimeline: object[]
  dailyLogs: object[]
  titles: object[]
  healthSnapshots: object[]
  dungeonAttempts: object[]
  guildMemberships: object[]
  accountabilityPairs: object[]
  bodyComposition: {
    logs: object[]
    weeklySummaries: object[]
  }
}

/**
 * Export all user data for GDPR compliance
 */
export async function exportUserData(userId: string): Promise<UserDataExport> {
  const db = requireDb()

  // Get user account data
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!user) {
    throw new Error('User not found')
  }

  // Fetch all related data in parallel
  const [
    baselineResult,
    questLogsResult,
    xpEventsResult,
    dailyLogsResult,
    titlesResult,
    healthResult,
    dungeonResult,
    guildResult,
    partnerResult,
    bodyLogsResult,
    bodySummariesResult,
  ] = await Promise.all([
    db.select().from(baselineAssessments).where(eq(baselineAssessments.userId, userId)),
    db.select().from(questLogs).where(eq(questLogs.userId, userId)),
    db.select().from(xpEvents).where(eq(xpEvents.userId, userId)),
    db.select().from(dailyLogs).where(eq(dailyLogs.userId, userId)),
    db.select().from(userTitles).where(eq(userTitles.userId, userId)),
    db.select().from(healthSnapshots).where(eq(healthSnapshots.userId, userId)),
    db.select().from(dungeonAttempts).where(eq(dungeonAttempts.userId, userId)),
    db.select().from(guildMembers).where(eq(guildMembers.userId, userId)),
    db.select().from(accountabilityPairs).where(or(eq(accountabilityPairs.requesterId, userId), eq(accountabilityPairs.partnerId, userId))),
    db.select().from(bodyCompositionLogs).where(eq(bodyCompositionLogs.userId, userId)),
    db.select().from(weeklyBodySummaries).where(eq(weeklyBodySummaries.userId, userId)),
  ])

  return {
    exportedAt: new Date().toISOString(),
    account: {
      id: user.id,
      email: user.email,
      name: user.name,
      timezone: user.timezone,
      createdAt: user.createdAt,
      level: user.level,
      totalXP: user.totalXP,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      perfectStreak: user.perfectStreak,
      stats: {
        STR: user.str,
        AGI: user.agi,
        VIT: user.vit,
        DISC: user.disc,
      },
      onboardingCompleted: user.onboardingCompleted,
      leaderboardOptIn: user.leaderboardOptIn,
    },
    baseline: baselineResult[0] ?? null,
    questHistory: questLogsResult,
    xpTimeline: xpEventsResult,
    dailyLogs: dailyLogsResult,
    titles: titlesResult,
    healthSnapshots: healthResult,
    dungeonAttempts: dungeonResult,
    guildMemberships: guildResult,
    accountabilityPairs: partnerResult,
    bodyComposition: {
      logs: bodyLogsResult,
      weeklySummaries: bodySummariesResult,
    },
  }
}
