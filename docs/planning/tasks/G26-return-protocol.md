# G26: Implement Return Protocol

## Overview
Create the Return Protocol for lapsed players - a gentler re-entry path after extended absence.

## Context
**Source:** docs/game-systems/failure-recovery.md (Return Protocol section)
**Related Docs:** docs/content/content-requirements.md (failure/return content)
**Current State:** No special handling for returning players

## Acceptance Criteria
- [ ] Detect player absence (7+ days since last activity)
- [ ] Calculate absence duration and context
- [ ] Offer Return Protocol on first login after lapse
- [ ] Return Protocol: 3 days of reduced requirements
- [ ] Day 1: Only 1 core quest required
- [ ] Day 2: 2 core quests required
- [ ] Day 3: 3 core quests (normal)
- [ ] Track protocol progress
- [ ] Option to decline (full intensity immediately)
- [ ] System narratives for return scenarios

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| server/src/db/schema/game.ts | Modify | Add returnProtocol tracking fields |
| server/src/services/return-protocol.ts | Create | Return detection and protocol logic |
| server/src/services/quest.ts | Modify | Adjust requirements during protocol |
| web/src/components/ReturnProtocolModal.tsx | Create | Protocol offer modal |
| server/src/index.ts | Modify | Add protocol status endpoint |

## Implementation Notes
From failure-recovery.md:

**Absence Detection:**
- 7-14 days: Short return
- 15-29 days: Medium return
- 30+ days: Long return (offer full protocol)

**Return Protocol Phases:**
```
Day 1 - THE SYSTEM ACKNOWLEDGES YOUR RETURN

  Last recorded activity: 23 days ago.
  Streak at departure: 14 days.
  Current streak: 0.

  The System does not judge absence.
  It records presence.

  Today, only movement is required.
  Complete one quest to reactivate tracking.
```

## Definition of Done
- [ ] All acceptance criteria met
- [ ] No TypeScript errors
- [ ] Lapsed players offered Return Protocol
- [ ] Quest requirements reduced during protocol
- [ ] Protocol completion resets normal tracking
