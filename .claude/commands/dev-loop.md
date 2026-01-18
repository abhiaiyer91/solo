# Dev Loop

Run the development loop to execute tasks from the manifest.

## Usage

```
/dev-loop [options]
```

**Options:**
- No args: Execute one task, then prompt to continue
- `--continuous`: Keep running until all tasks complete
- `--parallel <n>`: Run n non-conflicting tasks concurrently
- `--cycles <n>`: Run n execution cycles then stop
- `--threshold <n>`: Ideate when available tasks < n (default: 2)

## Examples

```bash
# Run single task
/dev-loop

# Run 2 tasks in parallel
/dev-loop --parallel 2

# Continuous parallel execution
/dev-loop --parallel 2 --continuous

# Run 5 cycles then stop
/dev-loop --cycles 5
```

## What It Does

This command invokes the **task-automation** skill to:

1. **Check manifest** - Read `docs/planning/tasks/manifest.json`
2. **Select tasks** - Pick highest priority available task(s)
3. **Execute** - Spawn agent(s) to complete work
4. **Verify** - Run builds, check acceptance criteria
5. **Update** - Mark tasks completed in manifest
6. **Loop** - Continue or prompt based on options

## Parallel Mode

With `--parallel N`, the loop:
- Selects N non-conflicting tasks (backend + frontend safe pairs)
- Pre-claims all tasks in manifest
- Spawns background agents for each
- Monitors progress and collects results
- Verifies all builds pass

See `.claude/skills/task-automation/parallel-execution.md` for conflict detection logic.

## Agent Output

All task agents output structured summaries for status tracking:

```json
<!-- AGENT_SUMMARY_START -->
{
  "taskId": "G17-health-sync",
  "status": "completed",
  "filesCreated": [...],
  "filesModified": [...],
  "buildStatus": "passed",
  "notes": "Summary"
}
<!-- AGENT_SUMMARY_END -->
```

Check agent status with: `./scripts/agent-status.sh`

## Related

- `/task-status` - View manifest status without executing
- `/task-claim` - Manually claim/release tasks
- `/ideation-loop` - Generate new tasks from docs or a topic
- `/ideation-loop --topic <idea>` - Create planning docs and tasks from a new idea
