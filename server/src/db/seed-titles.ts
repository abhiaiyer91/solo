import { config } from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

config({ path: resolve(__dirname, '../../../.env') })

import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { titles, type TitleConditionConfig, type TitleRegressionConfig } from './schema/titles'

interface TitleData {
  name: string
  description: string
  rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'
  conditionType: 'STREAK_DAYS' | 'CUMULATIVE_COUNT' | 'TIME_WINDOW' | 'EVENT_COUNT' | 'COMPOUND' | 'SPECIAL'
  conditionConfig: TitleConditionConfig
  passiveType?: 'FLAT_XP_BONUS' | 'PERCENT_XP_BONUS' | 'STAT_BONUS' | 'DEBUFF_REDUCTION'
  passiveValue?: number
  passiveStat?: 'STR' | 'AGI' | 'VIT' | 'DISC'
  systemMessage?: string
  canRegress?: boolean
  regressionConfig?: TitleRegressionConfig
}

const seedTitles: TitleData[] = [
  {
    name: 'The Beginner',
    description: 'Every journey begins with a single step. This title marks your awakening.',
    rarity: 'COMMON',
    conditionType: 'SPECIAL',
    conditionConfig: { type: 'SPECIAL', specialType: 'ACCOUNT_CREATION' },
    systemMessage: 'Initial classification assigned.',
  },
  {
    name: 'The Consistent',
    description: 'Two weeks of unbroken discipline. The System notes your dedication.',
    rarity: 'UNCOMMON',
    conditionType: 'STREAK_DAYS',
    conditionConfig: { type: 'STREAK_DAYS', days: 14 },
    passiveType: 'PERCENT_XP_BONUS',
    passiveValue: 5,
    systemMessage: 'Consistency detected. Classification updated.',
    canRegress: true,
    regressionConfig: { trigger: 'STREAK_BREAK' },
  },
  {
    name: 'The Walker',
    description: 'Sixty days of step goals achieved. Your locomotion patterns are normalized.',
    rarity: 'UNCOMMON',
    conditionType: 'CUMULATIVE_COUNT',
    conditionConfig: { type: 'CUMULATIVE_COUNT', metric: 'steps_goals', count: 60 },
    passiveType: 'FLAT_XP_BONUS',
    passiveValue: 3,
    systemMessage: 'Locomotion pattern normalized.',
  },
  {
    name: 'Early Riser',
    description: 'Twenty-one days of waking on time. Morning dominance established.',
    rarity: 'UNCOMMON',
    conditionType: 'CUMULATIVE_COUNT',
    conditionConfig: { type: 'CUMULATIVE_COUNT', metric: 'wake_on_time', count: 21 },
    passiveType: 'FLAT_XP_BONUS',
    passiveValue: 2,
    systemMessage: 'Morning dominance established.',
  },
  {
    name: 'Alcohol Slayer',
    description: 'Thirty consecutive days without alcohol. Substance independence confirmed.',
    rarity: 'RARE',
    conditionType: 'TIME_WINDOW',
    conditionConfig: { type: 'TIME_WINDOW', metric: 'alcohol_free_days', count: 30, windowDays: 30 },
    passiveType: 'STAT_BONUS',
    passiveValue: 2,
    passiveStat: 'VIT',
    systemMessage: 'Substance independence confirmed.',
    canRegress: true,
    regressionConfig: { trigger: 'TIME_WINDOW_FAIL', threshold: 3, windowDays: 7 },
  },
  {
    name: 'Iron Will',
    description: 'A thirty-day streak. Your willpower coefficient exceeds baseline.',
    rarity: 'EPIC',
    conditionType: 'STREAK_DAYS',
    conditionConfig: { type: 'STREAK_DAYS', days: 30 },
    passiveType: 'DEBUFF_REDUCTION',
    passiveValue: 50, // 50% reduction
    systemMessage: 'Willpower coefficient exceeds baseline.',
  },
  {
    name: 'Centurion',
    description: 'One hundred workouts completed. A century milestone achieved.',
    rarity: 'EPIC',
    conditionType: 'CUMULATIVE_COUNT',
    conditionConfig: { type: 'CUMULATIVE_COUNT', metric: 'workout_completions', count: 100 },
    passiveType: 'STAT_BONUS',
    passiveValue: 5,
    passiveStat: 'STR',
    systemMessage: 'Century milestone achieved.',
  },
  {
    name: 'Boss Slayer',
    description: 'Three boss encounters defeated. Boss elimination confirmed.',
    rarity: 'LEGENDARY',
    conditionType: 'EVENT_COUNT',
    conditionConfig: { type: 'EVENT_COUNT', event: 'boss_defeat', count: 3 },
    passiveType: 'PERCENT_XP_BONUS',
    passiveValue: 10,
    systemMessage: 'Boss elimination confirmed.',
  },
]

export async function seedTitlesData(connectionString: string) {
  console.log('[SYSTEM] Initializing title database...')

  const client = postgres(connectionString)
  const db = drizzle(client)

  for (const title of seedTitles) {
    await db
      .insert(titles)
      .values({
        name: title.name,
        description: title.description,
        rarity: title.rarity,
        conditionType: title.conditionType,
        conditionConfig: title.conditionConfig,
        passiveType: title.passiveType ?? null,
        passiveValue: title.passiveValue ?? null,
        passiveStat: title.passiveStat ?? null,
        systemMessage: title.systemMessage ?? null,
        canRegress: title.canRegress ?? false,
        regressionConfig: title.regressionConfig ?? null,
      })
      .onConflictDoNothing()

    console.log(`  ✓ Title created: ${title.name} (${title.rarity})`)
  }

  console.log('\n[SYSTEM] Title database initialized successfully.')
  console.log(`  Total titles: ${seedTitles.length}`)

  await client.end()
}
