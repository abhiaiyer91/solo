# G138: Complete Boss Dialogue Trees

## Overview
Fill in the remaining boss dialogue content to ensure all 5 bosses have complete narrative trees for introduction, challenge, observation, and defeat phases.

## Context
**Source:** Retrospective analysis 2026-01-18, narrative content audit
**Current State:** ~50% of boss dialogue seeded, templates exist
**Rationale:** Bosses are the narrative hook - incomplete dialogue breaks immersion

## Acceptance Criteria
- [ ] All 5 bosses have complete dialogue trees (13 items each)
- [ ] Dialogue follows System voice guidelines (no encouragement, data-focused)
- [ ] Each boss references specific player patterns
- [ ] Defeat dialogue creates sense of accomplishment
- [ ] Shadow extraction narrative for each boss

## Content Requirements

### Per-Boss Dialogue Items (13 each)
| Phase | Items | Purpose |
|-------|-------|---------|
| Introduction | 3 | First encounter, boss reveals itself |
| Challenge | 4 | During battle, taunts and observations |
| Observation | 3 | System notes on player's approach |
| Defeat | 2 | Boss falls, lesson crystallized |
| Shadow Extract | 1 | Ability description post-defeat |

### Boss Roster
1. **The Inconsistent One** - Starting/stopping patterns
2. **The Excuse Maker** - External blame
3. **The Comfortable Self** - Fear of discomfort
4. **The Negotiator** - Compromising standards
5. **The Tomorrow** - Chronic procrastination

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| server/src/db/seed-boss-dialogue.ts | Modify | Add missing dialogue |
| docs/content/boss-dialogue-complete.md | Create | Full dialogue reference |

## Implementation Notes

### Voice Consistency Checklist
Every line must pass:
- [ ] No exclamation marks
- [ ] No direct encouragement
- [ ] Contains observation or pattern reference
- [ ] Ends with statement, not question (usually)
- [ ] Would feel appropriate after a week of failure
- [ ] Would feel appropriate after defeating the boss

### Example: The Negotiator (NEW)
```
INTRODUCTION_1:
"Ah, there you are. We've met before.
Remember when 8,000 steps became 'close enough' to 10,000?"

INTRODUCTION_2:
"I am every corner you've ever cut.
I am the voice that whispers: 'good enough.'"

INTRODUCTION_3:
"Let me tell you a truth: good enough never was."

CHALLENGE_1:
"You're almost there. Almost is my favorite word."

CHALLENGE_2:
"Three out of four quests? That's a passing grade.
Passing grades never changed anyone."

CHALLENGE_3:
"The gap between 90% and 100% is where I live."

CHALLENGE_4:
"You could stop now. You've done enough.
Haven't you heard that voice before?"

OBSERVATION_1:
"The System observes: partial completion is a pattern."

OBSERVATION_2:
"The data shows a preference for the easier path."

OBSERVATION_3:
"Consistency without completion is motion without progress."

DEFEAT_1:
"You completed what you started.
I have nothing left to offer you."

DEFEAT_2:
"The gap closes. I grow smaller.
But I do not disappear."

SHADOW_EXTRACT:
"The Negotiator becomes your ally.
You now recognize the voice of compromise.
Passive ability: When you're about to submit incomplete work,
the System will ask: 'Is this finished, or is this The Negotiator?'"
```

### Example: The Tomorrow (NEW)
```
INTRODUCTION_1:
"Don't worry about me. I'll still be here tomorrow.
And the day after."

INTRODUCTION_2:
"I have infinite patience.
Every time you've said 'I'll start fresh on Monday,' that was me."

INTRODUCTION_3:
"I am not your enemy. I am your favorite excuse."

CHALLENGE_1:
"You could do this tomorrow. Tomorrow is always cleaner."

CHALLENGE_2:
"Why now? The week is already ruined.
Monday makes more sense."

CHALLENGE_3:
"Just one more day of rest. You've earned it."

CHALLENGE_4:
"The future version of you will handle this.
They always do, right?"

OBSERVATION_1:
"The System notes: action deferred is progress denied."

OBSERVATION_2:
"Monday arrives. Then Monday becomes next Monday."

OBSERVATION_3:
"The gap between intention and action: that is where I live."

DEFEAT_1:
"You did it today.
Not tomorrow. Today.
I have lost my power over this moment."

DEFEAT_2:
"I wait for everyone.
But fewer wait for me after they've seen my face."

SHADOW_EXTRACT:
"The Tomorrow becomes your ally.
You recognize the seduction of delay.
Passive ability: When you postpone, the System will note:
'This was scheduled for today. The Tomorrow has been summoned.'"
```

## Definition of Done
- [ ] 65 dialogue items total (5 bosses × 13 items)
- [ ] All items seeded in database
- [ ] Voice consistency verified
- [ ] Reference doc created
- [ ] No placeholder text remaining
