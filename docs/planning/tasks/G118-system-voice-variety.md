# G118: System Voice Variety Engine

## Overview
Add variety to System messages by varying tone based on context and player state.

## Acceptance Criteria
- [ ] Define voice modes (cold, encouraging, cryptic)
- [ ] Select voice based on context
- [ ] Vary messages within same category
- [ ] Track which messages player has seen
- [ ] Avoid repetition

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| `server/src/services/voice.ts` | Create | Voice selection logic |
| `server/src/db/seed-narrative.ts` | Modify | Add voice variants |
| `server/src/services/narrative.ts` | Modify | Use voice engine |

## Definition of Done
- [ ] Messages vary
- [ ] Context-appropriate tone
- [ ] No TypeScript errors
