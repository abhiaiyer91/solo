# G76: Evening Mode UI

## Overview
Implement time-based UI mode that shifts the interface subtly darker and calmer after 8 PM, per the daily rhythm specification.

## Context
**Source:** Ideation loop Cycle 6 - Frontend features analysis
**Related Docs:** docs/frontend/daily-rhythm.md (Evening Phase section)
**Current State:** No time-based UI adjustments

## Acceptance Criteria
- [ ] After 8 PM (user timezone), UI shifts to evening mode
- [ ] Darker, calmer color palette in evening mode
- [ ] Evening-specific messaging ("The day winds down")
- [ ] Screen Sunset quest reminder if active
- [ ] After 10 PM: quiet mode with minimal UI
- [ ] Mode changes based on user's configured timezone
- [ ] Smooth transition between modes

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| web/src/hooks/useTimeOfDay.ts | Create | Time-based mode detection |
| web/src/context/ThemeContext.tsx | Modify | Add evening theme variant |
| web/src/styles/evening.css | Create | Evening mode styles |
| web/src/components/EveningMessage.tsx | Create | Evening-specific UI elements |

## Implementation Notes
- Per daily-rhythm.md: Evening = 8 PM - 10 PM, Night = 10 PM+
- Use user's timezone from profile for accurate detection
- Consider using CSS custom properties for smooth transitions
- Match the philosophical tone in messaging

## Definition of Done
- [ ] All acceptance criteria met
- [ ] No TypeScript errors
- [ ] Time detection works with timezones
- [ ] Existing tests pass
