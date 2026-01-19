# G147: Create manifest.schema.json Validation

## Overview
Create actual JSON Schema for manifest.json and wire it into the dev-loop for validation.

## Context
**Source:** Skills retrospective 2026-01-18
**Current State:** manifest.json references schema but none exists
**Problem:** No validation of manifest structure, easy to introduce errors

## Acceptance Criteria
- [ ] JSON Schema file created at docs/planning/tasks/manifest.schema.json
- [ ] Schema validates task structure (id, title, priority, status, etc.)
- [ ] Schema validates enum values (status, priority)
- [ ] Dev-loop validates manifest before execution
- [ ] Clear error messages for validation failures

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| docs/planning/tasks/manifest.schema.json | Create | JSON Schema definition |
| .claude/skills/task-automation/SKILL.md | Modify | Add validation step |

## Implementation Notes

### JSON Schema Definition
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "manifest.schema.json",
  "title": "Task Manifest",
  "description": "Schema for Journey task manifest",
  "type": "object",
  "required": ["version", "tasks"],
  "properties": {
    "$schema": { "type": "string" },
    "version": { "type": "string", "pattern": "^\\d+\\.\\d+\\.\\d+$" },
    "lastUpdated": { "type": "string", "format": "date-time" },
    "tasks": {
      "type": "array",
      "items": { "$ref": "#/definitions/task" }
    }
  },
  "definitions": {
    "task": {
      "type": "object",
      "required": ["id", "title", "file", "priority", "status"],
      "properties": {
        "id": {
          "type": "string",
          "pattern": "^G\\d+-[a-z0-9-]+$",
          "description": "Task ID in format G{number}-{slug}"
        },
        "title": {
          "type": "string",
          "minLength": 5,
          "maxLength": 100
        },
        "file": {
          "type": "string",
          "pattern": "^G\\d+-[a-z0-9-]+\\.md$"
        },
        "priority": {
          "type": "string",
          "enum": ["P0", "P1", "P2", "P3"]
        },
        "complexity": {
          "type": "string",
          "enum": ["low", "medium", "high"]
        },
        "estimatedFiles": {
          "type": "integer",
          "minimum": 1
        },
        "status": {
          "type": "string",
          "enum": ["available", "claimed", "in_progress", "completed", "blocked", "abandoned"]
        },
        "claimedBy": {
          "type": ["string", "null"]
        },
        "claimedAt": {
          "type": ["string", "null"],
          "format": "date-time"
        },
        "completedAt": {
          "type": ["string", "null"],
          "format": "date-time"
        },
        "dependencies": {
          "type": "array",
          "items": { "type": "string" }
        },
        "blockedBy": {
          "type": "array",
          "items": { "type": "string" }
        },
        "tags": {
          "type": "array",
          "items": { "type": "string" }
        },
        "source": {
          "type": "string"
        },
        "createdAt": {
          "type": "string",
          "format": "date-time"
        }
      }
    }
  }
}
```

### Validation Script
```typescript
// scripts/validate-manifest.ts
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import schema from '../docs/planning/tasks/manifest.schema.json';
import manifest from '../docs/planning/tasks/manifest.json';

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

const validate = ajv.compile(schema);
const valid = validate(manifest);

if (!valid) {
  console.error('Manifest validation failed:');
  validate.errors?.forEach(err => {
    console.error(`  - ${err.instancePath}: ${err.message}`);
  });
  process.exit(1);
}

console.log('Manifest is valid');
```

### Dev-Loop Integration
Add to SKILL.md:
```markdown
### Manifest Validation

Before executing tasks, validate the manifest:

```bash
npx tsx scripts/validate-manifest.ts
```

If validation fails, report errors and stop execution.
```

## Definition of Done
- [ ] JSON Schema file created
- [ ] Schema validates all current manifest tasks
- [ ] Validation script works
- [ ] Dev-loop checks validation before execution
- [ ] Clear error messages for common issues
