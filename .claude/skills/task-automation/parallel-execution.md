# Parallel Execution Logic

Detailed guide for running multiple tasks concurrently without conflicts.

## Conflict Detection Algorithm

```python
def can_run_parallel(task_a, task_b):
    # Rule 1: Check tag domains
    a_backend = "backend" in task_a.tags
    a_frontend = "frontend" in task_a.tags
    b_backend = "backend" in task_b.tags
    b_frontend = "frontend" in task_b.tags

    # Same domain = conflict
    if a_backend and b_backend:
        return False
    if a_frontend and b_frontend:
        # Exception: different frontend domains OK
        # e.g., "pages" vs "components" with no shared files
        pass

    # Rule 2: Check file overlap
    a_files = get_task_files(task_a)  # From task spec
    b_files = get_task_files(task_b)
    if set(a_files) & set(b_files):
        return False

    # Rule 3: Check shared entry points
    shared_files = [
        "server/src/index.ts",
        "web/src/App.tsx",
        "web/src/main.tsx"
    ]
    a_touches_shared = any(f in a_files for f in shared_files)
    b_touches_shared = any(f in b_files for f in shared_files)
    if a_touches_shared and b_touches_shared:
        return False

    return True
```

## Pre-Computed Safe Pairs

These task combinations are verified safe:

| Backend Task | Frontend Task | Reason |
|--------------|---------------|--------|
| G13 (Title System) | G7 (Stats Page) | No shared files |
| G17 (Health Sync) | G8 (Profile Page) | No shared files |
| G18 (Timezone) | G25 (Onboarding) | No shared files |
| G14 (Boss System) | G21 (Narrative UI) | No shared files |

## Execution Flow

```
1. ACQUIRE LOCK
   └─> npx ts-node scripts/manifest-lock.ts acquire dev-loop
   └─> Waits up to 10s if another agent holds lock

2. READ MANIFEST
   └─> Get all available tasks sorted by priority

3. SELECT BATCH
   └─> For each task, check conflicts with selected tasks
   └─> Stop when batch size = N or no more compatible tasks

4. PRE-CLAIM
   └─> Update manifest: status = "claimed", claimedBy = "agent-<domain>-<n>"
   └─> This prevents other processes from claiming same tasks

5. RELEASE LOCK
   └─> npx ts-node scripts/manifest-lock.ts release dev-loop
   └─> Other agents can now read manifest

6. SPAWN AGENTS
   └─> Use Task tool with run_in_background=true
   └─> Each agent gets:
       - Task ID and spec
       - Working directory (server/ or web/)
       - Build verification command
       - Structured output requirement

7. MONITOR
   └─> Check agent output files periodically
   └─> Look for AGENT_SUMMARY_START marker
   └─> Report progress to user

8. COLLECT RESULTS
   └─> Parse structured summaries
   └─> Verify builds passed

9. ACQUIRE LOCK (for update)
   └─> npx ts-node scripts/manifest-lock.ts acquire dev-loop

10. UPDATE MANIFEST
    └─> Update manifest: status = "completed"

11. RELEASE LOCK
    └─> npx ts-node scripts/manifest-lock.ts release dev-loop

12. REPORT
    └─> Show completed tasks, time, speedup
    └─> Show remaining available tasks
    └─> Ask to continue or stop
```

## Lock Timeout Handling

Locks automatically expire after 60 seconds. If an agent crashes or hangs:
- Next agent's acquire attempt will detect stale lock
- Stale lock is automatically overridden
- Warning is logged about the override

## Agent Spawn Template

```javascript
Task({
  description: `${taskId}: ${taskTitle}`,
  prompt: `
You are executing task ${taskId}: ${taskTitle}

**TASK SPEC:**
${taskSpec}

**WORKING DIRECTORY:** ${workingDir}

**CONSTRAINTS:**
- ONLY modify files in ${domain}/ directory
- Run \`npm run build\` to verify before finishing
- Update manifest status to "completed" when done

**REQUIRED OUTPUT:**
When complete, output this exact format:

<!-- AGENT_SUMMARY_START -->
{
  "taskId": "${taskId}",
  "status": "completed",
  "filesCreated": [...],
  "filesModified": [...],
  "buildStatus": "passed",
  "acceptanceCriteria": {"total": N, "met": N, "failed": 0},
  "errors": [],
  "notes": "Brief summary"
}
<!-- AGENT_SUMMARY_END -->
`,
  subagent_type: "general-purpose",
  run_in_background: true
})
```

## Error Handling

### Agent Fails Build
1. Parse error from agent output
2. Keep task as "claimed" (not completed)
3. Report failure to user
4. Option: retry with fix instructions

### Agent Times Out
1. Check last activity in output file
2. If stuck > 10 minutes, consider failed
3. Release claim on task

### Merge Conflicts (shouldn't happen with proper conflict detection)
1. Stop all agents
2. Show conflicting files
3. Manual resolution required
