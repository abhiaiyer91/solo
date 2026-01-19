# G152: Integration Test Suite

## Overview
Create integration tests that verify cross-service flows work correctly end-to-end. Unit tests verify individual pieces; integration tests verify the pieces work together.

## Context
**Source:** Ideation loop --focus testing/stability
**Related Docs:** Backend services in `server/src/services/`
**Current State:** Services tested in isolation, no cross-service flow tests

## Acceptance Criteria
- [ ] Test: Quest completion → XP award → Level up check
- [ ] Test: Health sync → Quest auto-complete → XP award
- [ ] Test: Streak update → Debuff evaluation → Notification
- [ ] Test: Boss fight → Victory → Shadow extraction
- [ ] Test: Guild creation → Member join → Activity feed
- [ ] Test: Season start → Quest pool refresh → Player notification
- [ ] Tests use real service implementations (not mocks)
- [ ] Tests use test database with rollback

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| server/src/test/integration/quest-flow.test.ts | Create | Quest completion flow |
| server/src/test/integration/health-sync.test.ts | Create | Health sync flow |
| server/src/test/integration/streak-flow.test.ts | Create | Streak and debuff flow |
| server/src/test/integration/boss-flow.test.ts | Create | Boss fight flow |
| server/src/test/integration/guild-flow.test.ts | Create | Guild activity flow |
| server/src/test/integration/season-flow.test.ts | Create | Season transition flow |
| server/src/test/integration/setup.ts | Create | Integration test setup |
| server/src/test/integration/helpers.ts | Create | Test helper functions |
| server/vitest.config.ts | Modify | Add integration test config |

## Implementation Notes

### Test Database Setup
```typescript
import { db } from '../../db'

beforeEach(async () => {
  // Start transaction
  await db.execute('BEGIN')
})

afterEach(async () => {
  // Rollback to clean state
  await db.execute('ROLLBACK')
})
```

### Quest Completion Flow Test
```typescript
describe('Quest Completion Flow', () => {
  it('awards XP and checks level up when quest completed', async () => {
    // 1. Create test user at level 1
    const user = await createTestUser({ level: 1, xp: 90 })

    // 2. Create quest requiring 10 XP
    const quest = await createTestQuest({ xpReward: 15 })

    // 3. Complete quest
    const result = await questService.completeQuest(user.id, quest.id)

    // 4. Verify XP awarded
    expect(result.xpAwarded).toBe(15)

    // 5. Verify level up triggered (100 XP threshold)
    expect(result.leveledUp).toBe(true)
    expect(result.newLevel).toBe(2)

    // 6. Verify XP ledger entry created
    const ledgerEntry = await db.query.xpLedger.findFirst({
      where: eq(xpLedger.userId, user.id)
    })
    expect(ledgerEntry.amount).toBe(15)
  })
})
```

### Health Sync Flow Test
```typescript
describe('Health Sync Flow', () => {
  it('auto-completes step quest when health data synced', async () => {
    // 1. Create user with steps quest (target: 10000)
    const user = await createTestUser()
    const quest = await assignQuest(user.id, 'steps', { target: 10000 })

    // 2. Sync health data with 12000 steps
    await healthService.syncHealthData(user.id, {
      steps: 12000,
      source: 'healthkit'
    })

    // 3. Verify quest auto-completed
    const updatedQuest = await questService.getQuest(quest.id)
    expect(updatedQuest.status).toBe('completed')
    expect(updatedQuest.currentValue).toBe(12000)

    // 4. Verify XP awarded
    const xpEntry = await xpService.getLatestEntry(user.id)
    expect(xpEntry.source).toBe('quest_completion')
  })
})
```

## Definition of Done
- [ ] All acceptance criteria met
- [ ] Tests run in isolated database transactions
- [ ] No flaky tests (run 10 times successfully)
- [ ] Tests complete in under 30 seconds total
- [ ] Clear failure messages identify which step failed
