# Ideation Loop - Generate New Tasks

Analyze the codebase, documentation, and current progress to identify gaps and generate new tasks for the manifest. Can also generate planning docs and tasks from a user-provided topic.

## Usage

```
/ideation-loop [options]
```

**Options:**
- No args: Full analysis and task generation
- `--quick`: Fast pipeline health check without creating files (~10 seconds)
- `--summary`: Show recent ideation history
- `--scan-only`: Analyze without creating tasks
- `--focus <area>`: Focus on specific area (frontend, backend, mobile, etc.)
- `--from-spec <file>`: Generate tasks from a specific spec/doc file
- `--topic <description>`: Create planning docs and tasks from a new idea/topic

## Quick Mode (--quick)

When using `--quick`, perform a fast pipeline health check without creating any files:

1. Read `docs/planning/tasks/manifest.json` to get task counts
2. Do a quick grep for TODOs in the codebase
3. Check for docs without corresponding tasks

**Output format:**
```
IDEATION CHECK
═══════════════════════════════════════

Task Pipeline:
  Total: 142 tasks
  Completed: 119 (84%)
  Available: 22
  In Progress: 1
  Blocked: 0

Pipeline Status: ✓ HEALTHY
  Available tasks (22) > threshold (5)
  No immediate ideation needed

Quick Gap Scan:
  Docs without tasks: 3 files
  TODOs in code: ~15 items
  Untested services: ~20 files

Recommendation: Pipeline healthy, run full ideation after next sprint

Last full ideation: 2026-01-18
```

**When to recommend full ideation:**
- Available tasks < 5 (threshold)
- Blocked tasks > available tasks
- Last ideation was more than 7 days ago
- Many docs without corresponding tasks

```
Recommendation: ⚠ RUN FULL IDEATION

Reasons:
- Available tasks (3) < threshold (5)
- Last ideation was 7 days ago

Run: /ideation-loop
Or:  /ideation-loop --focus backend
```

**Important:** Quick mode must NOT:
- Create any files
- Modify manifest.json
- Take more than ~10 seconds

---

## Summary Mode (--summary)

When using `--summary`, show the ideation history:

1. Read `docs/planning/gaps-and-priorities.md` for ideation sessions
2. Parse manifest.json to find tasks by `source` field
3. Calculate statistics

**Output format:**
```
IDEATION HISTORY
═══════════════════════════════════════

Recent Sessions:

2026-01-19 - Skills Retrospective
  Source: skills-retrospective
  Tasks created: 4
  Focus: Tooling improvements

2026-01-18 - Retrospective & Future Direction
  Source: --topic "reflection and retrospective..."
  Tasks created: 9
  Focus: Mobile-first, content, infrastructure

2026-01-18 - Infrastructure & Mobile
  Source: Full analysis
  Tasks created: 15
  Focus: Mobile parity, backend maintenance

Total ideation sessions: 8
Total tasks generated: 142
Active tasks remaining: 23
```

**Important:** Summary mode must NOT:
- Create any files
- Modify any documents

---

## Full Ideation Instructions

### Step 1: Current State Analysis

First, load and display current progress:

```
IDEATION LOOP
═══════════════════════════════════════

Current Task Manifest:
  Total: 10 tasks
  Completed: 2
  In Progress: 1
  Available: 4
  Blocked: 3

Last sync: 2026-01-18
```

### Step 2: Run Multi-Source Analysis

Analyze these sources in parallel to find gaps:

#### A. Documentation vs Implementation
Scan for features documented but not implemented:

```
Scanning docs/game-systems/*.md against server/src/...
Scanning docs/frontend/*.md against web/src/...
Scanning docs/mobile/*.md against mobile/...
```

Look for:
- API endpoints documented but not in routes
- Components described but not created
- Database models in docs but not in schema
- Features in spec but no corresponding code

#### B. Implementation vs Tests
Scan for code without test coverage:

```
Scanning server/src/services/*.ts for missing tests...
Scanning web/src/components/*.tsx for missing tests...
```

#### C. TODO/FIXME Comments
Extract actionable items from code:

```
Grepping for TODO, FIXME, HACK, XXX in codebase...
```

#### D. Error Handling Gaps
Find error cases not handled:

```
Scanning for unhandled promise rejections...
Scanning for missing error boundaries...
Scanning for API endpoints without error responses...
```

#### E. Spec Compliance
Compare against MASTER_SPEC.md:

```
Checking MASTER_SPEC.md sections against task-decomposition.md...
```

### Step 3: Categorize Findings

Group discovered gaps by type:

```
ANALYSIS RESULTS
═══════════════════════════════════════

🔴 Critical Gaps (blocking features):
  • Debuff system not implemented (documented in streaks-debuffs.md)
  • No health data sync endpoint (documented in data-input.md)

🟡 Missing Features (documented but not tasked):
  • Weekly quests (in quests.md, not in manifest)
  • Title system (in titles.md, not in manifest)
  • Boss fights (in bosses.md, not in manifest)

🔵 Code Quality:
  • 3 TODO comments need tasks
  • 5 services missing error handling
  • 0 test files exist

🟢 Nice to Have:
  • Animations for level-up
  • Sound effects (if documented)
```

### Step 4: Generate Task Files

For each significant gap, create a task file:

#### Template for new tasks:

```markdown
# {ID}: {Title}

## Overview
{Brief description from documentation or gap analysis}

## Context
**Source:** {Where this gap was identified}
**Related Docs:** {Links to relevant documentation}
**Current State:** {What exists now}

## Acceptance Criteria
- [ ] {Criterion 1}
- [ ] {Criterion 2}
...

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| path/to/file | Create/Modify | What it does |

## Implementation Notes
{Any guidance from docs or analysis}

## Definition of Done
- [ ] All acceptance criteria met
- [ ] No TypeScript errors
- [ ] Existing tests pass
```

### Step 5: Update Manifest

Add new tasks to `docs/planning/tasks/manifest.json`:

```json
{
  "id": "G11-debuff-system",
  "title": "Implement Debuff System",
  "file": "G11-debuff-system.md",
  "priority": "P1",
  "complexity": "medium",
  "estimatedFiles": 4,
  "status": "available",
  "claimedBy": null,
  "claimedAt": null,
  "dependencies": ["G3-streak-system"],
  "blockedBy": [],
  "tags": ["backend", "service"],
  "source": "ideation-loop",
  "createdAt": "2026-01-18T..."
}
```

### Step 6: Update Gaps Document

Append findings to `docs/planning/gaps-and-priorities.md`:

```markdown
---

## Ideation Loop - 2026-01-18

### New Gaps Identified
- Gap 11: Debuff System (from streaks-debuffs.md)
- Gap 12: Weekly Quests (from quests.md)
...

### Tasks Generated
- G11-debuff-system.md
- G12-weekly-quests.md
...
```

### Step 7: Report Summary

```
IDEATION COMPLETE
═══════════════════════════════════════

Analysis Summary:
  Documentation files scanned: 24
  Source files analyzed: 47
  TODO comments found: 8

New Tasks Generated: 5
  • G11-debuff-system (P1, backend)
  • G12-weekly-quests (P1, full-stack)
  • G13-title-system (P1, full-stack)
  • G14-error-boundaries (P2, frontend)
  • G15-api-error-handling (P2, backend)

Updated Files:
  • docs/planning/tasks/manifest.json (+5 tasks)
  • docs/planning/gaps-and-priorities.md (appended)
  • docs/planning/tasks/G11-debuff-system.md (created)
  • docs/planning/tasks/G12-weekly-quests.md (created)
  ...

Task Pipeline:
  Before: 10 tasks (2 complete, 8 remaining)
  After:  15 tasks (2 complete, 13 remaining)

Run /task-status to see updated manifest.
Run /task-loop to start executing tasks.
```

## Focus Areas

When using `--focus <area>`:

| Area | What to Scan |
|------|--------------|
| `frontend` | web/src/**, docs/frontend/**, UI components in specs |
| `backend` | server/src/**, docs/backend/**, API endpoints in specs |
| `mobile` | mobile/**, docs/mobile/**, HealthKit integration |
| `database` | server/src/db/**, docs/database/**, schema completeness |
| `content` | Sanity schemas, narrative content, docs/content/** |
| `testing` | Missing test files, coverage gaps |
| `devops` | CI/CD, deployment, monitoring gaps |

## From Spec Mode

When using `--from-spec <file>`:

1. Read the specified spec file
2. Extract all features/requirements
3. Cross-reference against existing tasks
4. Generate tasks for anything missing

Example:
```
/ideation-loop --from-spec docs/game-systems/bosses.md
```

This would generate tasks for:
- Boss model creation
- Boss API endpoints
- Boss fight UI
- Boss content seeding
- etc.

---

## Topic Mode (Idea-Driven Planning)

When using `--topic <description>`, generate planning documentation and tasks from a new idea or feature request.

### Example Usage

```
/ideation-loop --topic "Add a meditation tracking feature with guided sessions and mindfulness streaks"
/ideation-loop --topic "Implement push notifications for quest reminders"
/ideation-loop --topic "Add social sharing of achievements"
```

### Step 1: Understand the Topic

First, analyze the provided topic:

1. **Research if needed**: If the topic involves external APIs, technologies, or unfamiliar concepts, use web search to gather information
2. **Identify core requirements**: What does the user actually want to accomplish?
3. **Check existing context**: Scan the codebase and docs for related features or prior work

```
TOPIC ANALYSIS
═══════════════════════════════════════

Topic: "Add a meditation tracking feature with guided sessions"

Understanding:
  Core Goal: Track meditation sessions as part of wellness/fitness
  Related Features: Similar to workout tracking, integrates with streaks
  External Needs: May need audio hosting, timer functionality
  
Existing Context:
  • Quest system can track boolean/numeric activities
  • Streak system rewards consistency
  • HealthKit has mindful minutes data
```

### Step 2: Create Design Document

Create a planning/design document in `docs/` (choose appropriate subdirectory):

**Document locations by type:**
| Type | Location |
|------|----------|
| Game feature | `docs/game-systems/` |
| Frontend feature | `docs/frontend/` |
| Backend/API | `docs/backend/` |
| Mobile feature | `docs/mobile/` |
| Content/narrative | `docs/content/` |
| Cross-cutting | `docs/planning/` |

**Design Document Template:**

```markdown
# {Feature Name}

## Overview
{1-2 paragraph description of the feature and its purpose}

## Goals
- {Primary goal}
- {Secondary goals}

## User Stories
- As a user, I want to {action} so that {benefit}
- ...

## Technical Design

### Data Models
{Describe new database tables/models needed}

### API Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| /api/... | GET/POST | ... |

### Frontend Components
{List key UI components needed}

### Integration Points
{How this connects with existing systems}

## Requirements
### Must Have (P0)
- [ ] {Core requirement}

### Should Have (P1)
- [ ] {Important but not critical}

### Nice to Have (P2)
- [ ] {Future enhancement}

## Open Questions
- {Unresolved design decisions}

## Dependencies
- {What must exist before this can be built}
- {External services or APIs needed}
```

### Step 3: Break Down into Tasks

Decompose the design into implementable tasks:

1. **Identify work streams**: Backend, Frontend, Mobile, Content, etc.
2. **Order by dependencies**: What must be built first?
3. **Size appropriately**: Each task should be ~1-4 hours of work
4. **Define clear acceptance criteria**: How do we know it's done?

### Step 4: Create Task Files

For each task, create a file in `docs/planning/tasks/`:

**Task ID Convention:**
- Find the highest existing G-number in manifest.json
- Increment for new tasks: G48, G49, G50, etc.
- Group related tasks: G48-meditation-model, G49-meditation-api, G50-meditation-ui

**Task File Template:**

```markdown
# {ID}: {Title}

## Overview
{Brief description from the design document}

## Context
**Source:** Ideation loop --topic "{original topic}"
**Design Doc:** {Link to design document}
**Current State:** {What exists now, if anything}

## Acceptance Criteria
- [ ] {Criterion 1}
- [ ] {Criterion 2}
...

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| path/to/file | Create/Modify | What it does |

## Implementation Notes
{Guidance from design doc, code examples, gotchas}

## Definition of Done
- [ ] All acceptance criteria met
- [ ] No TypeScript errors
- [ ] Existing tests pass
```

### Step 5: Update Manifest

Add new tasks to `docs/planning/tasks/manifest.json`:

```json
{
  "id": "G48-meditation-model",
  "title": "Create Meditation Session Model",
  "file": "G48-meditation-model.md",
  "priority": "P1",
  "complexity": "low",
  "estimatedFiles": 2,
  "status": "available",
  "claimedBy": null,
  "claimedAt": null,
  "dependencies": [],
  "blockedBy": [],
  "tags": ["backend", "database"],
  "source": "ideation-loop --topic",
  "createdAt": "2026-01-18T..."
}
```

### Step 6: Update Planning Documents

Append to `docs/planning/gaps-and-priorities.md`:

```markdown
---

## Ideation: {Topic Title} - {Date}

### Source
User topic: "{original topic description}"

### Design Document
- {Link to created design doc}

### Tasks Generated
- G48-meditation-model (P1, backend)
- G49-meditation-api (P1, backend)
- G50-meditation-ui (P1, frontend)
...

### Notes
{Any context about priorities, blockers, or considerations}
```

### Step 7: Report Summary

```
IDEATION FROM TOPIC COMPLETE
═══════════════════════════════════════

Topic: "Add a meditation tracking feature..."

Research Performed:
  • Checked HealthKit mindful minutes API
  • Reviewed quest requirement DSL for compatibility

Documents Created:
  • docs/game-systems/meditation.md (design doc)
  • docs/planning/tasks/G48-meditation-model.md
  • docs/planning/tasks/G49-meditation-api.md
  • docs/planning/tasks/G50-meditation-ui.md
  • docs/planning/tasks/G51-meditation-healthkit.md

Manifest Updated:
  • 4 new tasks added
  • Priority: P1 (3 tasks), P2 (1 task)
  • Estimated complexity: low (2), medium (2)

Dependencies Identified:
  • G48 blocks G49 (model before API)
  • G49 blocks G50 (API before UI)
  • G51 depends on existing HealthKit integration

Next Steps:
  • Run /task-status to see updated manifest
  • Run /task-loop to start executing
  • Review design doc for open questions
```

### Topic Mode Best Practices

1. **Be thorough in research**: If the topic involves unfamiliar tech, search for best practices
2. **Connect to existing systems**: Always look for integration points with what exists
3. **Right-size tasks**: Too big = hard to complete; too small = overhead
4. **Capture uncertainty**: Use "Open Questions" in design doc for unresolved decisions
5. **Set realistic priorities**: Not everything is P0
6. **Consider the full stack**: Backend, frontend, mobile, content, testing

## Scheduling Recommendation

Run ideation loop:
- After completing a major feature
- When task pipeline is running low (<5 available)
- After updating documentation
- Weekly during active development
