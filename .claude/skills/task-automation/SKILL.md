---
name: task-automation
description: "Execute development tasks from manifest, run parallel agents, verify builds, manage task pipeline. Use when user wants to run tasks, check task status, execute dev loop, or work through the backlog."
allowed-tools: Read, Edit, Bash, Glob, Grep, Task, TodoWrite
user-invocable: true
---

# Task Automation Skill

Automated task execution system for the Solo Leveling project. Manages a task manifest and executes tasks via parallel agents.

## When Claude Should Use This Skill

- User says "run tasks", "execute tasks", "dev loop", "work on backlog"
- User asks about task status or pipeline health
- User wants to run multiple tasks in parallel
- User mentions the manifest or available tasks

## Core Concepts

### Task Manifest
Located at `docs/planning/tasks/manifest.json`. Contains:
- Task definitions with ID, title, priority, complexity
- Status tracking (available, claimed, in_progress, completed)
- Dependencies between tasks
- Tags for categorization (backend, frontend, etc.)

### Task Lifecycle
```
available → claimed → in_progress → completed
                  ↓
              blocked/abandoned
```

### Conflict Detection
Tasks conflict if they:
1. Modify the same files (check task spec's "Files to Create/Modify")
2. Both have `backend` tag (may touch server/src/index.ts)
3. Both have `frontend` tag AND modify shared files (App.tsx, routes)

Safe parallel pairs: one backend + one frontend task.

## Workflows

### Single Task Execution
1. Read manifest, find highest priority available task
2. Claim task (update manifest status)
3. Read task file from `docs/planning/tasks/<file>`
4. Execute task (create/modify files per spec)
5. Run build verification (`npm run build`)
6. Update manifest to completed

### Parallel Execution (--parallel N)
1. Read manifest, find N non-conflicting available tasks
2. Pre-claim all tasks in manifest (prevents race conditions)
3. Spawn N background agents via Task tool
4. Each agent works independently on its task
5. Monitor agent outputs for completion
6. Verify all builds pass
7. Update manifest for completed tasks

### Pipeline Check
1. Read manifest
2. Count by status: available, completed, blocked
3. Check if ideation needed (available < threshold)
4. Report pipeline health

## Agent Output Format

All spawned agents MUST output this structured summary:

```
<!-- AGENT_SUMMARY_START -->
{
  "taskId": "<task-id>",
  "status": "completed|partial|failed|blocked",
  "filesCreated": ["<paths>"],
  "filesModified": ["<paths>"],
  "buildStatus": "passed|failed",
  "acceptanceCriteria": {"total": N, "met": N, "failed": N},
  "errors": [],
  "notes": "<summary>"
}
<!-- AGENT_SUMMARY_END -->
```

## Supporting Files

- [parallel-execution.md](parallel-execution.md) - Detailed parallel execution logic
- [manifest-schema.md](manifest-schema.md) - Task manifest structure
- [scripts/agent-status.sh](scripts/agent-status.sh) - Check running agent status

## Usage Examples

**Run single task:**
```
/dev-loop
```

**Run 2 tasks in parallel:**
```
/dev-loop --parallel 2
```

**Check status:**
```
/task-status
```

**Natural language (auto-detected):**
- "Let's knock out some tasks"
- "Run the dev loop"
- "What tasks are available?"
- "Execute P1 tasks in parallel"
