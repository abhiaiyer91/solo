# G161: P0 Narrative Content Seeding

## Overview
Complete the critical-path narrative content that is documented but not seeded. The narrative engine exists, but the content database is only ~29% populated. This task fills the P0 gaps.

## Context
**Source:** Ideation loop - Narrative fulfillment analysis
**Related Docs:**
- `docs/content/content-requirements.md` (full inventory)
- `docs/content/narrative-engine.md` (architecture)
**Current State:** seed-narrative.ts has ~45 items, P0 docs specify ~80 items

## Content to Seed

### 1. Level Up Messages (10 items)

| Key | Trigger | Template |
|-----|---------|----------|
| `levelup.default` | Any level | Standard acknowledgment |
| `levelup.milestone.5` | Level 5 | Boss unlock note |
| `levelup.milestone.10` | Level 10 | Significant progress |
| `levelup.milestone.15` | Level 15 | Mid-journey reflection |
| `levelup.milestone.20` | Level 20 | Major milestone |
| `levelup.milestone.25` | Level 25 | Elite tier |
| `levelup.milestone.30` | Level 30 | Endgame begins |
| `levelup.stats` | Any level | Stat changes section |
| `levelup.first` | Level 2 | First level up special |
| `levelup.unlock` | Unlock levels | Feature unlock note |

**Example - levelup.default:**
```
LEVEL UP DETECTED

Level {{old_level}} → Level {{new_level}}

{{stat_changes}}

No celebration required.
The System does not applaud.
Progress is expected.
```

### 2. Extended Streak Milestones (3 items)

| Key | Trigger |
|-----|---------|
| `streak.milestone.60` | 60-day streak |
| `streak.milestone.90` | 90-day streak |
| `streak.milestone.365` | 365-day streak |

**Example - streak.milestone.90:**
```
90 CONSECUTIVE DAYS RECORDED

Elite threshold reached.
0.3% of users achieve this duration.

You are no longer experimenting.
You are no longer "trying."
This is who you are now.

The System acknowledges: Specimen classification upgraded.
```

### 3. Return Protocol Messages (4 items)

| Key | Trigger |
|-----|---------|
| `return.long` | 15-29 days absent |
| `return.very_long` | 30+ days absent |
| `return.protocol.offer` | 7+ day return |
| `return.protocol.accept` | Protocol begins |
| `return.protocol.complete` | Protocol finished |
| `return.protocol.decline` | Full intensity chosen |

**Example - return.protocol.offer:**
```
SYSTEM PROTOCOL DETECTED: RETURN

Connection dormant: {{days_absent}} days
Previous streak: {{previous_streak}} days

The System does not ask where you were.
The System does not ask why.

Two options exist:

[RETURN PROTOCOL]
3 days of reduced intensity.
A path back.

[FULL INTENSITY]
Resume as before.
As if nothing happened.

Choose.
```

### 4. Philosophy Fragments (10 items)

| Key | Theme |
|-----|-------|
| `philosophy.action` | Action over intention |
| `philosophy.consistency` | Compound effects |
| `philosophy.failure` | Failure as data |
| `philosophy.identity` | Becoming vs doing |
| `philosophy.time` | Time as asset |
| `philosophy.comfort` | Growth requires discomfort |
| `philosophy.progress` | Distance from origin |
| `philosophy.motivation` | Discipline vs motivation |
| `philosophy.endgame` | The lifelong question |
| `philosophy.observation` | Being watched |

**Example - philosophy.motivation:**
```
Motivation is a guest.
It arrives unannounced and leaves without warning.

Discipline is a resident.
It remains when motivation has gone home.

The System does not measure motivation.
Only action.
```

## Acceptance Criteria
- [ ] All Level Up messages seeded (10 items)
- [ ] Extended Streak Milestones seeded (3 items)
- [ ] Return Protocol messages seeded (6 items)
- [ ] Philosophy fragments seeded (10 items)
- [ ] All content passes voice checklist:
  - No exclamation marks
  - No encouragement
  - Short sentences
  - Data references where relevant
  - Ends with observation

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| server/src/db/seed-narrative.ts | Modify | Add ~29 new content items |

## Implementation Notes
- Add new arrays: `levelUpMessages`, `extendedStreakMilestones`, `returnProtocolMessages`, `philosophyFragments`
- Include all arrays in `allContent` at bottom of file
- Each item needs `key`, `category`, and `content`
- Categories: `LEVEL_UP`, `SYSTEM_MESSAGE`, `PHILOSOPHY`

## Definition of Done
- [ ] All acceptance criteria met
- [ ] Seed script runs without errors
- [ ] Content appears in database after seeding
- [ ] No TypeScript errors
