# G146: Add /ideation-loop --quick Mode

## Overview
Add a quick summary mode to ideation-loop that shows gap status without full analysis and file creation.

## Context
**Source:** Skills retrospective 2026-01-18
**Current State:** /ideation-loop always runs full analysis
**Problem:** Sometimes just want to check if ideation is needed

## Acceptance Criteria
- [ ] `/ideation-loop --quick` shows gap count and summary in <10 seconds
- [ ] `/ideation-loop --summary` shows recent ideation history
- [ ] Quick mode doesn't create any files
- [ ] Quick mode doesn't modify manifest
- [ ] Clear indication when full ideation recommended

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| .claude/commands/ideation-loop.md | Modify | Add quick/summary modes |

## Implementation Notes

### Quick Mode
```
/ideation-loop --quick

IDEATION CHECK
═══════════════════════════════════════

Task Pipeline:
  Total: 142 tasks
  Completed: 119 (84%)
  Available: 22
  In Progress: 1

Pipeline Status: ✓ HEALTHY
  Available tasks (22) > threshold (5)
  No immediate ideation needed

Quick Gap Scan:
  Docs without tasks: 3 files
  TODOs in code: 15 items
  Untested services: 20 files

Recommendation: Pipeline healthy, run full ideation after next sprint

Last full ideation: 2026-01-18 (today)
```

### Summary Mode
```
/ideation-loop --summary

IDEATION HISTORY
═══════════════════════════════════════

Recent Sessions:

2026-01-18 - Retrospective & Future Direction
  Source: --topic "reflection and retrospective..."
  Tasks created: 9
  Focus: Mobile-first, content, infrastructure

2026-01-18 - Infrastructure & Mobile
  Source: Full analysis
  Tasks created: 15
  Focus: Mobile parity, backend maintenance

2026-01-17 - Initial Decomposition
  Source: --from-spec docs/game-systems/*.md
  Tasks created: 50+
  Focus: Core game systems

Total ideation sessions: 8
Total tasks generated: 142
Active tasks remaining: 23
```

### When to Recommend Full Ideation
```
Recommendation: ⚠ RUN FULL IDEATION

Reasons:
- Available tasks (3) < threshold (5)
- 5 blocked tasks have unmet dependencies
- Last ideation was 7 days ago

Run: /ideation-loop
Or:  /ideation-loop --focus backend
```

## Definition of Done
- [ ] --quick runs in <10 seconds
- [ ] --quick creates no files
- [ ] --summary shows ideation history
- [ ] Clear recommendation when full ideation needed
- [ ] Documentation updated
