# XP & Leveling System

The XP system is the core progression mechanic. All XP events are immutable and append-only.

---

## Level Curve

```typescript
// server/src/services/xp/level-curve.ts

export function computeLevelThreshold(level: number): number {
  if (level <= 1) return 0;
  return Math.floor(50 * Math.pow(level, 2) * 1.15) + (level * 25);
}

export function computeLevel(totalXP: number): number {
  let level = 1;
  while (computeLevelThreshold(level + 1) <= totalXP) {
    level++;
  }
  return level;
}

export function xpToNextLevel(totalXP: number): { current: number; required: number; progress: number } {
  const level = computeLevel(totalXP);
  const currentThreshold = computeLevelThreshold(level);
  const nextThreshold = computeLevelThreshold(level + 1);
  const xpIntoLevel = totalXP - currentThreshold;
  const xpRequired = nextThreshold - currentThreshold;

  return {
    current: xpIntoLevel,
    required: xpRequired,
    progress: Math.round((xpIntoLevel / xpRequired) * 100),
  };
}
```

---

## Level Thresholds

| Level | XP to Reach | XP for Level |
|-------|-------------|--------------|
| 1 | 0 | - |
| 2 | 140 | 140 |
| 3 | 305 | 165 |
| 4 | 495 | 190 |
| 5 | 712 | 217 |
| 10 | 2,538 | 469 |
| 15 | 6,063 | 778 |
| 20 | 11,558 | 1,137 |
| 25 | 19,309 | 1,550 |
| 30 | 29,620 | 2,020 |

---

## XP Awards

| Activity | Base XP | Stat |
|----------|---------|------|
| Wake on time | 15 | DISC |
| Steps goal (10k) | 25 | AGI |
| Steps partial (5k) | 10 | AGI |
| Workout completed | 40 | STR |
| Protein target | 20 | VIT |
| Alcohol-free day | 15 | VIT |
| Weekly completion (5/7) | 75 | - |
| Weekly perfect (7/7) | 150 | - |
| Boss phase complete | 100-500 | - |
| Dungeon clear | 50-200 | - |

---

## XP Modifiers

Modifiers are applied in order: **bonuses first, then penalties**.

| Modifier | Multiplier | Condition |
|----------|------------|-----------|
| Debuff penalty | 0.90x | Debuff active |
| 7-day streak | 1.10x | 7+ consecutive days |
| 14-day streak | 1.15x | 14+ consecutive days |
| 30-day streak | 1.25x | 30+ consecutive days |
| Weekend bonus | 1.10x | Saturday/Sunday completion |
| Season multiplier | varies | Season config |

---

## XP Event Structure

Every XP event is recorded immutably:

```typescript
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

---

## Immutability Guarantee

- XP is **never deleted or modified**
- Every event includes a SHA256 hash for verification
- Ledger can be audited at any time
- Total XP is always the sum of all finalXP values
