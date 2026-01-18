# Dungeon Designs

Dungeons are optional, time-limited challenges that push players beyond their daily baseline. They exist for those who want more—not everyone wants more, and that's fine.

---

## Dungeon Philosophy

**Dungeons are not:**
- Required for progression
- Necessary for streaks
- Punishing if skipped

**Dungeons are:**
- Optional tests of capability
- Time-boxed intensity
- Higher risk, higher reward
- Narrative flavor ("unstable zones")

**The System's stance:**
```
Entry is optional.
Survival is likely.
Growth is not guaranteed.

Dungeons exist for one reason:
To see what happens when you ask more of yourself than required.
```

---

## Dungeon Mechanics

### Core Rules

| Mechanic | Description |
|----------|-------------|
| **Entry** | Voluntary, requires meeting entry conditions |
| **Duration** | Fixed time window (30 min to 24 hours) |
| **Challenge** | Specific requirements that exceed daily baseline |
| **XP Multiplier** | 1.5x to 3x on relevant quest XP |
| **Cooldown** | 24 hours after completion (per dungeon) |
| **Failure** | No XP bonus, no penalty, can retry after cooldown |
| **Debuff Interaction** | Dungeon bonuses disabled during debuff |

### Completion States

| State | Result |
|-------|--------|
| **Cleared** | Full XP multiplier applied, recorded as clear |
| **Failed** | Normal XP only, recorded as attempt |
| **Abandoned** | Partial XP for completed portions, recorded as abandoned |
| **Timed Out** | Same as failed |

---

## Dungeon Ranks

| Rank | Unlock Level | XP Multiplier | Typical Duration | Difficulty |
|------|-------------|---------------|------------------|------------|
| **E-Rank** | 3 | 1.5x | 30 min - 4 hours | Entry level |
| **D-Rank** | 6 | 1.75x | 2-8 hours | Moderate |
| **C-Rank** | 10 | 2.0x | 4-12 hours | Challenging |
| **B-Rank** | 15 | 2.25x | 8-24 hours | Hard |
| **A-Rank** | 20 | 2.5x | 12-24 hours | Very Hard |
| **S-Rank** | 25 | 3.0x | 24 hours+ | Extreme |

---

## E-Rank Dungeons (Level 3+)

Entry-level challenges. Designed to introduce the dungeon concept without overwhelming.

### E-1: The Morning Protocol

**Concept**: Complete your workout before the world wakes up.

| Attribute | Value |
|-----------|-------|
| Challenge | Complete strength workout before 7:00 AM |
| Duration | Until 7:00 AM |
| XP Multiplier | 1.5x on workout XP |
| Cooldown | 24 hours |

**Entry Narrative**:
```
E-RANK DUNGEON DETECTED: The Morning Protocol

Most people are sleeping.
You could be sleeping.

Challenge: Complete strength training before 7:00 AM.

The early hours are uncontested.
No interruptions. No excuses.
Only you and the work.

Duration: Until 7:00 AM
Reward: 1.5x workout XP (60 XP instead of 40)

[ENTER DUNGEON]
[DECLINE]
```

**Completion**:
```
DUNGEON CLEARED: The Morning Protocol

Workout completed at {{time}}.
Time remaining: {{remaining}}

The morning belonged to you.
Most people gave it away.

+60 XP (1.5x multiplier applied)

Dungeon available again in 24 hours.
```

**Failure**:
```
DUNGEON FAILED: The Morning Protocol

7:00 AM reached.
Workout incomplete.

The morning passed.
It will come again tomorrow.

No bonus applied.
Standard XP awarded for any completed activity.
```

---

### E-2: Step Surge

**Concept**: Push your movement significantly beyond baseline in a single day.

| Attribute | Value |
|-----------|-------|
| Challenge | Reach 15,000 steps (vs 10,000 baseline) |
| Duration | 24 hours |
| XP Multiplier | 1.5x on steps XP |
| Cooldown | 24 hours |

**Entry Narrative**:
```
E-RANK DUNGEON DETECTED: Step Surge

Standard movement target: 10,000 steps
Dungeon target: 15,000 steps

50% beyond baseline.
Not impossible. Not easy.

Duration: Until midnight
Reward: 1.5x movement XP (38 XP instead of 25)

[ENTER DUNGEON]
[DECLINE]
```

**Progress Update (at 10,000)**:
```
DUNGEON PROGRESS: Step Surge

Standard target reached: 10,000 steps
Dungeon target remaining: 5,000 steps

You have achieved the minimum.
The dungeon asks for more.

Continue or exit with standard reward.
```

---

### E-3: Clean Fuel

**Concept**: Nutrition discipline for one day.

| Attribute | Value |
|-----------|-------|
| Challenge | Hit protein target + no processed food |
| Duration | 24 hours |
| XP Multiplier | 1.5x on protein XP |
| Cooldown | 24 hours |

**Entry Narrative**:
```
E-RANK DUNGEON DETECTED: Clean Fuel

Nutrition affects everything.
For one day, optimize it.

Challenge:
• Hit protein target
• No processed foods
• No added sugars

Duration: 24 hours
Reward: 1.5x nutrition XP (30 XP instead of 20)

The body is a system.
Input determines output.

[ENTER DUNGEON]
[DECLINE]
```

---

## D-Rank Dungeons (Level 6+)

Moderate challenges. Require more sustained effort or multiple quest types.

### D-1: The Double

**Concept**: Two workouts in one day.

| Attribute | Value |
|-----------|-------|
| Challenge | Complete two separate workout sessions |
| Duration | 24 hours |
| XP Multiplier | 1.75x on each workout |
| Cooldown | 48 hours |
| Special | Minimum 4 hours between sessions |

**Entry Narrative**:
```
D-RANK DUNGEON DETECTED: The Double

One workout is expected.
Two workouts are excessive.

Challenge: Complete two separate strength sessions.
Minimum 4 hours between sessions.

Morning and evening.
Or noon and night.
The schedule is yours.

Duration: 24 hours
Reward: 1.75x XP per workout (70 XP each = 140 total)

Recovery will be required.
The System does not prevent you from overreaching.

[ENTER DUNGEON]
[DECLINE]
```

**Second Workout Logged**:
```
DUNGEON CLEARED: The Double

Workout 1: {{time_1}}
Workout 2: {{time_2}}
Gap: {{hours}} hours

Two sessions completed.
The body adapts to demand.
Provide the demand.

+140 XP (1.75x multiplier × 2)
```

---

### D-2: The Gauntlet

**Concept**: Perfect completion of all quests in a compressed timeframe.

| Attribute | Value |
|-----------|-------|
| Challenge | Complete ALL core + rotating quests before 6 PM |
| Duration | Until 6 PM |
| XP Multiplier | 1.75x on all quest XP |
| Cooldown | 24 hours |

**Entry Narrative**:
```
D-RANK DUNGEON DETECTED: The Gauntlet

Most people spread their tasks across waking hours.
This dungeon compresses them.

Challenge: Complete ALL quests before 6:00 PM.
• All core quests
• Today's rotating quest

No evening cushion.
No "I'll do it later."

Duration: Until 6:00 PM
Reward: 1.75x XP on all completed quests

[ENTER DUNGEON]
[DECLINE]
```

---

### D-3: Silence

**Concept**: Digital discipline challenge.

| Attribute | Value |
|-----------|-------|
| Challenge | No social media + no screens after 8 PM |
| Duration | 24 hours |
| XP Multiplier | 1.75x on discipline quest |
| Cooldown | 24 hours |
| Bonus | +25 XP completion bonus |

**Entry Narrative**:
```
D-RANK DUNGEON DETECTED: Silence

The noise is constant.
For one day, reduce it.

Challenge:
• No social media (self-reported)
• No recreational screens after 8:00 PM

The mind craves stimulation.
Discipline is saying no to the craving.

Duration: 24 hours
Reward: 1.75x discipline XP + 25 bonus XP

This dungeon requires honesty.
The System cannot verify.
You can.

[ENTER DUNGEON]
[DECLINE]
```

---

## C-Rank Dungeons (Level 10+)

Challenging. Multi-component challenges requiring sustained focus.

### C-1: The Foundation Day

**Concept**: Perfect execution across all systems.

| Attribute | Value |
|-----------|-------|
| Challenge | Complete ALL quests with margin to spare |
| Duration | 24 hours |
| XP Multiplier | 2.0x on all quest XP |
| Requirements | Steps: 12,000+ (not 10k), Protein: 110%+, Workout: Before noon, Wake: On time |
| Cooldown | 48 hours |

**Entry Narrative**:
```
C-RANK DUNGEON DETECTED: The Foundation Day

Not just completion.
Excellence.

Challenge:
• 12,000+ steps (not 10,000)
• Protein at 110% of target
• Workout complete before noon
• Wake on time

Every system. Above baseline.

Duration: 24 hours
Reward: 2.0x XP on all quests

The foundation is what remains when motivation leaves.
Today, build it stronger.

[ENTER DUNGEON]
[DECLINE]
```

---

### C-2: The Fasted March

**Concept**: Movement performance in a fasted state.

| Attribute | Value |
|-----------|-------|
| Challenge | 12,000 steps before first meal |
| Duration | Until first meal or noon (whichever first) |
| XP Multiplier | 2.0x on steps |
| Cooldown | 48 hours |

**Entry Narrative**:
```
C-RANK DUNGEON DETECTED: The Fasted March

The body has fuel reserves.
Most people never access them.

Challenge: 12,000 steps before your first meal.

No breakfast until the march is complete.
Water is permitted. Calories are not.

Duration: Until first meal (or noon maximum)
Reward: 2.0x movement XP

This is not starvation.
This is access.

[ENTER DUNGEON]
[DECLINE]
```

---

### C-3: The Cold Week

**Concept**: Extended cold exposure challenge.

| Attribute | Value |
|-----------|-------|
| Challenge | Cold exposure every day for 7 days |
| Duration | 7 days |
| XP Multiplier | 2.0x on each cold exposure |
| Cooldown | 7 days |
| Daily Minimum | 2 minutes cold water |

**Entry Narrative**:
```
C-RANK DUNGEON DETECTED: The Cold Week

Cold exposure once is a novelty.
Seven consecutive days is adaptation.

Challenge: Cold shower or ice bath every day for 7 days.
Minimum: 2 minutes per session.

Day 1 will be shocking.
Day 7 will be normal.

Duration: 7 days
Reward: 2.0x XP per session (7 opportunities)

The body resists discomfort.
Then it stops resisting.

[ENTER DUNGEON]
[DECLINE]
```

**Progress (Day 4)**:
```
DUNGEON PROGRESS: The Cold Week

Days completed: 4/7
Days remaining: 3

The initial shock has passed.
The body is learning.

Continue. The adaptation is incomplete.
```

---

## B-Rank Dungeons (Level 15+)

Hard. Multi-day challenges or extreme single-day efforts.

### B-1: The Iron Week

**Concept**: Perfect week of strength training.

| Attribute | Value |
|-----------|-------|
| Challenge | Workout every day for 7 consecutive days |
| Duration | 7 days |
| XP Multiplier | 2.25x on each workout |
| Cooldown | 14 days |
| Note | Different muscle groups allowed/encouraged |

**Entry Narrative**:
```
B-RANK DUNGEON DETECTED: The Iron Week

Seven days.
Seven sessions.
No rest days.

Challenge: Complete a strength workout every day for one week.

Different muscle groups. Different intensities.
The goal is presence, not destruction.

Duration: 7 days
Reward: 2.25x XP per workout (90 XP × 7 = 630 potential)

Recovery will require attention.
Sleep. Nutrition. Stretching.
The System does not manage this for you.

[ENTER DUNGEON]
[DECLINE]
```

---

### B-2: The Century

**Concept**: 100,000 steps in one week.

| Attribute | Value |
|-----------|-------|
| Challenge | Accumulate 100,000 steps in 7 days |
| Duration | 7 days |
| XP Multiplier | 2.25x on all step XP |
| Cooldown | 14 days |
| Average Required | ~14,286 steps/day |

**Entry Narrative**:
```
B-RANK DUNGEON DETECTED: The Century

One hundred thousand steps.
Seven days to complete them.

That is approximately 14,286 per day.
Or more on some days, less on others.

The week is yours to structure.
The total is not negotiable.

Duration: 7 days
Reward: 2.25x movement XP for the week

Distance creates change.
This is significant distance.

[ENTER DUNGEON]
[DECLINE]
```

**Progress Tracker**:
```
THE CENTURY — Day 4

Steps completed: 61,247 / 100,000
Days remaining: 3
Required pace: 12,918/day remaining

You are ahead of pace.
Maintain it.
```

---

### B-3: The Monk's Day

**Concept**: Extreme discipline for 24 hours.

| Attribute | Value |
|-----------|-------|
| Challenge | Complete a strict protocol for 24 hours |
| Duration | 24 hours |
| XP Multiplier | 2.25x on all quests |
| Cooldown | 7 days |

**Protocol Requirements**:
- Wake at 5:00 AM
- No phone until noon
- Workout before 7:00 AM
- No alcohol
- No processed food
- No screens after 8:00 PM
- In bed by 9:30 PM

**Entry Narrative**:
```
B-RANK DUNGEON DETECTED: The Monk's Day

For 24 hours, live with intention.

Protocol:
• Wake: 5:00 AM
• No phone until noon
• Workout before 7:00 AM
• No alcohol
• No processed food
• No screens after 8:00 PM
• In bed by 9:30 PM

This is not sustainable daily.
It is instructive occasionally.

Duration: 24 hours (5 AM to 5 AM)
Reward: 2.25x XP on all quests

One day of monastic discipline.
To remember what is possible.

[ENTER DUNGEON]
[DECLINE]
```

---

## A-Rank Dungeons (Level 20+)

Very Hard. Reserved for committed players.

### A-1: The Transformation Week

**Concept**: Peak performance across all metrics for one week.

| Attribute | Value |
|-----------|-------|
| Challenge | 7 perfect days (all quests, all targets exceeded) |
| Duration | 7 days |
| XP Multiplier | 2.5x on all quest XP |
| Cooldown | 14 days |
| Failure Condition | Single missed quest fails the dungeon |

**Entry Narrative**:
```
A-RANK DUNGEON DETECTED: The Transformation Week

Seven perfect days.
Not seven good days.
Perfect.

Challenge:
• All core quests complete daily
• All rotating quests complete daily
• All targets exceeded (not just met)

One miss ends the dungeon.

Duration: 7 days
Reward: 2.5x XP for the entire week

This is demanding.
You have reached the level where demand is appropriate.

[ENTER DUNGEON]
[DECLINE]
```

---

### A-2: The 50K

**Concept**: 50,000 steps in 24 hours.

| Attribute | Value |
|-----------|-------|
| Challenge | 50,000 steps in a single day |
| Duration | 24 hours |
| XP Multiplier | 2.5x on steps |
| Cooldown | 7 days |
| Note | Approximately a marathon distance of walking |

**Entry Narrative**:
```
A-RANK DUNGEON DETECTED: The 50K

Fifty thousand steps.
Twenty-four hours.

This is approximately 40 kilometers.
A marathon of walking.

No running required.
Persistence required.

Duration: 24 hours
Reward: 2.5x movement XP

Your feet will hurt.
They will recover.

[ENTER DUNGEON]
[DECLINE]
```

**Progress (25,000)**:
```
THE 50K — Halfway

Steps: 25,000 / 50,000
Time remaining: {{hours}} hours

Half complete.
The second half is different.

The first half used enthusiasm.
The second half uses decision.
```

---

## S-Rank Dungeons (Level 25+)

Extreme. Badge of honor for completion.

### S-1: The Perfect Month

**Concept**: 30 consecutive perfect days.

| Attribute | Value |
|-----------|-------|
| Challenge | All quests completed, all targets met, 30 days straight |
| Duration | 30 days |
| XP Multiplier | 3.0x on all quest XP |
| Cooldown | 30 days |
| Failure Condition | Single missed day fails the dungeon |
| Title Reward | "The Perfectionist" |

**Entry Narrative**:
```
S-RANK DUNGEON DETECTED: The Perfect Month

Thirty days.
Zero failures.

Every quest. Every day.
No exceptions. No negotiations.

One missed day ends the dungeon.
You cannot retry for 30 days.

Duration: 30 days
Reward: 3.0x XP for the entire month + Title: "The Perfectionist"

This is not for most people.
The System does not recommend it.
The System only offers it.

[ENTER DUNGEON]
[DECLINE — I am not ready]
```

**Weekly Check-in**:
```
THE PERFECT MONTH — Week 2

Days completed: 14 / 30
Days remaining: 16

No failures recorded.
The System continues observing.

Two weeks without error.
Two weeks remain.
```

---

### S-2: The Ultimate Day

**Concept**: Maximum output in 24 hours.

| Attribute | Value |
|-----------|-------|
| Challenge | Complete an extreme protocol |
| Duration | 24 hours |
| XP Multiplier | 3.0x on all XP |
| Cooldown | 14 days |
| Title Reward | "The Limitless" |

**Protocol**:
- 25,000+ steps
- 2 separate workouts (AM and PM)
- Protein at 150% of target
- Cold exposure (5+ minutes)
- No alcohol
- No processed food
- No screens after 7 PM
- 8 hours sleep (previous night)

**Entry Narrative**:
```
S-RANK DUNGEON DETECTED: The Ultimate Day

One day.
Maximum output.

Requirements:
• 25,000+ steps
• Two workouts (AM and PM)
• Protein at 150% target
• Cold exposure: 5+ minutes
• No alcohol
• No processed food
• No screens after 7:00 PM
• Requires 8 hours sleep the night before

This will take the entire day.
Other obligations should be cleared.

Duration: 24 hours
Reward: 3.0x XP on all activities + Title: "The Limitless"

The System designed this dungeon for those who ask:
"What is my ceiling?"

This is one answer.

[ENTER DUNGEON]
[I NEED TO PREPARE — Remind me tomorrow]
[DECLINE]
```

---

## Dungeon UI Flow

### Entry Screen
```
┌─────────────────────────────────────────────────────────────┐
│  ⚔️ C-RANK DUNGEON AVAILABLE                                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  THE FOUNDATION DAY                                         │
│                                                              │
│  Not just completion. Excellence.                           │
│                                                              │
│  Challenge:                                                  │
│  • 12,000+ steps (not 10,000)                               │
│  • Protein at 110% of target                                │
│  • Workout complete before noon                             │
│  • Wake on time                                             │
│                                                              │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  Duration: 24 hours                                         │
│  Reward: 2.0x XP on all quests                              │
│  Cooldown: 48 hours after completion                        │
│                                                              │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  Debuff Status: Clear ✓                                     │
│  (Dungeon bonuses disabled during debuff)                   │
│                                                              │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │ ENTER DUNGEON   │  │    DECLINE      │                  │
│  └─────────────────┘  └─────────────────┘                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Active Dungeon Tracker
```
┌─────────────────────────────────────────────────────────────┐
│  ACTIVE DUNGEON: The Foundation Day                         │
│  Time Remaining: 14h 23m                                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Progress:                                                   │
│  [✓] Wake on time                    ✓ Complete             │
│  [ ] Workout before noon             ○ Pending (4h 23m)     │
│  [~] Steps 12,000+                   6,847 / 12,000        │
│  [ ] Protein 110%                    ○ Pending              │
│                                                              │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  Status: ON TRACK                                           │
│  Potential Reward: 2.0x XP (~200 XP)                        │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              ABANDON DUNGEON                         │   │
│  │         (Partial credit for completed items)         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Dungeon Availability Rules

| Rule | Description |
|------|-------------|
| **Level Gating** | Must reach required level to see dungeon |
| **One Active** | Only one dungeon active at a time |
| **Cooldown** | Must wait after completion before re-entry |
| **Debuff Block** | Cannot enter new dungeon while debuff active |
| **Boss Priority** | During active boss fight, S-rank dungeons locked |
| **Rotation** | Not all dungeons available every day (curated selection) |

### Daily Dungeon Selection

Each day, the system shows 3-4 available dungeons:
- 1-2 from player's unlocked tier
- 1 from one tier below (easier option)
- 1 from one tier above (stretch option, if close to unlock)

---

## Content Summary

| Content Type | Count |
|--------------|-------|
| Dungeon definitions | 15 |
| Entry narratives | 15 |
| Completion narratives | 15 |
| Failure narratives | 15 |
| Progress updates | 20+ |
| Title rewards | 2 (S-rank) |
| **Total** | ~80 items |

---

## Dungeon Rewards Summary

| Rank | Example Dungeon | Base XP | With Multiplier |
|------|-----------------|---------|-----------------|
| E | Morning Protocol | 40 | 60 |
| D | The Double | 80 | 140 |
| C | Foundation Day | 100 | 200 |
| B | Iron Week | 280 | 630 |
| A | Transformation Week | 700 | 1,750 |
| S | Perfect Month | 3,000 | 9,000 |

The progression is meaningful. S-rank dungeons are legitimate achievements.
