# Streaks & Debuffs

Streaks reward consistency. Debuffs reflect the cost of neglect.

---

## Streak Types

### Current Streak
Days with **3+/4 core dailies** completed.

### Perfect Streak
Days with **4/4 core dailies** completed.

### Longest Streak
Historical maximum (never resets).

---

## Streak Bonuses

| Milestone | XP Bonus |
|-----------|----------|
| 7 days | +5% |
| 14 days | +10% |
| 30 days | +15% |
| 60 days | +20% |
| 90 days | +25% |

---

## Streak Calculation

```typescript
// server/src/services/streak.service.ts
import { eq, and, desc } from 'drizzle-orm';
import { db } from '../db';
import { dailyLogs } from '../db/schema';

interface StreakResult {
  currentStreak: number;      // Days with 3+/4 core quests
  perfectStreak: number;      // Days with 4/4 core quests
  longestStreak: number;
  lastCompletedDate: string;
}

async function computeStreaks(userId: string): Promise<StreakResult> {
  const logs = await db
    .select()
    .from(dailyLogs)
    .where(and(eq(dailyLogs.userId, userId), eq(dailyLogs.evaluated, true)))
    .orderBy(desc(dailyLogs.dayDate))
    .limit(365);

  let currentStreak = 0;
  let perfectStreak = 0;

  for (const log of logs) {
    const passesDaily = log.coreCompleted >= 3;
    const passesPerfect = log.coreCompleted === log.coreTotal;

    if (passesDaily) {
      currentStreak++;
      if (passesPerfect) perfectStreak++;
      else perfectStreak = 0;
    } else {
      break; // Streak broken
    }
  }

  return { currentStreak, perfectStreak, longestStreak, lastCompletedDate };
}
```

---

## Debuff System

### Trigger
Miss **2+ core dailies** in a single day.

### Effect
- **-10% XP** for 24 hours
- Dungeon bonuses disabled
- Visual indicator on UI

### Duration
- Automatically expires after 24 hours
- Completing all dailies the next day doesn't remove it early
- The System is patient, but it remembers

---

## Debuff Implementation

```typescript
import { eq, and } from 'drizzle-orm';
import { db } from '../db';
import { users, dailyLogs } from '../db/schema';

async function evaluateDailyDebuff(userId: string, dayDate: string): Promise<void> {
  const [log] = await db
    .select()
    .from(dailyLogs)
    .where(and(eq(dailyLogs.userId, userId), eq(dailyLogs.dayDate, dayDate)));

  if (!log) return;

  const missedCore = log.coreTotal - log.coreCompleted;

  if (missedCore >= 2) {
    const debuffUntil = new Date();
    debuffUntil.setHours(debuffUntil.getHours() + 24);

    await db
      .update(users)
      .set({ debuffActiveUntil: debuffUntil })
      .where(eq(users.id, userId));

    await db
      .update(dailyLogs)
      .set({ debuffTriggered: true })
      .where(eq(dailyLogs.id, log.id));
  }
}
```

---

## Narrative Integration

### Streak Milestone (7 days)
```
7 CONSECUTIVE DAYS RECORDED

This is not an achievement.
This is a minimum threshold.

Streak Bonus Activated: +10% XP

The System has noted your consistency.
It expects continuation.
```

### Streak Milestone (30 days)
```
30 CONSECUTIVE DAYS RECORDED

Habit formation threshold reached.

The neural pathways have begun to shift.
Resistance will decrease.
The action will become default.

This is not motivation.
This is architecture.
```

### Debuff Notice
```
SYSTEM NOTICE: PERFORMANCE DEGRADATION

Repeated inaction detected.

No punishment issued.
Efficiency temporarily reduced.

You are not being punished.
You are experiencing the cost of neglect.

The System reflects reality - nothing more.
```

### Streak Broken
```
STREAK TERMINATED

Days recorded: {{streakDays}}

The System does not judge.
It only resets the counter.

What you built is not erased.
Only the momentum.
```
