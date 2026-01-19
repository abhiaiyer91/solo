# G93: Origin Story Selection

## Overview

Allow players to optionally select their "origin motivation" during onboarding. This creates personal stakes that the System can reference at key narrative moments, making the experience feel personalized and emotionally resonant.

## Context

**Source:** Ideation loop --topic "Making this an addicting story"
**Design Doc:** `docs/content/addictive-narrative-design.md`
**Current State:** Onboarding exists but doesn't capture why the player is here

## The Psychology

The underdog origin is a core narrative hook (inspired by Solo Leveling). By having players articulate their "why," we:
1. Create personal investment from the first interaction
2. Give the System material to reference during hard moments
3. Transform abstract "fitness tracking" into a personal story

## Origin Options

| Origin ID | Display Name | Narrative Frame |
|-----------|--------------|-----------------|
| `health_concern` | "For Those Who Need Me" | Health scare, family responsibility |
| `self_improvement` | "Becoming" | Desire to be stronger version of self |
| `accountability` | "The Promise" | Tired of broken promises to self |
| `curiosity` | "The Question" | What am I actually capable of? |
| `skip` | (Skip) | No origin selected, neutral narrative |

## Acceptance Criteria

- [ ] Add `origin` field to player profile schema
- [ ] Create origin selection screen in onboarding flow
- [ ] Each origin has distinct narrative intro text
- [ ] Origin is stored and available to narrative service
- [ ] Player can change origin in profile settings
- [ ] Narrative templates can reference `{{origin_context}}`

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `server/src/db/schema/game.ts` | Modify | Add `origin` enum and field to players |
| `server/src/routes/player.ts` | Modify | Add endpoint to set/update origin |
| `web/src/pages/Onboarding.tsx` | Modify | Add origin selection step |
| `web/src/components/onboarding/OriginSelection.tsx` | Create | Origin selection component |
| `server/src/db/seed-narrative.ts` | Modify | Add origin-specific intro content |
| `server/src/services/narrative.ts` | Modify | Support origin context in interpolation |

## Narrative Content Needed

### Origin Intro Messages

```typescript
// origin.health_concern.intro
"You did not come here for vanity.
You came because something reminded you:
the body is not infinite.

The System acknowledges this weight.
It will not make it lighter.
But it will help you carry it further."

// origin.self_improvement.intro
"You suspect there is another version of you.
Stronger. More disciplined. More present.

The System does not know if that version exists.
But it can help you find out."

// origin.accountability.intro
"How many times have you promised yourself?
How many Mondays? How many 'starting tomorrow'?

The System does not judge the past.
The System only asks:
Will this time be different?"

// origin.curiosity.intro
"A question brought you here:
What am I actually capable of?

The System cannot answer this for you.
But it can help you collect the data."
```

### Origin Reference Templates (For Later Use)

```typescript
// streak.broken.origin.health_concern
"You stopped. The ones who need you noticed nothing.
But you noticed.
That is why you are reading this."

// boss.defeat.origin.accountability
"Another promise kept.
This one you can actually believe."
```

## Implementation Notes

1. **Origin is optional** — "Skip" should be clearly available without judgment
2. **Origin affects narrative, not mechanics** — No gameplay differences
3. **Origin can change** — Life circumstances change; allow updates
4. **Cache origin** — Include in player context for narrative service

## Definition of Done

- [ ] All acceptance criteria met
- [ ] No TypeScript errors
- [ ] Origin selection works in onboarding
- [ ] Origin appears in narrative interpolation context
- [ ] Existing tests pass
