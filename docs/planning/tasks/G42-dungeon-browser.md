# G42: Dungeon Browser Page

## Overview
Build a dedicated dungeon browser page showing available dungeons, active dungeon progress, and dungeon history.

## Context
**Source:** docs/game-systems/dungeons.md, docs/game-systems/dungeon-designs.md
**Related Docs:** G15-dungeon-system.md (completed)
**Current State:** Backend has dungeon system, no dedicated frontend page

## Acceptance Criteria
- [ ] Dungeons page accessible from navigation
- [ ] List of available dungeons by rank (E, D, C, B, A, S)
- [ ] Each dungeon shows requirements and rewards
- [ ] Active dungeon section with timer/progress
- [ ] Dungeon entry confirmation modal
- [ ] Dungeon completion summary
- [ ] History of completed dungeons
- [ ] Locked dungeons show unlock requirements

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| web/src/pages/Dungeons.tsx | Create | Dungeon browser page |
| web/src/components/dungeon/DungeonCard.tsx | Create | Individual dungeon display |
| web/src/components/dungeon/DungeonList.tsx | Create | Grouped dungeon list |
| web/src/components/dungeon/ActiveDungeon.tsx | Create | Active dungeon progress |
| web/src/components/dungeon/DungeonEntryModal.tsx | Create | Entry confirmation |
| web/src/hooks/useDungeons.ts | Create | Hook for dungeon data |
| web/src/App.tsx | Modify | Add route for /dungeons |
| web/src/components/layout/Navbar.tsx | Modify | Add dungeons link |

## Implementation Notes
From dungeons.md:
- Dungeons are time-limited challenges (24h-7d)
- Rank determines difficulty and XP multiplier
- Some dungeons have prerequisites (level, titles)
- Active dungeon shows live progress toward objectives

## Definition of Done
- [ ] All acceptance criteria met
- [ ] No TypeScript errors
- [ ] Existing tests pass
