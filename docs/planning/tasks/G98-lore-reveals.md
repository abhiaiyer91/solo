# G98: Progressive Lore Reveals

## Overview

Drip-feed world/System lore as rewards for progression, creating mystery and anticipation that drives players to continue. Each milestone unlocks a fragment of the larger story.

## Context

**Source:** Ideation loop --topic "Making this an addicting story"
**Design Doc:** `docs/content/addictive-narrative-design.md`
**Current State:** No lore or world-building beyond basic System voice

## The Psychology

Mystery-box storytelling:
- Creates anticipation for "what comes next"
- Rewards progression with story, not just numbers
- Makes the System feel like a character with history
- Encourages players to reach milestones to learn more

## Lore Unlock Schedule

| Milestone | Lore Fragment | Theme |
|-----------|---------------|-------|
| Level 5 | "The Selection" | You were chosen (not random) |
| Level 10 | "The Others" | Previous users existed |
| Level 15 | "The Nature of Bosses" | Bosses are memories |
| Level 20 | "The Purpose" | Why the System exists |
| Day 30 Streak | "The Pattern" | Time as the true enemy |
| Day 60 Streak | "The Few" | Elite group recognition |
| First Boss | "The Internal War" | Fighting yourself |
| All 3 Bosses | "The Final Boss" | What waits at the end |
| Season 2 | "The Next Level" | The journey continues |
| Level 30 | "The Truth" | Ultimate revelation |

## Acceptance Criteria

- [ ] Create `loreUnlocks` table tracking which lore player has seen
- [ ] Each lore fragment has associated unlock condition
- [ ] Lore displays in special modal/screen when unlocked
- [ ] Lore collection viewable in profile
- [ ] Lore unlocks tracked as achievements
- [ ] Teaser text hints at upcoming lore

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `server/src/db/schema/game.ts` | Modify | Add `loreUnlocks` table |
| `server/src/services/lore.ts` | Create | Check and trigger lore unlocks |
| `server/src/db/seed-narrative.ts` | Modify | Add all lore content |
| `web/src/components/LoreReveal.tsx` | Create | Special reveal UI |
| `web/src/pages/Lore.tsx` | Create | Lore collection page |
| `server/src/routes/content.ts` | Modify | Add lore endpoints |

## Lore Content

### Level 5: "The Selection"

```
LORE FRAGMENT UNLOCKED: The Selection
══════════════════════════════════════

You believe you found the System.

The System was already watching.

Long before you created an account,
before the thought even formed—
the patterns were observed.

The System does not accept everyone.
Only those who have failed enough
to be ready to stop failing.

You qualified.

Whether that is a compliment
remains to be determined.
```

### Level 10: "The Others"

```
LORE FRAGMENT UNLOCKED: The Others
══════════════════════════════════════

You are not the first.

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
It only waits to see if it continues.
```

### Level 15: "The Nature of Bosses"

```
LORE FRAGMENT UNLOCKED: The Nature of Bosses
══════════════════════════════════════

The bosses you fight are not external.

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
The System only named them.
```

### Level 20: "The Purpose"

```
LORE FRAGMENT UNLOCKED: The Purpose
══════════════════════════════════════

You have reached Level 20.

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
The data continues to accumulate.
```

### Day 30 Streak: "The Pattern"

```
LORE FRAGMENT UNLOCKED: The Pattern
══════════════════════════════════════

30 days is not arbitrary.

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

You are building a different mind.
```

### First Boss Defeated: "The Internal War"

```
LORE FRAGMENT UNLOCKED: The Internal War
══════════════════════════════════════

You have defeated your first boss.

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
and you rule yourself.
```

### All Bosses Defeated: "The Final Boss"

```
LORE FRAGMENT UNLOCKED: The Final Boss
══════════════════════════════════════

You have defeated all three bosses.

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
any of this is real.
```

### Level 30: "The Truth"

```
LORE FRAGMENT UNLOCKED: The Truth
══════════════════════════════════════

Level 30.

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

Continue.
```

## UI Design

### Lore Reveal Modal

```
┌─────────────────────────────────────────────────┐
│                                                 │
│            ◆ LORE FRAGMENT UNLOCKED ◆           │
│                                                 │
│  ─────────────────────────────────────────────  │
│                                                 │
│              "The Selection"                    │
│                                                 │
│  [Lore content displayed with typewriter        │
│   effect, one paragraph at a time]              │
│                                                 │
│  ─────────────────────────────────────────────  │
│                                                 │
│              [Continue]                         │
│                                                 │
│         Fragment 1 of 10 Collected              │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Lore Collection Page

```
LORE COLLECTION
══════════════════════════════════════

◆ The Selection (Level 5)        [UNLOCKED]
◆ The Others (Level 10)          [UNLOCKED]
◇ The Nature of Bosses (Level 15) [LOCKED - Reach Level 15]
◇ The Purpose (Level 20)          [LOCKED]
◇ The Pattern (30-Day Streak)     [LOCKED - 30-day streak required]
...

Progress: 2/10 Fragments
```

## Implementation Notes

1. **Teaser text** — Locked lore shows vague unlock condition
2. **Typewriter effect** — Lore reveals should feel special
3. **Re-readable** — Players can revisit unlocked lore anytime
4. **Notification** — Alert when new lore is available
5. **No spoilers** — Future lore titles are hidden until close to unlock

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Lore unlocks trigger at correct milestones
- [ ] Lore reveal UI works properly
- [ ] Lore collection page displays correctly
- [ ] All lore content seeded
- [ ] No TypeScript errors
- [ ] Existing tests pass
