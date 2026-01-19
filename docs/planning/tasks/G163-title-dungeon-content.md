# G163: Title and Dungeon Narrative Content

## Overview
Seed narrative content for the title system (25+ items) and dungeon system (20+ items). Both systems are fully implemented backend, but players see generic or missing messages.

## Context
**Source:** Ideation loop - Narrative fulfillment analysis
**Related Docs:**
- `docs/content/content-requirements.md`
- `docs/game-systems/titles.md`
- `docs/game-systems/dungeons.md`
**Current State:** Systems work, content not seeded

## Title Content (25+ items)

### Title Categories

Each title needs 2-3 items:
- `title.{name}.desc` - What this title means
- `title.{name}.system` - System observation on earning
- `title.{name}.lost` - If title can regress (optional)

### Core Titles

| Title | Earned By |
|-------|-----------|
| The Beginner | Starting the journey |
| The Consistent | 7-day streak |
| The Walker | 100K total steps |
| Early Riser | 7 wake-time completions |
| Alcohol Slayer | 14 alcohol-free days |
| Iron Will | 30-day streak |
| Centurion | 100-day streak |
| Pattern Breaker | Defeat The Inconsistent One |
| The Returner | Return after 7+ day absence |
| Phoenix | Return after 30+ day absence |
| Boss Slayer | Defeat all 3 bosses |
| Dungeon Crawler | Complete 10 dungeons |
| Elite Hunter | Reach level 20 |

**Example - title.iron_will.system:**
```
TITLE ASSIGNED: Iron Will

Action occurs regardless of internal resistance.
Willpower coefficient exceeds baseline.

30 consecutive days.
Less than 5% of users reach this threshold.

Passive Effect: Debuff penalty reduced to 5%

This title can be lost.
The System will observe if it is.
```

**Example - title.iron_will.lost:**
```
TITLE REVOKED: Iron Will

Streak broken at {{streak_days}} days.
Iron Will requires active demonstration.

The title remains in your history.
It can be earned again.

Current title: {{current_title}}

The System does not forget what you were capable of.
```

## Dungeon Content (20+ items)

### Dungeon Ranks

| Rank | Dungeons | Difficulty |
|------|----------|------------|
| E-Rank | 3 | Entry level |
| D-Rank | 3 | Basic challenge |
| C-Rank | 3 | Moderate |
| B-Rank | 2 | Difficult |
| A-Rank | 2 | Very difficult |
| S-Rank | 2 | Elite only |

### Content Per Dungeon

Each dungeon needs:
- `dungeon.{rank}.{name}.entry` - Entry narrative
- `dungeon.{rank}.{name}.complete` - Victory
- `dungeon.{rank}.{name}.failed` - Failure
- `dungeon.{rank}.{name}.warning` - Time warning (optional)

### Example Dungeons

**E-Rank: The Morning Protocol**
```
E-RANK DUNGEON: The Morning Protocol

Complete your workout before 8:00 AM.

Duration: Until 8:00 AM
Reward: 1.5x workout XP

Entry is optional.
The early morning is difficult.
That is why this exists.

[ENTER]
[DECLINE]
```

**C-Rank: The Protein Forge**
```
C-RANK DUNGEON: The Protein Forge

Exceed protein target by 50% today.

Duration: Until midnight
Reward: 2x protein XP + Title progress

This dungeon tests nutritional discipline.
Exceeding minimums requires planning.
Planning requires intention.

Are you here to meet expectations?
Or exceed them?

[ENTER]
[DECLINE]
```

**S-Rank: The Perfect Week**
```
S-RANK DUNGEON: The Perfect Week

Complete ALL quests (core + rotating + bonus) for 7 consecutive days.

Duration: 7 days
Reward: 500 XP + Rare Title "The Complete"

This is the ultimate test.
No margin for error.
No partial credit.

Less than 0.1% of users complete S-Rank dungeons.

The System will be watching closely.

[ENTER]
[DECLINE]
```

## Acceptance Criteria
- [ ] All core titles seeded (13 titles × 2-3 items = ~30 items)
- [ ] All dungeon ranks seeded (15 dungeons × 3 items = ~45 items)
- [ ] Content follows voice guidelines
- [ ] Dungeons have clear entry/complete/fail messages
- [ ] Titles reference what they mean and how to lose them

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| server/src/db/seed-narrative.ts | Modify | Add title and dungeon arrays |

## Implementation Notes
- Title category: `TITLE`
- Dungeon category: `DUNGEON`
- Include interpolation keys for dynamic data
- Dungeon content should scale in intensity with rank

## Definition of Done
- [ ] All acceptance criteria met
- [ ] ~75 new content items in database
- [ ] Titles display correctly in UI
- [ ] Dungeon messages appear at correct triggers
- [ ] No TypeScript errors
