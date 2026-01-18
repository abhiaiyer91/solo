# G17: Implement Health Data Sync API

## Overview
Create backend API endpoints for health data synchronization from mobile apps (HealthKit/Google Fit).

## Context
**Source:** docs/mobile/data-input.md
**Related Docs:** docs/planning/task-decomposition.md (1.10.6-1.10.9)
**Current State:** No health sync endpoints exist, quest completion requires manual input

## Acceptance Criteria
- [ ] HealthSnapshot schema in database
- [ ] POST /api/health/sync endpoint (submit health data)
- [ ] GET /api/health/today endpoint (get today's health snapshot)
- [ ] Health data includes: steps, workouts, sleep, exercise minutes
- [ ] Quest auto-evaluation from health data
- [ ] Verification levels tracked (verified, imported, self-reported, estimated)
- [ ] Data source tracking (HealthKit, GoogleFit, Manual)

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| server/src/db/schema/health.ts | Create | HealthSnapshot schema |
| server/src/services/health.ts | Create | Health sync service |
| server/src/services/quest.ts | Modify | Add auto-evaluation from health data |
| server/src/index.ts | Modify | Add health endpoints |
| server/src/db/schema/index.ts | Modify | Export health schema |

## Implementation Notes
From data-input.md:
- Steps: Auto from Health APIs, fallback to manual
- Workouts: Detect from Health APIs, confirm or manual
- Sleep: Auto from Health APIs
- Protein: Yes/No check or nutrition app import

Verification Levels:
- Verified: Hardware-confirmed (steps from HealthKit)
- Imported: From trusted source (workout from fitness app)
- Self-Reported: User claims it
- Estimated: System inferred (wake time from phone unlock)

## Definition of Done
- [ ] All acceptance criteria met
- [ ] No TypeScript errors
- [ ] Existing tests pass
- [ ] Health data triggers quest evaluation
