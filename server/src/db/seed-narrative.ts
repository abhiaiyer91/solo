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

// Detox Dungeons - Body reset and cleansing challenges
const detoxDungeonContent: NarrativeContentData[] = [
  // The Cleanse - 3-day juice cleanse
  {
    key: 'dungeon.a.cleanse.entry',
    category: 'DUNGEON',
    content: `A-RANK DUNGEON: The Cleanse

3 days. Liquids only. No exceptions.

Duration: 72 hours from entry
Reward: 4x XP + Body Reset bonus
Requirements:
- Juice, smoothies, broth, water only
- No solid food
- Minimum 2500ml liquid daily
- Log each meal

The System has observed bloat in your records.
Inflammation. Excess. Accumulation.

This dungeon strips away the unnecessary.
What remains is clarity.

[ENTER] [DECLINE]`,
  },
  {
    key: 'dungeon.a.cleanse.day1',
    category: 'DUNGEON',
    content: `THE CLEANSE - DAY 1

First 24 hours initiated.

The body will resist. This is expected.
Hunger signals are not emergencies.
They are negotiations.

Decline them all.

Hydration logged: {{hydration_ml}}ml
Meals logged: {{meals_logged}}
Status: {{status}}

48 hours remain.`,
  },
  {
    key: 'dungeon.a.cleanse.day2',
    category: 'DUNGEON',
    content: `THE CLEANSE - DAY 2

48 hours without solid food.

The body has begun to adapt.
Hunger diminishes. Clarity increases.
This is the inflection point.

Most who fail, fail on Day 2.
Not from weakness of body.
From weakness of resolve.

Hydration logged: {{hydration_ml}}ml
Meals logged: {{meals_logged}}
Status: {{status}}

24 hours remain.`,
  },
  {
    key: 'dungeon.a.cleanse.day3',
    category: 'DUNGEON',
    content: `THE CLEANSE - DAY 3

Final phase.

The body is lighter. The mind is clearer.
Inflammation subsiding. Bloat releasing.

Do not break now.
You have invested 48 hours.
12 more to claim victory.

Hydration logged: {{hydration_ml}}ml
Meals logged: {{meals_logged}}
Status: {{status}}

The finish line is visible.`,
  },
  {
    key: 'dungeon.a.cleanse.complete',
    category: 'DUNGEON',
    content: `A-RANK DUNGEON CLEARED

The Cleanse complete.
72 hours. Zero solid food. Complete discipline.

RESULTS:
- Bloat reduction: Significant
- Inflammation markers: Decreased
- Digestive reset: Complete
- Mental clarity: Enhanced

Bonus XP: +300% applied
Body Reset Bonus: Activated

The System has observed purification.
What enters the body next matters.
Choose wisely.

You have earned the right to rebuild cleanly.`,
  },
  {
    key: 'dungeon.a.cleanse.failed',
    category: 'DUNGEON',
    content: `A-RANK DUNGEON FAILED

The Cleanse incomplete.
Solid food consumed on Day {{failed_day}}.

The body's demands were louder than your resolve.
This time.

The dungeon resets.
When you are ready to prioritize clarity over comfort,
return.`,
  },

  // The 48-Hour Reset - 2-day fast
  {
    key: 'dungeon.s.fast48.entry',
    category: 'DUNGEON',
    content: `S-RANK DUNGEON: The 48-Hour Reset

No food for 48 hours. Water and electrolytes only.

Duration: 48 hours from entry
Reward: 500 bonus XP + Autophagy bonus
Requirements:
- Zero caloric intake
- Water, black coffee, plain tea permitted
- Electrolyte supplementation recommended
- Light activity only

WARNING: This dungeon is not for beginners.
Consult the body's current state.
Fasting is a tool. Used incorrectly, it damages.
Used correctly, it transforms.

The System does not recommend.
The System presents.

Autophagy begins around hour 18.
By hour 48, cellular cleanup is substantial.
Old, damaged cells consumed. New growth enabled.

Are you ready to reset at the cellular level?

[ENTER] [DECLINE]`,
  },
  {
    key: 'dungeon.s.fast48.phase1',
    category: 'DUNGEON',
    content: `THE 48-HOUR RESET - HOURS 0-12

Phase 1: Glycogen Depletion

The body burns through stored glucose.
This is the easy part.
Hunger appears and disappears in waves.

Current hour: {{current_hour}}
Hydration: {{hydration_ml}}ml
Status: Active

The real challenge begins after hour 16.
Prepare.`,
  },
  {
    key: 'dungeon.s.fast48.phase2',
    category: 'DUNGEON',
    content: `THE 48-HOUR RESET - HOURS 12-24

Phase 2: Metabolic Shift

Glycogen depleted. Ketosis initiating.
The body is switching fuel sources.
Some discomfort is expected. Fatigue. Mental fog.

This is temporary.
It is the bridge between states.

Current hour: {{current_hour}}
Hydration: {{hydration_ml}}ml
Status: {{status}}

Cross the bridge. Do not turn back.`,
  },
  {
    key: 'dungeon.s.fast48.phase3',
    category: 'DUNGEON',
    content: `THE 48-HOUR RESET - HOURS 24-36

Phase 3: Autophagy Active

The cellular cleanup has begun.
Damaged proteins being recycled.
Cellular debris cleared.
Inflammation reducing.

This is why you came.
The suffering of the first day has purpose.

Current hour: {{current_hour}}
Hydration: {{hydration_ml}}ml
Status: {{status}}

You are being rebuilt from the inside.`,
  },
  {
    key: 'dungeon.s.fast48.phase4',
    category: 'DUNGEON',
    content: `THE 48-HOUR RESET - HOURS 36-48

Final Phase: Deep Cleanse

Energy often returns here.
Mental clarity heightens.
The body has fully adapted.

Less than 12 hours remain.
You have already done the hard part.
Complete what you started.

Current hour: {{current_hour}}
Hydration: {{hydration_ml}}ml
Status: {{status}}

The reset is nearly complete.`,
  },
  {
    key: 'dungeon.s.fast48.complete',
    category: 'DUNGEON',
    content: `S-RANK DUNGEON CLEARED

The 48-Hour Reset complete.
48 hours. Zero calories. Maximum discipline.

CELLULAR REPORT:
- Autophagy: Activated and sustained
- Inflammation: Significantly reduced
- Insulin sensitivity: Reset
- Growth hormone: Elevated
- Mental clarity: Peak

Bonus XP: +500 applied
TITLE PROGRESS: The Ascetic

You have done what 99% will never attempt.
Your body has been reset at the cellular level.

IMPORTANT: Break fast gently.
Bone broth. Light protein. Small portions.
The body is primed for absorption.
What you consume next shapes what you become.

The System has recorded this achievement.
It will not be forgotten.`,
  },
  {
    key: 'dungeon.s.fast48.failed',
    category: 'DUNGEON',
    content: `S-RANK DUNGEON FAILED

The 48-Hour Reset incomplete.
Food consumed at hour {{failed_hour}}.

This dungeon demands everything.
Today, it received less.

There is no shame in an S-Rank failure.
Only data.

The dungeon will wait.
Return stronger. Or don't.
The System records either outcome.`,
  },

  // The Purge Protocol - Heavy hydration challenge
  {
    key: 'dungeon.c.purge.entry',
    category: 'DUNGEON',
    content: `C-RANK DUNGEON: The Purge Protocol

4 liters of water. One day. No exceptions.

Duration: Until midnight
Reward: 2x hydration XP + Flush bonus
Requirements:
- Minimum 4000ml water
- Spread throughout day
- Track all intake
- Reduce sodium

Water flushes toxins.
Water reduces bloat.
Water is the simplest intervention.
And the most neglected.

Today, you cannot neglect it.

Current hydration habits: {{avg_hydration}}ml/day
Target: 4000ml

[ENTER] [DECLINE]`,
  },
  {
    key: 'dungeon.c.purge.progress',
    category: 'DUNGEON',
    content: `THE PURGE PROTOCOL - IN PROGRESS

Current intake: {{current_ml}}ml / 4000ml
Progress: {{progress}}%

Time remaining: {{hours_remaining}} hours

Pace recommendation: {{pace_ml}}ml per remaining hour

The body is flushing.
Toxins releasing.
Bloat subsiding.

Continue.`,
  },
  {
    key: 'dungeon.c.purge.complete',
    category: 'DUNGEON',
    content: `C-RANK DUNGEON CLEARED

The Purge Protocol complete.
Total intake: {{total_ml}}ml

Bonus XP: +100% applied
Flush Bonus: Activated

Systems flushed:
- Kidneys: Cleared
- Digestive tract: Hydrated
- Skin: Improved circulation
- Bloat: Reduced

The simplest solution executed completely.
This is discipline made liquid.`,
  },
  {
    key: 'dungeon.c.purge.failed',
    category: 'DUNGEON',
    content: `C-RANK DUNGEON FAILED

The Purge Protocol incomplete.
Final intake: {{final_ml}}ml / 4000ml

Drinking water is not complicated.
It requires only consistency.

Try again when ready.`,
  },

  // Sugar Exile - No sugar challenge
  {
    key: 'dungeon.b.sugar_exile.entry',
    category: 'DUNGEON',
    content: `B-RANK DUNGEON: Sugar Exile

7 days. Zero added sugar. Complete exile.

Duration: 7 days from entry
Reward: 3x XP + Insulin Reset bonus
Requirements:
- No added sugars
- No artificial sweeteners
- Natural fruit sugar permitted (limited)
- Read every label

Sugar is the hidden saboteur.
In sauces. In drinks. In "healthy" foods.
It drives inflammation. Bloat. Fatigue. Cravings.

For 7 days, you exile it completely.

The first 3 days will be difficult.
Cravings will surge. Headaches possible.
This is withdrawal. It proves the point.

By Day 7, taste buds reset.
Energy stabilizes. Inflammation drops.
The body remembers what it was before sugar dominated.

[ENTER] [DECLINE]`,
  },
  {
    key: 'dungeon.b.sugar_exile.day1_2',
    category: 'DUNGEON',
    content: `SUGAR EXILE - DAYS 1-2

The exile begins.

Cravings are expected. Possibly intense.
The body screams for what it's been conditioned to want.
This is not need. This is addiction speaking.

Current day: {{current_day}}
Sugar consumed: {{sugar_status}}
Status: {{status}}

Do not negotiate.
Sugar will promise just a little.
A little is enough to restart the cycle.

Complete exile. No exceptions.`,
  },
  {
    key: 'dungeon.b.sugar_exile.day3_4',
    category: 'DUNGEON',
    content: `SUGAR EXILE - DAYS 3-4

The peak of difficulty.

Cravings may intensify before they fade.
Some experience headaches. Fatigue. Irritability.
This is the sugar leaving your system.

Current day: {{current_day}}
Sugar consumed: {{sugar_status}}
Status: {{status}}

Push through.
The other side is clarity.`,
  },
  {
    key: 'dungeon.b.sugar_exile.day5_7',
    category: 'DUNGEON',
    content: `SUGAR EXILE - DAYS 5-7

The adaptation phase.

Cravings diminishing. Energy stabilizing.
Taste buds recalibrating.
Food tastes different now. More nuanced. More real.

Current day: {{current_day}}
Sugar consumed: {{sugar_status}}
Status: {{status}}

You are almost free.
Complete the exile.`,
  },
  {
    key: 'dungeon.b.sugar_exile.complete',
    category: 'DUNGEON',
    content: `B-RANK DUNGEON CLEARED

Sugar Exile complete.
7 days. Zero added sugar. Complete reset.

RESULTS:
- Insulin sensitivity: Improved
- Inflammation markers: Reduced
- Energy stability: Enhanced
- Taste sensitivity: Recalibrated
- Cravings: Diminished

Bonus XP: +200% applied
Insulin Reset Bonus: Activated

You have broken the sugar cycle.
What you consume now will not be driven by addiction.
It will be choice.

The System recommends: maintain the exile.
Each day of extension compounds the benefit.`,
  },
  {
    key: 'dungeon.b.sugar_exile.failed',
    category: 'DUNGEON',
    content: `B-RANK DUNGEON FAILED

Sugar Exile broken.
Day {{failed_day}}: Sugar consumed

The addiction won this round.
It usually does.

But now you know its strength.
Now you know what you're fighting.

Return when ready.
The exile awaits.`,
  },

  // The Clean Slate - No processed food challenge
  {
    key: 'dungeon.b.clean_slate.entry',
    category: 'DUNGEON',
    content: `B-RANK DUNGEON: The Clean Slate

5 days. Whole foods only. No processing.

Duration: 5 days from entry
Reward: 3x nutrition XP + Gut Reset bonus
Requirements:
- Single-ingredient foods only
- No packaged/processed foods
- No restaurants (you can't verify ingredients)
- Cook everything yourself

Modern food is engineered for consumption.
Not for nutrition.
Additives. Preservatives. Hidden sugars. Seed oils.

For 5 days, you eat only what you can identify.
Meat. Vegetables. Fruits. Eggs. Rice. Potatoes.
Foods with one ingredient: themselves.

Your gut will thank you.
Your inflammation will drop.
Your energy will stabilize.

This is not a diet. This is a reset.

[ENTER] [DECLINE]`,
  },
  {
    key: 'dungeon.b.clean_slate.progress',
    category: 'DUNGEON',
    content: `THE CLEAN SLATE - IN PROGRESS

Day {{current_day}} of 5

Meals logged: {{meals_logged}}
Processed foods: {{processed_count}} (target: 0)
Status: {{status}}

Every meal is a choice.
Every ingredient is a decision.

The System is watching what you consume.
Make it count.`,
  },
  {
    key: 'dungeon.b.clean_slate.complete',
    category: 'DUNGEON',
    content: `B-RANK DUNGEON CLEARED

The Clean Slate complete.
5 days of whole foods only.

RESULTS:
- Gut microbiome: Resetting
- Inflammation: Reduced
- Digestion: Improved
- Energy: Stabilized
- Bloat: Eliminated

Bonus XP: +200% applied
Gut Reset Bonus: Activated

You have proven you can eat without processing.
The body responds to real food differently.
Remember this feeling.

The System notes: this is how humans ate for millennia.
Before optimization. Before engineering.
Before convenience replaced nutrition.`,
  },
  {
    key: 'dungeon.b.clean_slate.failed',
    category: 'DUNGEON',
    content: `B-RANK DUNGEON FAILED

The Clean Slate broken.
Processed food consumed on Day {{failed_day}}.

Convenience won.
It usually does.

The dungeon remains.
When you're ready to prioritize nutrition over convenience,
return.`,
  },

  // Gut Reset - Fiber and probiotic challenge
  {
    key: 'dungeon.c.gut_reset.entry',
    category: 'DUNGEON',
    content: `C-RANK DUNGEON: Gut Reset

3 days. High fiber. Maximum probiotics.

Duration: 3 days from entry
Reward: 2x XP + Microbiome bonus
Requirements:
- 40g+ fiber daily
- Probiotic food each day (yogurt, kimchi, sauerkraut, etc.)
- No alcohol
- Reduced caffeine

The gut is the second brain.
When it's compromised, everything suffers.
Mood. Energy. Immunity. Clarity.

For 3 days, you feed the good bacteria.
Starve the bad.
Reset the balance.

Fiber feeds. Probiotics populate.
Together, they rebuild.

[ENTER] [DECLINE]`,
  },
  {
    key: 'dungeon.c.gut_reset.progress',
    category: 'DUNGEON',
    content: `GUT RESET - IN PROGRESS

Day {{current_day}} of 3

Fiber intake: {{fiber_g}}g (target: 40g+)
Probiotic consumed: {{probiotic_status}}
Status: {{status}}

The microbiome is shifting.
Good bacteria multiplying.
Bad bacteria diminishing.

Continue feeding what you want to grow.`,
  },
  {
    key: 'dungeon.c.gut_reset.complete',
    category: 'DUNGEON',
    content: `C-RANK DUNGEON CLEARED

Gut Reset complete.
3 days of intentional microbiome support.

RESULTS:
- Fiber intake: Exceeded targets
- Probiotic diversity: Enhanced
- Gut flora balance: Improving
- Digestive efficiency: Optimizing

Bonus XP: +100% applied
Microbiome Bonus: Activated

The gut takes time to fully reset.
This was the beginning.
Continue the habits formed here.

The System notes: gut health compounds.
Each day of proper feeding strengthens the foundation.`,
  },
  {
    key: 'dungeon.c.gut_reset.failed',
    category: 'DUNGEON',
    content: `C-RANK DUNGEON FAILED

Gut Reset incomplete.
Requirements not met on Day {{failed_day}}.

The microbiome is patient.
It will wait for another attempt.

Return when ready to feed it properly.`,
  },

  // The Caffeine Purge - No caffeine challenge
  {
    key: 'dungeon.b.caffeine_purge.entry',
    category: 'DUNGEON',
    content: `B-RANK DUNGEON: The Caffeine Purge

7 days. Zero caffeine. Complete withdrawal.

Duration: 7 days from entry
Reward: 3x XP + Adrenal Reset bonus
Requirements:
- No coffee, tea, energy drinks
- No chocolate
- No pre-workout supplements
- Check labels for hidden caffeine

Caffeine is the world's most consumed drug.
You likely don't know who you are without it.

Days 1-3 will be difficult.
Headaches. Fatigue. Irritability. Brain fog.
This is withdrawal. It proves dependence.

By Day 7, natural energy returns.
Sleep deepens. Anxiety decreases.
You meet yourself without stimulants.

[ENTER] [DECLINE]`,
  },
  {
    key: 'dungeon.b.caffeine_purge.day1_3',
    category: 'DUNGEON',
    content: `THE CAFFEINE PURGE - DAYS 1-3

Withdrawal phase.

The headaches are normal. Expected.
Your brain is recalibrating adenosine receptors.
This is chemistry, not weakness.

Current day: {{current_day}}
Caffeine consumed: {{caffeine_status}}
Status: {{status}}

Hydrate heavily. Rest when needed.
This passes.`,
  },
  {
    key: 'dungeon.b.caffeine_purge.day4_5',
    category: 'DUNGEON',
    content: `THE CAFFEINE PURGE - DAYS 4-5

Adaptation phase.

Withdrawal symptoms fading.
Natural energy beginning to emerge.
Sleep quality improving.

Current day: {{current_day}}
Caffeine consumed: {{caffeine_status}}
Status: {{status}}

You are learning what baseline feels like.
Most never experience this.`,
  },
  {
    key: 'dungeon.b.caffeine_purge.day6_7',
    category: 'DUNGEON',
    content: `THE CAFFEINE PURGE - DAYS 6-7

Clarity phase.

Energy levels stabilizing.
No artificial peaks. No crashes.
This is your natural state.

Current day: {{current_day}}
Caffeine consumed: {{caffeine_status}}
Status: {{status}}

You have almost reclaimed yourself.
Complete the purge.`,
  },
  {
    key: 'dungeon.b.caffeine_purge.complete',
    category: 'DUNGEON',
    content: `B-RANK DUNGEON CLEARED

The Caffeine Purge complete.
7 days without stimulants.

RESULTS:
- Adrenal function: Reset
- Sleep architecture: Improved
- Natural energy: Restored
- Anxiety baseline: Lowered
- Dependence: Broken

Bonus XP: +200% applied
Adrenal Reset Bonus: Activated

You now have a choice.
Return to caffeine if you wish—but consciously.
Or maintain the clarity you've found.

The System notes: you've proven you don't need it.
That knowledge cannot be unlearned.`,
  },
  {
    key: 'dungeon.b.caffeine_purge.failed',
    category: 'DUNGEON',
    content: `B-RANK DUNGEON FAILED

The Caffeine Purge broken.
Caffeine consumed on Day {{failed_day}}.

The dependency remains.
The headache won.

Return when the desire for clarity exceeds the need for stimulation.`,
  },

  // The Cold Protocol - Cold exposure challenge
  {
    key: 'dungeon.b.cold_protocol.entry',
    category: 'DUNGEON',
    content: `B-RANK DUNGEON: The Cold Protocol

5 days. Cold exposure daily. No warm showers.

Duration: 5 days from entry
Reward: 3x XP + Inflammation Reset bonus
Requirements:
- Minimum 2-minute cold shower daily
- Water temperature below 60°F/15°C
- No warm water at any point
- Log each exposure

Cold is the oldest medicine.
It reduces inflammation. Increases alertness.
Activates brown fat. Builds mental resilience.

The body screams. The mind must override.
This is the essence of discipline.

[ENTER] [DECLINE]`,
  },
  {
    key: 'dungeon.b.cold_protocol.progress',
    category: 'DUNGEON',
    content: `THE COLD PROTOCOL - IN PROGRESS

Day {{current_day}} of 5

Cold exposure completed: {{exposure_status}}
Duration: {{duration_seconds}}s (minimum: 120s)
Status: {{status}}

The shock lessens each day.
The body adapts. The mind strengthens.

Continue.`,
  },
  {
    key: 'dungeon.b.cold_protocol.complete',
    category: 'DUNGEON',
    content: `B-RANK DUNGEON CLEARED

The Cold Protocol complete.
5 days of deliberate discomfort.

RESULTS:
- Inflammation markers: Reduced
- Brown fat activation: Increased
- Dopamine baseline: Elevated
- Mental resilience: Enhanced
- Comfort addiction: Diminished

Bonus XP: +200% applied
Inflammation Reset Bonus: Activated

You have learned to override the body's protests.
Cold no longer controls you.

The System notes: those who embrace discomfort
become harder to break.`,
  },
  {
    key: 'dungeon.b.cold_protocol.failed',
    category: 'DUNGEON',
    content: `B-RANK DUNGEON FAILED

The Cold Protocol broken.
Day {{failed_day}}: Warm water used or exposure skipped.

Comfort won.
The cold remains unconquered.

Return when you're ready to be uncomfortable on purpose.`,
  },

  // The Sleep Reset - Strict sleep schedule
  {
    key: 'dungeon.a.sleep_reset.entry',
    category: 'DUNGEON',
    content: `A-RANK DUNGEON: The Sleep Reset

7 days. Strict sleep protocol. No exceptions.

Duration: 7 days from entry
Reward: 4x XP + Circadian Sync bonus
Requirements:
- Same bedtime every night (within 30 min)
- Same wake time every morning (within 30 min)
- No screens 1 hour before bed
- No caffeine after 2 PM
- 7-9 hours sleep minimum
- No alcohol

Sleep is when you rebuild.
Muscle repairs. Memory consolidates. Hormones regulate.
Disrupt sleep, disrupt everything.

For 7 days, sleep becomes sacred.
Non-negotiable. Prioritized above all.

[ENTER] [DECLINE]`,
  },
  {
    key: 'dungeon.a.sleep_reset.progress',
    category: 'DUNGEON',
    content: `THE SLEEP RESET - IN PROGRESS

Day {{current_day}} of 7

Bedtime consistency: {{bedtime_status}}
Wake time consistency: {{waketime_status}}
Screen curfew: {{screen_status}}
Sleep duration: {{sleep_hours}} hours
Status: {{status}}

The circadian rhythm is resetting.
Each consistent night reinforces the pattern.

Continue the protocol.`,
  },
  {
    key: 'dungeon.a.sleep_reset.complete',
    category: 'DUNGEON',
    content: `A-RANK DUNGEON CLEARED

The Sleep Reset complete.
7 days of circadian discipline.

RESULTS:
- Circadian rhythm: Synchronized
- Sleep latency: Decreased
- Deep sleep percentage: Increased
- Morning energy: Enhanced
- Cognitive function: Optimized
- Recovery rate: Maximized

Bonus XP: +300% applied
Circadian Sync Bonus: Activated

Sleep is the foundation.
Everything else is built upon it.
You have reinforced the foundation.

The System notes: maintain this schedule.
The benefits compound.`,
  },
  {
    key: 'dungeon.a.sleep_reset.failed',
    category: 'DUNGEON',
    content: `A-RANK DUNGEON FAILED

The Sleep Reset broken.
Day {{failed_day}}: Protocol violated.

Sleep cannot be cheated.
It cannot be caught up on weekends.
It demands consistency.

Return when you're ready to prioritize recovery.`,
  },

  // The Alcohol Abstinence - No alcohol challenge
  {
    key: 'dungeon.a.alcohol_abstinence.entry',
    category: 'DUNGEON',
    content: `A-RANK DUNGEON: The Abstinence Protocol

14 days. Zero alcohol. Complete sobriety.

Duration: 14 days from entry
Reward: 4x XP + Liver Reset bonus + Clarity bonus
Requirements:
- No alcoholic beverages
- No "just one drink"
- No exceptions for social events
- Log any temptations faced

Alcohol is the most normalized poison.
It disrupts sleep. Kills muscle synthesis.
Impairs recovery. Adds empty calories.
Feeds anxiety while pretending to calm it.

For 14 days, you experience life without it.
Clear mornings. Deep sleep. Stable mood.
This is your baseline without the toxin.

[ENTER] [DECLINE]`,
  },
  {
    key: 'dungeon.a.alcohol_abstinence.week1',
    category: 'DUNGEON',
    content: `THE ABSTINENCE PROTOCOL - WEEK 1

Days 1-7 in progress.

Sleep is improving. Each night deeper than the last.
Morning fog lifting.
Cravings may appear, especially in social contexts.

Current day: {{current_day}}
Alcohol consumed: {{alcohol_status}}
Status: {{status}}

Note: The urge to drink is often habit, not need.
Recognize the difference.`,
  },
  {
    key: 'dungeon.a.alcohol_abstinence.week2',
    category: 'DUNGEON',
    content: `THE ABSTINENCE PROTOCOL - WEEK 2

Days 8-14 in progress.

The body has begun genuine recovery.
Liver enzymes normalizing.
Skin clearing. Energy stabilizing.
Anxiety baseline lowering.

Current day: {{current_day}}
Alcohol consumed: {{alcohol_status}}
Status: {{status}}

You are experiencing what sober feels like.
Many have forgotten.`,
  },
  {
    key: 'dungeon.a.alcohol_abstinence.complete',
    category: 'DUNGEON',
    content: `A-RANK DUNGEON CLEARED

The Abstinence Protocol complete.
14 days of complete sobriety.

RESULTS:
- Liver function: Recovering
- Sleep quality: Significantly improved
- Body composition: Improved (reduced bloat)
- Anxiety levels: Decreased
- Cognitive clarity: Enhanced
- Morning productivity: Maximized

Bonus XP: +300% applied
Liver Reset Bonus: Activated
Clarity Bonus: Activated

You have proven alcohol is optional.
Every drink from now on is a choice, not a habit.

The System notes: the benefits continue to compound.
Consider extending the protocol.`,
  },
  {
    key: 'dungeon.a.alcohol_abstinence.failed',
    category: 'DUNGEON',
    content: `A-RANK DUNGEON FAILED

The Abstinence Protocol broken.
Alcohol consumed on Day {{failed_day}}.

The social pressure. The stress relief myth.
The "just one" that never stays one.

Return when sobriety becomes more important than comfort.`,
  },

  // The Sweat Protocol - Daily intense sweating
  {
    key: 'dungeon.c.sweat_protocol.entry',
    category: 'DUNGEON',
    content: `C-RANK DUNGEON: The Sweat Protocol

5 days. Intense sweating daily. Purge through pores.

Duration: 5 days from entry
Reward: 2x XP + Toxin Flush bonus
Requirements:
- Heavy sweat session daily (sauna, intense cardio, or hot yoga)
- Minimum 20 minutes of sustained sweating
- Hydrate heavily before and after
- Replace electrolytes

Sweat is the body's secondary detox system.
Heavy metals. Metabolic waste. Toxins.
They exit through the skin when you create heat.

For 5 days, you force the purge.
Daily. Intentional. Complete.

[ENTER] [DECLINE]`,
  },
  {
    key: 'dungeon.c.sweat_protocol.progress',
    category: 'DUNGEON',
    content: `THE SWEAT PROTOCOL - IN PROGRESS

Day {{current_day}} of 5

Sweat session completed: {{session_status}}
Duration: {{duration_minutes}} min (minimum: 20 min)
Hydration: {{hydration_status}}
Status: {{status}}

The body is purging.
Each session clears more.

Continue.`,
  },
  {
    key: 'dungeon.c.sweat_protocol.complete',
    category: 'DUNGEON',
    content: `C-RANK DUNGEON CLEARED

The Sweat Protocol complete.
5 days of deliberate purging.

RESULTS:
- Skin clarity: Improved
- Toxin load: Reduced
- Cardiovascular conditioning: Enhanced
- Heat tolerance: Increased
- Pore function: Optimized

Bonus XP: +100% applied
Toxin Flush Bonus: Activated

You have used heat as medicine.
The ancient practice. The primal purge.

The System notes: regular sweating maintains the effect.`,
  },
  {
    key: 'dungeon.c.sweat_protocol.failed',
    category: 'DUNGEON',
    content: `C-RANK DUNGEON FAILED

The Sweat Protocol incomplete.
Day {{failed_day}}: Session missed or insufficient.

Sweating requires only heat and time.
Both were available.

Return when you're ready to embrace the discomfort.`,
  },

  // The Intermittent Fasting Protocol
  {
    key: 'dungeon.c.if_protocol.entry',
    category: 'DUNGEON',
    content: `C-RANK DUNGEON: The Fasting Window

7 days. 16:8 intermittent fasting. Daily discipline.

Duration: 7 days from entry
Reward: 2x XP + Metabolic Flexibility bonus
Requirements:
- 16-hour fasting window daily
- 8-hour eating window
- Water, black coffee, plain tea allowed during fast
- No caloric intake during fasting window

Intermittent fasting is entry-level metabolic training.
The body learns to burn fat instead of demanding constant fuel.
Insulin sensitivity improves. Autophagy activates.

For 7 days, you control when you eat.
Not if. When.

[ENTER] [DECLINE]`,
  },
  {
    key: 'dungeon.c.if_protocol.progress',
    category: 'DUNGEON',
    content: `THE FASTING WINDOW - IN PROGRESS

Day {{current_day}} of 7

Fasting window: {{fasting_hours}}h (target: 16h)
Eating window: {{eating_start}} - {{eating_end}}
Status: {{status}}

Hunger is a signal, not a command.
You are learning to hear it without obeying immediately.

Continue the protocol.`,
  },
  {
    key: 'dungeon.c.if_protocol.complete',
    category: 'DUNGEON',
    content: `C-RANK DUNGEON CLEARED

The Fasting Window complete.
7 days of disciplined eating windows.

RESULTS:
- Metabolic flexibility: Improved
- Insulin sensitivity: Enhanced
- Fat adaptation: Initiated
- Hunger regulation: Normalized
- Mental clarity (fasted): Improved

Bonus XP: +100% applied
Metabolic Flexibility Bonus: Activated

You have learned that hunger passes.
That the body adapts.
That eating can be scheduled, not reactive.

The System notes: 16:8 is sustainable long-term.
Consider making it default.`,
  },
  {
    key: 'dungeon.c.if_protocol.failed',
    category: 'DUNGEON',
    content: `C-RANK DUNGEON FAILED

The Fasting Window broken.
Day {{failed_day}}: Fasting window not maintained.

The stomach demanded. You complied.
The protocol requires the opposite.

Return when discipline exceeds hunger.`,
  },

  // The Elimination Protocol - Remove common inflammatory foods
  {
    key: 'dungeon.a.elimination.entry',
    category: 'DUNGEON',
    content: `A-RANK DUNGEON: The Elimination Protocol

14 days. Remove all common inflammatory foods.

Duration: 14 days from entry
Reward: 4x XP + Inflammation Baseline bonus
Requirements:
- No dairy
- No gluten
- No soy
- No corn
- No eggs
- No nightshades (tomatoes, peppers, potatoes, eggplant)
- No processed foods
- No alcohol
- No added sugar

These foods cause inflammation in many people.
You may not know which affect you.
This protocol removes all suspects.

After 14 days, reintroduce one at a time.
Your body will tell you what it rejects.
Listen.

[ENTER] [DECLINE]`,
  },
  {
    key: 'dungeon.a.elimination.week1',
    category: 'DUNGEON',
    content: `THE ELIMINATION PROTOCOL - WEEK 1

Days 1-7 in progress.

The body is clearing accumulated inflammation.
Energy may fluctuate. This is normal.
Cravings for eliminated foods are expected.

Current day: {{current_day}}
Compliance: {{compliance_status}}
Status: {{status}}

What you eat: Meat, fish, vegetables, fruits, rice, nuts.
What you avoid: Everything else.

Simplicity reveals truth.`,
  },
  {
    key: 'dungeon.a.elimination.week2',
    category: 'DUNGEON',
    content: `THE ELIMINATION PROTOCOL - WEEK 2

Days 8-14 in progress.

Inflammation should be noticeably reduced.
Joint pain decreased. Brain fog lifted.
Digestive issues resolving.

Current day: {{current_day}}
Compliance: {{compliance_status}}
Status: {{status}}

You are approaching baseline.
The body without inflammatory interference.
This is your true state.`,
  },
  {
    key: 'dungeon.a.elimination.complete',
    category: 'DUNGEON',
    content: `A-RANK DUNGEON CLEARED

The Elimination Protocol complete.
14 days of inflammatory food removal.

RESULTS:
- Systemic inflammation: Significantly reduced
- Digestive function: Optimized
- Joint comfort: Improved
- Mental clarity: Enhanced
- Skin quality: Improved
- Baseline established: Yes

Bonus XP: +300% applied
Inflammation Baseline Bonus: Activated

NEXT PHASE: Reintroduction
Add one food group back every 3 days.
Note all reactions. The body will signal intolerance.

You now have data.
Use it to build a personalized anti-inflammatory diet.`,
  },
  {
    key: 'dungeon.a.elimination.failed',
    category: 'DUNGEON',
    content: `A-RANK DUNGEON FAILED

The Elimination Protocol broken.
Restricted food consumed on Day {{failed_day}}.

The elimination diet requires complete compliance.
Partial elimination provides partial data.
Partial data is useless.

Return when you're ready for complete removal.`,
  },

  // The 72-Hour Reset - Extended 3-day fast
  {
    key: 'dungeon.s.fast72.entry',
    category: 'DUNGEON',
    content: `S-RANK DUNGEON: The 72-Hour Reset

72 hours. No food. Maximum cellular renewal.

Duration: 72 hours from entry
Reward: 750 bonus XP + Stem Cell Activation bonus
Requirements:
- Zero caloric intake for 72 hours
- Water, electrolytes, black coffee, plain tea permitted
- Light activity only
- Medical clearance recommended
- Not for beginners

WARNING: This is an advanced protocol.
Do not attempt without prior fasting experience.
The 48-Hour Reset should be completed first.

At 72 hours, the body enters deep autophagy.
Old immune cells cleared.
Stem cell regeneration initiated.
This is a complete system reboot.

The difficulty is extreme.
The reward is transformation.

[ENTER] [DECLINE]`,
  },
  {
    key: 'dungeon.s.fast72.day1',
    category: 'DUNGEON',
    content: `THE 72-HOUR RESET - DAY 1

Hours 0-24.

Glycogen depleting. Hunger waves beginning.
The body protests loudly. This is familiar.

Current hour: {{current_hour}}
Hydration: {{hydration_ml}}ml
Electrolytes: {{electrolyte_status}}
Status: {{status}}

Day 1 is the easy day.
You've done this before.
What comes next is new territory.`,
  },
  {
    key: 'dungeon.s.fast72.day2',
    category: 'DUNGEON',
    content: `THE 72-HOUR RESET - DAY 2

Hours 24-48.

Deep ketosis. Autophagy accelerating.
Mental clarity often peaks here.
Hunger may paradoxically decrease.

Current hour: {{current_hour}}
Hydration: {{hydration_ml}}ml
Electrolytes: {{electrolyte_status}}
Status: {{status}}

You are in the transformation zone.
The body is eating itself—the damaged parts.
This is healing through hunger.`,
  },
  {
    key: 'dungeon.s.fast72.day3',
    category: 'DUNGEON',
    content: `THE 72-HOUR RESET - DAY 3

Hours 48-72.

Maximum autophagy. Stem cells activating.
The immune system is being rebuilt.
Old cells cleared. New growth initiated.

Current hour: {{current_hour}}
Hydration: {{hydration_ml}}ml
Electrolytes: {{electrolyte_status}}
Status: {{status}}

This is the hardest day.
Not physically—you've adapted.
Mentally. The mind wants to quit near the finish.

Do not. You are hours from completion.`,
  },
  {
    key: 'dungeon.s.fast72.complete',
    category: 'DUNGEON',
    content: `S-RANK DUNGEON CLEARED

The 72-Hour Reset complete.
72 hours. Zero calories. Complete cellular renewal.

SYSTEM REPORT:
- Autophagy: Maximum activation achieved
- Immune system: Reset and regenerating
- Stem cells: Activated
- Insulin sensitivity: Fully reset
- Growth hormone: Peak elevation recorded
- Mental fortitude: Proven beyond doubt

Bonus XP: +750 applied
Stem Cell Activation Bonus: Activated
TITLE PROGRESS: The Ascetic (Major)

Less than 0.01% of humans will ever complete this.
You have demonstrated mastery over the most primal urge.
Hunger called. You did not answer. For 72 hours.

CRITICAL: Break fast with bone broth.
Then small protein. Then vegetables.
Do not eat heavily for 24 hours.
The body is primed. Respect the process.

The System has recorded an extraordinary event.
This data point stands alone.`,
  },
  {
    key: 'dungeon.s.fast72.failed',
    category: 'DUNGEON',
    content: `S-RANK DUNGEON FAILED

The 72-Hour Reset incomplete.
Food consumed at hour {{failed_hour}}.

72 hours demands everything.
Today, everything was not available.

There is no shame in this failure.
Only the very few complete S-Rank.

The dungeon will wait.
Return only when completely committed.`,
  },

  // The Morning Fasted Protocol - Early wake + fasted cardio
  {
    key: 'dungeon.c.morning_fasted.entry',
    category: 'DUNGEON',
    content: `C-RANK DUNGEON: The Morning Fasted Protocol

5 days. Wake early. Cardio before food.

Duration: 5 days from entry
Reward: 2x XP + Fat Oxidation bonus
Requirements:
- Wake before 6:00 AM
- 30+ minutes cardio before eating
- No food until after workout complete
- Water and black coffee permitted

Fasted morning cardio maximizes fat oxidation.
The body, depleted of overnight glucose, burns fat preferentially.
The early hour builds discipline.
Together, they transform.

[ENTER] [DECLINE]`,
  },
  {
    key: 'dungeon.c.morning_fasted.progress',
    category: 'DUNGEON',
    content: `THE MORNING FASTED PROTOCOL - IN PROGRESS

Day {{current_day}} of 5

Wake time: {{wake_time}}
Cardio completed: {{cardio_status}}
Duration: {{duration_minutes}} min (minimum: 30 min)
Fasted status: {{fasted_status}}
Status: {{status}}

The early morning belongs to the disciplined.
Most are sleeping. You are working.

Continue.`,
  },
  {
    key: 'dungeon.c.morning_fasted.complete',
    category: 'DUNGEON',
    content: `C-RANK DUNGEON CLEARED

The Morning Fasted Protocol complete.
5 days of early rising and fasted training.

RESULTS:
- Fat oxidation: Optimized
- Morning discipline: Established
- Metabolic flexibility: Improved
- Day productivity: Enhanced
- Sleep schedule: Regularized

Bonus XP: +100% applied
Fat Oxidation Bonus: Activated

You have claimed the morning.
The hours most waste, you've invested.

The System notes: morning habits set daily trajectory.
This habit sets trajectory toward excellence.`,
  },
  {
    key: 'dungeon.c.morning_fasted.failed',
    category: 'DUNGEON',
    content: `C-RANK DUNGEON FAILED

The Morning Fasted Protocol broken.
Day {{failed_day}}: Late wake or protocol incomplete.

The bed was warm. The morning was cold.
Comfort won.

Return when the mission exceeds the comfort.`,
  },

  // The Sodium Reset - Low sodium for water retention
  {
    key: 'dungeon.d.sodium_reset.entry',
    category: 'DUNGEON',
    content: `D-RANK DUNGEON: The Sodium Reset

3 days. Low sodium. Release retained water.

Duration: 3 days from entry
Reward: 2x XP + Water Weight Flush bonus
Requirements:
- Maximum 1500mg sodium daily
- No processed foods (hidden sodium)
- No restaurant food
- Cook all meals yourself
- Increase potassium intake

Excess sodium causes water retention.
Bloat. Puffiness. False weight.
The scale lies when sodium is high.

For 3 days, you control sodium strictly.
The body releases trapped water.
True weight is revealed.

[ENTER] [DECLINE]`,
  },
  {
    key: 'dungeon.d.sodium_reset.progress',
    category: 'DUNGEON',
    content: `THE SODIUM RESET - IN PROGRESS

Day {{current_day}} of 3

Sodium intake: {{sodium_mg}}mg (max: 1500mg)
Potassium intake: {{potassium_status}}
Processed food: {{processed_status}}
Status: {{status}}

Water is releasing.
Each low-sodium day compounds the effect.

Continue.`,
  },
  {
    key: 'dungeon.d.sodium_reset.complete',
    category: 'DUNGEON',
    content: `D-RANK DUNGEON CLEARED

The Sodium Reset complete.
3 days of controlled sodium intake.

RESULTS:
- Water retention: Flushed
- Bloat: Eliminated
- True weight: Revealed
- Blood pressure: Potentially improved
- Taste sensitivity: Enhanced

Bonus XP: +100% applied
Water Weight Flush Bonus: Activated

The weight lost was water, not fat.
But the bloat was real discomfort.
Now it's gone.

The System notes: sodium hides in processed food.
Awareness is the first defense.`,
  },
  {
    key: 'dungeon.d.sodium_reset.failed',
    category: 'DUNGEON',
    content: `D-RANK DUNGEON FAILED

The Sodium Reset incomplete.
Sodium limit exceeded on Day {{failed_day}}.

Hidden sodium is everywhere.
Awareness failed.

Return with greater attention to labels.`,
  },

  // The Digital Sunset - No screens before bed
  {
    key: 'dungeon.d.digital_sunset.entry',
    category: 'DUNGEON',
    content: `D-RANK DUNGEON: The Digital Sunset

5 days. No screens 2 hours before bed.

Duration: 5 days from entry
Reward: 2x XP + Melatonin Restoration bonus
Requirements:
- No phone, TV, computer, tablet 2 hours before sleep
- Blue light glasses don't count
- Reading physical books permitted
- Journaling encouraged

Blue light suppresses melatonin.
Melatonin regulates sleep.
Suppress melatonin, destroy sleep.

The math is simple.
The execution is not.
You are addicted to screens.

For 5 days, you break the addiction before bed.
Melatonin returns. Sleep deepens.
The mind quiets without infinite scroll.

[ENTER] [DECLINE]`,
  },
  {
    key: 'dungeon.d.digital_sunset.progress',
    category: 'DUNGEON',
    content: `THE DIGITAL SUNSET - IN PROGRESS

Day {{current_day}} of 5

Screen-free period: {{screen_free_status}}
Duration before bed: {{hours_screenless}}h (minimum: 2h)
Status: {{status}}

The urge to check is strong.
The notification calls.
Resist.

Your sleep depends on this boundary.`,
  },
  {
    key: 'dungeon.d.digital_sunset.complete',
    category: 'DUNGEON',
    content: `D-RANK DUNGEON CLEARED

The Digital Sunset complete.
5 evenings reclaimed from screens.

RESULTS:
- Melatonin production: Restored
- Sleep onset: Faster
- Sleep quality: Deeper
- Evening anxiety: Reduced
- Morning freshness: Enhanced

Bonus XP: +100% applied
Melatonin Restoration Bonus: Activated

You have learned that the last hours matter.
How you end the day determines how you start the next.

The System notes: this protocol is sustainable daily.
The benefits compound indefinitely.`,
  },
  {
    key: 'dungeon.d.digital_sunset.failed',
    category: 'DUNGEON',
    content: `D-RANK DUNGEON FAILED

The Digital Sunset broken.
Screen used within 2 hours of bed on Day {{failed_day}}.

The pull was too strong.
The notification won.

Return when you're ready to reclaim your evenings.`,
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
    ...detoxDungeonContent,
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
  detoxDungeons: detoxDungeonContent,
}
