import { dbClient as db } from '../db'
import {
  questTemplates,
  questLogs,
  users,
  type RequirementDSL,
  type NumericRequirement,
} from '../db/schema'
import { eq, and, inArray } from 'drizzle-orm'
import { getTodayDateForTimezone, getSafeTimezone, type Timezone } from '../lib/timezone'

// Rotating quest unlock day threshold
export const ROTATING_QUEST_UNLOCK_DAY = 8

// Stat type as defined in the schema
type StatType = 'STR' | 'AGI' | 'VIT' | 'DISC'

// Rotating quest template IDs for easy reference
export const ROTATING_QUEST_IDS = {
  HYDRATION: 'rotating-hydration',
  STRETCH: 'rotating-stretch',
  ALCOHOL_FREE: 'rotating-alcohol-free',
  SCREEN_SUNSET: 'rotating-screen-sunset',
  MORNING_MOVEMENT: 'rotating-morning-movement',
  MEDITATION: 'rotating-meditation',
  COLD_EXPOSURE: 'rotating-cold-exposure',
  SOCIAL_MOVEMENT: 'rotating-social-movement',
  NO_SUGAR: 'rotating-no-sugar',
  GRATITUDE_LOG: 'rotating-gratitude-log',
  DEEP_WORK: 'rotating-deep-work',
  NATURE_TIME: 'rotating-nature-time',
  POSTURE_CHECK: 'rotating-posture-check',
  MEAL_PREP: 'rotating-meal-prep',
  WALKING_MEETING: 'rotating-walking-meeting',
}

// Day of week patterns for quest selection (0 = Sunday, 6 = Saturday)
const DAY_OF_WEEK_PREFERENCES: Record<number, string[]> = {
  0: [ROTATING_QUEST_IDS.SOCIAL_MOVEMENT, ROTATING_QUEST_IDS.NATURE_TIME], // Sunday
  1: [ROTATING_QUEST_IDS.MEDITATION, ROTATING_QUEST_IDS.DEEP_WORK], // Monday
  2: [ROTATING_QUEST_IDS.STRETCH, ROTATING_QUEST_IDS.POSTURE_CHECK], // Tuesday
  3: [ROTATING_QUEST_IDS.HYDRATION, ROTATING_QUEST_IDS.MEAL_PREP], // Wednesday
  4: [ROTATING_QUEST_IDS.DEEP_WORK, ROTATING_QUEST_IDS.WALKING_MEETING], // Thursday
  5: [ROTATING_QUEST_IDS.ALCOHOL_FREE, ROTATING_QUEST_IDS.SCREEN_SUNSET], // Friday
  6: [ROTATING_QUEST_IDS.COLD_EXPOSURE, ROTATING_QUEST_IDS.SOCIAL_MOVEMENT], // Saturday
}

// Stat type to quest mapping for weak stat targeting
const STAT_TO_QUESTS: Record<StatType, string[]> = {
  VIT: [
    ROTATING_QUEST_IDS.HYDRATION,
    ROTATING_QUEST_IDS.ALCOHOL_FREE,
    ROTATING_QUEST_IDS.COLD_EXPOSURE,
    ROTATING_QUEST_IDS.NO_SUGAR,
    ROTATING_QUEST_IDS.MEAL_PREP,
  ],
  AGI: [
    ROTATING_QUEST_IDS.STRETCH,
    ROTATING_QUEST_IDS.MORNING_MOVEMENT,
    ROTATING_QUEST_IDS.SOCIAL_MOVEMENT,
    ROTATING_QUEST_IDS.NATURE_TIME,
    ROTATING_QUEST_IDS.WALKING_MEETING,
  ],
  DISC: [
    ROTATING_QUEST_IDS.SCREEN_SUNSET,
    ROTATING_QUEST_IDS.MEDITATION,
    ROTATING_QUEST_IDS.GRATITUDE_LOG,
    ROTATING_QUEST_IDS.DEEP_WORK,
  ],
  STR: [ROTATING_QUEST_IDS.POSTURE_CHECK],
}

// Base frequency weights for each quest
const BASE_FREQUENCY_WEIGHTS: Record<string, number> = {
  [ROTATING_QUEST_IDS.HYDRATION]: 3, // High
  [ROTATING_QUEST_IDS.STRETCH]: 3, // High
  [ROTATING_QUEST_IDS.GRATITUDE_LOG]: 3, // High
  [ROTATING_QUEST_IDS.POSTURE_CHECK]: 3, // High
  [ROTATING_QUEST_IDS.ALCOHOL_FREE]: 2, // Medium
  [ROTATING_QUEST_IDS.SCREEN_SUNSET]: 2, // Medium
  [ROTATING_QUEST_IDS.MORNING_MOVEMENT]: 2, // Medium
  [ROTATING_QUEST_IDS.MEDITATION]: 2, // Medium
  [ROTATING_QUEST_IDS.NATURE_TIME]: 2, // Medium
  [ROTATING_QUEST_IDS.DEEP_WORK]: 2, // Medium
  [ROTATING_QUEST_IDS.COLD_EXPOSURE]: 1, // Low
  [ROTATING_QUEST_IDS.SOCIAL_MOVEMENT]: 1, // Low
  [ROTATING_QUEST_IDS.NO_SUGAR]: 1, // Low
  [ROTATING_QUEST_IDS.MEAL_PREP]: 1, // Low
  [ROTATING_QUEST_IDS.WALKING_MEETING]: 1, // Low
}

function requireDb() {
  if (!db) {
    throw new Error('Database connection required for rotating quest service')
  }
  return db
}

/**
 * Get today's date in YYYY-MM-DD format for user's timezone
 */
function getTodayDate(timezone: Timezone = 'UTC'): string {
  const safeTimezone = getSafeTimezone(timezone)
  return getTodayDateForTimezone(safeTimezone)
}

/**
 * Calculate how many days a user has been playing (since account creation)
 */
export async function getUserDayCount(userId: string): Promise<number> {
  const [user] = await requireDb()
    .select({ createdAt: users.createdAt })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!user) {
    return 0
  }

  const now = new Date()
  const created = new Date(user.createdAt)
  const diffTime = Math.abs(now.getTime() - created.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays
}

/**
 * Check if user has unlocked rotating quests (Day 8+)
 */
export async function hasUnlockedRotatingQuests(userId: string): Promise<boolean> {
  const dayCount = await getUserDayCount(userId)
  return dayCount >= ROTATING_QUEST_UNLOCK_DAY
}

/**
 * Get user's stats for weak stat calculation
 */
export async function getUserStats(
  userId: string
): Promise<{ str: number; agi: number; vit: number; disc: number }> {
  const [user] = await requireDb()
    .select({
      str: users.str,
      agi: users.agi,
      vit: users.vit,
      disc: users.disc,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  return user ?? { str: 10, agi: 10, vit: 10, disc: 10 }
}

/**
 * Determine user's weakest stat
 */
export function getWeakestStat(stats: {
  str: number
  agi: number
  vit: number
  disc: number
}): StatType {
  const statEntries: [StatType, number][] = [
    ['STR', stats.str],
    ['AGI', stats.agi],
    ['VIT', stats.vit],
    ['DISC', stats.disc],
  ]

  statEntries.sort((a, b) => a[1] - b[1])
  // statEntries always has 4 elements, so [0] is guaranteed to exist
  return statEntries[0]![0]
}

/**
 * Get recently assigned rotating quest IDs (last N days)
 */
export async function getRecentRotatingQuestIds(
  userId: string,
  days: number = 3,
  timezone: Timezone = 'UTC'
): Promise<string[]> {
  const today = getTodayDate(timezone)
  const todayDate = new Date(today)

  // Generate dates for the last N days
  const recentDates: string[] = []
  for (let i = 1; i <= days; i++) {
    const pastDate = new Date(todayDate)
    pastDate.setDate(pastDate.getDate() - i)
    const dateStr = pastDate.toISOString().split('T')[0]
    if (dateStr) {
      recentDates.push(dateStr)
    }
  }

  // Get all rotating quest templates
  const rotatingTemplates = await requireDb()
    .select({ id: questTemplates.id })
    .from(questTemplates)
    .where(eq(questTemplates.isCore, false))

  const rotatingTemplateIds = rotatingTemplates.map((t) => t.id)

  if (rotatingTemplateIds.length === 0 || recentDates.length === 0) {
    return []
  }

  // Get quest logs for recent dates that used rotating templates
  const recentLogs = await requireDb()
    .select({ templateId: questLogs.templateId })
    .from(questLogs)
    .where(
      and(
        eq(questLogs.userId, userId),
        inArray(questLogs.questDate, recentDates),
        inArray(questLogs.templateId, rotatingTemplateIds)
      )
    )

  return recentLogs.map((log) => log.templateId)
}

/**
 * Get all available rotating quest templates
 */
export async function getRotatingQuestTemplates() {
  // Get templates that are marked as rotating (isCore = false and type = DAILY)
  // We identify rotating quests by their ID prefix
  const templates = await requireDb()
    .select()
    .from(questTemplates)
    .where(and(eq(questTemplates.isActive, true), eq(questTemplates.isCore, false)))

  // Filter to only rotating quest IDs (templates with 'rotating-' prefix)
  return templates.filter((t) => t.id.startsWith('rotating-'))
}

/**
 * Calculate selection weight for a quest
 */
function calculateQuestWeight(
  questId: string,
  recentQuestIds: string[],
  weakestStat: StatType,
  dayOfWeek: number
): number {
  let weight = BASE_FREQUENCY_WEIGHTS[questId] ?? 1

  // Recency penalty: If quest appeared in last 3 days, greatly reduce weight
  if (recentQuestIds.includes(questId)) {
    weight *= 0.1
  }

  // Weak stat boost: If quest targets user's weak stat, increase weight
  if (STAT_TO_QUESTS[weakestStat]?.includes(questId)) {
    weight *= 1.5
  }

  // Day of week preference: If quest is preferred for this day, increase weight
  if (DAY_OF_WEEK_PREFERENCES[dayOfWeek]?.includes(questId)) {
    weight *= 1.3
  }

  return weight
}

/**
 * Weighted random selection from quest pool
 */
function weightedRandomSelect<T extends { id: string }>(
  items: T[],
  weights: Map<string, number>
): T | null {
  if (items.length === 0) return null

  const totalWeight = items.reduce((sum, item) => sum + (weights.get(item.id) ?? 1), 0)

  if (totalWeight === 0) {
    // Fallback to random selection
    const index = Math.floor(Math.random() * items.length)
    return items[index] ?? null
  }

  let random = Math.random() * totalWeight
  for (const item of items) {
    random -= weights.get(item.id) ?? 1
    if (random <= 0) {
      return item
    }
  }

  // Fallback to last item
  const lastItem = items[items.length - 1]
  return lastItem ?? null
}

/**
 * Select a rotating quest for the user for today
 */
export async function selectRotatingQuest(
  userId: string,
  timezone: Timezone = 'UTC'
): Promise<(typeof questTemplates.$inferSelect) | null> {
  // Check if user has unlocked rotating quests
  const unlocked = await hasUnlockedRotatingQuests(userId)
  if (!unlocked) {
    return null
  }

  // Get available rotating quest templates
  const templates = await getRotatingQuestTemplates()
  if (templates.length === 0) {
    return null
  }

  // Get user stats to determine weak stat
  const stats = await getUserStats(userId)
  const weakestStat = getWeakestStat(stats)

  // Get recent quest IDs to avoid repetition
  const recentQuestIds = await getRecentRotatingQuestIds(userId, 3, timezone)

  // Get day of week
  const today = getTodayDate(timezone)
  const dayOfWeek = new Date(today).getDay()

  // Calculate weights for each quest
  const weights = new Map<string, number>()
  for (const template of templates) {
    const weight = calculateQuestWeight(template.id, recentQuestIds, weakestStat, dayOfWeek)
    weights.set(template.id, weight)
  }

  // Select quest using weighted random
  return weightedRandomSelect(templates, weights)
}

/**
 * Get or create today's rotating quest for a user
 */
export async function getTodayRotatingQuest(userId: string, timezone: Timezone = 'UTC') {
  const today = getTodayDate(timezone)

  // Check if rotating quest already exists for today
  const rotatingTemplates = await getRotatingQuestTemplates()
  const rotatingTemplateIds = rotatingTemplates.map((t) => t.id)

  if (rotatingTemplateIds.length > 0) {
    const existingRotatingQuest = await requireDb()
      .select({
        log: questLogs,
        template: questTemplates,
      })
      .from(questLogs)
      .innerJoin(questTemplates, eq(questLogs.templateId, questTemplates.id))
      .where(
        and(
          eq(questLogs.userId, userId),
          eq(questLogs.questDate, today),
          inArray(questLogs.templateId, rotatingTemplateIds)
        )
      )
      .limit(1)

    if (existingRotatingQuest.length > 0) {
      const result = existingRotatingQuest[0]!
      const log = result.log
      const template = result.template
      return {
        id: log.id,
        templateId: template.id,
        name: template.name,
        description: template.description,
        type: template.type,
        category: template.category,
        requirement: template.requirement,
        baseXP: template.baseXP,
        statType: template.statType,
        statBonus: template.statBonus,
        allowPartial: template.allowPartial,
        minPartialPercent: template.minPartialPercent,
        isCore: template.isCore,
        status: log.status,
        currentValue: log.currentValue,
        targetValue: log.targetValue,
        completionPercent: log.completionPercent,
        completedAt: log.completedAt,
        xpAwarded: log.xpAwarded,
        questDate: log.questDate,
        isRotating: true,
      }
    }
  }

  // Check if user has unlocked rotating quests
  const unlocked = await hasUnlockedRotatingQuests(userId)
  if (!unlocked) {
    return null
  }

  // Select and create a new rotating quest
  const selectedTemplate = await selectRotatingQuest(userId, timezone)
  if (!selectedTemplate) {
    return null
  }

  const req = selectedTemplate.requirement as RequirementDSL
  let targetValue = 1

  if (req.type === 'numeric') {
    targetValue = (req as NumericRequirement).value
  }

  const [log] = await requireDb()
    .insert(questLogs)
    .values({
      userId,
      templateId: selectedTemplate.id,
      questDate: today,
      status: 'ACTIVE',
      currentValue: 0,
      targetValue,
      completionPercent: 0,
    })
    .returning()

  return {
    id: log!.id,
    templateId: selectedTemplate.id,
    name: selectedTemplate.name,
    description: selectedTemplate.description,
    type: selectedTemplate.type,
    category: selectedTemplate.category,
    requirement: selectedTemplate.requirement,
    baseXP: selectedTemplate.baseXP,
    statType: selectedTemplate.statType,
    statBonus: selectedTemplate.statBonus,
    allowPartial: selectedTemplate.allowPartial,
    minPartialPercent: selectedTemplate.minPartialPercent,
    isCore: selectedTemplate.isCore,
    status: log!.status,
    currentValue: log!.currentValue,
    targetValue: log!.targetValue,
    completionPercent: log!.completionPercent,
    completedAt: log!.completedAt,
    xpAwarded: log!.xpAwarded,
    questDate: log!.questDate,
    isRotating: true,
  }
}

/**
 * Get the unlock status and progress for rotating quests
 */
export async function getRotatingQuestUnlockStatus(userId: string): Promise<{
  unlocked: boolean
  currentDay: number
  unlockDay: number
  daysRemaining: number
}> {
  const dayCount = await getUserDayCount(userId)

  return {
    unlocked: dayCount >= ROTATING_QUEST_UNLOCK_DAY,
    currentDay: dayCount,
    unlockDay: ROTATING_QUEST_UNLOCK_DAY,
    daysRemaining: Math.max(0, ROTATING_QUEST_UNLOCK_DAY - dayCount),
  }
}

/**
 * Get the narrative message for rotating quest unlock
 */
export function getRotatingQuestUnlockNarrative(): string {
  return `SYSTEM UPDATE

Core patterns established.
Additional variables introduced.

Rotating Quest slot unlocked.

One supplementary task will appear daily.
It changes. The core does not.

Completion is optional for streak maintenance.
Completion affects stat growth.`
}

/**
 * Get the narrative message for a specific rotating quest
 */
export function getRotatingQuestNarrative(questId: string, questName: string, target: string, xp: number): string {
  const narratives: Record<string, string> = {
    [ROTATING_QUEST_IDS.HYDRATION]: `ROTATING QUEST: Hydration

Water intake affects everything.
Cognition. Recovery. Performance.

Target: ${target}
Reward: ${xp} XP

Most people are chronically dehydrated.
The System does not assume you are different.`,

    [ROTATING_QUEST_IDS.COLD_EXPOSURE]: `ROTATING QUEST: Cold Exposure

Discomfort is a signal, not a stop sign.
The body adapts when forced.

Target: ${target}
Reward: ${xp} XP

This is optional.
Comfort is also optional.`,

    [ROTATING_QUEST_IDS.MEDITATION]: `ROTATING QUEST: Meditation

The mind requires training like any other muscle.
Stillness is not weakness.

Target: ${target}
Reward: ${xp} XP

Five minutes of intentional nothing.
Most cannot do even this.`,

    [ROTATING_QUEST_IDS.SCREEN_SUNSET]: `ROTATING QUEST: Screen Sunset

Blue light disrupts recovery.
The eyes need rest before the body does.

Target: ${target}
Reward: ${xp} XP

The screen will still exist tomorrow.`,

    [ROTATING_QUEST_IDS.DEEP_WORK]: `ROTATING QUEST: Deep Work

Fragmented attention produces fragmented results.
Focus is a skill. Skills require practice.

Target: ${target}
Reward: ${xp} XP

Ninety minutes. No interruptions.`,
  }

  return (
    narratives[questId] ??
    `ROTATING QUEST: ${questName}

Target: ${target}
Reward: ${xp} XP

Completion is optional.
Growth is not.`
  )
}
