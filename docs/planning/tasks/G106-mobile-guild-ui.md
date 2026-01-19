# G106: Mobile Guild Components

## Overview

Build mobile UI components for guild features including guild list, guild detail, member management, and guild chat.

## Context

**Source:** Mobile parity analysis
**Current State:** Web has full guild UI; mobile has none
**Dependencies:** Guild backend already complete

## Acceptance Criteria

- [ ] Guild browser screen with search/filter
- [ ] Guild detail view with stats and members
- [ ] Join guild flow with confirmation
- [ ] Leave guild confirmation modal
- [ ] Member list with roles displayed
- [ ] Guild activity feed
- [ ] Create guild modal (for eligible players)
- [ ] Guild settings (for officers/leaders)

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| mobile/src/screens/GuildBrowser.tsx | Create | Browse and search guilds |
| mobile/src/screens/GuildDetail.tsx | Create | Guild information and members |
| mobile/src/components/GuildCard.tsx | Create | Guild list item card |
| mobile/src/components/GuildMemberList.tsx | Create | Member list with roles |
| mobile/src/components/GuildActivityFeed.tsx | Create | Guild activity stream |
| mobile/src/hooks/useGuild.ts | Create | Guild data and actions hook |
| mobile/src/navigation/index.tsx | Modify | Add guild screens to navigation |

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Consistent styling with mobile app theme
- [ ] Smooth navigation transitions
- [ ] Loading and error states
- [ ] Pull-to-refresh on lists
- [ ] No TypeScript errors
