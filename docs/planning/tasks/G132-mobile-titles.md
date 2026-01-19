# G132: Mobile Title Collection Screen

## Overview

Build mobile UI for viewing and managing unlocked titles, including title equip, title details, and unlock progress.

## Context

**Source:** Mobile parity analysis
**Current State:** Web has title collection page; mobile has none
**Dependencies:** Title backend already complete

## Acceptance Criteria

- [ ] Title grid/list view with unlock status
- [ ] Title detail modal with requirements and bonuses
- [ ] Equip/unequip title functionality
- [ ] Filter by unlock status (locked/unlocked)
- [ ] Sort by rarity, recency, or alphabetical
- [ ] Progress indicators for partially unlocked titles
- [ ] Celebration animation when unlocking new title
- [ ] Equipped title indicator

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| mobile/src/screens/Titles.tsx | Create | Title collection screen |
| mobile/src/components/TitleCard.tsx | Create | Title display card |
| mobile/src/components/TitleDetailModal.tsx | Create | Title detail popup |
| mobile/src/hooks/useTitles.ts | Create | Title data and actions hook |
| mobile/src/navigation/index.tsx | Modify | Add titles to navigation |

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Consistent with app design language
- [ ] Smooth animations on unlock
- [ ] Loading and error states
- [ ] No TypeScript errors
