# Task Distribution System

This folder contains self-contained task bundles for coding agents.

## How It Works

### For Orchestrators

1. Read `manifest.json` to see available tasks
2. Check `status` field - only `available` tasks can be claimed
3. Check `dependencies` - ensure dependent tasks are `completed`
4. Check `blockedBy` - ensure no blocking tasks are `in_progress`

### For Coding Agents

Before starting work:

1. **Read the task file** specified in `manifest.json`
2. **Claim the task** by updating manifest:
   - Set `status` to `"claimed"`
   - Set `claimedBy` to your agent ID
   - Set `claimedAt` to current ISO timestamp
3. **Verify dependencies** are completed
4. **Start work** - update `status` to `"in_progress"`

After completing work:

1. **Verify acceptance criteria** in the task file
2. **Update manifest** - set `status` to `"completed"`
3. **Report completion** with summary of changes

### Task File Structure

Each task file contains:

```markdown
# Task Title

## Overview
Brief description of what needs to be built

## Context
Background information, related docs, current state

## Acceptance Criteria
- [ ] Checkbox items that must be true when done

## Files to Modify
List of files to create or edit

## Implementation Guide
Step-by-step instructions with code examples

## Testing
How to verify the implementation works

## Definition of Done
Final checklist before marking complete
```

## Manifest Schema

```json
{
  "id": "unique-task-id",
  "title": "Human readable title",
  "file": "task-file.md",
  "priority": "P0|P1|P2|P3",
  "complexity": "low|medium|high",
  "estimatedFiles": 4,
  "status": "available|claimed|in_progress|blocked|completed|abandoned",
  "claimedBy": "agent-id or null",
  "claimedAt": "ISO timestamp or null",
  "dependencies": ["other-task-ids"],
  "blockedBy": ["task-ids-that-block-this"],
  "tags": ["frontend", "backend", "etc"]
}
```

## Priority Levels

- **P0**: Critical - blocks core functionality
- **P1**: High - needed for MVP
- **P2**: Medium - improves experience
- **P3**: Low - nice to have

## Current Task Overview

| Priority | Available | In Progress | Completed |
|----------|-----------|-------------|-----------|
| P0 | 2 | 0 | 0 |
| P1 | 4 | 0 | 0 |
| P2 | 4 | 0 | 0 |

## Dependency Graph

```
G1-dashboard-connection
├── G2-quest-completion-ui
├── G5-xp-timeline-ui
└── G7-stats-page
    └── (requires G6-layout-navigation)

G6-layout-navigation
├── G7-stats-page
└── G8-profile-page

Independent tasks (no dependencies):
├── G3-streak-system
├── G4-database-migrations
├── G9-system-messages
└── G10-api-client
```
