# Task Claim - Manually Claim or Release Tasks

Claim a task for manual work, or release a stuck task.

## Usage

```
/task-claim <task-id>           # Claim a task
/task-claim --release <task-id> # Release a claimed task
/task-claim --complete <task-id> # Mark task as complete
/task-claim --reset <task-id>   # Reset task to available
```

## Instructions

### Claim Task

When claiming a task:

1. Read `docs/planning/tasks/manifest.json`
2. Find the task by ID
3. Verify it's `"available"` and dependencies are met
4. Update the task:
   ```json
   {
     "status": "claimed",
     "claimedBy": "manual",
     "claimedAt": "2026-01-18T..."
   }
   ```
5. Display the task file location:
   ```
   ✓ Claimed: G3-streak-system

   Task file: docs/planning/tasks/G3-streak-system.md

   When done, run: /task-claim --complete G3-streak-system
   ```

### Release Task

Reset a claimed/blocked task back to available:

1. Update status to `"available"`
2. Clear `claimedBy`, `claimedAt`, `blockerNote`

```
✓ Released: G3-streak-system
  Status: available
```

### Complete Task

Mark a task as done:

1. Verify the task exists and is claimed/in_progress
2. Update:
   ```json
   {
     "status": "completed",
     "completedAt": "2026-01-18T..."
   }
   ```
3. Show newly unblocked tasks:
   ```
   ✓ Completed: G1-dashboard-connection

   Newly available:
     • G2-quest-completion-ui
     • G5-xp-timeline-ui
   ```

### Reset Task

Force reset to available (use with caution):

```
⚠ Reset: G3-streak-system
  Previous status: blocked
  New status: available

  Note: Make sure any partial work is cleaned up.
```

## Error Cases

- Task not found: "Task 'xyz' not found in manifest"
- Task not available: "Task 'G2' is blocked by: G1-dashboard-connection"
- Already claimed: "Task 'G3' is already claimed by: other-agent"
