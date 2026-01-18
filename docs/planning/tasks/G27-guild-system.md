# G27: Implement Guild System

## Overview
Implement the social guild system that allows 3-10 players to form groups, share challenges, and compete on leaderboards. Guilds are documented in `docs/game-systems/social.md`.

## Context
**Source:** Ideation Loop analysis - documented feature not implemented
**Related Docs:** docs/game-systems/social.md
**Current State:** No guild-related schema, services, or routes exist

## Acceptance Criteria
- [ ] Guild schema tables created (guilds, guildMembers, guildChallenges)
- [ ] Guild service with create, join, leave, invite functions
- [ ] Guild challenges service with progress tracking
- [ ] API endpoints for guild management
- [ ] Guild challenge completion awards XP to all members

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| server/src/db/schema/social.ts | Create | Guild schema tables |
| server/src/db/schema/index.ts | Modify | Export social schema |
| server/src/services/guild.ts | Create | Guild CRUD and membership |
| server/src/services/guild-challenge.ts | Create | Challenge tracking |
| server/src/routes/guilds.ts | Create | API endpoints |
| server/src/index.ts | Modify | Register guild routes |

## Implementation Notes
- Guilds require Level 10+ to create
- Max 3 accountability partners
- 7-day cooldown before re-joining after leaving
- Guild challenges are weekly with collective requirements

## Definition of Done
- [ ] All acceptance criteria met
- [ ] No TypeScript errors
- [ ] Existing tests pass
