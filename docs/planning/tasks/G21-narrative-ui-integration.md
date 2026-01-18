# G21: Integrate Narrative Content into UI

## Overview
Connect the frontend to the narrative content API and display dynamic System messages.

## Context
**Source:** docs/content/narrative-engine.md
**Related Docs:** G9-system-messages (component), G19-narrative-content-service (API)
**Current State:** G9 builds UI components, this task wires them to real content

## Acceptance Criteria
- [ ] useNarrative hook to fetch content by key
- [ ] Daily login shows contextual greeting based on streak/debuff status
- [ ] Quest completion shows appropriate System message
- [ ] Streak milestones trigger milestone narratives
- [ ] Debuff application shows debuff narrative
- [ ] Content interpolates player data (level, streak, etc.)

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| web/src/hooks/useNarrative.ts | Create | Hook for fetching narrative content |
| web/src/components/Dashboard.tsx | Modify | Show daily login narrative |
| web/src/components/QuestCard.tsx | Modify | Show completion narratives |

## Implementation Notes
- Fetch content on relevant events (login, completion, milestone)
- Pass player context for interpolation
- Cache content to reduce API calls
- Fallback to generic message if content missing

## Definition of Done
- [ ] All acceptance criteria met
- [ ] No TypeScript errors
- [ ] Narratives display with proper styling
- [ ] Player data correctly interpolated
