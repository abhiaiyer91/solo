/**
 * Boss Definitions
 * Complete definitions for all bosses including new ones
 */

export interface BossPhase {
  id: string
  name: string
  description: string
  duration: number // days
  requirements: string[]
}

export interface BossDefinition {
  id: string
  name: string
  unlockLevel: number
  prerequisite?: string // Boss ID that must be defeated first
  duration: number // Total days
  xpReward: number
  titleReward: string
  titleId: string
  phases: BossPhase[]
  mechanics: BossMechanic[]
  narrative: BossNarrative
}

export interface BossMechanic {
  type: 'completion_rate' | 'exceed_targets' | 'time_based' | 'precision' | 'consistency'
  description: string
  params: Record<string, number | string>
}

export interface BossNarrative {
  intro: string
  phaseIntros: string[]
  defeat: string
  failure: string
  encouragement: string
}

export const BOSS_DEFINITIONS: BossDefinition[] = [
  // Existing Boss 1
  {
    id: 'the-inconsistent-one',
    name: 'The Inconsistent One',
    unlockLevel: 5,
    duration: 21,
    xpReward: 500,
    titleReward: 'The Consistent',
    titleId: 'title-consistent',
    phases: [
      { id: 'phase1', name: 'Recognition', description: 'Complete 5 out of 7 days', duration: 7, requirements: ['5/7 days complete'] },
      { id: 'phase2', name: 'Resistance', description: 'Complete 6 out of 7 days', duration: 7, requirements: ['6/7 days complete'] },
      { id: 'phase3', name: 'Dominance', description: 'Complete all 7 days', duration: 7, requirements: ['7/7 days complete'] },
    ],
    mechanics: [
      { type: 'completion_rate', description: 'Increasing daily completion requirements', params: { minRate: 0.7, phase1: 0.71, phase2: 0.86, phase3: 1.0 } },
    ],
    narrative: {
      intro: 'You know this enemy. It wears your face when you skip "just one day." It whispers that missing once won\'t matter. I am the gap between who you say you are and what you actually do.',
      phaseIntros: [
        'Phase 1: Recognition. For the next 7 days, prove you can show up more often than not.',
        'Phase 2: Resistance. Consistency increases. 6 of the next 7 days. The margin shrinks.',
        'Phase 3: Dominance. Every day. No exceptions. 7 consecutive days of completion.',
      ],
      defeat: 'THE INCONSISTENT ONE — DEFEATED\n\nThe pattern that once controlled you has been named and overcome. This is not the end. Inconsistency will return in new forms. But now you know its face.\n\nTITLE EARNED: The Consistent',
      failure: 'The pattern reasserts itself. The Inconsistent One remains. Rest. Then return.',
      encouragement: 'The fight continues. Every completed day is damage dealt.',
    },
  },

  // New Boss: The Negotiator
  {
    id: 'the-negotiator',
    name: 'The Negotiator',
    unlockLevel: 12,
    prerequisite: 'the-excuse-maker',
    duration: 21,
    xpReward: 750,
    titleReward: 'The Uncompromising',
    titleId: 'title-uncompromising',
    phases: [
      { id: 'phase1', name: 'Recognition', description: 'Observe the negotiation pattern', duration: 7, requirements: ['Track completion precision'] },
      { id: 'phase2', name: 'Precision', description: 'Zero tolerance for "close enough"', duration: 7, requirements: ['100% completion on 5/7 days'] },
      { id: 'phase3', name: 'Excellence', description: 'Exceed minimums by 10%+', duration: 7, requirements: ['Exceed targets on 3+ days'] },
    ],
    mechanics: [
      { type: 'precision', description: 'No partial credit allowed', params: { minCompletion: 1.0 } },
      { type: 'exceed_targets', description: 'Must exceed targets by 10%', params: { exceedPercent: 10, requiredDays: 3 } },
    ],
    narrative: {
      intro: `You've met me before.
I'm the voice that says 'close enough.'
8,000 steps when you needed 10,000.
Four days when you promised yourself seven.

I am every corner you've ever cut.
Every standard you've lowered.
Every time 'good enough' became the goal.

I am not your enemy.
I am your architect.
I've built your ceiling lower than you know.`,
      phaseIntros: [
        'PHASE 1: RECOGNITION\n\nFor the next 7 days, the System will track not just completion—but precision.\n\nHow many times do you negotiate with yourself? Let\'s count.',
        'PHASE 2: PRECISION\n\n7 days of observation complete. The negotiation patterns are documented.\n\nNow, zero tolerance. 100% means 100%. 10,000 steps means 10,000 steps. Not 9,847. Not \'basically there.\'\n\nThe System will not round up.',
        'PHASE 3: EXCELLENCE\n\nPrecision is not enough. You\'ve learned to hit targets. Now learn to exceed them.\n\nMinimums are for beginners. You are no longer a beginner.\n\nExceed your targets. By design, not accident.',
      ],
      defeat: `THE NEGOTIATOR — DEFEATED

The voice that said 'close enough' has been silenced.

Not forever.
It will return, quieter, at unexpected moments.
But now you will recognize it.
Now you know its cost.

TITLE EARNED: The Uncompromising
SHADOW EXTRACTED: The Negotiator

New ability: You will feel discomfort when cutting corners.
That discomfort is the scar of this battle.`,
      failure: 'The Negotiator persists. Standards slip back to "good enough." Rest. Recommit. Return.',
      encouragement: 'Precision is power. Every exact completion is a blow struck.',
    },
  },

  // New Boss: The Tomorrow
  {
    id: 'the-tomorrow',
    name: 'The Tomorrow',
    unlockLevel: 8,
    prerequisite: 'the-inconsistent-one',
    duration: 14,
    xpReward: 600,
    titleReward: 'The Present',
    titleId: 'title-present',
    phases: [
      { id: 'phase1', name: 'Awareness', description: 'Recognize the procrastination pattern', duration: 7, requirements: ['Track completion times'] },
      { id: 'phase2', name: 'Action', description: 'Complete one quest before noon daily', duration: 7, requirements: ['Pre-noon completion on 6/7 days'] },
    ],
    mechanics: [
      { type: 'time_based', description: 'Must complete at least one quest before noon', params: { deadline: '12:00', requiredDays: 6 } },
    ],
    narrative: {
      intro: `Don't worry about me.
I'll still be here tomorrow.
And the day after.
And the day after that.

I have infinite patience.
You do not.

Every time you've said 'I'll start fresh on Monday'—
that was me.

Every time you pushed the workout to 'later' until
later became never—
that was me.

I am not your enemy.
I am your favorite excuse.
And I've been winning for years.`,
      phaseIntros: [
        'PHASE 1: AWARENESS\n\nFor the next 7 days, the System will track when you act, not just whether you act.\n\nHow often does \'later\' become \'never\'? The data will tell.',
        'PHASE 2: ACTION\n\nThe pattern is clear now. The mornings you act, the days succeed. The mornings you wait, the days slip away.\n\nNew requirement: One quest completed before noon. Every day. No exceptions.\n\nTomorrow doesn\'t count. Only today.',
      ],
      defeat: `THE TOMORROW — DEFEATED

The voice that promised 'later' has been silenced.

Later never comes.
Only now comes.
You've proven you understand this.

TITLE EARNED: The Present
SHADOW EXTRACTED: The Tomorrow

New ability: When you hear 'I'll do it tomorrow,'
you will feel the lie.
That awareness is your weapon.`,
      failure: 'The Tomorrow endures. The mornings slip by again. Rest. Then act immediately upon waking.',
      encouragement: 'Morning action compounds. Each early completion weakens the pattern.',
    },
  },
]

/**
 * Get boss definition by ID
 */
export function getBossDefinition(id: string): BossDefinition | undefined {
  return BOSS_DEFINITIONS.find((b) => b.id === id)
}

/**
 * Get bosses available for a player
 */
export function getAvailableBosses(
  playerLevel: number,
  defeatedBosses: string[]
): BossDefinition[] {
  return BOSS_DEFINITIONS.filter((boss) => {
    // Check level requirement
    if (playerLevel < boss.unlockLevel) return false
    
    // Check prerequisite
    if (boss.prerequisite && !defeatedBosses.includes(boss.prerequisite)) return false
    
    // Already defeated
    if (defeatedBosses.includes(boss.id)) return false
    
    return true
  })
}

/**
 * Get all bosses with unlock status
 */
export function getAllBossesWithStatus(
  playerLevel: number,
  defeatedBosses: string[],
  activeBoss?: string
): Array<BossDefinition & { status: 'locked' | 'available' | 'active' | 'defeated' }> {
  return BOSS_DEFINITIONS.map((boss) => {
    let status: 'locked' | 'available' | 'active' | 'defeated'
    
    if (defeatedBosses.includes(boss.id)) {
      status = 'defeated'
    } else if (activeBoss === boss.id) {
      status = 'active'
    } else if (playerLevel >= boss.unlockLevel && (!boss.prerequisite || defeatedBosses.includes(boss.prerequisite))) {
      status = 'available'
    } else {
      status = 'locked'
    }
    
    return { ...boss, status }
  })
}
