/**
 * Archive Service
 *
 * Handles player progress archiving and fresh starts.
 * Players returning after extended absences (90+ days) can optionally
 * archive their progress and start fresh.
 */

import { dbClient as db } from '../db'
import { users, playerArchives, dailyLogs } from '../db/schema'
import { eq, desc, count } from 'drizzle-orm'

function requireDb() {
  if (!db) {
    throw new Error('Database connection required for archive service')
  }
  return db
}

const EXTENDED_ABSENCE_DAYS = 90

export interface ArchiveChoice {
  shouldOffer: boolean
  daysSinceActivity: number
  currentLevel: number
  currentStreak: number
  longestStreak: number
  totalXp: number
}

export interface Archive {
  id: string
  archivedAt: string
  levelAtArchive: number
  totalXpAtArchive: number
  longestStreak: number
  currentStreak: number
  activeDays: number
  dungeonsCleared: number
  totalQuestsCompleted: number
  titlesEarned: string[]
  bossesDefeated: string[]
  seasonNumber: number | null
}

/**
 * Check if user should be offered archive option
 */
export async function checkArchiveOffer(userId: string): Promise<ArchiveChoice> {
  const [user] = await requireDb()
    .select({
      level: users.level,
      totalXP: users.totalXP,
      currentStreak: users.currentStreak,
      longestStreak: users.longestStreak,
      lastActivityAt: users.lastActivityAt,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!user) {
    return {
      shouldOffer: false,
      daysSinceActivity: 0,
      currentLevel: 1,
      currentStreak: 0,
      longestStreak: 0,
      totalXp: 0,
    }
  }

  const lastActivity = user.lastActivityAt ?? new Date()
  const daysSinceActivity = Math.floor(
    (Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
  )

  return {
    shouldOffer: daysSinceActivity >= EXTENDED_ABSENCE_DAYS,
    daysSinceActivity,
    currentLevel: user.level ?? 1,
    currentStreak: user.currentStreak ?? 0,
    longestStreak: user.longestStreak ?? 0,
    totalXp: user.totalXP ?? 0,
  }
}

/**
 * Create an archive of current progress
 */
export async function createArchive(userId: string): Promise<Archive> {
  const [user] = await requireDb()
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!user) {
    throw new Error('User not found')
  }

  // Count active days
  const [activeDaysResult] = await requireDb()
    .select({ count: count() })
    .from(dailyLogs)
    .where(eq(dailyLogs.userId, userId))

  const activeDays = activeDaysResult?.count ?? 0

  // Get titles earned (from user's earned titles if tracked)
  const titlesEarned: string[] = []

  // Get bosses defeated (placeholder - would query boss encounters)
  const bossesDefeated: string[] = []

  // Create the archive record
  const [archive] = await requireDb()
    .insert(playerArchives)
    .values({
      userId,
      levelAtArchive: user.level ?? 1,
      totalXpAtArchive: user.totalXP ?? 0,
      longestStreak: user.longestStreak ?? 0,
      currentStreak: user.currentStreak ?? 0,
      titlesEarned,
      bossesDefeated,
      dungeonsCleared: 0,
      activeDays,
      totalQuestsCompleted: 0,
      seasonNumber: null,
      archiveReason: 'soft_reset',
    })
    .returning()

  return {
    id: archive!.id,
    archivedAt: archive!.archivedAt.toISOString(),
    levelAtArchive: archive!.levelAtArchive,
    totalXpAtArchive: archive!.totalXpAtArchive,
    longestStreak: archive!.longestStreak,
    currentStreak: archive!.currentStreak,
    activeDays: archive!.activeDays,
    dungeonsCleared: archive!.dungeonsCleared,
    totalQuestsCompleted: archive!.totalQuestsCompleted,
    titlesEarned: (archive!.titlesEarned as string[]) ?? [],
    bossesDefeated: (archive!.bossesDefeated as string[]) ?? [],
    seasonNumber: archive!.seasonNumber,
  }
}

/**
 * Perform a soft reset - archive current progress and reset to Level 1
 */
export async function performSoftReset(userId: string): Promise<Archive> {
  // First create the archive
  const archive = await createArchive(userId)

  // Then reset user progress
  await requireDb()
    .update(users)
    .set({
      level: 1,
      totalXP: 0,
      currentStreak: 0,
      // Keep longest streak as historical record
      lastActivityAt: new Date(),
      debuffActiveUntil: null,
      returnProtocolActive: false,
      returnProtocolDay: undefined,
      returnProtocolStartedAt: null,
    })
    .where(eq(users.id, userId))

  return archive
}

/**
 * Get all archives for a user
 */
export async function getUserArchives(userId: string): Promise<Archive[]> {
  const archives = await requireDb()
    .select()
    .from(playerArchives)
    .where(eq(playerArchives.userId, userId))
    .orderBy(desc(playerArchives.archivedAt))

  return archives.map((a) => ({
    id: a.id,
    archivedAt: a.archivedAt.toISOString(),
    levelAtArchive: a.levelAtArchive,
    totalXpAtArchive: a.totalXpAtArchive,
    longestStreak: a.longestStreak,
    currentStreak: a.currentStreak,
    activeDays: a.activeDays,
    dungeonsCleared: a.dungeonsCleared,
    totalQuestsCompleted: a.totalQuestsCompleted,
    titlesEarned: (a.titlesEarned as string[]) ?? [],
    bossesDefeated: (a.bossesDefeated as string[]) ?? [],
    seasonNumber: a.seasonNumber,
  }))
}

/**
 * Get archive count for user
 */
export async function getArchiveCount(userId: string): Promise<number> {
  const [result] = await requireDb()
    .select({ count: count() })
    .from(playerArchives)
    .where(eq(playerArchives.userId, userId))

  return result?.count ?? 0
}

/**
 * Get archive narratives
 */
export function getArchiveNarratives(): {
  offer: string
  confirm: string
  complete: string
  decline: string
} {
  return {
    offer: `[SYSTEM DETECTION]\n\nExtended absence detected.\n\nTwo paths are available:\n\n1. CONTINUE: Resume from your current state.\n   Your progress remains. Your level stands.\n\n2. ARCHIVE: Store this run. Begin anew.\n   Your history is preserved but sealed.\n   You return to Level 1. A clean slate.\n\nSome players prefer the weight of their past.\nOthers prefer the clarity of a fresh start.\n\nNeither choice is wrong.`,

    confirm: `[ARCHIVE CONFIRMATION]\n\nThis action will:\n- Store your current progress permanently\n- Reset your level to 1\n- Clear your current XP\n- Reset your streak\n\nYour archived run will be viewable in your profile.\n\nThis cannot be undone.`,

    complete: `[ARCHIVE COMPLETE]\n\nYour previous run has been sealed.\n\nLevel 1. Day 1.\n\nThe slate is clean.\nWhat you build now is undetermined.`,

    decline: `[CONTINUE]\n\nYour progress remains intact.\n\nWelcome back.`,
  }
}
