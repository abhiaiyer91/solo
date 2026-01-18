# G19: Implement Narrative Content Service

## Overview
Create the backend service and API for serving narrative content with variable interpolation. Content stored directly in database.

## Context
**Source:** docs/content/narrative-engine.md, docs/content/content-requirements.md
**Related Docs:** MASTER_SPEC.md (narrativeContents schema)
**Current State:** Schema has narrativeContents table, but no service to fetch/interpolate content

## Acceptance Criteria
- [ ] NarrativeService with `getContent(key)` and `interpolate(content, context)` functions
- [ ] GET /api/content/:key endpoint
- [ ] GET /api/content/category/:category endpoint
- [ ] Variable interpolation support (e.g., `{{streak_days}}`, `{{level}}`)
- [ ] Content can be marked active/inactive
- [ ] Fallback content for missing keys

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| server/src/services/narrative.ts | Create | Narrative content service |
| server/src/index.ts | Modify | Add content API endpoints |

## Implementation Notes
- Templates have slots like `{{quest_type}}`, `{{failure_count}}`
- Content keyed by category + key (e.g., `onboarding.detection`)
- Categories: ONBOARDING, SYSTEM_MESSAGE, DAILY_QUEST, DEBUFF, DUNGEON, BOSS, TITLE, SEASON, LEVEL_UP, DAILY_REMINDER
- All content stored in narrativeContents table (no external CMS)

## Definition of Done
- [ ] All acceptance criteria met
- [ ] No TypeScript errors
- [ ] Existing tests pass
- [ ] Content API returns interpolated narratives
