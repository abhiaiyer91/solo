# G155: Complete Service Test Coverage

## Overview
Add unit tests for the 23 backend services that currently lack test coverage. Services are the core business logic layer and must be well-tested.

## Context
**Source:** Ideation loop --focus testing/stability
**Related Docs:** `server/src/services/*.ts`
**Current State:** 26 of 49 services have tests (53% coverage)

## Services Without Tests
1. `health.ts` - HealthKit data processing
2. `season.ts` - Season management
3. `lore.ts` - Lore content delivery
4. `achievement.ts` - Achievement tracking
5. `daily-challenge.ts` - Daily challenge generation
6. `metrics.ts` - Metrics collection
7. `streak-recovery.ts` - Streak recovery logic
8. `voice.ts` - Voice/narrative generation
9. `email.ts` - Email sending
10. `pattern-analysis.ts` - Behavior pattern analysis
11. `quest-lifecycle.ts` - Quest state management
12. `quest-progress.ts` - Progress tracking
13. `quest-history.ts` - History queries
14. `quest-core.ts` - Core quest logic
15. `push.ts` - Push notifications
16. `weekly-recap.ts` - Weekly recap generation
17. `stats.ts` - Stat calculations
18. `analytics.ts` - Analytics service
19. `open-food-facts.ts` - Food API client
20. `exercise.ts` - Exercise management
21. `custom-quest.ts` - Custom quest CRUD
22. `profile.ts` - Profile management
23. `nutrition.ts` - Nutrition tracking

## Acceptance Criteria
- [ ] Tests for `health.ts` (priority: P0)
- [ ] Tests for `quest-lifecycle.ts` (priority: P0)
- [ ] Tests for `stats.ts` (priority: P1)
- [ ] Tests for `analytics.ts` (priority: P1)
- [ ] Tests for `push.ts` (priority: P1)
- [ ] Tests for `season.ts` (priority: P1)
- [ ] Tests for remaining services (priority: P2)
- [ ] Each test file covers main public methods
- [ ] Mock external dependencies (database, APIs)

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| server/src/services/health.test.ts | Create | Health service tests |
| server/src/services/quest-lifecycle.test.ts | Create | Quest lifecycle tests |
| server/src/services/stats.test.ts | Create | Stats service tests |
| server/src/services/analytics.test.ts | Create | Analytics tests |
| server/src/services/push.test.ts | Create | Push notification tests |
| server/src/services/season.test.ts | Create | Season service tests |
| server/src/services/email.test.ts | Create | Email service tests |
| server/src/services/weekly-recap.test.ts | Create | Weekly recap tests |
| server/src/services/nutrition.test.ts | Create | Nutrition tests |
| server/src/services/profile.test.ts | Create | Profile tests |
| server/src/services/custom-quest.test.ts | Create | Custom quest tests |
| server/src/services/exercise.test.ts | Create | Exercise tests |

## Implementation Notes

### Health Service Test Pattern
```typescript
describe('healthService', () => {
  describe('syncHealthData', () => {
    it('processes HealthKit snapshot correctly', async () => {
      const userId = 'test-user-id'
      const healthData = {
        steps: 8500,
        activeCalories: 350,
        exerciseMinutes: 45,
        sleepMinutes: 420,
        source: 'healthkit' as const
      }

      // Mock database
      vi.mocked(db.insert).mockResolvedValue({ rowCount: 1 })

      const result = await healthService.syncHealthData(userId, healthData)

      expect(result.success).toBe(true)
      expect(db.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          userId,
          steps: 8500
        })
      )
    })

    it('triggers quest evaluation after sync', async () => {
      // Verify quest auto-completion is called
    })

    it('handles duplicate sync gracefully', async () => {
      // Verify idempotency
    })
  })
})
```

### Quest Lifecycle Test Pattern
```typescript
describe('questLifecycleService', () => {
  describe('assignDailyQuests', () => {
    it('assigns correct quest pool based on level', async () => {
      // Test quest assignment logic
    })

    it('respects player preferences', async () => {
      // Test preference handling
    })
  })

  describe('completeQuest', () => {
    it('updates quest status to completed', async () => {})
    it('awards XP on completion', async () => {})
    it('checks for bonus modifiers', async () => {})
    it('triggers streak update', async () => {})
  })

  describe('expireQuests', () => {
    it('marks overdue quests as expired', async () => {})
    it('does not expire in-progress dungeons', async () => {})
  })
})
```

## Testing Priority Order
1. **P0 - Critical Path:** health, quest-lifecycle
2. **P1 - High Impact:** stats, analytics, push, season
3. **P2 - Complete Coverage:** remaining services

## Definition of Done
- [ ] All acceptance criteria met
- [ ] No TypeScript errors
- [ ] Overall service test coverage >70%
- [ ] Tests run in under 30 seconds
- [ ] Clear documentation of what each service test covers
