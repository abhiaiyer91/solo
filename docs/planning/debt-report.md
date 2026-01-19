# Technical Debt Report

Generated: 2026-01-18 18:00 UTC

## Summary

| Severity | Count | Effort Est. |
|----------|-------|-------------|
| Critical | 0     | -           |
| High     | 2     | 1-2 days    |
| Medium   | 11    | 3-4 days    |
| Low      | 8     | 1 day       |
| **Total Outstanding** | **21** | **~5-7 days** |
| Resolved | 19    | -           |

## Category Breakdown

| Category | Outstanding | Resolved |
|----------|-------------|----------|
| Dependencies | 12 | 1 |
| Complexity | 4 | 1 |
| Testing | 2 | 9 |
| Security | 1 | 1 |
| Logging | 1 | 0 |
| TODOs | 1 | 2 |
| Types | 0 | 1 |

---

## Positive Findings

- **No hardcoded credentials** - API keys use environment variables
- **No empty catch blocks** - Error handling is present
- **Zero `any` type usage** - Excellent TypeScript discipline
- **No `@ts-ignore`** - Clean type checking (2 `@ts-expect-error` in tests are intentional)
- **Proper auth patterns** - Passwords handled through better-auth library
- **Testing infrastructure established** - 24 service tests, 5 component/hook tests
- **Good test coverage on core services** - dungeon, boss, quest, narrative, shadow all tested

---

## High Priority Items (Fix Soon)

### DEBT-003: quest.ts service is 1053 lines - needs splitting
- **File:** server/src/services/quest.ts
- **Category:** Complexity
- **Effort:** High
- **Details:** Quest service has 12 exported async functions and handles too many responsibilities
- **Fix:** Split into:
  - `quest-core.ts` (getTodayQuests, getQuestById, getAllQuestTemplates)
  - `quest-progress.ts` (updateQuestProgress, autoEvaluateQuestsFromHealth)
  - `quest-lifecycle.ts` (resetQuest, activateQuest, removeQuest, deactivateQuestByTemplate)
  - `quest-history.ts` (getQuestHistory, getQuestStatistics)

### DEBT-033: 7 services exceed 500 lines
- **File:** server/src/services/
- **Category:** Complexity
- **Effort:** High
- **Details:**
  | Service | Lines |
  |---------|-------|
  | quest.ts | 1053 |
  | dungeon.ts | 741 |
  | boss.ts | 711 |
  | narrative.ts | 595 |
  | rotating-quest.ts | 562 |
  | shadow.ts | 560 |
  | email.ts | 553 |
- **Fix:** Start with quest.ts (12 exported functions), then consider dungeon.ts and boss.ts

---

## Medium Priority Items

### Security

#### DEBT-001: npm audit vulnerabilities (moderate)
- **File:** package.json
- **Details:** Moderate severity in ai <=5.0.51 (GHSA-rwvc-j5jr-mgvh), esbuild (via drizzle-kit), @mastra/core, better-auth
- **Fix:**
  - Upgrade drizzle-kit to 0.31.8 (fixes esbuild)
  - Upgrade @mastra/core to 0.1.3 (fixes ai)
  - Run `npm audit` for full details

### Logging

#### DEBT-007: 263 console.log/error/warn statements in production code
- **File:** server/src/
- **Details:**
  | File | Count |
  |------|-------|
  | db/seed.ts | 38 |
  | routes/player.ts | 32 |
  | routes/quests.ts | 26 |
  | routes/notifications.ts | 13 |
- **Fix:** Use existing `server/src/lib/logger.ts` consistently across all files

### Testing

#### DEBT-028: 12 of 14 API routes lack integration tests
- **File:** server/src/routes/
- **Details:** Only player.ts and quests.ts have tests (14% coverage)
- **Missing:** content, guilds, health, notifications, body, onboarding, stats, nutrition, seasons, accountability, raids, admin
- **Priority:** notifications, body, onboarding (high traffic)

#### DEBT-031: 20 services without test coverage (~7,500 lines)
- **File:** server/src/services/
- **Details:** 45% of services untested
- **Priority order:**
  | Service | Lines | Priority |
  |---------|-------|----------|
  | email.ts | 553 | High |
  | body-composition.ts | 449 | High |
  | season.ts | 445 | High |
  | achievement.ts | 429 | Medium |
  | title.ts | 423 | Medium |
  | raid.ts | 417 | Medium |
  | quest-adaptation.ts | 414 | Medium |
  | psychology.ts | 410 | Medium |
  | daily-log.ts | 399 | Low |
  | health.ts | 340 | Low |
  | nutrition.ts | - | Low |

### Dependencies (Major Upgrades)

#### DEBT-008: React 18 to React 19 upgrade
- **From:** react 18.3.1, react-dom 18.3.1
- **To:** react 19.2.3, react-dom 19.2.3
- **Effort:** High (coordinate with types)
- **Also upgrade:** @types/react 18.3.27 -> 19.2.8, @types/react-dom 18.3.7 -> 19.2.3

#### DEBT-011: Tailwind CSS 3 to 4 upgrade
- **From:** tailwindcss 3.4.19
- **To:** tailwindcss 4.1.18
- **Effort:** High (significant breaking changes in configuration and class naming)

#### DEBT-016: @types/node upgrade
- **From:** 22.19.7
- **To:** 25.0.9
- **Effort:** Low

#### DEBT-018: @vitejs/plugin-react upgrade
- **From:** 4.7.0
- **To:** 5.1.2
- **Effort:** Low (upgrade with Vite)

### Complexity

#### DEBT-037: routes/player.ts is 771 lines
- **File:** server/src/routes/player.ts
- **Details:** Largest route module with 32 console statements
- **Fix:** Split into player-profile.ts, player-settings.ts, player-stats.ts

#### DEBT-038: routes/quests.ts is 652 lines
- **File:** server/src/routes/quests.ts
- **Details:** Large with 26 console statements
- **Fix:** Split into quest-daily.ts, quest-templates.ts, quest-history.ts

---

## Low Priority Items (Backlog)

### Dependencies (Minor Upgrades)

| ID | Package | Current | Latest | Effort |
|----|---------|---------|--------|--------|
| DEBT-009 | vite | 5.4.21 | 7.3.1 | Medium |
| DEBT-010 | drizzle-orm | 0.36.4 | 0.45.1 | Medium |
| DEBT-012 | framer-motion | 11.18.2 | 12.27.0 | Low |
| DEBT-013 | react-router-dom | 6.30.3 | 7.12.0 | Medium |
| DEBT-014 | zod | 3.25.76 | 4.3.5 | Medium |
| DEBT-015 | @paralleldrive/cuid2 | 2.3.1 | 3.0.6 | Low |
| DEBT-036 | sonner | 1.7.4 | 2.0.7 | Low |

### Other

- **DEBT-004:** TODO - Integrate push notification service (linked to G32-notification-system)
- **DEBT-035:** localhost fallbacks acceptable for development
- **DEBT-039:** Profile.tsx is 574 lines - could extract components
- **DEBT-040:** 2 @ts-expect-error in test files (acceptable for testing)

---

## Test Coverage Status

### Backend Services (server/src/services/)

| Status | Count | Lines |
|--------|-------|-------|
| Tested | 24 | ~9,000 |
| Untested | 20 | ~7,500 |
| **Total** | **44** | **~16,500** |

**Tested Services:**
quest, dungeon, boss, narrative, shadow, xp, leaderboard, streak, level, debuff, title, weekly-quest, rotating-quest, bonus-quest, guild, accountability, notification, return-protocol, raid, hard-mode, archive, psychology, daily-log, progression

**Test Files:**
```
server/src/services/
├── quest.test.ts        (19 tests - evaluateRequirement)
├── dungeon.test.ts      (7 tests)
├── boss.test.ts         (21 tests)
├── narrative.test.ts    (28 tests - interpolate)
├── shadow.test.ts       (24 tests)
├── xp.test.ts
├── leaderboard.test.ts
├── streak.test.ts
├── level.test.ts
├── debuff.test.ts
├── title.test.ts
├── weekly-quest.test.ts
├── rotating-quest.test.ts
├── bonus-quest.test.ts
├── guild.test.ts
├── accountability.test.ts
├── notification.test.ts
├── return-protocol.test.ts
├── raid.test.ts
├── hard-mode.test.ts
├── archive.test.ts
├── psychology.test.ts
├── daily-log.test.ts
└── progression.test.ts
```

### API Routes (server/src/routes/)

| Status | Count |
|--------|-------|
| Tested | 2 (player.ts, quests.ts) |
| Untested | 12 |
| **Total** | **14** |

### Frontend (web/src/)

| Category | Tested | Total |
|----------|--------|-------|
| Hooks | 2 | 26 |
| Components | 3 | ~50 |

**Test Files:**
```
web/src/
├── components/
│   ├── stats/StatCard.test.tsx
│   ├── quest/QuestCard.test.tsx
│   └── system/SystemMessage.test.tsx
└── hooks/
    ├── useDayStatus.test.ts
    └── useQuests.test.ts
```

---

## Dependency Upgrade Path

Recommended upgrade order to minimize breakage:

### Phase 1 - Low Risk (trivial effort)
- `@types/node` 22 -> 25
- `@paralleldrive/cuid2` 2 -> 3
- `drizzle-orm` 0.36 -> 0.45 / `drizzle-kit` 0.28 -> 0.31 (also fixes esbuild vuln)
- `sonner` 1 -> 2

### Phase 2 - Medium Risk (test thoroughly)
- `vite` 5 -> 7 + `@vitejs/plugin-react` 4 -> 5
- `framer-motion` 11 -> 12
- `zod` 3 -> 4

### Phase 3 - High Risk (plan carefully)
- React 19 + `@types/react` + `@types/react-dom` (coordinate together)
- Tailwind CSS 4 (significant config changes)
- react-router-dom 7

---

## Recommendations

### Immediate (This Week)
1. **Fix security vulnerabilities:** Upgrade drizzle-kit to 0.31.8 to fix esbuild vulnerability
2. **Migrate console.log to logger:** Focus on routes/player.ts (32 statements) first

### This Sprint
1. **Split quest.ts service:** Currently 1053 lines with 12 functions - high priority refactor
2. **Add route integration tests:** Focus on notifications, body, onboarding routes
3. **Split routes/player.ts:** 771 lines is too large for a single route module

### Next Sprint
1. **React 19 upgrade:** Plan coordinated upgrade of react, react-dom, @types/react, @types/react-dom
2. **Tailwind v4 migration:** Review migration guide, significant breaking changes expected

### Ongoing
1. **Add service tests incrementally:** 20 services (~7,500 lines) still need coverage
2. **Keep dependencies updated:** 15 outdated packages identified

---

## Recently Resolved

| ID | Title | Resolution |
|----|-------|------------|
| DEBT-002 | server/src/index.ts is 738 lines | Routes split into 14 modules (now 613 lines) |
| DEBT-005 | Mastra AI narrator placeholder | Implemented with Anthropic integration |
| DEBT-006 | Debuff status TODO | Implemented in dashboard |
| DEBT-019 | Debug logging of connection string | Removed sensitive log |
| DEBT-020 | Hardcoded localhost URLs | Acceptable pattern for dev with env var fallbacks |
| DEBT-022 | Zero test coverage | Set up vitest, added 24 service tests, 5 component tests |
| DEBT-023 | dungeon.ts untested | Added dungeon.test.ts with 7 tests |
| DEBT-024 | boss.ts untested | Added boss.test.ts with 21 tests |
| DEBT-025 | quest.ts partially tested | Added quest.test.ts with 19 tests |
| DEBT-026 | narrative.ts tested | Added 28 tests for interpolate |
| DEBT-027 | shadow.ts tested | Added 24 tests |
| DEBT-029 | React components partially tested | Core components tested |
| DEBT-030 | Custom hooks partially tested | Core hooks tested |
| DEBT-032 | 'any' type usage | Confirmed zero 'any' usage |
| DEBT-034 | Service test coverage | 24 test files exist |

---

*Run `/debt-sweep --update` after addressing items to refresh this report.*
