/**
 * Hydration tracking service
 * Tracks daily water intake for rotating hydration quests
 */

import { eq, and, gte, lte, desc, sql } from 'drizzle-orm'
import { dbClient as database } from '../db'
import { quests, questProgress } from '../db/schema/game'

function requireDb() {
  if (!database) throw new Error('Database not initialized')
  return database
}

export interface HydrationLog {
  id: string
  userId: string
  date: string
  glasses: number
  targetGlasses: number
  createdAt: Date
  updatedAt: Date
}

export interface DailyHydration {
  date: string
  glasses: number
  target: number
  progress: number
  goalMet: boolean
}

const DEFAULT_TARGET = 8 // 8 glasses per day

/**
 * Get today's hydration progress
 */
export async function getTodayHydration(userId: string): Promise<DailyHydration> {
  const db = requireDb()
  const today = new Date().toISOString().split('T')[0]!

  // Find today's hydration quest progress
  const todayQuest = await db
    .select({
      questId: quests.id,
      progress: questProgress.progress,
      target: quests.targetValue,
    })
    .from(quests)
    .leftJoin(questProgress, and(
      eq(questProgress.questId, quests.id),
      eq(questProgress.userId, userId)
    ))
    .where(and(
      eq(quests.userId, userId),
      eq(quests.date, today),
      eq(quests.category, 'HYDRATION')
    ))
    .limit(1)

  const quest = todayQuest[0]
  const glasses = quest?.progress ?? 0
  const target = quest?.target ?? DEFAULT_TARGET

  return {
    date: today,
    glasses,
    target,
    progress: Math.round((glasses / target) * 100),
    goalMet: glasses >= target,
  }
}

/**
 * Add glasses of water to today's count
 */
export async function addHydration(
  userId: string,
  glasses: number = 1
): Promise<DailyHydration> {
  const db = requireDb()
  const today = new Date().toISOString().split('T')[0]!

  // Find today's hydration quest
  const todayQuest = await db
    .select()
    .from(quests)
    .where(and(
      eq(quests.userId, userId),
      eq(quests.date, today),
      eq(quests.category, 'HYDRATION')
    ))
    .limit(1)

  if (!todayQuest[0]) {
    // No hydration quest today
    return {
      date: today,
      glasses: 0,
      target: DEFAULT_TARGET,
      progress: 0,
      goalMet: false,
    }
  }

  const questId = todayQuest[0].id
  const target = todayQuest[0].targetValue ?? DEFAULT_TARGET

  // Upsert progress
  const existing = await db
    .select()
    .from(questProgress)
    .where(and(
      eq(questProgress.questId, questId),
      eq(questProgress.userId, userId)
    ))
    .limit(1)

  let newGlasses: number

  if (existing[0]) {
    newGlasses = Math.min(target, existing[0].progress + glasses)
    await db
      .update(questProgress)
      .set({
        progress: newGlasses,
        updatedAt: new Date(),
      })
      .where(eq(questProgress.id, existing[0].id))
  } else {
    newGlasses = Math.min(target, glasses)
    await db.insert(questProgress).values({
      questId,
      userId,
      progress: newGlasses,
    })
  }

  return {
    date: today,
    glasses: newGlasses,
    target,
    progress: Math.round((newGlasses / target) * 100),
    goalMet: newGlasses >= target,
  }
}

/**
 * Set exact glass count for today
 */
export async function setHydration(
  userId: string,
  glasses: number
): Promise<DailyHydration> {
  const db = requireDb()
  const today = new Date().toISOString().split('T')[0]!

  // Find today's hydration quest
  const todayQuest = await db
    .select()
    .from(quests)
    .where(and(
      eq(quests.userId, userId),
      eq(quests.date, today),
      eq(quests.category, 'HYDRATION')
    ))
    .limit(1)

  if (!todayQuest[0]) {
    return {
      date: today,
      glasses: 0,
      target: DEFAULT_TARGET,
      progress: 0,
      goalMet: false,
    }
  }

  const questId = todayQuest[0].id
  const target = todayQuest[0].targetValue ?? DEFAULT_TARGET
  const clampedGlasses = Math.max(0, Math.min(target, glasses))

  // Upsert progress
  const existing = await db
    .select()
    .from(questProgress)
    .where(and(
      eq(questProgress.questId, questId),
      eq(questProgress.userId, userId)
    ))
    .limit(1)

  if (existing[0]) {
    await db
      .update(questProgress)
      .set({
        progress: clampedGlasses,
        updatedAt: new Date(),
      })
      .where(eq(questProgress.id, existing[0].id))
  } else {
    await db.insert(questProgress).values({
      questId,
      userId,
      progress: clampedGlasses,
    })
  }

  return {
    date: today,
    glasses: clampedGlasses,
    target,
    progress: Math.round((clampedGlasses / target) * 100),
    goalMet: clampedGlasses >= target,
  }
}

/**
 * Get hydration history
 */
export async function getHydrationHistory(
  userId: string,
  days: number = 7
): Promise<DailyHydration[]> {
  const db = requireDb()
  const endDate = new Date()
  const startDate = new Date(endDate)
  startDate.setDate(startDate.getDate() - days)

  const startDateStr = startDate.toISOString().split('T')[0]!
  const endDateStr = endDate.toISOString().split('T')[0]!

  const results = await db
    .select({
      date: quests.date,
      target: quests.targetValue,
      progress: questProgress.progress,
    })
    .from(quests)
    .leftJoin(questProgress, and(
      eq(questProgress.questId, quests.id),
      eq(questProgress.userId, userId)
    ))
    .where(and(
      eq(quests.userId, userId),
      eq(quests.category, 'HYDRATION'),
      gte(quests.date, startDateStr),
      lte(quests.date, endDateStr)
    ))
    .orderBy(desc(quests.date))

  return results.map((r) => {
    const glasses = r.progress ?? 0
    const target = r.target ?? DEFAULT_TARGET
    return {
      date: r.date,
      glasses,
      target,
      progress: Math.round((glasses / target) * 100),
      goalMet: glasses >= target,
    }
  })
}

/**
 * Check if user has active hydration quest today
 */
export async function hasHydrationQuest(userId: string): Promise<boolean> {
  const db = requireDb()
  const today = new Date().toISOString().split('T')[0]!

  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(quests)
    .where(and(
      eq(quests.userId, userId),
      eq(quests.date, today),
      eq(quests.category, 'HYDRATION')
    ))

  return (result[0]?.count ?? 0) > 0
}
