# G20: Seed P0 Narrative Content

## Overview
Seed the critical path narrative content needed for MVP (~30 items).

## Context
**Source:** docs/content/content-requirements.md (P0 section)
**Related Docs:** Voice guidelines in content-requirements.md
**Current State:** narrativeContents table exists but is empty

## Acceptance Criteria
- [ ] Onboarding sequence (5 items): detection, terms, accept, first_quests, title_assigned
- [ ] Daily quest headers (7 items): default, streak_7, streak_30, debuff, weekend, monday, boss_active
- [ ] Quest completion messages (5 items): default, exceeded, barely, all, partial
- [ ] Streak milestones (5 items): 3, 7, 14, 21, 30 days
- [ ] Debuff messages (5 items): warning, applied, active.reminder, cleared, cleared.by_action
- [ ] Basic failure/return (5 items): streak.broken.short/medium/long, return.short/medium

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| server/src/db/seed-narrative.ts | Create | Narrative content seed script |
| server/src/db/seed.ts | Modify | Import and run narrative seed |

## Voice Guidelines (from content-requirements.md)
The System is:
- Cold but not cruel
- Observational, not judgmental
- Short, declarative sentences
- No exclamation marks
- No encouragement ("you can do it")
- References data when relevant

## Example Content

**onboarding.detection:**
```
A dormant capability has been detected.

Physical output: underdeveloped
Recovery capacity: unstable
Discipline coefficient: unknown

You have been granted access to the System.
```

**debuff.applied:**
```
SYSTEM NOTICE: PERFORMANCE DEGRADATION

Core tasks incomplete: {{missed_count}}

For the next 24 hours:
• XP gains: -10%
• Dungeon bonuses: Disabled

You are not being punished.
You are experiencing the cost of neglect.
```

## Definition of Done
- [ ] All 30+ P0 content items seeded
- [ ] Content follows voice guidelines
- [ ] No TypeScript errors
- [ ] Seed script runs without errors
