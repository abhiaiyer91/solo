# Docs Sync - True Up Documentation and Tasks

Synchronize the documentation, codebase, and task decomposition to ensure everything is accurate and up-to-date.

## What This Command Does

1. **Read all documentation** in `docs/` to understand documented features
2. **Scan the codebase** (if exists) to understand implemented features
3. **Review task decomposition** in `docs/planning/task-decomposition.md`
4. **Identify gaps**:
   - Features documented but not in task list
   - Tasks completed but not marked done
   - Features implemented but not documented
   - Orphaned or stale content
5. **Update task decomposition** with missing tasks
6. **Update documentation** to reflect current state
7. **Report summary** of changes made

## Instructions

Follow this process:

### Step 1: Audit Documentation
Read these key docs to understand the full scope:
- `docs/README.md` (index)
- `docs/overview/*.md` (tech stack, concepts, journey)
- `docs/game-systems/*.md` (all game mechanics)
- `docs/mobile/*.md` (health data, data input)
- `docs/content/*.md` (narrative, CMS)
- `docs/planning/task-decomposition.md` (all tasks)

### Step 2: Scan Codebase (if exists)
Check for implemented features:
- `server/src/` for backend implementation
- `web/src/` for frontend implementation
- `mobile/` for mobile app implementation
- Compare against task list to mark completed items

### Step 3: Cross-Reference
For each documented feature, verify:
- Is there a corresponding task section?
- Are database models accounted for?
- Are API endpoints listed?
- Are UI components included?
- Are seed data tasks included?

### Step 4: Update Task Decomposition
Add any missing tasks following the existing format:
- Use sequential IDs within sections (e.g., 2.7.1, 2.7.2)
- Include dependencies
- Estimate complexity (Low/Medium/High)
- Update task counts in summary tables

### Step 5: Clean Up
- Remove duplicate tasks
- Fix task ID numbering issues
- Update progress percentages
- Ensure all cross-references are valid

### Step 6: Report
Provide summary:
- Tasks added
- Tasks marked complete
- Documentation gaps found
- Recommendations for next steps

## Output Format

After running, report:

```
## Docs Sync Report

### Tasks Added
- [list new tasks added]

### Tasks Completed
- [list tasks marked done based on codebase]

### Documentation Updates
- [list any doc changes made]

### Current Status
- Total tasks: X
- Completed: Y
- In Progress: Z
- Remaining: W

### Recommended Next Actions
- [priority items to work on]
```
