# G41: Title Collection Page

## Overview
Build a dedicated page showing all titles (earned and locked), with ability to equip active title and view title requirements.

## Context
**Source:** docs/game-systems/titles.md
**Related Docs:** G13-title-system.md (completed)
**Current State:** Backend has title system, profile shows basic stats but no title management

## Acceptance Criteria
- [ ] Titles page accessible from profile or navigation
- [ ] Grid/list of all available titles
- [ ] Earned titles shown with unlock date
- [ ] Locked titles show requirements (e.g., "30-day streak")
- [ ] Current active title highlighted
- [ ] Ability to change active title
- [ ] Title passive bonuses displayed
- [ ] Rare/legendary titles visually distinct

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| web/src/pages/Titles.tsx | Create | Title collection page |
| web/src/components/title/TitleCard.tsx | Create | Individual title display |
| web/src/components/title/TitleGrid.tsx | Create | Grid layout for titles |
| web/src/hooks/useTitles.ts | Create | Hook for title data |
| web/src/App.tsx | Modify | Add route for /titles |
| web/src/components/layout/Navbar.tsx | Modify | Add titles link |

## Implementation Notes
From titles.md:
- Titles have categories (streak, boss, dungeon, seasonal)
- Active title shown in profile and leaderboard
- Passives provide XP bonuses or debuff reduction
- Some titles are one-time seasonal exclusives

## Definition of Done
- [ ] All acceptance criteria met
- [ ] No TypeScript errors
- [ ] Existing tests pass
