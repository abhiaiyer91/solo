# G144: Add /task-verify Command

## Overview
Create a dedicated verification command that can be run manually after task completion or automatically as part of the dev-loop workflow.

## Context
**Source:** Skills retrospective 2026-01-18
**Current State:** Verifier agent exists but isn't wired into workflow
**Problem:** Tasks marked "completed" sometimes have issues discovered later

## Acceptance Criteria
- [ ] `/task-verify <task-id>` verifies specific task
- [ ] `/task-verify --last` verifies most recently completed task
- [ ] `/task-verify --all` verifies all tasks completed in last 24h
- [ ] Verification checks: files exist, builds pass, acceptance criteria met
- [ ] Clear pass/fail output with details on failures
- [ ] Can be run independently or as part of dev-loop

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| .claude/commands/task-verify.md | Create | Command definition |
| .claude/agents/verifier.md | Modify | Enhance with more checks |

## Implementation Notes

### Command Definition
```markdown
# Task Verify - Verify Task Completion

Verify that completed tasks meet all requirements.

## Usage
/task-verify <task-id>     # Verify specific task
/task-verify --last        # Verify last completed task
/task-verify --all         # Verify all recent completions

## Verification Checks
1. Files exist as specified in task spec
2. Build passes (npm run build)
3. Tests pass if relevant (npm run test)
4. Acceptance criteria spot-checked
5. No obvious regressions

## Output
✓ G135-healthkit-dev-setup VERIFIED
  Files: 4/4 exist
  Build: passed
  Tests: n/a
  Criteria: 7/7 checkable

✗ G136-health-sync-testing FAILED
  Files: 3/4 exist (missing: scripts/verify-health-sync.ts)
  Build: passed
  Criteria: 5/8 verifiable
  Issues:
    - Missing file: scripts/verify-health-sync.ts
    - Acceptance criterion 4 not verifiable
```

### Enhanced Verifier Agent Prompt
```
You are verifying task: {taskId}

Task Spec:
{taskSpec}

Files expected to be created: {filesCreated}
Files expected to be modified: {filesModified}

Your verification steps:
1. Check each expected file exists using ls or Read
2. Run appropriate build command
3. For each acceptance criterion, verify if possible:
   - If code-checkable, verify via grep/read
   - If manual-only, mark as "manual verification needed"
4. Report any discrepancies
```

## Definition of Done
- [ ] Command documented in .claude/commands/
- [ ] Can verify individual tasks
- [ ] Can verify batch of recent completions
- [ ] Clear output format
- [ ] Integrates with existing verifier agent
