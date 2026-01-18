# Task Loop - Automated Task Execution

Execute tasks from the manifest automatically, respecting dependencies and priorities.

## Usage

```
/task-loop [options]
```

**Options:**
- No args: Run next available P0 task
- `--all`: Run all available tasks sequentially
- `--task <id>`: Run specific task by ID
- `--dry-run`: Preview without executing

## Instructions

### Step 1: Load and Display Manifest

Read `docs/planning/tasks/manifest.json` and show current state:

```
TASK LOOP
═══════════════════════════════════════

Available Tasks:
  [P0] G1-dashboard-connection - Connect Dashboard to Backend APIs
  [P0] G10-api-client - Create Shared API Client (independent)

Blocked (waiting on dependencies):
  [P0] G2-quest-completion-ui - needs: G1-dashboard-connection
  [P1] G5-xp-timeline-ui - needs: G1-dashboard-connection
  [P1] G7-stats-page - needs: G1, G6

Completed: 0/10
```

### Step 2: Select Task

If `--task <id>` specified, select that task.
Otherwise, select the first available P0 task (or P1 if no P0 available).

**Available means:**
- `status` is `"available"`
- All `dependencies` have `status: "completed"`

### Step 3: Claim Task

Update manifest.json:
```json
{
  "status": "in_progress",
  "claimedBy": "task-loop",
  "claimedAt": "2026-01-18T..."
}
```

### Step 4: Execute Task

Read the task file (e.g., `docs/planning/tasks/G1-dashboard-connection.md`).

Use the Task tool to spawn a coding agent:

```
Task: {task.id} - {task.title}

{full contents of task markdown file}

IMPORTANT INSTRUCTIONS:
1. Implement everything in the "Implementation Guide" section
2. Create/modify only the files listed in "Files to Create/Modify"
3. Check off each item in "Acceptance Criteria" as you complete it
4. Follow existing code patterns in the codebase
5. Do NOT commit changes - just implement and report completion
```

### Step 5: Verify & Update

After agent completes:

1. Verify the acceptance criteria by checking the files were created/modified
2. Update manifest.json:
   ```json
   {
     "status": "completed",
     "completedAt": "2026-01-18T..."
   }
   ```

### Step 6: Report & Continue

Show completion status:

```
✓ G1-dashboard-connection COMPLETE
  Created: web/src/lib/api.ts
  Created: web/src/hooks/useQuests.ts
  Created: web/src/hooks/useLevelProgress.ts
  Modified: web/src/pages/Dashboard.tsx

Newly unblocked:
  • G2-quest-completion-ui
  • G5-xp-timeline-ui
```

If `--all` flag: continue to next available task.
Otherwise: stop and show what's available next.

### Error Handling

If task fails:
- Set `status` to `"blocked"`
- Add `"blockerNote"` with error details
- Show error to user
- Continue to next task if `--all`

## Quick Commands

```
/task-loop                    # Run next P0 task
/task-loop --dry-run          # Preview only
/task-loop --task G3-streak-system  # Run specific task
/task-loop --all              # Run all available tasks
```

## Manifest Location

`docs/planning/tasks/manifest.json`
