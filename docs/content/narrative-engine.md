# Narrative Engine Architecture

The Journey Fitness Quest System requires a **dynamic narrative engine** that delivers personalized, contextual storylines. The System needs to *know* the player and speak to their specific journey.

---

## Core Philosophy

The narrative should feel like the System is **observing you specifically**, not reading from a script. When you fail, it should reference *your pattern* of failing. When you succeed, it should acknowledge what *you specifically* overcame.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         NARRATIVE ENGINE                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐              │
│  │   Database   │    │   Narrative  │    │   Player     │              │
│  │   Content    │───▶│   Service    │◀───│   Context    │              │
│  │              │    │              │    │              │              │
│  │ • Templates  │    │ • Interpolate│    │ • Stats      │              │
│  │ • Fragments  │    │ • Get by key │    │ • History    │              │
│  │ • Categories │    │ • Fallbacks  │    │ • Patterns   │              │
│  └──────────────┘    └──────────────┘    └──────────────┘              │
│          │                   │                   │                      │
│          └───────────────────┼───────────────────┘                      │
│                              ▼                                          │
│                    ┌──────────────────┐                                 │
│                    │  Rendered        │                                 │
│                    │  Narrative       │                                 │
│                    │                  │                                 │
│                    │  Personalized,   │                                 │
│                    │  contextual,     │                                 │
│                    │  dynamic text    │                                 │
│                    └──────────────────┘                                 │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## The Two Layers

### Layer 1: Database Content (Templates & Fragments)

The `narrativeContents` table stores **raw narrative materials** — building blocks, not final text:

| Content Type | Purpose | Example |
|--------------|---------|---------|
| **Templates** | Structural frameworks with slots | "You have failed {{quest_type}} {{failure_count}} times." |
| **Fragments** | Reusable narrative pieces | Cold observations, philosophical statements |
| **Categories** | Groupings for content organization | ONBOARDING, DEBUFF, STREAK, LEVEL_UP |

**Schema:**
```typescript
narrativeContents = pgTable('narrativeContents', {
  id: uuid('id').primaryKey().defaultRandom(),
  key: varchar('key', { length: 100 }).notNull().unique(),
  category: narrativeCategory('category').notNull(),
  content: text('content').notNull(),
  interpolationKeys: text('interpolationKeys').array(),
  isActive: boolean('isActive').default(true),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
});
```

### Layer 2: Narrative Service (Dynamic Assembly)

The NarrativeService fetches and interpolates content:

```typescript
// server/src/services/narrative.ts
export async function getContent(key: string): Promise<string | null> {
  const [content] = await db
    .select()
    .from(narrativeContents)
    .where(and(eq(narrativeContents.key, key), eq(narrativeContents.isActive, true)))
    .limit(1);
  return content?.content ?? null;
}

export function interpolate(template: string, context: Record<string, any>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    return context[key]?.toString() ?? `{{${key}}}`;
  });
}

// Usage
const template = await getContent('debuff.applied');
const message = interpolate(template, {
  missed_count: 2,
  player_name: 'Hunter'
});
```

### Player Context (The Data)

```typescript
interface PlayerNarrativeContext {
  // Current State
  level: number;
  currentStreak: number;
  debuffActive: boolean;
  activeBossFight: BossAttempt | null;

  // Historical Patterns
  patterns: {
    failureDays: string[];           // ["Monday", "Friday"]
    failureQuests: string[];         // ["steps", "protein"]
    averageCompletionRate: number;
    streakHistory: number[];
  };

  // Recent Events
  recentEvents: {
    lastFailure: Date | null;
    lastPerfectDay: Date | null;
    lastLevelUp: Date | null;
  };
}
```

---

## Narrative Trigger Points

| Trigger | Context | Example Output |
|---------|---------|----------------|
| **Daily Login** | Time of day, streak status | "Day 14. The pattern holds." |
| **Quest Completion** | Which quest, streak impact | "10,247 steps recorded." |
| **Quest Failure** | Pattern match, streak impact | "Steps incomplete. Third Monday in sequence." |
| **Debuff Applied** | Missed quests, history | "Performance degradation noted." |
| **Level Up** | New level, next milestone | "Level 12 achieved." |
| **Streak Milestone** | Days reached, comparison | "30 days. Your longest was 12." |
| **Boss Encounter** | Boss context, phase | "The Inconsistent One recognizes you." |
| **Season Transition** | Recap, new intro | "Season 1 complete. 847 tasks recorded." |

---

## Example: Dynamic Daily Login

**Player Context:**
- Level 14, Current streak: 23 days
- Last failure: Monday (missed steps)
- Pattern: Fails steps on Mondays 60% of the time
- Today: Monday

**Database Content:**
- Template (`daily.header.pattern_warning`): `"Day {{streak}}. {{observation}} {{warning}}"`
- Fragment values interpolated from player context

**Rendered Output:**
```
Day 23. The pattern continues.
Mondays have historically been problematic for movement.
The System is observing.
```

---

## Voice Guidelines

### Do
- Short, declarative sentences
- Specific player data references
- Cold observation without judgment
- Philosophical undertones

### Don't
- Exclamation marks
- Encouragement or praise
- Generic statements
- Emotional appeals

### Examples

**Good**: "Steps incomplete. This is the third Monday in sequence."

**Bad**: "You missed your steps goal! Don't worry, you can do it tomorrow!"

---

## API Endpoints

```
GET /api/content/:key
  Returns interpolated content for a specific key
  Query params: context variables for interpolation

GET /api/content/category/:category
  Returns all active content in a category
```

---

## Content Categories

| Category | Purpose |
|----------|---------|
| `ONBOARDING` | First-time user experience |
| `SYSTEM_MESSAGE` | General system communications |
| `DAILY_QUEST` | Quest descriptions and headers |
| `DEBUFF` | Debuff-related messages |
| `STREAK` | Streak milestone messages |
| `LEVEL_UP` | Level progression messages |
| `BOSS` | Boss encounter narratives |
| `DUNGEON` | Dungeon content |
| `TITLE` | Title unlock messages |
| `SEASON` | Season intro/outro |
| `PHILOSOPHY` | Standalone philosophical fragments |

---

## Related Documentation

- [Content Requirements](./content-requirements.md) - Full inventory of needed content
