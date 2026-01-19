# G136: End-to-End Health Sync Testing

## Overview
Create comprehensive testing infrastructure for verifying health data flows correctly from HealthKit on device through to the backend database, with proper deduplication and quest auto-evaluation.

## Context
**Source:** Retrospective analysis 2026-01-18
**Dependencies:** G135-healthkit-dev-setup, G65-healthkit-sync-service
**Current State:** Backend health sync API exists, mobile sync service scaffolded
**Rationale:** Health data is the core differentiator - must work flawlessly

## Acceptance Criteria
- [ ] Manual test checklist for health sync verification
- [ ] Test utility to generate mock HealthKit data on device
- [ ] Verification script to check backend received correct data
- [ ] Quest auto-completion verified when health data meets targets
- [ ] Deduplication verified (same workout synced twice = one record)
- [ ] Error cases documented (network failure, partial sync)

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| mobile/src/lib/health-test-utils.ts | Create | Mock data generators |
| scripts/verify-health-sync.ts | Create | Backend verification script |
| docs/mobile/health-sync-testing.md | Create | Test procedures documentation |
| mobile/src/components/DebugHealthPanel.tsx | Create | Dev-only health debug UI |

## Implementation Notes

### Manual Test Cases

**TC-001: Basic Step Sync**
1. Walk 100+ steps with phone in pocket
2. Open Journey app
3. Pull-to-refresh or wait for auto-sync
4. Verify step count appears in dashboard
5. Verify database has new health_snapshot row

**TC-002: Workout Sync**
1. Start workout in Apple Fitness/Health app
2. Complete workout
3. Open Journey app
4. Verify workout appears in recent activity
5. Verify workout_records table has entry with correct HealthKit UUID

**TC-003: Quest Auto-Completion**
1. Set step quest target to 5000
2. Walk until Apple Health shows 5000+ steps
3. Trigger sync in Journey app
4. Verify step quest shows completed
5. Verify XP was awarded

**TC-004: Deduplication**
1. Complete a workout
2. Sync to Journey
3. Note workout_record ID
4. Trigger another sync
5. Verify no duplicate workout_record created
6. Verify original record unchanged

**TC-005: Network Failure Recovery**
1. Enable airplane mode
2. Complete a workout
3. Open Journey app (sync fails)
4. Disable airplane mode
5. Trigger sync again
6. Verify workout eventually syncs

### Debug Panel Requirements
- Show last sync timestamp
- Show pending sync items count
- Show sync error messages
- Button to force immediate sync
- Only visible in development builds

### Verification Script
```bash
# Example usage
npm run verify-health-sync --user-id=xxx --date=2026-01-18
# Should output:
# - Health snapshots for date
# - Workout records for date
# - Quests auto-evaluated
# - XP events from health data
```

## Definition of Done
- [ ] All 5 test cases pass on physical device
- [ ] Debug panel works in dev build
- [ ] Verification script runs successfully
- [ ] Documentation complete with screenshots
- [ ] No data loss scenarios identified
