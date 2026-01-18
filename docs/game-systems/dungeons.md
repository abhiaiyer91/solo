# Dungeons

Dungeons are optional, time-limited challenges with high risk and high reward. They exist to test what happens when you ask more of yourself than required.

---

## Philosophy

```
UNSTABLE ZONE DETECTED

Entry is optional.
Survival is likely.
Growth is not guaranteed.

Dungeons exist for one reason:
To see what happens when you ask more of yourself than required.

Failure here is not weakness.
It is ambition without preparation.
```

---

## Dungeon Ranks

| Rank | Level Required | XP Multiplier | Difficulty |
|------|----------------|---------------|------------|
| E-Rank | 3 | 1.5x | Entry level |
| D-Rank | 6 | 1.75x | Moderate |
| C-Rank | 10 | 2.0x | Challenging |
| B-Rank | 15 | 2.25x | Hard |
| A-Rank | 20 | 2.5x | Very Hard |
| S-Rank | 25+ | 3.0x | Extreme |

---

## Example E-Rank Dungeons

### The Morning Protocol
- **Challenge**: Complete workout before 8 AM
- **Duration**: 60 minutes
- **XP Multiplier**: 1.5x

### Step Surge
- **Challenge**: Hit 15,000 steps (vs normal 10,000)
- **Duration**: 24 hours
- **XP Multiplier**: 1.5x

### Clean Fuel
- **Challenge**: No processed food, hit protein target
- **Duration**: 24 hours
- **XP Multiplier**: 1.5x

---

## Dungeon Mechanics

### Time Limit
Each dungeon has a fixed duration (minutes or hours). Complete the challenge before time expires.

### Cooldown
After attempting a dungeon (success or failure), there's a cooldown period (default: 24 hours) before you can attempt it again.

### Debuff Interaction
- Dungeon bonuses are **disabled** while debuff is active
- You can still enter dungeons, but won't get the XP multiplier

---

## Dungeon States

| Status | Description |
|--------|-------------|
| `IN_PROGRESS` | Currently attempting |
| `CLEARED` | Successfully completed |
| `FAILED` | Did not meet requirements |
| `TIMED_OUT` | Time expired |

---

## Entry Narrative

```
DUNGEON ENTRY: [NAME]

Rank: E-Rank
Time Limit: 24 hours
XP Multiplier: 1.5x

Challenge: [Description]

Entry is optional.
The clock begins when you accept.

                    [ENTER]
                    [NOT NOW]
```

---

## Completion Narrative

### Success
```
DUNGEON CLEARED

[Dungeon Name] - Complete

Time elapsed: 18:43:22
Challenge met.

XP Awarded: 37 (25 × 1.5)

The System records your ambition.
```

### Failure
```
DUNGEON FAILED

[Dungeon Name] - Incomplete

Time expired.
Requirements not met.

No XP awarded.
No judgment offered.

The dungeon remains.
```

---

## Dungeon Design Principles

1. **Time-boxed**: Clear start and end
2. **Elevated difficulty**: 20-50% harder than daily quests
3. **Optional**: Never required for progression
4. **Varied challenges**: Different focuses (cardio, strength, discipline)
5. **Stackable with dailies**: Dungeon XP is separate from daily XP

---

## Season Integration

- Some dungeons are season-specific
- Higher-rank dungeons unlock in later seasons
- S-Rank dungeons only available in Season 3 (Monarch)

---

## Database Structure

```typescript
dungeons = {
  id: string,
  name: string,
  description: string,
  difficulty: 'E_RANK' | 'D_RANK' | 'C_RANK' | 'B_RANK' | 'A_RANK' | 'S_RANK',
  requirements: JSON,       // Entry requirements
  challenges: JSON,         // Challenge configuration
  xpMultiplier: number,     // 1.5 - 3.0
  durationMinutes: number,
  cooldownHours: number,
  seasonId: string | null,
}
```
