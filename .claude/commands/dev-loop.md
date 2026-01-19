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
- `--debt-interval <n>`: Run debt sweep every n cycles (default: 5)
- `--debt-fix <level>`: Auto-fix debt at severity level or higher (critical, high, medium, low)
- `--no-debt-sweep`: Disable automatic debt sweeps

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

# Run debt sweep every 3 cycles, auto-fix high+ severity items
/dev-loop --continuous --debt-interval 3 --debt-fix high

# Disable debt sweeps for focused feature work
/dev-loop --continuous --no-debt-sweep
```

## What It Does

This command invokes the **task-automation** skill to:

1. **Check manifest** - Read `docs/planning/tasks/manifest.json`
2. **Select tasks** - Pick highest priority available task(s)
3. **Execute** - Spawn agent(s) to complete work
4. **Verify** - Run builds, check acceptance criteria
5. **Update** - Mark tasks completed in manifest
6. **Cleanup** - Auto-purge completed tasks from manifest (keeps it lean)
7. **Loop** - Continue or prompt based on options

### Automatic Manifest Cleanup

Completed tasks are automatically removed from the manifest after each cycle. This keeps the manifest focused on actionable work:
- **Before**: 95+ tasks accumulate over time, most completed
- **After**: Only available, in_progress, blocked tasks remain

Task spec files in `docs/planning/tasks/*.md` are preserved for historical reference.

## Parallel Mode

With `--parallel N`, the loop:
- Selects N non-conflicting tasks (backend + frontend safe pairs)
- Pre-claims all tasks in manifest
- Spawns background agents for each
- Monitors progress and collects results
- Verifies all builds pass

See `.claude/skills/task-automation/parallel-execution.md` for conflict detection logic.

## Debt Sweep Integration

The dev-loop automatically integrates with the debt-sweep system to maintain code quality during continuous development.

### How It Works

Every `--debt-interval` cycles (default: 5), the loop:

1. **Pauses task execution** after completing current cycle
2. **Runs debt sweep** to scan for new technical debt
3. **Prioritizes actionable items** based on severity and effort
4. **Optionally fixes debt** if `--debt-fix` is set
5. **Updates debt manifest** at `docs/planning/debt-manifest.json`
6. **Resumes task execution** with fresh codebase health

### Debt Fix Levels

When `--debt-fix <level>` is specified, the loop will automatically address debt items:

| Level | What Gets Fixed |
|-------|----------------|
| `critical` | Only critical security/breaking issues |
| `high` | Critical + high severity items |
| `medium` | Critical + high + medium severity items |
| `low` | All debt items (most aggressive) |

Only items with effort `trivial` or `low` are auto-fixed. Higher effort items are reported for manual resolution.

### Debt Sweep Cycle Flow

```
CYCLE 5 (or n): DEBT SWEEP
═══════════════════════════════════════

1. Scan codebase for new debt items
   ├── TODOs/FIXMEs added since last sweep
   ├── Files that grew > 500 lines
   ├── New 'any' types introduced
   ├── Test coverage gaps in modified files
   └── Dependency security updates

2. Update debt manifest
   ├── Add new items
   ├── Mark resolved items
   └── Update severity scores

3. Auto-fix eligible items (if --debt-fix set)
   ├── Fix critical security issues
   ├── Remove unused imports
   ├── Add missing types (trivial cases)
   └── Update outdated dependencies (low effort)

4. Report debt status
   ├── New items found: 3
   ├── Items auto-fixed: 2
   ├── Items needing attention: 8
   └── Overall debt trend: ↓ improving

5. Resume task loop
═══════════════════════════════════════
```

### Tracking State

The loop maintains a cycle counter in memory. The debt manifest tracks:

```json
{
  "lastSweep": "2026-01-18T10:30:00Z",
  "lastUpdate": "2026-01-18T10:30:00Z",
  "devLoopCycles": 15,
  "lastDebtCycle": 15,
  ...
}
```

### When to Adjust Intervals

| Scenario | Recommended Setting |
|----------|---------------------|
| Rapid feature development | `--debt-interval 3` |
| Bug fix sprint | `--debt-interval 10` or `--no-debt-sweep` |
| Refactoring phase | `--debt-interval 2 --debt-fix medium` |
| Pre-release stabilization | `--debt-interval 1 --debt-fix critical` |
| New codebase / greenfield | `--debt-interval 10` |

### Manual Debt Sweep

You can always trigger a debt sweep manually:

```bash
/debt-sweep                    # Full scan
/debt-sweep --focus backend    # Focus on backend
/debt-sweep --severity high    # Only high+ severity
```

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
