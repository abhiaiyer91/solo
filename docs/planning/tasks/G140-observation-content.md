# G140: System Observation Templates

## Overview
Create AI prompt templates and base observation content for the pattern-aware System observations that make Journey feel like a living, watching entity.

## Context
**Source:** Retrospective analysis 2026-01-18, addictive-narrative-design.md
**Dependencies:** G22-mastra-narrator-agent (complete), G94-system-observations (complete)
**Current State:** Observation system built, ~20% content seeded
**Rationale:** Observations create the "being watched" accountability effect

## Acceptance Criteria
- [ ] 30+ base observation templates
- [ ] Templates categorized by trigger condition
- [ ] AI prompt templates for dynamic generation
- [ ] Pattern detection rules documented
- [ ] Observation frequency guidelines defined

## Content Requirements

### Observation Categories
| Category | Trigger | Examples |
|----------|---------|----------|
| Pattern Positive | 3+ occurrences of positive behavior | Morning workout consistency |
| Pattern Negative | 3+ occurrences of issue | Friday failures |
| Milestone | Reaching numeric threshold | 100 workouts, 1M steps |
| Anomaly | Unusual activity | 20K steps (normally 8K) |
| Streak | Streak milestones | 7, 14, 30, 60, 90 days |
| Recovery | Returning after gap | First activity after 3+ day gap |
| Stat Threshold | Crossing stat benchmarks | STR reaches 50 |

### Template Variables
```
{{patternName}} - Name of detected pattern
{{occurrences}} - How many times pattern observed
{{firstDate}} - When pattern first appeared
{{comparisonValue}} - Historical comparison
{{triggerValue}} - What triggered observation
{{playerLevel}} - Current level
{{daysSinceStart}} - Days on Journey
```

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| server/src/db/seed-observations.ts | Create | Seed observation content |
| server/src/lib/observation-patterns.ts | Create | Pattern detection rules |
| docs/content/observation-templates.md | Create | Full template reference |

## Implementation Notes

### Pattern Positive Templates (10)
```
MORNING_WARRIOR:
"The data reveals a pattern.
Your step count increases by {{percentage}}% on days with morning workouts.
The System notes: the morning version of you is more capable."

PROTEIN_CONSISTENT:
"Protein quest: completed {{occurrences}} consecutive days.
This is not willpower. This is becoming identity."

WEEKEND_STRONG:
"Weekends no longer show decreased activity.
Many use weekends for rest. You use them for progress."

MONDAY_BREAKTHROUGH:
"Mondays were once your weakest data point.
The last {{occurrences}} Mondays show consistent completion.
Patterns can be rewritten."

WORKOUT_VARIETY:
"{{workoutTypes}} different workout types this month.
The System observes: you are not doing the same thing expecting different results."
```

### Pattern Negative Templates (10)
```
FRIDAY_PATTERN:
"Fridays remain problematic.
{{occurrences}} of the last {{total}} Fridays show incomplete data.
The System does not ask why. The System only observes."

EVENING_FADE:
"Quest completion drops significantly after 8 PM.
{{percentage}}% of incomplete quests were left for 'later.'
Later rarely arrives."

TRAVEL_DISRUPTION:
"Activity drops during travel periods.
This is common. This is also why many fail to maintain progress.
Common is not a goal."

PROTEIN_SKIP:
"Protein quest: your most frequently incomplete objective.
{{percentage}}% completion vs {{otherPercentage}}% for other quests.
One weak link affects the whole chain."

MONDAY_STRUGGLE:
"Monday shows {{percentage}}% lower completion than other days.
The week begins with a gap.
The System wonders if the week ever truly begins."
```

### Milestone Templates (5)
```
STEPS_1M:
"MILESTONE DETECTED

Total steps recorded: 1,000,000

One million steps since you began.
If each step covered 0.7 meters, you have walked {{distance}} kilometers.

The person who took the first step is not the person taking this one."

WORKOUTS_100:
"MILESTONE DETECTED

Workout #100 completed.

100 times you chose discomfort over comfort.
This is not motivation. This is evidence of transformation."

DAYS_30:
"30 days since activation.

Many arrive. Few remain at 30 days.
You remain.

The System's assessment has been updated."
```

### Anomaly Templates (5)
```
UNUSUAL_HIGH_ACTIVITY:
"ANOMALY DETECTED

Today's step count: {{todaySteps}}
Your average: {{averageSteps}}
Deviation: +{{percentage}}%

The System notes exceptional output.
What was different today?"

UNUSUAL_EARLY_WORKOUT:
"Workout completed at {{time}}.
Your typical window: {{usualTime}}.

Earlier than usual. The System observes."

STREAK_SAVE:
"21:47 — Final quest completed.
Streak preserved: {{streakDays}} days.

The System notes: you did not let it break.
Many would have by now."
```

### AI Prompt Template
```
You are the System from Journey, a fitness RPG. Generate a brief observation about this player pattern:

Pattern: {{patternDescription}}
Data: {{patternData}}
Player Level: {{level}}
Days Active: {{daysActive}}

Rules:
- Maximum 3 sentences
- No exclamation marks
- No encouragement or praise
- Only state observations and data
- End with a statement, not a question
- Cold, clinical, but not cruel
- The System observes, it does not judge

Example output:
"Your completion rate increases by 23% after days with morning workouts.
This correlation has appeared in {{occurrences}} instances.
The System notes this pattern."
```

### Observation Frequency Rules
| Category | Max Frequency |
|----------|---------------|
| Pattern Positive | 1 per week per pattern |
| Pattern Negative | 1 per 2 weeks per pattern |
| Milestone | Once per milestone |
| Anomaly | 1 per day max |
| Streak | At milestones only |
| Recovery | Once per return |

## Definition of Done
- [ ] 30+ templates created across categories
- [ ] AI prompt template finalized
- [ ] Pattern detection rules documented
- [ ] Frequency rules implemented
- [ ] Templates seeded in database
- [ ] Voice consistency verified
