# G178: Mobile Unlock Progress

## Overview
Create an unlock progress feature for mobile matching web's UnlockProgress component showing upcoming unlocks (bosses, dungeons, titles) with progress tracking.

## Context
**Source:** Ideation loop --focus "feature parity for web and mobile"
**Related Docs:** `web/src/components/UnlockProgress.tsx`, `web/src/components/UnlockCelebration.tsx`
**Current State:** Mobile has no unlock progress tracking

## Web Unlock Features to Replicate
| Feature | Web Status | Mobile Status |
|---------|------------|---------------|
| Unlock progress cards | ✅ Complete | ❌ Missing |
| Progress bars | ✅ Complete | ❌ Missing |
| Unlock requirements | ✅ Complete | ❌ Missing |
| Unlock celebration modal | ✅ Complete | ❌ Missing |
| Recent unlocks | ✅ Complete | ❌ Missing |

## Acceptance Criteria
- [ ] Unlock progress cards showing next unlocks
- [ ] Progress bars for each unlock requirement
- [ ] Requirement descriptions (level X, Y quests, etc.)
- [ ] Celebration modal when unlock achieved
- [ ] Confetti/particle effects for celebration
- [ ] Mark celebration as seen

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| `mobile/src/components/UnlockProgress.tsx` | Create | Progress cards |
| `mobile/src/components/UnlockProgressCard.tsx` | Create | Individual unlock card |
| `mobile/src/components/UnlockCelebration.tsx` | Create | Celebration modal |
| `mobile/src/hooks/useUnlocks.ts` | Create | Unlock data hook |

## Implementation Notes
- Use react-native-confetti or lottie for celebrations
- Store seen celebrations in AsyncStorage
- Check for new unlocks on data refresh

## Definition of Done
- [ ] All acceptance criteria met
- [ ] No TypeScript errors
- [ ] Existing tests pass
- [ ] Celebrations are visually appealing
