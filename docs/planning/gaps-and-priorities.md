# Gaps Analysis & Priority Tasks

**Generated:** 2026-01-18

This document identifies gaps between documentation/design and current implementation, with actionable tasks to close each gap.

---

## Critical Gaps (Blocking Core Functionality)

### Gap 1: Dashboard Not Connected to Backend

**Current State:** Dashboard shows hardcoded quest data, not fetching from API.

**Impact:** Users cannot see real quest progress or complete quests.

**Tasks:**
| ID | Task | Complexity | Priority |
|----|------|------------|----------|
| G1.1 | Create `useQuests` hook that fetches from `/api/quests` | Low | P0 |
| G1.2 | Create `useLevelProgress` hook for `/api/player/level-progress` | Low | P0 |
| G1.3 | Update Dashboard to use real quest data from hooks | Medium | P0 |
| G1.4 | Display real XP progress bar with actual values | Low | P0 |
| G1.5 | Add loading and error states to Dashboard | Low | P0 |

---

### Gap 2: No Quest Completion UI

**Current State:** Backend has `/api/quests/:id/complete` endpoint, but no frontend to submit data.

**Impact:** Users cannot mark quests as complete or submit progress.

**Tasks:**
| ID | Task | Complexity | Priority |
|----|------|------------|----------|
| G2.1 | Build `QuestCard` component with progress display | Medium | P0 |
| G2.2 | Build `QuestInput` modal for submitting completion data | Medium | P0 |
| G2.3 | Add numeric input for steps/workout_minutes/protein_grams | Low | P0 |
| G2.4 | Add boolean toggle for alcohol-free quest | Low | P0 |
| G2.5 | Show XP reward animation on quest completion | Medium | P1 |
| G2.6 | Show level-up celebration when triggered | Medium | P1 |

---

### Gap 3: Streak System Not Implemented

**Current State:** User model has streak fields, but no service calculates/updates them.

**Impact:** Streak bonuses not applied, streak UI shows static values.

**Tasks:**
| ID | Task | Complexity | Priority |
|----|------|------------|----------|
| G3.1 | Create `streak.service.ts` with `updateStreak` function | Medium | P1 |
| G3.2 | Implement streak calculation logic (consecutive perfect days) | Medium | P1 |
| G3.3 | Add streak bonus modifier to XP awards (+10%/+15%/+25%) | Low | P1 |
| G3.4 | Create `/api/player/streak` GET endpoint | Low | P1 |
| G3.5 | Update daily log processing to trigger streak updates | Medium | P1 |
| G3.6 | Build `StreakDisplay` component with fire animation | Medium | P1 |

---

## High Priority Gaps

### Gap 4: No Database Migrations

**Current State:** Schema defined in code but no migration files for deployment.

**Impact:** Cannot safely deploy schema changes or set up new environments.

**Tasks:**
| ID | Task | Complexity | Priority |
|----|------|------------|----------|
| G4.1 | Configure Drizzle Kit for migrations | Low | P1 |
| G4.2 | Generate initial migration from current schema | Low | P1 |
| G4.3 | Add migration scripts to package.json | Low | P1 |
| G4.4 | Document migration workflow in README | Low | P2 |

---

### Gap 5: No XP Timeline UI

**Current State:** Backend has `/api/xp/timeline` and `/api/xp/:id/breakdown`, no frontend.

**Impact:** Users cannot see XP history or understand how XP was calculated.

**Tasks:**
| ID | Task | Complexity | Priority |
|----|------|------------|----------|
| G5.1 | Create `useXPTimeline` hook | Low | P1 |
| G5.2 | Build `XPTimelineItem` component | Medium | P1 |
| G5.3 | Build `XPTimeline` component with infinite scroll | Medium | P1 |
| G5.4 | Build `XPBreakdownModal` showing modifiers | Medium | P2 |
| G5.5 | Add XP timeline section to Dashboard or Stats page | Low | P1 |

---

### Gap 6: Missing Layout Components

**Current State:** No AppShell, Navbar, or consistent page layout.

**Impact:** No navigation between pages, inconsistent UI structure.

**Tasks:**
| ID | Task | Complexity | Priority |
|----|------|------------|----------|
| G6.1 | Build `AppShell` component with header/main/footer slots | Medium | P1 |
| G6.2 | Build `Navbar` component with navigation links | Medium | P1 |
| G6.3 | Add navigation items: Dashboard, Quests, Stats, Profile | Low | P1 |
| G6.4 | Add mobile-responsive hamburger menu | Medium | P2 |
| G6.5 | Show player level/XP summary in navbar | Low | P2 |

---

## Medium Priority Gaps

### Gap 7: Stats Page Not Built

**Current State:** Route exists but redirects to Dashboard.

**Impact:** Users cannot see detailed stat breakdowns.

**Tasks:**
| ID | Task | Complexity | Priority |
|----|------|------------|----------|
| G7.1 | Create `/api/player/stats` endpoint with full breakdown | Low | P2 |
| G7.2 | Build `StatHexagon` component for STR/AGI/VIT/DISC | High | P2 |
| G7.3 | Build Stats page with stat hexagon and history | Medium | P2 |
| G7.4 | Show stat bonuses from completed quests | Low | P2 |

---

### Gap 8: Profile Page Not Built

**Current State:** Route exists but shows Dashboard.

**Impact:** Users cannot manage settings or view account info.

**Tasks:**
| ID | Task | Complexity | Priority |
|----|------|------------|----------|
| G8.1 | Build Profile page layout | Medium | P2 |
| G8.2 | Add timezone selector | Low | P2 |
| G8.3 | Add health source configuration placeholder | Low | P2 |
| G8.4 | Add logout confirmation | Low | P2 |
| G8.5 | Show account creation date and total days | Low | P3 |

---

### Gap 9: System Message Component Missing

**Current State:** CSS styles exist, no reusable component.

**Impact:** Narrative content cannot be displayed consistently.

**Tasks:**
| ID | Task | Complexity | Priority |
|----|------|------------|----------|
| G9.1 | Build `SystemMessage` component with typewriter effect | Medium | P2 |
| G9.2 | Build `TypewriterText` component using CSS animation | Medium | P2 |
| G9.3 | Add System message to daily login (hardcoded initially) | Low | P2 |

---

### Gap 10: No API Client Abstraction

**Current State:** Auth uses better-auth client, but no general API client.

**Impact:** Each hook must handle fetch logic independently.

**Tasks:**
| ID | Task | Complexity | Priority |
|----|------|------------|----------|
| G10.1 | Create `api.ts` client with base URL and auth headers | Low | P2 |
| G10.2 | Add typed fetch helpers (`api.get`, `api.post`) | Low | P2 |
| G10.3 | Migrate hooks to use shared API client | Low | P2 |

---

## Lower Priority Gaps

### Gap 11: No Error Boundaries

**Current State:** No React error boundaries for graceful failure.

**Tasks:**
| ID | Task | Complexity | Priority |
|----|------|------------|----------|
| G11.1 | Create `ErrorBoundary` component | Low | P3 |
| G11.2 | Create `ErrorFallback` UI with retry button | Low | P3 |
| G11.3 | Wrap main App with ErrorBoundary | Low | P3 |

---

### Gap 12: No Toast Notifications

**Current State:** No user feedback for actions (quest complete, errors).

**Tasks:**
| ID | Task | Complexity | Priority |
|----|------|------------|----------|
| G12.1 | Install toast library (react-hot-toast or sonner) | Low | P3 |
| G12.2 | Create toast provider wrapper | Low | P3 |
| G12.3 | Add success toasts for quest completion | Low | P3 |
| G12.4 | Add error toasts for API failures | Low | P3 |

---

## Summary

| Priority | Gap Count | Task Count |
|----------|-----------|------------|
| P0 (Critical) | 2 | 11 |
| P1 (High) | 4 | 19 |
| P2 (Medium) | 5 | 16 |
| P3 (Lower) | 2 | 7 |
| **Total** | **13** | **53** |

---

## Recommended Sprint Plan

### Sprint A: Core Loop (P0 + Critical P1)
Focus: Make the app actually functional for basic quest tracking.

1. G1.1-G1.5: Connect Dashboard to backend
2. G2.1-G2.4: Quest completion UI
3. G6.1-G6.3: Basic navigation

**Deliverable:** Users can log in, see real quests, complete them, earn XP.

### Sprint B: Engagement Features (P1)
Focus: Add features that make the app engaging.

1. G3.1-G3.6: Streak tracking
2. G5.1-G5.3, G5.5: XP Timeline
3. G2.5-G2.6: Completion animations

**Deliverable:** Users see streaks, XP history, and satisfying feedback.

### Sprint C: Polish (P2)
Focus: Round out the experience.

1. G4.1-G4.3: Database migrations
2. G7.1-G7.3: Stats page
3. G8.1-G8.4: Profile page
4. G9.1-G9.3: System messages
5. G10.1-G10.3: API client

**Deliverable:** Complete web MVP with all core pages.

---

## Ideation Loop - 2026-01-18

### Analysis Summary
- Documentation files scanned: 28
- Source files analyzed: 22
- TODO comments found: 1
- Test files found: 0 (in project, excluding node_modules)

### New Gaps Identified

#### Critical Gaps (blocking features)
- **Gap G11: Debuff System** - No service to trigger/evaluate debuffs (documented in streaks-debuffs.md)
- **Gap G17: Health Sync API** - No endpoints for mobile health data sync (documented in data-input.md)

#### Missing Features (documented but not previously tasked)
- **Gap G12: Weekly Quests** - Weekly quest tracking not implemented (from quests.md)
- **Gap G13: Title System** - Title conditions and passives not implemented (from titles.md)
- **Gap G14: Boss System** - Boss fights not implemented (from bosses.md)
- **Gap G15: Dungeon System** - Dungeons not implemented (from dungeons.md)
- **Gap G16: Season System** - Seasons not implemented (from seasons.md)

#### Code Quality
- **Gap G18: Timezone Support** - TODO in quest.ts:29 for proper timezone handling

### Tasks Generated
| ID | Title | Priority | Domain |
|----|-------|----------|--------|
| G11-debuff-system | Implement Debuff System | P1 | backend |
| G12-weekly-quests | Implement Weekly Quests System | P1 | backend |
| G13-title-system | Implement Title System | P1 | backend |
| G14-boss-system | Implement Boss Fight System | P2 | backend |
| G15-dungeon-system | Implement Dungeon System | P2 | backend |
| G16-season-system | Implement Season System | P2 | backend |
| G17-health-sync | Implement Health Data Sync API | P1 | backend/mobile |
| G18-timezone-support | Implement Proper Timezone Support | P2 | backend |

### Updated Task Pipeline

| Metric | Before | After |
|--------|--------|-------|
| Total Tasks | 10 | 18 |
| Completed | 2 | 2 |
| Available (P0) | 0 | 0 |
| Available (P1) | 4 | 8 |
| Available (P2) | 4 | 8 |

### Recommended Next Actions

1. **Immediate (P1):**
   - G3-streak-system (unlocks G11-debuff-system and G13-title-system)
   - G17-health-sync (critical for mobile app)
   - G12-weekly-quests (extends quest system)

2. **Short-term (P1):**
   - G11-debuff-system (after streak system)
   - G13-title-system (after streak system)
   - G6-layout-navigation (frontend polish)

3. **Medium-term (P2):**
   - G14-boss-system, G15-dungeon-system, G16-season-system (game features)
   - G18-timezone-support (code quality)
   - Frontend polish tasks (G7-G10)

---

## Ideation Loop - 2026-01-18 (Evening)

### Analysis Summary
- Documentation files scanned: 45
- Source files analyzed: 75
- TODO comments found: 0 (all resolved)
- Test files found: 0 (needs infrastructure)

### New Gaps Identified

#### Social Features (documented but not tasked)
- **Gap G27: Guild System** - Guild management, challenges, rankings (from social.md)
- **Gap G28: Accountability Partners** - 1-on-1 accountability (from social.md)
- **Gap G33: Raid Bosses** - Collaborative boss fights (from social.md)

#### Quest Variety (documented but not tasked)
- **Gap G29: Rotating Quests** - Daily variety quest pool (from quest-variety.md)
- **Gap G30: Bonus Quests** - Optional high-difficulty challenges (from quest-variety.md)

#### Daily Rhythm (documented but not tasked)
- **Gap G31: Daily Reconciliation** - End-of-day confirmation flow (from daily-rhythm.md)
- **Gap G32: Notification System** - Opt-in push notifications (from daily-rhythm.md)

#### Code Quality
- **Gap G34: Error Boundaries** - React error handling (from gaps-and-priorities.md)
- **Gap G35: Toast Notifications** - User feedback system (from gaps-and-priorities.md)
- **Gap G36: Test Infrastructure** - No tests exist in codebase

### Tasks Generated
| ID | Title | Priority | Domain |
|----|-------|----------|--------|
| G27-guild-system | Implement Guild System | P2 | backend/social |
| G28-accountability-partners | Implement Accountability Partners | P2 | backend/social |
| G29-rotating-quests | Implement Rotating Quest System | P1 | backend/quests |
| G30-bonus-quests | Implement Bonus Quest System | P1 | backend/quests |
| G31-daily-reconciliation | Implement Daily Reconciliation Flow | P1 | full-stack |
| G32-notification-system | Implement Notification System | P2 | full-stack |
| G33-raid-bosses | Implement Raid Boss System | P3 | backend/social |
| G34-error-boundaries | Implement Error Boundaries | P2 | frontend |
| G35-toast-notifications | Implement Toast Notifications | P2 | frontend |
| G36-test-infrastructure | Set Up Test Infrastructure | P1 | infra |

### Updated Task Pipeline

| Metric | Before | After |
|--------|--------|-------|
| Total Tasks | 26 | 36 |
| Completed | 22 | 22 |
| In Progress | 3 | 3 |
| Available | 1 | 11 |

### Recommended Next Actions

1. **Immediate (P1):**
   - G29-rotating-quests (extends quest variety)
   - G31-daily-reconciliation (completes daily rhythm)
   - G36-test-infrastructure (enables quality)

2. **Short-term (P1/P2):**
   - G30-bonus-quests (after rotating quests)
   - G26-return-protocol (player recovery)
   - G34-error-boundaries, G35-toast-notifications (frontend polish)

3. **Medium-term (P2/P3):**
   - G27-guild-system, G28-accountability-partners (social MVP)
   - G32-notification-system (engagement)
   - G33-raid-bosses (after guild system)

---

## Ideation Loop - 2026-01-18 (Late Night)

### Analysis Summary
- Documentation files scanned: 28
- Source files analyzed: 85
- TODO comments found: 1 (notification.ts:291)
- Test files found: 13 (7 backend, 6 frontend)

### New Gaps Identified

#### Frontend Pages (documented but no UI)
- **Gap G40: Seasonal Quests UI** - Seasonal quest slot documented in quest-variety.md, not in dashboard
- **Gap G41: Title Collection Page** - Full title management from titles.md
- **Gap G42: Dungeon Browser** - Dedicated dungeon page from dungeons.md
- **Gap G43: Guild Management UI** - Backend exists, no frontend page

#### Infrastructure & Quality
- **Gap G44: Push Notifications** - TODO in notification.ts for actual push delivery
- **Gap G45: Archive/Soft Reset** - Long absence feature from failure-recovery.md
- **Gap G46: Service Test Coverage** - 13 services lack unit tests
- **Gap G47: Weekly Summary** - Monday recap from daily-rhythm.md

### Tasks Generated
| ID | Title | Priority | Domain |
|----|-------|----------|--------|
| G40-seasonal-quests-ui | Seasonal Quests UI | P1 | frontend |
| G41-title-collection-page | Title Collection Page | P2 | frontend |
| G42-dungeon-browser | Dungeon Browser Page | P2 | frontend |
| G43-guild-ui | Guild Management UI | P2 | frontend |
| G44-push-notifications | Push Notification Integration | P2 | full-stack |
| G45-archive-soft-reset | Archive & Soft Reset Feature | P3 | full-stack |
| G46-service-test-coverage | Service Test Coverage | P1 | backend |
| G47-weekly-summary | Weekly Summary View | P2 | full-stack |

### Updated Task Pipeline

| Metric | Before | After |
|--------|--------|-------|
| Total Tasks | 39 | 47 |
| Completed | 33 | 33 |
| Claimed/In Progress | 6 | 0 |
| Available | 0 | 14 |

### Recommended Next Actions

1. **Immediate (P1):**
   - G40-seasonal-quests-ui (extends quest board)
   - G46-service-test-coverage (improves reliability)
   - G30-bonus-quests (completes quest variety)

2. **Short-term (P2):**
   - G41-title-collection-page (profile enhancement)
   - G42-dungeon-browser (dedicated game page)
   - G47-weekly-summary (daily rhythm completion)
   - G44-push-notifications (engagement)

3. **Medium-term (P2/P3):**
   - G43-guild-ui (social feature UI)
   - G45-archive-soft-reset (long-term retention)
   - G39-hard-mode (endgame content)

---

## Ideation: Realistic Progression System - 2026-01-18

### Source
User topic: "How can we provide a realistic leveling system and stats system. User should answer questions about their data and AI chats about psychology. Stats can be equated to real-world feats. Weight loss by calorie deficit (3500 cal = 1 lb) should be factored in. XP tied to quest completion."

### Design Document
- `docs/game-systems/realistic-progression.md` (created)

### Core Concepts

1. **Baseline Assessment**: Onboarding questionnaire collecting physical baselines (push-ups, steps, weight) and lifestyle data (sleep, protein, alcohol)

2. **Psychology Profile**: AI-powered conversation to understand motivation type, barriers, and accountability preferences

3. **Grounded Stats**: STR, AGI, VIT, DISC mapped to real-world benchmarks
   - STR 25 = "20-30 push-ups"
   - AGI 40 = "5K runner (<30 min)"
   - DISC 60 = "90+ day streaks"

4. **Body Composition Tracking**: Opt-in weight/calorie tracking where 3500 cal deficit = 1 lb = 100 XP

5. **Adaptive Targets**: Quest targets adjust based on baseline and performance history

6. **Level Meaning**: Levels correspond to real fitness certifications (Level 20 = Military fitness test level)

### Tasks Generated
- **G48-baseline-assessment** (P0, backend) - Core assessment schema and API
- **G49-psychology-profile** (P1, backend/ai) - AI psychology conversation
- **G50-enhanced-onboarding-ui** (P1, frontend) - Enhanced onboarding with forms
- **G51-body-composition-tracking** (P1, backend) - Weight/calorie tracking
- **G52-realistic-stat-calculation** (P1, backend) - Grounded stat formulas
- **G53-adaptive-quest-targets** (P1, backend) - Personalized quest targets
- **G54-stats-milestones-ui** (P2, frontend) - Stats with real-world context

### Dependencies
```
G25-onboarding-flow ─┬─► G48-baseline-assessment ─┬─► G50-enhanced-onboarding-ui
                     │                            ├─► G51-body-composition-tracking ─┐
G22-mastra-narrator ─┴─► G49-psychology-profile ──┤                                  │
                                                  ├─► G52-realistic-stat-calculation ─┼─► G54-stats-milestones-ui
                                                  └─► G53-adaptive-quest-targets      │
                                                                                      └───┘
```

### Notes
- G48 (Baseline Assessment) is P0 as it's foundational for the other tasks
- Psychology profile requires Mastra agent which is already completed (G22)
- Body composition tracking is opt-in to respect users who don't want weight focus
- Stats should never decrease rapidly (slow decay after 14+ days inactivity)
- Consider periodic re-assessment prompts (every 90 days)

---

## Retrospection Analysis - 2026-01-18

### Summary
Comprehensive analysis of current state to identify gaps for a first-class product.

### Current State
| Metric | Value |
|--------|-------|
| Total Tasks | 63 |
| Completed | 44 (70%) |
| In Progress | 3 (5%) |
| Available | 16 (25%) |

### What's Been Built

**Backend (Comprehensive)**
- Core game loop: Quests, XP, Levels, Streaks
- Advanced systems: Bosses, Dungeons, Titles, Seasons
- Social features: Guilds, Raids, Shadows, Accountability
- AI integration: Mastra narrator agent
- Health sync API ready for mobile client

**Frontend (Web)**
- All core pages: Dashboard, Quests, Stats, Profile
- Game pages: Dungeons, Titles, Leaderboard
- UI infrastructure: Error boundaries, Toast notifications

**Testing**
- 21 test files covering major services
- Vitest infrastructure in place

### Critical Gaps Identified

**P0 - Product Blockers**

| Gap | Status | Impact |
|-----|--------|--------|
| Mobile App | 0% built | Fitness app requires mobile for HealthKit |
| HealthKit Integration | 0% built | Core data source for quests |

**P1 - Production Requirements**

| Gap | Status | Impact |
|-----|--------|--------|
| Nutrition/LogMeal | 0% built | Protein quest depends on this |
| CI/CD | Not started | Can't deploy to production |
| API Security | Basic only | Not production-ready |
| Data Privacy | Missing | GDPR non-compliance |

**P2 - Quality Improvements**

| Gap | Status | Impact |
|-----|--------|--------|
| Observability | None | Can't debug production issues |
| Animations | Basic | Gamification feels incomplete |

### Tasks Generated

**Mobile Foundation (P0)**
- G55-mobile-app-foundation - Initialize Expo project
- G56-healthkit-integration - HealthKit data sync
- G57-mobile-quest-ui - Quest board for mobile

**Backend Completeness (P1)**
- G58-nutrition-backend - LogMeal integration

**Production Infrastructure (P1)**
- G59-cicd-deployment - GitHub Actions + hosting
- G60-api-security - Rate limiting, validation
- G61-data-privacy - Export, deletion

**Quality (P2)**
- G62-observability - Sentry, logging
- G63-level-up-animations - Polish

### Priority Recommendations

**Immediate (This Week)**
1. G55 → G56 → G57: Mobile foundation is critical path
2. G59: CI/CD enables iterative deployment
3. G60: Security before production

**Short Term (Next 2 Weeks)**
4. G58: Nutrition completes quest system
5. G61: Privacy compliance
6. G48: Baseline assessment for personalization

**Medium Term**
7. G62: Observability for production
8. G63: Animation polish
9. G49-G54: Realistic progression system

### Dependency Graph for New Tasks

```
G55-mobile-foundation ─┬─► G56-healthkit ─┬─► G57-mobile-quest-ui
                       │                  │
                       └──────────────────┘

G59-cicd-deployment (independent)
G60-api-security (independent)
G61-data-privacy (independent)
G58-nutrition-backend (independent)
G62-observability (independent)
G63-animations (independent)
```

### Code Quality Notes

**TODOs Found (5)**
- player.ts:339 - Season service integration
- raid.ts:13 - Phase progress tracking
- hard-mode.ts:154 - Mid-dungeon check
- notification.ts:291 - Push integration
- leaderboard.test.ts:107 - Privacy format

**Services Missing Tests**
- guild, raid, notification, hard-mode, archive, season, return-protocol

### Conclusion

The web app and backend are feature-complete for MVP. The critical gap is **mobile** - a fitness app without HealthKit integration is not viable. Priority should be:

1. Mobile app foundation + HealthKit (P0)
2. Production infrastructure (P1)
3. Nutrition tracking (P1)
4. Polish and observability (P2)

---

## Ideation: Apple HealthKit Integration - 2026-01-18

### Source
User topic: "Apple HealthKit integration - get stats into DB"

### Design Document
- `docs/mobile/healthkit-integration.md` (created)

### Core Goal
**Primary:** Get health stats (steps, workouts, sleep, exercise minutes) from Apple Health into the database automatically.

### Current State Analysis

| Component | Status | Notes |
|-----------|--------|-------|
| Backend `health_snapshots` table | ✅ Complete | Full schema with verification levels |
| Backend `workout_records` table | ✅ Complete | Individual workout tracking |
| Backend `/api/health/sync` | ✅ Complete | Receives data, triggers quest evaluation |
| Backend `/api/health/today` | ✅ Complete | Returns today's snapshot |
| Backend auto-quest evaluation | ✅ Complete | Quests auto-complete from health data |
| Mobile app foundation | ✅ Complete | G55 built Expo project |
| HealthKit library | ❌ Not installed | Need `@kingstinct/react-native-healthkit` |
| HealthKit permissions | ❌ Not configured | Need config plugin + entitlements |
| Sync service | ❌ Not implemented | Need query + POST logic |
| Background sync | ❌ Not implemented | Need background fetch |

### Technical Approach

**Library:** `@kingstinct/react-native-healthkit`
- Expo config plugin support
- TypeScript types
- Hooks + imperative methods
- Background delivery support

**HealthKit Data Types:**
```typescript
const HEALTH_TYPES = {
  steps: 'HKQuantityTypeIdentifierStepCount',
  activeCalories: 'HKQuantityTypeIdentifierActiveEnergyBurned',
  exerciseMinutes: 'HKQuantityTypeIdentifierAppleExerciseTime',
  sleepAnalysis: 'HKCategoryTypeIdentifierSleepAnalysis',
  workouts: 'HKWorkoutType',
}
```

**Sync Strategy:**
1. Foreground sync on app open
2. Pull-to-refresh manual sync
3. Background sync every 15-30 minutes
4. Quest auto-completion on each sync

### Tasks Generated

| ID | Title | Priority | Complexity | Dependencies |
|----|-------|----------|------------|--------------|
| G56-healthkit-integration | HealthKit Core Setup | P0 | high | G55-mobile-app-foundation |
| G64-healthkit-permissions | HealthKit Permissions Screen | P0 | medium | G56-healthkit-integration |
| G65-healthkit-sync-service | HealthKit Sync Service | P0 | high | G56-healthkit-integration |
| G66-healthkit-background-sync | HealthKit Background Sync | P1 | medium | G65-healthkit-sync-service |
| G67-health-sync-ui | Health Sync UI Components | P1 | medium | G65-healthkit-sync-service |

### Dependency Graph

```
G55-mobile-app-foundation (✅ Complete)
         │
         ▼
G56-healthkit-integration (P0 - Install library, config)
         │
    ┌────┴────┐
    ▼         ▼
G64-perms   G65-sync-service (P0 - Core data flow)
            │
       ┌────┴────┐
       ▼         ▼
G66-background  G67-sync-ui (P1 - Polish)
```

### Implementation Order (Recommended)

**Phase 1: Core Integration (P0)**
1. **G56**: Install library, configure Expo plugin, set up entitlements
2. **G65**: Build sync service - query HealthKit, POST to backend
3. **G64**: Permissions screen in onboarding flow

**Phase 2: Polish (P1)**
4. **G67**: Sync status UI, pull-to-refresh
5. **G66**: Background sync for automatic updates

### Notes

- **Physical device required** - HealthKit cannot be tested in simulator
- **EAS Build required** - Native HealthKit module needs real iOS build
- **Backend is ready** - No backend work needed, API already exists
- **Quest auto-completion** - Works automatically once sync is posting data
- **External ID deduplication** - HealthKit workout UUIDs prevent duplicates

---

## Ideation: Nutrition Tracking with Open Source - 2026-01-18

### Source
User topic: "Nutrition tracking - get stats into DB using open source scanning"

### Design Document
- `docs/mobile/nutrition-tracking.md` (created)

### Core Goal
**Primary:** Get nutrition data (calories, protein, carbs, fat) into the database with minimal friction using open-source barcode scanning.

### Current State Analysis

| Component | Status | Notes |
|-----------|--------|-------|
| Database schema (`meal_logs`, `daily_nutrition`) | ✅ Complete | Full schema ready |
| Nutrition service | ❌ Not implemented | G58 task exists |
| Nutrition routes | ❌ Not implemented | Need CRUD endpoints |
| Barcode scanner | ❌ Not implemented | Need expo-camera |
| Food logging UI | ❌ Not implemented | Need mobile screens |

### Open Source Solution: Open Food Facts

**Why Open Food Facts?**
- **License:** ODbL (fully open, free forever)
- **API:** Free, no API key needed
- **Coverage:** 3M+ products from 180+ countries
- **Data:** Calories, protein, carbs, fat, ingredients, images

**API Endpoint:**
```
GET https://world.openfoodfacts.org/api/v2/product/{barcode}
    ?fields=product_name,brands,nutrition_grades,nutriments,image_url
```

**Alternative Considered:**
- LogMeal (photo recognition) - Paid, P2 feature
- Nutritionix - Paid API
- OpenNutrition - Also open, good for gaps

### Technical Approach

**Barcode Scanning:** `expo-camera` (built-in SDK 51+)
- Supports EAN-13, EAN-8, UPC-A, UPC-E
- No additional dependencies needed

**Data Flow:**
1. User scans barcode with expo-camera
2. Mobile calls `GET /api/nutrition/barcode/:code`
3. Backend fetches from Open Food Facts (with caching)
4. User confirms serving size and logs
5. Backend aggregates daily nutrition
6. Protein quest auto-evaluates

### Input Methods (Priority)

| Method | Priority | UX | Accuracy |
|--------|----------|-----|----------|
| Barcode scan | P0 | Fast (2 taps) | High |
| Quick-add buttons | P0 | Fastest (1 tap) | Medium |
| Search by name | P1 | Medium (3+ taps) | High |
| Manual entry | P1 | Slow | User-dependent |
| Photo recognition | P2 | Medium | Varies |

### Tasks Generated

| ID | Title | Priority | Complexity | Dependencies |
|----|-------|----------|------------|--------------|
| G58-nutrition-backend | Nutrition Backend (updated) | P0 | high | None |
| G68-barcode-scanner | Mobile Barcode Scanner | P0 | medium | G58 |
| G69-food-logging-ui | Food Logging UI | P0 | medium | G58, G68 |
| G70-quick-add-presets | Quick-Add Presets System | P1 | medium | G69 |

### Dependency Graph

```
G58-nutrition-backend (P0 - Backend + Open Food Facts)
         │
    ┌────┴────┐
    ▼         ▼
G68-barcode   (other routes)
    │
    ▼
G69-food-logging-ui (P0 - Main nutrition screen)
    │
    ▼
G70-quick-add-presets (P1 - Saved foods)
```

### Implementation Order (Recommended)

**Phase 1: Core (P0)**
1. **G58**: Nutrition service + Open Food Facts client + routes
2. **G68**: Barcode scanner with expo-camera
3. **G69**: Food logging UI with daily summary

**Phase 2: Enhancement (P1)**
4. **G70**: Quick-add presets (save from scans, custom foods)

### Notes

- **No API key needed** - Open Food Facts is fully public
- **Backend caching** - Cache barcode lookups to reduce API calls
- **Offline support** - Cache recent scans locally for offline logging
- **Quest integration** - Protein quest auto-completes when goal met
- **Schema ready** - meal_logs and daily_nutrition tables already exist

---

## Ideation Loop - 2026-01-18 (10-Cycle Analysis)

### Analysis Summary
Multi-source analysis across 10 cycles:

| Cycle | Focus | Sources Analyzed |
|-------|-------|------------------|
| 1 | Documentation vs Implementation | 94 doc files, social.md, daily-rhythm.md |
| 2 | TODO/FIXME Analysis | 463 error handling patterns across 58 files |
| 3 | Test Coverage | 49 services, 16 test files (33% coverage) |
| 4 | Mobile Completeness | 15 mobile files, 3 components |
| 5 | API Validation | 15 route files, 1 with Zod validation |
| 6 | Frontend Features | 11 pages, 53 components |
| 7 | Security Analysis | Rate limiting, input validation patterns |
| 8 | User Experience | Daily rhythm, evening mode, quiet hours |
| 9 | Content & Narrative | ~200 content items documented, partial seeding |
| 10 | Integration | HealthKit (iOS only), no Android, no E2E tests |

### New Gaps Identified

#### P0 - Critical (Mobile)
- **Gap G71: Mobile Dashboard** - No dashboard screen in mobile app
- **Gap G73: Mobile Navigation** - No navigation structure

#### P1 - Important
- **Gap G77: API Input Validation** - Only 1/15 routes have Zod validation
- **Gap G80: Extended Test Coverage** - 20+ services lack unit tests
- **Gap G82: Narrative Content** - P0/P1 content items not fully seeded
- **Gap G83: Android Health Connect** - No Android health integration

#### P2 - Quality
- **Gap G74: Social Feed** - Documented in social.md, not implemented
- **Gap G75: Accountability UI** - Backend exists, no UI
- **Gap G76: Evening Mode** - Time-based UI not implemented
- **Gap G78: Hydration Tracking** - Rotating quest needs dedicated UI
- **Gap G79: Meditation Tracking** - Rotating quest needs timer/UI
- **Gap G81: Timezone Detection UI** - No prompt when timezone changes
- **Gap G84: E2E Testing** - No end-to-end test suite
- **Gap G85: Quiet Hours** - Night mode not implemented

### Tasks Generated

| ID | Title | Priority | Domain |
|----|-------|----------|--------|
| G71-mobile-dashboard | Mobile Dashboard Screen | P0 | mobile |
| G72-mobile-profile | Mobile Profile & Settings | P1 | mobile |
| G73-mobile-navigation | Mobile App Navigation | P0 | mobile |
| G74-social-feed | Social Activity Feed | P2 | full-stack |
| G75-accountability-ui | Accountability Partners UI | P2 | frontend |
| G76-evening-mode | Evening Mode UI | P2 | frontend |
| G77-api-input-validation | API Input Validation | P1 | backend |
| G78-hydration-tracking | Hydration Tracking UI | P2 | full-stack |
| G79-meditation-tracking | Meditation Tracking | P2 | full-stack |
| G80-extended-test-coverage | Extended Test Coverage | P1 | testing |
| G81-timezone-detection-ui | Timezone Detection UI | P2 | frontend |
| G82-narrative-content-expansion | Narrative Content Expansion | P1 | content |
| G83-android-health-connect | Android Health Connect | P1 | mobile |
| G84-e2e-testing | End-to-End Test Suite | P2 | testing |
| G85-quiet-hours | Quiet Hours Mode | P2 | frontend |

### Updated Task Pipeline

| Metric | Before | After |
|--------|--------|-------|
| Total Tasks | 70 | 85 |
| Completed | 58 | 62 |
| In Progress | 4 | 0 |
| Available | 8 | 23 |

### Recommended Next Actions

1. **Immediate (P0):**
   - G71-mobile-dashboard (mobile MVP)
   - G73-mobile-navigation (enables other mobile screens)
   - G57-mobile-quest-ui (quest input on mobile)

2. **Short-term (P1):**
   - G77-api-input-validation (security)
   - G80-extended-test-coverage (quality)
   - G82-narrative-content-expansion (experience)
   - G83-android-health-connect (platform parity)

3. **Medium-term (P2):**
   - G74-social-feed, G75-accountability-ui (social features)
   - G76-evening-mode, G85-quiet-hours (daily rhythm)
   - G84-e2e-testing (production readiness)

### Key Observations

1. **Mobile is the critical gap** - Foundation exists but screens are minimal
2. **Backend services are mature** - But lack validation and tests
3. **Social features documented but not built** - Backend ready, no UI
4. **Content needs expansion** - Templates exist, seeding incomplete
5. **Android support missing** - iOS HealthKit done, no Health Connect
6. **Daily rhythm partially implemented** - Core flow works, evening/night missing

---

## Ideation: UI/UX Design Vision - 2026-01-18

### Source
User topic: "Making the best UI UX and Design for this game"

### Design Document
- `docs/frontend/ui-design-vision.md` (created)

### Core Vision

Transform the app from functional to unforgettable with a Solo Leveling-inspired "System" aesthetic:

1. **Digital Hologram Aesthetic** - Scanlines, glows, HUD elements, interference effects
2. **Environmental UI States** - Visual shifts based on player state (debuffed, streaking, in combat)
3. **Cinematic Moments** - Key actions become micro-cinematics (level-up, boss defeat)
4. **Cold System Voice** - Typewriter effects, calculated pauses, no cheerful encouragement
5. **Progressive Reveal** - Onboarding "awakens" the interface piece by piece

### Tasks Generated

| ID | Title | Priority | Complexity | Dependencies |
|----|-------|----------|------------|--------------|
| G86-ui-design-system | UI Design System Enhancement | P1 | medium | None |
| G87-environmental-ui-states | Environmental UI States | P2 | high | G86 |
| G88-quest-completion-ceremony | Quest Completion Ceremony | P1 | medium | G86, G63 |
| G89-system-message-enhancement | System Message Enhancement | P1 | medium | G86 |
| G90-onboarding-cinematic | Onboarding Cinematic Experience | P1 | high | G86, G89, G25 |
| G91-stat-visualization-upgrade | Stat Visualization Upgrade | P2 | medium | G86 |

### Dependency Graph

```
G86-ui-design-system (P1 - Foundation)
         │
    ┌────┼────┬────────┬────────────┐
    ▼    ▼    ▼        ▼            ▼
  G87  G88  G89      G91          (others)
  env  quest system  stats
        │    │
        │    ▼
        └──► G90
             onboarding
```

### Implementation Order (Recommended)

**Phase 1: Foundation (P1)**
1. **G86**: Extended Tailwind config, animations, motion presets
2. **G89**: Enhanced typewriter, message variants, formatting

**Phase 2: Key Experiences (P1)**
3. **G88**: Quest completion ceremony, XP floaters, combos
4. **G90**: Cinematic onboarding sequence

**Phase 3: Polish (P2)**
5. **G87**: Environmental UI states based on player status
6. **G91**: Enhanced stat radar with history and comparisons

### Updated Task Pipeline

| Metric | Before | After |
|--------|--------|-------|
| Total Tasks | 85 | 91 |
| Available | 23 | 29 |
| P1 Tasks | 12 | 16 |
| P2 Tasks | 11 | 13 |

### Notes

- G86 (Design System) is foundation for all other UI tasks
- G88 (Quest Ceremony) depends on G63 (Level-Up Animations) which is complete
- G90 (Onboarding) is the highest-impact user-facing improvement
- All tasks are frontend-only, no backend dependencies
- Mobile app should inherit these patterns via shared design tokens

---

## Ideation: Addictive Narrative Design - 2026-01-18

### Source
User topic: "Making this an addicting story so users want to fulfill quests. We need to ideate on how to make this an amazing narrative"

### Design Document
- `docs/content/addictive-narrative-design.md` (created)

### Core Philosophy

Transform Journey from fitness tracker to compelling, story-driven experience by leveraging seven narrative pillars:

1. **The Underdog Origin** - Every player starts as "The Beginner" with optional origin motivation selection
2. **The Visible Enemy** - Internal bosses personify real failure patterns (Inconsistent One, Excuse Maker, etc.)
3. **Progress as Transformation** - Frame stat changes as identity transformation, not just numbers
4. **The Observer Effect** - System observations create accountability through intelligent watching
5. **The Ritual of Return** - Failure becomes a narrative arc, not an ending
6. **The Expanding Mystery** - Lore reveals drip-feed as rewards for progression
7. **The Social Witness** - Guilds and accountability partners witness each other's journeys

### Psychological Foundations (Research)

Based on game psychology research:
- **Variable Rewards** - Unpredictable narrative beats keep engagement high
- **Operant Conditioning** - Story rewards reinforce desired behaviors
- **Loss Aversion** - The System's observation creates stake in not disappointing it
- **Social Dynamics** - Shared narrative creates belonging and obligation
- **The Hook Model** - Trigger (observation) → Action (quest) → Variable Reward (narrative) → Investment (identity)

### Tasks Generated

| ID | Title | Priority | Complexity | Dependencies |
|----|-------|----------|------------|--------------|
| G93-origin-story-selection | Origin Story Selection | P1 | medium | G25-onboarding-flow |
| G94-system-observations | System Observations (AI Pattern Analysis) | P1 | high | G22-mastra-narrator-agent |
| G95-transformation-narratives | Transformation Narratives | P1 | medium | G52-realistic-stat-calculation |
| G96-new-bosses | New Bosses (The Negotiator & The Tomorrow) | P2 | high | G14-boss-system |
| G97-shadow-extraction-system | Shadow Extraction System | P2 | medium | G14-boss-system, G24-shadows-system |
| G98-lore-reveals | Progressive Lore Reveals | P2 | medium | G19-narrative-content-service |
| G99-guild-narratives | Guild & Social Narratives | P2 | medium | G27-guild-system, G28-accountability-partners |

### Dependency Graph

```
G25-onboarding-flow ──────► G93-origin-story-selection
                                     │
G22-mastra-narrator ──────► G94-system-observations
                                     │
G52-realistic-stat ───────► G95-transformation-narratives
                                     │
G14-boss-system ──────┬───► G96-new-bosses ──────► G97-shadow-extraction
                      │
G24-shadows-system ───┘

G19-narrative-content ────► G98-lore-reveals

G27-guild-system ─────┬───► G99-guild-narratives
                      │
G28-accountability ───┘
```

### Implementation Order (Recommended)

**Phase 1: Foundation Enhancements (P1)**
1. **G93**: Origin story selection during onboarding
2. **G95**: Transformation-framed level-up messages
3. **G94**: AI-powered pattern observations

**Phase 2: Boss Narrative Expansion (P2)**
4. **G96**: New bosses (The Negotiator, The Tomorrow)
5. **G97**: Shadow extraction post-boss victory

**Phase 3: World & Social (P2)**
6. **G98**: Progressive lore reveals as rewards
7. **G99**: Narrative framing for guilds and accountability

### Key Narrative Content Additions

| Category | Items | Priority |
|----------|-------|----------|
| Origin Intros | 4 variants | P1 |
| Boss Dialogue (Negotiator) | 13 items | P2 |
| Boss Dialogue (Tomorrow) | 13 items | P2 |
| System Observations | 30+ patterns | P1 |
| Transformation Templates | 20+ | P1 |
| Lore Reveals | 10 milestones | P2 |
| Shadow Abilities | 5 descriptions | P2 |
| Guild Narratives | 20+ events | P2 |

### Updated Task Pipeline

| Metric | Before | After |
|--------|--------|-------|
| Total Tasks | 91 | 98 |
| Completed | ~65 | ~65 |
| Available | 26 | 33 |
| P1 Tasks | 16 | 19 |
| P2 Tasks | 13 | 17 |

### Success Metrics

| Metric | Baseline | Target |
|--------|----------|--------|
| Day-1 Retention | 35% | 50% |
| Day-7 Retention | 20% | 35% |
| Day-30 Retention | 10% | 20% |
| Quest Completion Rate | 60% | 75% |
| Boss Engagement | N/A | 80% of eligible |
| Return Rate (after lapse) | 10% | 25% |

### Notes

- **Origin is optional** — Never force players to share their "why"
- **Observations need data** — Wait 7+ days before generating pattern observations
- **Bosses are sequential** — New bosses unlock after defeating earlier ones
- **Lore is reward** — Never show future lore, only hint at its existence
- **Shadow abilities are passive** — They warn/help, never punish
- **AI-generated content** — Observations use Mastra narrator agent for personalization

### Sources

Research informing this design:
- [Game Design Psychology - Genieee](https://genieee.com/how-game-design-psychology-boosts-engagement/)
- [Addictive Game Mechanics - Suroe](https://www.suroe.com/the-science-behind-addictive-game-mechanics)
- [Solo Leveling Narrative Analysis - CBR](https://www.cbr.com/solo-leveling-good-writing-deep-storyline/)
- [Gamification in Fitness Apps - Yukai Chou](https://yukaichou.com/gamification-analysis/top-10-gamification-in-fitness/)
- [Habit Formation Research - PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC11907615/)

---

## Ideation Loop - 2026-01-18 (Pipeline Refill)

### Analysis Summary
- Task queue dropped to 0 available tasks (below threshold of 5)
- 8 blocked tasks needed task files created
- Multi-source analysis to identify new gaps

### Gaps Addressed

#### Blocked Tasks Unblocked (8)
| ID | Title | Priority |
|----|-------|----------|
| G104-player-analytics | Player Analytics Dashboard | P2 |
| G105-caching-layer | Response Caching Layer | P2 |
| G106-mobile-guild-ui | Mobile Guild Components | P2 |
| G120-workout-library | Workout Exercise Library | P2 |
| G121-quest-templates | Custom Quest Templates | P2 |
| G123-sound-effects | UI Sound Effects System | P2 |
| G125-mobile-widgets | iOS/Android Home Screen Widgets | P3 |
| G127-profile-customization | Profile Avatar and Customization | P2 |

### New Tasks Generated (6)

| ID | Title | Priority | Domain |
|----|-------|----------|--------|
| G129-web-push-notifications | Web Push Notification Integration | P1 | full-stack |
| G130-mobile-leaderboard | Mobile Leaderboard Screen | P1 | mobile |
| G131-structured-logging | Structured Logging Migration | P2 | backend |
| G132-mobile-titles | Mobile Title Collection Screen | P2 | mobile |
| G133-weekly-recap-email | Weekly Recap Email | P2 | backend |
| G134-quest-service-refactor | Quest Service Refactor | P2 | backend |

### Updated Task Pipeline

| Metric | Before | After |
|--------|--------|-------|
| Total Tasks | 127 | 133 |
| Completed | 117 | 119 |
| In Progress | 2 | 0 |
| Available | 0 | 14 |
| Blocked | 8 | 0 |

### Recommended Next Actions

1. **Immediate (P1):**
   - G129-web-push-notifications (completes notification system)
   - G130-mobile-leaderboard (mobile parity)
   - G104-player-analytics (now unblocked)

2. **Short-term (P2):**
   - G131-structured-logging (tech debt cleanup)
   - G132-mobile-titles (mobile parity)
   - G134-quest-service-refactor (maintainability)
   - G105-caching-layer (performance)

3. **Medium-term (P2/P3):**
   - G120-workout-library (content expansion)
   - G121-quest-templates (user engagement)
   - G123-sound-effects (polish)
   - G125-mobile-widgets (engagement)
   - G127-profile-customization (personalization)

### Key Observations

1. **Mobile parity** continues to be a gap - added leaderboard and titles screens
2. **Backend maintenance** needed - logging migration and quest refactor
3. **User engagement** features ready - push notifications, email recaps
4. **Content expansion** opportunities - workout library, custom quests
5. **Polish tasks** available - sound effects, profile customization

### Source Analysis

| Source | Items Found |
|--------|-------------|
| Blocked tasks | 8 needing task files |
| Debt manifest | Logging (DEBT-007), quest complexity (DEBT-003) |
| Mobile parity | Leaderboard, titles screens missing |
| User engagement | Push notifications, email recaps |
| Code quality | Quest service needs splitting |

---

## Retrospective & Future Direction - 2026-01-18

### Topic
User topic: "Reflection and retrospective on what we have built and where to go next?"

### Design Document
- `docs/planning/retrospective-2026-01-18.md` (comprehensive analysis)

### What We Built (Summary)

| Category | Status |
|----------|--------|
| Task Manifest | 133 tasks, 119 completed (89%) |
| Backend Services | 48 services, 24 tested (50%) |
| Web Frontend | 13 pages, 50+ components |
| Mobile App | 25 components, foundation ready |
| Documentation | 94 files, comprehensive coverage |

**Core Systems Completed:**
- Quest System (daily, weekly, rotating, bonus, seasonal)
- XP/Leveling with immutable ledger
- Streak tracking with bonuses
- Debuff system
- Boss fights (5 bosses, shadow extraction)
- Dungeons
- Titles & Seasons
- Guilds, Raids, Accountability
- AI Narrative (Mastra integration)

### Critical Gap Identified

**Mobile + HealthKit = The Blocker**

The System's promise is automatic observation. Without HealthKit integration:
- Users must manually enter steps, workouts
- This defeats the core value proposition
- Backend is ready, mobile needs connection

### Tasks Generated

#### Phase 1: Mobile-First (P0)
| ID | Title | Rationale |
|----|-------|-----------|
| G135-healthkit-dev-setup | HealthKit Development Environment | Physical device required |
| G136-health-sync-testing | E2E Health Sync Testing | Verify data flows correctly |
| G137-mobile-offline-sync | Offline-First Architecture | Fitness happens offline |

#### Phase 2: Content Completeness (P1)
| ID | Title | Rationale |
|----|-------|-----------|
| G138-boss-dialogue-complete | Complete Boss Dialogue Trees | Bosses need full content |
| G139-weekly-summary-content | Weekly Summary Templates | Day 7+ retention |
| G140-observation-content | System Observation Templates | AI needs base content |

#### Phase 3: Production Hardening (P1)
| ID | Title | Rationale |
|----|-------|-----------|
| G141-github-actions-ci | GitHub Actions CI Pipeline | Can't iterate safely without CI |
| G142-sentry-integration | Sentry Error Tracking | Production debugging |
| G143-structured-logging-migration | Migrate console.log to Logger | 263 statements to fix |

### Updated Task Pipeline

| Metric | Before | After |
|--------|--------|-------|
| Total Tasks | 133 | 142 |
| Completed | 119 | 119 |
| Available | 13 | 22 |
| P0 Tasks | 0 | 2 |
| P1 Tasks | 2 | 9 |

### Strategic Recommendation

**Ship Mobile MVP First.**

The System awaits its first real specimens. The infrastructure exists. The narrative is designed. What remains is connecting to the real world through HealthKit.

Priority Order:
1. G135 → G136 → G137 (Mobile health integration)
2. G141 (CI pipeline)
3. G138-G140 (Content)
4. G142-G143 (Observability)

### Key Insight

> "The System does not ask why. The System only observes whether you return tomorrow."

This philosophy—observation without judgment—is the differentiator. But without automatic health data, observation requires manual entry, which creates friction. HealthKit integration isn't a feature; it's the enabler of the core promise.

---

## Ideation Loop - 2026-01-18 (Testing/Stability Focus)

### Analysis Summary
Multi-source analysis focused on testing and stability:

| Source | Analysis |
|--------|----------|
| Test Coverage | 26/49 services (53%), 2/21 routes (10%), 3/80 components (4%) |
| TODO/FIXME | 48 items across 17 files |
| Error Handling | 463 try/catch blocks, inconsistent patterns |
| API Validation | 1/21 routes with Zod (5%) |
| E2E Coverage | 4 specs covering basic flows |

### Critical Gaps Identified

#### Test Coverage
| Category | Current | Target |
|----------|---------|--------|
| Backend Services | 53% | 80% |
| API Routes | 10% | 80% |
| Frontend Components | 4% | 50% |
| Mobile | 0% | 30% |

#### Security/Stability
- **API Input Validation** - 95% of routes accept any input
- **Error Handling** - Inconsistent patterns across 463 try/catch blocks
- **Integration Tests** - No cross-service flow tests exist

### Tasks Generated

| ID | Title | Priority | Domain |
|----|-------|----------|--------|
| G148-route-test-coverage | API Route Test Coverage | P1 | backend/testing |
| G149-frontend-unit-tests | Frontend Component Unit Tests | P1 | frontend/testing |
| G150-api-input-validation | API Input Validation with Zod | P1 | backend/security |
| G151-mobile-test-setup | Mobile Test Infrastructure | P2 | mobile/testing |
| G152-integration-test-suite | Integration Test Suite | P1 | backend/testing |
| G153-error-handling-standardization | Error Handling Standardization | P2 | backend/quality |
| G154-e2e-expansion | E2E Test Expansion | P2 | e2e/testing |
| G155-service-test-completion | Complete Service Test Coverage | P1 | backend/testing |

### Updated Task Pipeline

| Metric | Before | After |
|--------|--------|-------|
| Total Tasks | 84 | 92 |
| Completed | 81 | 81 |
| Available | 0 | 8 |
| P1 Tasks | 2 | 7 |
| P2 Tasks | 1 | 4 |

### Recommended Next Actions

1. **Immediate (P1 - Security/Stability):**
   - G150-api-input-validation (security hardening)
   - G148-route-test-coverage (critical path testing)
   - G152-integration-test-suite (cross-service verification)

2. **Short-term (P1 - Coverage):**
   - G149-frontend-unit-tests (UI stability)
   - G155-service-test-completion (business logic verification)

3. **Medium-term (P2 - Polish):**
   - G153-error-handling-standardization (code quality)
   - G154-e2e-expansion (user flow coverage)
   - G151-mobile-test-setup (mobile parity)

### Key Observations

1. **Backend services are the most tested** but still have gaps in critical areas (health, quest-lifecycle)
2. **API validation is the biggest security gap** - most routes accept arbitrary input
3. **Frontend testing is minimal** - only 3 component tests exist
4. **Mobile has zero tests** - highest risk for regressions
5. **No integration tests** - cross-service flows are untested
6. **Error handling is inconsistent** - difficult to debug production issues

### Testing Stack Summary

| Layer | Framework | Status |
|-------|-----------|--------|
| Backend Unit | Vitest | ✅ Configured |
| Backend Integration | Vitest | ❌ Needs setup |
| Frontend Unit | Vitest + RTL | ✅ Configured |
| E2E | Playwright | ✅ Configured |
| Mobile | Jest + RNTL | ⚠️ Jest configured, no tests |

---

## Ideation: Food Scanning System - 2026-01-18

### Source
User topic: "Food scanning with photo recognition and barcode detection for macro estimation"

### Design Document
- `docs/mobile/food-scanning.md`

### Research Summary

Analyzed current best food recognition APIs:
- **[Spike Nutrition API](https://www.spikeapi.com/nutrition-ai-api)** - Best accuracy (97%), AI-powered
- **[FatSecret Platform API](https://platform.fatsecret.com/platform-api)** - Large database, image recognition
- **[LogMeal Food AI](https://logmeal.com/api/)** - Currently integrated, ~80-90% accuracy
- **[Calorie Mama](https://caloriemama.ai/api)** - Fast, mobile-optimized
- **Open Food Facts** - Free barcode database (3M+ products)

### Existing Implementation
| Component | Status |
|-----------|--------|
| LogMeal API integration | ✅ Backend complete |
| Open Food Facts client | ✅ Backend complete |
| Nutrition routes | ✅ API endpoints ready |
| useBarcodeLookup hook | ✅ Mobile hook ready |
| BarcodeScanner component | ⚠️ UI stub only |
| Real camera integration | ❌ Not implemented |

### Tasks Generated

| ID | Title | Priority | Complexity |
|----|-------|----------|------------|
| G156-camera-integration | Mobile Camera Integration | P0 | medium |
| G157-barcode-scanner-real | Real Barcode Scanner Implementation | P0 | medium |
| G158-food-scan-ui | Food Scanning UX Polish | P1 | medium |
| G159-photo-food-recognition | AI Photo Food Recognition | P1 | high |
| G160-offline-food-cache | Offline Food Database Cache | P2 | medium |

### Dependency Graph

```
G156-camera-integration
         │
    ┌────┴────┐
    ▼         ▼
G157-barcode  G159-photo-recognition
    │
    ├───────────┐
    ▼           ▼
G158-food-ui   G160-offline-cache
```

### Updated Task Pipeline

| Metric | Before | After |
|--------|--------|-------|
| Total Tasks | 100 | 105 |
| Available | 13 | 18 |
| P0 Tasks | 0 | 2 |
| P1 Tasks | 5 | 7 |
| P2 Tasks | 8 | 9 |

### Implementation Order (Recommended)

**Phase 1: Camera Foundation (P0)**
1. G156 - Install expo-camera, handle permissions
2. G157 - Working barcode scanning with Open Food Facts lookup

**Phase 2: Full Experience (P1)**
3. G158 - Polished UX with mode toggle, animations
4. G159 - AI food photo analysis via LogMeal

**Phase 3: Reliability (P2)**
5. G160 - Offline caching for barcode products

### Notes
- Camera requires physical device (EAS build)
- LogMeal API key needed for photo recognition
- Open Food Facts is free, no API key needed
- Consider evaluating Spike API for better accuracy in future

---

## Ideation Loop - 2026-01-19 (Narrative Fulfillment Analysis)

### Source
User topic: "Are we fulfilling our narrative properly? Should we add more story?"

### Analysis Summary

**Key Finding:** The narrative ARCHITECTURE is excellent, but it's underutilized.

| Component | Status | Assessment |
|-----------|--------|------------|
| Narrator Agent (Mastra) | ✅ Exists | Underused - many code paths bypass it |
| Player Context Tool | ✅ Complete | Has level, streak, debuff, patterns |
| Narrative Templates Tool | ✅ Exists | AI can reference for voice consistency |
| Seeded Content | ⚠️ Partial | ~45 items vs ~200 documented |
| AI-first Flow | ❌ Not default | Most calls go direct to templates |
| System Voice Evolution | ❌ Missing | Same tone for day-1 and day-100 users |

### Revised Understanding

**Initial assumption:** Need to seed ~155 more content items.

**Corrected approach:** The AI narrator should generate most content dynamically. Templates serve as:
1. **Fallback** when AI unavailable
2. **Voice reference** for AI consistency
3. **Critical path content** that must always work

### Architecture Gap: Narrator-First vs Template-First

**Current (Template-First):**
```
Most code → getContent() → Template → User
```

**Desired (Narrator-First):**
```
Most code → generateNarrative() → AI Agent → User
              ↓ (fallback)
          Templates
```

### Tasks Generated

| ID | Title | Priority | Rationale |
|----|-------|----------|-----------|
| G161-p0-narrative-seeding | P0 Narrative Content Seeding | P1 | Critical fallback content |
| G162-boss-narrative-complete | Complete Boss Narrative Content | P1 | Boss lore AI shouldn't freestyle |
| G163-title-dungeon-content | Title and Dungeon Narrative Content | P2 | System descriptions |
| G164-system-voice-evolution | System Voice Evolution | P2 | Phase-aware voice (depends on G165) |
| G165-narrator-first-architecture | Narrator-First Architecture | P1 | **KEY TASK** - Make AI the default |

### Dependency Graph

```
G165-narrator-first-architecture (P1 - Foundation)
         │
         ├───────────────────────────────┐
         │                               │
         ▼                               ▼
G164-system-voice-evolution      All other narrative
         │                       calls use AI
         ▼
Phase-aware personality
```

### The System Voice Evolution Concept

| Phase | Days | System's Role | Voice |
|-------|------|---------------|-------|
| **Observer** | 1-14 | Clinical assessment | "Another data point collected." |
| **Challenger** | 15-30 | Testing resolve | "The easy part is over." |
| **Recognition** | 31-60 | Grudging acknowledgment | "Assessment was incorrect." |
| **Witness** | 60+ | Long-term companion | "You are no longer who arrived." |

### Updated Task Pipeline

| Metric | Before | After |
|--------|--------|-------|
| Total Tasks | 105 | 110 |
| Completed | ~83 | ~83 |
| Available | 22 | 27 |
| P1 (Narrative) | 0 | 3 |
| P2 (Narrative) | 0 | 2 |

### Recommended Next Actions

1. **Immediate (P1):**
   - **G165-narrator-first-architecture** - This is the key task
   - G162-boss-narrative-complete - Bosses need curated lore

2. **Short-term (P1):**
   - G161-p0-narrative-seeding - Fallback templates
   - G164-system-voice-evolution (after G165)

3. **Medium-term (P2):**
   - G163-title-dungeon-content

### Key Insight

> The AI narrator is the differentiator. Static templates make Journey feel like every other fitness app. Dynamic, context-aware narrative that knows your patterns, evolves with your journey, and personalizes every message - that's what makes it feel like the System is actually watching.

### Cost Considerations

AI calls have cost. G165 should include:
- Response caching (1 hour for non-critical messages)
- Rate limiting per user
- Tiered usage: AI for key moments (login, milestone, level-up), templates for frequent events (quest completion ticker)

### Conclusion

**Use both. Templates + AI, each where they shine.**

- **Templates:** High-frequency events (quest complete, XP awards), critical paths (onboarding, errors), curated lore (boss intros)
- **AI Narrator:** Key moments (login greeting, milestones, return after absence), pattern observations, personalized reflections

The narrator agent exists and works. Templates exist and work. G165 establishes clear guidelines for when to use each, and ensures AI is used for the moments that benefit from personalization.

---

## Ideation Loop - 2026-01-19 (Web-Mobile Feature Parity)

### Source
User topic: "Feature parity for web and mobile. Mobile should do everything web can do"

### Analysis Summary

**Key Finding:** Mobile has components but lacks unified screens matching web pages.

| Category | Web | Mobile | Gap |
|----------|-----|--------|-----|
| Pages/Screens | 13 | ~3 | 10 screens needed |
| Components | 50+ | 40+ | Good component base |
| Hooks | 35 | 19 | Need mobile equivalents |
| Navigation | Full tabs | Minimal | Full tab navigation needed |

### Web Features Missing on Mobile

**Core Screens (P0)**
| Feature | Web Status | Mobile Status |
|---------|------------|---------------|
| Dashboard | ✅ Full featured | ⚠️ Components only |
| Onboarding | ✅ 5-step flow | ⚠️ Partial |
| Tab Navigation | ✅ Complete | ⚠️ Minimal |

**Feature Screens (P1)**
| Feature | Web Status | Mobile Status |
|---------|------------|---------------|
| Stats | ✅ Complete | ⚠️ Has radar |
| Profile/Settings | ✅ Complete | ⚠️ Components only |
| Quest Archive | ✅ Complete | ❌ Missing |
| Dungeons | ✅ Complete | ⚠️ Components only |
| Reconciliation | ✅ Complete | ❌ Missing |

**Secondary Features (P2)**
| Feature | Web Status | Mobile Status |
|---------|------------|---------------|
| Quest History | ✅ Complete | ❌ Missing |
| Analytics | ✅ Complete | ❌ Missing |
| Weekly Summary | ✅ Complete | ❌ Missing |
| XP Timeline | ✅ Complete | ❌ Missing |
| Unlock Progress | ✅ Complete | ❌ Missing |
| Shadow Collection | ✅ Complete | ❌ Missing |

### Tasks Generated

| ID | Title | Priority | Complexity |
|----|-------|----------|------------|
| G166-mobile-dashboard | Mobile Dashboard Screen | P0 | high |
| G167-mobile-stats-page | Mobile Stats Screen | P1 | medium |
| G168-mobile-profile-settings | Mobile Profile & Settings Screen | P1 | medium |
| G169-mobile-quests-archive | Mobile Quest Archive/Management Screen | P1 | medium |
| G170-mobile-quest-history | Mobile Quest History Screen | P2 | medium |
| G171-mobile-dungeons | Mobile Dungeons Screen | P1 | medium |
| G172-mobile-analytics | Mobile Analytics Screen | P2 | medium |
| G173-mobile-onboarding | Mobile Onboarding Flow | P0 | medium |
| G174-mobile-reconciliation | Mobile Day Reconciliation Flow | P1 | medium |
| G175-mobile-weekly-summary | Mobile Weekly Summary | P2 | medium |
| G176-mobile-navigation-tabs | Mobile Tab Navigation | P0 | medium |
| G177-mobile-xp-timeline | Mobile XP Timeline | P2 | medium |
| G178-mobile-unlock-progress | Mobile Unlock Progress | P2 | medium |
| G179-mobile-shadow-collection | Mobile Shadow Collection | P2 | medium |

### Dependency Graph

```
G176-mobile-navigation-tabs (P0 - Navigation Foundation)
         │
    ┌────┼────┬────────┬────────────────┐
    ▼    ▼    ▼        ▼                ▼
  G166  G167 G168    G171             (other screens)
  dash  stats profile dungeons

G173-mobile-onboarding (P0 - First run experience)
         │
         ▼
   G166-mobile-dashboard (user lands here after onboarding)
         │
    ┌────┼────┬────────┐
    ▼    ▼    ▼        ▼
  G174  G175 G177    G178
  recon weekly XP    unlocks
```

### Updated Task Pipeline

| Metric | Before | After |
|--------|--------|-------|
| Total Tasks | 110 | 124 |
| Completed | ~83 | ~83 |
| Available | 27 | 41 |
| P0 Tasks | 5 | 8 |
| P1 Tasks | 7 | 12 |
| P2 Tasks | 15 | 21 |

### Recommended Next Actions

**Immediate (P0 - Mobile Foundation):**
1. **G176-mobile-navigation-tabs** - Enables all other screens
2. **G166-mobile-dashboard** - Main landing experience
3. **G173-mobile-onboarding** - First run flow

**Short-term (P1 - Core Experience):**
4. G167-mobile-stats-page - Stats visualization
5. G168-mobile-profile-settings - User settings
6. G169-mobile-quests-archive - Quest management
7. G171-mobile-dungeons - Game content
8. G174-mobile-reconciliation - Daily rhythm

**Medium-term (P2 - Full Parity):**
9. G170-mobile-quest-history - Historical data
10. G172-mobile-analytics - Analytics dashboard
11. G175-mobile-weekly-summary - Weekly insights
12. G177-mobile-xp-timeline - XP details
13. G178-mobile-unlock-progress - Progression tracking
14. G179-mobile-shadow-collection - Game collectibles

### Key Observations

1. **Mobile foundation is good** - Components exist, screens need assembly
2. **Navigation is the blocker** - Must build tab navigation first
3. **Hooks can be shared** - Many web hooks port directly to mobile
4. **Backend is ready** - All APIs already exist
5. **Estimated effort** - 14 screens × medium complexity

### Notes

- Mobile should prioritize touch-native interactions (swipe, long-press)
- Consider mobile-specific features (haptics, push notifications)
- Ensure offline support for core features
- Test on various screen sizes (phone, tablet)

---

## Ideation Loop - 2026-01-19 (Retrospective & Forward-Looking)

### Source
User request: `/ideation-loop --focus retrospective, forward looking changes`

### Analysis Summary

**Codebase Scale:**
| Category | Count |
|----------|-------|
| Total TS/TSX files | 15,700 |
| Backend Services | 82 files (27 tests) |
| Backend Routes | 30 files (8 tests) |
| Web Components | 98 files |
| Mobile Source | 109 files |
| Documentation | 94+ markdown files |

**Active Technical Debt (6 TODOs):**
- `mobile/src/lib/widget-data.ts:121` - iOS widget native bridge
- `mobile/src/lib/widget-data.ts:143` - Android widget native bridge
- `mobile/src/hooks/usePlayer.ts:108` - Fetch active title
- `mobile/app/(tabs)/index.tsx:48` - Get debuffActive from player
- `mobile/src/screens/FoodScanScreen.tsx:189` - Manual entry navigation
- `server/src/services/notification.ts:291` - Push notification integration

**Test Coverage:**
- Backend Services: 33% (27/82)
- Backend Routes: 27% (8/30)
- Web Components: Minimal
- Mobile: 0%

### New Gaps Identified

| Gap | Title | Source | Priority |
|-----|-------|--------|----------|
| G180 | Mobile Player Data Hydration | TODO analysis | P1 |
| G181 | Push Notification Integration | Server TODO | P1 |
| G182 | Native Widget Bridge | TODO analysis | P2 (blocked) |
| G183 | Mobile Manual Food Entry | TODO analysis | P1 |
| G184 | API Response Caching | Architecture review | P2 |
| G185 | Route Test Coverage Expansion | Coverage analysis | P1 |

### Tasks Generated

| ID | Title | Priority | Domain |
|----|-------|----------|--------|
| G180-mobile-player-data-hydration | Mobile Player Data Hydration | P1 | mobile/data |
| G181-push-notification-integration | Push Notification Integration | P1 | full-stack |
| G182-native-widget-bridge | Native Widget Bridge | P2 | mobile/native |
| G183-mobile-manual-food-entry | Manual Food Entry Screen | P1 | mobile |
| G184-api-response-caching | API Response Caching Layer | P2 | backend |
| G185-route-test-expansion | Route Test Coverage Expansion | P1 | testing |

### Updated Task Pipeline

| Metric | Before | After |
|--------|--------|-------|
| Total Tasks | 15 | 18 |
| In Progress | 1 | 0 (auto-purged) |
| Available | 13 | 16 |
| Blocked | 1 | 2 |
| P1 Tasks | 1 | 5 |
| P2 Tasks | 12 | 11 |

### Recommended Next Actions

**Immediate (P1 - Technical Debt):**
1. **G180-mobile-player-data-hydration** - Fix incomplete data issues
2. **G183-mobile-manual-food-entry** - Complete nutrition flow
3. **G185-route-test-expansion** - Improve test coverage

**Short-term (P1 - Engagement):**
4. **G181-push-notification-integration** - Enable re-engagement

**Medium-term (P2 - Quality):**
5. **G184-api-response-caching** - Performance improvement
6. **G153-error-handling-standardization** - Code quality
7. Mobile parity screens (G170, G172, G175, G177-G179)

### Key Insights

1. **Mobile is maturing** - 109 source files, good component base
2. **TODOs reveal integration gaps** - Player data hydration, push notifications incomplete
3. **Test coverage needs expansion** - Routes at 27% vs services at 33%
4. **Performance optimization opportunity** - No caching layer observed
5. **Widget features blocked** - Native bridges require expo eject

### Forward-Looking Priorities

1. **Complete mobile parity** - 7 screens remaining
2. **Fix technical debt** - 6 active TODOs to resolve
3. **Improve test coverage** - Target 80% for routes
4. **Enable push notifications** - Critical for user engagement
5. **Add caching layer** - Performance improvement as user base grows

