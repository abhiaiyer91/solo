# G179: Mobile Shadow Collection

## Overview
Create a shadow collection feature for mobile matching web's ShadowObservation and ShadowCollection components showing defeated boss shadows with their abilities.

## Context
**Source:** Ideation loop --focus "feature parity for web and mobile"
**Related Docs:** `web/src/components/ShadowObservation.tsx`, `web/src/components/ShadowCollection.tsx`
**Current State:** Mobile has no shadow functionality

## Web Shadow Features to Replicate
| Feature | Web Status | Mobile Status |
|---------|------------|---------------|
| Shadow observation panel | ✅ Complete | ❌ Missing |
| Collected shadows grid | ✅ Complete | ❌ Missing |
| Shadow abilities display | ✅ Complete | ❌ Missing |
| Shadow extraction story | ✅ Complete | ❌ Missing |
| Active shadow selection | ✅ Complete | ❌ Missing |

## Acceptance Criteria
- [ ] Shadow collection grid showing defeated bosses
- [ ] Individual shadow details (name, ability, origin boss)
- [ ] Active shadow indicator
- [ ] Shadow observation messages (tips from shadows)
- [ ] Shadow extraction narrative on boss defeat
- [ ] Empty state for no shadows yet

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| `mobile/src/screens/ShadowCollection.tsx` | Create | Shadow collection screen |
| `mobile/src/components/ShadowCard.tsx` | Create | Individual shadow display |
| `mobile/src/components/ShadowObservation.tsx` | Create | Observation panel |
| `mobile/src/components/ShadowExtraction.tsx` | Create | Extraction narrative |
| `mobile/src/hooks/useShadows.ts` | Create | Shadow data hook |

## Implementation Notes
- Use grid layout for shadow collection
- Animate shadow observations
- Store active shadow preference

## Definition of Done
- [ ] All acceptance criteria met
- [ ] No TypeScript errors
- [ ] Existing tests pass
- [ ] Shadows feel mysterious and rewarding
