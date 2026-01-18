# G45: Archive & Soft Reset Feature

## Overview
Allow players returning after long absences (90+ days) to optionally archive their progress and start fresh while preserving history.

## Context
**Source:** docs/game-systems/failure-recovery.md
**Related Docs:** G26-return-protocol.md (completed)
**Current State:** Return protocol exists for shorter absences, no archive/fresh start option

## Acceptance Criteria
- [ ] Detect extended absence (90+ days)
- [ ] Offer preserve vs archive choice on return
- [ ] Archive option creates historical snapshot
- [ ] Fresh start resets level/XP/streak but keeps account
- [ ] Archived runs viewable in profile
- [ ] Multiple archives possible
- [ ] Preserve option continues normally
- [ ] System narrative for archive flow

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| server/src/db/schema/game.ts | Modify | Add archives table |
| server/src/services/archive.ts | Create | Archive creation service |
| server/src/routes/player.ts | Modify | Add archive endpoint |
| web/src/components/ArchiveModal.tsx | Create | Archive choice modal |
| web/src/pages/Profile.tsx | Modify | Add archives view |
| web/src/hooks/useArchives.ts | Create | Hook for archive data |

## Implementation Notes
From failure-recovery.md:
- Trigger at 90+ days absence
- Preserve: Continue from current state
- Archive: Store current run, reset to Level 1
- Narrative: "Some players prefer clean starts."
- Archives include: level, XP, titles, bosses defeated, streaks

## Database Schema Addition
```typescript
export const playerArchives = pgTable("player_archives", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id).notNull(),
  archivedAt: timestamp("archived_at").defaultNow().notNull(),
  levelAtArchive: integer("level_at_archive").notNull(),
  totalXpAtArchive: integer("total_xp_at_archive").notNull(),
  longestStreakAtArchive: integer("longest_streak").notNull(),
  titlesEarned: jsonb("titles_earned"),
  bossesDefeated: jsonb("bosses_defeated"),
  activeDays: integer("active_days").notNull(),
});
```

## Definition of Done
- [ ] All acceptance criteria met
- [ ] No TypeScript errors
- [ ] Existing tests pass
