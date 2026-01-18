# G59: CI/CD and Deployment Setup

## Overview

Set up continuous integration, testing, and deployment pipelines for production readiness. Configure hosting for backend (Railway/Fly.io) and frontend (Vercel).

## Context

**Source:** Retrospection analysis - No production infrastructure
**Current State:** Local development only, no CI/CD

## Acceptance Criteria

- [ ] GitHub Actions workflow for CI (lint, type-check, test)
- [ ] GitHub Actions workflow for CD (deploy on merge to main)
- [ ] Backend deployed to Railway or Fly.io
- [ ] Frontend deployed to Vercel
- [ ] Database on managed PostgreSQL (Neon/Supabase)
- [ ] Environment secrets configured properly
- [ ] Preview deployments for PRs

## Files to Create

| File | Description |
|------|-------------|
| `.github/workflows/ci.yml` | CI workflow |
| `.github/workflows/deploy.yml` | CD workflow |
| `server/fly.toml` | Fly.io configuration |
| `server/Dockerfile` | Backend container |
| `web/vercel.json` | Vercel configuration |
| `.env.production.example` | Production env template |

## Implementation Notes

### CI Workflow

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm test
```

### Deploy Workflow

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: superfly/flyctl-actions/setup-flyctl@master
      - run: flyctl deploy --remote-only
        working-directory: server
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: web
```

### Environment Configuration

Production needs:
- DATABASE_URL (managed PostgreSQL)
- BETTER_AUTH_SECRET
- BETTER_AUTH_URL
- LOGMEAL_API_KEY (when nutrition added)
- MASTRA_API_KEY (for AI features)

## Definition of Done

- [ ] CI runs on every PR
- [ ] All tests pass in CI
- [ ] Backend auto-deploys on merge
- [ ] Frontend auto-deploys on merge
- [ ] Production environment functional
