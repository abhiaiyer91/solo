import { config } from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

// ESM module directory resolution
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load .env from project root
config({ path: resolve(__dirname, '../../../.env') })

import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { questTemplates, type RequirementDSL } from './schema/game'
import { dungeons, type DungeonRequirement, type DungeonChallenge } from './schema/dungeons'
import { seedNarrativeContent } from './seed-narrative'
import { seedTitlesData } from './seed-titles'
import { seedSeasonsData } from './seed-seasons'
import { seedRotatingQuests } from './seed-rotating-quests'

// Boss data definitions for seeding
interface BossPhaseRequirement {
  type: 'streak' | 'perfect_days' | 'dungeon_clears' | 'quest_completion_rate'
  value: number
  description: string
}

interface BossPhase {
  phaseNumber: number
  name: string
  durationDays: number
  requirements: BossPhaseRequirement[]
  narrativeIntro: string
  narrativeVictory: string
}

interface BossData {
  id: string
  name: string
  description: string
  systemMessage: string
  levelRequirement: number
  totalDurationDays: number
  xpReward: number
  difficulty: 'NORMAL' | 'HARD' | 'NIGHTMARE'
  phases: BossPhase[]
}

// The three boss encounters
const bossData: BossData[] = [
  {
    id: 'boss-inconsistent-one',
    name: 'The Inconsistent One',
    description:
      'A shadow of your former self - the version that starts strong but fades. Defeat it by maintaining a 7-day streak across 3 phases.',
    systemMessage:
      '[BOSS ENCOUNTER] The Inconsistent One manifests. Prove your dedication through sustained effort.',
    levelRequirement: 5,
    totalDurationDays: 21,
    xpReward: 500,
    difficulty: 'NORMAL',
    phases: [
      {
        phaseNumber: 1,
        name: 'Phase 1: Breaking the Pattern',
        durationDays: 7,
        requirements: [{ type: 'streak', value: 7, description: 'Maintain a 7-day streak' }],
        narrativeIntro:
          'The Inconsistent One emerges from the shadows of your past failures. Phase 1 begins.',
        narrativeVictory: 'Phase 1 complete. The Inconsistent One weakens, but fights on.',
      },
      {
        phaseNumber: 2,
        name: 'Phase 2: Building Momentum',
        durationDays: 7,
        requirements: [{ type: 'streak', value: 7, description: 'Maintain another 7-day streak' }],
        narrativeIntro: 'The Inconsistent One adapts. Phase 2 demands continued vigilance.',
        narrativeVictory: 'Phase 2 complete. The pattern of inconsistency cracks.',
      },
      {
        phaseNumber: 3,
        name: 'Phase 3: Final Stand',
        durationDays: 7,
        requirements: [
          { type: 'streak', value: 7, description: 'Complete the final 7-day streak' },
        ],
        narrativeIntro: 'The Inconsistent One makes its final stand. 7 more days to victory.',
        narrativeVictory:
          'VICTORY. The Inconsistent One is defeated. Consistency is now your nature.',
      },
    ],
  },
  {
    id: 'boss-excuse-maker',
    name: 'The Excuse Maker',
    description:
      'The voice that justifies every failure. Silence it with 21 days of perfect execution, including specific perfect day requirements.',
    systemMessage:
      '[BOSS ENCOUNTER] The Excuse Maker whispers doubts. Only perfect days will silence it.',
    levelRequirement: 10,
    totalDurationDays: 21,
    xpReward: 1000,
    difficulty: 'HARD',
    phases: [
      {
        phaseNumber: 1,
        name: 'Phase 1: Silencing Doubt',
        durationDays: 7,
        requirements: [
          { type: 'perfect_days', value: 5, description: 'Achieve 5 perfect days in 7 days' },
        ],
        narrativeIntro:
          'The Excuse Maker begins its assault. Only perfection will silence the doubts.',
        narrativeVictory: 'Phase 1 complete. The excuses grow quieter.',
      },
      {
        phaseNumber: 2,
        name: 'Phase 2: No Compromises',
        durationDays: 7,
        requirements: [
          { type: 'perfect_days', value: 6, description: 'Achieve 6 perfect days in 7 days' },
        ],
        narrativeIntro: 'The Excuse Maker doubles down. Near-perfection is required.',
        narrativeVictory: 'Phase 2 complete. The excuses become whispers.',
      },
      {
        phaseNumber: 3,
        name: 'Phase 3: Perfect Execution',
        durationDays: 7,
        requirements: [
          { type: 'perfect_days', value: 7, description: 'Achieve 7 consecutive perfect days' },
        ],
        narrativeIntro:
          'The Excuse Maker makes its final argument. Only perfect execution will end this.',
        narrativeVictory: 'VICTORY. The Excuse Maker is silenced. No more excuses.',
      },
    ],
  },
  {
    id: 'boss-comfortable-self',
    name: 'The Comfortable Self',
    description:
      'The ultimate enemy - the version of you that resists change. A 42-day battle requiring sustained excellence and dungeon mastery.',
    systemMessage:
      '[BOSS ENCOUNTER] The Comfortable Self awakens. This is your greatest challenge.',
    levelRequirement: 20,
    totalDurationDays: 42,
    xpReward: 2500,
    difficulty: 'NIGHTMARE',
    phases: [
      {
        phaseNumber: 1,
        name: 'Phase 1: Disrupting Comfort',
        durationDays: 14,
        requirements: [
          { type: 'streak', value: 14, description: 'Maintain a 14-day streak' },
          { type: 'quest_completion_rate', value: 80, description: '80% quest completion rate' },
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
          { type: 'perfect_days', value: 10, description: 'Achieve 10 perfect days' },
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
          { type: 'quest_completion_rate', value: 90, description: '90% quest completion rate' },
        ],
        narrativeIntro: 'The Comfortable Self makes its final stand. Transcend your limitations.',
        narrativeVictory: 'VICTORY. The Comfortable Self is destroyed. You have transcended.',
      },
    ],
  },
]

// Function to seed boss data (logs the configuration - actual boss data is in-memory in boss.ts service)
async function seedBossData() {
  console.log('[SYSTEM] Initializing boss database...')

  for (const boss of bossData) {
    console.log(
      `  ✓ Boss registered: ${boss.name} (Level ${boss.levelRequirement}+, ${boss.totalDurationDays} days, ${boss.xpReward} XP)`
    )
    console.log(`    Difficulty: ${boss.difficulty}`)
    console.log(`    Phases: ${boss.phases.length}`)
    for (const phase of boss.phases) {
      console.log(`      - ${phase.name}: ${phase.durationDays} days`)
      for (const req of phase.requirements) {
        console.log(`        * ${req.description}`)
      }
    }
  }

  console.log('\n[SYSTEM] Boss database initialized successfully.')
  console.log(`  Total bosses: ${bossData.length}`)
  console.log(`  - The Inconsistent One: Level 5, 21 days, 500 XP (3 phases of 7 days each)`)
  console.log(
    `  - The Excuse Maker: Level 10, 21 days, 1000 XP (phases with perfect day requirements)`
  )
  console.log(
    `  - The Comfortable Self: Level 20, 42 days, 2500 XP (requires dungeon clears + streaks)`
  )
}

// ===============================================================
// DUNGEON DATA DEFINITIONS
// ===============================================================

interface DungeonData {
  id: string
  name: string
  description: string
  difficulty: 'E_RANK' | 'D_RANK' | 'C_RANK' | 'B_RANK' | 'A_RANK' | 'S_RANK'
  requirements: DungeonRequirement
  challenges: DungeonChallenge[]
  xpMultiplier: number
  durationMinutes: number
  cooldownHours: number
  baseXpReward: number
}

// E-Rank dungeons (Level 3+, 1.5x XP multiplier)
const eRankDungeons: DungeonData[] = [
  {
    id: 'dungeon-morning-protocol',
    name: 'The Morning Protocol',
    description: `UNSTABLE ZONE DETECTED

Entry is optional.
Survival is likely.
Growth is not guaranteed.

Challenge: Complete your workout before 8 AM.
The early hours test discipline, not strength.

Failure here is not weakness.
It is ambition without preparation.`,
    difficulty: 'E_RANK',
    requirements: { levelRequired: 3 },
    challenges: [
      {
        type: 'workout_minutes',
        description: 'Complete at least 30 minutes of exercise',
        target: 30,
      },
      {
        type: 'wake_before',
        description: 'Complete workout before 8:00 AM',
        deadline: '08:00',
      },
    ],
    xpMultiplier: 1.5,
    durationMinutes: 60, // 1 hour window to complete
    cooldownHours: 24,
    baseXpReward: 50,
  },
  {
    id: 'dungeon-step-surge',
    name: 'Step Surge',
    description: `UNSTABLE ZONE DETECTED

Entry is optional.
Survival is likely.
Growth is not guaranteed.

Challenge: Hit 15,000 steps (vs normal 10,000).
Sometimes more is simply... more.

Failure here is not weakness.
It is ambition without preparation.`,
    difficulty: 'E_RANK',
    requirements: { levelRequired: 3 },
    challenges: [
      {
        type: 'steps',
        description: 'Walk 15,000 steps (50% more than daily goal)',
        target: 15000,
      },
    ],
    xpMultiplier: 1.5,
    durationMinutes: 1440, // 24 hours
    cooldownHours: 24,
    baseXpReward: 50,
  },
  {
    id: 'dungeon-clean-fuel',
    name: 'Clean Fuel',
    description: `UNSTABLE ZONE DETECTED

Entry is optional.
Survival is likely.
Growth is not guaranteed.

Challenge: No processed food. Hit your protein target.
What you consume becomes who you are.

Failure here is not weakness.
It is ambition without preparation.`,
    difficulty: 'E_RANK',
    requirements: { levelRequired: 3 },
    challenges: [
      {
        type: 'no_processed_food',
        description: 'Avoid all processed foods for 24 hours',
      },
      {
        type: 'protein',
        description: 'Hit your protein target (100g minimum)',
        target: 100,
      },
    ],
    xpMultiplier: 1.5,
    durationMinutes: 1440, // 24 hours
    cooldownHours: 24,
    baseXpReward: 50,
  },
]

// Function to seed dungeon data
async function seedDungeonData(connectionStr: string) {
  console.log('[SYSTEM] Initializing dungeon database...')

  const dungeonClient = postgres(connectionStr)
  const dungeonDb = drizzle(dungeonClient)

  for (const dungeon of eRankDungeons) {
    await dungeonDb
      .insert(dungeons)
      .values({
        id: dungeon.id,
        name: dungeon.name,
        description: dungeon.description,
        difficulty: dungeon.difficulty,
        requirements: dungeon.requirements,
        challenges: dungeon.challenges,
        xpMultiplier: dungeon.xpMultiplier,
        durationMinutes: dungeon.durationMinutes,
        cooldownHours: dungeon.cooldownHours,
        baseXpReward: dungeon.baseXpReward,
      })
      .onConflictDoNothing()

    console.log(
      `  ✓ Dungeon registered: ${dungeon.name} (${dungeon.difficulty.replace('_', '-')}, ${dungeon.xpMultiplier}x XP)`
    )
    console.log(`    Duration: ${dungeon.durationMinutes} minutes`)
    console.log(`    Cooldown: ${dungeon.cooldownHours} hours`)
    console.log(`    Challenges: ${dungeon.challenges.length}`)
    for (const challenge of dungeon.challenges) {
      console.log(`      - ${challenge.description}`)
    }
  }

  await dungeonClient.end()

  console.log('\n[SYSTEM] Dungeon database initialized successfully.')
  console.log(`  Total dungeons: ${eRankDungeons.length}`)
  console.log(`  E-Rank dungeons: ${eRankDungeons.length}`)
  console.log(`    - The Morning Protocol: Early morning workout challenge`)
  console.log(`    - Step Surge: 15,000 steps challenge (50% above daily)`)
  console.log(`    - Clean Fuel: No processed food + protein target`)
}

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  console.error('DATABASE_URL is required')
  process.exit(1)
}

const client = postgres(connectionString)
const db = drizzle(client)

interface QuestTemplateData {
  id: string  // Explicit ID to prevent duplicates on re-seed
  name: string
  description: string
  type: 'DAILY' | 'WEEKLY' | 'DUNGEON' | 'BOSS'
  category: 'MOVEMENT' | 'STRENGTH' | 'RECOVERY' | 'NUTRITION' | 'DISCIPLINE'
  requirement: RequirementDSL
  baseXP: number
  statType: 'STR' | 'AGI' | 'VIT' | 'DISC'
  statBonus: number
  allowPartial: boolean
  minPartialPercent?: number
  isCore: boolean
}

const coreDailyQuests: QuestTemplateData[] = [
  {
    id: 'core-daily-steps',
    name: 'Daily Steps',
    description: 'Walk 10,000 steps to keep your agility sharp.',
    type: 'DAILY',
    category: 'MOVEMENT',
    requirement: {
      type: 'numeric',
      metric: 'steps',
      operator: 'gte',
      value: 10000,
      unit: 'steps',
    },
    baseXP: 50,
    statType: 'AGI',
    statBonus: 1,
    allowPartial: true,
    minPartialPercent: 50,
    isCore: true,
  },
  {
    id: 'core-workout-complete',
    name: 'Workout Complete',
    description: 'Complete at least 30 minutes of exercise.',
    type: 'DAILY',
    category: 'STRENGTH',
    requirement: {
      type: 'numeric',
      metric: 'workout_minutes',
      operator: 'gte',
      value: 30,
      unit: 'minutes',
    },
    baseXP: 75,
    statType: 'STR',
    statBonus: 2,
    allowPartial: true,
    minPartialPercent: 50,
    isCore: true,
  },
  {
    id: 'core-protein-target',
    name: 'Protein Target',
    description: 'Consume at least 100g of protein today.',
    type: 'DAILY',
    category: 'NUTRITION',
    requirement: {
      type: 'numeric',
      metric: 'protein_grams',
      operator: 'gte',
      value: 100,
      unit: 'grams',
    },
    baseXP: 50,
    statType: 'VIT',
    statBonus: 1,
    allowPartial: true,
    minPartialPercent: 75,
    isCore: true,
  },
  {
    id: 'core-quality-sleep',
    name: 'Quality Sleep',
    description: 'Get at least 7 hours of sleep.',
    type: 'DAILY',
    category: 'RECOVERY',
    requirement: {
      type: 'numeric',
      metric: 'sleep_hours',
      operator: 'gte',
      value: 7,
      unit: 'hours',
    },
    baseXP: 50,
    statType: 'VIT',
    statBonus: 1,
    allowPartial: true,
    minPartialPercent: 70,
    isCore: true,
  },
  {
    id: 'core-alcohol-free',
    name: 'Alcohol-Free Day',
    description: 'No alcohol consumption today. Discipline is key.',
    type: 'DAILY',
    category: 'DISCIPLINE',
    requirement: {
      type: 'boolean',
      metric: 'no_alcohol',
      expected: true,
    },
    baseXP: 40,
    statType: 'DISC',
    statBonus: 1,
    allowPartial: false,
    isCore: true,
  },
]

const bonusDailyQuests: QuestTemplateData[] = [
  {
    id: 'bonus-meditation-session',
    name: 'Meditation Session',
    description: 'Complete a 10-minute meditation session.',
    type: 'DAILY',
    category: 'RECOVERY',
    requirement: {
      type: 'numeric',
      metric: 'meditation_minutes',
      operator: 'gte',
      value: 10,
      unit: 'minutes',
    },
    baseXP: 30,
    statType: 'DISC',
    statBonus: 0,
    allowPartial: false,
    isCore: false,
  },
  {
    id: 'bonus-step-champion',
    name: 'Step Champion',
    description: 'Walk 15,000 steps - go beyond the basics.',
    type: 'DAILY',
    category: 'MOVEMENT',
    requirement: {
      type: 'numeric',
      metric: 'steps',
      operator: 'gte',
      value: 15000,
      unit: 'steps',
    },
    baseXP: 35,
    statType: 'AGI',
    statBonus: 0,
    allowPartial: false,
    isCore: false,
  },
  {
    id: 'bonus-compound-movement',
    name: 'Compound Movement Challenges',
    description: 'Complete full-body circuit under 20min.',
    type: 'DAILY',
    category: 'STRENGTH',
    requirement: {
      type: 'compound',
      operator: 'and',
      requirements: [
        { type: 'boolean', metric: 'workout_completed', expected: true },
        { type: 'numeric', metric: 'workout_minutes', operator: 'lte', value: 20, unit: 'minutes' },
      ],
    },
    baseXP: 35,
    statType: 'STR',
    statBonus: 1,
    allowPartial: false,
    isCore: false,
  },
  {
    id: 'bonus-active-rest',
    name: 'Recovery Days with Active Rest',
    description: 'Active rest: mobility/yoga.',
    type: 'DAILY',
    category: 'STRENGTH',
    requirement: {
      type: 'numeric',
      metric: 'active_rest_minutes',
      operator: 'gte',
      value: 10,
      unit: 'minutes',
    },
    baseXP: 20,
    statType: 'STR',
    statBonus: 1,
    allowPartial: false,
    isCore: false,
  },
  {
    id: 'bonus-interval-training',
    name: 'Interval Training Sessions',
    description: 'HIIT session completed.',
    type: 'DAILY',
    category: 'MOVEMENT',
    requirement: {
      type: 'compound',
      operator: 'and',
      requirements: [
        { type: 'boolean', metric: 'workout_completed', expected: true },
        { type: 'numeric', metric: 'workout_minutes', operator: 'gte', value: 20, unit: 'minutes' },
        { type: 'boolean', metric: 'interval_style', expected: true },
      ],
    },
    baseXP: 30,
    statType: 'AGI',
    statBonus: 1,
    allowPartial: false,
    isCore: false,
  },
  {
    id: 'bonus-daily-mobility',
    name: 'Daily Mobility Routines',
    description: 'Mobility routine done.',
    type: 'DAILY',
    category: 'MOVEMENT',
    requirement: {
      type: 'numeric',
      metric: 'mobility_minutes',
      operator: 'gte',
      value: 10,
      unit: 'minutes',
    },
    baseXP: 15,
    statType: 'AGI',
    statBonus: 0,
    allowPartial: false,
    isCore: false,
  },
  {
    id: 'bonus-active-commuting',
    name: 'Active Commuting',
    description: 'Bike/walk commute.',
    type: 'DAILY',
    category: 'MOVEMENT',
    requirement: {
      type: 'numeric',
      metric: 'commute_active_minutes',
      operator: 'gte',
      value: 20,
      unit: 'minutes',
    },
    baseXP: 20,
    statType: 'AGI',
    statBonus: 1,
    allowPartial: false,
    isCore: false,
  },
  {
    id: 'bonus-hydration-tracking',
    name: 'Hydration Tracking',
    description: 'Hit 100oz water goal.',
    type: 'DAILY',
    category: 'NUTRITION',
    requirement: {
      type: 'numeric',
      metric: 'water_oz',
      operator: 'gte',
      value: 100,
      unit: 'oz',
    },
    baseXP: 15,
    statType: 'VIT',
    statBonus: 0,
    allowPartial: false,
    isCore: false,
  },
  {
    id: 'bonus-sleep-environment',
    name: 'Sleep Environment Optimization',
    description: 'Optimal sleep setup.',
    type: 'DAILY',
    category: 'RECOVERY',
    requirement: {
      type: 'compound',
      operator: 'and',
      requirements: [
        { type: 'numeric', metric: 'sleep_hours', operator: 'gte', value: 8, unit: 'hours' },
        { type: 'boolean', metric: 'environment_optimized', expected: true },
      ],
    },
    baseXP: 20,
    statType: 'VIT',
    statBonus: 1,
    allowPartial: false,
    isCore: false,
  },
  {
    id: 'bonus-supplement-consistency',
    name: 'Supplement Consistency',
    description: 'Take daily supplements.',
    type: 'DAILY',
    category: 'NUTRITION',
    requirement: {
      type: 'boolean',
      metric: 'supplements_taken',
      expected: true,
    },
    baseXP: 10,
    statType: 'VIT',
    statBonus: 0,
    allowPartial: false,
    isCore: false,
  },
  {
    id: 'bonus-morning-routine',
    name: 'Morning Routine Mastery',
    description: 'Early riser routine.',
    type: 'DAILY',
    category: 'DISCIPLINE',
    requirement: {
      type: 'compound',
      operator: 'and',
      requirements: [
        { type: 'boolean', metric: 'wake_early', expected: true },
        { type: 'numeric', metric: 'routine_habits', operator: 'gte', value: 3, unit: 'habits' },
      ],
    },
    baseXP: 25,
    statType: 'DISC',
    statBonus: 1,
    allowPartial: false,
    isCore: false,
  },
  {
    id: 'bonus-habit-stacking',
    name: 'Habit Stacking',
    description: 'Link habit to existing one.',
    type: 'DAILY',
    category: 'DISCIPLINE',
    requirement: {
      type: 'boolean',
      metric: 'habit_stacked',
      expected: true,
    },
    baseXP: 15,
    statType: 'DISC',
    statBonus: 0,
    allowPartial: false,
    isCore: false,
  },
  {
    id: 'bonus-resilience-challenges',
    name: 'Resilience Challenges',
    description: 'Skip one easy out.',
    type: 'DAILY',
    category: 'DISCIPLINE',
    requirement: {
      type: 'boolean',
      metric: 'resistance_practiced',
      expected: true,
    },
    baseXP: 10,
    statType: 'DISC',
    statBonus: 0,
    allowPartial: false,
    isCore: false,
  },
]

const weeklyQuests: QuestTemplateData[] = [
  {
    id: 'weekly-movement-week',
    name: 'Movement Week',
    description: 'Hit your daily step goal 5 out of 7 days this week.',
    type: 'WEEKLY',
    category: 'MOVEMENT',
    requirement: {
      type: 'numeric',
      metric: 'days_with_steps_goal',
      operator: 'gte',
      value: 5,
      unit: 'days',
    },
    baseXP: 75,
    statType: 'AGI',
    statBonus: 2,
    allowPartial: false,
    isCore: false,
  },
  {
    id: 'weekly-perfect-movement',
    name: 'Perfect Movement',
    description: 'Hit your daily step goal every single day this week. No excuses.',
    type: 'WEEKLY',
    category: 'MOVEMENT',
    requirement: {
      type: 'numeric',
      metric: 'days_with_steps_goal',
      operator: 'gte',
      value: 7,
      unit: 'days',
    },
    baseXP: 150,
    statType: 'AGI',
    statBonus: 5,
    allowPartial: false,
    isCore: false,
  },
  {
    id: 'weekly-strength-consistency',
    name: 'Strength Consistency',
    description: 'Complete at least 3 workouts this week.',
    type: 'WEEKLY',
    category: 'STRENGTH',
    requirement: {
      type: 'numeric',
      metric: 'days_with_workout',
      operator: 'gte',
      value: 3,
      unit: 'days',
    },
    baseXP: 50,
    statType: 'STR',
    statBonus: 2,
    allowPartial: false,
    isCore: false,
  },
  {
    id: 'weekly-recovery-focus',
    name: 'Recovery Focus',
    description: 'Hit your protein target 5 out of 7 days this week.',
    type: 'WEEKLY',
    category: 'NUTRITION',
    requirement: {
      type: 'numeric',
      metric: 'days_with_protein_goal',
      operator: 'gte',
      value: 5,
      unit: 'days',
    },
    baseXP: 50,
    statType: 'VIT',
    statBonus: 2,
    allowPartial: false,
    isCore: false,
  },
  {
    id: 'weekly-progressive-overload',
    name: 'Progressive Overload Workouts',
    description: 'Increase resistance in 3/7 workouts this week.',
    type: 'WEEKLY',
    category: 'STRENGTH',
    requirement: {
      type: 'numeric',
      metric: 'workouts_with_overload',
      operator: 'gte',
      value: 3,
      unit: 'workouts',
    },
    baseXP: 30,
    statType: 'STR',
    statBonus: 2,
    allowPartial: false,
    isCore: false,
  },
  {
    id: 'weekly-bodyweight-progression',
    name: 'Bodyweight Progression',
    description: 'Advance push-up level.',
    type: 'WEEKLY',
    category: 'STRENGTH',
    requirement: {
      type: 'boolean',
      metric: 'progression_achieved',
      expected: true,
    },
    baseXP: 50,
    statType: 'STR',
    statBonus: 2,
    allowPartial: false,
    isCore: false,
  },
  {
    id: 'weekly-outdoor-exploration',
    name: 'Outdoor Exploration',
    description: 'New trail hiked.',
    type: 'WEEKLY',
    category: 'MOVEMENT',
    requirement: {
      type: 'compound',
      operator: 'and',
      requirements: [
        { type: 'numeric', metric: 'outdoor_minutes', operator: 'gte', value: 45, unit: 'minutes' },
        { type: 'boolean', metric: 'new_location', expected: true },
      ],
    },
    baseXP: 25,
    statType: 'AGI',
    statBonus: 1,
    allowPartial: false,
    isCore: false,
  },
  {
    id: 'weekly-meal-prep',
    name: 'Meal Prep Sundays',
    description: 'Prep 5 healthy meals.',
    type: 'WEEKLY',
    category: 'NUTRITION',
    requirement: {
      type: 'numeric',
      metric: 'meals_prepped',
      operator: 'gte',
      value: 5,
      unit: 'meals',
    },
    baseXP: 40,
    statType: 'VIT',
    statBonus: 1,
    allowPartial: false,
    isCore: false,
  },
  {
    id: 'weekly-intermittent-fasting',
    name: 'Intermittent Fasting Windows',
    description: 'Maintain 16:8 fasting.',
    type: 'WEEKLY',
    category: 'NUTRITION',
    requirement: {
      type: 'numeric',
      metric: 'fasting_days',
      operator: 'gte',
      value: 3,
      unit: 'days',
    },
    baseXP: 25,
    statType: 'VIT',
    statBonus: 1,
    allowPartial: false,
    isCore: false,
  },
  {
    id: 'weekly-digital-detox',
    name: 'Digital Detox Hours',
    description: 'No screens after 8 PM.',
    type: 'WEEKLY',
    category: 'DISCIPLINE',
    requirement: {
      type: 'numeric',
      metric: 'screen_free_hours',
      operator: 'gte',
      value: 12,
      unit: 'hours',
    },
    baseXP: 30,
    statType: 'DISC',
    statBonus: 1,
    allowPartial: false,
    isCore: false,
  },
  {
    id: 'weekly-accountability-checkins',
    name: 'Accountability Check-ins',
    description: 'Weekly self-review.',
    type: 'WEEKLY',
    category: 'DISCIPLINE',
    requirement: {
      type: 'boolean',
      metric: 'review_completed',
      expected: true,
    },
    baseXP: 20,
    statType: 'DISC',
    statBonus: 1,
    allowPartial: false,
    isCore: false,
  },
]

async function seed() {
  console.log('[SYSTEM] Initializing quest database...')

  const allQuests = [...coreDailyQuests, ...bonusDailyQuests, ...weeklyQuests]

  for (const quest of allQuests) {
    await db
      .insert(questTemplates)
      .values({
        id: quest.id,
        name: quest.name,
        description: quest.description,
        type: quest.type,
        category: quest.category,
        requirement: quest.requirement,
        baseXP: quest.baseXP,
        statType: quest.statType,
        statBonus: quest.statBonus,
        allowPartial: quest.allowPartial,
        minPartialPercent: quest.minPartialPercent ?? 50,
        isCore: quest.isCore,
      })
      .onConflictDoNothing()

    console.log(`  ✓ Quest template created: ${quest.name} (${quest.id})`)
  }

  console.log('\n[SYSTEM] Quest database initialized successfully.')
  console.log(`  Total quest templates: ${allQuests.length}`)
  console.log(`  Core daily quests: ${coreDailyQuests.length}`)
  console.log(`  Bonus quests: ${bonusDailyQuests.length}`)
  console.log(`  Weekly quests: ${weeklyQuests.length}`)

  await client.end()

  // Seed narrative content
  console.log('\n')
  await seedNarrativeContent(connectionString!)

  // Seed titles
  console.log('\n')
  await seedTitlesData(connectionString!)

  // Seed seasons
  console.log('\n')
  await seedSeasonsData(connectionString!)

  // Seed bosses
  console.log('\n')
  await seedBossData()

  // Seed dungeons
  console.log('\n')
  await seedDungeonData(connectionString!)

  // Seed rotating quests
  console.log('\n')
  await seedRotatingQuests(connectionString!)
}

seed().catch((error) => {
  console.error('[SYSTEM ERROR] Seed failed:', error)
  process.exit(1)
})
