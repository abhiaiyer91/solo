# G108: Daily Challenge Rotation System

## Overview
Implement a system for rotating daily challenges that provides variety beyond the core quests, keeping the experience fresh.

## Acceptance Criteria
- [ ] Define pool of daily challenge types
- [ ] Rotation logic selects challenges based on player level/history
- [ ] Challenges appear in quest UI with special styling
- [ ] Bonus XP for challenge completion
- [ ] Track challenge completion history

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| `server/src/services/daily-challenge.ts` | Create | Challenge rotation logic |
| `server/src/db/seed-challenges.ts` | Create | Challenge pool definitions |
| `web/src/components/quest/DailyChallenge.tsx` | Create | Challenge UI |
| `server/src/routes/quests.ts` | Modify | Add challenge endpoints |

## Challenge Types
- Step milestone (+20% from usual)
- Workout variety (try new exercise type)
- Early bird (complete quest before 8am)
- Social (encourage partner)
- Precision (exact target hit)

## Definition of Done
- [ ] All acceptance criteria met
- [ ] Challenges rotate daily
- [ ] Bonus XP awarded correctly
- [ ] No TypeScript errors
