# G184: API Response Caching Layer

## Overview
Implement server-side response caching for frequently accessed, slowly-changing data to improve performance and reduce database load.

## Context
**Source:** Ideation loop --focus retrospective, forward-looking
**Current State:** No caching layer observed - all requests hit database
**Impact:** Performance bottleneck as user base grows

## Acceptance Criteria
- [ ] Redis or in-memory cache integration
- [ ] Caching for player stats (5 min TTL)
- [ ] Caching for leaderboards (1 min TTL)
- [ ] Caching for quest templates (1 hour TTL)
- [ ] Cache invalidation on relevant mutations
- [ ] Cache bypass for authenticated user-specific data
- [ ] Metrics for cache hit/miss rates

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| server/src/lib/cache.ts | Modify | Extend existing cache implementation |
| server/src/middleware/cache.ts | Create | Express caching middleware |
| server/src/routes/player-stats.ts | Modify | Add caching |
| server/src/routes/leaderboards.ts | Modify | Add caching |
| server/src/routes/quests.ts | Modify | Add caching for templates |

## Implementation Notes
- Start with in-memory cache (Map-based) for simplicity
- Upgrade to Redis for horizontal scaling if needed
- Use ETags for conditional requests
- Consider stale-while-revalidate pattern

## Cache Strategy
| Endpoint | TTL | Invalidation |
|----------|-----|--------------|
| GET /api/player/stats | 5 min | On quest complete, XP gain |
| GET /api/leaderboards | 1 min | On any player XP change |
| GET /api/quests/templates | 1 hour | On admin update |
| GET /api/dungeons | 30 min | On admin update |

## Definition of Done
- [ ] All acceptance criteria met
- [ ] Response times improved for cached endpoints
- [ ] No stale data bugs introduced
- [ ] Cache metrics available
