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
