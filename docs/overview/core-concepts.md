# Core Concepts

The Journey Fitness Quest System transforms real-world health activities into an RPG progression system. This document covers the foundational game design.

---

## Player Stats

Every player has four core attributes that reflect their fitness journey:

| Stat | Full Name | What It Tracks |
|------|-----------|----------------|
| **STR** | Strength | Strength training progress |
| **AGI** | Agility | Cardio/movement consistency |
| **VIT** | Vitality | Nutrition/sleep quality |
| **DISC** | Discipline | Streak-based coefficient |

### Level
- Derived from cumulative XP
- Range: 1 to ∞
- Level curve: `threshold(L) = floor(50 × L² × 1.15) + (L × 25)`

### HP (Conceptual)
- Metaphor for recovery capacity
- Not a traditional health bar
- Reflects overall system health

---

## Quest Types

### Daily Quests
Trivial tasks that compound over time. Complete them consistently to build streaks.

**Core Dailies** (4 required):
1. **Steps** — Walk 10,000 steps
2. **Workout** — Complete any workout
3. **Protein** — Hit protein target (150g)
4. **Sleep** — Get 7+ hours of sleep

**Optional Dailies**:
- Alcohol-free day
- Meditation/mindfulness
- Hydration target

### Weekly Quests
7-day challenges that encourage sustained effort.

Examples:
- "Complete 5 workouts this week"
- "Average 8,000 steps per day"
- "Hit protein target 6/7 days"

### Dungeons
Optional high-risk/high-reward challenges with time limits.

- Time-boxed (24-72 hours)
- Specific requirements (e.g., "Run 5K under 25 minutes")
- XP multiplier on completion
- Failure has no penalty (beyond missed reward)

### Boss Fights
Multi-phase identity challenges that represent personal growth milestones.

- Sustained compliance over days/weeks
- Narrative-heavy (boss "speaks" to your weaknesses)
- Defeat unlocks titles and permanent bonuses

---

## XP System

### Immutable Ledger
All XP events are append-only. No XP is ever deleted or modified.

```
XP Event:
├── baseXP: number
├── modifiers: Modifier[]
├── finalXP: number
├── totalXPBefore: bigint
├── totalXPAfter: bigint
├── levelBefore: number
├── levelAfter: number
└── eventHash: SHA256 (immutability verification)
```

### Level Curve

```typescript
function computeLevelThreshold(level: number): number {
  return Math.floor(50 * Math.pow(level, 2) * 1.15) + (level * 25);
}
```

| Level | XP Required | Cumulative |
|-------|-------------|------------|
| 1 | 0 | 0 |
| 2 | 140 | 140 |
| 5 | 460 | 1,250 |
| 10 | 1,625 | 7,350 |
| 25 | 8,281 | 91,875 |
| 50 | 32,625 | 651,250 |

### XP Modifiers

Modifiers are applied in order: **bonuses first, then penalties**.

| Modifier | Multiplier | Condition |
|----------|------------|-----------|
| Streak Bonus (7 days) | 1.05x | 7-day streak |
| Streak Bonus (14 days) | 1.10x | 14-day streak |
| Streak Bonus (30 days) | 1.15x | 30-day streak |
| Weekend Bonus | 1.05x | Saturday/Sunday |
| Season Multiplier | Variable | Active season |
| Title Passive | Variable | Active title |
| Debuff Penalty | 0.90x | Debuff active |

---

## Debuff System

### Trigger
Miss **≥2 core dailies** in a single day.

### Effect
- **-10% XP** for 24 hours
- Dungeon bonuses disabled
- Visual indicator on UI

### Narrative
> "You are experiencing the cost of neglect."

### Recovery
- Debuff automatically expires after 24 hours
- Completing all core dailies the next day doesn't remove it early
- The System is patient, but it remembers

---

## Streaks

### Current Streak
Days with **≥3/4 core dailies** completed.

### Perfect Streak
Days with **4/4 core dailies** completed.

### Longest Streak
Historical maximum (never resets).

### Streak Bonuses
| Milestone | XP Bonus |
|-----------|----------|
| 7 days | +5% |
| 14 days | +10% |
| 30 days | +15% |
| 60 days | +20% |
| 90 days | +25% |

---

## Titles

Earned achievements that provide passive bonuses when equipped.

### Example Titles

| Title | Condition | Passive |
|-------|-----------|---------|
| The Consistent | 30-day streak | +5% XP |
| Alcohol Slayer | 30 alcohol-free days | +10% VIT XP |
| Iron Will | Defeat boss "The Excuse Maker" | -50% debuff duration |
| Early Riser | Complete workout before 7 AM for 7 days | +5% morning XP |

### Title Regression
Some titles can be lost if conditions are no longer met.
- "The Consistent" lost if streak breaks
- "Alcohol Slayer" lost after 3 drinking days in a week

---

## Data Sources

The System receives data from:

1. **Apple HealthKit** (automatic)
   - Steps
   - Workouts
   - Sleep
   - Exercise minutes

2. **LogMeal AI** (photo-based)
   - Calories
   - Protein/carbs/fat
   - Food identification

3. **Manual Entry** (fallback)
   - Only when automatic sources unavailable
   - The System prefers verified data
