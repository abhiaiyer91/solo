# G171: Mobile Dungeons Screen

## Overview
Create a dungeons browser screen for mobile matching web's Dungeons page with available dungeons, active dungeon tracking, and dungeon history.

## Context
**Source:** Ideation loop --focus "feature parity for web and mobile"
**Related Docs:** `web/src/pages/Dungeons.tsx`
**Current State:** Mobile has DungeonCard, DungeonList components but no screen

## Web Dungeons Features to Replicate
| Feature | Web Status | Mobile Status |
|---------|------------|---------------|
| Available dungeons list | ✅ Complete | ⚠️ Has DungeonList |
| Active dungeon display | ✅ Complete | ❌ Missing |
| Dungeon history | ✅ Complete | ❌ Missing |
| Dungeon entry modal | ✅ Complete | ❌ Missing |
| Total cleared count | ✅ Complete | ❌ Missing |
| Rank display with colors | ✅ Complete | ⚠️ In DungeonCard |

## Acceptance Criteria
- [ ] Header with total dungeons cleared
- [ ] Active dungeon section (if in progress)
- [ ] Available dungeons grid/list
- [ ] Dungeon entry confirmation modal
- [ ] Dungeon history section (completed)
- [ ] Rank display with appropriate colors
- [ ] Loading and error states

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| `mobile/src/screens/Dungeons.tsx` | Create | Main dungeons screen |
| `mobile/src/components/ActiveDungeon.tsx` | Create | Current dungeon progress |
| `mobile/src/components/DungeonEntryModal.tsx` | Create | Entry confirmation |
| `mobile/src/components/DungeonHistoryItem.tsx` | Create | Completed dungeon entry |

## Implementation Notes
- Adapt useDungeons hook from mobile
- Use Modal component for entry confirmation
- Display time limits prominently
- Add haptic feedback for dungeon start

## Definition of Done
- [ ] All acceptance criteria met
- [ ] No TypeScript errors
- [ ] Existing tests pass
- [ ] Dungeon entry works correctly
