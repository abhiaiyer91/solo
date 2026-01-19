# Technical Debt Report

Generated: 2026-01-19

## Summary

| Severity | Count | Status |
|----------|-------|--------|
| Critical | 0 | - |
| High | 2 | 0 open, 2 resolved |
| Medium | 12 | 9 open, 3 resolved |
| Low | 9 | 6 open, 3 resolved |
| **Total** | **42** | **23 open, 19 resolved** |

## Category Breakdown

| Category | Count | Notes |
|----------|-------|-------|
| Dependencies | 12 | Major upgrades available (React 19, Vite 7, Tailwind 4) |
| Complexity | 5 | Large files needing refactoring |
| Testing | 4 | Good progress, some gaps remain |
| TODOs | 5 | Feature placeholders and incomplete work |
| Types | 2 | Minor type safety issues |
| Logging | 1 | 328 console statements to migrate |
| Security | 1 | npm audit vulnerabilities (moderate) |

---

## Outstanding Items by Severity

### High Priority (0 open)

All high-priority items have been resolved.

### Medium Priority (9 open)

#### DEBT-001: npm audit vulnerabilities (moderate)
- **File:** package.json
- **Category:** Security
- **Effort:** Medium
- **Fix:** Run `npm audit fix` or update affected packages

#### DEBT-003: quest.ts service is 1053 lines
- **File:** server/src/services/quest.ts
- **Category:** Complexity
- **Effort:** High
- **Fix:** Split into quest-core.ts, quest-progress.ts, quest-lifecycle.ts

#### DEBT-007: 328 console.log/error/warn statements
- **File:** server/src/, mobile/src/, scripts/
- **Category:** Logging
- **Effort:** Medium
- **Fix:** Use server/src/lib/logger.ts consistently

#### DEBT-008: React 18 to React 19 upgrade
- **File:** web/package.json
- **Category:** Dependencies
- **Effort:** High
- **Fix:** Test and upgrade alongside @types/react

#### DEBT-011: Tailwind CSS 3 to 4 upgrade
- **File:** web/package.json
- **Category:** Dependencies
- **Effort:** High
- **Fix:** Review migration guide - significant breaking changes

#### DEBT-028: 6 routes missing integration tests
- **File:** server/src/routes/
- **Category:** Testing
- **Effort:** Medium
- **Fix:** Add tests for content, body, nutrition, accountability, raids, admin

#### DEBT-031: ~23 services without tests
- **File:** server/src/services/
- **Category:** Testing
- **Effort:** Major
- **Fix:** Prioritize email.ts (553 lines), body-composition.ts (449 lines)

#### DEBT-033: 7 services exceed 500 lines
- **File:** server/src/services/
- **Category:** Complexity
- **Effort:** High
- **Fix:** Split quest.ts, dungeon.ts, boss.ts into smaller modules

#### DEBT-037: routes/player.ts is 771 lines
- **File:** server/src/routes/player.ts
- **Category:** Complexity
- **Effort:** Medium
- **Fix:** Split into player-profile.ts, player-settings.ts

### Low Priority (6 open)

| ID | Title | File | Effort |
|----|-------|------|--------|
| DEBT-004 | TODO: Push notifications | server/src/services/notification.ts | High |
| DEBT-009 | Vite 5.x -> 7.x upgrade | web/package.json | Medium |
| DEBT-010 | Drizzle ORM upgrade | server/package.json | Medium |
| DEBT-032 | 10 'any' types in mobile | mobile/src/ | Low |
| DEBT-041 | Mobile debuff TODO | mobile/app/(tabs)/index.tsx | Low |
| DEBT-042 | Widget native bridge TODO | mobile/src/lib/widget-data.ts | High |

---

## Recently Resolved (Last 24 Hours)

| ID | Title | Resolution |
|----|-------|------------|
| DEBT-022 | Zero test coverage | Set up vitest, added 27+ service tests, 8 route tests, component tests |
| DEBT-023 | dungeon.ts untested | Added dungeon.test.ts with 7 tests |
| DEBT-024 | boss.ts untested | Added boss.test.ts with 21 tests |
| DEBT-025 | quest.ts partially tested | Added quest.test.ts with 19 tests |
| DEBT-029 | React components tested | 5 component test files now exist |
| DEBT-030 | Custom hooks tested | 3 hook test files now exist |
| DEBT-034 | 27 service test files | Good backend service coverage |

---

## Test Coverage Summary

### Backend Services
- **Total services:** ~50 files
- **Test files:** 27
- **Coverage:** ~54%

### Backend Routes
- **Total routes:** 14 files
- **Test files:** 8
- **Coverage:** 57%

### Frontend Components
- **Total components:** ~50 files
- **Test files:** 5
- **Coverage:** ~10%

### Frontend Hooks
- **Total hooks:** 26 files
- **Test files:** 3
- **Coverage:** ~12%

### Mobile
- **Test infrastructure:** Set up (jest.config.js, jest.setup.js, mocks)
- **Test files:** 2
- **Coverage:** Minimal - infrastructure only

---

## Recommendations

### Immediate (This Week)
1. **Fix npm audit vulnerabilities** - Security issue with moderate severity
2. **Migrate console.log to logger** - Start with routes/*.ts files

### Short-term (This Sprint)
1. **Add remaining route tests** - 6 routes still untested
2. **Split quest.ts service** - Largest service at 1053 lines
3. **Split player.ts route** - Largest route at 771 lines

### Medium-term (Next Sprint)
1. **React 19 upgrade** - Plan and test migration
2. **Tailwind 4 upgrade** - Significant breaking changes
3. **Add more frontend tests** - Focus on critical components

### Backlog
- Vite 7.x upgrade
- Drizzle ORM upgrade
- Other dependency upgrades
- Mobile native widget integration

---

## Commands

```bash
# View current debt
cat docs/planning/debt-manifest.json | jq '.summary'

# Run another sweep
/debt-sweep

# Focus on specific area
/debt-sweep --focus testing
/debt-sweep --focus dependencies

# Work on debt tasks
/task-loop
```
