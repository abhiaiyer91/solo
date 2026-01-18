import { dbClient as db } from '../db'
import {
  dungeons,
  dungeonAttempts,
  users,
  type Dungeon,
  type DungeonAttempt,
  type DungeonProgress,
  type DungeonDifficulty,
  type DungeonAttemptStatus,
} from '../db/schema'
import { eq, and, desc, lte, or } from 'drizzle-orm'
import { createXPEvent } from './xp'

function requireDb() {
  if (!db) {
    throw new Error('Database connection required for dungeon service')
  }
  return db
}

// Level requirements by difficulty rank
const DIFFICULTY_LEVEL_REQUIREMENTS: Record<DungeonDifficulty, number> = {
  E_RANK: 3,
  D_RANK: 6,
  C_RANK: 10,
  B_RANK: 15,
  A_RANK: 20,
  S_RANK: 25,
}

// Helper to get current time
function now(): Date {
  return new Date()
}

// Helper to add minutes to a date
function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60 * 1000)
}

// Helper to add hours to a date
function addHours(date: Date, hours: number): Date {
  return new Date(date.getTime() + hours * 60 * 60 * 1000)
}

/**
 * Get all dungeons
 */
export async function getAllDungeons(): Promise<Dungeon[]> {
  return requireDb().select().from(dungeons).orderBy(dungeons.name)
}

/**
 * Get dungeons available to a user based on their level
 */
export async function getAvailableDungeons(userId: string): Promise<Dungeon[]> {
  const [user] = await requireDb()
    .select({ level: users.level })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!user) {
    throw new Error('User not found')
  }

  const userLevel = user.level ?? 1
  const allDungeons = await getAllDungeons()

  // Filter dungeons by level requirement
  return allDungeons.filter((dungeon) => {
    const requirement = dungeon.requirements as { levelRequired?: number }
    const levelRequired = requirement?.levelRequired ?? DIFFICULTY_LEVEL_REQUIREMENTS[dungeon.difficulty]
    return userLevel >= levelRequired
  })
}

/**
 * Get dungeon by ID
 */
export async function getDungeonById(dungeonId: string): Promise<Dungeon | null> {
  const [dungeon] = await requireDb()
    .select()
    .from(dungeons)
    .where(eq(dungeons.id, dungeonId))
    .limit(1)

  return dungeon || null
}

/**
 * Get user's current active dungeon attempt (IN_PROGRESS status)
 */
export async function getCurrentDungeonAttempt(userId: string): Promise<DungeonAttempt | null> {
  const [attempt] = await requireDb()
    .select()
    .from(dungeonAttempts)
    .where(
      and(
        eq(dungeonAttempts.userId, userId),
        eq(dungeonAttempts.status, 'IN_PROGRESS')
      )
    )
    .limit(1)

  return attempt || null
}

/**
 * Get user's dungeon attempt history
 */
export async function getDungeonAttemptHistory(
  userId: string,
  limit = 20
): Promise<DungeonAttempt[]> {
  return requireDb()
    .select()
    .from(dungeonAttempts)
    .where(eq(dungeonAttempts.userId, userId))
    .orderBy(desc(dungeonAttempts.startedAt))
    .limit(limit)
}

/**
 * Check if user is on cooldown for a specific dungeon
 */
export async function isOnCooldown(
  userId: string,
  dungeonId: string
): Promise<{ onCooldown: boolean; cooldownEndsAt: Date | null }> {
  // Get the dungeon to know the cooldown period
  const dungeon = await getDungeonById(dungeonId)
  if (!dungeon) {
    throw new Error('Dungeon not found')
  }

  // Find the most recent completed/failed attempt for this dungeon
  const [lastAttempt] = await requireDb()
    .select()
    .from(dungeonAttempts)
    .where(
      and(
        eq(dungeonAttempts.userId, userId),
        eq(dungeonAttempts.dungeonId, dungeonId),
        or(
          eq(dungeonAttempts.status, 'CLEARED'),
          eq(dungeonAttempts.status, 'FAILED'),
          eq(dungeonAttempts.status, 'TIMED_OUT')
        )
      )
    )
    .orderBy(desc(dungeonAttempts.completedAt))
    .limit(1)

  if (!lastAttempt || !lastAttempt.completedAt) {
    return { onCooldown: false, cooldownEndsAt: null }
  }

  const cooldownEndsAt = addHours(lastAttempt.completedAt, dungeon.cooldownHours ?? 24)
  const onCooldown = now() < cooldownEndsAt

  return {
    onCooldown,
    cooldownEndsAt: onCooldown ? cooldownEndsAt : null,
  }
}

/**
 * Check if user has debuff active
 */
async function hasDebuffActive(userId: string): Promise<Date | null> {
  const [user] = await requireDb()
    .select({ debuffActiveUntil: users.debuffActiveUntil })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!user?.debuffActiveUntil) {
    return null
  }

  if (user.debuffActiveUntil > now()) {
    return user.debuffActiveUntil
  }

  return null
}

/**
 * Enter a dungeon (start an attempt)
 */
export async function enterDungeon(
  userId: string,
  dungeonId: string
): Promise<{
  attempt: DungeonAttempt
  dungeon: Dungeon
  message: string
  debuffWarning?: string
}> {
  // Check for existing active attempt
  const currentAttempt = await getCurrentDungeonAttempt(userId)
  if (currentAttempt) {
    const currentDungeon = await getDungeonById(currentAttempt.dungeonId)
    throw new Error(
      `Already in dungeon: ${currentDungeon?.name || 'Unknown'}. Complete or wait for timeout.`
    )
  }

  // Get the dungeon
  const dungeon = await getDungeonById(dungeonId)
  if (!dungeon) {
    throw new Error('Dungeon not found')
  }

  // Check level requirement
  const [user] = await requireDb()
    .select({ level: users.level, debuffActiveUntil: users.debuffActiveUntil })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!user) {
    throw new Error('User not found')
  }

  const requirement = dungeon.requirements as { levelRequired?: number }
  const levelRequired = requirement?.levelRequired ?? DIFFICULTY_LEVEL_REQUIREMENTS[dungeon.difficulty]

  if ((user.level ?? 1) < levelRequired) {
    throw new Error(
      `Level ${levelRequired} required to enter ${dungeon.name}. Current level: ${user.level ?? 1}`
    )
  }

  // Check cooldown
  const cooldownCheck = await isOnCooldown(userId, dungeonId)
  if (cooldownCheck.onCooldown) {
    throw new Error(
      `Dungeon on cooldown. Available at: ${cooldownCheck.cooldownEndsAt?.toISOString()}`
    )
  }

  // Check for debuff
  const debuffActiveAt = await hasDebuffActive(userId)

  // Create the attempt
  const startedAt = now()
  const expiresAt = addMinutes(startedAt, dungeon.durationMinutes)

  const initialProgress: DungeonProgress = {
    challengesCompleted: 0,
    challengeStatus: {},
    lastUpdated: startedAt.toISOString(),
  }

  const [attempt] = await requireDb()
    .insert(dungeonAttempts)
    .values({
      userId,
      dungeonId,
      status: 'IN_PROGRESS',
      progress: initialProgress,
      startedAt,
      expiresAt,
      debuffActiveAtEntry: debuffActiveAt,
    })
    .returning()

  const message = `
DUNGEON ENTRY: ${dungeon.name}

Rank: ${dungeon.difficulty.replace('_', '-')}
Time Limit: ${formatDuration(dungeon.durationMinutes)}
XP Multiplier: ${dungeon.xpMultiplier}x

Challenge: ${dungeon.description}

Entry is optional.
The clock begins now.
`.trim()

  const result: {
    attempt: DungeonAttempt
    dungeon: Dungeon
    message: string
    debuffWarning?: string
  } = {
    attempt: attempt!,
    dungeon,
    message,
  }

  if (debuffActiveAt) {
    result.debuffWarning =
      '[DEBUFF ACTIVE] XP multiplier disabled. Standard rewards only.'
  }

  return result
}

/**
 * Update dungeon progress
 */
export async function updateDungeonProgress(
  userId: string,
  dungeonId: string,
  challengeIndex: number,
  completed: boolean
): Promise<{
  attempt: DungeonAttempt
  challengeCompleted: boolean
  allChallengesComplete: boolean
  message: string
}> {
  // Get current attempt
  const [attempt] = await requireDb()
    .select()
    .from(dungeonAttempts)
    .where(
      and(
        eq(dungeonAttempts.userId, userId),
        eq(dungeonAttempts.dungeonId, dungeonId),
        eq(dungeonAttempts.status, 'IN_PROGRESS')
      )
    )
    .limit(1)

  if (!attempt) {
    throw new Error('No active dungeon attempt found')
  }

  // Check if expired
  if (now() > attempt.expiresAt) {
    // Mark as timed out
    const [timedOutAttempt] = await requireDb()
      .update(dungeonAttempts)
      .set({
        status: 'TIMED_OUT',
        completedAt: now(),
        updatedAt: now(),
      })
      .where(eq(dungeonAttempts.id, attempt.id))
      .returning()

    return {
      attempt: timedOutAttempt!,
      challengeCompleted: false,
      allChallengesComplete: false,
      message: `
DUNGEON FAILED

Time expired.
Requirements not met.

No XP awarded.
No judgment offered.

The dungeon remains.
`.trim(),
    }
  }

  // Get the dungeon to check challenge count
  const dungeon = await getDungeonById(dungeonId)
  if (!dungeon) {
    throw new Error('Dungeon not found')
  }

  const challenges = dungeon.challenges as Array<{ type: string; description: string }>
  const totalChallenges = challenges.length

  // Update progress
  const currentProgress = attempt.progress as DungeonProgress
  currentProgress.challengeStatus[challengeIndex] = completed
  currentProgress.challengesCompleted = Object.values(
    currentProgress.challengeStatus
  ).filter(Boolean).length
  currentProgress.lastUpdated = now().toISOString()

  // Check if all challenges are complete
  const allChallengesComplete = currentProgress.challengesCompleted >= totalChallenges

  // Update the attempt
  const [updatedAttempt] = await requireDb()
    .update(dungeonAttempts)
    .set({
      progress: currentProgress,
      updatedAt: now(),
    })
    .where(eq(dungeonAttempts.id, attempt.id))
    .returning()

  const message = completed
    ? `Challenge ${challengeIndex + 1}/${totalChallenges} complete. ${currentProgress.challengesCompleted}/${totalChallenges} challenges cleared.`
    : `Challenge ${challengeIndex + 1}/${totalChallenges} failed.`

  return {
    attempt: updatedAttempt!,
    challengeCompleted: completed,
    allChallengesComplete,
    message,
  }
}

/**
 * Complete a dungeon (success)
 */
export async function completeDungeon(
  userId: string,
  dungeonId: string
): Promise<{
  attempt: DungeonAttempt
  xpAwarded: number
  multiplierApplied: boolean
  message: string
}> {
  // Get current attempt
  const [attempt] = await requireDb()
    .select()
    .from(dungeonAttempts)
    .where(
      and(
        eq(dungeonAttempts.userId, userId),
        eq(dungeonAttempts.dungeonId, dungeonId),
        eq(dungeonAttempts.status, 'IN_PROGRESS')
      )
    )
    .limit(1)

  if (!attempt) {
    throw new Error('No active dungeon attempt found')
  }

  // Check if expired
  if (now() > attempt.expiresAt) {
    throw new Error('Dungeon attempt has expired')
  }

  // Get the dungeon
  const dungeon = await getDungeonById(dungeonId)
  if (!dungeon) {
    throw new Error('Dungeon not found')
  }

  // Check if all challenges are complete
  const progress = attempt.progress as DungeonProgress
  const challenges = dungeon.challenges as Array<{ type: string; description: string }>

  if (progress.challengesCompleted < challenges.length) {
    throw new Error(
      `Not all challenges complete. ${progress.challengesCompleted}/${challenges.length} done.`
    )
  }

  // Calculate XP reward
  const baseXP = dungeon.baseXpReward ?? 50

  // Apply multiplier only if debuff was NOT active at entry
  const multiplierApplied = !attempt.debuffActiveAtEntry
  const finalMultiplier = multiplierApplied ? dungeon.xpMultiplier : 1.0
  const xpAwarded = Math.floor(baseXP * finalMultiplier)

  // Update attempt status
  const [completedAttempt] = await requireDb()
    .update(dungeonAttempts)
    .set({
      status: 'CLEARED',
      completedAt: now(),
      xpAwarded,
      updatedAt: now(),
    })
    .where(eq(dungeonAttempts.id, attempt.id))
    .returning()

  // Award XP
  await createXPEvent({
    userId,
    source: 'DUNGEON_CLEAR',
    sourceId: dungeonId,
    baseAmount: baseXP,
    description: `Cleared ${dungeon.name}`,
    modifiers: multiplierApplied
      ? [
          {
            type: 'DUNGEON_MULTIPLIER',
            multiplier: dungeon.xpMultiplier,
            description: `${dungeon.difficulty.replace('_', '-')} dungeon multiplier`,
          },
        ]
      : [],
  })

  const elapsed = Math.floor(
    (now().getTime() - attempt.startedAt.getTime()) / 1000
  )
  const elapsedFormatted = formatElapsed(elapsed)

  const message = `
DUNGEON CLEARED

${dungeon.name} - Complete

Time elapsed: ${elapsedFormatted}
Challenge met.

XP Awarded: ${xpAwarded}${multiplierApplied ? ` (${baseXP} x ${dungeon.xpMultiplier})` : ''}
${!multiplierApplied ? '\n[Debuff active - multiplier disabled]' : ''}

The System records your ambition.
`.trim()

  return {
    attempt: completedAttempt!,
    xpAwarded,
    multiplierApplied,
    message,
  }
}

/**
 * Fail a dungeon attempt
 */
export async function failDungeon(
  userId: string,
  dungeonId: string,
  reason: 'timeout' | 'manual' = 'manual'
): Promise<{
  attempt: DungeonAttempt
  message: string
}> {
  // Get current attempt
  const [attempt] = await requireDb()
    .select()
    .from(dungeonAttempts)
    .where(
      and(
        eq(dungeonAttempts.userId, userId),
        eq(dungeonAttempts.dungeonId, dungeonId),
        eq(dungeonAttempts.status, 'IN_PROGRESS')
      )
    )
    .limit(1)

  if (!attempt) {
    throw new Error('No active dungeon attempt found')
  }

  // Get the dungeon for the message
  const dungeon = await getDungeonById(dungeonId)

  const status: DungeonAttemptStatus = reason === 'timeout' ? 'TIMED_OUT' : 'FAILED'

  // Update attempt status
  const [failedAttempt] = await requireDb()
    .update(dungeonAttempts)
    .set({
      status,
      completedAt: now(),
      xpAwarded: 0,
      updatedAt: now(),
    })
    .where(eq(dungeonAttempts.id, attempt.id))
    .returning()

  const message = `
DUNGEON FAILED

${dungeon?.name || 'Unknown'} - Incomplete

${reason === 'timeout' ? 'Time expired.' : 'Attempt abandoned.'}
Requirements not met.

No XP awarded.
No judgment offered.

The dungeon remains.
`.trim()

  return {
    attempt: failedAttempt!,
    message,
  }
}

/**
 * Check and expire timed out dungeons for a user
 */
export async function checkExpiredDungeons(userId: string): Promise<DungeonAttempt[]> {
  const expired = await requireDb()
    .select()
    .from(dungeonAttempts)
    .where(
      and(
        eq(dungeonAttempts.userId, userId),
        eq(dungeonAttempts.status, 'IN_PROGRESS'),
        lte(dungeonAttempts.expiresAt, now())
      )
    )

  const timedOut: DungeonAttempt[] = []

  for (const attempt of expired) {
    const [updated] = await requireDb()
      .update(dungeonAttempts)
      .set({
        status: 'TIMED_OUT',
        completedAt: now(),
        xpAwarded: 0,
        updatedAt: now(),
      })
      .where(eq(dungeonAttempts.id, attempt.id))
      .returning()

    if (updated) {
      timedOut.push(updated)
    }
  }

  return timedOut
}

/**
 * Get dungeon statistics for a user
 */
export async function getDungeonStats(userId: string): Promise<{
  totalAttempts: number
  cleared: number
  failed: number
  timedOut: number
  totalXpEarned: number
  currentAttempt: DungeonAttempt | null
}> {
  const attempts = await requireDb()
    .select()
    .from(dungeonAttempts)
    .where(eq(dungeonAttempts.userId, userId))

  const cleared = attempts.filter((a) => a.status === 'CLEARED').length
  const failed = attempts.filter((a) => a.status === 'FAILED').length
  const timedOut = attempts.filter((a) => a.status === 'TIMED_OUT').length
  const totalXpEarned = attempts.reduce((sum, a) => sum + (a.xpAwarded ?? 0), 0)

  const currentAttempt = await getCurrentDungeonAttempt(userId)

  return {
    totalAttempts: attempts.length,
    cleared,
    failed,
    timedOut,
    totalXpEarned,
    currentAttempt,
  }
}

/**
 * Get number of dungeons cleared by user
 */
export async function getDungeonsCleared(userId: string): Promise<number> {
  const cleared = await requireDb()
    .select()
    .from(dungeonAttempts)
    .where(
      and(
        eq(dungeonAttempts.userId, userId),
        eq(dungeonAttempts.status, 'CLEARED')
      )
    )

  return cleared.length
}

// Helper functions

function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} minutes`
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  if (remainingMinutes === 0) {
    return hours === 1 ? '1 hour' : `${hours} hours`
  }
  return `${hours}h ${remainingMinutes}m`
}

function formatElapsed(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  const parts = []
  if (hours > 0) parts.push(String(hours).padStart(2, '0'))
  parts.push(String(minutes).padStart(2, '0'))
  parts.push(String(secs).padStart(2, '0'))

  return parts.join(':')
}

/**
 * Format dungeon for API response
 */
export function formatDungeonResponse(dungeon: Dungeon) {
  return {
    id: dungeon.id,
    name: dungeon.name,
    description: dungeon.description,
    difficulty: dungeon.difficulty,
    xpMultiplier: dungeon.xpMultiplier,
    durationMinutes: dungeon.durationMinutes,
    cooldownHours: dungeon.cooldownHours,
    baseXpReward: dungeon.baseXpReward,
    requirements: dungeon.requirements,
    challenges: dungeon.challenges,
    levelRequired: DIFFICULTY_LEVEL_REQUIREMENTS[dungeon.difficulty],
  }
}

/**
 * Format dungeon attempt for API response
 */
export function formatAttemptResponse(attempt: DungeonAttempt) {
  const isExpired = now() > attempt.expiresAt
  const timeRemaining = Math.max(0, attempt.expiresAt.getTime() - now().getTime())
  const timeRemainingMinutes = Math.floor(timeRemaining / 60000)

  return {
    id: attempt.id,
    dungeonId: attempt.dungeonId,
    status: attempt.status,
    progress: attempt.progress,
    startedAt: attempt.startedAt.toISOString(),
    expiresAt: attempt.expiresAt.toISOString(),
    completedAt: attempt.completedAt?.toISOString() || null,
    xpAwarded: attempt.xpAwarded,
    isExpired,
    timeRemainingMinutes,
    debuffActiveAtEntry: !!attempt.debuffActiveAtEntry,
  }
}
