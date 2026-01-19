# G112: Quest History & Statistics Page

## Overview
Create a page showing historical quest completion data and statistics, allowing players to see their progress over time.

## Acceptance Criteria
- [ ] Page showing quest completion history by day/week
- [ ] Quest type breakdown (completed, partial, missed)
- [ ] Graphs showing completion trends
- [ ] Filter by quest type and date range
- [ ] Export data option

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| `web/src/pages/QuestHistory.tsx` | Create | History page |
| `web/src/hooks/useQuestHistory.ts` | Create | Data hook |
| `web/src/components/quest/QuestHistoryChart.tsx` | Create | Chart component |
| `server/src/routes/quests.ts` | Modify | Add history endpoint |

## Definition of Done
- [ ] All acceptance criteria met
- [ ] Charts render correctly
- [ ] Data filters work
- [ ] No TypeScript errors
