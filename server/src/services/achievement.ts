/**
 * Achievement Service
 * 
 * Handles achievement definitions, triggers, and awards.
 */

import { dbClient as db } from '../db'

function requireDb() {
  if (!db) {
    throw new Error('Database connection required for achievement service')
  }
  return db
}

/**
 * Achievement types
 */
export type AchievementCategory = 
  | 'streak'
  | 'quest'
  | 'boss'
  | 'social'
  | 'milestone'
  | 'special'

export interface Achievement {
  id: string
  name: string
  description: string
  category: AchievementCategory
  icon: string
  xpReward: number
  isSecret: boolean
  condition: AchievementCondition
}

export interface AchievementCondition {
  type: 'streak' | 'quest_count' | 'boss_defeat' | 'level' | 'perfect_days' | 'custom'
  value: number
  metadata?: Record<string, unknown>
}

export interface PlayerAchievement {
  id: string
  playerId: string
  achievementId: string
  unlockedAt: string
  notified: boolean
}

/**
 * All achievement definitions
 */
export const ACHIEVEMENTS: Achievement[] = [
  // Streak achievements
  {
    id: 'streak-7',
    name: 'One Week Wonder',
    description: 'Maintain a 7-day streak',
    category: 'streak',
    icon: '🔥',
    xpReward: 50,
    isSecret: false,
    condition: { type: 'streak', value: 7 },
  },
  {
    id: 'streak-14',
    name: 'Two Week Warrior',
    description: 'Maintain a 14-day streak',
    category: 'streak',
    icon: '🔥',
    xpReward: 100,
    isSecret: false,
    condition: { type: 'streak', value: 14 },
  },
  {
    id: 'streak-30',
    name: 'Monthly Master',
    description: 'Maintain a 30-day streak',
    category: 'streak',
    icon: '💎',
    xpReward: 250,
    isSecret: false,
    condition: { type: 'streak', value: 30 },
  },
  {
    id: 'streak-60',
    name: 'Two Month Titan',
    description: 'Maintain a 60-day streak',
    category: 'streak',
    icon: '💎',
    xpReward: 500,
    isSecret: false,
    condition: { type: 'streak', value: 60 },
  },
  {
    id: 'streak-100',
    name: 'Century Club',
    description: 'Maintain a 100-day streak',
    category: 'streak',
    icon: '👑',
    xpReward: 1000,
    isSecret: false,
    condition: { type: 'streak', value: 100 },
  },
  
  // Quest achievements
  {
    id: 'quest-first',
    name: 'First Steps',
    description: 'Complete your first quest',
    category: 'quest',
    icon: '⭐',
    xpReward: 10,
    isSecret: false,
    condition: { type: 'quest_count', value: 1 },
  },
  {
    id: 'quest-50',
    name: 'Quest Enthusiast',
    description: 'Complete 50 quests',
    category: 'quest',
    icon: '⭐',
    xpReward: 100,
    isSecret: false,
    condition: { type: 'quest_count', value: 50 },
  },
  {
    id: 'quest-100',
    name: 'Quest Expert',
    description: 'Complete 100 quests',
    category: 'quest',
    icon: '⭐',
    xpReward: 200,
    isSecret: false,
    condition: { type: 'quest_count', value: 100 },
  },
  {
    id: 'quest-500',
    name: 'Quest Legend',
    description: 'Complete 500 quests',
    category: 'quest',
    icon: '🏆',
    xpReward: 500,
    isSecret: false,
    condition: { type: 'quest_count', value: 500 },
  },
  
  // Boss achievements
  {
    id: 'boss-first',
    name: 'Boss Slayer',
    description: 'Defeat your first boss',
    category: 'boss',
    icon: '⚔️',
    xpReward: 100,
    isSecret: false,
    condition: { type: 'boss_defeat', value: 1 },
  },
  {
    id: 'boss-all',
    name: 'The Hunter',
    description: 'Defeat all bosses',
    category: 'boss',
    icon: '👑',
    xpReward: 500,
    isSecret: false,
    condition: { type: 'boss_defeat', value: 3 },
  },
  
  // Level milestones
  {
    id: 'level-10',
    name: 'Double Digits',
    description: 'Reach Level 10',
    category: 'milestone',
    icon: '📈',
    xpReward: 100,
    isSecret: false,
    condition: { type: 'level', value: 10 },
  },
  {
    id: 'level-25',
    name: 'Quarter Century',
    description: 'Reach Level 25',
    category: 'milestone',
    icon: '📈',
    xpReward: 250,
    isSecret: false,
    condition: { type: 'level', value: 25 },
  },
  {
    id: 'level-50',
    name: 'Half Century',
    description: 'Reach Level 50',
    category: 'milestone',
    icon: '🏅',
    xpReward: 500,
    isSecret: false,
    condition: { type: 'level', value: 50 },
  },
  
  // Perfect day achievements
  {
    id: 'perfect-first',
    name: 'Perfect Day',
    description: 'Complete all quests in a day',
    category: 'milestone',
    icon: '✨',
    xpReward: 25,
    isSecret: false,
    condition: { type: 'perfect_days', value: 1 },
  },
  {
    id: 'perfect-7',
    name: 'Perfect Week',
    description: 'Achieve 7 perfect days',
    category: 'milestone',
    icon: '✨',
    xpReward: 150,
    isSecret: false,
    condition: { type: 'perfect_days', value: 7 },
  },
  {
    id: 'perfect-30',
    name: 'Perfect Month',
    description: 'Achieve 30 perfect days',
    category: 'milestone',
    icon: '💫',
    xpReward: 500,
    isSecret: false,
    condition: { type: 'perfect_days', value: 30 },
  },
  
  // Secret achievements
  {
    id: 'early-bird',
    name: 'Early Bird',
    description: 'Complete all quests before 8am',
    category: 'special',
    icon: '🌅',
    xpReward: 50,
    isSecret: true,
    condition: { type: 'custom', value: 1, metadata: { type: 'early_completion' } },
  },
  {
    id: 'night-owl',
    name: 'Night Owl',
    description: 'Complete all quests between 11pm and midnight',
    category: 'special',
    icon: '🦉',
    xpReward: 50,
    isSecret: true,
    condition: { type: 'custom', value: 1, metadata: { type: 'late_completion' } },
  },
]

/**
 * Get all achievements
 */
export function getAllAchievements(): Achievement[] {
  return ACHIEVEMENTS
}

/**
 * Get visible achievements (non-secret or already unlocked)
 */
export async function getVisibleAchievements(
  playerId: string
): Promise<Array<Achievement & { unlocked: boolean; unlockedAt?: string }>> {
  const playerAchievements = await getPlayerAchievements(playerId)
  const unlockedIds = new Set(playerAchievements.map(pa => pa.achievementId))
  
  return ACHIEVEMENTS.filter(a => !a.isSecret || unlockedIds.has(a.id)).map(a => ({
    ...a,
    unlocked: unlockedIds.has(a.id),
    unlockedAt: playerAchievements.find(pa => pa.achievementId === a.id)?.unlockedAt,
  }))
}

/**
 * Get player's achievements
 */
export async function getPlayerAchievements(playerId: string): Promise<PlayerAchievement[]> {
  // Stub - would query playerAchievements table
  requireDb()
  return []
}

/**
 * Check if player has achievement
 */
export async function hasAchievement(
  playerId: string,
  achievementId: string
): Promise<boolean> {
  const achievements = await getPlayerAchievements(playerId)
  return achievements.some(a => a.achievementId === achievementId)
}

/**
 * Award achievement to player
 */
export async function awardAchievement(
  playerId: string,
  achievementId: string
): Promise<PlayerAchievement | null> {
  const achievement = ACHIEVEMENTS.find(a => a.id === achievementId)
  if (!achievement) {
    throw new Error(`Achievement ${achievementId} not found`)
  }
  
  const alreadyHas = await hasAchievement(playerId, achievementId)
  if (alreadyHas) {
    return null
  }
  
  // Would insert into playerAchievements table
  requireDb()
  
  const playerAchievement: PlayerAchievement = {
    id: `pa-${Date.now()}`,
    playerId,
    achievementId,
    unlockedAt: new Date().toISOString(),
    notified: false,
  }
  
  return playerAchievement
}

/**
 * Check and trigger achievements based on player stats
 */
export async function checkAchievements(
  playerId: string,
  stats: {
    streak?: number
    questsCompleted?: number
    bossesDefeated?: number
    level?: number
    perfectDays?: number
  }
): Promise<Achievement[]> {
  const newAchievements: Achievement[] = []
  
  for (const achievement of ACHIEVEMENTS) {
    const condition = achievement.condition
    let shouldAward = false
    
    switch (condition.type) {
      case 'streak':
        if (stats.streak && stats.streak >= condition.value) {
          shouldAward = true
        }
        break
      case 'quest_count':
        if (stats.questsCompleted && stats.questsCompleted >= condition.value) {
          shouldAward = true
        }
        break
      case 'boss_defeat':
        if (stats.bossesDefeated && stats.bossesDefeated >= condition.value) {
          shouldAward = true
        }
        break
      case 'level':
        if (stats.level && stats.level >= condition.value) {
          shouldAward = true
        }
        break
      case 'perfect_days':
        if (stats.perfectDays && stats.perfectDays >= condition.value) {
          shouldAward = true
        }
        break
    }
    
    if (shouldAward) {
      const awarded = await awardAchievement(playerId, achievement.id)
      if (awarded) {
        newAchievements.push(achievement)
      }
    }
  }
  
  return newAchievements
}

/**
 * Get achievement progress
 */
export function getAchievementProgress(
  achievement: Achievement,
  stats: {
    streak?: number
    questsCompleted?: number
    bossesDefeated?: number
    level?: number
    perfectDays?: number
  }
): { current: number; target: number; percentage: number } {
  const condition = achievement.condition
  let current = 0
  
  switch (condition.type) {
    case 'streak':
      current = stats.streak ?? 0
      break
    case 'quest_count':
      current = stats.questsCompleted ?? 0
      break
    case 'boss_defeat':
      current = stats.bossesDefeated ?? 0
      break
    case 'level':
      current = stats.level ?? 0
      break
    case 'perfect_days':
      current = stats.perfectDays ?? 0
      break
  }
  
  const target = condition.value
  const percentage = Math.min(100, Math.round((current / target) * 100))
  
  return { current, target, percentage }
}
