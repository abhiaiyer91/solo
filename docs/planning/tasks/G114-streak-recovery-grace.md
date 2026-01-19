# G114: Streak Recovery Grace Period

## Overview
Implement a "grace period" system that allows players to use earned tokens to recover from a broken streak within 24 hours.

## Acceptance Criteria
- [ ] Grace token earned every 7 consecutive days
- [ ] Token can be used within 24h of streak break
- [ ] Shows grace period available in UI
- [ ] Limits to max 3 tokens stored
- [ ] Notifies player when streak at risk

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| `server/src/services/streak.ts` | Modify | Add grace logic |
| `server/src/db/schema/game.ts` | Modify | Add grace_tokens field |
| `web/src/components/StreakRecovery.tsx` | Create | Recovery UI |
| `server/src/routes/player.ts` | Modify | Add recovery endpoint |

## Definition of Done
- [ ] All acceptance criteria met
- [ ] Grace tokens accumulate correctly
- [ ] Recovery works within time window
- [ ] No TypeScript errors
