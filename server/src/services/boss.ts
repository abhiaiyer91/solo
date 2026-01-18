import { dbClient as db } from '../db'
import { users, dailyLogs } from '../db/schema'
import { eq, and, gte } from 'drizzle-orm'
import { createXPEvent } from './xp'
import { awardTitle } from './title'
import type { bossAttemptStatusEnum, bossDifficultyEnum } from '../db/schema/enums'

type BossAttemptStatus = (typeof bossAttemptStatusEnum.enumValues)[number]
type BossDifficulty = (typeof bossDifficultyEnum.enumValues)[number]

function requireDb() {
  if (!db) {
    throw new Error('Database connection required for boss service')
  }
  return db
}

// Boss phase requirement types
export interface BossPhaseRequirement {
  type: 'streak' | 'perfect_days' | 'dungeon_clears' | 'quest_completion_rate'
  value: number
  description: string
}

// Boss phase definition
export interface BossPhase {
  phaseNumber: number
  name: string
  durationDays: number
  requirements: BossPhaseRequirement[]
  narrativeIntro: string
  narrativeVictory: string
}

// Boss definition
export interface Boss {
  id: string
  name: string
  description: string
  systemMessage: string
  levelRequirement: number
  totalDurationDays: number
  xpReward: number
  titleRewardId: string | null
  difficulty: BossDifficulty
  phases: BossPhase[]
}

// Boss attempt tracking (stored in memory with user data)
export interface BossAttempt {
  id: string
  bossId: string
  userId: string
  status: BossAttemptStatus
  currentPhase: number
  phaseStartDate: string // YYYY-MM-DD
  attemptStartDate: string // YYYY-MM-DD
  phasesCompleted: number[]
  dailyProgress: Record<string, boolean> // date -> passed
  completedAt: string | null
  abandonedAt: string | null
}

// In-memory boss definitions (seeded from database or constants)
const BOSSES: Boss[] = [
  {
    id: 'boss-inconsistent-one',
    name: 'The Inconsistent One',
    description: 'A shadow of your former self - the version that starts strong but fades. Defeat it by maintaining a 7-day streak across 3 phases.',
    systemMessage: '[BOSS ENCOUNTER] The Inconsistent One manifests. Prove your dedication through sustained effort.',
    levelRequirement: 5,
    totalDurationDays: 21,
    xpReward: 500,
    titleRewardId: null, // Could link to a title
    difficulty: 'NORMAL',
    phases: [
      {
        phaseNumber: 1,
        name: 'Phase 1: Breaking the Pattern',
        durationDays: 7,
        requirements: [
          { type: 'streak', value: 7, description: 'Maintain a 7-day streak' }
        ],
        narrativeIntro: 'The Inconsistent One emerges from the shadows of your past failures. Phase 1 begins.',
        narrativeVictory: 'Phase 1 complete. The Inconsistent One weakens, but fights on.',
      },
      {
        phaseNumber: 2,
        name: 'Phase 2: Building Momentum',
        durationDays: 7,
        requirements: [
          { type: 'streak', value: 7, description: 'Maintain another 7-day streak' }
        ],
        narrativeIntro: 'The Inconsistent One adapts. Phase 2 demands continued vigilance.',
        narrativeVictory: 'Phase 2 complete. The pattern of inconsistency cracks.',
      },
      {
        phaseNumber: 3,
        name: 'Phase 3: Final Stand',
        durationDays: 7,
        requirements: [
          { type: 'streak', value: 7, description: 'Complete the final 7-day streak' }
        ],
        narrativeIntro: 'The Inconsistent One makes its final stand. 7 more days to victory.',
        narrativeVictory: 'VICTORY. The Inconsistent One is defeated. Consistency is now your nature.',
      },
    ],
  },
  {
    id: 'boss-excuse-maker',
    name: 'The Excuse Maker',
    description: 'The voice that justifies every failure. Silence it with 21 days of perfect execution, including specific perfect day requirements.',
    systemMessage: '[BOSS ENCOUNTER] The Excuse Maker whispers doubts. Only perfect days will silence it.',
    levelRequirement: 10,
    totalDurationDays: 21,
    xpReward: 1000,
    titleRewardId: null,
    difficulty: 'HARD',
    phases: [
      {
        phaseNumber: 1,
        name: 'Phase 1: Silencing Doubt',
        durationDays: 7,
        requirements: [
          { type: 'perfect_days', value: 5, description: 'Achieve 5 perfect days in 7 days' }
        ],
        narrativeIntro: 'The Excuse Maker begins its assault. Only perfection will silence the doubts.',
        narrativeVictory: 'Phase 1 complete. The excuses grow quieter.',
      },
      {
        phaseNumber: 2,
        name: 'Phase 2: No Compromises',
        durationDays: 7,
        requirements: [
          { type: 'perfect_days', value: 6, description: 'Achieve 6 perfect days in 7 days' }
        ],
        narrativeIntro: 'The Excuse Maker doubles down. Near-perfection is required.',
        narrativeVictory: 'Phase 2 complete. The excuses become whispers.',
      },
      {
        phaseNumber: 3,
        name: 'Phase 3: Perfect Execution',
        durationDays: 7,
        requirements: [
          { type: 'perfect_days', value: 7, description: 'Achieve 7 consecutive perfect days' }
        ],
        narrativeIntro: 'The Excuse Maker makes its final argument. Only perfect execution will end this.',
        narrativeVictory: 'VICTORY. The Excuse Maker is silenced. No more excuses.',
      },
    ],
  },
  {
    id: 'boss-comfortable-self',
    name: 'The Comfortable Self',
    description: 'The ultimate enemy - the version of you that resists change. A 42-day battle requiring sustained excellence and dungeon mastery.',
    systemMessage: '[BOSS ENCOUNTER] The Comfortable Self awakens. This is your greatest challenge.',
    levelRequirement: 20,
    totalDurationDays: 42,
    xpReward: 2500,
    titleRewardId: null,
    difficulty: 'NIGHTMARE',
    phases: [
      {
        phaseNumber: 1,
        name: 'Phase 1: Disrupting Comfort',
        durationDays: 14,
        requirements: [
          { type: 'streak', value: 14, description: 'Maintain a 14-day streak' },
          { type: 'quest_completion_rate', value: 80, description: '80% quest completion rate' }
        ],
        narrativeIntro: 'The Comfortable Self resists. Your comfort zone must be destroyed.',
        narrativeVictory: 'Phase 1 complete. The walls of comfort begin to crumble.',
      },
      {
        phaseNumber: 2,
        name: 'Phase 2: Embracing Discomfort',
        durationDays: 14,
        requirements: [
          { type: 'streak', value: 14, description: 'Maintain another 14-day streak' },
          { type: 'perfect_days', value: 10, description: 'Achieve 10 perfect days' }
        ],
        narrativeIntro: 'The Comfortable Self adapts. Push harder.',
        narrativeVictory: 'Phase 2 complete. Discomfort becomes familiar.',
      },
      {
        phaseNumber: 3,
        name: 'Phase 3: Transcendence',
        durationDays: 14,
        requirements: [
          { type: 'streak', value: 14, description: 'Complete the final 14-day streak' },
          { type: 'perfect_days', value: 12, description: 'Achieve 12 perfect days' },
          { type: 'quest_completion_rate', value: 90, description: '90% quest completion rate' }
        ],
        narrativeIntro: 'The Comfortable Self makes its final stand. Transcend your limitations.',
        narrativeVictory: 'VICTORY. The Comfortable Self is destroyed. You have transcended.',
      },
    ],
  },
]

// In-memory storage for boss attempts (would normally be a database table)
// Key: `${userId}:${bossId}:${attemptId}`
const bossAttempts = new Map<string, BossAttempt>()

// Helper to generate attempt ID
function generateAttemptId(): string {
  return `attempt-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

// Helper to get today's date in YYYY-MM-DD format
function getTodayDate(_timezone = 'UTC'): string {
  const now = new Date()
  // Simple timezone handling - in production would use proper timezone library
  return now.toISOString().split('T')[0]!
}

// Helper to calculate days between dates
function daysBetween(startDate: string, endDate: string): number {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end.getTime() - start.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Get all available bosses
 */
export async function getAllBosses(): Promise<Boss[]> {
  return BOSSES
}

/**
 * Get bosses available to a user (based on level requirement)
 */
export async function getAvailableBosses(userId: string): Promise<Boss[]> {
  const [user] = await requireDb()
    .select({ level: users.level })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!user) {
    throw new Error('User not found')
  }

  return BOSSES.filter(boss => (user.level ?? 1) >= boss.levelRequirement)
}

/**
 * Get boss by ID
 */
export async function getBossById(bossId: string): Promise<Boss | null> {
  return BOSSES.find(boss => boss.id === bossId) || null
}

/**
 * Get user's current active boss attempt
 */
export async function getCurrentBossAttempt(userId: string): Promise<BossAttempt | null> {
  for (const [, attempt] of bossAttempts) {
    if (attempt.userId === userId && attempt.status === 'IN_PROGRESS') {
      return attempt
    }
  }
  return null
}

/**
 * Get boss attempt by boss ID for a user
 */
export async function getBossAttempt(userId: string, bossId: string): Promise<BossAttempt | null> {
  for (const [, attempt] of bossAttempts) {
    if (attempt.userId === userId && attempt.bossId === bossId && attempt.status === 'IN_PROGRESS') {
      return attempt
    }
  }
  return null
}

/**
 * Get all boss attempts for a user
 */
export async function getUserBossAttempts(userId: string): Promise<BossAttempt[]> {
  const attempts: BossAttempt[] = []
  for (const [, attempt] of bossAttempts) {
    if (attempt.userId === userId) {
      attempts.push(attempt)
    }
  }
  return attempts.sort((a, b) =>
    new Date(b.attemptStartDate).getTime() - new Date(a.attemptStartDate).getTime()
  )
}

/**
 * Start a boss encounter
 */
export async function startBossEncounter(
  userId: string,
  bossId: string
): Promise<{ attempt: BossAttempt; boss: Boss; message: string }> {
  // Check if user already has an active boss encounter
  const currentAttempt = await getCurrentBossAttempt(userId)
  if (currentAttempt) {
    const currentBoss = await getBossById(currentAttempt.bossId)
    throw new Error(`Already in battle with ${currentBoss?.name || 'a boss'}. Complete or abandon that encounter first.`)
  }

  // Get the boss
  const boss = await getBossById(bossId)
  if (!boss) {
    throw new Error('Boss not found')
  }

  // Check level requirement
  const [user] = await requireDb()
    .select({ level: users.level })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!user) {
    throw new Error('User not found')
  }

  if ((user.level ?? 1) < boss.levelRequirement) {
    throw new Error(`Level ${boss.levelRequirement} required to challenge ${boss.name}. Current level: ${user.level ?? 1}`)
  }

  // Create the attempt
  const today = getTodayDate()
  const attemptId = generateAttemptId()

  const attempt: BossAttempt = {
    id: attemptId,
    bossId,
    userId,
    status: 'IN_PROGRESS',
    currentPhase: 1,
    phaseStartDate: today,
    attemptStartDate: today,
    phasesCompleted: [],
    dailyProgress: {},
    completedAt: null,
    abandonedAt: null,
  }

  const key = `${userId}:${bossId}:${attemptId}`
  bossAttempts.set(key, attempt)

  return {
    attempt,
    boss,
    message: boss.systemMessage,
  }
}

/**
 * Evaluate daily progress for a boss attempt
 * This should be called at the end of each day
 */
export async function evaluateDailyProgress(
  userId: string,
  date: string
): Promise<{ updated: boolean; phaseAdvanced: boolean; bossDefeated: boolean; message: string } | null> {
  const attempt = await getCurrentBossAttempt(userId)
  if (!attempt) {
    return null
  }

  const boss = await getBossById(attempt.bossId)
  if (!boss) {
    return null
  }

  const currentPhase = boss.phases[attempt.currentPhase - 1]
  if (!currentPhase) {
    return null
  }

  // Get user's daily log for this date
  const [dailyLog] = await requireDb()
    .select()
    .from(dailyLogs)
    .where(and(
      eq(dailyLogs.userId, userId),
      eq(dailyLogs.logDate, date)
    ))
    .limit(1)

  // Evaluate if the day counts as progress
  const coreCompleted = (dailyLog?.coreQuestsCompleted ?? 0)
  const coreTotal = (dailyLog?.coreQuestsTotal ?? 0) || 1
  const completionRate = (coreCompleted / coreTotal) * 100

  // Count the day as passing if at least 80% of core quests are done
  const dayPassed = completionRate >= 80

  // Update daily progress
  attempt.dailyProgress[date] = dayPassed

  // Track days in phase for progress evaluation
  const daysInPhase = daysBetween(attempt.phaseStartDate, date) + 1

  // Check phase requirements
  let phaseComplete = true
  for (const req of currentPhase.requirements) {
    switch (req.type) {
      case 'streak':
        // Check if we've maintained a streak for the required days
        const [user] = await requireDb()
          .select({ currentStreak: users.currentStreak })
          .from(users)
          .where(eq(users.id, userId))
          .limit(1)
        if ((user?.currentStreak ?? 0) < req.value) {
          phaseComplete = false
        }
        break

      case 'perfect_days':
        // Count perfect days in the phase
        const perfectDaysInPhase = Object.entries(attempt.dailyProgress)
          .filter(([d, passed]) => d >= attempt.phaseStartDate && passed)
          .length
        if (perfectDaysInPhase < req.value && daysInPhase >= currentPhase.durationDays) {
          phaseComplete = false
        } else if (perfectDaysInPhase < req.value) {
          // Still time to complete
          phaseComplete = false
        }
        break

      case 'quest_completion_rate':
        if (completionRate < req.value) {
          // Need to check average over phase, not just today
          phaseComplete = false
        }
        break
    }
  }

  // Check if phase duration has elapsed
  if (daysInPhase >= currentPhase.durationDays && phaseComplete) {
    // Advance to next phase or complete boss
    attempt.phasesCompleted.push(attempt.currentPhase)

    if (attempt.currentPhase >= boss.phases.length) {
      // Boss defeated!
      attempt.status = 'VICTORY'
      attempt.completedAt = date

      // Award XP
      await createXPEvent({
        userId,
        source: 'BOSS_DEFEAT',
        sourceId: attempt.bossId,
        baseAmount: boss.xpReward,
        description: `Defeated ${boss.name}`,
      })

      // Award title if applicable
      if (boss.titleRewardId) {
        await awardTitle(userId, boss.titleRewardId)
      }

      return {
        updated: true,
        phaseAdvanced: false,
        bossDefeated: true,
        message: currentPhase.narrativeVictory,
      }
    } else {
      // Advance to next phase
      attempt.currentPhase += 1
      attempt.phaseStartDate = date

      const nextPhase = boss.phases[attempt.currentPhase - 1]

      return {
        updated: true,
        phaseAdvanced: true,
        bossDefeated: false,
        message: `${currentPhase.narrativeVictory}\n\n${nextPhase?.narrativeIntro || ''}`,
      }
    }
  }

  return {
    updated: true,
    phaseAdvanced: false,
    bossDefeated: false,
    message: `Day ${daysInPhase} of ${currentPhase.durationDays} in ${currentPhase.name}`,
  }
}

/**
 * Abandon a boss encounter
 */
export async function abandonBossEncounter(userId: string): Promise<{ abandoned: boolean; boss: Boss | null; message: string }> {
  const attempt = await getCurrentBossAttempt(userId)
  if (!attempt) {
    return {
      abandoned: false,
      boss: null,
      message: 'No active boss encounter to abandon',
    }
  }

  const boss = await getBossById(attempt.bossId)

  attempt.status = 'ABANDONED'
  attempt.abandonedAt = getTodayDate()

  return {
    abandoned: true,
    boss,
    message: `[SYSTEM] Boss encounter with ${boss?.name || 'Unknown'} abandoned. The battle can be restarted at any time.`,
  }
}

/**
 * Get detailed attempt status for a boss
 */
export async function getBossAttemptStatus(
  userId: string,
  bossId: string
): Promise<{
  attempt: BossAttempt | null
  boss: Boss | null
  currentPhase: BossPhase | null
  daysInPhase: number
  daysRemaining: number
  phaseProgress: {
    requirement: BossPhaseRequirement
    current: number
    target: number
    met: boolean
  }[]
  overallProgress: {
    phasesCompleted: number
    totalPhases: number
    daysElapsed: number
    totalDays: number
  }
} | null> {
  const attempt = await getBossAttempt(userId, bossId)
  if (!attempt) {
    return null
  }

  const boss = await getBossById(bossId)
  if (!boss) {
    return null
  }

  const currentPhase = boss.phases[attempt.currentPhase - 1]
  if (!currentPhase) {
    return null
  }

  const today = getTodayDate()
  const daysInPhase = daysBetween(attempt.phaseStartDate, today) + 1
  const daysRemaining = Math.max(0, currentPhase.durationDays - daysInPhase)

  // Get user stats for requirement evaluation
  const [user] = await requireDb()
    .select({
      currentStreak: users.currentStreak,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  // Evaluate each requirement
  const phaseProgress = await Promise.all(currentPhase.requirements.map(async (req) => {
    let current = 0
    let target = req.value
    let met = false

    switch (req.type) {
      case 'streak':
        current = user?.currentStreak ?? 0
        met = current >= target
        break

      case 'perfect_days':
        // Count perfect days in phase
        current = Object.entries(attempt.dailyProgress)
          .filter(([d, passed]) => d >= attempt.phaseStartDate && passed)
          .length
        met = current >= target
        break

      case 'quest_completion_rate':
        // Would need to calculate average completion rate over phase
        // Simplified for now
        const logs = await requireDb()
          .select()
          .from(dailyLogs)
          .where(and(
            eq(dailyLogs.userId, userId),
            gte(dailyLogs.logDate, attempt.phaseStartDate)
          ))

        if (logs.length > 0) {
          const totalCompleted = logs.reduce((sum, log) => sum + (log.coreQuestsCompleted ?? 0), 0)
          const totalQuests = logs.reduce((sum, log) => sum + (log.coreQuestsTotal ?? 0), 0)
          current = totalQuests > 0 ? Math.round((totalCompleted / totalQuests) * 100) : 0
        }
        met = current >= target
        break
    }

    return {
      requirement: req,
      current,
      target,
      met,
    }
  }))

  const daysElapsed = daysBetween(attempt.attemptStartDate, today) + 1

  return {
    attempt,
    boss,
    currentPhase,
    daysInPhase,
    daysRemaining,
    phaseProgress,
    overallProgress: {
      phasesCompleted: attempt.phasesCompleted.length,
      totalPhases: boss.phases.length,
      daysElapsed,
      totalDays: boss.totalDurationDays,
    },
  }
}

/**
 * Check if a user has defeated a specific boss
 */
export async function hasBossBeenDefeated(userId: string, bossId: string): Promise<boolean> {
  for (const [, attempt] of bossAttempts) {
    if (attempt.userId === userId && attempt.bossId === bossId && attempt.status === 'VICTORY') {
      return true
    }
  }
  return false
}

/**
 * Get count of bosses defeated by user
 */
export async function getBossesDefeatedCount(userId: string): Promise<number> {
  let count = 0
  const defeatedBossIds = new Set<string>()

  for (const [, attempt] of bossAttempts) {
    if (attempt.userId === userId && attempt.status === 'VICTORY' && !defeatedBossIds.has(attempt.bossId)) {
      defeatedBossIds.add(attempt.bossId)
      count++
    }
  }

  return count
}

/**
 * Format boss for API response
 */
export function formatBossResponse(boss: Boss) {
  return {
    id: boss.id,
    name: boss.name,
    description: boss.description,
    systemMessage: boss.systemMessage,
    levelRequirement: boss.levelRequirement,
    totalDurationDays: boss.totalDurationDays,
    xpReward: boss.xpReward,
    difficulty: boss.difficulty,
    phases: boss.phases.map(phase => ({
      phaseNumber: phase.phaseNumber,
      name: phase.name,
      durationDays: phase.durationDays,
      requirements: phase.requirements.map(req => ({
        type: req.type,
        value: req.value,
        description: req.description,
      })),
    })),
  }
}

/**
 * Format boss attempt for API response
 */
export function formatAttemptResponse(attempt: BossAttempt) {
  return {
    id: attempt.id,
    bossId: attempt.bossId,
    status: attempt.status,
    currentPhase: attempt.currentPhase,
    phaseStartDate: attempt.phaseStartDate,
    attemptStartDate: attempt.attemptStartDate,
    phasesCompleted: attempt.phasesCompleted,
    completedAt: attempt.completedAt,
    abandonedAt: attempt.abandonedAt,
  }
}
