# G173: Mobile Onboarding Flow

## Overview
Create a complete onboarding flow for mobile matching web's Onboarding page with the System's narrative introduction, typewriter effects, and step-by-step journey start.

## Context
**Source:** Ideation loop --focus "feature parity for web and mobile"
**Related Docs:** `web/src/pages/Onboarding.tsx`
**Current State:** Mobile has Onboarding.tsx component but may not match web's full flow

## Web Onboarding Features to Replicate
| Feature | Web Status | Mobile Status |
|---------|------------|---------------|
| Detection step | ✅ Complete | ⚠️ Partial |
| Explanation step | ✅ Complete | ⚠️ Partial |
| Terms acceptance step | ✅ Complete | ⚠️ Partial |
| Quests introduction step | ✅ Complete | ⚠️ Partial |
| Title assignment step | ✅ Complete | ⚠️ Partial |
| Typewriter text effect | ✅ Complete | ⚠️ SystemWindow |
| Progress indicators | ✅ Complete | ❌ Missing |
| Skip option | ✅ Complete | ❌ Missing |
| Loading/error states | ✅ Complete | ❌ Missing |

## Acceptance Criteria
- [ ] Multi-step onboarding flow (detection, explanation, accept, quests, title)
- [ ] Typewriter text effect for System messages
- [ ] Step progress indicators (dots)
- [ ] Continue/Accept buttons per step
- [ ] Skip to dashboard option
- [ ] Complete onboarding API call
- [ ] Smooth transitions between steps
- [ ] Loading state on completion
- [ ] Error handling

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| `mobile/src/screens/Onboarding.tsx` | Modify | Complete onboarding flow |
| `mobile/src/components/TypewriterText.tsx` | Create | Typewriter effect component |
| `mobile/src/components/OnboardingStep.tsx` | Create | Individual step layout |
| `mobile/src/components/StepProgress.tsx` | Create | Dot progress indicators |
| `mobile/src/hooks/useOnboarding.ts` | Create | Onboarding state hook |

## Implementation Notes
- Use Animated API for typewriter effect
- Store onboarding step in local state
- Handle back navigation carefully
- Consider reduced motion accessibility

## Definition of Done
- [ ] All acceptance criteria met
- [ ] No TypeScript errors
- [ ] Existing tests pass
- [ ] Flow matches web experience
