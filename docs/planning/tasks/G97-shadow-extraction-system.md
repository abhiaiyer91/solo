# G97: Shadow Extraction System

## Overview

After defeating a boss, players "extract" the defeated pattern as a Shadow — a permanent awareness/ability that helps them recognize when that pattern tries to return. This creates lasting mechanical and narrative benefit from boss victories.

## Context

**Source:** Ideation loop --topic "Making this an addicting story"
**Design Doc:** `docs/content/addictive-narrative-design.md`
**Current State:** Boss victories award XP and titles, but no persistent ability

## The Psychology

Inspired by Solo Leveling's shadow extraction:
- Defeating an enemy makes it serve you
- Past weaknesses become current strengths
- Creates tangible, ongoing benefit from boss fights

## Shadow Abilities

| Boss | Shadow | Ability |
|------|--------|---------|
| The Inconsistent One | Shadow of Consistency | "Pattern detected" warning when consecutive days missed |
| The Excuse Maker | Shadow of Honesty | Weekly honesty check: "Did external factors truly prevent you?" |
| The Comfortable Self | Shadow of Discomfort | Bonus XP when completing quests you previously failed |
| The Negotiator | Shadow of Precision | Visual indicator when hitting exact targets vs exceeding |
| The Tomorrow | Shadow of Now | Morning reminder: "The Tomorrow stirs. Act now." |

## Acceptance Criteria

- [ ] Create `playerShadows` table to track extracted shadows
- [ ] Each shadow has a unique passive ability
- [ ] Shadows are extracted automatically on boss defeat
- [ ] Shadow abilities trigger appropriately
- [ ] Shadow collection viewable in profile/titles page
- [ ] Narrative text for each shadow extraction

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `server/src/db/schema/game.ts` | Modify | Add `playerShadows` table |
| `server/src/services/shadow.ts` | Modify | Add extraction and ability logic |
| `server/src/services/boss.ts` | Modify | Trigger extraction on defeat |
| `server/src/db/seed-narrative.ts` | Modify | Add extraction narratives |
| `web/src/pages/Profile.tsx` | Modify | Show shadow collection |
| `web/src/components/ShadowCollection.tsx` | Create | Display extracted shadows |

## Database Schema

```typescript
playerShadows = pgTable('playerShadows', {
  id: uuid('id').primaryKey().defaultRandom(),
  playerId: uuid('playerId').references(() => users.id),
  shadowId: varchar('shadowId', { length: 50 }).notNull(), // e.g., 'inconsistent-one'
  bossId: varchar('bossId', { length: 50 }).notNull(),
  extractedAt: timestamp('extractedAt').notNull(),
  abilityTriggerCount: integer('abilityTriggerCount').default(0), // How many times ability activated
  isActive: boolean('isActive').default(true),
});
```

## Shadow Ability Implementation

### Shadow of Consistency (Inconsistent One)

```typescript
// Trigger: When player misses 2 consecutive days
async function checkConsistencyShadow(playerId: string): Promise<ShadowWarning | null> {
  const shadow = await getPlayerShadow(playerId, 'inconsistent-one');
  if (!shadow) return null;

  const consecutiveMissed = await getConsecutiveMissedDays(playerId);
  if (consecutiveMissed >= 2) {
    await incrementShadowTrigger(shadow.id);
    return {
      shadowId: 'inconsistent-one',
      message: "The Inconsistent One stirs. You recognize this feeling. Two days of silence. The pattern attempts to reform."
    };
  }
  return null;
}
```

### Shadow of Precision (The Negotiator)

```typescript
// UI indicator when quest is completed at exactly target vs exceeded
interface QuestCompletionUI {
  status: 'exact' | 'exceeded' | 'incomplete';
  shadowNote?: string; // If has Negotiator shadow and exact: "The Negotiator whispers: 'close enough.'"
}
```

### Shadow of Now (The Tomorrow)

```typescript
// Morning notification/reminder
async function getMorningReminder(playerId: string): Promise<string | null> {
  const shadow = await getPlayerShadow(playerId, 'the-tomorrow');
  if (!shadow) return null;

  const questsCompletedToday = await getQuestsCompletedToday(playerId);
  if (questsCompletedToday === 0 && isBeforeNoon()) {
    return "The Tomorrow stirs. It whispers 'later.' You know how this ends. Act now.";
  }
  return null;
}
```

## Narrative Content

### Extraction Messages

```typescript
// shadow.inconsistent_one.extract
"SHADOW EXTRACTION COMPLETE

The Inconsistent One now serves you.

What once controlled you has been subdued.
Its patterns are now visible to you.
When it stirs—and it will stir—
you will feel it before it takes hold.

SHADOW ABILITY ACQUIRED: Pattern Recognition
When you begin to slip into old patterns,
the Shadow will warn you."

// shadow.negotiator.extract
"SHADOW EXTRACTION COMPLETE

The Negotiator now serves you.

Every corner you cut, you will feel.
Every 'close enough' will taste different now.
The voice that lowered your ceiling
now helps you recognize when you're building one.

SHADOW ABILITY ACQUIRED: Precision Sense
You will know the difference between
hitting a target and exceeding it."

// shadow.tomorrow.extract
"SHADOW EXTRACTION COMPLETE

The Tomorrow now serves you.

The voice that promised 'later'
is now a warning signal.
When you hear it—and you will hear it—
you will recognize the lie.

SHADOW ABILITY ACQUIRED: Morning Awareness
The Shadow will remind you:
Tomorrow never comes. Only today."
```

### Shadow Collection UI

```
YOUR SHADOWS
══════════════════════════════════════

┌─────────────────────────────────────┐
│  THE INCONSISTENT ONE               │
│  ──────────────────                 │
│  Extracted: Day 42                  │
│  Times activated: 7                 │
│                                     │
│  "What once defeated you now warns  │
│   you. The pattern is familiar."    │
│                                     │
│  Ability: Pattern Recognition       │
│  Status: ACTIVE                     │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  THE NEGOTIATOR                     │
│  ──────────────────                 │
│  Extracted: Day 78                  │
│  Times activated: 12                │
│                                     │
│  "Close enough is never enough.     │
│   The shadow reminds you."          │
│                                     │
│  Ability: Precision Sense           │
│  Status: ACTIVE                     │
└─────────────────────────────────────┘
```

## Implementation Notes

1. **Passive abilities** — Shadows work automatically, no player action needed
2. **Trigger tracking** — Count how many times each ability activates (engagement metric)
3. **Non-punitive** — Shadows warn, they don't punish
4. **Narrative consistency** — Shadows are "servants" that help, not enemies
5. **Visual design** — Shadow collection should feel like achievements

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Shadows extracted on boss defeat
- [ ] Each shadow ability works correctly
- [ ] Shadow collection UI displays properly
- [ ] Trigger counts tracked
- [ ] No TypeScript errors
- [ ] Existing tests pass
