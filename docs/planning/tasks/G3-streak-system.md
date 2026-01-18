# G3: Implement Streak Tracking System

## Overview

Implement the streak tracking service that calculates consecutive days of quest completion and applies XP bonuses. Streaks are a core engagement mechanic.

## Context

**Current State:**
- User model has streak fields: `currentStreak`, `longestStreak`, `perfectStreak`
- DailyLog model exists with `isPerfectDay` flag
- No service calculates or updates streaks
- XP modifier system exists and supports `STREAK_BONUS` type

**Streak Rules (from docs):**
- Streak increments when ALL core quests are completed in a day
- Perfect streak tracks consecutive days with ALL quests (core + bonus)
- Streak resets to 0 if any core quest is missed
- Bonus XP tiers: 7 days (+10%), 14 days (+15%), 30 days (+25%)

**Related Docs:**
- `docs/game-systems/streaks-debuffs.md`
- `docs/game-systems/xp-leveling.md`

## Acceptance Criteria

- [ ] `streak.service.ts` calculates current streak from daily logs
- [ ] Streak updates automatically when day is finalized
- [ ] Streak bonus modifier applied to XP awards
- [ ] `/api/player/streak` endpoint returns streak data
- [ ] Longest streak updates when current exceeds it
- [ ] Perfect streak tracked separately from regular streak
- [ ] Streak resets correctly on missed day

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `server/src/services/streak.ts` | Create | Streak calculation service |
| `server/src/index.ts` | Modify | Add streak endpoint |
| `server/src/services/xp.ts` | Modify | Add streak bonus to XP |

## Implementation Guide

### Step 1: Create Streak Service

Create `server/src/services/streak.ts`:

```typescript
import { db } from '../db'
import { users, dailyLogs } from '../db/schema'
import { eq, and, desc, gte } from 'drizzle-orm'

if (!db) {
  throw new Error('Database connection required for streak service')
}

export interface StreakInfo {
  currentStreak: number
  longestStreak: number
  perfectStreak: number
  bonusTier: 'none' | 'bronze' | 'silver' | 'gold'
  bonusPercent: number
  streakStartDate: string | null
  daysUntilNextTier: number | null
}

/**
 * Get streak bonus multiplier based on current streak
 */
export function getStreakBonus(streakDays: number): { tier: string; percent: number } {
  if (streakDays >= 30) return { tier: 'gold', percent: 25 }
  if (streakDays >= 14) return { tier: 'silver', percent: 15 }
  if (streakDays >= 7) return { tier: 'bronze', percent: 10 }
  return { tier: 'none', percent: 0 }
}

/**
 * Calculate days until next streak bonus tier
 */
function getDaysUntilNextTier(streakDays: number): number | null {
  if (streakDays >= 30) return null // Already at max tier
  if (streakDays >= 14) return 30 - streakDays
  if (streakDays >= 7) return 14 - streakDays
  return 7 - streakDays
}

/**
 * Calculate streak from daily logs
 * A streak day requires all core quests completed
 */
export async function calculateStreak(userId: string): Promise<{
  currentStreak: number
  perfectStreak: number
  streakStartDate: string | null
}> {
  // Get daily logs in reverse chronological order
  const logs = await db!
    .select()
    .from(dailyLogs)
    .where(eq(dailyLogs.userId, userId))
    .orderBy(desc(dailyLogs.logDate))
    .limit(365) // Max 1 year lookback

  if (logs.length === 0) {
    return { currentStreak: 0, perfectStreak: 0, streakStartDate: null }
  }

  let currentStreak = 0
  let perfectStreak = 0
  let streakStartDate: string | null = null

  // Get today's date
  const today = new Date().toISOString().split('T')[0]

  // Check if there's a gap between today and most recent log
  const mostRecentLog = logs[0]
  const daysSinceLastLog = getDaysDifference(mostRecentLog!.logDate, today)

  // If more than 1 day gap and today isn't logged yet, streak is broken
  if (daysSinceLastLog > 1) {
    return { currentStreak: 0, perfectStreak: 0, streakStartDate: null }
  }

  // Count consecutive days where core quests were completed
  let expectedDate = daysSinceLastLog === 0 ? today : mostRecentLog!.logDate

  for (const log of logs) {
    const daysDiff = getDaysDifference(log.logDate, expectedDate)

    if (daysDiff > 1) {
      // Gap in logs - streak broken
      break
    }

    // Check if all core quests were completed
    if (log.coreQuestsCompleted >= log.coreQuestsTotal && log.coreQuestsTotal > 0) {
      currentStreak++
      streakStartDate = log.logDate

      // Check for perfect day (all quests including bonus)
      if (log.isPerfectDay) {
        perfectStreak++
      } else {
        perfectStreak = 0 // Reset perfect streak on non-perfect day
      }
    } else {
      // Missed core quests - streak broken
      break
    }

    expectedDate = log.logDate
  }

  return { currentStreak, perfectStreak, streakStartDate }
}

/**
 * Get days difference between two YYYY-MM-DD dates
 */
function getDaysDifference(date1: string, date2: string): number {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  const diffTime = Math.abs(d2.getTime() - d1.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Update user's streak data
 */
export async function updateUserStreak(userId: string): Promise<StreakInfo> {
  const { currentStreak, perfectStreak, streakStartDate } = await calculateStreak(userId)

  // Get current user data
  const [user] = await db!
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!user) {
    throw new Error('User not found')
  }

  // Update longest streak if current exceeds it
  const newLongestStreak = Math.max(currentStreak, user.longestStreak)

  // Update user
  await db!
    .update(users)
    .set({
      currentStreak,
      longestStreak: newLongestStreak,
      perfectStreak,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))

  const bonus = getStreakBonus(currentStreak)

  return {
    currentStreak,
    longestStreak: newLongestStreak,
    perfectStreak,
    bonusTier: bonus.tier as StreakInfo['bonusTier'],
    bonusPercent: bonus.percent,
    streakStartDate,
    daysUntilNextTier: getDaysUntilNextTier(currentStreak),
  }
}

/**
 * Get streak info for a user (without updating)
 */
export async function getStreakInfo(userId: string): Promise<StreakInfo> {
  const [user] = await db!
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!user) {
    throw new Error('User not found')
  }

  const bonus = getStreakBonus(user.currentStreak)

  // Calculate streak start date
  const { streakStartDate } = await calculateStreak(userId)

  return {
    currentStreak: user.currentStreak,
    longestStreak: user.longestStreak,
    perfectStreak: user.perfectStreak,
    bonusTier: bonus.tier as StreakInfo['bonusTier'],
    bonusPercent: bonus.percent,
    streakStartDate,
    daysUntilNextTier: getDaysUntilNextTier(user.currentStreak),
  }
}
```

### Step 2: Add Streak Endpoint

Add to `server/src/index.ts`:

```typescript
import { getStreakInfo } from './services/streak'

// Streak endpoint
app.get('/api/player/streak', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const streakInfo = await getStreakInfo(user.id)
    return c.json(streakInfo)
  } catch (error) {
    console.error('Streak info error:', error)
    return c.json({ error: 'Failed to get streak info' }, 500)
  }
})
```

### Step 3: Add Streak Bonus to XP Awards

Modify `server/src/services/xp.ts` to apply streak bonus:

```typescript
import { getStreakBonus } from './streak'

// In createXPEvent function, before applying modifiers:
export async function createXPEvent(input: CreateXPEventInput): Promise<{...}> {
  // ... existing code ...

  // Get user's current streak for bonus
  const currentStreak = user.currentStreak ?? 0
  const streakBonus = getStreakBonus(currentStreak)

  // Add streak bonus modifier if applicable
  const allModifiers = [...(modifiers || [])]
  if (streakBonus.percent > 0) {
    allModifiers.push({
      type: 'STREAK_BONUS' as const,
      multiplier: 1 + streakBonus.percent / 100,
      description: `${streakBonus.tier} streak bonus (${currentStreak} days)`,
    })
  }

  // Apply modifiers with streak bonus included
  const { finalAmount, orderedModifiers } = applyModifiers(baseAmount, allModifiers)

  // ... rest of existing code ...
}
```

### Step 4: Update Streak After Quest Completion

Add streak update call in quest completion flow. In `server/src/services/quest.ts`:

```typescript
import { updateUserStreak } from './streak'

// In updateQuestProgress, after updating daily log for a completed quest:
if (newStatus === 'COMPLETED') {
  // ... existing daily log update code ...

  // Update streak after daily log update
  await updateUserStreak(userId)
}
```

## Testing

1. **Streak Calculation:**
   - Complete all core quests for 3 consecutive days
   - Verify streak increments each day
   - Verify `/api/player/streak` returns correct data

2. **Streak Break:**
   - Miss a day (don't complete quests)
   - Verify streak resets to 0

3. **Streak Bonus:**
   - Get streak to 7+ days
   - Complete a quest and verify +10% XP modifier in response

4. **Longest Streak:**
   - Get a 5-day streak, break it
   - Get a 3-day streak
   - Verify longest streak is still 5

## Definition of Done

- [ ] All acceptance criteria checked
- [ ] Streak service calculates correctly
- [ ] `/api/player/streak` returns full streak info
- [ ] Streak bonus applied to XP awards
- [ ] Streak updates after quest completion
- [ ] No TypeScript errors
