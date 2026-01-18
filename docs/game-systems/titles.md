# Titles & Passives

Titles are earned achievements that provide passive bonuses when equipped.

---

## Title Condition Types

| Type | Description | Example |
|------|-------------|---------|
| `STREAK_DAYS` | Consecutive days | 30-day streak = "Iron Will" |
| `CUMULATIVE_COUNT` | Total count | 100 workouts = "Centurion" |
| `TIME_WINDOW` | Within period | 7 alcohol-free days this week |
| `EVENT_COUNT` | Specific events | 10 boss defeats |
| `COMPOUND` | Multiple conditions | Streak + cumulative |
| `SPECIAL` | Custom logic | First of month completion |

---

## Passive Types

| Type | Effect | Example |
|------|--------|---------|
| `FLAT_XP_BONUS` | +N XP per activity | +3 XP |
| `PERCENT_XP_BONUS` | +N% XP multiplier | +5% XP |
| `STAT_BONUS` | +N to stat | +2 VIT |
| `DEBUFF_REDUCTION` | Reduce debuff penalty | -50% debuff duration |

---

## Title Rarity

| Rarity | Color | Difficulty |
|--------|-------|------------|
| COMMON | Gray | Easy to obtain |
| UNCOMMON | Green | Moderate effort |
| RARE | Blue | Significant achievement |
| EPIC | Purple | Major milestone |
| LEGENDARY | Gold | Exceptional dedication |

---

## Seed Titles

### The Beginner (COMMON)
- **Condition**: Account creation
- **Passive**: None
- **System Message**: "Initial classification assigned."

### The Consistent (UNCOMMON)
- **Condition**: 14-day streak
- **Passive**: +5% XP
- **System Message**: "Consistency detected. Classification updated."

### The Walker (UNCOMMON)
- **Condition**: 60 days steps goal
- **Passive**: +3 flat XP
- **System Message**: "Locomotion pattern normalized."

### Early Riser (UNCOMMON)
- **Condition**: 21 days wake on time
- **Passive**: +2 flat XP
- **System Message**: "Morning dominance established."

### Alcohol Slayer (RARE)
- **Condition**: 30 alcohol-free days
- **Passive**: +2 VIT
- **System Message**: "Substance independence confirmed."

### Iron Will (EPIC)
- **Condition**: 30-day streak
- **Passive**: -50% debuff penalty (5% instead of 10%)
- **System Message**: "Willpower coefficient exceeds baseline."

### Centurion (EPIC)
- **Condition**: 100 workout completions
- **Passive**: +5 STR
- **System Message**: "Century milestone achieved."

### Boss Slayer (LEGENDARY)
- **Condition**: 3 boss defeats
- **Passive**: +10% XP
- **System Message**: "Boss elimination confirmed."

---

## Title Regression

Some titles can be lost if conditions are no longer met:

| Title | Regression Condition |
|-------|---------------------|
| The Consistent | Streak breaks |
| Alcohol Slayer | 3 drinking days in a week |

---

## Title Assignment Narrative

```
TITLE ASSIGNED: {{titleName}}

{{description}}

The System has noted your classification.
```

---

## Implementation Notes

- Only one title can be active at a time
- Active title's passive effect applies to all XP gains
- Titles are stored in `userTitles` with earned/revoked timestamps
- Title conditions are evaluated by the title-evaluator Mastra agent
