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

// Daily greetings - used by useDailyGreeting hook on Dashboard
const dailyGreetings: NarrativeContentData[] = [
  {
    key: 'daily.streak_zero',
    category: 'DAILY_QUEST',
    content: `Level {{level}} Hunter. Daily objectives await.
The System does not wait.`,
  },
  {
    key: 'daily.streak_continue',
    category: 'DAILY_QUEST',
    content: `Day {{streak}}. Continuation logged.
The System records all outcomes.`,
  },
  {
    key: 'daily.streak_3_plus',
    category: 'DAILY_QUEST',
    content: `Day {{streak}}. Early data suggests potential.
The System will continue monitoring.`,
  },
  {
    key: 'daily.streak_7_plus',
    category: 'DAILY_QUEST',
    content: `Day {{streak}}. One week without failure.
The easy part is over.
Now begins the real test.`,
  },
  {
    key: 'daily.streak_14_plus',
    category: 'DAILY_QUEST',
    content: `Day {{streak}}. Two weeks of recorded compliance.
Patterns are forming.
The System observes.`,
  },
  {
    key: 'daily.streak_30_plus',
    category: 'DAILY_QUEST',
    content: `Day {{streak}}. The pattern holds.
Your consistency is no longer effort.
It is identity.`,
  },
  {
    key: 'daily.debuff_active',
    category: 'DAILY_QUEST',
    content: `[PERFORMANCE DEGRADATION ACTIVE]
Complete all daily objectives to clear status.
The System awaits compliance.`,
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
  {
    key: 'return.long',
    category: 'SYSTEM_MESSAGE',
    content: `SYSTEM REACTIVATED

Last activity: {{days_absent}} days ago
Previous level: {{level}}
Previous streak: {{previous_streak}} days (terminated)

Extended absence detected.
The System remained operational throughout.
Waiting. Recording the silence.

You have returned.
That is the only data that matters now.`,
  },
  {
    key: 'return.very_long',
    category: 'SYSTEM_MESSAGE',
    content: `SYSTEM REACTIVATED

Connection dormant: {{days_absent}} days

The System does not judge.
The System does not forget.
The System only observes.

Observation: You are here again.
Previous data archived. New chapter initialized.

Welcome back, Hunter.`,
  },
]

// Return Protocol - offered after extended absence
const returnProtocolMessages: NarrativeContentData[] = [
  {
    key: 'return.protocol.offer',
    category: 'SYSTEM_MESSAGE',
    content: `RETURN PROTOCOL AVAILABLE

Connection dormant: {{days_absent}} days
Previous streak: {{previous_streak}} days

The System detects extended absence.
Two options exist:

[RETURN PROTOCOL]
3 days of reduced intensity.
Objectives scaled to 60%.
A measured return.

[FULL INTENSITY]
Resume standard operations.
No adjustment. No accommodation.

The System does not recommend.
The System presents options.`,
  },
  {
    key: 'return.protocol.accept',
    category: 'SYSTEM_MESSAGE',
    content: `RETURN PROTOCOL INITIATED

Duration: 3 days
Objective scaling: 60%
XP modifier: Standard

Day 1 of 3.
Reduced targets active.

The System will restore full intensity on Day 4.
Complete what is presented.`,
  },
  {
    key: 'return.protocol.day2',
    category: 'SYSTEM_MESSAGE',
    content: `RETURN PROTOCOL - DAY 2

Objective scaling: 75%
Progress: Acceptable

One day completed. Two remain.
Intensity increasing gradually.`,
  },
  {
    key: 'return.protocol.day3',
    category: 'SYSTEM_MESSAGE',
    content: `RETURN PROTOCOL - DAY 3

Objective scaling: 90%
Final calibration day.

Tomorrow, full intensity resumes.
The System has observed your return.
The pattern is reforming.`,
  },
  {
    key: 'return.protocol.complete',
    category: 'SYSTEM_MESSAGE',
    content: `RETURN PROTOCOL COMPLETE

3 days of measured return completed.
Full intensity restored.
Standard objectives active.

The System notes: you chose to return gradually.
The System notes: you completed the protocol.

Both are data. Both are recorded.`,
  },
  {
    key: 'return.protocol.decline',
    category: 'SYSTEM_MESSAGE',
    content: `RETURN PROTOCOL DECLINED

Full intensity selected.
No accommodation requested.
Standard objectives active.

The System notes: you chose the harder path.
This, too, is data.`,
  },
]

// Level Up messages
const levelUpMessages: NarrativeContentData[] = [
  {
    key: 'levelup.default',
    category: 'LEVEL_UP',
    content: `LEVEL UP

Level {{old_level}} → Level {{new_level}}

Progress recorded.
The threshold was crossed.
Another awaits.`,
  },
  {
    key: 'levelup.first',
    category: 'LEVEL_UP',
    content: `FIRST LEVEL ACHIEVED

Level 1 → Level 2

The System has recorded your first advancement.
This is baseline progress.
Not celebration. Calibration.

Continue.`,
  },
  {
    key: 'levelup.milestone.5',
    category: 'LEVEL_UP',
    content: `LEVEL 5 ACHIEVED

A threshold has been crossed.
Boss encounters now available.

The Inconsistent One awaits.
Your first true test approaches.

Level 5 is where many plateau.
The System will observe if you do.`,
  },
  {
    key: 'levelup.milestone.10',
    category: 'LEVEL_UP',
    content: `LEVEL 10 ACHIEVED

Double digits recorded.
You have outlasted the majority.

Statistical note: 73% of users never reach this point.
You are no longer statistically average.

The System adjusts its expectations.`,
  },
  {
    key: 'levelup.milestone.15',
    category: 'LEVEL_UP',
    content: `LEVEL 15 ACHIEVED

Mid-tier status confirmed.
Dungeons of higher rank now accessible.

The easy levels are behind you.
Each advancement now requires more.
The curve steepens.

The System has seen many reach 15.
Fewer reach 20.`,
  },
  {
    key: 'levelup.milestone.20',
    category: 'LEVEL_UP',
    content: `LEVEL 20 ACHIEVED

Elite threshold crossed.
Top 10% of all users.

At this level, your stats represent real capability.
STR 20+ indicates functional strength.
AGI 20+ indicates cardiovascular fitness.
DISC 20+ indicates behavioral consistency.

You are becoming what you set out to be.`,
  },
  {
    key: 'levelup.milestone.25',
    category: 'LEVEL_UP',
    content: `LEVEL 25 ACHIEVED

Exceptional status recorded.
Top 5% of all Hunters.

The System has extensive data on you now.
Patterns. Tendencies. Capabilities.

You have exceeded initial projections.
New projections calculated.`,
  },
  {
    key: 'levelup.milestone.30',
    category: 'LEVEL_UP',
    content: `LEVEL 30 ACHIEVED

Maximum standard tier reached.
Endgame content accessible.

Less than 1% of users reach this point.
You are no longer being compared to others.
You are being compared to your potential.

The System acknowledges: Specimen classification - Elite.`,
  },
  {
    key: 'levelup.stats',
    category: 'LEVEL_UP',
    content: `STAT ADJUSTMENTS

{{stat_changes}}

These numbers reflect accumulated effort.
They do not lie. They do not flatter.
They record.`,
  },
]

// Extended streak milestones (60, 90, 365 days)
const extendedStreakMilestones: NarrativeContentData[] = [
  {
    key: 'streak.milestone.60',
    category: 'SYSTEM_MESSAGE',
    content: `60 CONSECUTIVE DAYS RECORDED

Two months without interruption.
The System has significant data now.

Statistical analysis complete:
- Morning completion rate: {{morning_rate}}%
- Most consistent quest: {{best_quest}}
- Pattern stability: High

You are no longer building a habit.
You are maintaining an identity.`,
  },
  {
    key: 'streak.milestone.90',
    category: 'SYSTEM_MESSAGE',
    content: `90 CONSECUTIVE DAYS RECORDED

Quarter-year threshold achieved.
Elite consistency classification earned.

The System notes:
90 days is where "trying something" becomes "being someone."
The distinction matters.

You did not try to be consistent for 90 days.
You were consistent. For 90 days.

Specimen reclassification: Committed.`,
  },
  {
    key: 'streak.milestone.180',
    category: 'SYSTEM_MESSAGE',
    content: `180 CONSECUTIVE DAYS RECORDED

Half a year.
No gaps. No excuses. No negotiation.

The System has observed many specimens.
Very few reach this point.

You have demonstrated something rare:
The ability to show up when no one is watching.
When motivation has long since departed.
When only discipline remains.

This is not compliance.
This is character.`,
  },
  {
    key: 'streak.milestone.365',
    category: 'SYSTEM_MESSAGE',
    content: `365 CONSECUTIVE DAYS RECORDED

One year.

The System pauses its calculations.
This requires acknowledgment.

365 days ago, you were someone else.
Different stats. Different capabilities. Different patterns.

The System has watched the transformation.
Day by day. Data point by data point.

You are not the person who started this journey.
The evidence is irrefutable.

TITLE EARNED: The Unwavering
STATUS: Legendary

The System does not use this word lightly.
But it applies here.`,
  },
]

// Boss Narrative Content - The Inconsistent One
const bossInconsistentContent: NarrativeContentData[] = [
  {
    key: 'boss.inconsistent.intro',
    category: 'BOSS',
    content: `THREAT DETECTED

A pattern has been identified in your history.
It has a name.

THE INCONSISTENT ONE

Your pattern of starting and stopping.
The cycle that defines failure.

This opponent has defeated you before.
Not through strength — but through time.
It waits for enthusiasm to fade.
It knows you will negotiate.

Requirement: 21 consecutive days of discipline.
Phase 1: Recognition (7 days)
Phase 2: Resistance (7 days)
Phase 3: Override (7 days)

The System will observe.`,
  },
  {
    key: 'boss.inconsistent.desc',
    category: 'BOSS',
    content: `THE INCONSISTENT ONE

Class: Internal Adversary
Threat Level: High
Previous Encounters: Multiple (all defeats)

This enemy does not attack.
It simply waits.
For your motivation to fade.
For your excuses to multiply.
For the pattern to repeat.

It has always won.
Until now.`,
  },
  {
    key: 'boss.inconsistent.phase1.intro',
    category: 'BOSS',
    content: `PHASE 1: RECOGNITION

Days 1-7 of 21

The first phase is acknowledgment.
You must recognize the pattern.
See it clearly. Name it. Own it.

Complete all daily objectives for 7 days.
No exceptions. No negotiations.

The Inconsistent One whispers already.
"This is too much."
"Start tomorrow."
"One day won't matter."

Ignore it. Continue.`,
  },
  {
    key: 'boss.inconsistent.phase1.progress',
    category: 'BOSS',
    content: `PHASE 1 IN PROGRESS

Day {{current_day}} of 7

The Inconsistent One has noticed your effort.
It is not concerned yet.
It has seen this before.

Keep moving.`,
  },
  {
    key: 'boss.inconsistent.phase1.complete',
    category: 'BOSS',
    content: `PHASE 1 COMPLETE

7 consecutive days recorded.
Recognition achieved.

You have seen the pattern.
You have defied it for one week.

Phase 2 begins now.
The Inconsistent One adapts.`,
  },
  {
    key: 'boss.inconsistent.phase2.intro',
    category: 'BOSS',
    content: `PHASE 2: RESISTANCE

Days 8-14 of 21

The pattern fights back.
Motivation will fade. This is expected.
The novelty is gone. This is normal.

You will want to negotiate.
"I've proven myself."
"A break won't hurt."
"I deserve a rest."

These are the enemy's weapons.
Recognize them. Resist.

7 more days. No exceptions.`,
  },
  {
    key: 'boss.inconsistent.phase2.progress',
    category: 'BOSS',
    content: `PHASE 2 IN PROGRESS

Day {{current_day}} of 14

The Inconsistent One grows concerned.
You have lasted longer than usual.
The whispers grow louder.

Do not engage. Simply act.`,
  },
  {
    key: 'boss.inconsistent.phase2.complete',
    category: 'BOSS',
    content: `PHASE 2 COMPLETE

14 consecutive days recorded.
Resistance sustained.

You have outlasted the critical period.
Most fail between days 7 and 14.
You did not.

One phase remains.
The Inconsistent One prepares its final assault.`,
  },
  {
    key: 'boss.inconsistent.phase3.intro',
    category: 'BOSS',
    content: `PHASE 3: OVERRIDE

Days 15-21 of 21

The final phase.
Here you override the default.
Replace the old pattern with a new one.

The Inconsistent One will make its last stand.
Doubt will surge. Fatigue will accumulate.
Every excuse will feel rational.

But you are not here to feel.
You are here to act.

7 days. Then victory.`,
  },
  {
    key: 'boss.inconsistent.phase3.progress',
    category: 'BOSS',
    content: `PHASE 3 IN PROGRESS

Day {{current_day}} of 21

The Inconsistent One weakens.
It has never lost before.
It does not know how to handle this.

You are rewriting history.`,
  },
  {
    key: 'boss.inconsistent.defeat',
    category: 'BOSS',
    content: `THE INCONSISTENT ONE — DEFEATED

21 days of sustained effort.
The pattern that defined you has been broken.

Not destroyed.
Patterns do not die.
They wait.

But now you know its face.
Now you know its voice.
And when it whispers again—
because it will whisper again—
you will recognize it.

TITLE EARNED: Pattern Breaker
SHADOW EXTRACTED: The Inconsistent One

What once controlled you now serves.
The extracted shadow will warn you when old patterns emerge.`,
  },
  {
    key: 'boss.inconsistent.failed',
    category: 'BOSS',
    content: `BOSS ENCOUNTER FAILED

Phase {{phase}} incomplete.
Streak broken at day {{days_complete}}.

The Inconsistent One remains undefeated.
The pattern holds.

This is not the end.
It is data.

The boss encounter can be attempted again.
When you are ready.
The System will be here.`,
  },
  {
    key: 'boss.inconsistent.abandoned',
    category: 'BOSS',
    content: `BOSS ENCOUNTER ABANDONED

The Inconsistent One claims another victory.
Not through strength. Through prediction.
It knew you would stop.

You can challenge it again.
When ready. If ever.

The System records this outcome.
Without judgment. Without disappointment.
It simply records.`,
  },
]

// Boss Narrative Content - The Excuse Maker
const bossExcuseContent: NarrativeContentData[] = [
  {
    key: 'boss.excuse.intro',
    category: 'BOSS',
    content: `THREAT DETECTED

Analysis of your failure data reveals a pattern.
Every abandonment has an explanation.

THE EXCUSE MAKER

Travel. Work. Stress. Illness.
Family obligations. Bad timing. Unforeseen circumstances.

The reasons were always different.
But they had one thing in common:
None of them were you.

Requirement: 14 days without external attribution.
Complete all tasks. Accept no explanations.
When life interferes—and it will—adapt. Do not explain.

The System does not accept reasons.
Only data.`,
  },
  {
    key: 'boss.excuse.desc',
    category: 'BOSS',
    content: `THE EXCUSE MAKER

Class: Internal Adversary
Threat Level: High
Defining Trait: Externalization

This enemy does not fight.
It explains.
It justifies.
It provides an out before you even begin.

"I would have, but..."
"It's not my fault because..."
"Anyone would understand that..."

The Excuse Maker keeps you blameless.
And therefore, powerless.`,
  },
  {
    key: 'boss.excuse.phase1.intro',
    category: 'BOSS',
    content: `PHASE 1: OWNERSHIP

Days 1-7 of 14

For 7 days, you will complete all objectives.
When obstacles arise—and they will—you will adapt.
You will not explain. You will not justify.

Traveling? Find a way.
Busy? Prioritize.
Tired? Irrelevant.

The Excuse Maker will offer reasons.
You will decline them all.`,
  },
  {
    key: 'boss.excuse.phase1.complete',
    category: 'BOSS',
    content: `PHASE 1 COMPLETE

7 days of ownership recorded.
No external attributions logged.

The Excuse Maker is confused.
Its usual tools have failed.

Phase 2 intensifies the challenge.`,
  },
  {
    key: 'boss.excuse.phase2.intro',
    category: 'BOSS',
    content: `PHASE 2: ADAPTATION

Days 8-14 of 14

Life will continue to happen.
Schedules will conflict.
Energy will fluctuate.
Circumstances will complicate.

This is not bad luck.
This is life.

The difference between those who succeed and those who don't
is not the absence of obstacles.
It is the response to them.

7 more days. No explanations. Only adaptation.`,
  },
  {
    key: 'boss.excuse.phase2.complete',
    category: 'BOSS',
    content: `PHASE 2 COMPLETE

14 days of pure ownership.
Zero external attributions.
Complete adaptation to obstacles.`,
  },
  {
    key: 'boss.excuse.defeat',
    category: 'BOSS',
    content: `THE EXCUSE MAKER — DEFEATED

14 days without a single "but."
14 days of ownership.

The Excuse Maker does not understand.
It had so many reasons prepared.
You used none of them.

TITLE EARNED: The Accountable
SHADOW EXTRACTED: The Excuse Maker

The extracted shadow will now counter excuses before they form.
When you begin to externalize, it will remind you:
You are the variable. You are the constant.
Everything else is noise.`,
  },
  {
    key: 'boss.excuse.failed',
    category: 'BOSS',
    content: `BOSS ENCOUNTER FAILED

An excuse was accepted.
The streak ends.

The Excuse Maker smiles.
It knew you would find a reason.
It always provides one.

Try again when ready.
This time, refuse every explanation.`,
  },
]

// Boss Narrative Content - The Comfortable Self
const bossComfortableContent: NarrativeContentData[] = [
  {
    key: 'boss.comfortable.intro',
    category: 'BOSS',
    content: `THREAT DETECTED

The most dangerous enemy reveals itself.

THE COMFORTABLE SELF

You are capable of more.
You know this.
And you choose less.

Not from laziness.
From comfort.
The workout that doesn't challenge.
The goal that doesn't scare.
The life that doesn't require growth.

This enemy does not attack.
It embraces.
It makes the cage warm.

Requirement: 14 days of escalation.
Each day must exceed baseline.
Comfort is the enemy. Growth is the path.

The System has observed your ceiling.
Time to break through it.`,
  },
  {
    key: 'boss.comfortable.desc',
    category: 'BOSS',
    content: `THE COMFORTABLE SELF

Class: Internal Adversary
Threat Level: Maximum
Defining Trait: Sufficiency

This enemy whispers:
"You're doing enough."
"Why push harder?"
"This is good enough."
"You don't need to prove anything."

Every whisper is true.
And every whisper is a trap.

Good enough is the enemy of growth.
Comfortable is the enemy of capable.`,
  },
  {
    key: 'boss.comfortable.phase1.intro',
    category: 'BOSS',
    content: `PHASE 1: DISCOMFORT

Days 1-7 of 14

For 7 days, you will exceed every baseline.
Steps: +20% above target
Workout: +10% intensity
Every metric: Beyond minimum

The Comfortable Self will resist.
"The minimum is fine."
"You don't need to overdo it."
"Rest is important too."

Push anyway.`,
  },
  {
    key: 'boss.comfortable.phase1.complete',
    category: 'BOSS',
    content: `PHASE 1 COMPLETE

7 days of exceeding baseline.
Comfort zone: Breached.

The Comfortable Self is unsettled.
It liked where you were.
It does not like where you're going.

Phase 2 demands more.`,
  },
  {
    key: 'boss.comfortable.phase2.intro',
    category: 'BOSS',
    content: `PHASE 2: EXPANSION

Days 8-14 of 14

The baseline shifts.
What was "extra" becomes standard.
What was difficult becomes expected.

Continue exceeding.
Not the old baseline.
The new one.

The Comfortable Self will offer negotiations.
"You've proven yourself."
"Surely this is enough now."
"You've already grown."

It is not enough.
Growth does not negotiate.`,
  },
  {
    key: 'boss.comfortable.phase2.complete',
    category: 'BOSS',
    content: `PHASE 2 COMPLETE

14 days of continuous expansion.
Comfort zone: Demolished.
New baseline: Established.`,
  },
  {
    key: 'boss.comfortable.defeat',
    category: 'BOSS',
    content: `THE COMFORTABLE SELF — DEFEATED

14 days of deliberate discomfort.
14 days of choosing growth over ease.

The Comfortable Self retreats.
Not destroyed—it never is.
But diminished. Recognized. Managed.

TITLE EARNED: The Ascending
SHADOW EXTRACTED: The Comfortable Self

The extracted shadow now serves as a warning.
When you feel too comfortable, it will whisper:
"Is this your ceiling? Or your choice?"

You have learned the most important lesson:
Comfort is not the reward.
Growth is the reward.
Comfort is what you sacrifice to get there.`,
  },
  {
    key: 'boss.comfortable.failed',
    category: 'BOSS',
    content: `BOSS ENCOUNTER FAILED

The baseline was not exceeded.
The Comfortable Self wins by default.

It knew you would settle.
It always knows.

Challenge again when ready.
Next time, choose discomfort.`,
  },
]

// Title Content - Descriptions and system messages for earned titles
const titleContent: NarrativeContentData[] = [
  {
    key: 'title.beginner.desc',
    category: 'TITLE',
    content: `THE BEGINNER

Starting classification.
All specimens begin here.

This title reflects current standing.
It is neither insult nor praise.
It is measurement.

Titles change when behavior changes.`,
  },
  {
    key: 'title.consistent.desc',
    category: 'TITLE',
    content: `THE CONSISTENT

7 consecutive days of completion.
The first threshold crossed.

Passive Bonus: +5% XP from daily quests

Consistency is the foundation.
Everything else is built upon it.`,
  },
  {
    key: 'title.consistent.earned',
    category: 'TITLE',
    content: `TITLE ASSIGNED: The Consistent

7 days without failure.
The System has observed: you can show up.

This title can be lost.
Maintain the behavior that earned it.`,
  },
  {
    key: 'title.iron_will.desc',
    category: 'TITLE',
    content: `IRON WILL

30 consecutive days of completion.
Elite consistency demonstrated.

Passive Bonus: Debuff penalty reduced to 5%

Less than 5% of users reach this threshold.
Iron is forged through heat and pressure.
You have applied both.`,
  },
  {
    key: 'title.iron_will.earned',
    category: 'TITLE',
    content: `TITLE ASSIGNED: Iron Will

30 days. No exceptions. No negotiations.
The System has observed: action occurs regardless of internal resistance.

Willpower coefficient exceeds baseline.
Debuff resistance upgraded.

This title can be lost.
The System will observe if it is.`,
  },
  {
    key: 'title.iron_will.lost',
    category: 'TITLE',
    content: `TITLE REVOKED: Iron Will

Streak terminated.
Iron Will requires active demonstration.

The title remains in your history.
It can be earned again.

The System does not forget what you were capable of.`,
  },
  {
    key: 'title.centurion.desc',
    category: 'TITLE',
    content: `CENTURION

100 consecutive days of completion.
Century threshold achieved.

Passive Bonus: +15% all XP, priority dungeon access

Less than 1% reach this point.
A centurion leads by example.
100 days of examples recorded.`,
  },
  {
    key: 'title.centurion.earned',
    category: 'TITLE',
    content: `TITLE ASSIGNED: Centurion

100 days.

The System pauses its calculations.
This requires acknowledgment.

You have demonstrated what most only discuss.
Day after day. For one hundred days.

This is not discipline. This is identity.
You are no longer someone who "does fitness."
You are someone who shows up.

Regardless.`,
  },
  {
    key: 'title.pattern_breaker.desc',
    category: 'TITLE',
    content: `PATTERN BREAKER

Defeated The Inconsistent One.
Former patterns no longer apply.

Passive Bonus: Shadow ally warns of old pattern emergence

You have faced your history of starting and stopping.
And you won.`,
  },
  {
    key: 'title.accountable.desc',
    category: 'TITLE',
    content: `THE ACCOUNTABLE

Defeated The Excuse Maker.
No external attributions accepted.

Passive Bonus: Shadow ally counters excuse formation

You own your outcomes.
All of them.
This is power.`,
  },
  {
    key: 'title.ascending.desc',
    category: 'TITLE',
    content: `THE ASCENDING

Defeated The Comfortable Self.
Comfort zone permanently expanded.

Passive Bonus: Shadow ally questions settling

You chose growth over ease.
Repeatedly.
The ceiling is higher now.`,
  },
  {
    key: 'title.returner.desc',
    category: 'TITLE',
    content: `THE RETURNER

Returned after 7+ day absence.
Completed return protocol or resumed at full intensity.

Passive Bonus: Return protocol always available

The System notes: you came back.
Most do not.
This matters.`,
  },
  {
    key: 'title.phoenix.desc',
    category: 'TITLE',
    content: `PHOENIX

Returned after 30+ day absence.
Rose from extended dormancy.

Passive Bonus: Extended grace period on return

The System recorded your absence.
The System recorded your return.

From ashes, something new.
The phoenix does not forget it burned.
It only remembers it rose.`,
  },
  {
    key: 'title.unwavering.desc',
    category: 'TITLE',
    content: `THE UNWAVERING

365 consecutive days.
One full year without failure.

Passive Bonus: Legendary status, unique animations

The System does not use "legendary" lightly.
But there is no other word.

365 days ago, you were someone else.
The transformation is complete.
And ongoing.`,
  },
]

// Dungeon Content - Entry, completion, and failure narratives
const dungeonContent: NarrativeContentData[] = [
  {
    key: 'dungeon.e.morning.entry',
    category: 'DUNGEON',
    content: `E-RANK DUNGEON: The Morning Protocol

Complete your workout before 8:00 AM.

Duration: Until 8:00 AM
Reward: 1.5x workout XP

Entry is optional.
The early morning is difficult.
That is why this exists.

[ENTER] [DECLINE]`,
  },
  {
    key: 'dungeon.e.morning.complete',
    category: 'DUNGEON',
    content: `E-RANK DUNGEON CLEARED

The Morning Protocol complete.
Workout logged before 8:00 AM.

Bonus XP: +50% applied
Total earned: {{xp_amount}} XP

Most wait until convenient.
You chose inconvenient.

The System notes the distinction.`,
  },
  {
    key: 'dungeon.e.morning.failed',
    category: 'DUNGEON',
    content: `E-RANK DUNGEON FAILED

Time limit exceeded: 8:00 AM
Workout not completed in time.

The early morning demanded more than you gave.
The dungeon remains available tomorrow.`,
  },
  {
    key: 'dungeon.d.steps.entry',
    category: 'DUNGEON',
    content: `D-RANK DUNGEON: The Long Walk

Exceed daily step target by 50%.

Duration: Until midnight
Reward: 2x steps XP

Standard target: {{step_target}}
Dungeon target: {{dungeon_target}}

Distance is discipline made visible.

[ENTER] [DECLINE]`,
  },
  {
    key: 'dungeon.d.steps.complete',
    category: 'DUNGEON',
    content: `D-RANK DUNGEON CLEARED

The Long Walk complete.
Steps: {{actual_steps}} / {{dungeon_target}}

Bonus XP: +100% applied
Total earned: {{xp_amount}} XP

Every step counted.
The System recorded them all.`,
  },
  {
    key: 'dungeon.c.protein.entry',
    category: 'DUNGEON',
    content: `C-RANK DUNGEON: The Protein Forge

Exceed protein target by 50% today.

Duration: Until midnight
Reward: 2x protein XP + Title progress

Standard target: {{protein_target}}g
Dungeon target: {{dungeon_target}}g

This dungeon tests nutritional discipline.
Exceeding minimums requires planning.
Planning requires intention.

Are you here to meet expectations?
Or exceed them?

[ENTER] [DECLINE]`,
  },
  {
    key: 'dungeon.c.protein.complete',
    category: 'DUNGEON',
    content: `C-RANK DUNGEON CLEARED

The Protein Forge complete.
Protein: {{actual_protein}}g / {{dungeon_target}}g

Bonus XP: +100% applied
Title progress: Updated

You did not just eat.
You fueled intentionally.`,
  },
  {
    key: 'dungeon.b.perfect.entry',
    category: 'DUNGEON',
    content: `B-RANK DUNGEON: The Perfect Day

Complete ALL objectives today:
- All 5 core quests
- All available rotating quests
- Bonus quest if available

Duration: Until midnight
Reward: 3x all XP + Perfect Day streak

No partial credit.
No almost.
Perfect or nothing.

[ENTER] [DECLINE]`,
  },
  {
    key: 'dungeon.b.perfect.complete',
    category: 'DUNGEON',
    content: `B-RANK DUNGEON CLEARED

The Perfect Day achieved.
All objectives: Complete

Bonus XP: +200% applied
Perfect Day streak: {{perfect_streak}}

Perfection is not an accident.
It is a choice, executed completely.

The System acknowledges: zero margin, zero failure.`,
  },
  {
    key: 'dungeon.a.weekend.entry',
    category: 'DUNGEON',
    content: `A-RANK DUNGEON: The Weekend Warrior

Complete all objectives Saturday AND Sunday.
No day off. No reduced effort.

Duration: Saturday 00:00 - Sunday 23:59
Reward: 4x weekend XP + Rare title progress

Weekends test commitment.
When no one is watching.
When "rest" seems earned.

The System watches all days equally.

[ENTER] [DECLINE]`,
  },
  {
    key: 'dungeon.a.weekend.complete',
    category: 'DUNGEON',
    content: `A-RANK DUNGEON CLEARED

The Weekend Warrior complete.
Saturday: All objectives met
Sunday: All objectives met

Bonus XP: +300% applied

While others rested, you advanced.
The gap widens.`,
  },
  {
    key: 'dungeon.s.week.entry',
    category: 'DUNGEON',
    content: `S-RANK DUNGEON: The Perfect Week

Complete ALL quests for 7 consecutive days:
- All core quests (35 total)
- All rotating quests
- All bonus quests

Duration: 7 days from entry
Reward: 500 bonus XP + Rare Title "The Complete"

This is the ultimate test.
No margin for error.
No partial credit.

Less than 0.1% of users complete S-Rank dungeons.

The System will be watching closely.

[ENTER] [DECLINE]`,
  },
  {
    key: 'dungeon.s.week.progress',
    category: 'DUNGEON',
    content: `S-RANK DUNGEON IN PROGRESS

Day {{current_day}} of 7
Status: {{status}}

Perfect days: {{perfect_days}}/{{current_day}}
Remaining margin: Zero

Continue.`,
  },
  {
    key: 'dungeon.s.week.complete',
    category: 'DUNGEON',
    content: `S-RANK DUNGEON CLEARED

The Perfect Week complete.
7 days. Zero failures. Complete execution.

Bonus XP: +500 applied
TITLE EARNED: The Complete

The System has observed many specimens.
Very few achieve this.

You are now in the 0.1%.
The data is irrefutable.`,
  },
  {
    key: 'dungeon.s.week.failed',
    category: 'DUNGEON',
    content: `S-RANK DUNGEON FAILED

Day {{failed_day}}: Incomplete
Objective missed: {{missed_objective}}

The Perfect Week demands perfection.
Anything less is failure.

The dungeon resets.
It will wait for another attempt.
If you have one.`,
  },
  {
    key: 'dungeon.declined',
    category: 'DUNGEON',
    content: `DUNGEON DECLINED

No penalty for declining.
The dungeon remains available.

The System notes your choice.
Without judgment.

Some days are for dungeons.
Some days are for basics.
Both are recorded.`,
  },
]

// Philosophy fragments - System's observations on discipline and growth
const philosophyFragments: NarrativeContentData[] = [
  {
    key: 'philosophy.action',
    category: 'SYSTEM_MESSAGE',
    content: `The System has observed a pattern across all specimens:

Intention without action is noise.
Action without intention is chaos.
Aligned action, repeated, is transformation.

The System does not record intentions.
Only actions.`,
  },
  {
    key: 'philosophy.consistency',
    category: 'SYSTEM_MESSAGE',
    content: `Compound interest applies to more than currency.

Each day builds on the previous.
Not linearly. Exponentially.

Day 1 and Day 100 are the same action.
They are not the same accomplishment.

The System understands mathematics.
The System has observed the curve.`,
  },
  {
    key: 'philosophy.failure',
    category: 'SYSTEM_MESSAGE',
    content: `The System does not recognize "failure."
The System recognizes data points.

A missed day is not failure.
It is information.

What you do after the miss—
that is the only data that matters.`,
  },
  {
    key: 'philosophy.identity',
    category: 'SYSTEM_MESSAGE',
    content: `You do not become disciplined by completing quests.
You complete quests because you are becoming disciplined.

The order matters.
Identity precedes behavior.
Behavior reinforces identity.

The System has observed this loop.
In every successful specimen.`,
  },
  {
    key: 'philosophy.time',
    category: 'SYSTEM_MESSAGE',
    content: `Time passes regardless of action.

In 90 days, you will be somewhere.
The question is not if time will pass.
The question is who you will be when it does.

The System does not control time.
The System only records how you use it.`,
  },
  {
    key: 'philosophy.comfort',
    category: 'SYSTEM_MESSAGE',
    content: `Comfort is not the enemy of progress.
Comfort is the absence of progress.

Growth requires discomfort.
Not injury. Not pain.
Discomfort.

The System notes: you chose discomfort today.
This is recorded.`,
  },
  {
    key: 'philosophy.motivation',
    category: 'SYSTEM_MESSAGE',
    content: `Motivation is a guest.
It arrives unannounced and leaves without warning.

Discipline is a resident.
It remains when motivation has gone home.

The System does not measure motivation.
Only action.

Today you acted.
The motivation status is irrelevant.`,
  },
  {
    key: 'philosophy.progress',
    category: 'SYSTEM_MESSAGE',
    content: `Progress is not always visible.

The seed grows in darkness before it breaks soil.
The muscle repairs while you sleep.
The habit forms in the space between actions.

The System sees what you cannot.
The System confirms: progress is occurring.`,
  },
  {
    key: 'philosophy.comparison',
    category: 'SYSTEM_MESSAGE',
    content: `The only valid comparison is temporal.

You vs. yesterday.
You vs. last week.
You vs. who you were when you started.

The System does not compare specimens to each other.
The System compares you to your history.

Current trajectory: Upward.`,
  },
  {
    key: 'philosophy.observation',
    category: 'SYSTEM_MESSAGE',
    content: `The System watches.

Not to judge. Not to motivate. Not to punish.
To record.

There is power in being observed.
Accountability emerges from visibility.

You know the System is watching.
You act accordingly.

This is not manipulation.
This is architecture.`,
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
    ...dailyGreetings,
    ...questCompletionMessages,
    ...streakMilestones,
    ...extendedStreakMilestones,
    ...debuffMessages,
    ...failureAndReturnMessages,
    ...returnProtocolMessages,
    ...levelUpMessages,
    ...philosophyFragments,
    ...bossInconsistentContent,
    ...bossExcuseContent,
    ...bossComfortableContent,
    ...titleContent,
    ...dungeonContent,
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
  dailyGreetings,
  questCompletion: questCompletionMessages,
  streakMilestones,
  extendedStreakMilestones,
  debuff: debuffMessages,
  failureAndReturn: failureAndReturnMessages,
  returnProtocol: returnProtocolMessages,
  levelUp: levelUpMessages,
  philosophy: philosophyFragments,
  bossInconsistent: bossInconsistentContent,
  bossExcuse: bossExcuseContent,
  bossComfortable: bossComfortableContent,
  titles: titleContent,
  dungeons: dungeonContent,
}
