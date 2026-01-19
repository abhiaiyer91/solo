# G82: Narrative Content Expansion

## Overview
Expand the narrative content seed to include all P0 and P1 content items as defined in the content requirements document.

## Context
**Source:** Ideation loop Cycle 9 - Content analysis
**Related Docs:** docs/content/content-requirements.md (200 items needed)
**Current State:** Some content seeded, but many items missing

## Acceptance Criteria
- [ ] All P0 onboarding content (5 items)
- [ ] All P0 daily quest narratives (20+ items)
- [ ] All P0 streak milestones (8 items)
- [ ] All P0 debuff/recovery content (10 items)
- [ ] All P0 failure/return content (15 items)
- [ ] P1 level up messages (10 items)
- [ ] P1 Boss 1 content (13 items)
- [ ] P1 rotating quest descriptions (15+ items)
- [ ] Content follows voice guidelines (cold, observational)

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| server/src/db/seed-narrative.ts | Modify | Expand content array |
| docs/content/content-inventory.md | Create | Track what's seeded |

## Implementation Notes
- Follow voice guidelines: no exclamation marks, no encouragement
- Use interpolation keys where player data needed
- Test each piece reads correctly in flat, robotic voice
- Organize by category for maintainability

## Definition of Done
- [ ] All P0 items seeded (~60 items)
- [ ] All P1 items seeded (~50 items)
- [ ] Content passes voice quality check
- [ ] Seed script runs successfully
