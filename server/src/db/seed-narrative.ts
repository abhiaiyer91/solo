import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { narrativeContents } from './schema/game'

type NarrativeCategory =
  | 'ONBOARDING'
  | 'SYSTEM_MESSAGE'
  | 'DAILY_QUEST'
  | 'DEBUFF'
  | 'DUNGEON'
  | 'BOSS'
  | 'TITLE'
  | 'SEASON'
  | 'LEVEL_UP'
  | 'DAILY_REMINDER'

interface NarrativeContentData {
  key: string
  category: NarrativeCategory
  content: string
  context?: Record<string, unknown>
}

// P0 Narrative Content - Critical Path (~32 items)

const onboardingContent: NarrativeContentData[] = [
  {
    key: 'onboarding.detection',
    category: 'ONBOARDING',
    content: `A dormant capability has been detected.

Physical output: underdeveloped
Recovery capacity: unstable
Discipline coefficient: unknown

You have been granted access to the System.`,
  },
  {
    key: 'onboarding.terms',
    category: 'ONBOARDING',
    content: `The System does not motivate.
The System does not encourage.
The System does not forgive.

The System records.
The System calculates.
The System presents.

What you do with the data is not the System's concern.`,
  },
  {
    key: 'onboarding.accept',
    category: 'ONBOARDING',
    content: `This is not a game.

There will be no rewards for showing up.
There will be consequences for not.

The System awaits your decision.`,
  },
  {
    key: 'onboarding.first_quests',
    category: 'ONBOARDING',
    content: `Daily objectives have been initialized.

Five core tasks await completion.
Each represents a minimum standard.
Not a goal. A baseline.

The System will monitor progress.`,
  },
  {
    key: 'onboarding.title_assigned',
    category: 'ONBOARDING',
    content: `TITLE ASSIGNED: The Beginner

This designation reflects current standing.
It is neither insult nor praise.
It is classification.

Titles change when behavior changes.`,
  },
]

const dailyQuestHeaders: NarrativeContentData[] = [
  {
    key: 'daily.header.default',
    category: 'DAILY_QUEST',
    content: `DAILY OBJECTIVES

Five core tasks. Completion expected.
The System records all outcomes.`,
  },
  {
    key: 'daily.header.streak_7',
    category: 'DAILY_QUEST',
    content: `DAILY OBJECTIVES

Current streak: {{streak_days}} days
Streak bonus: +10% XP

Consistency noted. Continue.`,
  },
  {
    key: 'daily.header.streak_30',
    category: 'DAILY_QUEST',
    content: `DAILY OBJECTIVES

Current streak: {{streak_days}} days
Streak bonus: +25% XP

30 days of recorded compliance.
This is no longer effort.
This is who you are becoming.`,
  },
  {
    key: 'daily.header.debuff',
    category: 'DAILY_QUEST',
    content: `DAILY OBJECTIVES

[PERFORMANCE DEGRADATION ACTIVE]
XP gains: -10%
Bonus features: Disabled

Complete all tasks to clear status.`,
  },
  {
    key: 'daily.header.weekend',
    category: 'DAILY_QUEST',
    content: `DAILY OBJECTIVES

Weekend detected.
Bonus multiplier available: 1.15x

The System does not recognize "days off."`,
  },
  {
    key: 'daily.header.monday',
    category: 'DAILY_QUEST',
    content: `DAILY OBJECTIVES

Week {{week_number}} initiated.
Seven days. Five daily objectives each.
35 opportunities to prove capability.

Begin.`,
  },
  {
    key: 'daily.header.boss_active',
    category: 'DAILY_QUEST',
    content: `DAILY OBJECTIVES

[BOSS ENCOUNTER ACTIVE]
Additional objectives tracked separately.
Daily completion still required.

Two battles. One outcome.`,
  },
]

const questCompletionMessages: NarrativeContentData[] = [
  {
    key: 'quest.complete.default',
    category: 'DAILY_QUEST',
    content: `OBJECTIVE COMPLETE

+{{xp_amount}} XP recorded
Progress logged to permanent record.`,
  },
  {
    key: 'quest.complete.exceeded',
    category: 'DAILY_QUEST',
    content: `OBJECTIVE EXCEEDED

Target: {{target_value}}
Actual: {{actual_value}}

+{{xp_amount}} XP recorded
Exceeding minimums noted. Not rewarded.`,
  },
  {
    key: 'quest.complete.barely',
    category: 'DAILY_QUEST',
    content: `OBJECTIVE COMPLETE

Threshold met: {{actual_value}}/{{target_value}}

+{{xp_amount}} XP recorded
Minimum compliance recorded.`,
  },
  {
    key: 'quest.complete.all',
    category: 'DAILY_QUEST',
    content: `ALL DAILY OBJECTIVES COMPLETE

Total XP earned: {{total_xp}}
Core tasks: 5/5

The System acknowledges completion.
Tomorrow, the counter resets.`,
  },
  {
    key: 'quest.complete.partial',
    category: 'DAILY_QUEST',
    content: `PARTIAL COMPLETION RECORDED

Progress: {{completion_percent}}%
Partial XP: +{{xp_amount}}

Full credit requires full completion.
The System does not round up.`,
  },
]

const streakMilestones: NarrativeContentData[] = [
  {
    key: 'streak.milestone.3',
    category: 'SYSTEM_MESSAGE',
    content: `3 CONSECUTIVE DAYS RECORDED

Early data suggests potential.
The System will continue monitoring.`,
  },
  {
    key: 'streak.milestone.7',
    category: 'SYSTEM_MESSAGE',
    content: `7 CONSECUTIVE DAYS RECORDED

Streak bonus unlocked: +10% XP

One week of compliance.
The easy part is over.
Now begins the real test.`,
  },
  {
    key: 'streak.milestone.14',
    category: 'SYSTEM_MESSAGE',
    content: `14 CONSECUTIVE DAYS RECORDED

Streak bonus upgraded: +15% XP

Two weeks without failure.
Patterns are forming.
The System observes.`,
  },
  {
    key: 'streak.milestone.21',
    category: 'SYSTEM_MESSAGE',
    content: `21 CONSECUTIVE DAYS RECORDED

Research suggests 21 days forms habit.
The System does not trust research.
The System trusts data.

Your data is... acceptable.`,
  },
  {
    key: 'streak.milestone.30',
    category: 'SYSTEM_MESSAGE',
    content: `30 CONSECUTIVE DAYS RECORDED

Streak bonus maximized: +25% XP

One month.
The System has collected sufficient data.
You are no longer being tested.
You are being measured.`,
  },
]

const debuffMessages: NarrativeContentData[] = [
  {
    key: 'debuff.warning',
    category: 'DEBUFF',
    content: `SYSTEM WARNING

Core objectives incomplete: {{incomplete_count}}
Time remaining: {{hours_remaining}} hours

Failure to complete will result in:
• XP gains: -10% (24 hours)
• Bonus features: Disabled

This is not a threat.
This is a calculation.`,
  },
  {
    key: 'debuff.applied',
    category: 'DEBUFF',
    content: `SYSTEM NOTICE: PERFORMANCE DEGRADATION

Core tasks incomplete: {{missed_count}}

For the next 24 hours:
• XP gains: -10%
• Dungeon bonuses: Disabled

You are not being punished.
You are experiencing the cost of neglect.`,
  },
  {
    key: 'debuff.active.reminder',
    category: 'DEBUFF',
    content: `[PERFORMANCE DEGRADATION ACTIVE]

Time remaining: {{hours_remaining}} hours
XP penalty: -10%

Complete all daily objectives to clear early.
Or wait. The System does not care which.`,
  },
  {
    key: 'debuff.cleared',
    category: 'DEBUFF',
    content: `PERFORMANCE DEGRADATION CLEARED

24-hour period elapsed.
Standard efficiency restored.

The record of this event remains permanent.`,
  },
  {
    key: 'debuff.cleared.by_action',
    category: 'DEBUFF',
    content: `PERFORMANCE DEGRADATION CLEARED

All daily objectives completed.
Early restoration granted.

The System notes: action was taken.
This, too, is recorded.`,
  },
]

const failureAndReturnMessages: NarrativeContentData[] = [
  {
    key: 'streak.broken.short',
    category: 'SYSTEM_MESSAGE',
    content: `STREAK TERMINATED

Previous streak: {{streak_days}} days
Current streak: 0

Counter reset.
Record remains.`,
  },
  {
    key: 'streak.broken.medium',
    category: 'SYSTEM_MESSAGE',
    content: `STREAK TERMINATED

Previous streak: {{streak_days}} days
Current streak: 0

{{streak_days}} days of data.
Then nothing.

The gap is now part of the record.`,
  },
  {
    key: 'streak.broken.long',
    category: 'SYSTEM_MESSAGE',
    content: `STREAK TERMINATED

Previous streak: {{streak_days}} days
Current streak: 0

{{streak_days}} days.
That data exists.
It meant something once.

Start again if you choose.
The System will be here either way.`,
  },
  {
    key: 'return.short',
    category: 'SYSTEM_MESSAGE',
    content: `SYSTEM REACTIVATED

Last activity: {{days_absent}} days ago

Brief interruption noted.
Daily objectives await.`,
  },
  {
    key: 'return.medium',
    category: 'SYSTEM_MESSAGE',
    content: `SYSTEM REACTIVATED

Last activity: {{days_absent}} days ago
Previous level: {{level}}
Previous streak: Terminated

The System does not ask where you were.
The System only records that you returned.

Daily objectives have been generated.`,
  },
]

export async function seedNarrativeContent(
  connectionString: string
): Promise<{ seeded: number; skipped: number }> {
  const client = postgres(connectionString)
  const db = drizzle(client)

  const allContent: NarrativeContentData[] = [
    ...onboardingContent,
    ...dailyQuestHeaders,
    ...questCompletionMessages,
    ...streakMilestones,
    ...debuffMessages,
    ...failureAndReturnMessages,
  ]

  let seeded = 0
  let skipped = 0

  console.log('[SYSTEM] Initializing narrative content database...')

  for (const item of allContent) {
    try {
      await db
        .insert(narrativeContents)
        .values({
          key: item.key,
          category: item.category,
          content: item.content,
          context: item.context ?? null,
          isActive: true,
        })
        .onConflictDoNothing()

      console.log(`  ✓ Content seeded: ${item.key}`)
      seeded++
    } catch (error) {
      // Key already exists or other conflict
      console.log(`  - Skipped (exists): ${item.key}`)
      skipped++
    }
  }

  console.log('\n[SYSTEM] Narrative content initialized.')
  console.log(`  Total items: ${allContent.length}`)
  console.log(`  Seeded: ${seeded}`)
  console.log(`  Skipped: ${skipped}`)

  await client.end()

  return { seeded, skipped }
}

// Export content arrays for testing
export const narrativeContentData = {
  onboarding: onboardingContent,
  dailyQuestHeaders,
  questCompletion: questCompletionMessages,
  streakMilestones,
  debuff: debuffMessages,
  failureAndReturn: failureAndReturnMessages,
}
