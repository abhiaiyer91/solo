# G162: Complete Boss Narrative Content

## Overview
Seed full dialogue trees for all three core bosses. Boss fights are the narrative centerpiece of Journey - they personify the internal enemies that have defeated users before. Currently, zero boss content exists in the database.

## Context
**Source:** Ideation loop - Narrative fulfillment analysis
**Related Docs:**
- `docs/content/content-requirements.md` (boss section)
- `docs/content/addictive-narrative-design.md` (boss philosophy)
- `docs/game-systems/bosses.md` (boss system design)
**Current State:** Boss backend exists and works, but no narrative content seeded

## Content to Seed (39 items across 3 bosses)

### Boss 1: The Inconsistent One (13 items)

| Key | Trigger |
|-----|---------|
| `boss.inconsistent.intro` | Initial encounter |
| `boss.inconsistent.desc` | Boss description |
| `boss.inconsistent.phase1.intro` | Phase 1 "Recognition" |
| `boss.inconsistent.phase1.progress` | Mid-phase |
| `boss.inconsistent.phase1.complete` | Phase 1→2 |
| `boss.inconsistent.phase2.intro` | Phase 2 "Resistance" |
| `boss.inconsistent.phase2.progress` | Mid-phase |
| `boss.inconsistent.phase2.complete` | Phase 2→3 |
| `boss.inconsistent.phase3.intro` | Phase 3 "Override" |
| `boss.inconsistent.phase3.progress` | Mid-phase |
| `boss.inconsistent.defeat` | Victory |
| `boss.inconsistent.failed` | Phase failure |
| `boss.inconsistent.abandoned` | Abandonment |

**Example - boss.inconsistent.intro:**
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

Requirement: 21 consecutive days of discipline.
Phase 1: Recognition (7 days)
Phase 2: Resistance (7 days)
Phase 3: Override (7 days)

The System will observe.
```

**Example - boss.inconsistent.defeat:**
```
THE INCONSISTENT ONE — DEFEATED

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
```

### Boss 2: The Excuse Maker (13 items)

Same structure as Boss 1, themed around external blame:
- "Too busy"
- "Life got in the way"
- "I'll start when..."
- "It's not my fault because..."

**Example - boss.excuse_maker.intro:**
```
THREAT DETECTED

The System has analyzed your failure patterns.
A common thread emerges.

THE EXCUSE MAKER

Every time you stopped, there was a reason.
Travel. Work. Stress. Illness. Weather.
The reasons were always different.
But they had one thing in common:

None of them were you.

This enemy does not fight.
It explains.
It justifies.
It provides an out before you even begin.

Requirement: 14 days without external attribution.
Complete all tasks. Accept no explanations.

The System does not accept reasons.
Only data.
```

### Boss 3: The Comfortable Self (13 items)

Same structure, themed around comfort-seeking:
- Avoiding hard workouts
- Staying in known routines
- Fear of discomfort
- "Good enough" mentality

**Example - boss.comfortable.intro:**
```
THREAT DETECTED

The most dangerous enemy reveals itself.

THE COMFORTABLE SELF

You are capable of more.
You know this.
And you choose less.

Not from laziness.
From comfort.
The workout that doesn't hurt.
The goal that doesn't scare.
The life that doesn't require change.

This enemy does not attack.
It embraces.
It makes the cage warm.

Requirement: 14 days of escalation.
Each day must exceed the day before.
Comfort is the enemy. Discomfort is the path.

The System has observed your ceiling.
Time to break through it.
```

## Acceptance Criteria
- [ ] Boss 1 (Inconsistent One) - 13 items seeded
- [ ] Boss 2 (Excuse Maker) - 13 items seeded
- [ ] Boss 3 (Comfortable Self) - 13 items seeded
- [ ] All content follows voice guidelines
- [ ] Dialogue references player's actual patterns where possible
- [ ] Victory messages feel earned, not celebrated

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| server/src/db/seed-narrative.ts | Modify | Add boss content arrays |

## Implementation Notes
- Create three arrays: `bossInconsistentContent`, `bossExcuseContent`, `bossComfortableContent`
- All items use category `BOSS`
- Keys follow pattern: `boss.{name}.{trigger}`
- Include interpolation placeholders where useful ({{phase_num}}, {{days_complete}})

## Definition of Done
- [ ] All acceptance criteria met
- [ ] 39 boss content items in database
- [ ] Content tested with boss encounter flow
- [ ] No TypeScript errors
