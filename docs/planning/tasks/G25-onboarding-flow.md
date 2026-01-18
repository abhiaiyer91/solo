# G25: Implement Onboarding Flow

## Overview
Create the first-time user onboarding experience with System detection narrative and initial setup.

## Context
**Source:** docs/content/content-requirements.md (Onboarding section)
**Related Docs:** docs/frontend/daily-rhythm.md
**Current State:** Users go directly to dashboard after signup, no onboarding

## Acceptance Criteria
- [ ] Track onboarding completion status on user
- [ ] Step 1: System Detection narrative
- [ ] Step 2: Terms/Explanation of System
- [ ] Step 3: Accept/Begin button
- [ ] Step 4: First quests introduction
- [ ] Step 5: "The Beginner" title assignment
- [ ] Typing animation for narrative text
- [ ] Skip to dashboard after completion
- [ ] Don't show again for returning users

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| server/src/db/schema/game.ts | Modify | Add onboardingCompleted to users |
| web/src/pages/Onboarding.tsx | Create | Onboarding flow page |
| web/src/components/TypewriterText.tsx | Create | Typing animation component |
| web/src/App.tsx | Modify | Route new users to onboarding |

## Implementation Notes
From content-requirements.md:

**Step 1 - onboarding.detection:**
```
A dormant capability has been detected.

Physical output: underdeveloped
Recovery capacity: unstable
Discipline coefficient: unknown

You have been granted access to the System.
```

**Step 5 - onboarding.title_assigned:**
```
TITLE ASSIGNED: The Beginner

You begin with nothing proven.
Your capabilities are unknown.
The System will observe what you become.

Your daily quests await.
```

## Definition of Done
- [ ] All acceptance criteria met
- [ ] No TypeScript errors
- [ ] New users see onboarding
- [ ] Returning users skip to dashboard
- [ ] "The Beginner" title assigned on completion
