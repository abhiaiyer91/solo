/**
 * Bonus Quest Service
 *
 * Handles optional high-difficulty bonus quests for extra XP.
 * Bonus quest types: Stretch Goal (+50%), Time Challenge (+75%), Stack (+100%)
 */

import { dbClient as db } from '../db'
import { questTemplates, questLogs, users } from '../db/schema'
import { eq, and, sql } from 'drizzle-orm'
import { getTodayDateForTimezone, type Timezone } from '../lib/timezone'

function requireDb() {
  if (!db) {
    throw new Error('Database connection required for bonus quest service')
  }
  return db
}

const BONUS_UNLOCK_LEVEL = 5

/**
 * Bonus quest types with XP multipliers
 */
export type BonusQuestType = 'STRETCH_GOAL' | 'TIME_CHALLENGE' | 'STACK'

export interface BonusQuestConfig {
  type: BonusQuestType
  name: string
  description: string
  xpMultiplier: number
  requirements: Record<string, unknown>
}

export const BONUS_QUEST_TYPES: Record<BonusQuestType, { multiplier: number; description: string }> = {
  STRETCH_GOAL: {
    multiplier: 1.5,
    description: 'Exceed your core quest targets by 50%',
  },
  TIME_CHALLENGE: {
    multiplier: 1.75,
    description: 'Complete the challenge before a time limit',
  },
  STACK: {
    multiplier: 2.0,
    description: 'Combine multiple quest completions',
  },
}

/**
 * Predefined bonus quest templates
 */
const BONUS_QUEST_TEMPLATES: BonusQuestConfig[] = [
  // Stretch Goals
  {
    type: 'STRETCH_GOAL',
    name: 'Step Master',
    description: 'Complete 15,000 steps today (150% of standard)',
    xpMultiplier: 1.5,
    requirements: { steps: 15000 },
  },
  {
    type: 'STRETCH_GOAL',
    name: 'Iron Form',
    description: 'Complete 5 strength sets instead of 3',
    xpMultiplier: 1.5,
    requirements: { strengthSets: 5 },
  },
  {
    type: 'STRETCH_GOAL',
    name: 'Hydration Champion',
    description: 'Drink 12 glasses of water instead of 8',
    xpMultiplier: 1.5,
    requirements: { waterGlasses: 12 },
  },

  // Time Challenges
  {
    type: 'TIME_CHALLENGE',
    name: 'Dawn Warrior',
    description: 'Complete 5,000 steps before 7:00 AM',
    xpMultiplier: 1.75,
    requirements: { steps: 5000, beforeHour: 7 },
  },
  {
    type: 'TIME_CHALLENGE',
    name: 'Morning Strength',
    description: 'Complete strength training before 8:00 AM',
    xpMultiplier: 1.75,
    requirements: { strengthSets: 3, beforeHour: 8 },
  },
  {
    type: 'TIME_CHALLENGE',
    name: 'Lunch Rush',
    description: 'Complete 8,000 steps by noon',
    xpMultiplier: 1.75,
    requirements: { steps: 8000, beforeHour: 12 },
  },

  // Stacks
  {
    type: 'STACK',
    name: 'Triple Threat',
    description: 'Complete Movement + Strength + Recovery in one day',
    xpMultiplier: 2.0,
    requirements: { categories: ['MOVEMENT', 'STRENGTH', 'RECOVERY'] },
  },
  {
    type: 'STACK',
    name: 'Full Sweep',
    description: 'Complete all 4 core quests at 100%',
    xpMultiplier: 2.0,
    requirements: { perfectCoreQuests: 4 },
  },
  {
    type: 'STACK',
    name: 'Double Down',
    description: 'Complete any two quests at 150% target',
    xpMultiplier: 2.0,
    requirements: { stretchQuests: 2 },
  },
]

/**
 * Weekend-specific bonus quests (harder, higher rewards)
 */
const WEEKEND_BONUS_TEMPLATES: BonusQuestConfig[] = [
  {
    type: 'STRETCH_GOAL',
    name: 'Weekend Warrior',
    description: 'Complete 20,000 steps on the weekend',
    xpMultiplier: 2.0,
    requirements: { steps: 20000 },
  },
  {
    type: 'STACK',
    name: 'Perfect Weekend',
    description: 'Complete all quests at 100% both Saturday and Sunday',
    xpMultiplier: 2.5,
    requirements: { perfectWeekendDays: 2 },
  },
]

export interface DailyBonusQuest {
  id: string
  type: BonusQuestType
  name: string
  description: string
  xpMultiplier: number
  baseXP: number
  potentialXP: number
  requirements: Record<string, unknown>
  isCompleted: boolean
  canReroll: boolean
  isWeekend: boolean
}

/**
 * Check if user can access bonus quests
 */
export async function canAccessBonusQuests(userId: string): Promise<boolean> {
  const [user] = await requireDb()
    .select({ level: users.level })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  return (user?.level ?? 1) >= BONUS_UNLOCK_LEVEL
}

/**
 * Get today's bonus quest for user
 */
export async function getDailyBonusQuest(
  userId: string,
  timezone: Timezone = 'UTC'
): Promise<DailyBonusQuest | null> {
  const canAccess = await canAccessBonusQuests(userId)
  if (!canAccess) return null

  const today = getTodayDateForTimezone(timezone)

  // Check if user already has a bonus quest for today
  // Note: 'BONUS' type quests are identified through the quest template type
  const existingQuestResult = await requireDb()
    .select({ log: questLogs })
    .from(questLogs)
    .innerJoin(questTemplates, eq(questLogs.templateId, questTemplates.id))
    .where(
      and(
        eq(questLogs.userId, userId),
        eq(questLogs.questDate, today),
        sql`${questTemplates.type} = 'BONUS'`
      )
    )
    .limit(1)
  const existingQuest = existingQuestResult[0]?.log

  if (existingQuest) {
    // Return existing bonus quest
    const [template] = await requireDb()
      .select()
      .from(questTemplates)
      .where(eq(questTemplates.id, existingQuest.templateId))
      .limit(1)

    if (template) {
      return formatBonusQuest(template, existingQuest)
    }
  }

  // Generate new bonus quest for today
  return generateDailyBonusQuest(userId, timezone)
}

/**
 * Generate a new daily bonus quest
 */
async function generateDailyBonusQuest(
  userId: string,
  timezone: Timezone
): Promise<DailyBonusQuest> {
  const today = getTodayDateForTimezone(timezone)

  // Check if weekend for harder quests
  const date = new Date()
  const dayOfWeek = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    weekday: 'short',
  }).format(date)
  const isWeekend = dayOfWeek === 'Sat' || dayOfWeek === 'Sun'

  // Select from appropriate pool
  const pool = isWeekend ? [...BONUS_QUEST_TEMPLATES, ...WEEKEND_BONUS_TEMPLATES] : BONUS_QUEST_TEMPLATES

  // Seed random selection with date + userId for consistency
  const seed = hashCode(`${today}-${userId}`)
  const selectedIndex = Math.abs(seed) % pool.length
  const selected = pool[selectedIndex]!

  const baseXP = 50 // Base XP for bonus quests

  return {
    id: `bonus-${today}-${userId}`,
    type: selected.type,
    name: selected.name,
    description: selected.description,
    xpMultiplier: selected.xpMultiplier,
    baseXP,
    potentialXP: Math.round(baseXP * selected.xpMultiplier),
    requirements: selected.requirements,
    isCompleted: false,
    canReroll: true, // Can reroll once per day
    isWeekend,
  }
}

/**
 * Reroll today's bonus quest
 */
export async function rerollBonusQuest(
  userId: string,
  timezone: Timezone = 'UTC'
): Promise<DailyBonusQuest | null> {
  const canAccess = await canAccessBonusQuests(userId)
  if (!canAccess) return null

  const today = getTodayDateForTimezone(timezone)

  // Check if already rerolled today
  // In a full implementation, we'd track this in the database
  // For now, we'll just generate a new quest

  // Generate a different quest by adding randomness
  const date = new Date()
  const dayOfWeek = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    weekday: 'short',
  }).format(date)
  const isWeekend = dayOfWeek === 'Sat' || dayOfWeek === 'Sun'

  const pool = isWeekend ? [...BONUS_QUEST_TEMPLATES, ...WEEKEND_BONUS_TEMPLATES] : BONUS_QUEST_TEMPLATES

  // Different seed for reroll
  const seed = hashCode(`${today}-${userId}-reroll-${Date.now()}`)
  const selectedIndex = Math.abs(seed) % pool.length
  const selected = pool[selectedIndex]!

  const baseXP = 50

  return {
    id: `bonus-${today}-${userId}-reroll`,
    type: selected.type,
    name: selected.name,
    description: selected.description,
    xpMultiplier: selected.xpMultiplier,
    baseXP,
    potentialXP: Math.round(baseXP * selected.xpMultiplier),
    requirements: selected.requirements,
    isCompleted: false,
    canReroll: false, // Can only reroll once
    isWeekend,
  }
}

/**
 * Format database quest into bonus quest response
 */
function formatBonusQuest(
  template: typeof questTemplates.$inferSelect,
  log: typeof questLogs.$inferSelect
): DailyBonusQuest {
  const config = BONUS_QUEST_TEMPLATES.find((t) => t.name === template.name)

  return {
    id: log.id,
    type: (config?.type ?? 'STRETCH_GOAL') as BonusQuestType,
    name: template.name,
    description: template.description,
    xpMultiplier: config?.xpMultiplier ?? 1.5,
    baseXP: template.baseXP,
    potentialXP: Math.round(template.baseXP * (config?.xpMultiplier ?? 1.5)),
    requirements: config?.requirements ?? {},
    isCompleted: log.status === 'COMPLETED',
    canReroll: false,
    isWeekend: false,
  }
}

/**
 * Simple hash function for consistent randomness
 */
function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }
  return hash
}

/**
 * Get bonus quest unlock status
 */
export async function getBonusQuestUnlockStatus(userId: string): Promise<{
  isUnlocked: boolean
  currentLevel: number
  requiredLevel: number
}> {
  const [user] = await requireDb()
    .select({ level: users.level })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  const currentLevel = user?.level ?? 1

  return {
    isUnlocked: currentLevel >= BONUS_UNLOCK_LEVEL,
    currentLevel,
    requiredLevel: BONUS_UNLOCK_LEVEL,
  }
}
