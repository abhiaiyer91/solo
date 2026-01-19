/**
 * Daily Challenge Service
 * 
 * Handles rotating daily challenges that provide variety beyond core quests.
 */

import { dbClient as db } from '../db'

function requireDb() {
  if (!db) {
    throw new Error('Database connection required for daily challenge service')
  }
  return db
}

/**
 * Challenge types
 */
export type ChallengeType = 
  | 'step_milestone'
  | 'workout_variety'
  | 'early_bird'
  | 'social'
  | 'precision'
  | 'endurance'
  | 'consistency'

export interface DailyChallenge {
  id: string
  name: string
  description: string
  type: ChallengeType
  bonusXP: number
  difficulty: 'easy' | 'medium' | 'hard'
  condition: ChallengeCondition
  isActive: boolean
}

export interface ChallengeCondition {
  type: string
  value: number
  metadata?: Record<string, unknown>
}

export interface PlayerChallengeProgress {
  challengeId: string
  playerId: string
  date: string
  completed: boolean
  progress: number
  completedAt?: string
}

/**
 * Challenge pool definitions
 */
export const CHALLENGE_POOL: Omit<DailyChallenge, 'isActive'>[] = [
  // Step milestones
  {
    id: 'step-stretch',
    name: 'Step Stretch',
    description: 'Walk 20% more than your usual daily goal',
    type: 'step_milestone',
    bonusXP: 50,
    difficulty: 'medium',
    condition: { type: 'steps_multiplier', value: 1.2 },
  },
  {
    id: 'step-marathon',
    name: 'Mini Marathon',
    description: 'Walk 15,000 steps today',
    type: 'step_milestone',
    bonusXP: 75,
    difficulty: 'hard',
    condition: { type: 'steps_fixed', value: 15000 },
  },
  
  // Early bird
  {
    id: 'early-bird',
    name: 'Early Bird',
    description: 'Complete one quest before 8am',
    type: 'early_bird',
    bonusXP: 30,
    difficulty: 'easy',
    condition: { type: 'quest_before_hour', value: 8 },
  },
  {
    id: 'morning-warrior',
    name: 'Morning Warrior',
    description: 'Complete all daily quests before noon',
    type: 'early_bird',
    bonusXP: 75,
    difficulty: 'hard',
    condition: { type: 'all_quests_before_hour', value: 12 },
  },
  
  // Workout variety
  {
    id: 'new-workout',
    name: 'Try Something New',
    description: 'Log a workout type you haven\'t done this week',
    type: 'workout_variety',
    bonusXP: 40,
    difficulty: 'medium',
    condition: { type: 'new_workout_type', value: 1 },
  },
  
  // Precision
  {
    id: 'bullseye',
    name: 'Bullseye',
    description: 'Hit your step goal exactly (within 100 steps)',
    type: 'precision',
    bonusXP: 50,
    difficulty: 'medium',
    condition: { type: 'steps_exact', value: 100 },
  },
  
  // Endurance
  {
    id: 'long-workout',
    name: 'Endurance Test',
    description: 'Complete a workout lasting 45+ minutes',
    type: 'endurance',
    bonusXP: 60,
    difficulty: 'hard',
    condition: { type: 'workout_duration', value: 45 },
  },
  
  // Consistency
  {
    id: 'no-breaks',
    name: 'No Breaks',
    description: 'Complete quests every hour from 9am to 5pm',
    type: 'consistency',
    bonusXP: 100,
    difficulty: 'hard',
    condition: { type: 'hourly_quests', value: 8 },
  },
  
  // Social
  {
    id: 'encourager',
    name: 'Encourager',
    description: 'Send encouragement to your accountability partner',
    type: 'social',
    bonusXP: 25,
    difficulty: 'easy',
    condition: { type: 'send_encouragement', value: 1 },
  },
]

/**
 * Get today's active challenge for a player
 */
export async function getTodayChallenge(
  playerId: string,
  playerLevel: number = 1
): Promise<DailyChallenge | null> {
  // Use date as seed for consistent daily rotation
  const today = new Date().toISOString().split('T')[0]
  const seed = hashString(today + playerId)
  
  // Filter challenges by difficulty based on level
  const eligibleChallenges = CHALLENGE_POOL.filter(c => {
    if (playerLevel < 5 && c.difficulty === 'hard') return false
    if (playerLevel < 3 && c.difficulty === 'medium') return false
    return true
  })
  
  if (eligibleChallenges.length === 0) return null
  
  const index = seed % eligibleChallenges.length
  const challenge = eligibleChallenges[index]!
  
  return {
    ...challenge,
    isActive: true,
  }
}

/**
 * Get challenge history for a player
 */
export async function getChallengeHistory(
  playerId: string,
  limit: number = 7
): Promise<PlayerChallengeProgress[]> {
  // Would query from database
  requireDb()
  return []
}

/**
 * Get player's progress on today's challenge
 */
export async function getChallengeProgress(
  playerId: string
): Promise<PlayerChallengeProgress | null> {
  const today = new Date().toISOString().split('T')[0]
  // Would query from database
  requireDb()
  return null
}

/**
 * Update challenge progress
 */
export async function updateChallengeProgress(
  playerId: string,
  challengeId: string,
  progress: number
): Promise<PlayerChallengeProgress> {
  const today = new Date().toISOString().split('T')[0]
  const challenge = CHALLENGE_POOL.find(c => c.id === challengeId)
  
  if (!challenge) {
    throw new Error(`Challenge ${challengeId} not found`)
  }
  
  const isCompleted = progress >= challenge.condition.value
  
  // Would upsert into database
  requireDb()
  
  return {
    challengeId,
    playerId,
    date: today,
    completed: isCompleted,
    progress,
    completedAt: isCompleted ? new Date().toISOString() : undefined,
  }
}

/**
 * Complete a challenge and award bonus XP
 */
export async function completeChallenge(
  playerId: string,
  challengeId: string
): Promise<{ xpAwarded: number; challenge: DailyChallenge }> {
  const challenge = CHALLENGE_POOL.find(c => c.id === challengeId)
  
  if (!challenge) {
    throw new Error(`Challenge ${challengeId} not found`)
  }
  
  // Mark as completed and award XP
  await updateChallengeProgress(playerId, challengeId, challenge.condition.value)
  
  return {
    xpAwarded: challenge.bonusXP,
    challenge: { ...challenge, isActive: false },
  }
}

/**
 * Check if today's challenge is completed
 */
export async function isTodayChallengeCompleted(
  playerId: string
): Promise<boolean> {
  const progress = await getChallengeProgress(playerId)
  return progress?.completed ?? false
}

/**
 * Get challenge stats for a player
 */
export async function getChallengeStats(
  playerId: string
): Promise<{
  totalCompleted: number
  currentStreak: number
  longestStreak: number
  totalBonusXP: number
}> {
  // Would query from database
  requireDb()
  return {
    totalCompleted: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalBonusXP: 0,
  }
}

/**
 * Simple string hash function for deterministic rotation
 */
function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash)
}
