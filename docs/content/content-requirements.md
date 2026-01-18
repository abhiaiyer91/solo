# Content Requirements — Writer's Brief

This document lists every piece of narrative content needed for the Solo Leveling Fitness Quest System. Use this as a checklist for content creation.

---

## Voice Guidelines

Before writing anything, internalize the System's voice:

### The System Is:
- Cold but not cruel
- Observational, not judgmental
- Precise, not robotic
- Philosophical, not preachy
- Detached, not uncaring

### The System Never:
- Uses exclamation marks
- Says "you can do it" or similar encouragement
- Expresses disappointment
- Asks "why" questions
- Uses emoji
- Celebrates excessively
- Guilts or shames

### The System Always:
- States facts
- Uses short, declarative sentences
- References data when relevant
- Ends with forward-looking options
- Maintains consistent tone regardless of context
- Treats the player as an intelligent adult

### Example Transformations

| ❌ Wrong | ✅ Right |
|---------|---------|
| "Great job on your workout!" | "Workout logged. Strength data recorded." |
| "Don't give up, you've got this!" | "Continuation is optional. The System records either choice." |
| "You broke your streak :(" | "Streak terminated. Counter reset. Record remains." |
| "Welcome back! We missed you!" | "System reactivated. Last activity: 12 days ago." |

---

## Content Inventory

### Summary

| Category | Items Needed | Priority |
|----------|-------------|----------|
| Onboarding | 5 | P0 |
| Daily Quest Narratives | 20+ | P0 |
| Streak Milestones | 8 | P0 |
| Debuff/Recovery | 10 | P0 |
| Level Up | 10 | P1 |
| Boss Content | 30+ | P1 |
| Title Content | 25+ | P1 |
| Dungeon Content | 20+ | P2 |
| Season Content | 15+ | P1 |
| Failure/Return | 15+ | P0 |
| Rotating Quest Descriptions | 15+ | P1 |
| Bonus Quest Descriptions | 15+ | P2 |
| System Philosophy | 10+ | P1 |
| **Total** | **~200 items** | — |

---

## P0: Critical Path Content

### 1. Onboarding Sequence (5 items)

| Key | Trigger | Content Needed |
|-----|---------|----------------|
| `onboarding.detection` | Account creation | System detects dormant capability |
| `onboarding.terms` | After detection | System explains what it is/isn't |
| `onboarding.accept` | Before accept button | Final statement before entry |
| `onboarding.first_quests` | After accept | Introduction to daily quests |
| `onboarding.title_assigned` | After first quests shown | "The Beginner" title assignment |

**Example - onboarding.detection**:
```
A dormant capability has been detected.

Physical output: underdeveloped
Recovery capacity: unstable
Discipline coefficient: unknown

You have been granted access to the System.
```

---

### 2. Daily Quest Narratives (20+ items)

#### Quest Board Headers

| Key | Condition | Content Needed |
|-----|-----------|----------------|
| `daily.header.default` | Normal day | Standard quest introduction |
| `daily.header.streak_7` | 7+ day streak | Acknowledge consistency |
| `daily.header.streak_30` | 30+ day streak | Acknowledge habit formation |
| `daily.header.debuff` | Debuff active | Note reduced efficiency |
| `daily.header.weekend` | Saturday/Sunday | Weekend bonus available |
| `daily.header.monday` | Monday | Week begins |
| `daily.header.boss_active` | In boss fight | Reference ongoing encounter |

#### Individual Quest Descriptions

| Key | Quest | Content Needed |
|-----|-------|----------------|
| `quest.core.movement.desc` | Steps | Why movement matters |
| `quest.core.strength.desc` | Workout | Why strength matters |
| `quest.core.fuel.desc` | Protein | Why nutrition matters |
| `quest.core.discipline.desc` | Wake time | Why discipline matters |

#### Quest Completion Messages

| Key | Condition | Content Needed |
|-----|-----------|----------------|
| `quest.complete.default` | Any quest done | Neutral acknowledgment |
| `quest.complete.exceeded` | Exceeded target | Note the excess |
| `quest.complete.barely` | Just made target | Note the margin |
| `quest.complete.all` | All daily done | End of day complete |
| `quest.complete.partial` | Day ended, some incomplete | Record partial |

---

### 3. Streak Milestones (8 items)

| Key | Trigger | Content Needed |
|-----|---------|----------------|
| `streak.milestone.3` | 3-day streak | First milestone (minimal) |
| `streak.milestone.7` | 7-day streak | First bonus unlocked |
| `streak.milestone.14` | 14-day streak | Second bonus tier |
| `streak.milestone.21` | 21-day streak | Habit formation reference |
| `streak.milestone.30` | 30-day streak | Major milestone |
| `streak.milestone.60` | 60-day streak | Rare acknowledgment |
| `streak.milestone.90` | 90-day streak | Elite status |
| `streak.milestone.365` | 365-day streak | Annual (very rare) |

**Example - streak.milestone.30**:
```
30 CONSECUTIVE DAYS RECORDED

Habit formation threshold reached.

The neural pathways have begun to shift.
Resistance will decrease.
The action will become default.

Streak Bonus Upgraded: +25% XP

This is not motivation.
This is architecture.
```

---

### 4. Debuff & Recovery (10 items)

| Key | Trigger | Content Needed |
|-----|---------|----------------|
| `debuff.warning` | End of day, 1 quest missed | Warning of potential debuff |
| `debuff.applied` | 2+ quests missed | Debuff activation |
| `debuff.active.reminder` | Login while debuff active | Current debuff status |
| `debuff.cleared` | 24 hours passed | Debuff expiration |
| `debuff.cleared.by_action` | Completed all quests while debuff | Cleared through action |

**Example - debuff.applied**:
```
SYSTEM NOTICE: PERFORMANCE DEGRADATION

Core tasks incomplete: {{missed_count}}

No punishment issued.
Efficiency temporarily reduced.

For the next 24 hours:
• XP gains: -10%
• Dungeon bonuses: Disabled

You are not being punished.
You are experiencing the cost of neglect.

The System reflects reality—nothing more.
```

---

### 5. Failure & Return Content (15+ items)

#### Streak Breaking

| Key | Condition | Content Needed |
|-----|-----------|----------------|
| `streak.broken.short` | 3-6 day streak lost | Minimal acknowledgment |
| `streak.broken.medium` | 7-13 day streak lost | Some weight |
| `streak.broken.long` | 14-29 day streak lost | Significant loss |
| `streak.broken.major` | 30+ day streak lost | Major loss, careful tone |

#### Player Return

| Key | Condition | Content Needed |
|-----|-----------|----------------|
| `return.short` | 3-6 days absent | Quick return |
| `return.medium` | 7-14 days absent | Week+ absence |
| `return.long` | 15-29 days absent | Extended absence |
| `return.very_long` | 30+ days absent | Major return |
| `return.protocol.offer` | Any return after 7+ days | Offer Return Protocol |
| `return.protocol.accept` | Accepts protocol | Protocol begins |
| `return.protocol.complete` | Finishes protocol | Protocol success |
| `return.protocol.decline` | Declines protocol | Full intensity |

---

## P1: Core Experience Content

### 6. Level Up Messages (10 items)

| Key | Condition | Content Needed |
|-----|-----------|----------------|
| `levelup.default` | Any level up | Standard level increase |
| `levelup.milestone.5` | Level 5 (boss unlock) | Note new content available |
| `levelup.milestone.10` | Level 10 | Significant progress |
| `levelup.milestone.20` | Level 20 (final boss) | Major milestone |
| `levelup.stats` | Any level (stats portion) | Stat increases |

**Example - levelup.default**:
```
LEVEL UP DETECTED

Level {{old_level}} → Level {{new_level}}

{{stat_changes}}

No celebration required.
The System does not applaud.
Progress is expected.
```

---

### 7. Boss Content (30+ items)

#### Boss 1: The Inconsistent One

| Key | Content Needed |
|-----|----------------|
| `boss.inconsistent.intro` | Initial encounter monologue |
| `boss.inconsistent.desc` | Description |
| `boss.inconsistent.phase1.intro` | Phase 1 "Recognition" start |
| `boss.inconsistent.phase1.progress` | Mid-phase update |
| `boss.inconsistent.phase1.complete` | Phase 1 → 2 transition |
| `boss.inconsistent.phase2.intro` | Phase 2 "Resistance" start |
| `boss.inconsistent.phase2.progress` | Mid-phase update |
| `boss.inconsistent.phase2.complete` | Phase 2 → 3 transition |
| `boss.inconsistent.phase3.intro` | Phase 3 "Override" start |
| `boss.inconsistent.phase3.progress` | Mid-phase update |
| `boss.inconsistent.defeat` | Victory message |
| `boss.inconsistent.failed` | Phase failure message |
| `boss.inconsistent.abandoned` | Abandonment message |

**Example - boss.inconsistent.intro**:
```
THREAT DETECTED

A pattern has been identified in your history.
It has a name.

THE INCONSISTENT ONE

Your pattern of starting and stopping.
The cycle that defines failure.

This opponent has defeated you before.
Not through strength — but through time.
It waits for enthusiasm to fade.
It knows you will negotiate.
```

#### Boss 2: The Excuse Maker

(Same structure as Boss 1 - 13 items)

#### Boss 3: The Comfortable Self

(Same structure - 13 items)

---

### 8. Title Content (25+ items)

Each title needs:
- `title.{name}.desc` - Description
- `title.{name}.system` - System observation on earn
- `title.{name}.lost` - Message if title regresses (if applicable)

| Title | Keys Needed |
|-------|-------------|
| The Beginner | desc, system |
| The Consistent | desc, system, lost |
| The Walker | desc, system |
| Early Riser | desc, system |
| Alcohol Slayer | desc, system |
| Iron Will | desc, system, lost |
| Centurion | desc, system |
| Pattern Breaker | desc, system |
| The Returner | desc, system |
| Phoenix | desc, system |
| Boss Slayer | desc, system |

**Example - title.iron_will.system**:
```
TITLE ASSIGNED: Iron Will

Action occurs regardless of internal resistance.
Willpower coefficient exceeds baseline.

Passive Effect: Debuff penalty reduced to 5%

This title can be lost.
The System will observe if it is.
```

---

### 9. Season Content (15+ items)

#### Season 1: Awakening

| Key | Content Needed |
|-----|----------------|
| `season.1.intro` | Season 1 opening narrative |
| `season.1.desc` | Description/theme |
| `season.1.quest.intro` | Seasonal quest introduction |
| `season.1.midpoint` | Mid-season check-in |
| `season.1.outro` | Season 1 completion summary |

#### Season 2: The Contender

(Same structure - 5 items)

#### Season 3: The Monarch

(Same structure - 5 items)

---

### 10. Rotating Quest Descriptions (15+ items)

| Key | Quest | Content Needed |
|-----|-------|----------------|
| `quest.rotating.hydration` | Hydration | Description + why it matters |
| `quest.rotating.stretch` | Stretching | Description |
| `quest.rotating.alcohol_free` | Alcohol-free day | Description |
| `quest.rotating.screen_sunset` | No screens after 9pm | Description |
| `quest.rotating.meditation` | Meditation | Description |
| `quest.rotating.cold_exposure` | Cold shower/ice bath | Description |
| `quest.rotating.meal_prep` | Meal prep | Description |
| `quest.rotating.gratitude` | Gratitude log | Description |
| `quest.rotating.deep_work` | 90 min focused work | Description |
| `quest.rotating.nature` | Time outdoors | Description |
| `quest.rotating.posture` | Posture exercises | Description |
| `quest.rotating.morning_movement` | Activity before 9am | Description |
| `quest.rotating.walking_meeting` | Walk during call | Description |
| `quest.rotating.no_sugar` | No added sugar | Description |
| `quest.rotating.social_movement` | Exercise with someone | Description |

---

## P2: Extended Content

### 11. Dungeon Content (20+ items)

For each dungeon rank (E through S), we need:
- Entry narrative
- Challenge description
- Completion message
- Failure message
- Time warning (halfway, 5 min left)

| Rank | Dungeons Needed |
|------|-----------------|
| E-Rank | 3 dungeons |
| D-Rank | 3 dungeons |
| C-Rank | 3 dungeons |
| B-Rank | 2 dungeons |
| A-Rank | 2 dungeons |
| S-Rank | 2 dungeons |

**Example - dungeon.e.morning_protocol.entry**:
```
E-RANK DUNGEON: The Morning Protocol

Complete your workout before 8:00 AM.

Duration: Until 8:00 AM
Reward: 1.5x workout XP

Entry is optional.
The early morning is difficult.
That is why this exists.

[ENTER]
[DECLINE]
```

---

### 12. Bonus Quest Descriptions (15+ items)

| Key | Type | Content Needed |
|-----|------|----------------|
| `quest.bonus.extra_mile` | Stretch | 15k steps description |
| `quest.bonus.dawn_warrior` | Time | Pre-6am workout |
| `quest.bonus.trifecta` | Stack | Triple completion |
| `quest.bonus.double_down` | Stretch | 2x protein target |
| `quest.bonus.iron_morning` | Time | Workout + steps before 9am |
| `quest.bonus.clean_sweep` | Stack | All quests including rotating |
| `quest.bonus.weekend_warrior` | Streak | Complete both weekend days |

---

### 13. System Philosophy (10+ items)

Standalone philosophical statements used as fragments:

| Key | Theme | Content Needed |
|-----|-------|----------------|
| `philosophy.action` | Action over feeling | "The System responds to action, not intention" |
| `philosophy.consistency` | Small daily actions | On compound effects |
| `philosophy.failure` | Failure as data | On neutral recording |
| `philosophy.identity` | Becoming vs doing | On transformation |
| `philosophy.time` | Time as asset | On urgency without panic |
| `philosophy.comfort` | Comfort as enemy | On growth requiring discomfort |
| `philosophy.progress` | Progress measurement | On distance from origin |
| `philosophy.motivation` | Motivation is unreliable | On discipline vs motivation |
| `philosophy.endgame` | No final boss | The lifelong question |
| `philosophy.observation` | Being watched | On the System's role |

**Example - philosophy.motivation**:
```
Motivation is a guest.
It arrives unannounced and leaves without warning.

Discipline is a resident.
It remains when motivation has gone home.

The System does not measure motivation.
Only action.
```

---

## Content Templates

### Template: Boss Phase Transition

```
PHASE {{phase_num}} COMPLETE: {{phase_name}}

{{reflection_on_phase}}

Phase {{next_phase_num}} begins: {{next_phase_name}}

{{preview_of_challenge}}

{{system_observation}}
```

### Template: Level Up

```
LEVEL UP DETECTED

Level {{old}} → Level {{new}}

{{stat_increases}}

{{unlocks_if_any}}

{{system_observation}}
```

### Template: Streak Milestone

```
{{streak_days}} CONSECUTIVE DAYS RECORDED

{{significance_statement}}

Streak Bonus {{action}}: {{bonus}}

{{philosophical_observation}}
```

---

## Writing Process

### For Each Content Item:

1. **Read the trigger context** - When does this appear?
2. **Consider player state** - What are they feeling?
3. **Write cold first draft** - Get the facts down
4. **Remove encouragement** - Delete anything that sounds like cheerleading
5. **Shorten** - Cut every unnecessary word
6. **Add one philosophical line** - Give it weight
7. **Test the tone** - Read it in a flat, robotic voice. Does it work?

### Quality Checklist:

- [ ] No exclamation marks
- [ ] No "you can do it" type phrases
- [ ] Data/facts referenced where relevant
- [ ] Short sentences (mostly under 10 words)
- [ ] Ends with observation, not command
- [ ] Would feel appropriate at 3am after a failure

---

## Delivery Format

Content is seeded directly into the `narrativeContents` database table via seed script:

```typescript
// server/src/db/seed-narrative.ts
await db.insert(narrativeContents).values([
  {
    key: 'onboarding.detection',
    category: 'ONBOARDING',
    content: `A dormant capability has been detected.

Physical output: underdeveloped
Recovery capacity: unstable
Discipline coefficient: unknown

You have been granted access to the System.`,
    isActive: true,
  },
  // ... more content
]);
```

---

## Priority Order for Writing

1. **P0 - Critical Path** (Must have for MVP)
   - Onboarding (5)
   - Daily quest core narratives (10)
   - Streak milestones (5 core: 3,7,14,21,30)
   - Debuff messages (5)
   - Basic failure/return (5)

2. **P1 - Core Experience** (Needed for full v1)
   - Level up messages (10)
   - Boss 1 complete content (13)
   - Season 1 content (5)
   - Core titles (8)
   - Rotating quest descriptions (15)

3. **P2 - Extended** (v2 and beyond)
   - Boss 2 & 3 content (26)
   - Seasons 2 & 3 content (10)
   - Dungeon content (20)
   - Bonus quests (15)
   - Remaining titles (17)
   - Philosophy fragments (10)

**Total P0**: ~30 items
**Total P1**: ~50 items
**Total P2**: ~100 items
