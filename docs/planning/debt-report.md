# Technical Debt Report

Generated: 2026-01-18 10:30 UTC

## Summary

| Severity | Count | Effort Est. |
|----------|-------|-------------|
| Critical | 0     | -           |
| High     | 3     | ~2 days     |
| Medium   | 10    | ~3 days     |
| Low      | 7     | ~6 hours    |

**Total Outstanding:** 20 items
**Total Resolved:** 15 items
**Categories:** Security (1), Complexity (3), Dependencies (11), TODOs (1), Logging (1), Testing (3), Types (1)

---

## Positive Findings

- **No hardcoded credentials** - API keys use environment variables
- **No empty catch blocks** - Error handling is present
- **Only 1 `any` type** - Good TypeScript discipline  
- **No `@ts-ignore`** - Clean type checking (2 `@ts-expect-error` in tests are intentional)
- **Proper auth patterns** - Passwords handled through better-auth library
- **Testing infrastructure established** - 13 test files with 200+ tests

---

## High Priority Items (Fix Soon)

### DEBT-003: quest.ts is 1050 lines (grew from 658)
- **Category:** Complexity
- **Effort:** High
- **Details:** Quest service has grown significantly and handles too many responsibilities
- **Fix:** Split into:
  - `quest-core.ts` - evaluation logic, requirement parsing
  - `quest-daily.ts` - daily quest creation and reset
  - `quest-completion.ts` - completion logic and XP awarding

### DEBT-031: 13 services without test coverage (~4,700 lines)
- **Category:** Testing
- **Effort:** Major
- **Details:** Services lacking tests:
  | Service | Lines | Priority |
  |---------|-------|----------|
  | rotating-quest.ts | 562 | High |
  | leaderboard.ts | 495 | High |
  | xp.ts | 458 | High |
  | season.ts | 445 | Medium |
  | guild.ts | 440 | Medium |
  | title.ts | 423 | Medium |
  | weekly-quest.ts | 408 | Medium |
  | daily-log.ts | 399 | Low |
  | health.ts | 340 | Low |
  | return-protocol.ts | 325 | Low |
  | notification.ts | 295 | Low |
  | debuff.ts | 186 | Low |
  | progression.ts | 375 | Medium |

### DEBT-028: Only 1 of 7 API routes have integration tests
- **Category:** Testing
- **Effort:** High
- **Details:** `player.ts` has tests, but missing for:
  - `quests.ts` (most critical)
  - `health.ts`
  - `content.ts`
  - `guilds.ts`
  - `notifications.ts`
  - `seasons.ts`

---

## Medium Priority Items

### DEBT-001: npm audit vulnerabilities
- **Category:** Security
- **Effort:** Medium
- **Details:** Moderate severity vulnerabilities in:
  - `ai` package (via @mastra/core)
  - `esbuild` (via vite)
  - `vite` dev server
- **Fix:** Some require @mastra/core update; others via `npm audit fix`

### DEBT-007: 168 console statements in production code
- **Category:** Logging
- **Effort:** Medium
- **Details:** Spread across 24 files, including debug logging
- **Fix:** Implement structured logging with pino or winston

### DEBT-008: React 18 to React 19 upgrade
- **Category:** Dependencies
- **Effort:** High
- **Details:** Major framework upgrade available

### DEBT-011: Tailwind CSS 3 to 4 upgrade
- **Category:** Dependencies
- **Effort:** High
- **Details:** Major styling framework upgrade

### DEBT-033: 6 services exceed 500 lines
- **Category:** Complexity
- **Details:**
  - quest.ts: 1050 lines
  - dungeon.ts: 741 lines
  - boss.ts: 711 lines
  - narrative.ts: 595 lines
  - rotating-quest.ts: 562 lines
  - shadow.ts: 560 lines

---

## Low Priority Items

| ID | Item | Category |
|----|------|----------|
| DEBT-004 | TODO: Push notification integration | TODOs |
| DEBT-009 | Vite 5 to 7 upgrade | Dependencies |
| DEBT-010 | Drizzle ORM upgrade | Dependencies |
| DEBT-012 | framer-motion upgrade | Dependencies |
| DEBT-013 | react-router-dom upgrade | Dependencies |
| DEBT-014 | zod 3 to 4 upgrade | Dependencies |
| DEBT-032 | 1 `any` type in Quests.tsx | Types |

---

## Test Coverage Analysis

### Current State

```
Server Tests:
  ├── services/
  │   ├── boss.test.ts        (21 tests)
  │   ├── dungeon.test.ts     (7 tests)
  │   ├── level.test.ts       (tests)
  │   ├── narrative.test.ts   (28 tests)
  │   ├── quest.test.ts       (19 tests)
  │   ├── shadow.test.ts      (24 tests)
  │   └── streak.test.ts      (tests)
  └── routes/
      └── player.test.ts      (15 tests)

Web Tests:
  ├── components/
  │   ├── StatCard.test.tsx   (16 tests)
  │   ├── QuestCard.test.tsx  (21 tests)
  │   └── SystemMessage.test.tsx (10 tests)
  └── hooks/
      ├── useDayStatus.test.ts (20 tests)
      └── useQuests.test.ts   (12 tests)

Total: 13 test files, ~200+ tests
```

### Coverage Gaps

**Backend Services (13 untested, ~4,700 lines):**
- High priority: xp.ts, rotating-quest.ts, leaderboard.ts
- Medium priority: season.ts, guild.ts, title.ts, weekly-quest.ts, progression.ts
- Lower priority: daily-log.ts, health.ts, return-protocol.ts, notification.ts, debuff.ts

**Backend Routes (6 untested):**
- quests.ts, health.ts, content.ts, guilds.ts, notifications.ts, seasons.ts

---

## Dependency Upgrade Path

Recommended upgrade order to minimize breakage:

### Phase 1 - Low Risk (trivial effort)
- `@types/node`
- `@paralleldrive/cuid2`
- `drizzle-orm` / `drizzle-kit`

### Phase 2 - Medium Risk (test thoroughly)
- `vite` + `@vitejs/plugin-react`
- `framer-motion`
- `zod`

### Phase 3 - High Risk (plan carefully)
- React 19 + `@types/react` + `@types/react-dom`
- Tailwind CSS 4
- react-router-dom 7

---

## Recommendations

### Immediate Actions
1. **Add tests for xp.ts** - Core business logic, 458 lines
2. **Add tests for quests route** - Critical API endpoint
3. **Fix the 1 `any` type** - Quick win for type safety

### This Sprint
1. Split `quest.ts` into smaller modules
2. Add tests for rotating-quest.ts and leaderboard.ts
3. Implement structured logging (replace console.*)

### Ongoing
1. Chip away at untested services during feature work
2. Upgrade dependencies incrementally, starting Phase 1
3. Add route tests as you modify routes

### Backlog
1. Push notification integration (DEBT-004)
2. Major framework upgrades (React 19, Tailwind 4)

---

## Resolved Since Last Sweep

| ID | Item | Resolution |
|----|------|------------|
| DEBT-002 | index.ts 738 lines | Split into route modules (now 600 lines) |
| DEBT-005 | Mastra AI narrator TODO | Implemented with Anthropic |
| DEBT-006 | Debuff status TODO | Implemented in dashboard |
| DEBT-019 | Connection string logging | Removed |
| DEBT-020 | Hardcoded localhost | Acceptable pattern for dev |
| DEBT-022 | Zero test coverage | 13 test files, 200+ tests added |
| DEBT-023-27 | Core service tests | Added tests for dungeon, boss, quest, narrative, shadow |
| DEBT-029-30 | Component/hook tests | Added core component and hook tests |

---

*Run `/debt-sweep --update` after addressing items to refresh this report.*
