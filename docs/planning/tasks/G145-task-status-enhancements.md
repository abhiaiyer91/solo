# G145: Enhance /task-status with Velocity and Recommendations

## Overview
Add velocity tracking, trend analysis, and smart recommendations to the task-status command.

## Context
**Source:** Skills retrospective 2026-01-18
**Current State:** /task-status shows static view only
**Problem:** Hard to plan sprints or estimate remaining work

## Acceptance Criteria
- [ ] `/task-status --velocity` shows completion rate and trend
- [ ] `/task-status --next N` shows N recommended next tasks
- [ ] `/task-status --blockers` shows dependency chains
- [ ] Default view includes mini-velocity indicator
- [ ] Historical data used when available

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| .claude/commands/task-status.md | Modify | Add new modes |

## Implementation Notes

### Velocity View
```
/task-status --velocity

VELOCITY ANALYSIS
═══════════════════════════════════════

Completion Rate:
  Last 7 days: 12 tasks completed
  Daily average: 1.7 tasks/day
  Trend: ↑ improving (+23% vs prior week)

Time to Complete (by complexity):
  Low: ~25 min average
  Medium: ~45 min average
  High: ~2 hr average

At Current Pace:
  23 available tasks remaining
  Estimated completion: ~14 days

Busiest Days: Mon, Wed, Thu
Slowest Days: Sat, Sun
```

### Next Recommendations
```
/task-status --next 5

RECOMMENDED NEXT TASKS
═══════════════════════════════════════

Based on: priority, dependencies, recent context

1. [P0] G135-healthkit-dev-setup
   Rationale: Highest priority, no blockers, critical path

2. [P1] G141-github-actions-ci
   Rationale: Infrastructure, enables safer iteration

3. [P1] G138-boss-dialogue-complete
   Rationale: Content work, parallelizable with above

4. [P1] G142-sentry-integration
   Rationale: Observability, production readiness

5. [P2] G143-structured-logging
   Rationale: 263 console.log to migrate, debt reduction
```

### Blockers View
```
/task-status --blockers

DEPENDENCY CHAINS
═══════════════════════════════════════

Longest chain (4 deep):
G135 → G136 → G137 → (unblocked)

Blocking most tasks:
G55-mobile-app-foundation
└── Blocks: G135, G136, G137, G71, G72, G73

Circular dependencies: None found

Orphan tasks (no dependents):
G143, G144, G145 (safe to do anytime)
```

### Enhanced Default View
```
/task-status

TASK STATUS
═══════════════════════════════════════

Progress: 119/142 tasks (84%)
████████████████░░░░ 84%

Velocity: 1.7 tasks/day ↑

By Priority:
  P0: ██████████ 0/2 available
  P1: ████████░░ 9 available
  P2: ██████░░░░ 13 available

Available Now: 22 tasks
Top 3:
  • [P0] G135-healthkit-dev-setup
  • [P1] G141-github-actions-ci
  • [P1] G138-boss-dialogue-complete

Run /task-status --next 5 for recommendations
```

## Definition of Done
- [ ] --velocity mode shows completion metrics
- [ ] --next mode shows smart recommendations
- [ ] --blockers mode shows dependency analysis
- [ ] Default view includes velocity indicator
- [ ] All modes work with current manifest structure
