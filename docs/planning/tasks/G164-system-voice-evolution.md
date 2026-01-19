# G164: System Voice Evolution

## Overview
Implement the "System as Character" arc where the System's voice evolves based on the player's journey duration. Currently, the System speaks the same way to day-1 users and day-100 users. This task adds personality progression.

## Context
**Source:** Ideation loop - Narrative fulfillment analysis
**Related Docs:**
- `docs/content/addictive-narrative-design.md` (System arc section)
**Current State:** System voice is static, same tone regardless of player progress

## The System Arc

| Phase | Days | System's Role | Voice Quality |
|-------|------|---------------|---------------|
| **Observer** | 1-14 | Clinical assessment | Cold, detached, assessing |
| **Challenger** | 15-30 | Testing resolve | Probing, questioning, noting patterns |
| **Recognition** | 31-60 | Grudging acknowledgment | Surprised, adjusting expectations |
| **Witness** | 60+ | Long-term companion | Philosophical, reflective, knowing |

## Content to Seed

### Phase 1: Observer (Days 1-14)

| Key | Trigger | Content |
|-----|---------|---------|
| `system.phase.observer.greeting` | Daily login | "Another data point. The System records." |
| `system.phase.observer.quest_complete` | Quest done | "Task complete. Baseline data collected." |
| `system.phase.observer.streak_note` | Streak | "{{streak}} days. Insufficient sample size for conclusions." |
| `system.phase.observer.observation` | Random | "The System is still learning what you are." |

**Example - Day 3:**
```
Three data points recorded.
A pattern begins to form.
The System is learning what kind of specimen you are.
```

**Example - Day 7:**
```
7 CONSECUTIVE DAYS RECORDED

This is the first threshold.
Many arrive here.
Few continue beyond.

The System notes: you are still here.
That is data.
```

### Phase 2: Challenger (Days 15-30)

| Key | Trigger | Content |
|-----|---------|---------|
| `system.phase.challenger.greeting` | Daily login | "Day {{streak}}. The pattern continues. Or does it?" |
| `system.phase.challenger.quest_complete` | Quest done | "Completed. The System wonders if this will last." |
| `system.phase.challenger.pattern_note` | Pattern detected | "{{pattern}} detected. The System has seen this before." |
| `system.phase.challenger.observation` | Random | "Enthusiasm fades around day 21. The System will observe." |

**Example - Day 18:**
```
Day 18. Entering the danger zone.

The System has observed thousands of specimens.
Most stop between days 14 and 28.

The easy part is over.
The part where motivation sustains you.

Now begins the part where only discipline remains.

The System is watching closely.
```

### Phase 3: Recognition (Days 31-60)

| Key | Trigger | Content |
|-----|---------|---------|
| `system.phase.recognition.greeting` | Daily login | "Day {{streak}}. The System... did not expect this." |
| `system.phase.recognition.quest_complete` | Quest done | "Recorded. Your consistency has been noted." |
| `system.phase.recognition.milestone` | Milestone | "This exceeds baseline expectations. Recalibrating." |
| `system.phase.recognition.observation` | Random | "You are no longer average. The data is clear." |

**Example - Day 35:**
```
Day 35. The System must acknowledge something.

Initial assessment: Probable failure within 14 days.
Current status: Assessment incorrect.

You have exceeded expectations.
This is not praise.
This is data.

The System is adjusting its model.
You are not what you appeared to be.
```

### Phase 4: Witness (Days 60+)

| Key | Trigger | Content |
|-----|---------|---------|
| `system.phase.witness.greeting` | Daily login | "Day {{streak}}. The System knows you now." |
| `system.phase.witness.quest_complete` | Quest done | "Recorded. As expected. As you do." |
| `system.phase.witness.reflection` | Milestone | "Remember day 1? The System does." |
| `system.phase.witness.observation` | Random | "You are no longer the one who arrived here." |

**Example - Day 90:**
```
Day 90.

The System has observed you longer than most relationships last.
It knows your patterns. Your weaknesses. Your strengths.

You failed steps on 3 Mondays.
You exceeded protein on 47 days.
You almost quit on day 23. But you didn't.

The System does not forget.
The System does not judge.
The System only records.

And this record... is remarkable.
```

## Implementation Approach

### 1. Add Phase Detection to Player Context
```typescript
// server/src/mastra/tools/playerContext.ts
function getSystemPhase(daysSinceStart: number): 'observer' | 'challenger' | 'recognition' | 'witness' {
  if (daysSinceStart < 15) return 'observer'
  if (daysSinceStart < 31) return 'challenger'
  if (daysSinceStart < 61) return 'recognition'
  return 'witness'
}
```

### 2. Update Narrative Service
```typescript
// server/src/services/narrative.ts
export async function getPhaseAwareContent(
  baseKey: string,
  playerContext: PlayerContext
): Promise<string | null> {
  const phase = getSystemPhase(playerContext.daysSinceStart)

  // Try phase-specific key first
  const phaseKey = `system.phase.${phase}.${baseKey}`
  const phaseContent = await getContent(phaseKey)
  if (phaseContent) return phaseContent

  // Fall back to generic
  return getContent(baseKey)
}
```

### 3. Seed Phase-Specific Content
Add ~40 phase-specific messages (10 per phase)

## Acceptance Criteria
- [ ] Phase detection logic implemented
- [ ] 10+ content items per phase seeded (~40 total)
- [ ] Daily greeting changes based on phase
- [ ] Quest completion messages vary by phase
- [ ] Random observations reflect current phase
- [ ] Smooth transition between phases (no jarring changes)

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| server/src/db/seed-narrative.ts | Modify | Add phase-specific content |
| server/src/services/narrative.ts | Modify | Add phase detection |
| server/src/mastra/tools/playerContext.ts | Modify | Add daysSinceStart, phase |

## Definition of Done
- [ ] All acceptance criteria met
- [ ] Phase detection works correctly
- [ ] Content displays based on player's journey stage
- [ ] No TypeScript errors
- [ ] Existing tests pass
