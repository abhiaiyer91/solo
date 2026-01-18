# Task Status - View Task Manifest

Display the current status of all tasks in the manifest.

## Usage

```
/task-status [options]
```

**Options:**
- No args: Show summary
- `--all`: Show all tasks with details
- `--available`: Show only available tasks
- `--blocked`: Show blocked tasks with reasons

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

## Output Format

Use box-drawing characters for visual hierarchy:
- `✓` = completed
- `◉` = in progress
- `○` = available
- `◌` = blocked
- `✗` = failed
