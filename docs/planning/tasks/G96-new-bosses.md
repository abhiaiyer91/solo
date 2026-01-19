# G96: New Bosses (The Negotiator & The Tomorrow)

## Overview

Add two new bosses that represent additional internal patterns players struggle with: "The Negotiator" (compromising standards) and "The Tomorrow" (chronic procrastination). These expand the boss roster beyond the existing three.

## Context

**Source:** Ideation loop --topic "Making this an addicting story"
**Design Doc:** `docs/content/addictive-narrative-design.md`
**Current State:** Three bosses exist (Inconsistent One, Excuse Maker, Comfortable Self)

## The Psychology

These bosses personify specific failure patterns:
- **The Negotiator:** The voice that says "close enough" — partial efforts, rounding up, cutting corners
- **The Tomorrow:** Chronic "I'll start Monday" thinking — procrastination as self-deception

## Boss Specifications

### Boss 4: The Negotiator

| Property | Value |
|----------|-------|
| ID | `the-negotiator` |
| Unlock Level | 12 |
| Prerequisite | Defeated The Excuse Maker |
| Duration | 21 days |
| XP Reward | 750 |
| Title Reward | "The Uncompromising" |

**Fight Mechanics:**
- Must achieve 100% quest completion (no partial credit) for 7/21 days
- Must exceed targets by 10%+ for at least 3 days
- No "barely made it" completions count

**Phase Structure:**
1. **Phase 1: Recognition** (Days 1-7) — Notice the negotiation pattern
2. **Phase 2: Precision** (Days 8-14) — Zero tolerance for "close enough"
3. **Phase 3: Excellence** (Days 15-21) — Exceed minimums, don't just meet them

### Boss 5: The Tomorrow

| Property | Value |
|----------|-------|
| ID | `the-tomorrow` |
| Unlock Level | 8 |
| Prerequisite | Defeated The Inconsistent One |
| Duration | 14 days |
| XP Reward | 600 |
| Title Reward | "The Present" |

**Fight Mechanics:**
- Must complete at least one quest before noon each day
- No "I'll catch up tonight" allowed
- Front-load the day

**Phase Structure:**
1. **Phase 1: Awareness** (Days 1-7) — Recognize the procrastination pattern
2. **Phase 2: Action** (Days 8-14) — Act in the morning, not "later"

## Acceptance Criteria

- [ ] Add both bosses to boss definitions
- [ ] Create all narrative content (intro, phases, victory, defeat)
- [ ] Implement fight mechanics (100% completion, exceed targets, morning completion)
- [ ] Add unlock conditions to progression service
- [ ] Create boss encounter UI for both
- [ ] Add titles to title system

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `server/src/db/seed.ts` | Modify | Add boss definitions |
| `server/src/services/boss.ts` | Modify | Add fight mechanics |
| `server/src/db/seed-narrative.ts` | Modify | Add all boss content |
| `server/src/db/seed-titles.ts` | Modify | Add title rewards |

## Narrative Content: The Negotiator

```typescript
// boss.negotiator.intro
"You've met me before.
I'm the voice that says 'close enough.'
8,000 steps when you needed 10,000.
Four days when you promised yourself seven.

I am every corner you've ever cut.
Every standard you've lowered.
Every time 'good enough' became the goal.

I am not your enemy.
I am your architect.
I've built your ceiling lower than you know."

// boss.negotiator.phase1.intro
"PHASE 1: RECOGNITION

For the next 7 days, the System will track not just completion—
but precision.

How many times do you negotiate with yourself?
Let's count."

// boss.negotiator.phase2.intro
"PHASE 2: PRECISION

7 days of observation complete.
The negotiation patterns are documented.

Now, zero tolerance.
100% means 100%.
10,000 steps means 10,000 steps.
Not 9,847. Not 'basically there.'

The System will not round up."

// boss.negotiator.phase3.intro
"PHASE 3: EXCELLENCE

Precision is not enough.
You've learned to hit targets.
Now learn to exceed them.

Minimums are for beginners.
You are no longer a beginner.

Exceed your targets. By design, not accident."

// boss.negotiator.defeat
"THE NEGOTIATOR — DEFEATED

The voice that said 'close enough'
has been silenced.

Not forever.
It will return, quieter, at unexpected moments.
But now you will recognize it.
Now you know its cost.

TITLE EARNED: The Uncompromising
SHADOW EXTRACTED: The Negotiator

New ability: You will feel discomfort when cutting corners.
That discomfort is the scar of this battle."
```

## Narrative Content: The Tomorrow

```typescript
// boss.tomorrow.intro
"Don't worry about me.
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
And I've been winning for years."

// boss.tomorrow.phase1.intro
"PHASE 1: AWARENESS

For the next 7 days, the System will track
when you act, not just whether you act.

How often does 'later' become 'never'?
The data will tell."

// boss.tomorrow.phase2.intro
"PHASE 2: ACTION

The pattern is clear now.
The mornings you act, the days succeed.
The mornings you wait, the days slip away.

New requirement: One quest completed before noon.
Every day.
No exceptions.

Tomorrow doesn't count.
Only today."

// boss.tomorrow.defeat
"THE TOMORROW — DEFEATED

The voice that promised 'later'
has been silenced.

Later never comes.
Only now comes.
You've proven you understand this.

TITLE EARNED: The Present
SHADOW EXTRACTED: The Tomorrow

New ability: When you hear 'I'll do it tomorrow,'
you will feel the lie.
That awareness is your weapon."
```

## Implementation Notes

1. **Fight mechanics are different** — Negotiator requires precision, Tomorrow requires timing
2. **Time tracking** — Tomorrow boss needs quest completion timestamps
3. **Exceed targets** — Need to track not just completion but margin
4. **Morning definition** — "Before noon" in player's timezone

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Both bosses appear in boss list when unlocked
- [ ] Fight mechanics work correctly
- [ ] All narrative content displays properly
- [ ] Titles awarded on victory
- [ ] No TypeScript errors
- [ ] Existing tests pass
