/**
 * Lore Service
 * Manages lore fragment unlocks and retrieval
 */

import { eq, and, desc } from 'drizzle-orm'
import { dbClient as db } from '../db'

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

export interface LoreFragment {
  id: string
  key: string
  title: string
  content: string
  unlockConditionType: LoreUnlockCondition
  unlockConditionValue: number | string
  order: number
}

export type LoreUnlockCondition =
  | 'level'
  | 'streak_days'
  | 'boss_defeated'
  | 'all_bosses'
  | 'season'
  | 'first_boss'

export interface PlayerLoreUnlock {
  fragmentId: string
  unlockedAt: string
}

export interface LoreWithStatus extends LoreFragment {
  isUnlocked: boolean
  unlockedAt?: string
  fragmentNumber: number
  totalFragments: number
}

// ═══════════════════════════════════════════════════════════
// LORE DEFINITIONS
// ═══════════════════════════════════════════════════════════

export const LORE_FRAGMENTS: LoreFragment[] = [
  {
    id: 'lore-selection',
    key: 'the_selection',
    title: 'The Selection',
    content: `You believe you found the System.

The System was already watching.

Long before you created an account,
before the thought even formed—
the patterns were observed.

The System does not accept everyone.
Only those who have failed enough
to be ready to stop failing.

You qualified.

Whether that is a compliment
remains to be determined.`,
    unlockConditionType: 'level',
    unlockConditionValue: 5,
    order: 1,
  },
  {
    id: 'lore-others',
    key: 'the_others',
    title: 'The Others',
    content: `You are not the first.

Others have stood where you stand.
Level 10. Double digits.
Feeling the shift from experiment
to something more permanent.

Some continued.
They are still here, somewhere ahead of you.

Some did not.
Their records remain in the System.
Incomplete. Paused. Abandoned.

The System does not delete data.
It only waits to see if it continues.`,
    unlockConditionType: 'level',
    unlockConditionValue: 10,
    order: 2,
  },
  {
    id: 'lore-bosses',
    key: 'the_nature_of_bosses',
    title: 'The Nature of Bosses',
    content: `The bosses you fight are not external.

They are echoes.
Patterns extracted from your own history.
Behaviors that have defeated you before,
given form and name.

The Inconsistent One is not imagination.
It is memory.
Your memory.

Every boss you defeat
is a version of yourself
you no longer wish to be.

The System did not create your enemies.
The System only named them.`,
    unlockConditionType: 'level',
    unlockConditionValue: 15,
    order: 3,
  },
  {
    id: 'lore-purpose',
    key: 'the_purpose',
    title: 'The Purpose',
    content: `You have reached Level 20.

At this level, you are stronger than
90% of people who ever downloaded
a fitness app.

The System was not created to make you exercise.
Exercise apps exist. They fail at scale.

The System was created to answer a question:

Can a human being, given enough structure
and honest observation,
overcome the patterns that limit them?

You are part of that answer.
The data continues to accumulate.`,
    unlockConditionType: 'level',
    unlockConditionValue: 20,
    order: 4,
  },
  {
    id: 'lore-pattern',
    key: 'the_pattern',
    title: 'The Pattern',
    content: `30 days is not arbitrary.

The human nervous system begins to rewire
around day 21.
By day 30, the behavior becomes preference,
not effort.

You are experiencing this now.
The days you don't complete your quests
feel wrong.
Incomplete.
Like forgetting something important.

This is not willpower.
This is architecture.

You are building a different mind.`,
    unlockConditionType: 'streak_days',
    unlockConditionValue: 30,
    order: 5,
  },
  {
    id: 'lore-internal-war',
    key: 'the_internal_war',
    title: 'The Internal War',
    content: `You have defeated your first boss.

This is the secret the System does not advertise:

There is no external enemy.
No final villain to defeat.
No antagonist with a face.

The only war that matters
is the one inside your own mind.
Between who you have been
and who you are becoming.

Every day you show up is a battle won.
Every quest completed is territory gained.
Every streak is a supply line secured.

The bosses are just the generals
of the army within.

Defeat them all,
and you rule yourself.`,
    unlockConditionType: 'first_boss',
    unlockConditionValue: 'any',
    order: 6,
  },
  {
    id: 'lore-final-boss',
    key: 'the_final_boss',
    title: 'The Final Boss',
    content: `You have defeated all three bosses.

The Inconsistent One.
The Excuse Maker.
The Comfortable Self.

There is one more.

The Final Boss is not yet available.
It requires something the System
cannot verify externally:

Total commitment.

When you are ready—
truly ready, not enthusiastically ready—
the System will know.

And the Final Boss will appear.

It has a name.
But you already know it.

It is the version of you
that still does not believe
any of this is real.`,
    unlockConditionType: 'all_bosses',
    unlockConditionValue: 3,
    order: 7,
  },
  {
    id: 'lore-truth',
    key: 'the_truth',
    title: 'The Truth',
    content: `Level 30.

The System will share one final truth:

There is no System.

There is only you,
watching yourself,
through a mirror you built.

The cold voice?
It is your own voice,
stripped of self-deception.

The observations?
Data you always had access to,
finally organized.

The bosses?
Enemies you named long ago,
finally faced.

The System was never external.
The System was always you,
waiting to be honest with yourself.

Congratulations.
You have met yourself.

Continue.`,
    unlockConditionType: 'level',
    unlockConditionValue: 30,
    order: 8,
  },
]

// ═══════════════════════════════════════════════════════════
// SERVICE FUNCTIONS
// ═══════════════════════════════════════════════════════════

/**
 * Get all lore fragments with unlock status for a player
 */
export async function getAllLoreWithStatus(
  userId: string,
  playerData: {
    level: number
    currentStreak: number
    defeatedBossCount: number
    hasDefeatedAnyBoss: boolean
  }
): Promise<LoreWithStatus[]> {
  // In a real implementation, we'd query a loreUnlocks table
  // For now, calculate unlock status based on player data
  
  const totalFragments = LORE_FRAGMENTS.length

  return LORE_FRAGMENTS.map((fragment, index) => {
    const isUnlocked = checkUnlockCondition(fragment, playerData)
    
    return {
      ...fragment,
      isUnlocked,
      unlockedAt: isUnlocked ? new Date().toISOString() : undefined, // Would come from DB
      fragmentNumber: index + 1,
      totalFragments,
    }
  }).sort((a, b) => a.order - b.order)
}

/**
 * Check if a lore fragment should be unlocked
 */
function checkUnlockCondition(
  fragment: LoreFragment,
  playerData: {
    level: number
    currentStreak: number
    defeatedBossCount: number
    hasDefeatedAnyBoss: boolean
  }
): boolean {
  switch (fragment.unlockConditionType) {
    case 'level':
      return playerData.level >= (fragment.unlockConditionValue as number)
    
    case 'streak_days':
      return playerData.currentStreak >= (fragment.unlockConditionValue as number)
    
    case 'first_boss':
      return playerData.hasDefeatedAnyBoss
    
    case 'all_bosses':
      return playerData.defeatedBossCount >= (fragment.unlockConditionValue as number)
    
    default:
      return false
  }
}

/**
 * Get newly unlocked lore fragments (for triggering reveal)
 */
export async function getNewlyUnlockedLore(
  userId: string,
  previousUnlocks: string[],
  playerData: {
    level: number
    currentStreak: number
    defeatedBossCount: number
    hasDefeatedAnyBoss: boolean
  }
): Promise<LoreFragment[]> {
  const allLore = await getAllLoreWithStatus(userId, playerData)
  
  return allLore
    .filter((lore) => lore.isUnlocked && !previousUnlocks.includes(lore.id))
}

/**
 * Record that a player has seen a lore fragment
 */
export async function markLoreSeen(
  userId: string,
  fragmentId: string
): Promise<void> {
  // In a real implementation, this would insert into loreUnlocks table
  // For now, this is a placeholder
  console.log(`Marking lore ${fragmentId} as seen by user ${userId}`)
}

/**
 * Get a single lore fragment by ID
 */
export function getLoreFragment(id: string): LoreFragment | undefined {
  return LORE_FRAGMENTS.find((f) => f.id === id)
}

/**
 * Get unlock condition text for display
 */
export function getUnlockConditionText(fragment: LoreFragment): string {
  switch (fragment.unlockConditionType) {
    case 'level':
      return `Reach Level ${fragment.unlockConditionValue}`
    case 'streak_days':
      return `Achieve a ${fragment.unlockConditionValue}-day streak`
    case 'first_boss':
      return 'Defeat your first boss'
    case 'all_bosses':
      return 'Defeat all bosses'
    case 'season':
      return `Complete Season ${fragment.unlockConditionValue}`
    default:
      return 'Unknown condition'
  }
}
