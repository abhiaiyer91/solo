# G169: Mobile Quest Archive/Management Screen

## Overview
Create a quest archive and management screen for mobile matching web's Quests page where users can view all quest templates, activate/deactivate optional quests, and see quest categories.

## Context
**Source:** Ideation loop --focus "feature parity for web and mobile"
**Related Docs:** `web/src/pages/Quests.tsx`
**Current State:** Mobile has QuestCard, QuestList but no quest management screen

## Web Quests Features to Replicate
| Feature | Web Status | Mobile Status |
|---------|------------|---------------|
| Core quests display | ✅ Complete | ❌ Missing |
| Bonus daily quests | ✅ Complete | ❌ Missing |
| Weekly quests section | ✅ Complete | ❌ Missing |
| Special quests (dungeon/boss) | ✅ Complete | ❌ Missing |
| Activate/deactivate quests | ✅ Complete | ❌ Missing |
| Quest categories | ✅ Complete | ❌ Missing |
| XP rewards display | ✅ Complete | ⚠️ In QuestCard |

## Acceptance Criteria
- [ ] Display all quest templates grouped by type
- [ ] Core quests section (always active)
- [ ] Bonus daily quests with activate/deactivate
- [ ] Weekly quests section with auto-tracked indicator
- [ ] Special quests section (dungeons, bosses)
- [ ] Quest activation/deactivation functionality
- [ ] Visual feedback for active vs inactive quests
- [ ] Loading and error states

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| `mobile/src/screens/QuestArchive.tsx` | Create | Quest management screen |
| `mobile/src/components/QuestTemplateCard.tsx` | Create | Template display with toggle |
| `mobile/src/components/QuestCategorySection.tsx` | Create | Grouped quest sections |
| `mobile/src/hooks/useQuestTemplates.ts` | Create | Template data hook |

## Implementation Notes
- Fetch from `/api/quests/templates` endpoint
- Handle optimistic updates for activate/deactivate
- Use SectionList for categorized display
- Add haptic feedback for toggle actions

## Definition of Done
- [ ] All acceptance criteria met
- [ ] No TypeScript errors
- [ ] Existing tests pass
- [ ] Quest activation syncs with backend
