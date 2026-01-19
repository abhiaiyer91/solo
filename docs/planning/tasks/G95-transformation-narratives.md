# G95: Transformation Narratives

## Overview

Enhance level-up and milestone messages to frame progress as personal transformation, not just number increases. Connect game stats to real-world benchmarks to make leveling meaningful.

## Context

**Source:** Ideation loop --topic "Making this an addicting story"
**Design Doc:** `docs/content/addictive-narrative-design.md`
**Current State:** Level-up shows basic "Level X achieved" message

## The Psychology

Progress feels meaningful when it's framed as transformation:
- **Before:** "Level 7 → 8, STR +2"
- **After:** "The body that arrived could do 15 push-ups. This body can do 25."

This reframing connects abstract game numbers to the player's real identity change.

## Narrative Elements

### Level-Up Transformation Message

```
TRANSFORMATION DETECTED

Level {{old_level}} → Level {{new_level}}

{{origin_callback if exists}}

{{stat_transformation}}

{{real_world_benchmark}}

You are becoming someone who was not here before.
```

### Stat Benchmarks (From G52)

| Stat | Value | Real-World Benchmark |
|------|-------|---------------------|
| STR 15 | Beginner | 10-15 push-ups |
| STR 25 | Average | 20-30 push-ups |
| STR 50 | Advanced | 50+ push-ups, 10+ pull-ups |
| AGI 20 | Beginner | 5K in 40 minutes |
| AGI 40 | Average | 5K in 30 minutes |
| AGI 60 | Advanced | 5K in 25 minutes |
| VIT 30 | Average | 7+ hours sleep, no chronic issues |
| DISC 30 | Emerging | 14+ day streaks regularly |
| DISC 60 | Strong | 60+ day streaks |

### Transformation Templates

```typescript
// When STR crosses benchmark threshold
const strTransformations = {
  25: "The average threshold has been crossed. You are now stronger than the median.",
  50: "Advanced strength detected. You have surpassed 80% of the population.",
};

// Generic transformation
const genericTransformation = `
The body that arrived here had STR {{initial_str}}.
This body has STR {{current_str}}.
A difference of {{str_diff}} points.
This is not motivation. This is evidence.
`;
```

## Acceptance Criteria

- [ ] Level-up messages include transformation framing
- [ ] Stat changes reference real-world benchmarks (when crossing thresholds)
- [ ] Store player's initial stats for comparison in transformation messages
- [ ] Origin is referenced in major milestones (if set)
- [ ] Weekly/monthly summaries include transformation language

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `server/src/db/seed-narrative.ts` | Modify | Add transformation templates |
| `server/src/services/level.ts` | Modify | Generate enhanced level-up message |
| `server/src/lib/stat-benchmarks.ts` | Modify | Add transformation text per benchmark |
| `server/src/db/schema/game.ts` | Modify | Store initial stats snapshot |
| `web/src/components/LevelUpModal.tsx` | Modify | Display transformation narrative |

## Content to Seed

### Level-Up Templates

```typescript
// levelup.transformation.default
"TRANSFORMATION DETECTED

Level {{old_level}} → Level {{new_level}}

{{stat_changes}}

Progress is not a feeling.
Progress is measurement.
You are measurably different than before."

// levelup.transformation.origin.accountability
"TRANSFORMATION DETECTED

Level {{old_level}} → Level {{new_level}}

Remember the promise you made?
This is evidence you can keep it."

// levelup.milestone.5
"TRANSFORMATION DETECTED

Level 5 achieved.

The first threshold.
Many claim they will change.
You have 5 levels of evidence that you did.

BOSS FIGHTS: Now available"

// levelup.milestone.10
"TRANSFORMATION DETECTED

Level 10 achieved.

Double digits.
The body and mind have adapted.
This is no longer a project.
This is becoming who you are."

// levelup.milestone.20
"TRANSFORMATION DETECTED

Level 20 achieved.

This level corresponds to military fitness standards.
Not weekend warrior. Not 'pretty fit.'
Operationally capable.

The System notes: you have exceeded initial projections."
```

### Streak Transformation Templates

```typescript
// streak.transformation.30
"30 CONSECUTIVE DAYS RECORDED

Consider who you were 30 days ago.
The person who negotiated with themselves.
The person who needed motivation.

That person is becoming a memory.
This is architecture, not willpower."

// streak.transformation.60
"60 CONSECUTIVE DAYS RECORDED

The habit formation literature suggests 21 days.
You have tripled that.

At this point, missing a day would feel wrong.
That feeling? That is the new you."
```

## Implementation Notes

1. **Store initial stats** — Capture player's Day 1 stats for comparison
2. **Benchmark thresholds** — Only mention benchmarks when crossing them
3. **Origin integration** — Reference origin at major milestones (5, 10, 20)
4. **Avoid repetition** — Rotate transformation framings to stay fresh

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Level-up modal shows transformation message
- [ ] Benchmark crossings are celebrated with context
- [ ] Initial stats are stored and accessible
- [ ] No TypeScript errors
- [ ] Existing tests pass
