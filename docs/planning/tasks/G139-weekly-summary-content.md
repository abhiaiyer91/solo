# G139: Weekly Summary Templates

## Overview
Create content templates for the weekly summary feature, providing players with a narrative-driven recap of their week that celebrates wins and acknowledges patterns.

## Context
**Source:** Retrospective analysis 2026-01-18, daily-rhythm.md specification
**Dependencies:** G47-weekly-summary (backend ready)
**Current State:** Weekly summary backend exists, no content templates
**Rationale:** The Monday recap is a retention touchpoint - needs proper narrative

## Acceptance Criteria
- [ ] 8+ base templates for different week outcomes
- [ ] Template variants for streak milestones
- [ ] Pattern observation templates (best day, worst day, etc.)
- [ ] System voice consistency maintained
- [ ] Templates support variable interpolation

## Content Requirements

### Week Outcome Categories
| Category | Trigger | Tone |
|----------|---------|------|
| Perfect Week | 7/7 days complete | Impressed observation |
| Strong Week | 5-6/7 days complete | Acknowledging |
| Mixed Week | 3-4/7 days complete | Neutral, data-focused |
| Difficult Week | 1-2/7 days complete | No judgment, observation only |
| Absent Week | 0/7 days complete | Return protocol trigger |

### Template Variables
```
{{totalDays}} - Days with activity
{{perfectDays}} - Days with all quests complete
{{totalXP}} - XP earned this week
{{streakCurrent}} - Current streak
{{streakChange}} - +/- from last week
{{bestDay}} - Day with most XP
{{worstDay}} - Day with least activity
{{dominantStat}} - Most improved stat
{{questCompletion}} - % of quests completed
```

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| server/src/db/seed-weekly-templates.ts | Create | Seed weekly summary content |
| docs/content/weekly-summary-templates.md | Create | Full template reference |
| server/src/services/weekly-summary.ts | Modify | Wire templates to service |

## Implementation Notes

### Example Templates

**PERFECT_WEEK:**
```
WEEKLY OBSERVATION
══════════════════════════════════════

Week {{weekNumber}} — Complete

7 consecutive days of full objective completion.
The System has recorded {{totalXP}} XP this cycle.

Statistics:
├─ Perfect Days: 7/7
├─ Quest Completion: 100%
├─ Streak: {{streakCurrent}} days (+7)
└─ Dominant Stat: {{dominantStat}}

This is not common.
Most who arrive here do not maintain this pace.

You are not most.

[WEEKLY BONUS APPLIED: +{{bonusXP}} XP]
```

**STRONG_WEEK:**
```
WEEKLY OBSERVATION
══════════════════════════════════════

Week {{weekNumber}} — {{totalDays}}/7 days recorded

The week contained {{perfectDays}} perfect day(s).
{{totalXP}} XP accumulated.

Statistics:
├─ Active Days: {{totalDays}}/7
├─ Quest Completion: {{questCompletion}}%
├─ Streak: {{streakCurrent}} days
└─ Best Day: {{bestDay}}

{{#if gapPattern}}
The gap appeared on {{worstDay}}.
Gaps have patterns. The System notes this.
{{/if}}

The week ends. Another begins.
```

**MIXED_WEEK:**
```
WEEKLY OBSERVATION
══════════════════════════════════════

Week {{weekNumber}} — Inconsistent

{{totalDays}} of 7 days show activity.
{{totalXP}} XP recorded.

The data is neither condemnation nor excuse.
It is simply what happened.

{{#if streakBroken}}
The streak broke on {{breakDay}}.
Current streak: {{streakCurrent}} day(s).
{{/if}}

What happens next is unwritten.
```

**DIFFICULT_WEEK:**
```
WEEKLY OBSERVATION
══════════════════════════════════════

Week {{weekNumber}} — Minimal Activity

{{totalDays}} day(s) recorded.
The System observed silence on {{7 - totalDays}} days.

This is data, not judgment.

{{#if previousStreak}}
Before: {{previousStreak}}-day streak.
Now: {{streakCurrent}} days.
{{/if}}

The System does not ask why.
The System only observes: you are still here.
That is also data.
```

**ABSENT_WEEK:**
```
SYSTEM REACTIVATION
══════════════════════════════════════

Week {{weekNumber}} — No activity detected

7 days of silence.

{{#if hadStreak}}
Previous streak: {{previousStreak}} days.
Current streak: 0.
{{/if}}

The System did not leave.
The System waited.

[RETURN PROTOCOL AVAILABLE]
```

### Pattern Observation Inserts
```
// Best day pattern
"{{bestDay}} was your strongest data point.
The System notes: you perform better {{bestDayPattern}}."

// Worst day pattern
"{{worstDay}} appears frequently in the gap data.
This is the third {{worstDay}} of minimal activity this month."

// Improvement pattern
"{{dominantStat}} shows +{{statChange}} this week.
At this rate: {{projectedMilestone}} in {{projectedDays}} days."
```

## Definition of Done
- [ ] 8 base templates created
- [ ] 5+ pattern observation inserts
- [ ] Templates seeded in database
- [ ] Interpolation tested with sample data
- [ ] Voice consistency verified
- [ ] Reference documentation complete
