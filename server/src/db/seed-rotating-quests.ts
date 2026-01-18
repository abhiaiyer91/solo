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
import { ROTATING_QUEST_IDS } from '../services/rotating-quest'

interface RotatingQuestTemplateData {
  id: string
  name: string
  description: string
  type: 'DAILY'
  category: 'MOVEMENT' | 'STRENGTH' | 'RECOVERY' | 'NUTRITION' | 'DISCIPLINE'
  requirement: RequirementDSL
  baseXP: number
  statType: 'STR' | 'AGI' | 'VIT' | 'DISC'
  statBonus: number
  allowPartial: boolean
  minPartialPercent?: number
  isCore: false
}

/**
 * The rotating quest pool - 15+ quest types
 * Each quest targets a specific stat and has varying difficulty
 */
const rotatingQuestTemplates: RotatingQuestTemplateData[] = [
  // VIT (Vitality) focused quests
  {
    id: ROTATING_QUEST_IDS.HYDRATION,
    name: 'Hydration',
    description: 'Water intake affects everything. Drink 8 glasses today.',
    type: 'DAILY',
    category: 'NUTRITION',
    requirement: {
      type: 'numeric',
      metric: 'water_glasses',
      operator: 'gte',
      value: 8,
      unit: 'glasses',
    },
    baseXP: 15,
    statType: 'VIT',
    statBonus: 1,
    allowPartial: true,
    minPartialPercent: 50,
    isCore: false,
  },
  {
    id: ROTATING_QUEST_IDS.ALCOHOL_FREE,
    name: 'Alcohol-Free',
    description: 'No alcohol consumption today. Discipline over desire.',
    type: 'DAILY',
    category: 'DISCIPLINE',
    requirement: {
      type: 'boolean',
      metric: 'no_alcohol',
      expected: true,
    },
    baseXP: 15,
    statType: 'VIT',
    statBonus: 1,
    allowPartial: false,
    isCore: false,
  },
  {
    id: ROTATING_QUEST_IDS.COLD_EXPOSURE,
    name: 'Cold Exposure',
    description: 'Discomfort is a signal, not a stop sign. Cold shower or ice bath.',
    type: 'DAILY',
    category: 'RECOVERY',
    requirement: {
      type: 'boolean',
      metric: 'cold_exposure',
      expected: true,
    },
    baseXP: 25,
    statType: 'VIT',
    statBonus: 2,
    allowPartial: false,
    isCore: false,
  },
  {
    id: ROTATING_QUEST_IDS.NO_SUGAR,
    name: 'No Added Sugar',
    description: 'Avoid all added sugar today. The body adapts when forced.',
    type: 'DAILY',
    category: 'NUTRITION',
    requirement: {
      type: 'boolean',
      metric: 'no_added_sugar',
      expected: true,
    },
    baseXP: 20,
    statType: 'VIT',
    statBonus: 1,
    allowPartial: false,
    isCore: false,
  },
  {
    id: ROTATING_QUEST_IDS.MEAL_PREP,
    name: 'Meal Prep',
    description: 'Prepare tomorrow\'s meals today. Planning prevents failure.',
    type: 'DAILY',
    category: 'NUTRITION',
    requirement: {
      type: 'boolean',
      metric: 'meal_prep_completed',
      expected: true,
    },
    baseXP: 15,
    statType: 'VIT',
    statBonus: 1,
    allowPartial: false,
    isCore: false,
  },

  // AGI (Agility) focused quests
  {
    id: ROTATING_QUEST_IDS.STRETCH,
    name: 'Stretch Session',
    description: 'Flexibility is functional strength. Complete a 10-minute stretch routine.',
    type: 'DAILY',
    category: 'RECOVERY',
    requirement: {
      type: 'numeric',
      metric: 'stretch_minutes',
      operator: 'gte',
      value: 10,
      unit: 'minutes',
    },
    baseXP: 15,
    statType: 'AGI',
    statBonus: 1,
    allowPartial: true,
    minPartialPercent: 50,
    isCore: false,
  },
  {
    id: ROTATING_QUEST_IDS.MORNING_MOVEMENT,
    name: 'Morning Movement',
    description: 'Start the day with 10 minutes of activity before 9 AM.',
    type: 'DAILY',
    category: 'MOVEMENT',
    requirement: {
      type: 'compound',
      operator: 'and',
      requirements: [
        {
          type: 'numeric',
          metric: 'morning_activity_minutes',
          operator: 'gte',
          value: 10,
          unit: 'minutes',
        },
        {
          type: 'boolean',
          metric: 'activity_before_9am',
          expected: true,
        },
      ],
    },
    baseXP: 20,
    statType: 'AGI',
    statBonus: 1,
    allowPartial: false,
    isCore: false,
  },
  {
    id: ROTATING_QUEST_IDS.SOCIAL_MOVEMENT,
    name: 'Social Movement',
    description: 'Exercise with someone today. Accountability strengthens commitment.',
    type: 'DAILY',
    category: 'MOVEMENT',
    requirement: {
      type: 'boolean',
      metric: 'social_exercise',
      expected: true,
    },
    baseXP: 25,
    statType: 'AGI',
    statBonus: 2,
    allowPartial: false,
    isCore: false,
  },
  {
    id: ROTATING_QUEST_IDS.NATURE_TIME,
    name: 'Nature Time',
    description: 'Spend 20 minutes outdoors. The environment shapes the mind.',
    type: 'DAILY',
    category: 'MOVEMENT',
    requirement: {
      type: 'numeric',
      metric: 'outdoor_minutes',
      operator: 'gte',
      value: 20,
      unit: 'minutes',
    },
    baseXP: 15,
    statType: 'AGI',
    statBonus: 1,
    allowPartial: true,
    minPartialPercent: 50,
    isCore: false,
  },
  {
    id: ROTATING_QUEST_IDS.WALKING_MEETING,
    name: 'Walking Meeting',
    description: 'Walk during a call or meeting. Movement and productivity can coexist.',
    type: 'DAILY',
    category: 'MOVEMENT',
    requirement: {
      type: 'boolean',
      metric: 'walking_meeting',
      expected: true,
    },
    baseXP: 20,
    statType: 'AGI',
    statBonus: 1,
    allowPartial: false,
    isCore: false,
  },

  // DISC (Discipline) focused quests
  {
    id: ROTATING_QUEST_IDS.SCREEN_SUNSET,
    name: 'Screen Sunset',
    description: 'No screens after 9 PM. Blue light disrupts recovery.',
    type: 'DAILY',
    category: 'DISCIPLINE',
    requirement: {
      type: 'boolean',
      metric: 'no_screens_after_9pm',
      expected: true,
    },
    baseXP: 15,
    statType: 'DISC',
    statBonus: 1,
    allowPartial: false,
    isCore: false,
  },
  {
    id: ROTATING_QUEST_IDS.MEDITATION,
    name: 'Meditation',
    description: 'The mind requires training. Complete a 5-minute meditation session.',
    type: 'DAILY',
    category: 'RECOVERY',
    requirement: {
      type: 'numeric',
      metric: 'meditation_minutes',
      operator: 'gte',
      value: 5,
      unit: 'minutes',
    },
    baseXP: 15,
    statType: 'DISC',
    statBonus: 1,
    allowPartial: false,
    isCore: false,
  },
  {
    id: ROTATING_QUEST_IDS.GRATITUDE_LOG,
    name: 'Gratitude Log',
    description: 'Write 3 things you are grateful for. Perspective shapes performance.',
    type: 'DAILY',
    category: 'DISCIPLINE',
    requirement: {
      type: 'numeric',
      metric: 'gratitude_items',
      operator: 'gte',
      value: 3,
      unit: 'items',
    },
    baseXP: 10,
    statType: 'DISC',
    statBonus: 1,
    allowPartial: false,
    isCore: false,
  },
  {
    id: ROTATING_QUEST_IDS.DEEP_WORK,
    name: 'Deep Work',
    description: 'Complete a 90-minute focused work block. No interruptions.',
    type: 'DAILY',
    category: 'DISCIPLINE',
    requirement: {
      type: 'numeric',
      metric: 'deep_work_minutes',
      operator: 'gte',
      value: 90,
      unit: 'minutes',
    },
    baseXP: 20,
    statType: 'DISC',
    statBonus: 1,
    allowPartial: true,
    minPartialPercent: 60,
    isCore: false,
  },

  // STR (Strength) focused quests
  {
    id: ROTATING_QUEST_IDS.POSTURE_CHECK,
    name: 'Posture Check',
    description: 'Complete 5 minutes of posture correction exercises.',
    type: 'DAILY',
    category: 'STRENGTH',
    requirement: {
      type: 'numeric',
      metric: 'posture_exercise_minutes',
      operator: 'gte',
      value: 5,
      unit: 'minutes',
    },
    baseXP: 10,
    statType: 'STR',
    statBonus: 1,
    allowPartial: false,
    isCore: false,
  },
]

/**
 * Seed rotating quest templates into the database
 */
export async function seedRotatingQuests(connectionStr: string) {
  console.log('[SYSTEM] Initializing rotating quest database...')

  const client = postgres(connectionStr)
  const db = drizzle(client)

  for (const quest of rotatingQuestTemplates) {
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

    console.log(`  ✓ Rotating quest template created: ${quest.name} (${quest.statType}, ${quest.baseXP} XP)`)
  }

  await client.end()

  console.log('\n[SYSTEM] Rotating quest database initialized successfully.')
  console.log(`  Total rotating quest templates: ${rotatingQuestTemplates.length}`)
  console.log(`  VIT quests: ${rotatingQuestTemplates.filter((q) => q.statType === 'VIT').length}`)
  console.log(`  AGI quests: ${rotatingQuestTemplates.filter((q) => q.statType === 'AGI').length}`)
  console.log(`  DISC quests: ${rotatingQuestTemplates.filter((q) => q.statType === 'DISC').length}`)
  console.log(`  STR quests: ${rotatingQuestTemplates.filter((q) => q.statType === 'STR').length}`)
}

// Run if executed directly
const connectionString = process.env.DATABASE_URL
if (connectionString && import.meta.url === `file://${process.argv[1]}`) {
  seedRotatingQuests(connectionString)
    .then(() => {
      console.log('\n[SYSTEM] Rotating quest seed complete.')
      process.exit(0)
    })
    .catch((error) => {
      console.error('[SYSTEM ERROR] Rotating quest seed failed:', error)
      process.exit(1)
    })
}
