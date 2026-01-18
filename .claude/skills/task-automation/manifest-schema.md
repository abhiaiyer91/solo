# Task Manifest Schema

Location: `docs/planning/tasks/manifest.json`

## Structure

```json
{
  "$schema": "./manifest.schema.json",
  "version": "1.0.0",
  "lastUpdated": "ISO-8601 timestamp",
  "tasks": [Task],
  "statusValues": ["available", "claimed", "in_progress", "blocked", "completed", "abandoned"],
  "priorityOrder": ["P0", "P1", "P2", "P3"]
}
```

## Task Object

```json
{
  "id": "G17-health-sync",           // Unique identifier
  "title": "Implement Health Sync",   // Human-readable title
  "file": "G17-health-sync.md",      // Task spec file in same directory
  "priority": "P1",                   // P0 (highest) to P3 (lowest)
  "complexity": "medium",             // low, medium, high
  "estimatedFiles": 5,                // Estimated files to modify
  "status": "available",              // Current status
  "claimedBy": null,                  // Agent/user who claimed it
  "claimedAt": null,                  // ISO timestamp when claimed
  "completedAt": null,                // ISO timestamp when completed
  "dependencies": ["G3-streak"],      // Task IDs that must complete first
  "blockedBy": [],                    // External blockers (not task deps)
  "tags": ["backend", "api"],         // Categorization tags
  "source": "ideation-loop",          // How task was created (optional)
  "createdAt": "ISO-8601"             // When task was added (optional)
}
```

## Status Values

| Status | Meaning | Next States |
|--------|---------|-------------|
| `available` | Ready to work on | claimed |
| `claimed` | Agent/user is working on it | in_progress, available |
| `in_progress` | Actively being executed | completed, blocked, abandoned |
| `blocked` | Waiting on external dependency | available, abandoned |
| `completed` | Done and verified | - |
| `abandoned` | Won't be completed | available |

## Priority Levels

| Priority | Meaning | When to Use |
|----------|---------|-------------|
| P0 | Critical | Blocks other work, must do first |
| P1 | High | Core functionality, do soon |
| P2 | Medium | Important but not urgent |
| P3 | Low | Nice to have, do when time allows |

## Tags

Common tags used for categorization:

| Tag | Domain |
|-----|--------|
| `backend` | Server-side code |
| `frontend` | Client-side code |
| `api` | API endpoints |
| `service` | Business logic services |
| `components` | UI components |
| `pages` | Full page components |
| `hooks` | React hooks |
| `database` | Schema/migrations |
| `infra` | Infrastructure/tooling |

## Task Spec File Format

Each task has a corresponding `.md` file:

```markdown
# G17: Implement Health Data Sync API

## Overview
Brief description of the task.

## Context
**Source:** Where this task came from
**Related Docs:** Links to relevant documentation
**Current State:** What exists now

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| path/to/file.ts | Create | What it does |
| path/to/other.ts | Modify | What changes |

## Implementation Notes
Detailed guidance, code examples, etc.

## Definition of Done
- [ ] All acceptance criteria met
- [ ] No TypeScript errors
- [ ] Existing tests pass
```

## Querying Tasks

### Get available tasks by priority
```javascript
const available = manifest.tasks
  .filter(t => t.status === 'available')
  .filter(t => t.dependencies.every(d =>
    manifest.tasks.find(t2 => t2.id === d)?.status === 'completed'
  ))
  .sort((a, b) =>
    manifest.priorityOrder.indexOf(a.priority) -
    manifest.priorityOrder.indexOf(b.priority)
  )
```

### Check if task is unblocked
```javascript
function isUnblocked(task, manifest) {
  return task.dependencies.every(depId => {
    const dep = manifest.tasks.find(t => t.id === depId)
    return dep?.status === 'completed'
  })
}
```

### Get tasks by tag
```javascript
const backendTasks = manifest.tasks.filter(t =>
  t.tags.includes('backend') && t.status === 'available'
)
```
