# Debt Sweep - Tech Debt & Improvement Discovery

Scan the codebase for technical debt, refactoring opportunities, and improvement candidates. Generate a structured manifest for tracking and prioritizing cleanup work.

## Usage

```
/debt-sweep [options]
```

**Options:**
- No args: Full codebase analysis
- `--scan-only`: Analyze without creating manifest entries
- `--focus <area>`: Focus on specific area (frontend, backend, database, deps, types, security, testing)
- `--severity <level>`: Filter by minimum severity (critical, high, medium, low)
- `--update`: Update existing manifest, don't overwrite

## Instructions

### Step 1: Display Current Debt Status

If debt manifest exists, show current state:

```
DEBT SWEEP
═══════════════════════════════════════

Current Debt Manifest:
  Total Items: 24
  Critical: 2
  High: 8
  Medium: 10
  Low: 4

  Resolved: 6
  Outstanding: 18

Last sweep: 2026-01-15
```

### Step 2: Run Multi-Category Analysis

Analyze these categories in parallel:

#### A. Code Complexity & Smells

Scan for functions/files that are overly complex:

```
Analyzing code complexity...
├── Functions > 50 lines
├── Cyclomatic complexity > 10
├── Deeply nested logic (> 4 levels)
├── Files > 300 lines
└── Classes with > 10 methods
```

Look for:
- God functions/classes doing too much
- Long parameter lists (> 5 params)
- Deeply nested callbacks/conditionals
- Switch statements that should be polymorphic

#### B. TODO/FIXME/HACK Comments

Extract and categorize inline debt markers:

```
Grepping for debt markers...
├── TODO: Items to complete
├── FIXME: Known bugs to fix
├── HACK: Temporary workarounds
├── XXX: Attention needed
├── DEPRECATED: Code to remove
└── @debt: Explicit debt markers
```

Capture context: file, line, author (from git blame), age (days since added).

#### C. Dependency Health

Check package health and outdated deps:

```
Analyzing dependencies...
├── Outdated packages (npm outdated)
├── Deprecated packages
├── Security vulnerabilities (npm audit)
├── Unused dependencies
└── Duplicate dependencies
```

#### D. Type Safety Issues

Find type system gaps:

```
Scanning for type issues...
├── 'any' type usage
├── @ts-ignore/@ts-nocheck comments
├── Missing return types
├── Implicit any in function params
└── Type assertions (as unknown as X)
```

#### E. Hardcoded Values

Find magic numbers and hardcoded strings:

```
Scanning for hardcoded values...
├── Magic numbers in logic
├── Hardcoded URLs/endpoints
├── Hardcoded credentials (CRITICAL)
├── Hardcoded configuration
└── Inline SQL/queries
```

#### F. Error Handling Gaps

Find missing error handling:

```
Scanning error handling...
├── Unhandled promise rejections
├── Empty catch blocks
├── Generic error swallowing
├── Missing error boundaries (React)
└── API endpoints without try/catch
```

#### G. Duplicated Patterns

Find code that could be consolidated:

```
Scanning for duplication...
├── Similar function implementations
├── Repeated API call patterns
├── Duplicated validation logic
├── Copy-pasted component patterns
└── Repeated utility functions
```

#### H. Performance Concerns

Find potential performance issues:

```
Scanning for performance issues...
├── N+1 query patterns
├── Missing pagination
├── Large bundle imports
├── Synchronous operations in hot paths
├── Missing memoization opportunities
└── Unoptimized images/assets
```

#### I. Security Concerns

Find security anti-patterns:

```
Scanning for security issues...
├── SQL injection vectors
├── XSS vulnerabilities
├── Exposed secrets/keys
├── Missing input validation
├── Insecure defaults
└── Missing rate limiting
```

#### J. Test Coverage Gaps

Analyze test coverage and identify untested code:

```
Analyzing test coverage...
├── Services without test files
├── Components without test files
├── Utility functions without tests
├── API routes without integration tests
├── Critical paths without coverage
└── Test file to source file ratio
```

**Coverage Analysis Approach:**

1. **Find source files without corresponding test files:**
   ```
   For each server/src/services/*.ts → check for *.test.ts or *.spec.ts
   For each web/src/components/*.tsx → check for *.test.tsx
   For each server/src/routes/*.ts → check for integration tests
   ```

2. **Identify critical untested paths:**
   - Auth flows (login, logout, session management)
   - Payment/transaction logic
   - Data mutation operations (create, update, delete)
   - Error handling paths
   - Edge cases in business logic

3. **Calculate coverage metrics:**
   ```
   Source files: 45
   Test files: 12
   Coverage ratio: 27%

   Untested critical services:
     • server/src/services/quest.ts (658 lines, 0 tests)
     • server/src/services/xp.ts (249 lines, 0 tests)
     • server/src/services/health.ts (340 lines, 0 tests)

   Untested components:
     • web/src/components/quest/* (5 components, 0 tests)
     • web/src/pages/* (8 pages, 0 tests)
   ```

4. **Severity scoring for missing tests:**
   - `critical`: Auth, payments, data integrity - no tests
   - `high`: Core business logic services - no tests
   - `medium`: UI components, utilities - no tests
   - `low`: Config, constants, types - no tests needed

### Step 3: Categorize & Score Findings

Assign severity and effort scores:

```
ANALYSIS RESULTS
═══════════════════════════════════════

🔴 Critical (Security/Breaking):
  • Hardcoded API key in server/src/config.ts:45
  • SQL injection in server/src/routes/users.ts:78

🟠 High (Should fix soon):
  • 12 'any' types in core services
  • UserService.ts is 450 lines, needs splitting
  • 3 FIXME comments older than 30 days

🟡 Medium (Improvement opportunities):
  • 8 TODO comments for future features
  • 5 functions with complexity > 15
  • 15 outdated dependencies

🟢 Low (Nice to have):
  • 4 magic numbers could be constants
  • Minor code style inconsistencies
```

### Step 4: Generate Debt Manifest

Create/update `docs/planning/debt-manifest.json`:

```json
{
  "lastSweep": "2026-01-18T10:30:00Z",
  "summary": {
    "total": 24,
    "bySeverity": {
      "critical": 2,
      "high": 8,
      "medium": 10,
      "low": 4
    },
    "byCategory": {
      "security": 2,
      "complexity": 5,
      "types": 12,
      "dependencies": 15,
      "performance": 3,
      "testing": 8
    },
    "resolved": 0,
    "outstanding": 24
  },
  "items": [
    {
      "id": "DEBT-001",
      "category": "security",
      "severity": "critical",
      "title": "Hardcoded API key in config",
      "description": "API key is hardcoded instead of using environment variable",
      "file": "server/src/config.ts",
      "line": 45,
      "codeSnippet": "const API_KEY = 'sk-abc123...'",
      "suggestedFix": "Move to environment variable, use process.env.API_KEY",
      "effort": "low",
      "addedAt": "2026-01-18T10:30:00Z",
      "age": null,
      "author": "git-blame-author",
      "status": "open",
      "resolvedAt": null,
      "linkedTask": null,
      "tags": ["security", "config", "urgent"]
    },
    {
      "id": "DEBT-025",
      "category": "testing",
      "severity": "high",
      "title": "Quest service has no test coverage",
      "description": "Core business logic in quest.ts (658 lines) has zero test coverage",
      "file": "server/src/services/quest.ts",
      "line": null,
      "codeSnippet": "0 test files found for quest.ts",
      "suggestedFix": "Add unit tests for getTodayQuests, updateQuestProgress, evaluateRequirement",
      "effort": "high",
      "addedAt": "2026-01-18T10:30:00Z",
      "age": null,
      "author": null,
      "status": "open",
      "resolvedAt": null,
      "linkedTask": null,
      "tags": ["testing", "backend", "critical-path"]
    }
  ]
}
```

### Step 5: Generate Human-Readable Report

Create/update `docs/planning/debt-report.md`:

```markdown
# Technical Debt Report

Generated: 2026-01-18

## Summary

| Severity | Count | Effort Est. |
|----------|-------|-------------|
| Critical | 2     | 2 hours     |
| High     | 8     | 1 day       |
| Medium   | 10    | 2 days      |
| Low      | 4     | 4 hours     |

## Critical Items (Fix Immediately)

### DEBT-001: Hardcoded API key in config
- **File:** server/src/config.ts:45
- **Category:** Security
- **Effort:** Low
- **Fix:** Move to environment variable

### DEBT-002: SQL injection vulnerability
- **File:** server/src/routes/users.ts:78
- **Category:** Security
- **Effort:** Medium
- **Fix:** Use parameterized queries

## High Priority Items

### DEBT-003: UserService is too large (450 lines)
...

## Recommendations

1. **Immediate:** Address critical security items
2. **This Sprint:** Tackle high-priority type safety issues
3. **Ongoing:** Chip away at medium items during feature work
4. **Backlog:** Track low items for future cleanup sprints
```

### Step 6: Link to Task System (Optional)

For high-severity items, optionally create tasks:

```
Create tasks for critical/high items? [y/n]

If yes, generate task files like:
  - docs/planning/tasks/DEBT-001-fix-hardcoded-key.md
  - docs/planning/tasks/DEBT-003-split-user-service.md

And add to manifest.json with:
  "source": "debt-sweep"
  "tags": ["tech-debt", "refactor"]
```

### Step 7: Report Summary

```
DEBT SWEEP COMPLETE
═══════════════════════════════════════

Scan Summary:
  Files analyzed: 127
  Lines scanned: 15,420
  Markers found: 45

Debt Items Found: 24
  Critical: 2  (fix immediately)
  High: 8      (fix soon)
  Medium: 10   (improve when touching)
  Low: 4       (backlog)

Estimated Total Effort: ~3 days

Updated Files:
  • docs/planning/debt-manifest.json
  • docs/planning/debt-report.md

Top Recommendations:
  1. Fix 2 critical security issues first
  2. Add types to 12 'any' usages in services/
  3. Split UserService.ts into smaller modules

Run /debt-sweep --update after addressing items.
Run /task-loop to work on generated debt tasks.
```

## Focus Areas

When using `--focus <area>`:

| Area | What to Scan |
|------|--------------|
| `frontend` | web/src/**, React patterns, bundle size, component complexity |
| `backend` | server/src/**, API patterns, service complexity, error handling |
| `database` | Schema issues, query patterns, migration debt |
| `deps` | Package health, outdated, unused, duplicates |
| `types` | TypeScript strictness, any usage, type coverage |
| `security` | Vulnerabilities, exposed secrets, injection vectors |
| `performance` | N+1 queries, bundle size, render performance |
| `testing` | Test coverage gaps, missing test files, untested critical paths |

## Severity Levels

| Level | Description | Action |
|-------|-------------|--------|
| `critical` | Security vulnerabilities, data loss risks | Fix immediately |
| `high` | Significant maintainability/reliability issues | Fix within sprint |
| `medium` | Code quality issues, minor tech debt | Fix when touching |
| `low` | Style issues, minor improvements | Backlog |

## Effort Estimates

| Effort | Time Range |
|--------|------------|
| `trivial` | < 15 minutes |
| `low` | 15 min - 1 hour |
| `medium` | 1-4 hours |
| `high` | 4-8 hours |
| `major` | > 1 day |

## Integration with Dev Loop

The debt manifest can feed into the main task system:

```
/debt-sweep                    # Discover debt
/debt-sweep --severity high    # Focus on important items
/task-status                   # See debt tasks in main manifest
/task-loop                     # Execute debt cleanup tasks
```

### Automatic Debt Sweep in Dev Loop

The dev-loop command automatically triggers debt sweeps at configurable intervals:

```bash
# Default: sweep every 5 task cycles
/dev-loop --continuous

# Custom interval: sweep every 3 cycles
/dev-loop --continuous --debt-interval 3

# Auto-fix high+ severity items during sweeps
/dev-loop --continuous --debt-interval 5 --debt-fix high

# Disable automatic sweeps
/dev-loop --continuous --no-debt-sweep
```

When triggered by dev-loop, the sweep:
1. Runs in focused mode (scan only, quick analysis)
2. Updates the debt manifest with new items
3. Auto-fixes eligible items if `--debt-fix` is set
4. Reports summary and resumes task execution

### Cycle Tracking

The debt manifest tracks dev-loop integration state:

```json
{
  "lastSweep": "2026-01-18T10:30:00Z",
  "lastUpdate": "2026-01-18T10:30:00Z",
  "devLoop": {
    "cyclesSinceLastSweep": 0,
    "totalCycles": 15,
    "lastSweepCycle": 15,
    "autoFixLevel": "high"
  },
  ...
}
```

## Scheduling Recommendation

Run debt sweep:
- **Automatic:** Let dev-loop handle it every 5 cycles (default)
- Before starting a major refactor
- At the start of each sprint/cycle
- After a major feature is complete
- Monthly for ongoing maintenance
- When onboarding new team members (good codebase overview)
