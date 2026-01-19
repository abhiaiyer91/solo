# G121: Custom Quest Templates

## Overview

Allow users to create and save custom quest templates that can be activated as personal daily or weekly quests.

## Context

**Source:** User engagement and personalization
**Current State:** Only system-defined quest templates exist

## Acceptance Criteria

- [ ] Custom quest creation form with requirement builder
- [ ] Template library showing user's custom quests
- [ ] Activate/deactivate custom quest templates
- [ ] XP reward calculation based on difficulty
- [ ] Stat reward selection (which stat gains points)
- [ ] Quest icon/color customization
- [ ] Template sharing (optional - share with guild)
- [ ] Maximum active custom quests limit (3)

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| server/src/db/schema/custom-quests.ts | Create | Custom quest template schema |
| server/src/routes/custom-quests.ts | Create | Custom quest API endpoints |
| server/src/services/custom-quest.ts | Create | Custom quest service |
| web/src/pages/QuestBuilder.tsx | Create | Quest creation page |
| web/src/components/quest/QuestTemplateCard.tsx | Create | Custom template card |
| web/src/components/quest/RequirementBuilder.tsx | Create | Requirement type selector |
| web/src/hooks/useCustomQuests.ts | Create | Custom quest hook |
| server/src/services/quest.ts | Modify | Integrate custom quests |

## Definition of Done

- [ ] All acceptance criteria met
- [ ] XP rewards are balanced
- [ ] Custom quests integrate with daily quest flow
- [ ] Templates persist across sessions
- [ ] No TypeScript errors
