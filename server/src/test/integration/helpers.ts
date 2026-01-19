/**
 * Integration Test Helpers
 * Factory functions for creating test entities and common assertions
 */

import { createTestId } from './setup'

// ═══════════════════════════════════════════════════════════
// TEST USER CREATION
// ═══════════════════════════════════════════════════════════

export interface TestUser {
  id: string
  name: string
  email: string
  level: number
  totalXP: number
  currentStreak: number
  longestStreak: number
  perfectStreak: number
  str: number
  agi: number
  vit: number
  disc: number
  timezone: string
  onboardingCompleted: boolean
}

export interface CreateTestUserOptions {
  level?: number
  xp?: number
  streak?: number
  stats?: {
    str?: number
    agi?: number
    vit?: number
    disc?: number
  }
}

export function createTestUser(options: CreateTestUserOptions = {}): TestUser {
  const id = createTestId('user')
  return {
    id,
    name: `Test Hunter ${id.slice(-4)}`,
    email: `${id}@test.local`,
    level: options.level ?? 1,
    totalXP: options.xp ?? 0,
    currentStreak: options.streak ?? 0,
    longestStreak: options.streak ?? 0,
    perfectStreak: 0,
    str: options.stats?.str ?? 10,
    agi: options.stats?.agi ?? 10,
    vit: options.stats?.vit ?? 10,
    disc: options.stats?.disc ?? 10,
    timezone: 'America/Los_Angeles',
    onboardingCompleted: true,
  }
}

// ═══════════════════════════════════════════════════════════
// TEST QUEST CREATION
// ═══════════════════════════════════════════════════════════

export interface TestQuest {
  id: string
  templateId: string
  userId: string
  name: string
  type: string
  category: string
  status: 'ACTIVE' | 'COMPLETED' | 'FAILED'
  baseXP: number
  currentValue: number
  targetValue: number
  statType: string
  statBonus: number
  questDate: string
}

export interface CreateTestQuestOptions {
  userId: string
  name?: string
  xpReward?: number
  target?: number
  category?: string
  statType?: string
  status?: 'ACTIVE' | 'COMPLETED' | 'FAILED'
}

export function createTestQuest(options: CreateTestQuestOptions): TestQuest {
  const id = createTestId('quest')
  return {
    id,
    templateId: createTestId('template'),
    userId: options.userId,
    name: options.name ?? 'Test Quest',
    type: 'DAILY',
    category: options.category ?? 'MOVEMENT',
    status: options.status ?? 'ACTIVE',
    baseXP: options.xpReward ?? 50,
    currentValue: 0,
    targetValue: options.target ?? 10000,
    statType: options.statType ?? 'AGI',
    statBonus: 1,
    questDate: new Date().toISOString().split('T')[0],
  }
}

// ═══════════════════════════════════════════════════════════
// TEST GUILD CREATION
// ═══════════════════════════════════════════════════════════

export interface TestGuild {
  id: string
  name: string
  description: string
  leaderId: string
  memberCount: number
  isPrivate: boolean
  createdAt: string
}

export function createTestGuild(leaderId: string, name?: string): TestGuild {
  const id = createTestId('guild')
  return {
    id,
    name: name ?? `Test Guild ${id.slice(-4)}`,
    description: 'A guild for testing purposes',
    leaderId,
    memberCount: 1,
    isPrivate: false,
    createdAt: new Date().toISOString(),
  }
}

// ═══════════════════════════════════════════════════════════
// TEST BOSS CREATION
// ═══════════════════════════════════════════════════════════

export interface TestBoss {
  id: string
  name: string
  title: string
  maxHealth: number
  currentHealth: number
  xpReward: number
  shadowId: string
  status: 'AVAILABLE' | 'IN_COMBAT' | 'DEFEATED'
}

export function createTestBoss(options: Partial<TestBoss> = {}): TestBoss {
  const id = createTestId('boss')
  return {
    id,
    name: options.name ?? 'Test Boss',
    title: options.title ?? 'The Tested',
    maxHealth: options.maxHealth ?? 1000,
    currentHealth: options.currentHealth ?? 1000,
    xpReward: options.xpReward ?? 200,
    shadowId: options.shadowId ?? createTestId('shadow'),
    status: options.status ?? 'AVAILABLE',
  }
}

// ═══════════════════════════════════════════════════════════
// TEST SEASON CREATION
// ═══════════════════════════════════════════════════════════

export interface TestSeason {
  id: string
  name: string
  startDate: string
  endDate: string
  isActive: boolean
  theme: string
}

export function createTestSeason(isActive: boolean = true): TestSeason {
  const id = createTestId('season')
  const now = new Date()
  return {
    id,
    name: `Test Season ${id.slice(-4)}`,
    startDate: now.toISOString(),
    endDate: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    isActive,
    theme: 'test',
  }
}

// ═══════════════════════════════════════════════════════════
// XP AND LEVEL CALCULATIONS
// ═══════════════════════════════════════════════════════════

/**
 * Calculate XP needed for a specific level
 */
export function xpForLevel(level: number): number {
  return level * 100 // Simple formula: Level 2 = 100 XP, Level 3 = 200 XP, etc.
}

/**
 * Calculate level from total XP
 */
export function levelFromXP(totalXP: number): number {
  let level = 1
  let xpNeeded = 100
  let xpRemaining = totalXP

  while (xpRemaining >= xpNeeded) {
    xpRemaining -= xpNeeded
    level++
    xpNeeded = level * 100
  }

  return level
}

// ═══════════════════════════════════════════════════════════
// MOCK SERVICE RESULTS
// ═══════════════════════════════════════════════════════════

export interface QuestCompletionResult {
  success: boolean
  xpAwarded: number
  leveledUp: boolean
  newLevel?: number
  statBonus: { type: string; amount: number }
}

export interface HealthSyncResult {
  success: boolean
  questsUpdated: number
  questsCompleted: number
  xpAwarded: number
}

export interface BossFightResult {
  success: boolean
  victory: boolean
  damageDealt: number
  xpAwarded: number
  shadowExtracted?: {
    id: string
    name: string
  }
}
