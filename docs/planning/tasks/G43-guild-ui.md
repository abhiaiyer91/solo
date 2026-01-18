# G43: Guild Management UI

## Overview
Build a dedicated guild page with guild creation, member management, guild challenges, and guild leaderboard.

## Context
**Source:** docs/game-systems/social.md
**Related Docs:** G27-guild-system.md (completed)
**Current State:** Backend has guild system (routes/guilds.ts, services/guild.ts), no frontend

## Acceptance Criteria
- [ ] Guilds page accessible from navigation
- [ ] Create guild flow (Level 10+ requirement)
- [ ] Guild dashboard showing members and status
- [ ] Member list with roles (leader, officer, member)
- [ ] Guild challenge display with collective progress
- [ ] Guild invite system (generate/share code)
- [ ] Leave guild confirmation
- [ ] Guild settings (for leaders)
- [ ] No-guild state with guild search/creation

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| web/src/pages/Guilds.tsx | Create | Guild page |
| web/src/components/guild/GuildDashboard.tsx | Create | Guild overview |
| web/src/components/guild/GuildMembers.tsx | Create | Member list |
| web/src/components/guild/GuildChallenges.tsx | Create | Active challenges |
| web/src/components/guild/CreateGuildModal.tsx | Create | Guild creation |
| web/src/components/guild/GuildInvite.tsx | Create | Invite handling |
| web/src/hooks/useGuild.ts | Create | Hook for guild data |
| web/src/App.tsx | Modify | Add route for /guild |
| web/src/components/layout/Navbar.tsx | Modify | Add guild link |

## Implementation Notes
From social.md:
- Guilds are 3-10 members
- Creation requires Level 10+
- Guild challenges are weekly collective goals
- Guild ranks: bronze, silver, gold, platinum

## Definition of Done
- [ ] All acceptance criteria met
- [ ] No TypeScript errors
- [ ] Existing tests pass
