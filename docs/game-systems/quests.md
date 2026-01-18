# Quest System

Quests are the primary way players earn XP. They range from simple daily tasks to multi-week boss encounters.

---

## Quest Types

| Type | Duration | Description |
|------|----------|-------------|
| **DAILY** | 24 hours | Core habits that compound over time |
| **WEEKLY** | 7 days | Sustained effort challenges |
| **DUNGEON** | Variable | High-risk/high-reward time-limited challenges |
| **BOSS** | Weeks | Identity challenges defeated through sustained compliance |

---

## Core Daily Quests

Four required tasks that form the foundation:

| Quest | Requirement | Base XP | Stat |
|-------|-------------|---------|------|
| **Steps** | 10,000 steps | 25 | AGI |
| **Workout** | Complete any workout | 40 | STR |
| **Protein** | Hit protein target (150g) | 20 | VIT |
| **Sleep** | 7+ hours of sleep | 15 | VIT |

**Partial Rewards**:
- Steps: 5,000 steps = 10 XP

---

## Optional Dailies

Additional quests for extra progression:

- Alcohol-free day (15 XP, VIT)
- Meditation/mindfulness
- Hydration target
- Wake on time (15 XP, DISC)

---

## Weekly Quests

7-day challenges that encourage sustained effort:

| Quest | Requirement | Reward |
|-------|-------------|--------|
| Movement Week | Hit step goal 5/7 days | 75 XP |
| Perfect Movement | Hit step goal 7/7 days | 150 XP |
| Strength Consistency | 3 workouts minimum | 50 XP |
| Recovery Focus | Hit protein 5/7 days | 50 XP |

---

## Requirement DSL

Quest requirements are defined using a structured DSL:

```typescript
export type Requirement = NumericRequirement | BooleanRequirement | CompoundRequirement;

export interface NumericRequirement {
  type: 'numeric';
  metric: 'steps' | 'protein_grams' | 'sleep_hours' | 'workout_minutes';
  op: '>=' | '<=' | '>' | '<' | '==' | '!=';
  value: number;
}

export interface BooleanRequirement {
  type: 'boolean';
  metric: 'workout_completed' | 'alcohol_free' | 'wake_on_time';
  value: boolean;
}

export interface CompoundRequirement {
  type: 'compound';
  logic: 'AND' | 'OR';
  requirements: Requirement[];
}
```

---

## Example Requirements

**Daily Steps**:
```json
{
  "type": "numeric",
  "metric": "steps",
  "op": ">=",
  "value": 10000
}
```

**Strength Training**:
```json
{
  "type": "compound",
  "logic": "AND",
  "requirements": [
    { "type": "boolean", "metric": "workout_completed", "value": true },
    { "type": "numeric", "metric": "workout_minutes", "op": ">=", "value": 30 }
  ]
}
```

---

## Quest Auto-Completion

Quests are automatically evaluated based on health data from Apple HealthKit:

1. Health data syncs from Apple Watch
2. Quest requirements are evaluated against daily data
3. Completed quests trigger XP awards
4. Daily summary is compiled at end of day

See [HealthKit Integration](../mobile/healthkit.md) for data flow details.

---

## Quest Categories

| Category | Examples | Primary Stat |
|----------|----------|--------------|
| MOVEMENT | Steps, distance | AGI |
| STRENGTH | Workouts, lifting | STR |
| RECOVERY | Sleep, rest days | VIT |
| NUTRITION | Protein, hydration | VIT |
| DISCIPLINE | Wake time, streaks | DISC |
