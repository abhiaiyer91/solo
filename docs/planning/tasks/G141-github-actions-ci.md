# G141: GitHub Actions CI Pipeline

## Overview
Set up continuous integration with GitHub Actions to automatically run tests, type checking, and builds on every pull request.

## Context
**Source:** Retrospective analysis 2026-01-18, production hardening gap
**Current State:** No CI/CD, manual testing only
**Rationale:** Cannot safely iterate without automated verification

## Acceptance Criteria
- [ ] Workflow runs on every pull request to main
- [ ] TypeScript compilation verified (all packages)
- [ ] All tests pass (server, web)
- [ ] Build succeeds (web production build)
- [ ] PR blocked if any check fails
- [ ] Status checks visible in PR UI

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| .github/workflows/ci.yml | Create | Main CI workflow |
| .github/workflows/test.yml | Create | Test-specific workflow |
| package.json | Modify | Add CI-specific scripts if needed |

## Implementation Notes

### Main CI Workflow
```yaml
name: CI

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  typecheck:
    name: Type Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run typecheck --workspaces

  test-server:
    name: Server Tests
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: journey_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run test --workspace=server
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/journey_test

  test-web:
    name: Web Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run test --workspace=web

  build:
    name: Build
    runs-on: ubuntu-latest
    needs: [typecheck]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run build --workspace=web
```

### Branch Protection Rules
Configure in GitHub repository settings:
- Require status checks to pass before merging
- Required checks: typecheck, test-server, test-web, build
- Require branches to be up to date before merging

### Caching Strategy
- Use `actions/cache` for node_modules
- Cache npm between runs
- Cache TypeScript build info for faster type checks

### Estimated Run Time
| Job | Expected Duration |
|-----|-------------------|
| Type Check | 30-60s |
| Server Tests | 60-90s |
| Web Tests | 30-60s |
| Build | 60-90s |
| **Total (parallel)** | ~2 minutes |

## Definition of Done
- [ ] Workflow file committed and validated
- [ ] All checks passing on main branch
- [ ] Branch protection rules configured
- [ ] Failed check blocks merge
- [ ] Success badges visible in README (optional)
