# Task Verify - Verify Task Completion

Verify that completed tasks meet all requirements by checking files, builds, and acceptance criteria.

## Usage

```
/task-verify <task-id>    # Verify specific task
/task-verify --last       # Verify most recently completed task
/task-verify --all        # Verify all tasks completed in last 24h
```

## Instructions

### 1. Identify Task(s) to Verify

**For specific task:**
- Read `docs/planning/tasks/manifest.json`
- Find task by ID
- Get task file path from manifest

**For --last:**
- Find task with most recent `completedAt` timestamp

**For --all:**
- Find all tasks where `completedAt` is within last 24 hours

### 2. Read Task Specification

For each task to verify, read `docs/planning/tasks/<task-file>` to get:
- Acceptance criteria (the checkboxes)
- Files to Create/Modify table
- Definition of Done items

### 3. Run Verification Checks

Use the verifier agent (Task tool with subagent_type="verifier") with prompt:

```
Verify task: <task-id>

Task Title: <title>

Acceptance Criteria:
<list from task file>

Expected Files:
<files from task table>

Please verify:
1. All expected files exist
2. Build passes (npm run build in server and/or web as appropriate)
3. Acceptance criteria are met (check code for evidence)

Return structured verification result.
```

### 4. Output Format

```
TASK VERIFICATION
═══════════════════════════════════════

✓ G132-mobile-titles VERIFIED
  Files: 4/4 exist
  Build: passed
  Tests: n/a
  Criteria: 7/7 checkable

─────────────────────────────────────

✗ G136-health-sync-testing FAILED
  Files: 3/4 exist
  ├── ✓ mobile/src/hooks/useHealthSync.ts
  ├── ✓ mobile/src/components/HealthSummary.tsx
  ├── ✓ mobile/src/stores/health.ts
  └── ✗ MISSING: scripts/verify-health-sync.ts
  Build: passed
  Criteria: 5/8 verifiable

  Issues:
  • Missing file: scripts/verify-health-sync.ts
  • Criterion 4 "Background sync every 15 min" - not verifiable via code

─────────────────────────────────────

SUMMARY
  Verified: 1
  Failed: 1
  Manual Review: 0

Action Required:
  • G136: Create missing file or update task spec
```

### Verification Criteria

**Files Check:**
- All files in "Files to Create" exist
- All files in "Files to Modify" have been modified (check git diff if available)

**Build Check:**
- `cd server && npm run build` passes (for backend tasks)
- `cd web && npm run build` passes (for frontend tasks)
- `cd mobile && npx tsc --noEmit` passes (for mobile tasks)

**Acceptance Criteria Check:**
For each criterion in the task spec:
- If code-verifiable: grep/read to confirm implementation
- If manual-only: mark as "requires manual verification"
- If ambiguous: mark as "inconclusive"

## Status Codes

- `VERIFIED` - All checks pass
- `FAILED` - One or more critical checks failed
- `PARTIAL` - Some criteria unverifiable but no failures
- `MANUAL_REVIEW` - Requires human verification

## Integration with Dev Loop

When `--verify` flag is passed to dev-loop, run verification after each task completion:

```
/dev-loop --continuous --verify
```

This adds verification step before marking task complete in manifest.
