# G24: Implement Shadows System

## Overview
Create anonymous comparison "shadows" that show player data about similar players without requiring social connections.

## Context
**Source:** docs/game-systems/social.md (Shadows section)
**Related Docs:** MASTER_SPEC.md (Social features)
**Current State:** No shadow comparison functionality exists

## Acceptance Criteria
- [ ] Shadow generation logic (find similar players by level/streak)
- [ ] GET /api/shadows/today endpoint (daily shadow observation)
- [ ] Shadow types: Level Shadow, Streak Shadow, Time Shadow, Title Shadow
- [ ] Never reveal actual player identity
- [ ] Aggregate statistics only (no personal data)
- [ ] Shadow narratives in System voice
- [ ] Frontend component to display shadow observations

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| server/src/services/shadow.ts | Create | Shadow comparison logic |
| server/src/index.ts | Modify | Add shadow endpoints |
| web/src/components/ShadowObservation.tsx | Create | Shadow display component |
| web/src/pages/Dashboard.tsx | Modify | Add shadow section |

## Implementation Notes
From social.md:
```
SHADOW DETECTED

A player at Level 12 completed their workout at 5:47 AM today.
Their streak: 34 days.

You are Level 11.
Your last workout: 7:23 AM.
Your streak: 12 days.

The System presents data.
Interpretation is yours.
```

Shadow queries should:
- Find players at similar level (±2)
- Compare streak lengths
- Show aggregate completion stats
- Never reveal usernames or IDs

## Definition of Done
- [ ] All acceptance criteria met
- [ ] No TypeScript errors
- [ ] Shadow observations appear on dashboard
- [ ] Privacy preserved (no identifiable info leaked)
