# Boss Fights

Bosses are **identity checkpoints** defeated through sustained compliance over weeks. They represent internal enemies that have stopped you before.

---

## Philosophy

Boss fights in Journey are not about strength - they're about **consistency over time**. Each boss represents a psychological pattern that has derailed your progress before.

---

## Boss Structure

Each boss has:
- **Name**: The internal enemy
- **Difficulty**: NORMAL / HARD / NIGHTMARE
- **Required Level**: Minimum level to challenge
- **Phases**: Multiple stages requiring sustained effort
- **XP Reward**: Significant XP upon defeat
- **Title Reward**: Optional title unlock

---

## The Three Bosses

### The Inconsistent One (NORMAL)
*Level 5 required | 21 days | 500 XP*

> Your pattern of starting and stopping. The cycle that defines failure.

**Intro Monologue**:
```
This opponent has defeated you before.
Not through strength — but through time.
It waits for enthusiasm to fade.
It knows you will negotiate.
```

**Phases**:
| Phase | Name | Duration | Requirement |
|-------|------|----------|-------------|
| 1 | Recognition | 7 days | 70% daily completion |
| 2 | Resistance | 7 days | 80% daily completion |
| 3 | Override | 7 days | 90% daily completion |

**Defeat Message**: "The pattern is broken. For now."

---

### The Excuse Maker (HARD)
*Level 10 required | 21 days | 1000 XP*

> The voice that provides reasons. Always reasonable. Always wrong.

**Intro Monologue**:
```
This enemy speaks with your voice.
It offers logic when logic serves weakness.
"Tomorrow" is its favorite word.
```

**Phases**:
| Phase | Name | Duration | Requirement |
|-------|------|----------|-------------|
| 1 | Awareness | 7 days | 3 perfect days |
| 2 | Confrontation | 7 days | 5 perfect days |
| 3 | Execution | 7 days | 7 perfect days |

**Defeat Message**: "Silence achieved. Temporarily."

---

### The Comfortable Self (NIGHTMARE)
*Level 20 required | 42 days | 2500 XP*

> The version of you that stopped. The one who decided "enough."

**Intro Monologue**:
```
This is not an enemy.
This is who you were becoming.
Comfortable. Settled. Done.
```

**Phases**:
| Phase | Name | Duration | Requirement |
|-------|------|----------|-------------|
| 1 | Discomfort | 14 days | 2 dungeon clears + 10-day streak |
| 2 | Sustained Effort | 14 days | 3 dungeon clears + 14-day streak |
| 3 | Transformation | 14 days | 10 perfect days + 14-day streak |

**Defeat Message**: "Comfort rejected. Growth chosen."

---

## Phase Transitions

**Phase 1 → 2 (Example)**:
```
PHASE 1 COMPLETE: Recognition

You have seen the pattern.
Seeing is not defeating.

Phase 2 begins: Resistance

The pattern will offer logic.
"One day off won't hurt."
"You've earned a break."

These are its weapons.
The System will observe if you fall.
```

---

## Failure Handling

If a player fails a phase:
```
PHASE FAILED

The pattern recognized your tactics.
It waited. You negotiated.

This is not punishment.
This is data.

Options:
• Restart current phase
• Abandon encounter (no penalty, boss remains)

The Inconsistent One is patient.
It will wait for your return.
```

---

## Boss Unlock

```
THREAT DETECTED

A pattern has been identified in your history.
It has a name.

THE INCONSISTENT ONE

[Boss description and intro]

Required Level: 5 ✓
Estimated Duration: 21 days
Reward: 500 XP + Title

                    [BEGIN ENCOUNTER]
                    [NOT YET]
```

---

## Implementation Notes

- Boss attempts are tracked in `bossAttempts` table
- Phase progress is stored as JSON
- Failed phases can be restarted without losing progress
- Only one boss can be in progress at a time
- Boss requirements evaluated by Mastra agent
