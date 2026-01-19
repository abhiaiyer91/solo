# G79: Meditation & Mindfulness Tracking

## Overview
Implement meditation/mindfulness tracking as a rotating quest option, including timer and optional HealthKit mindful minutes sync.

## Context
**Source:** Ideation loop Cycle 8 - UX analysis
**Related Docs:** docs/game-systems/quests.md (rotating quests mention meditation)
**Current State:** Meditation mentioned in docs but no tracking implementation

## Acceptance Criteria
- [ ] Meditation rotating quest type in quest system
- [ ] Simple meditation timer with completion
- [ ] Manual logging option (duration in minutes)
- [ ] HealthKit mindful minutes sync on mobile
- [ ] Progress toward daily mindfulness target
- [ ] Calming UI appropriate for meditation context

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| web/src/components/quest/MeditationTimer.tsx | Create | Web meditation timer |
| web/src/hooks/useMeditation.ts | Create | Meditation state hook |
| mobile/src/components/MeditationTimer.tsx | Create | Mobile timer |
| mobile/src/health/mindfulness.ts | Create | HealthKit mindful sync |
| server/src/db/seed-rotating-quests.ts | Modify | Add meditation quest |

## Implementation Notes
- Timer should be minimalist, distraction-free
- Consider sound/haptic for session end
- HealthKit provides HKCategoryTypeIdentifierMindfulSession
- Default target: 10 minutes (can vary by quest)

## Definition of Done
- [ ] All acceptance criteria met
- [ ] No TypeScript errors
- [ ] Timer works on web and mobile
- [ ] Existing tests pass
