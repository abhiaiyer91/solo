# G107: Achievement Badge System

## Overview
Implement a badge/achievement system that awards badges for various accomplishments beyond titles, providing more granular recognition of player progress.

## Acceptance Criteria
- [ ] Create `achievements` and `playerAchievements` tables
- [ ] Define achievement types (streak, quest, boss, social, etc.)
- [ ] Trigger achievements on appropriate events
- [ ] Display achievements on profile page
- [ ] Show achievement unlock animations

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| `server/src/db/schema/game.ts` | Modify | Add achievements tables |
| `server/src/services/achievement.ts` | Create | Achievement logic |
| `server/src/db/seed-achievements.ts` | Create | Achievement definitions |
| `web/src/components/AchievementBadge.tsx` | Create | Badge component |
| `web/src/pages/Achievements.tsx` | Create | Achievements page |

## Achievement Examples
- First Quest Complete
- 7-Day Streak
- 30-Day Streak
- First Boss Defeated
- Guild Joined
- Perfect Week

## Definition of Done
- [ ] All acceptance criteria met
- [ ] Achievements trigger correctly
- [ ] UI displays badges properly
- [ ] No TypeScript errors
