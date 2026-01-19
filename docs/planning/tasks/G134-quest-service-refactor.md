# G134: Quest Service Refactor

## Overview

Split the monolithic quest.ts service (1053 lines) into smaller, focused modules to improve maintainability and testability.

## Context

**Source:** Debt manifest DEBT-003
**Current State:** quest.ts has 1053 lines with 12 exported functions handling too many responsibilities
**Suggested Split:** quest-core.ts, quest-progress.ts, quest-lifecycle.ts

## Acceptance Criteria

- [ ] Split into quest-core.ts (getTodayQuests, getQuestById, getActiveQuests)
- [ ] Split into quest-progress.ts (updateQuestProgress, autoEvaluateQuestsFromHealth)
- [ ] Split into quest-lifecycle.ts (resetQuest, activateQuest, removeQuest, deactivateQuestByTemplate)
- [ ] Create quest/index.ts that re-exports all functions
- [ ] Update all imports across codebase
- [ ] Maintain 100% test coverage
- [ ] No breaking API changes

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| server/src/services/quest-core.ts | Create | Core quest queries |
| server/src/services/quest-progress.ts | Create | Progress tracking |
| server/src/services/quest-lifecycle.ts | Create | Quest state management |
| server/src/services/quest/index.ts | Create | Re-export module |
| server/src/services/quest.ts | Delete | Remove after migration |
| server/src/routes/quests.ts | Modify | Update imports |
| (all files importing quest.ts) | Modify | Update import paths |

## Definition of Done

- [ ] All acceptance criteria met
- [ ] All tests pass
- [ ] No circular dependencies
- [ ] Each file under 400 lines
- [ ] No TypeScript errors
