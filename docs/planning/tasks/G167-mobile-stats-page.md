# G167: Mobile Stats Screen

## Overview
Create a stats screen for mobile that shows detailed player statistics with the hexagon visualization, level progress, streak records, and weekly history - matching web's Stats page.

## Context
**Source:** Ideation loop --focus "feature parity for web and mobile"
**Related Docs:** `web/src/pages/Stats.tsx`
**Current State:** Mobile has StatsRadar component but no dedicated stats screen

## Web Stats Features to Replicate
| Feature | Web Status | Mobile Status |
|---------|------------|---------------|
| Stat hexagon visualization | ✅ Complete | ⚠️ Has StatsRadar |
| Individual stat cards | ✅ Complete | ❌ Missing |
| Level progress section | ✅ Complete | ❌ Missing |
| Current/longest/perfect streak | ✅ Complete | ❌ Missing |
| Weekly history | ✅ Complete | ❌ Missing |
| Total XP display | ✅ Complete | ❌ Missing |

## Acceptance Criteria
- [ ] Stats screen with stat radar/hexagon visualization
- [ ] Individual stat breakdowns with descriptions
- [ ] Level progress with XP bar and next level info
- [ ] Streak statistics (current, longest, perfect days)
- [ ] Weekly summary history (last 4 weeks)
- [ ] Smooth animations on data load
- [ ] Pull-to-refresh for updated stats

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| `mobile/src/screens/Stats.tsx` | Create | Main stats screen |
| `mobile/src/components/StatCard.tsx` | Create | Individual stat display |
| `mobile/src/components/StreakStats.tsx` | Create | Streak statistics section |
| `mobile/src/components/WeeklyHistoryCard.tsx` | Create | Weekly summary card |
| `mobile/src/hooks/useWeeklySummary.ts` | Create | Weekly history data hook |

## Implementation Notes
- Adapt `useStats` hook from mobile
- Use react-native-svg for hexagon/radar visualization
- Consider horizontal scroll for weekly history cards
- Use Animated API for smooth transitions

## Definition of Done
- [ ] All acceptance criteria met
- [ ] No TypeScript errors
- [ ] Existing tests pass
- [ ] Visualization works on various screen sizes
