# G39: Implement Hard Mode Content

## Overview
Implement optional hard mode challenges for late-game players (Month 3+/Season 3) who have mastered the basics and want optimization-focused content.

## Context
**Source:** docs/overview/player-journey.md (Phase 7: Mastery)
**Related Docs:** docs/game-systems/dungeons.md, docs/game-systems/seasons.md
**Current State:** No hard mode content exists

## Acceptance Criteria
- [ ] Hard mode unlocks at Season 3 or Level 25
- [ ] Hard mode dungeons with stricter requirements
- [ ] Hard mode quest variants (tighter thresholds)
- [ ] Unique hard mode titles/achievements
- [ ] Visual indicator for hard mode content
- [ ] Hard mode XP multiplier (1.5x)

## Hard Mode Content Types

### Hard Mode Dungeons
- Stricter time limits
- No partial credit
- Requires perfect completion
- Higher XP rewards (1.5x base)

### Hard Mode Quests
- Reduced thresholds for partial (e.g., 8k steps for partial instead of 5k)
- Increased targets (e.g., 12k steps for full)
- Time-gated (must complete by specific time)

### Hard Mode Titles
| Title | Requirement |
|-------|-------------|
| The Perfectionist | 30-day perfect streak on hard mode |
| Iron Discipline | Clear 10 hard mode dungeons |
| The Relentless | 100 hard mode quests completed |

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| server/src/db/schema/game.ts | Modify | Add hardModeEnabled to users |
| server/src/services/dungeon.ts | Modify | Add hard mode dungeon variants |
| server/src/services/quest.ts | Modify | Add hard mode quest generation |
| server/src/routes/player.ts | Modify | Toggle hard mode endpoint |
| web/src/pages/Profile.tsx | Modify | Hard mode toggle switch |

## Implementation Notes
- Hard mode is opt-in toggle in profile
- Cannot disable mid-dungeon
- Hard mode stats tracked separately
- Narrative shift: System becomes "Witness" mode (observational, not challenging)
- Focus on optimization and personal records

## Definition of Done
- [ ] All acceptance criteria met
- [ ] No TypeScript errors
- [ ] Hard mode toggle works
- [ ] Hard mode content is challenging but fair
