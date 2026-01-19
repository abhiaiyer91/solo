/**
 * Realistic Stats Calculation Service
 * 
 * Calculates player stats based on baseline assessments and activity history.
 * Stats range from 10 (baseline) to 100 (elite).
 */

import { eq, and, gte, desc } from 'drizzle-orm'
import { dbClient as db } from '../db'
import { users, questLogs, questTemplates } from '../db/schema'
import { getBaselineAssessment } from './baseline'
import {
  type StatType,
  type StatBenchmark,
  getBenchmarksForStat,
  getCurrentBenchmark,
  getNextMilestone,
  getImprovementSuggestions,
} from '../lib/stat-benchmarks'

function requireDb() {
  if (!db) {
    throw new Error('Database connection required for stats service')
  }
  return db
}

export interface StatBreakdown {
  stat: StatType
  value: number
  breakdown: {
    baseline: number
    activity: number
    streak: number
  }
  benchmark: {
    current: StatBenchmark
    next: StatBenchmark | null
    progressToNext: number // 0-100%
  }
  howToImprove: string[]
}

export interface AllStatsResult {
  STR: number
  AGI: number
  VIT: number
  DISC: number
  lastUpdated: string
}

/**
 * Get baseline stat value based on assessment
 */
function getBaselineStatValue(
  baseline: Awaited<ReturnType<typeof getBaselineAssessment>>,
  statType: StatType
): number {
  if (!baseline) return 10

  switch (statType) {
    case 'STR': {
      // Base STR on push-ups and plank time
      const pushUps = baseline.pushUpsMax ?? 0
      const plankSeconds = baseline.plankHoldSeconds ?? 0
      
      if (pushUps >= 50) return 35
      if (pushUps >= 30) return 28
      if (pushUps >= 20) return 22
      if (pushUps >= 10) return 16
      if (pushUps >= 5) return 13
      
      // Add bonus for plank
      const plankBonus = plankSeconds >= 60 ? 2 : plankSeconds >= 30 ? 1 : 0
      return 10 + plankBonus
    }

    case 'AGI': {
      // Base AGI on steps and cardio
      const steps = baseline.dailyStepsBaseline ?? 0
      const mileTime = baseline.mileTimeMinutes ?? 15
      
      let agiValue = 10
      
      if (steps >= 15000) agiValue = 32
      else if (steps >= 12000) agiValue = 28
      else if (steps >= 10000) agiValue = 24
      else if (steps >= 7500) agiValue = 18
      else if (steps >= 5000) agiValue = 14
      
      // Bonus for good mile time
      if (mileTime <= 7) agiValue += 5
      else if (mileTime <= 9) agiValue += 3
      else if (mileTime <= 11) agiValue += 1
      
      return Math.min(40, agiValue) // Cap baseline contribution
    }

    case 'VIT': {
      // Base VIT on sleep, protein, and lifestyle
      let vitValue = 10
      
      const sleep = baseline.sleepHoursBaseline ?? 0
      const protein = baseline.proteinGramsBaseline ?? 0
      const alcohol = baseline.alcoholDrinksPerWeek ?? 10
      
      if (sleep >= 8) vitValue += 6
      else if (sleep >= 7) vitValue += 4
      else if (sleep >= 6) vitValue += 2
      
      if (protein >= 150) vitValue += 6
      else if (protein >= 100) vitValue += 4
      else if (protein >= 75) vitValue += 2
      
      if (alcohol === 0) vitValue += 4
      else if (alcohol <= 3) vitValue += 2
      else if (alcohol <= 7) vitValue += 1
      
      return Math.min(40, vitValue) // Cap baseline contribution
    }

    case 'DISC': {
      // Discipline is primarily earned through streaks, not baseline
      // Start everyone at 10
      return 10
    }
  }
}

/**
 * Calculate activity contribution to a stat based on recent quest completions
 */
async function getActivityContribution(
  userId: string,
  statType: StatType,
  days: number = 30
): Promise<number> {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - days)
  const cutoffStr = cutoffDate.toISOString().split('T')[0]!

  // Get completed quests that contribute to this stat
  const completedQuests = await requireDb()
    .select({
      templateId: questLogs.templateId,
      statType: questTemplates.statType,
      baseXP: questTemplates.baseXP,
      completedAt: questLogs.completedAt,
    })
    .from(questLogs)
    .innerJoin(questTemplates, eq(questLogs.templateId, questTemplates.id))
    .where(and(
      eq(questLogs.userId, userId),
      eq(questLogs.status, 'COMPLETED'),
      eq(questTemplates.statType, statType),
      gte(questLogs.questDate, cutoffStr)
    ))
    .orderBy(desc(questLogs.completedAt))

  // Calculate contribution: more completed quests = higher stat
  // Each completed quest adds 0.5-1.5 points based on XP
  const totalContribution = completedQuests.reduce((sum, quest) => {
    const xpContribution = (quest.baseXP ?? 25) / 25 // Normalize by typical XP
    return sum + Math.min(1.5, Math.max(0.5, xpContribution))
  }, 0)

  // Cap activity contribution at 30 points (rest must come from baseline or streak)
  return Math.min(30, Math.round(totalContribution))
}

/**
 * Get streak contribution to DISC stat
 */
async function getStreakContribution(userId: string): Promise<number> {
  const [user] = await requireDb()
    .select({
      currentStreak: users.currentStreak,
      longestStreak: users.longestStreak,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!user) return 0

  const currentStreak = user.currentStreak ?? 0
  const longestStreak = user.longestStreak ?? 0

  // Current streak contribution (heavily weighted)
  let streakValue = 0
  if (currentStreak >= 365) streakValue = 50
  else if (currentStreak >= 180) streakValue = 40
  else if (currentStreak >= 90) streakValue = 32
  else if (currentStreak >= 60) streakValue = 25
  else if (currentStreak >= 30) streakValue = 18
  else if (currentStreak >= 14) streakValue = 12
  else if (currentStreak >= 7) streakValue = 7
  else if (currentStreak >= 3) streakValue = 4
  else streakValue = currentStreak

  // Bonus for historical longest streak (shows capability)
  if (longestStreak >= 180) streakValue += 5
  else if (longestStreak >= 90) streakValue += 3
  else if (longestStreak >= 30) streakValue += 1

  return Math.min(50, streakValue) // Cap streak contribution
}

/**
 * Calculate a single stat with breakdown
 */
export async function calculateStat(
  userId: string,
  statType: StatType
): Promise<StatBreakdown> {
  const baseline = await getBaselineAssessment(userId)
  
  const baselineValue = getBaselineStatValue(baseline, statType)
  const activityValue = await getActivityContribution(userId, statType)
  const streakValue = statType === 'DISC' ? await getStreakContribution(userId) : 0

  // Total (capped at 100)
  const total = Math.min(100, baselineValue + activityValue + streakValue)

  const benchmarks = getBenchmarksForStat(statType)
  const current = getCurrentBenchmark(statType, total)
  const next = getNextMilestone(statType, total)

  // Calculate progress to next milestone
  let progressToNext = 100
  const defaultBenchmark: StatBenchmark = { value: 10, label: 'Baseline', description: 'Starting point', realWorld: 'Beginning journey' }
  const currentBenchmark = current ?? defaultBenchmark
  if (next && currentBenchmark) {
    progressToNext = Math.round(((total - currentBenchmark.value) / (next.value - currentBenchmark.value)) * 100)
  }

  return {
    stat: statType,
    value: total,
    breakdown: {
      baseline: baselineValue,
      activity: activityValue,
      streak: streakValue,
    },
    benchmark: {
      current: currentBenchmark,
      next,
      progressToNext,
    },
    howToImprove: getImprovementSuggestions(statType, total),
  }
}

/**
 * Calculate all stats for a user
 */
export async function calculateAllStats(userId: string): Promise<AllStatsResult> {
  const [str, agi, vit, disc] = await Promise.all([
    calculateStat(userId, 'STR'),
    calculateStat(userId, 'AGI'),
    calculateStat(userId, 'VIT'),
    calculateStat(userId, 'DISC'),
  ])

  return {
    STR: str.value,
    AGI: agi.value,
    VIT: vit.value,
    DISC: disc.value,
    lastUpdated: new Date().toISOString(),
  }
}

/**
 * Get milestones for all stats
 */
export async function getAllMilestones(userId: string): Promise<Array<{
  stat: StatType
  current: StatBenchmark
  next: StatBenchmark | null
  progressToNext: number
}>> {
  const stats: StatType[] = ['STR', 'AGI', 'VIT', 'DISC']
  
  return Promise.all(
    stats.map(async (stat) => {
      const breakdown = await calculateStat(userId, stat)
      return {
        stat,
        current: breakdown.benchmark.current,
        next: breakdown.benchmark.next,
        progressToNext: breakdown.benchmark.progressToNext,
      }
    })
  )
}

/**
 * Update user's stored stat values
 */
export async function updateUserStats(userId: string): Promise<void> {
  const stats = await calculateAllStats(userId)

  await requireDb()
    .update(users)
    .set({
      str: stats.STR,
      agi: stats.AGI,
      vit: stats.VIT,
      disc: stats.DISC,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
}
