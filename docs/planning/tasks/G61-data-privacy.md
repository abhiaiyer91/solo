# G61: Data Privacy Compliance

## Overview

Implement GDPR/CCPA compliance features including data export, account deletion, and privacy controls.

## Context

**Source:** Retrospection analysis - No data privacy features
**Current State:** No export or deletion capabilities

## Acceptance Criteria

- [ ] GET `/api/player/export` returns all user data as JSON
- [ ] DELETE `/api/player/account` initiates deletion flow
- [ ] 30-day deletion grace period with cancellation option
- [ ] All user data actually deleted after grace period
- [ ] Privacy settings in profile (leaderboard opt-out exists)
- [ ] Clear data retention policy displayed

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `server/src/services/data-export.ts` | Create | Export user data |
| `server/src/services/account-deletion.ts` | Create | Deletion logic |
| `server/src/routes/player.ts` | Modify | Add export/delete endpoints |
| `server/src/db/schema/auth.ts` | Modify | Add deletionRequestedAt field |
| `web/src/pages/Profile.tsx` | Modify | Add export/delete buttons |
| `web/src/components/profile/DataPrivacy.tsx` | Create | Privacy settings UI |

## Implementation Notes

### Data Export

```typescript
interface UserDataExport {
  account: {
    id: string
    email: string
    name: string
    createdAt: Date
  }
  stats: {
    level: number
    totalXP: bigint
    streaks: { current: number; longest: number }
  }
  questHistory: QuestLog[]
  xpTimeline: XPEvent[]
  titles: UserTitle[]
  healthSnapshots: HealthSnapshot[]
  bossAttempts: BossAttempt[]
  dungeonAttempts: DungeonAttempt[]
  // ... all user data
}

export async function exportUserData(userId: string): Promise<UserDataExport> {
  // Gather all tables with userId foreign key
  // Return as structured JSON
}
```

### Account Deletion Flow

1. User requests deletion
2. Set `deletionRequestedAt` timestamp
3. Send confirmation email
4. After 30 days, run cleanup job:
   - Delete all quest logs
   - Delete all XP events
   - Delete all health data
   - Delete all social connections
   - Anonymize leaderboard entries
   - Delete account

### Cancellation

```typescript
// User can cancel within 30 days
app.post('/api/player/account/cancel-deletion', async (c) => {
  const user = c.get('user')
  await db.update(users)
    .set({ deletionRequestedAt: null })
    .where(eq(users.id, user.id))
  return c.json({ message: 'Deletion cancelled' })
})
```

### UI Design

```
┌─────────────────────────────────────────────────┐
│  DATA & PRIVACY                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│  📥 Export My Data                              │
│  Download all your data as JSON                 │
│                                     [EXPORT]    │
│                                                 │
│  ─────────────────────────────────────────────  │
│                                                 │
│  🗑️ Delete Account                              │
│  Permanently delete your account and all data.  │
│  30-day grace period before final deletion.     │
│                                     [DELETE]    │
│                                                 │
└─────────────────────────────────────────────────┘
```

## Definition of Done

- [ ] Export downloads complete user data
- [ ] Deletion request recorded
- [ ] Cancellation works within grace period
- [ ] Data actually deleted after 30 days
- [ ] UI clearly explains the process
