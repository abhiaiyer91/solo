# Task Status - View Task Manifest

Display the current status of all tasks in the manifest, with velocity tracking and recommendations.

## Usage

```
/task-status [options]
```

**Options:**
- No args: Show summary with mini-velocity indicator
- `--all`: Show all tasks with details
- `--available`: Show only available tasks
- `--blocked`: Show blocked tasks with reasons
- `--velocity`: Show completion rate and trend analysis
- `--next N`: Show N recommended next tasks with rationale
- `--blockers`: Show dependency chains and blocking analysis

## Instructions

Read `docs/planning/tasks/manifest.json` and display:

### Summary View (default)

```
TASK STATUS
═══════════════════════════════════════

Progress: 2/10 tasks complete (20%)
███████░░░░░░░░░░░░░░░░░░░░░░░░░░ 20%

By Priority:
  P0: 1/2 complete
  P1: 1/4 complete
  P2: 0/4 complete

Available Now: 3 tasks
  • G3-streak-system (P1, backend)
  • G9-system-messages (P2, frontend)
  • G10-api-client (P2, frontend)

Next Recommended: G3-streak-system
  "Implement Streak Tracking System"
  Complexity: medium | Files: 4
```

### Detailed View (--all)

```
ALL TASKS
═══════════════════════════════════════

✓ G1-dashboard-connection [COMPLETED]
  Connect Dashboard to Backend APIs
  Completed: 2026-01-18T10:30:00Z

◉ G2-quest-completion-ui [IN_PROGRESS]
  Build Quest Completion UI
  Started: 2026-01-18T11:00:00Z
  Agent: task-loop

○ G3-streak-system [AVAILABLE]
  Implement Streak Tracking System
  Priority: P1 | Complexity: medium

◌ G5-xp-timeline-ui [BLOCKED]
  Build XP Timeline Component
  Waiting on: G1-dashboard-connection
```

### Dependency Graph

Show which tasks unblock others:

```
DEPENDENCY GRAPH
═══════════════════════════════════════

G1-dashboard-connection
├── G2-quest-completion-ui
├── G5-xp-timeline-ui
└── G7-stats-page

G6-layout-navigation
├── G7-stats-page
└── G8-profile-page

Independent (no blockers):
├── G3-streak-system
├── G4-database-migrations
├── G9-system-messages
└── G10-api-client
```

### Velocity View (--velocity)

Calculate velocity from `completedAt` timestamps in manifest:

```
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

**Calculation:**
- Count tasks completed in last 7 days (by `completedAt`)
- Compare to prior 7 days for trend
- Group by complexity and calculate averages
- Project remaining time based on available count and daily rate

### Next Recommendations (--next N)

```
RECOMMENDED NEXT TASKS
═══════════════════════════════════════

Based on: priority, dependencies, recent context

1. [P0] G56-healthkit-integration
   Rationale: Highest priority, no blockers, critical path

2. [P1] G58-nutrition-backend
   Rationale: Backend work, parallelizable with frontend

3. [P1] G50-enhanced-onboarding-ui
   Rationale: Frontend work, dependencies met

4. [P1] G52-realistic-stat-calculation
   Rationale: Backend service, low risk

5. [P2] G120-workout-library
   Rationale: Content work, parallelizable
```

**Ranking Algorithm:**
1. Filter to available tasks only
2. Sort by priority (P0 > P1 > P2 > P3)
3. Prefer tasks with no/fewer dependencies
4. Alternate backend/frontend for parallel potential
5. Consider complexity (prefer completing quick wins)

### Blockers View (--blockers)

```
DEPENDENCY CHAINS
═══════════════════════════════════════

Longest chain (4 deep):
G55 → G56 → G57 → (unblocked)

Blocking most tasks:
G55-mobile-app-foundation
└── Blocks: G56, G57, G71, G72, G73 (5 tasks)

G48-baseline-assessment
└── Blocks: G50, G51, G52, G53, G54 (5 tasks)

Circular dependencies: None found

Orphan tasks (no dependents):
G123, G127, G144, G145 (safe to do anytime)
```

**Analysis:**
- Build dependency graph from manifest `dependencies` arrays
- Find longest chain (critical path)
- Find tasks blocking most others
- Detect any circular dependencies
- List tasks with no dependents (lowest risk)

### Enhanced Default View

Add velocity indicator to default summary:

```
TASK STATUS
═══════════════════════════════════════

Progress: 119/142 tasks (84%)
████████████████░░░░ 84%

Velocity: 1.7 tasks/day ↑

By Priority:
  P0: ██████████ 2/2 complete
  P1: ████████░░ 9 available
  P2: ██████░░░░ 13 available

Available Now: 22 tasks
Top 3:
  • [P0] G56-healthkit-integration
  • [P1] G58-nutrition-backend
  • [P1] G50-enhanced-onboarding-ui

Run /task-status --next 5 for recommendations
```

## Output Format

Use box-drawing characters for visual hierarchy:
- `✓` = completed
- `◉` = in progress
- `○` = available
- `◌` = blocked
- `✗` = failed
- `↑` = improving trend
- `↓` = declining trend
- `→` = stable
