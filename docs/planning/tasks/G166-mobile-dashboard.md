# G166: Mobile Dashboard Screen

## Overview
Create a full-featured dashboard screen for mobile that mirrors the web dashboard functionality including quest display, stats panel, XP progress, streak tracking, and system messages.

## Context
**Source:** Ideation loop --focus "feature parity for web and mobile"
**Related Docs:** `web/src/pages/Dashboard.tsx`
**Current State:** Mobile has basic components but no unified dashboard screen

## Web Dashboard Features to Replicate
| Feature | Web Status | Mobile Status |
|---------|------------|---------------|
| Daily quests list | ✅ Complete | ⚠️ Has QuestList but no screen |
| Stats panel (STR/AGI/VIT/DISC) | ✅ Complete | ⚠️ Has StatsRadar |
| XP progress bar | ✅ Complete | ⚠️ Has DailyXPSummary |
| Streak display | ✅ Complete | ⚠️ Has StreakBadge |
| System message with typewriter | ✅ Complete | ⚠️ Has SystemWindow |
| Seasonal quests section | ✅ Complete | ❌ Missing |
| Reconciliation prompt | ✅ Complete | ❌ Missing |
| Weekly summary modal | ✅ Complete | ❌ Missing |
| Shadow observation panel | ✅ Complete | ❌ Missing |
| XP timeline/history | ✅ Complete | ❌ Missing |
| Unlock progress | ✅ Complete | ❌ Missing |
| Weekend bonus indicator | ✅ Complete | ❌ Missing |
| Return protocol indicator | ✅ Complete | ❌ Missing |

## Acceptance Criteria
- [ ] Dashboard screen displays daily quests with completion UI
- [ ] Stats panel shows all 4 attributes with visual indicators
- [ ] XP progress bar with level info
- [ ] Current streak display with fire animation
- [ ] System message with dynamic greeting (uses narrative hook)
- [ ] Day status awareness (phase: morning/midday/evening/night)
- [ ] Pull-to-refresh for quest data
- [ ] Navigation to other screens (stats, profile, quests)

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| `mobile/src/screens/Dashboard.tsx` | Create | Main dashboard screen |
| `mobile/src/components/DashboardHeader.tsx` | Create | Player info, level, XP bar |
| `mobile/src/components/SeasonalQuestCard.tsx` | Create | Seasonal quest display |
| `mobile/src/hooks/useDayStatus.ts` | Create | Day phase awareness |
| `mobile/src/hooks/useNarrative.ts` | Create | Dynamic greeting messages |
| `mobile/src/navigation/index.tsx` | Modify | Add dashboard route |

## Implementation Notes
- Use existing `useQuests`, `usePlayer` hooks from mobile
- Adapt web's `useDayStatus` logic for mobile
- Consider mobile-specific gestures (swipe to complete quest)
- Use React Native's FlatList for performant quest rendering
- Implement skeleton loading states

## Definition of Done
- [ ] All acceptance criteria met
- [ ] No TypeScript errors
- [ ] Existing tests pass
- [ ] Dashboard is responsive on various screen sizes
- [ ] Performance is smooth (60fps scrolling)
