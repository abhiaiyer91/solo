# G185: API Route Test Coverage Expansion

## Overview
Expand test coverage for API routes from current ~27% to target 80%. Routes are critical paths that currently have fewer tests than services.

## Context
**Source:** Ideation loop --focus retrospective
**Current State:** 8/30 route files have tests (27%)
**Target:** 24/30 route files with tests (80%)

## Acceptance Criteria
- [ ] Test coverage for all authentication routes
- [ ] Test coverage for quest routes (CRUD, completion)
- [ ] Test coverage for player routes (stats, profile)
- [ ] Test coverage for dungeon/boss routes
- [ ] Test coverage for social routes (guild, accountability)
- [ ] Integration tests for multi-route flows
- [ ] Error case testing for all routes

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| server/src/routes/auth.test.ts | Create | Auth flow tests |
| server/src/routes/quests.test.ts | Create | Quest CRUD tests |
| server/src/routes/player.test.ts | Create | Player routes tests |
| server/src/routes/dungeons.test.ts | Create | Dungeon routes tests |
| server/src/routes/bosses.test.ts | Create | Boss routes tests |
| server/src/routes/guilds.test.ts | Extend | More coverage |
| server/src/routes/titles.test.ts | Create | Title routes tests |
| server/src/routes/nutrition.test.ts | Extend | More coverage |

## Priority Order
1. **Authentication routes** - Security critical
2. **Quest routes** - Core user flow
3. **Player routes** - Frequently accessed
4. **Game content routes** - Dungeons, bosses, titles
5. **Social routes** - Guild, accountability

## Testing Patterns
```typescript
describe('POST /api/quests/:id/complete', () => {
  it('should complete quest and award XP');
  it('should fail for non-existent quest');
  it('should fail for already completed quest');
  it('should trigger streak update');
});
```

## Definition of Done
- [ ] All acceptance criteria met
- [ ] Route test coverage >= 80%
- [ ] All tests passing
- [ ] CI includes route tests
