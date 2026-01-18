# Quest Variety System

The core loop needs stability AND variety. Players need to know what's expected (core quests) while getting enough novelty to stay engaged (rotating quests).

---

## Quest Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DAILY QUEST BOARD                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    CORE QUESTS (Always Present)                      │   │
│  │                           4 quests                                   │   │
│  │                                                                      │   │
│  │    [Steps]    [Workout]    [Protein]    [Recovery]                  │   │
│  │                                                                      │   │
│  │    These define the foundation. Same every day.                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                   ROTATING QUEST (Changes Daily)                     │   │
│  │                           1 quest                                    │   │
│  │                                                                      │   │
│  │    [Today: Hydration] - Drink 8 glasses of water                    │   │
│  │                                                                      │   │
│  │    Adds variety. Unlocks at Day 8.                                  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                   BONUS QUEST (Optional Challenge)                   │   │
│  │                           1 quest                                    │   │
│  │                                                                      │   │
│  │    [BONUS: The Extra Mile] - Hit 15,000 steps (+50% XP)             │   │
│  │                                                                      │   │
│  │    Optional. Higher difficulty. Extra reward. Unlocks at Level 5.   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                  SEASONAL QUEST (Season-Specific)                    │   │
│  │                           1 quest                                    │   │
│  │                                                                      │   │
│  │    [SEASON 2: Contender Challenge] - Complete workout before noon   │   │
│  │                                                                      │   │
│  │    Tied to current season theme. Unlocks in Season 2+.              │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Core Quests (The Foundation)

These 4 quests appear every single day. They define the minimum viable day.

| Quest | Category | Metric | Default Target | XP | Partial |
|-------|----------|--------|----------------|-----|---------|
| **Movement** | AGI | Steps | 10,000 | 25 | 10 XP at 5,000 |
| **Strength** | STR | Workout completed | Boolean | 40 | None |
| **Fuel** | VIT | Protein target hit | Boolean | 20 | None |
| **Discipline** | DISC | Wake by set time | Boolean | 15 | None |

**Streak Requirement**: Complete 3/4 core quests to maintain streak.

**Narrative**:
```
DAILY QUESTS GENERATED

These tasks are trivial.
That is why most people fail them.

Movement keeps decay away.
Strength prevents helplessness.
Fuel determines output.
Discipline separates intention from action.
```

**Why These Four**:
- Movement (steps) - Low barrier, measurable, builds baseline
- Strength (workout) - High impact, commitment signal
- Fuel (protein) - Nutrition without complexity
- Discipline (wake time) - Sets daily tone, proves self-control

---

## Rotating Quests

One quest that changes daily, drawn from a pool. Adds variety without overwhelming.

### Unlock
- **When**: Day 8 (after first week of core loop)
- **Narrative**:
```
SYSTEM UPDATE

Core patterns established.
Additional variables introduced.

Rotating Quest slot unlocked.

One supplementary task will appear daily.
It changes. The core does not.

Completion is optional for streak maintenance.
Completion affects stat growth.
```

### Rotating Quest Pool

| Quest | Category | Metric | Target | XP | Frequency Weight |
|-------|----------|--------|--------|-----|------------------|
| Hydration | VIT | Water glasses | 8 | 15 | High |
| Stretch | AGI | Stretching session | 10 min | 15 | High |
| Alcohol-Free | VIT | No alcohol | Boolean | 15 | Medium |
| Screen Sunset | DISC | No screens after 9pm | Boolean | 15 | Medium |
| Walking Meeting | AGI | Walk during call/meeting | 1 | 20 | Low |
| Morning Movement | AGI | 10 min activity before 9am | Boolean | 20 | Medium |
| Meal Prep | VIT | Prep tomorrow's meal | Boolean | 15 | Low |
| Meditation | DISC | Meditation session | 5 min | 15 | Medium |
| Cold Exposure | VIT | Cold shower/ice bath | Boolean | 25 | Low |
| Social Movement | AGI | Exercise with someone | Boolean | 25 | Low |
| No Sugar | VIT | No added sugar | Boolean | 20 | Low |
| Gratitude Log | DISC | Write 3 things | Boolean | 10 | High |
| Deep Work | DISC | 90 min focused block | Boolean | 20 | Medium |
| Nature Time | AGI | 20 min outdoors | Boolean | 15 | Medium |
| Posture Check | STR | Posture exercises | 5 min | 10 | High |

### Selection Algorithm

```typescript
function selectRotatingQuest(player: Player, date: Date): Quest {
  // Filter by unlocked quests (some require level/achievements)
  const available = ROTATING_POOL.filter(q => q.unlockedFor(player));

  // Weight by:
  // 1. Hasn't appeared in last 3 days
  // 2. Matches player's weak stats
  // 3. Day of week patterns (meditation on Monday, social on weekend)
  // 4. Random element

  const weights = available.map(q => ({
    quest: q,
    weight: calculateWeight(q, player, date)
  }));

  return weightedRandomSelect(weights);
}
```

### Rotating Quest Narrative

Each rotating quest has a brief System observation:

**Hydration**:
```
ROTATING QUEST: Hydration

Water intake affects everything.
Cognition. Recovery. Performance.

Target: 8 glasses
Reward: 15 XP

Most people are chronically dehydrated.
The System does not assume you are different.
```

**Cold Exposure**:
```
ROTATING QUEST: Cold Exposure

Discomfort is a signal, not a stop sign.
The body adapts when forced.

Target: Cold shower or ice bath
Reward: 25 XP

This is optional.
Comfort is also optional.
```

---

## Bonus Quests

Optional high-difficulty challenges that push beyond the baseline.

### Unlock
- **When**: Level 5
- **Narrative**:
```
BONUS QUEST SLOT DETECTED

You have reached sufficient level for optional challenges.

Bonus quests offer:
• Higher difficulty
• Higher XP reward
• No streak penalty for skipping

They exist for those who want more.
Not everyone wants more.

The System does not judge either choice.
```

### Bonus Quest Types

| Type | Description | XP Modifier | Example |
|------|-------------|-------------|---------|
| **Stretch Goal** | Exceed a core quest target | +50% | 15,000 steps vs 10,000 |
| **Time Challenge** | Complete with time constraint | +75% | Workout before 7am |
| **Stack** | Combine multiple quests | +100% | Workout + 12,000 steps + protein |
| **Streak Bonus** | Available only during streaks | +50% | "Maintain 14-day streak" |

### Daily Bonus Quest Examples

**The Extra Mile** (Stretch Goal):
```
BONUS QUEST: The Extra Mile

Standard movement target: 10,000 steps
Bonus target: 15,000 steps

This is not required.
This is not expected.
This is available.

Reward: 38 XP (base 25 + 50%)
```

**Dawn Warrior** (Time Challenge):
```
BONUS QUEST: Dawn Warrior

Complete strength training before 6:00 AM.

Most people are sleeping.
You could be sleeping.

Reward: 70 XP (base 40 + 75%)
```

**The Trifecta** (Stack):
```
BONUS QUEST: The Trifecta

Complete in a single day:
• 12,000+ steps
• Strength workout
• Protein target

Three systems working together.

Reward: 85 XP (combined base + 100% bonus)
```

### Bonus Quest Rotation

- New bonus quest each day
- Can be "rerolled" once per day (costs nothing)
- Some bonus quests are rare (appear once per week)
- Weekend bonus quests are typically harder with higher rewards

---

## Seasonal Quests

Unique quests that only appear during specific seasons, reinforcing the season's theme.

### Season 1: Awakening (Foundation Focus)

| Quest | Description | XP | Frequency |
|-------|-------------|-----|-----------|
| First Steps | Complete all core quests for 3 consecutive days | 50 | Once |
| The Mirror | Log your starting weight/measurements | 25 | Once |
| Baseline Week | Complete 5/7 days this week | 75 | Weekly |
| Pattern Recognition | Identify your weakest quest category | 25 | Once |

**Season 1 Quest Narrative**:
```
SEASONAL QUEST: Baseline Week

Season 1 is about measurement.
Before improvement comes awareness.

Complete 5 out of 7 days this week.
Not perfection. Consistency.

Reward: 75 XP + Season 1 Progress
```

### Season 2: The Contender (Challenge Focus)

| Quest | Description | XP | Frequency |
|-------|-------------|-----|-----------|
| Morning Dominance | Complete workout before 8am, 3x this week | 100 | Weekly |
| The Refusal | 7 consecutive alcohol-free days | 75 | Once |
| Comfort Rejection | Complete a cold exposure 3x this week | 75 | Weekly |
| No Negotiation | Complete ALL quests (core + rotating) 5/7 days | 150 | Weekly |

**Season 2 Quest Narrative**:
```
SEASONAL QUEST: The Refusal

This season tests what you say "no" to.

Seven consecutive days without alcohol.
The social pressure will come.
The justifications will come.

Refuse them.

Reward: 75 XP + "The Refusal" badge
```

### Season 3: The Monarch (Mastery Focus)

| Quest | Description | XP | Frequency |
|-------|-------------|-----|-----------|
| The Standard | Perfect week (7/7 all quests) | 200 | Weekly |
| Optimization | Beat your average step count by 20% | 100 | Weekly |
| Teaching | Help someone else complete their workout | 75 | Weekly |
| The Protocol | Create and follow a custom routine for 7 days | 150 | Once |

**Season 3 Quest Narrative**:
```
SEASONAL QUEST: The Protocol

You know enough to design your own challenge.

Create a 7-day routine:
• Define daily requirements
• Set your own targets
• Execute without modification

The System will observe.
It will not assist.

Reward: 150 XP + Self-Directed badge
```

---

## Quest Unlock Progression

| Day/Level | Unlocks |
|-----------|---------|
| Day 1 | 4 core quests |
| Day 8 | Rotating quest slot |
| Level 5 | Bonus quest slot |
| Season 2 | Seasonal quest slot |
| Level 10 | Rare rotating quests |
| Season 3 | Custom challenge creation |

---

## Quest Board UI Concept

```
┌─────────────────────────────────────────────────────────────┐
│  DAY 23                                    STREAK: 23 🔥    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  CORE QUESTS                                   3/4 COMPLETE │
│  ───────────────────────────────────────────────────────── │
│  [✓] Movement      10,847 / 10,000 steps           +25 XP  │
│  [✓] Strength      Upper body completed            +40 XP  │
│  [ ] Fuel          142g / 160g protein            pending  │
│  [✓] Discipline    Woke 6:15 AM (target: 6:30)    +15 XP  │
│                                                              │
│  ROTATING QUEST                                   OPTIONAL  │
│  ───────────────────────────────────────────────────────── │
│  [ ] Hydration     5 / 8 glasses                  +15 XP   │
│                                                              │
│  BONUS QUEST                                      OPTIONAL  │
│  ───────────────────────────────────────────────────────── │
│  [ ] The Extra Mile    10,847 / 15,000 steps      +38 XP   │
│      (68% complete - keep going for bonus)                  │
│                                                              │
│  SEASONAL QUEST                            SEASON 2 - WEEK 3│
│  ───────────────────────────────────────────────────────── │
│  [ ] Morning Dominance  1/3 early workouts        +100 XP  │
│      (Complete workout before 8am two more times)           │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│  TODAY'S POTENTIAL: 233 XP        EARNED SO FAR: 80 XP     │
└─────────────────────────────────────────────────────────────┘
```

---

## Narrative Integration

### Morning Quest Generation

```
DAILY QUESTS GENERATED

Core tasks: 4
Rotating task: Hydration
Bonus available: The Extra Mile
Seasonal progress: Morning Dominance (1/3)

Total potential XP: 233

The System has calculated your ceiling.
What you reach is your decision.
```

### End of Day Summary

**All Complete**:
```
DAILY LOG: COMPLETE

Core: 4/4
Rotating: 1/1
Bonus: 1/1

Total XP earned: 233
Above average by: 47%

The System notes your output exceeded baseline.
Tomorrow's quests will be ready at midnight.
```

**Partial Complete**:
```
DAILY LOG: RECORDED

Core: 3/4 (Fuel incomplete)
Rotating: 0/1 (Hydration incomplete)
Bonus: 0/1 (Declined)

Total XP earned: 80
Streak: Maintained (3/4 core)

Fuel has been your weakest category for 12 days.
The System observes patterns.
It does not provide solutions.
```

---

## Quest Personalization (Mastra)

The `quest-generator` agent can personalize quest selection:

```typescript
interface QuestPersonalizationContext {
  // Player patterns
  weakestStat: StatType;
  strongestStat: StatType;
  failurePatterns: {
    dayOfWeek: string[];
    questTypes: string[];
    timeOfDay: string[];
  };

  // Current state
  currentStreak: number;
  seasonProgress: number;
  recentPerformance: number; // Last 7 days avg

  // Preferences (learned)
  prefersMorningWorkouts: boolean;
  respondsToStretchGoals: boolean;
  avoidsQuestType: string[];
}
```

**Personalization Examples**:
- Player weak in VIT → More VIT rotating quests
- Player fails Mondays → Easier Monday bonus quest
- Player on long streak → Harder bonus quests
- Player just returned → Gentler rotating quests

---

## Content Needed

| Key | Type | Count Needed |
|-----|------|--------------|
| `quest.rotating.*` | Rotating quest definitions | 15+ |
| `quest.bonus.stretch.*` | Stretch goal templates | 5+ |
| `quest.bonus.time.*` | Time challenge templates | 5+ |
| `quest.bonus.stack.*` | Stack challenge templates | 5+ |
| `quest.seasonal.s1.*` | Season 1 quests | 4+ |
| `quest.seasonal.s2.*` | Season 2 quests | 4+ |
| `quest.seasonal.s3.*` | Season 3 quests | 4+ |
| `quest.narrative.complete` | Completion messages | 10+ variants |
| `quest.narrative.partial` | Partial completion | 10+ variants |

---

## Summary

The quest variety system maintains the stable core loop while adding:

1. **Rotating Quests** - Daily variety from a pool of 15+ options
2. **Bonus Quests** - Optional challenges for engaged players
3. **Seasonal Quests** - Theme-specific goals tied to narrative

**Progression feels like**:
- Week 1: Learn the 4 core quests
- Week 2+: Rotating quest adds daily novelty
- Level 5+: Bonus quests for extra challenge
- Season 2+: Seasonal quests tie into larger narrative

The System generates. The player chooses how much to pursue.
