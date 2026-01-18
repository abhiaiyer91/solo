/**
 * Progression Service
 *
 * Calculates unlock status for game systems based on player level, days active, and season.
 * Used to show locked content with requirements and celebrate new unlocks.
 */

import { dbClient as db } from '../db'
import { users, dailyLogs } from '../db/schema'
import { eq, count } from 'drizzle-orm'

/**
 * System unlock definitions from player-journey.md
 */
export interface UnlockDefinition {
  id: string
  name: string
  description: string
  category: 'quests' | 'dungeons' | 'bosses' | 'social' | 'bonuses'
  requirement: {
    type: 'level' | 'days' | 'season' | 'always'
    value: number
  }
  narrative: string
}

export const UNLOCK_DEFINITIONS: UnlockDefinition[] = [
  // Always unlocked
  {
    id: 'daily-quests',
    name: 'Daily Quests',
    description: 'Core daily objectives',
    category: 'quests',
    requirement: { type: 'always', value: 0 },
    narrative: 'The System has assigned your daily objectives.',
  },
  {
    id: 'basic-stats',
    name: 'Basic Stats',
    description: 'STR, AGI, VIT, DISC attributes',
    category: 'quests',
    requirement: { type: 'always', value: 0 },
    narrative: 'Your attributes are now being tracked.',
  },
  {
    id: 'xp-system',
    name: 'XP & Leveling',
    description: 'Experience points and level progression',
    category: 'quests',
    requirement: { type: 'always', value: 0 },
    narrative: 'The System records all progress.',
  },

  // Day-based unlocks
  {
    id: 'weekly-quests',
    name: 'Weekly Quests',
    description: 'Week-long sustained challenges',
    category: 'quests',
    requirement: { type: 'days', value: 7 },
    narrative: 'You have demonstrated sufficient consistency. Weekly challenges are now available.',
  },
  {
    id: 'streak-bonus-7',
    name: '7-Day Streak Bonus',
    description: '+10% XP bonus for 7-day streak',
    category: 'bonuses',
    requirement: { type: 'days', value: 7 },
    narrative: 'First streak threshold reached. XP bonus activated.',
  },
  {
    id: 'streak-bonus-14',
    name: '14-Day Streak Bonus',
    description: '+15% XP bonus for 14-day streak',
    category: 'bonuses',
    requirement: { type: 'days', value: 14 },
    narrative: 'Two weeks of consistency. Streak bonus upgraded.',
  },
  {
    id: 'streak-bonus-30',
    name: '30-Day Streak Bonus',
    description: '+25% XP bonus for 30-day streak',
    category: 'bonuses',
    requirement: { type: 'days', value: 30 },
    narrative: 'Habit formation threshold reached. Maximum streak bonus unlocked.',
  },

  // Level-based unlocks
  {
    id: 'dungeons-e',
    name: 'E-Rank Dungeons',
    description: 'Entry-level timed challenges',
    category: 'dungeons',
    requirement: { type: 'level', value: 3 },
    narrative: 'UNSTABLE ZONE DETECTED\n\nYou have reached sufficient level to enter E-Rank dungeons.\n\nEntry is optional.\nSurvival is likely.\nGrowth is not guaranteed.',
  },
  {
    id: 'boss-fights',
    name: 'Boss Fights',
    description: 'Multi-week identity challenges',
    category: 'bosses',
    requirement: { type: 'level', value: 5 },
    narrative: 'THREAT DETECTED\n\nA pattern has been identified in your history.\nIt has a name.\n\nBoss encounters are now available.',
  },
  {
    id: 'titles',
    name: 'Titles',
    description: 'Earned achievements with passive bonuses',
    category: 'social',
    requirement: { type: 'level', value: 5 },
    narrative: 'Title system unlocked. Your achievements will now be recognized.',
  },
  {
    id: 'dungeons-d',
    name: 'D-Rank Dungeons',
    description: 'Moderate difficulty challenges',
    category: 'dungeons',
    requirement: { type: 'level', value: 6 },
    narrative: 'D-Rank dungeons detected. Difficulty increased.',
  },
  {
    id: 'dungeons-c',
    name: 'C-Rank Dungeons',
    description: 'Challenging timed objectives',
    category: 'dungeons',
    requirement: { type: 'level', value: 10 },
    narrative: 'C-Rank dungeons now accessible. The difficulty continues to scale.',
  },
  {
    id: 'boss-2',
    name: 'Boss 2: The Excuse Maker',
    description: 'Second identity boss',
    category: 'bosses',
    requirement: { type: 'level', value: 10 },
    narrative: 'A new threat emerges. The Excuse Maker awaits.',
  },
  {
    id: 'dungeons-b',
    name: 'B-Rank Dungeons',
    description: 'Advanced challenges',
    category: 'dungeons',
    requirement: { type: 'level', value: 15 },
    narrative: 'B-Rank dungeons unlocked. Only the disciplined survive.',
  },
  {
    id: 'dungeons-a',
    name: 'A-Rank Dungeons',
    description: 'Expert-level challenges',
    category: 'dungeons',
    requirement: { type: 'level', value: 20 },
    narrative: 'A-Rank dungeons accessible. The System acknowledges your growth.',
  },
  {
    id: 'boss-3',
    name: 'Boss 3: The Complacent One',
    description: 'Third identity boss',
    category: 'bosses',
    requirement: { type: 'level', value: 20 },
    narrative: 'The final personal boss awaits. The Complacent One.',
  },

  // Season-based unlocks
  {
    id: 'leaderboards',
    name: 'Leaderboards',
    description: 'Global and friend rankings',
    category: 'social',
    requirement: { type: 'season', value: 2 },
    narrative: 'Season 2 unlocked. Your progress will now be compared to others.',
  },
  {
    id: 'dungeons-s',
    name: 'S-Rank Dungeons',
    description: 'Ultimate challenges',
    category: 'dungeons',
    requirement: { type: 'season', value: 3 },
    narrative: 'S-Rank dungeons unlocked. The hardest content awaits the worthy.',
  },
  {
    id: 'legacy-titles',
    name: 'Legacy Titles',
    description: 'Exclusive achievement titles',
    category: 'social',
    requirement: { type: 'season', value: 3 },
    narrative: 'Legacy titles now earnable. Your journey will be remembered.',
  },
]

export interface UnlockStatus {
  id: string
  name: string
  description: string
  category: string
  isUnlocked: boolean
  requirement: {
    type: string
    value: number
    current: number
  }
  progress: number // 0-100
  narrative: string | null // Only set when newly unlocked
}

export interface ProgressionSummary {
  unlocks: UnlockStatus[]
  newUnlocks: UnlockStatus[]
  nextUnlocks: UnlockStatus[]
  stats: {
    totalUnlocks: number
    unlockedCount: number
    level: number
    daysActive: number
    currentSeason: number
  }
}

function requireDb() {
  if (!db) {
    throw new Error('Database connection required for progression service')
  }
  return db
}

/**
 * Get the number of days the player has been active (has daily logs)
 */
async function getDaysActive(userId: string): Promise<number> {
  const result = await requireDb()
    .select({ count: count() })
    .from(dailyLogs)
    .where(eq(dailyLogs.userId, userId))

  return result[0]?.count ?? 0
}

/**
 * Determine current season based on level and days
 * Season 1: Levels 1-14 or days 0-59
 * Season 2: Levels 15-24 or days 60-89
 * Season 3: Level 25+ or days 90+
 */
function calculateSeason(level: number, daysActive: number): number {
  if (level >= 25 || daysActive >= 90) return 3
  if (level >= 15 || daysActive >= 60) return 2
  return 1
}

/**
 * Calculate unlock status for a single definition
 */
function calculateUnlockStatus(
  def: UnlockDefinition,
  level: number,
  daysActive: number,
  currentSeason: number
): UnlockStatus {
  let isUnlocked = false
  let current = 0
  let progress = 0

  switch (def.requirement.type) {
    case 'always':
      isUnlocked = true
      current = 1
      progress = 100
      break
    case 'level':
      current = level
      isUnlocked = level >= def.requirement.value
      progress = Math.min(100, Math.round((level / def.requirement.value) * 100))
      break
    case 'days':
      current = daysActive
      isUnlocked = daysActive >= def.requirement.value
      progress = Math.min(100, Math.round((daysActive / def.requirement.value) * 100))
      break
    case 'season':
      current = currentSeason
      isUnlocked = currentSeason >= def.requirement.value
      progress = Math.min(100, Math.round((currentSeason / def.requirement.value) * 100))
      break
  }

  return {
    id: def.id,
    name: def.name,
    description: def.description,
    category: def.category,
    isUnlocked,
    requirement: {
      type: def.requirement.type,
      value: def.requirement.value,
      current,
    },
    progress,
    narrative: null, // Will be set for new unlocks
  }
}

/**
 * Get full progression summary for a user
 */
export async function getProgressionSummary(
  userId: string,
  lastSeenUnlockIds: string[] = []
): Promise<ProgressionSummary> {
  // Get user data
  const [user] = await requireDb()
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!user) {
    throw new Error('User not found')
  }

  const level = user.level ?? 1
  const daysActive = await getDaysActive(userId)
  const currentSeason = calculateSeason(level, daysActive)

  // Calculate status for all unlocks
  const unlocks = UNLOCK_DEFINITIONS.map((def) =>
    calculateUnlockStatus(def, level, daysActive, currentSeason)
  )

  // Find new unlocks (unlocked now but not in lastSeen)
  const newUnlocks = unlocks
    .filter((u) => u.isUnlocked && !lastSeenUnlockIds.includes(u.id))
    .map((u) => ({
      ...u,
      narrative: UNLOCK_DEFINITIONS.find((d) => d.id === u.id)?.narrative ?? null,
    }))

  // Find next unlocks (not yet unlocked, sorted by closest to unlocking)
  const nextUnlocks = unlocks
    .filter((u) => !u.isUnlocked)
    .sort((a, b) => b.progress - a.progress)
    .slice(0, 3)

  const unlockedCount = unlocks.filter((u) => u.isUnlocked).length

  return {
    unlocks,
    newUnlocks,
    nextUnlocks,
    stats: {
      totalUnlocks: UNLOCK_DEFINITIONS.length,
      unlockedCount,
      level,
      daysActive,
      currentSeason,
    },
  }
}

/**
 * Get just the unlock status (without new unlock detection)
 */
export async function getUnlockStatuses(userId: string): Promise<UnlockStatus[]> {
  const summary = await getProgressionSummary(userId, [])
  return summary.unlocks
}

/**
 * Check if a specific feature is unlocked for a user
 */
export async function isFeatureUnlocked(
  userId: string,
  featureId: string
): Promise<boolean> {
  const summary = await getProgressionSummary(userId, [])
  const unlock = summary.unlocks.find((u) => u.id === featureId)
  return unlock?.isUnlocked ?? false
}
