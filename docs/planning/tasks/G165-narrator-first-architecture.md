# G165: Balanced Narrative Architecture

## Overview
Implement a hybrid narrative system that uses templates for high-frequency/reliable interactions and AI narrator for personalized/dynamic moments. Both have their place.

## Context
**Source:** Ideation loop - Narrative fulfillment analysis (revised)
**Current State:**
- Narrator agent exists with player context + template tools
- `generateNarrative()` checks AI availability, falls back to templates
- Templates work well for many interactions
- AI narrator underutilized for moments that benefit from personalization

## The Strategy: Templates + AI, Each Where They Shine

### Use Templates For (Fast, Reliable, Free)

| Interaction | Reason |
|-------------|--------|
| Quest completion ticker | High frequency, simple data |
| XP award notifications | Formulaic display |
| Daily quest headers | Predictable variants |
| Error states | Must always work |
| Onboarding flow | Curated critical path |
| Boss intro monologues | Lore shouldn't be improvised |
| Title/dungeon descriptions | System definitions |

### Use AI Narrator For (Dynamic, Personal)

| Interaction | Reason |
|-------------|--------|
| Daily login greeting | References patterns, recent activity |
| Streak milestone (7, 14, 30+) | Personalized journey reflection |
| Return after absence | Knows duration, previous state |
| System observations | Pattern analysis |
| Level-up reflection | What they accomplished |
| Weekly summary narrative | Recap of the week |
| Boss defeat personalization | Add context to template victory |

## Implementation Plan

### 1. Define Narrative Tiers

Create a clear API for both approaches:

```typescript
// Tier 1: Template (fast, reliable)
const message = await getTemplateNarrative('quest.complete.default', {
  xp_amount: 50,
  quest_name: 'Daily Steps'
})

// Tier 2: AI-Enhanced (personalized moments)
const greeting = await getAINarrative({
  userId,
  type: 'daily_greeting',
  fallbackKey: 'daily.greeting.default'
})
```

### 2. Add System Arc to Player Context

Update `playerContext.ts` to include journey phase:

```typescript
// Add to PlayerContext interface
daysSinceStart: number
systemPhase: 'observer' | 'challenger' | 'recognition' | 'witness'

// Add to fetchPlayerContext function
const daysSinceStart = calculateDaysSinceStart(user.createdAt)
const systemPhase = getSystemPhase(daysSinceStart)

function getSystemPhase(days: number): SystemPhase {
  if (days < 15) return 'observer'
  if (days < 31) return 'challenger'
  if (days < 61) return 'recognition'
  return 'witness'
}
```

### 3. Update Narrator Agent Instructions

Add phase-aware instructions to `narrator.ts`:

```typescript
const SYSTEM_VOICE_INSTRUCTIONS = `
...existing instructions...

SYSTEM PHASE AWARENESS:
Your voice evolves based on the player's journey duration.

- OBSERVER (Days 1-14): Clinical, cold, assessing. "The System is collecting data."
- CHALLENGER (Days 15-30): Probing, questioning. "The easy part is over."
- RECOGNITION (Days 31-60): Grudging acknowledgment. "Initial assessment was incorrect."
- WITNESS (Days 60+): Philosophical, knowing. "You are no longer who arrived here."

Reference the player's systemPhase from context and adjust your tone accordingly.
`
```

### 4. Create Narrator-First Hooks (Frontend)

Replace direct template usage with AI-first hooks:

```typescript
// web/src/hooks/useNarrative.ts
export function useNarrative(
  category: NarrativeCategory,
  event: string,
  data?: Record<string, unknown>
) {
  return useQuery({
    queryKey: ['narrative', category, event, data],
    queryFn: () => fetch('/api/narrative/generate', {
      method: 'POST',
      body: JSON.stringify({ category, event, data })
    }).then(r => r.json())
  })
}

// Usage
const { data: greeting } = useNarrative('DAILY_QUEST', 'daily_start')
```

### 5. Add Narrative Generation Endpoint

```typescript
// server/src/routes/narrative.ts
router.post('/generate', authenticated, async (req, res) => {
  const { category, event, data } = req.body
  const userId = req.user.id

  const result = await generateNarrative({
    userId,
    category,
    context: { event, data },
    fallbackKey: `${category.toLowerCase()}.${event}.default`
  })

  res.json(result)
})
```

### 6. Seed Essential Fallback Templates Only

Instead of seeding 200+ templates, seed only:
- **Critical path content** (onboarding, errors)
- **Voice reference examples** (2-3 per category for AI to learn from)
- **Boss lore foundations** (intro monologues that AI shouldn't freestyle)

## Acceptance Criteria

- [ ] Player context includes `daysSinceStart` and `systemPhase`
- [ ] Narrator agent instructions include phase awareness
- [ ] `/api/narrative/generate` endpoint exists for AI interactions
- [ ] `useNarrative` hook created for frontend (supports both tiers)
- [ ] Daily login greeting uses AI narrator
- [ ] Quest completion continues using templates (fast, reliable)
- [ ] Streak milestones use AI narrator
- [ ] Return-after-absence uses AI narrator
- [ ] Clear documentation of which interactions use which tier
- [ ] Console logs indicate when AI vs template is used

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| server/src/mastra/tools/playerContext.ts | Modify | Add daysSinceStart, systemPhase |
| server/src/mastra/agents/narrator.ts | Modify | Add phase-aware instructions |
| server/src/routes/narrative.ts | Create | New API endpoint |
| web/src/hooks/useNarrative.ts | Create | AI-first narrative hook |
| web/src/hooks/useDailyGreeting.ts | Modify | Use AI narrator |

## Definition of Done

- [ ] All acceptance criteria met
- [ ] AI generates narrative for daily greeting when ANTHROPIC_API_KEY set
- [ ] System voice varies based on player's journey phase
- [ ] Graceful fallback to templates when AI unavailable
- [ ] No TypeScript errors
- [ ] Existing tests pass

## Notes

**Cost & Performance:**
- Templates: Free, instant, reliable
- AI: ~$0.001-0.01 per call, 1-3 seconds, may fail
- Cache AI responses for 1 hour where appropriate
- Rate limit AI calls to ~10/user/day for non-cached

**The Balance:**
Templates provide the foundation - consistent, fast, always works. AI adds the magic for key moments - personalized greetings, milestone reflections, pattern observations. Together, they create a System that feels both reliable and intelligent.

**Rule of Thumb:**
- If it happens 10+ times/day → Template
- If it's a milestone moment → AI
- If it must never fail → Template with AI enhancement optional
