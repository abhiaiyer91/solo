# G81: Timezone Detection UI

## Overview
Implement timezone change detection and prompt UI when user travels or their detected timezone differs from their configured timezone.

## Context
**Source:** Ideation loop Cycle 6 - Frontend features analysis
**Related Docs:** docs/frontend/daily-rhythm.md (Time Zone Handling section)
**Current State:** No timezone change detection or prompt

## Acceptance Criteria
- [ ] Detect when browser/device timezone differs from user's saved timezone
- [ ] Show non-intrusive prompt when timezone change detected
- [ ] Options: "Update to [new TZ]" or "Keep [old TZ]"
- [ ] Explain day boundary implications in prompt
- [ ] Update user timezone preference if accepted
- [ ] Don't repeatedly prompt (once per detected change)

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| web/src/hooks/useTimezoneDetection.ts | Create | Timezone detection hook |
| web/src/components/TimezonePrompt.tsx | Create | Timezone change prompt |
| server/src/routes/player.ts | Modify | Add timezone update endpoint |
| mobile/src/hooks/useTimezoneDetection.ts | Create | Mobile detection |

## Implementation Notes
- Per daily-rhythm.md: Changes affect day boundaries
- Use Intl.DateTimeFormat().resolvedOptions().timeZone
- Store last prompted timezone to avoid repeat prompts
- Consider travel mode (temporary vs permanent change)

## Definition of Done
- [ ] All acceptance criteria met
- [ ] No TypeScript errors
- [ ] Prompt appears only when change detected
- [ ] Existing tests pass
