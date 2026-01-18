import { config } from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

config({ path: resolve(__dirname, '../../../.env') })

import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { seasons, type SeasonContentConfig } from './schema/seasons'

interface SeasonData {
  number: number
  name: string
  theme: string
  description: string
  xpMultiplier: number
  levelRequirement: number | null
  dayRequirement: number | null
  status: 'UPCOMING' | 'ACTIVE' | 'ENDED'
  introNarrative: string
  outroNarrative: string
  contentConfig: SeasonContentConfig
}

const seedSeasons: SeasonData[] = [
  {
    number: 1,
    name: 'Awakening',
    theme: 'FOUNDATION',
    description: 'You learn the cost of inaction. The System reveals what neglect has hidden.',
    xpMultiplier: 1.0,
    levelRequirement: 15, // Transition at level 15
    dayRequirement: 60, // Or day 60
    status: 'ACTIVE', // First season is active by default
    introNarrative: `SEASON 1: AWAKENING

A dormant capability has been detected.

Physical output: underdeveloped
Recovery capacity: unstable
Discipline coefficient: unknown

This season exists to establish baselines.
To reveal what neglect has hidden.
To make visible what comfort has obscured.

You will not be pushed.
You will simply be measured.`,
    outroNarrative: `SEASON 1 COMPLETE: AWAKENING

You came here asleep.
You are no longer asleep.

What you do with this awareness
is not the System's concern.

SEASON 2 BEGINS: THE CONTENDER`,
    contentConfig: {
      dungeonRanks: ['E_RANK', 'D_RANK'],
      bossesAvailable: [],
      titlesAvailable: ['basic'],
      hasLeaderboard: false,
    },
  },
  {
    number: 2,
    name: 'The Contender',
    theme: 'CHALLENGE',
    description: 'You stop negotiating with yourself. Excuses become visible lies.',
    xpMultiplier: 1.1,
    levelRequirement: 25, // Transition at level 25
    dayRequirement: 120, // Or day 120 (60 days in this season)
    status: 'UPCOMING',
    introNarrative: `SEASON 2: THE CONTENDER

Foundation detected.
Capacity confirmed.

This season exists to test what was built.
To reveal the difference between
what you say and what you do.

Excuses will become visible.
Negotiations will fail.
The System does not bargain.

You will contend with yourself.
Or you will not.`,
    outroNarrative: `SEASON 2 COMPLETE: THE CONTENDER

The excuses are gone.
The negotiations have ended.

You have proven that foundation
was not accidental.

SEASON 3 BEGINS: THE MONARCH`,
    contentConfig: {
      dungeonRanks: ['C_RANK', 'B_RANK'],
      bossesAvailable: [1, 2],
      titlesAvailable: ['intermediate'],
      hasLeaderboard: true,
    },
  },
  {
    number: 3,
    name: 'The Monarch',
    theme: 'MASTERY',
    description: 'You choose when to push — and when not to. Control replaces compulsion.',
    xpMultiplier: 1.2,
    levelRequirement: null, // Final season, no level transition
    dayRequirement: null, // No day transition
    status: 'UPCOMING',
    introNarrative: `SEASON 3: THE MONARCH

Compulsion has been replaced.
Discipline is no longer forced.

This season exists for those who
no longer need external structure.
Who choose the hard path
when the easy path is available.

You will not be commanded.
You will command yourself.

The System watches.
It does not rule.`,
    outroNarrative: `THE MONARCH CONTINUES

There is no ending here.
Only continuation.

The System has nothing left to teach.
You are your own authority now.`,
    contentConfig: {
      dungeonRanks: ['A_RANK', 'S_RANK'],
      bossesAvailable: [1, 2, 3],
      titlesAvailable: ['legacy'],
      hasLeaderboard: true,
    },
  },
]

export async function seedSeasonsData(connectionString: string) {
  console.log('[SYSTEM] Initializing season database...')

  const client = postgres(connectionString)
  const db = drizzle(client)

  for (const season of seedSeasons) {
    await db
      .insert(seasons)
      .values({
        number: season.number,
        name: season.name,
        theme: season.theme,
        description: season.description,
        xpMultiplier: season.xpMultiplier,
        levelRequirement: season.levelRequirement,
        dayRequirement: season.dayRequirement,
        status: season.status,
        introNarrative: season.introNarrative,
        outroNarrative: season.outroNarrative,
        contentConfig: season.contentConfig,
      })
      .onConflictDoNothing()

    console.log(`  ✓ Season created: ${season.name} (${season.xpMultiplier}x XP)`)
  }

  console.log('\n[SYSTEM] Season database initialized successfully.')
  console.log(`  Total seasons: ${seedSeasons.length}`)

  await client.end()
}
