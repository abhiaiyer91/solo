# Solo Leveling Fitness Quest System — Task Decomposition

This document breaks down the MASTER_SPEC.md into actionable engineering tasks organized by phase and domain.

> **See Also:** [Gaps & Priorities](./gaps-and-priorities.md) — Detailed analysis of implementation gaps with prioritized tasks for immediate work.

---

## Progress Summary

**Last Updated:** 2026-01-18

| Section | Total Tasks | ✅ Done | ⏳ Partial | Remaining |
|---------|-------------|---------|------------|-----------|
| 1.1 Project Setup & Infrastructure | 9 | 9 | 0 | 0 |
| 1.2 Authentication (Better Auth) | 10 | 10 | 0 | 0 |
| 1.3 Database Schema (Core Models) | 10 | 9 | 0 | 1 |
| 1.4 Player Stats System | 8 | 4 | 2 | 2 |
| 1.5 Daily Quest System | 13 | 8 | 1 | 4 |
| 1.6 XP Ledger System | 8 | 7 | 0 | 1 |
| 1.7 Streak Tracking | 5 | 0 | 0 | 5 |
| 1.8 System Window UI | 9 | 6 | 1 | 2 |
| 1.9 Core Pages | 5 | 2 | 1 | 2 |
| 1.10 Mobile App & HealthKit | 22 | 0 | 0 | 22 |
| 1.11 Nutrition Tracking | 16 | 0 | 0 | 16 |
| **Phase 1 Total** | **115** | **55** | **5** | **55** |
| 2.1-2.6 Enhanced Features | 44 | 0 | 0 | 44 |
| 2.7 Quest Variety System | 16 | 0 | 0 | 16 |
| 2.8 Failure & Recovery System | 12 | 0 | 0 | 12 |
| 2.9 Mastra Narrative Agents | 8 | 0 | 0 | 8 |
| **Phase 2 Total** | **80** | **0** | **0** | **80** |
| 3.1-3.5 Advanced Features | 49 | 0 | 0 | 49 |
| 3.6 Social - Shadows & Accountability | 14 | 0 | 0 | 14 |
| 3.7 Social - Guilds | 16 | 0 | 0 | 16 |
| 3.8 Social - Raids | 13 | 0 | 0 | 13 |
| 3.9 Content Seeding | 16 | 0 | 0 | 16 |
| **Phase 3 Total** | **108** | **0** | **0** | **108** |
| **Phase 4 Total** | **26** | **0** | **0** | **26** |
| **Grand Total** | **329** | **55** | **5** | **269** |

**Current Stage:** Core web MVP functional. Authentication, Quest System, and XP Ledger implemented. Next priorities: Streak Tracking, HealthKit Mobile Integration, UI polish.

---

## Phase 1: MVP (Foundation)

### 1.1 Project Setup & Infrastructure

| ID | Task | Dependencies | Complexity | Status |
|----|------|--------------|------------|--------|
| 1.1.1 | Initialize monorepo structure (`server/`, `web/`) | - | Low | ✅ Done |
| 1.1.2 | Set up Vite + React 18 + TypeScript frontend | 1.1.1 | Low | ✅ Done |
| 1.1.3 | Set up Hono + TypeScript backend | 1.1.1 | Low | ✅ Done |
| 1.1.4 | Configure PostgreSQL database (local + Docker) | - | Low | ✅ Done |
| 1.1.5 | Set up Drizzle ORM with initial schema | 1.1.3, 1.1.4 | Medium | ✅ Done |
| 1.1.6 | Configure environment variables (.env.example) | 1.1.1 | Low | ✅ Done |
| 1.1.7 | Set up ESLint + Prettier + TypeScript config | 1.1.1 | Low | ✅ Done |
| 1.1.8 | Configure TanStack Query client | 1.1.2 | Low | ✅ Done |
| 1.1.9 | Set up Zustand store structure | 1.1.2 | Low | ✅ Done |

### 1.2 Authentication (Better Auth)

| ID | Task | Dependencies | Complexity | Status |
|----|------|--------------|------------|--------|
| 1.2.1 | Install and configure Better Auth | 1.1.3, 1.1.5 | Medium | ✅ Done |
| 1.2.2 | Create Drizzle adapter for Better Auth | 1.2.1 | Low | ✅ Done |
| 1.2.3 | Implement email/password authentication | 1.2.1 | Medium | ✅ Done |
| 1.2.4 | Add Google OAuth provider | 1.2.1 | Medium | ✅ Done (configured, not tested) |
| 1.2.5 | Create auth middleware for Hono routes | 1.2.1 | Medium | ✅ Done |
| 1.2.6 | Build login page UI | 1.1.2 | Medium | ✅ Done |
| 1.2.7 | Build signup page UI | 1.1.2 | Medium | ✅ Done |
| 1.2.8 | Create useAuth hook for frontend | 1.2.1, 1.1.8 | Low | ✅ Done |
| 1.2.9 | Implement protected route wrapper | 1.2.8 | Low | ✅ Done |
| 1.2.10 | Add session persistence and refresh | 1.2.1 | Medium | ✅ Done |

### 1.3 Database Schema (Core Models)

| ID | Task | Dependencies | Complexity | Status |
|----|------|--------------|------------|--------|
| 1.3.1 | Create User model with game stats fields | 1.1.5 | Low | ✅ Done |
| 1.3.2 | Create Session, Account, Verification models (Better Auth) | 1.1.5 | Low | ✅ Done |
| 1.3.3 | Create QuestTemplate model | 1.1.5 | Low | ✅ Done |
| 1.3.4 | Create QuestLog model | 1.3.3 | Low | ✅ Done |
| 1.3.5 | Create DailyLog model | 1.1.5 | Low | ✅ Done |
| 1.3.6 | Create XPEvent model (immutable ledger) | 1.1.5 | Medium | ✅ Done |
| 1.3.7 | Create XPModifier model | 1.3.6 | Low | ✅ Done |
| 1.3.8 | Create enums (QuestType, QuestCategory, StatType, etc.) | 1.1.5 | Low | ✅ Done |
| 1.3.9 | Write seed script for default quest templates | 1.3.3 | Medium | ✅ Done |
| 1.3.10 | Create database migration scripts | 1.3.1-1.3.8 | Low | |

### 1.4 Player Stats System

| ID | Task | Dependencies | Complexity | Status |
|----|------|--------------|------------|--------|
| 1.4.1 | Create `/api/player` GET endpoint | 1.2.5, 1.3.1 | Low | ✅ Done |
| 1.4.2 | Create `/api/player/stats` detailed stats endpoint | 1.4.1 | Low | |
| 1.4.3 | Implement level calculation service (`computeLevel`, `computeLevelThreshold`) | 1.1.3 | Low | ✅ Done |
| 1.4.4 | Implement `xpToNextLevel` calculation | 1.4.3 | Low | ✅ Done |
| 1.4.5 | Create usePlayer hook for frontend | 1.4.1, 1.1.8 | Low | ⏳ Partial (useAuth handles player data) |
| 1.4.6 | Build StatBlock component (STR, AGI, VIT, DISC display) | 1.1.2 | Medium | ⏳ Partial (in Dashboard) |
| 1.4.7 | Build XPBar component with progress visualization | 1.4.5 | Medium | ✅ Done |
| 1.4.8 | Build LevelBadge component | 1.4.5 | Low | |

### 1.5 Daily Quest System

| ID | Task | Dependencies | Complexity | Status |
|----|------|--------------|------------|--------|
| 1.5.1 | Define Requirement DSL types (NumericRequirement, BooleanRequirement, CompoundRequirement) | 1.1.3 | Low | ✅ Done |
| 1.5.2 | Implement requirement evaluation engine | 1.5.1 | Medium | ✅ Done |
| 1.5.3 | Create 5 core daily quest templates (Steps, Workout, Protein, Sleep, Alcohol-free) | 1.3.9 | Low | ✅ Done |
| 1.5.4 | Create `/api/quests` GET endpoint (today's quests) | 1.2.5, 1.3.4 | Medium | ✅ Done |
| 1.5.5 | Create `/api/quests/:id` GET endpoint | 1.5.4 | Low | ✅ Done |
| 1.5.6 | Create `/api/quests/:id/complete` POST endpoint | 1.5.4 | Medium | ✅ Done |
| 1.5.7 | Implement quest progress tracking | 1.5.6 | Medium | ✅ Done |
| 1.5.8 | Implement partial reward calculation | 1.5.6 | Medium | ✅ Done |
| 1.5.9 | Create useQuests hook for frontend | 1.5.4, 1.1.8 | Low | |
| 1.5.10 | Build QuestCard component | 1.1.2 | Medium | ⏳ Partial (placeholder in Dashboard) |
| 1.5.11 | Build QuestList component | 1.5.10 | Low | |
| 1.5.12 | Build QuestInput component (for submitting completion data) | 1.5.10 | Medium | |
| 1.5.13 | Create daily quest generation logic (runs at day start) | 1.5.3, 1.3.5 | Medium | ✅ Done (in getTodayQuests) |

### 1.6 XP Ledger System

| ID | Task | Dependencies | Complexity | Status |
|----|------|--------------|------------|--------|
| 1.6.1 | Create XP event creation service | 1.3.6 | Medium | ✅ Done |
| 1.6.2 | Implement SHA256 hash generation for event immutability | 1.6.1 | Low | ✅ Done |
| 1.6.3 | Implement modifier application pipeline (bonuses first, penalties second) | 1.6.1, 1.3.7 | Medium | ✅ Done |
| 1.6.4 | Create `/api/xp/timeline` GET endpoint | 1.2.5, 1.3.6 | Low | ✅ Done |
| 1.6.5 | Create `/api/xp/:eventId/breakdown` GET endpoint | 1.6.4 | Low | ✅ Done |
| 1.6.6 | Create `/api/xp/level-progress` GET endpoint | 1.4.4 | Low | ✅ Done |
| 1.6.7 | Implement level-up detection and user update | 1.6.1, 1.4.3 | Medium | ✅ Done |
| 1.6.8 | Build XPTimeline component | 1.6.4 | Medium | |

### 1.7 Streak Tracking

| ID | Task | Dependencies | Complexity | Status |
|----|------|--------------|------------|--------|
| 1.7.1 | Implement streak calculation service (`computeStreaks`) | 1.3.5 | Medium | |
| 1.7.2 | Create `/api/player/streak` GET endpoint | 1.7.1 | Low | |
| 1.7.3 | Implement streak bonus modifier (7/14/30 day bonuses) | 1.7.1, 1.6.3 | Medium | |
| 1.7.4 | Build StreakFire component (visual streak indicator) | 1.7.2 | Medium | |
| 1.7.5 | Add streak info to player dashboard | 1.7.2, 1.7.4 | Low | |

### 1.8 System Window UI (Core Aesthetic)

| ID | Task | Dependencies | Complexity | Status |
|----|------|--------------|------------|--------|
| 1.8.1 | Define CSS variables for system theme | 1.1.2 | Low | ✅ Done |
| 1.8.2 | Install JetBrains Mono font | 1.1.2 | Low | ✅ Done |
| 1.8.3 | Create SystemWindow component (base container) | 1.8.1 | Medium | ✅ Done (CSS class .system-window) |
| 1.8.4 | Create SystemMessage component (narrative text display) | 1.8.3 | Medium | |
| 1.8.5 | Create TypewriterText component (animated text reveal) | 1.8.4 | Medium | ⏳ Partial (CSS animation done) |
| 1.8.6 | Build AppShell layout component | 1.8.3 | Medium | |
| 1.8.7 | Build Navbar component | 1.8.6 | Low | |
| 1.8.8 | Configure Framer Motion for animations | 1.1.2 | Low | ✅ Done |
| 1.8.9 | Create glow/accent effects utilities | 1.8.1 | Low | ✅ Done |

### 1.9 Core Pages

| ID | Task | Dependencies | Complexity | Status |
|----|------|--------------|------------|--------|
| 1.9.1 | Set up React Router with route structure | 1.1.2 | Low | ✅ Done |
| 1.9.2 | Build Dashboard page (stats overview, today's quests) | 1.4.6, 1.5.11 | High | ⏳ Partial (basic layout done, needs API integration) |
| 1.9.3 | Build Quests page (full quest management) | 1.5.11 | Medium | |
| 1.9.4 | Build Profile page (detailed stats, settings) | 1.4.6 | Medium | ✅ Done (route exists, redirects to Dashboard) |
| 1.9.5 | Build onboarding flow (first-time user experience) | 1.8.5 | High | |

### 1.10 Mobile App & Apple HealthKit

| ID | Task | Dependencies | Complexity | Status |
|----|------|--------------|------------|--------|
| 1.10.1 | Initialize React Native + Expo project structure | 1.1.1 | Medium | |
| 1.10.2 | Configure react-native-health for HealthKit access | 1.10.1 | Medium | |
| 1.10.3 | Implement HealthKit permission request flow | 1.10.2 | Medium | |
| 1.10.4 | Create HealthKit data fetchers (steps, workouts, sleep, exercise) | 1.10.2 | Medium | |
| 1.10.5 | Build health snapshot capture service | 1.10.4 | Low | |
| 1.10.6 | Create HealthSnapshot schema in Drizzle | 1.1.5 | Low | |
| 1.10.7 | Create `/api/health/sync` POST endpoint | 1.10.6, 1.2.5 | Medium | |
| 1.10.8 | Create `/api/health/today` GET endpoint | 1.10.6, 1.2.5 | Low | |
| 1.10.9 | Implement quest auto-evaluation from health data | 1.10.7, 1.5.6 | High | |
| 1.10.10 | Configure react-native-background-fetch for background sync | 1.10.5 | Medium | |
| 1.10.11 | Implement offline sync queue with AsyncStorage | 1.10.5 | Medium | |
| 1.10.12 | Build mobile SystemWindow component (Reanimated) | 1.10.1 | Medium | |
| 1.10.13 | Build mobile StatBlock component | 1.10.12 | Medium | |
| 1.10.14 | Build mobile QuestCard component | 1.10.12 | Medium | |
| 1.10.15 | Build mobile Dashboard screen | 1.10.13, 1.10.14 | High | |
| 1.10.16 | Build mobile Quests screen | 1.10.14 | Medium | |
| 1.10.17 | Build mobile Profile screen | 1.10.13 | Medium | |
| 1.10.18 | Build HealthKit permission onboarding screen | 1.10.3, 1.10.12 | Medium | |
| 1.10.19 | Implement app-open sync trigger | 1.10.5, 1.10.7 | Low | |
| 1.10.20 | Implement pull-to-refresh sync | 1.10.5 | Low | |
| 1.10.21 | Add push notification for quest completion | 1.10.9 | Medium | |
| 1.10.22 | Configure Expo build for iOS distribution | 1.10.1 | Medium | |

### 1.11 Nutrition Tracking (LogMeal AI)

| ID | Task | Dependencies | Complexity | Status |
|----|------|--------------|------------|--------|
| 1.11.1 | Create MealLog and DailyNutrition schemas in Drizzle | 1.1.5 | Low | |
| 1.11.2 | Implement LogMeal API service (image analysis) | 1.1.3 | Medium | |
| 1.11.3 | Set up image storage service (S3/R2) | 1.1.3 | Medium | |
| 1.11.4 | Create `/api/nutrition/log` POST endpoint (photo upload) | 1.11.1, 1.11.2, 1.11.3, 1.2.5 | High | |
| 1.11.5 | Create `/api/nutrition/today` GET endpoint | 1.11.1, 1.2.5 | Low | |
| 1.11.6 | Create `/api/nutrition/history` GET endpoint | 1.11.1, 1.2.5 | Low | |
| 1.11.7 | Implement daily nutrition aggregation service | 1.11.1 | Medium | |
| 1.11.8 | Implement nutrition quest evaluation | 1.11.7, 1.5.6 | Medium | |
| 1.11.9 | Build mobile camera capture screen | 1.10.1 | Medium | |
| 1.11.10 | Build meal analysis result UI | 1.11.9, 1.10.12 | Medium | |
| 1.11.11 | Build macro display component (calories/protein/carbs/fat) | 1.10.12 | Low | |
| 1.11.12 | Build food detection list component | 1.10.12 | Low | |
| 1.11.13 | Build nutrition dashboard section | 1.11.11, 1.11.5 | Medium | |
| 1.11.14 | Add nutrition tab to mobile app | 1.11.9, 1.11.13 | Low | |
| 1.11.15 | Create nutrition quest templates (protein target, calorie limit, etc.) | 1.3.9, 1.11.8 | Low | |
| 1.11.16 | Add optional HealthKit dietary data sync | 1.10.4 | Low | |

---

## Phase 2: V1 (Enhanced Features)

### 2.1 Debuff System

| ID | Task | Dependencies | Complexity |
|----|------|--------------|------------|
| 2.1.1 | Implement debuff trigger logic (miss ≥2 core dailies) | 1.3.5 | Medium |
| 2.1.2 | Add debuff modifier to XP calculation | 1.6.3, 2.1.1 | Low |
| 2.1.3 | Create debuff expiration check service | 2.1.1 | Low |
| 2.1.4 | Add debuff status to player response | 1.4.1, 2.1.1 | Low |
| 2.1.5 | Build debuff notification UI | 2.1.4 | Medium |
| 2.1.6 | Add debuff narrative content | 2.1.5 | Low |

### 2.2 Titles & Passives System

| ID | Task | Dependencies | Complexity |
|----|------|--------------|------------|
| 2.2.1 | Create Title model in Drizzle | 1.1.5 | Low |
| 2.2.2 | Create UserTitle model (many-to-many with active title) | 2.2.1 | Low |
| 2.2.3 | Implement title condition evaluator (STREAK_DAYS, CUMULATIVE_COUNT, etc.) | 2.2.1 | High |
| 2.2.4 | Implement passive effect application | 2.2.3, 1.6.3 | Medium |
| 2.2.5 | Seed initial titles (The Consistent, Alcohol Slayer, etc.) | 2.2.1 | Low |
| 2.2.6 | Create `/api/player/titles` GET endpoint | 2.2.2 | Low |
| 2.2.7 | Create `/api/player/title/active` PUT endpoint | 2.2.2 | Low |
| 2.2.8 | Implement title unlock detection service | 2.2.3 | Medium |
| 2.2.9 | Implement title regression logic (for titles that can regress) | 2.2.8 | Medium |
| 2.2.10 | Build TitleCard component | 2.2.6 | Medium |
| 2.2.11 | Build TitleUnlockModal component | 2.2.10 | Medium |
| 2.2.12 | Add titles section to Profile page | 2.2.10 | Low |

### 2.3 Weekly Quests

| ID | Task | Dependencies | Complexity |
|----|------|--------------|------------|
| 2.3.1 | Create weekly quest templates | 1.3.3 | Low |
| 2.3.2 | Implement weekly quest generation logic | 2.3.1 | Medium |
| 2.3.3 | Implement weekly quest tracking (accumulate daily progress) | 2.3.2 | Medium |
| 2.3.4 | Add weekly completion bonus XP (5/7, 7/7) | 2.3.3 | Low |
| 2.3.5 | Update quests page to show weekly quests | 2.3.3 | Medium |
| 2.3.6 | Build WeeklyQuestCard component | 2.3.5 | Medium |

### 2.4 XP Breakdown & Timeline

| ID | Task | Dependencies | Complexity |
|----|------|--------------|------------|
| 2.4.1 | Enhance XP timeline with filtering | 1.6.4 | Low |
| 2.4.2 | Build detailed XP breakdown modal | 1.6.5 | Medium |
| 2.4.3 | Add modifier visualization to breakdown | 2.4.2 | Medium |
| 2.4.4 | Build LevelUpModal component with animation | 1.6.7 | High |
| 2.4.5 | Add XP gain animation on quest completion | 2.4.4 | Medium |

### 2.5 Mastra Agent Integration

| ID | Task | Dependencies | Complexity |
|----|------|--------------|------------|
| 2.5.1 | Install and configure Mastra framework | 1.1.3 | Medium |
| 2.5.2 | Create player-stats tool | 2.5.1, 1.4.1 | Low |
| 2.5.3 | Create quest-requirements tool | 2.5.1, 1.5.2 | Medium |
| 2.5.4 | Create xp-ledger tool | 2.5.1, 1.6.1 | Medium |
| 2.5.5 | Create streak-checker tool | 2.5.1, 1.7.1 | Low |
| 2.5.6 | Create title-conditions tool | 2.5.1, 2.2.3 | Medium |
| 2.5.7 | Build quest-evaluator agent | 2.5.2, 2.5.3 | High |
| 2.5.8 | Build xp-calculator agent | 2.5.4, 2.5.5 | High |
| 2.5.9 | Build title-evaluator agent | 2.5.6 | High |
| 2.5.10 | Integrate agents into quest completion flow | 2.5.7, 2.5.8 | Medium |

### 2.6 Narrative Content System

| ID | Task | Dependencies | Complexity |
|----|------|--------------|------------|
| 2.6.1 | Create NarrativeContent model in Drizzle | 1.1.5 | Low |
| 2.6.2 | Implement NarrativeService (getContent, interpolate) | 2.6.1 | Low |
| 2.6.3 | Seed initial narrative content | 2.6.1 | Medium |
| 2.6.4 | Create `/api/content/:key` GET endpoint | 2.6.2 | Low |
| 2.6.5 | Create `/api/content/category/:cat` GET endpoint | 2.6.2 | Low |
| 2.6.6 | Create useNarrative hook for frontend | 2.6.4 | Low |
| 2.6.7 | Integrate narrative content into onboarding | 2.6.6, 1.9.5 | Medium |
| 2.6.8 | Add narrative content to quest cards | 2.6.6 | Low |

### 2.7 Quest Variety System

| ID | Task | Dependencies | Complexity |
|----|------|--------------|------------|
| 2.7.1 | Create RotatingQuest model in Drizzle | 1.1.5 | Low |
| 2.7.2 | Create BonusQuest model in Drizzle | 1.1.5 | Low |
| 2.7.3 | Seed rotating quest pool (15+ quests) | 2.7.1 | Medium |
| 2.7.4 | Seed bonus quest templates (stretch, time, stack) | 2.7.2 | Medium |
| 2.7.5 | Implement rotating quest selection algorithm | 2.7.3 | Medium |
| 2.7.6 | Implement bonus quest generation logic | 2.7.4 | Medium |
| 2.7.7 | Create `/api/quests/rotating` GET endpoint | 2.7.5, 1.2.5 | Low |
| 2.7.8 | Create `/api/quests/bonus` GET endpoint | 2.7.6, 1.2.5 | Low |
| 2.7.9 | Create `/api/quests/bonus/reroll` POST endpoint | 2.7.8 | Low |
| 2.7.10 | Implement rotating quest unlock (Day 8) | 2.7.5, 1.3.5 | Low |
| 2.7.11 | Implement bonus quest unlock (Level 5) | 2.7.6, 1.4.3 | Low |
| 2.7.12 | Create seasonal quest templates | 2.7.1, 3.3.1 | Medium |
| 2.7.13 | Build RotatingQuestCard component | 2.7.7 | Medium |
| 2.7.14 | Build BonusQuestCard component | 2.7.8 | Medium |
| 2.7.15 | Update quest board UI with all quest types | 2.7.13, 2.7.14 | Medium |
| 2.7.16 | Add quest variety to mobile app | 2.7.15, 1.10.14 | Medium |

### 2.8 Failure & Recovery System

| ID | Task | Dependencies | Complexity |
|----|------|--------------|------------|
| 2.8.1 | Create PlayerAbsence tracking model | 1.1.5 | Low |
| 2.8.2 | Implement lapsed player detection service | 2.8.1, 1.3.5 | Medium |
| 2.8.3 | Create Return Protocol quest chain | 2.8.2, 1.3.3 | Medium |
| 2.8.4 | Implement comeback title conditions | 2.8.2, 2.2.3 | Medium |
| 2.8.5 | Seed comeback titles (Returner, Twice Fallen, Persistent, Phoenix) | 2.8.4 | Low |
| 2.8.6 | Create `/api/player/return-status` GET endpoint | 2.8.2, 1.2.5 | Low |
| 2.8.7 | Create `/api/player/return-protocol` POST endpoint | 2.8.3, 1.2.5 | Low |
| 2.8.8 | Implement soft reset option for long absences | 2.8.2 | Medium |
| 2.8.9 | Build return welcome screen | 2.8.6, 1.8.3 | Medium |
| 2.8.10 | Build Return Protocol UI | 2.8.7, 1.8.3 | Medium |
| 2.8.11 | Configure optional re-engagement push notifications | 2.8.2, 1.10.21 | Low |
| 2.8.12 | Add failure context to narrator agent | 2.8.2, 2.5.1 | Medium |

### 2.9 Mastra Narrative Agents

| ID | Task | Dependencies | Complexity |
|----|------|--------------|------------|
| 2.9.1 | Create narrator agent for dynamic narrative | 2.5.1, 2.6.2 | High |
| 2.9.2 | Create observer agent for pattern analysis | 2.5.1, 1.7.1 | High |
| 2.9.3 | Create quest-generator agent for personalization | 2.5.1, 2.7.5 | High |
| 2.9.4 | Implement player context builder for agents | 2.9.1, 1.4.1 | Medium |
| 2.9.5 | Create `/api/narrative/generate` POST endpoint | 2.9.1, 1.2.5 | Medium |
| 2.9.6 | Integrate narrator into daily login flow | 2.9.5, 1.9.2 | Medium |
| 2.9.7 | Integrate narrator into failure/streak events | 2.9.5, 2.8.2 | Medium |
| 2.9.8 | Add quest personalization based on player patterns | 2.9.3, 2.7.5 | High |

---

## Phase 3: V2 (Advanced Features)

### 3.1 Boss Fight System

| ID | Task | Dependencies | Complexity |
|----|------|--------------|------------|
| 3.1.1 | Create Boss model in Drizzle | 1.1.5 | Low |
| 3.1.2 | Create BossPhase model | 3.1.1 | Low |
| 3.1.3 | Create BossAttempt model | 3.1.1 | Low |
| 3.1.4 | Seed initial bosses (The Inconsistent One, The Excuse Maker, The Comfortable Self) | 3.1.1, 3.1.2 | Medium |
| 3.1.5 | Create `/api/bosses` GET endpoint | 3.1.1 | Low |
| 3.1.6 | Create `/api/bosses/:id` GET endpoint | 3.1.5 | Low |
| 3.1.7 | Create `/api/bosses/:id/start` POST endpoint | 3.1.3 | Medium |
| 3.1.8 | Create `/api/bosses/:id/attempt` GET endpoint | 3.1.3 | Low |
| 3.1.9 | Create `/api/bosses/:id/abandon` POST endpoint | 3.1.3 | Low |
| 3.1.10 | Implement boss phase progression logic | 3.1.7 | High |
| 3.1.11 | Implement boss victory/defeat detection | 3.1.10 | Medium |
| 3.1.12 | Add boss XP rewards | 3.1.11, 1.6.1 | Low |
| 3.1.13 | Build BossArena component | 3.1.5 | High |
| 3.1.14 | Build PhaseProgress component | 3.1.8 | Medium |
| 3.1.15 | Build BossMonologue component | 3.1.6 | Medium |
| 3.1.16 | Build Boss page (`/boss/[id]`) | 3.1.13, 3.1.14, 3.1.15 | High |

### 3.2 Dungeon System

| ID | Task | Dependencies | Complexity |
|----|------|--------------|------------|
| 3.2.1 | Create Dungeon model in Drizzle | 1.1.5 | Low |
| 3.2.2 | Create DungeonAttempt model | 3.2.1 | Low |
| 3.2.3 | Define dungeon challenge DSL | 3.2.1 | Medium |
| 3.2.4 | Seed initial dungeons (by difficulty rank) | 3.2.1 | Medium |
| 3.2.5 | Create `/api/dungeons` GET endpoint | 3.2.1 | Low |
| 3.2.6 | Create `/api/dungeons/:id` GET endpoint | 3.2.5 | Low |
| 3.2.7 | Create `/api/dungeons/:id/enter` POST endpoint | 3.2.2 | Medium |
| 3.2.8 | Create `/api/dungeons/:id/progress` POST endpoint | 3.2.2 | Medium |
| 3.2.9 | Implement dungeon timer logic | 3.2.7 | Medium |
| 3.2.10 | Implement dungeon completion/failure detection | 3.2.8 | Medium |
| 3.2.11 | Implement dungeon XP multiplier | 3.2.10, 1.6.3 | Low |
| 3.2.12 | Implement dungeon cooldown | 3.2.10 | Low |
| 3.2.13 | Block dungeon bonuses during debuff | 3.2.11, 2.1.1 | Low |
| 3.2.14 | Build DungeonCard component | 3.2.5 | Medium |
| 3.2.15 | Build DungeonArena component | 3.2.7 | High |
| 3.2.16 | Build Dungeon page (`/dungeon/[id]`) | 3.2.14, 3.2.15 | High |

### 3.3 Season System

| ID | Task | Dependencies | Complexity |
|----|------|--------------|------------|
| 3.3.1 | Create Season model in Drizzle | 1.1.5 | Low |
| 3.3.2 | Create SeasonParticipation model | 3.3.1 | Low |
| 3.3.3 | Create SeasonLeaderboard model | 3.3.1 | Low |
| 3.3.4 | Seed initial seasons (Awakening, The Contender, The Monarch) | 3.3.1 | Low |
| 3.3.5 | Create `/api/seasons/current` GET endpoint | 3.3.1 | Low |
| 3.3.6 | Create `/api/seasons/:id/leaderboard` GET endpoint | 3.3.3 | Medium |
| 3.3.7 | Create `/api/seasons/history` GET endpoint | 3.3.1 | Low |
| 3.3.8 | Implement season XP multiplier | 3.3.1, 1.6.3 | Low |
| 3.3.9 | Implement seasonal XP tracking (separate from total) | 3.3.2 | Medium |
| 3.3.10 | Implement leaderboard update job | 3.3.3 | Medium |
| 3.3.11 | Build SeasonBanner component | 3.3.5 | Medium |
| 3.3.12 | Build LeaderboardTable component | 3.3.6 | Medium |
| 3.3.13 | Build Season page | 3.3.11, 3.3.12 | Medium |

### 3.4 Narrative Content System

| ID | Task | Dependencies | Complexity |
|----|------|--------------|------------|
| 3.4.1 | Create NarrativeService with getContent/interpolate | 1.1.5 | Medium |
| 3.4.2 | Create /api/content/:key endpoint | 3.4.1 | Low |
| 3.4.3 | Create /api/content/category/:category endpoint | 3.4.1 | Low |
| 3.4.4 | Create useNarrative hook for frontend | 3.4.2 | Low |
| 3.4.5 | Integrate narratives into quest completion flow | 3.4.4 | Medium |
| 3.4.6 | Integrate narratives into daily login | 3.4.4 | Medium |

> **Note:** Narrative content stored directly in PostgreSQL `narrativeContents` table, no external CMS.

### 3.5 Leaderboards

| ID | Task | Dependencies | Complexity |
|----|------|--------------|------------|
| 3.5.1 | Implement global leaderboard query | 3.3.3 | Medium |
| 3.5.2 | Add pagination to leaderboard | 3.5.1 | Low |
| 3.5.3 | Add "your rank" indicator | 3.5.1 | Low |
| 3.5.4 | Build LeaderboardPage | 3.3.12 | Medium |
| 3.5.5 | Add leaderboard link to navbar | 3.5.4 | Low |

### 3.6 Social System — Shadows & Accountability

| ID | Task | Dependencies | Complexity |
|----|------|--------------|------------|
| 3.6.1 | Create AccountabilityPair model in Drizzle | 1.1.5 | Low |
| 3.6.2 | Create LeaderboardPrefs model in Drizzle | 1.1.5 | Low |
| 3.6.3 | Implement shadow observation service | 1.4.1, 1.7.1 | Medium |
| 3.6.4 | Create `/api/social/shadows` GET endpoint | 3.6.3, 1.2.5 | Low |
| 3.6.5 | Create `/api/accountability/request` POST endpoint | 3.6.1, 1.2.5 | Medium |
| 3.6.6 | Create `/api/accountability/:id/accept` POST endpoint | 3.6.5 | Low |
| 3.6.7 | Create `/api/accountability/:id` DELETE endpoint | 3.6.5 | Low |
| 3.6.8 | Create `/api/accountability/:id/nudge` POST endpoint | 3.6.5 | Low |
| 3.6.9 | Implement accountability partner view service | 3.6.1 | Medium |
| 3.6.10 | Build ShadowObservation component | 3.6.4, 1.8.3 | Medium |
| 3.6.11 | Build AccountabilityPartner component | 3.6.9, 1.8.3 | Medium |
| 3.6.12 | Build AccountabilityDashboard page | 3.6.11 | Medium |
| 3.6.13 | Create `/api/leaderboards/preferences` PATCH endpoint | 3.6.2, 1.2.5 | Low |
| 3.6.14 | Add social section to mobile app | 3.6.10, 3.6.11, 1.10.14 | Medium |

### 3.7 Social System — Guilds

| ID | Task | Dependencies | Complexity |
|----|------|--------------|------------|
| 3.7.1 | Create Guild model in Drizzle | 1.1.5 | Low |
| 3.7.2 | Create GuildMember model in Drizzle | 3.7.1 | Low |
| 3.7.3 | Create GuildChallenge model in Drizzle | 3.7.1 | Low |
| 3.7.4 | Create `/api/guilds` POST endpoint (create guild) | 3.7.1, 1.2.5 | Medium |
| 3.7.5 | Create `/api/guilds/:id` GET endpoint | 3.7.1, 1.2.5 | Low |
| 3.7.6 | Create `/api/guilds/:id/invite` POST endpoint | 3.7.2, 1.2.5 | Medium |
| 3.7.7 | Create `/api/guilds/:id/join` POST endpoint | 3.7.2, 1.2.5 | Medium |
| 3.7.8 | Create `/api/guilds/:id/leave` DELETE endpoint | 3.7.2, 1.2.5 | Low |
| 3.7.9 | Create `/api/guilds/:id/challenges` GET endpoint | 3.7.3, 1.2.5 | Low |
| 3.7.10 | Implement guild challenge evaluation service | 3.7.3, 1.5.6 | High |
| 3.7.11 | Seed guild challenge templates | 3.7.3 | Medium |
| 3.7.12 | Build GuildCard component | 3.7.5, 1.8.3 | Medium |
| 3.7.13 | Build GuildBoard component | 3.7.9, 1.8.3 | High |
| 3.7.14 | Build GuildPage | 3.7.12, 3.7.13 | High |
| 3.7.15 | Add guild leaderboard to leaderboards page | 3.7.1, 3.5.4 | Medium |
| 3.7.16 | Add guild features to mobile app | 3.7.12, 3.7.13, 1.10.14 | High |

### 3.8 Social System — Raid Bosses

| ID | Task | Dependencies | Complexity |
|----|------|--------------|------------|
| 3.8.1 | Create Raid model in Drizzle | 1.1.5, 3.1.1 | Low |
| 3.8.2 | Create RaidMember model in Drizzle | 3.8.1 | Low |
| 3.8.3 | Seed raid boss configurations | 3.8.1, 3.1.4 | Medium |
| 3.8.4 | Create `/api/raids` POST endpoint (start formation) | 3.8.1, 1.2.5 | Medium |
| 3.8.5 | Create `/api/raids/:id/join` POST endpoint | 3.8.2, 1.2.5 | Medium |
| 3.8.6 | Create `/api/raids/:id` GET endpoint | 3.8.1, 1.2.5 | Low |
| 3.8.7 | Create `/api/raids/available` GET endpoint | 3.8.1, 1.2.5 | Low |
| 3.8.8 | Implement raid phase evaluation service | 3.8.1, 3.1.10 | High |
| 3.8.9 | Implement cascade failure logic | 3.8.8 | Medium |
| 3.8.10 | Build RaidArena component | 3.8.6, 3.1.13 | High |
| 3.8.11 | Build RaidFormation component | 3.8.4, 1.8.3 | Medium |
| 3.8.12 | Build RaidPage | 3.8.10, 3.8.11 | High |
| 3.8.13 | Add raid features to mobile app | 3.8.10, 3.8.11, 1.10.14 | High |

### 3.9 Content Seeding (Database)

| ID | Task | Dependencies | Complexity |
|----|------|--------------|------------|
| 3.9.1 | Seed onboarding narrative content (5 items) | 3.4.1 | Low |
| 3.9.2 | Seed daily quest narratives (20+ items) | 3.4.1 | Medium |
| 3.9.3 | Seed streak milestone content (8 items) | 3.4.1 | Low |
| 3.9.4 | Seed debuff/recovery content (10 items) | 3.4.1 | Low |
| 3.9.5 | Seed level up content (10 items) | 3.4.1 | Low |
| 3.9.6 | Seed boss content (30+ items: intros, phases, defeat) | 3.4.1 | High |
| 3.9.7 | Seed title content (25+ items) | 3.4.1 | Medium |
| 3.9.8 | Seed dungeon content (20+ items) | 3.4.1 | Medium |
| 3.9.9 | Seed season content (15+ items) | 3.4.1 | Medium |
| 3.9.10 | Seed failure/return content (15+ items) | 3.4.1 | Medium |
| 3.9.11 | Seed rotating quest descriptions (15+ items) | 3.4.1 | Medium |
| 3.9.12 | Seed bonus quest descriptions (15+ items) | 3.4.1 | Medium |
| 3.9.13 | Seed system philosophy content (10+ items) | 3.4.1 | Low |
| 3.9.14 | Seed social content (shadows, guilds, raids - 40+ items) | 3.4.1 | Medium |
| 3.9.15 | Create content validation script | 3.9.1-3.9.14 | Medium |
| 3.9.16 | Content review and tone consistency check | 3.9.15 | High |

> **Note:** All content seeded via TypeScript seed scripts directly into PostgreSQL.

---

## Phase 4: Operations & Polish

### 4.1 Cron Jobs

| ID | Task | Dependencies | Complexity |
|----|------|--------------|------------|
| 4.1.1 | Set up cron job infrastructure | 1.1.3 | Medium |
| 4.1.2 | Implement `evaluateDailyLogs` job (4:00 AM UTC) | 4.1.1, 1.3.5 | Medium |
| 4.1.3 | Implement `computeStreaks` job (4:05 AM UTC) | 4.1.1, 1.7.1 | Low |
| 4.1.4 | Implement `checkDebuffs` job (4:10 AM UTC) | 4.1.1, 2.1.3 | Low |
| 4.1.5 | Implement `reconcileXP` job (4:30 AM UTC) | 4.1.1, 1.6.1 | Medium |
| 4.1.6 | Implement `updateLeaderboard` job (hourly) | 4.1.1, 3.3.10 | Low |
| 4.1.7 | Implement `evaluateTitles` job (5:00 AM UTC) | 4.1.1, 2.2.8 | Medium |

### 4.2 Game Config System

| ID | Task | Dependencies | Complexity |
|----|------|--------------|------------|
| 4.2.1 | Create GameConfig model in Drizzle | 1.1.5 | Low |
| 4.2.2 | Implement GameConfigService | 4.2.1 | Low |
| 4.2.3 | Move XP values to GameConfig | 4.2.2 | Low |
| 4.2.4 | Move modifier values to GameConfig | 4.2.2 | Low |
| 4.2.5 | Add config versioning | 4.2.2 | Low |

### 4.3 Error Handling & Logging

| ID | Task | Dependencies | Complexity |
|----|------|--------------|------------|
| 4.3.1 | Create error handler middleware | 1.1.3 | Low |
| 4.3.2 | Implement structured logging | 1.1.3 | Low |
| 4.3.3 | Add request/response logging | 4.3.2 | Low |
| 4.3.4 | Create error boundary for React | 1.1.2 | Low |
| 4.3.5 | Add toast notifications for errors | 4.3.4 | Low |

### 4.4 Testing

| ID | Task | Dependencies | Complexity |
|----|------|--------------|------------|
| 4.4.1 | Set up Vitest for backend | 1.1.3 | Low |
| 4.4.2 | Set up Vitest for frontend | 1.1.2 | Low |
| 4.4.3 | Write unit tests for XP calculation | 4.4.1, 1.4.3 | Medium |
| 4.4.4 | Write unit tests for streak calculation | 4.4.1, 1.7.1 | Medium |
| 4.4.5 | Write unit tests for requirement evaluation | 4.4.1, 1.5.2 | Medium |
| 4.4.6 | Write integration tests for quest completion flow | 4.4.1 | High |
| 4.4.7 | Write component tests for core UI | 4.4.2 | Medium |

### 4.5 Deployment

| ID | Task | Dependencies | Complexity |
|----|------|--------------|------------|
| 4.5.1 | Set up production PostgreSQL | - | Medium |
| 4.5.2 | Configure production environment variables | 4.5.1 | Low |
| 4.5.3 | Set up CI/CD pipeline | - | Medium |
| 4.5.4 | Deploy backend to hosting platform | 4.5.3 | Medium |
| 4.5.5 | Deploy frontend to hosting platform | 4.5.3 | Medium |
| 4.5.6 | Set up monitoring and alerting | 4.5.4 | Medium |
| 4.5.7 | Configure backup strategy | 4.5.1 | Low |

---

## Task Summary

| Phase | Tasks | Estimated Complexity |
|-------|-------|---------------------|
| Phase 1: MVP | 115 tasks | Foundation (includes Mobile/HealthKit/Nutrition) |
| Phase 2: V1 | 80 tasks | Enhanced (Quest Variety/Failure Recovery/Narrative Agents) |
| Phase 3: V2 | 108 tasks | Advanced (Social Systems/Content Seeding) |
| Phase 4: Operations | 26 tasks | Polish |
| **Total** | **329 tasks** | — |

---

## Recommended Execution Order

### Sprint 1: Foundation
1. Project Setup (1.1.1-1.1.9)
2. Database Schema Core (1.3.1-1.3.10)
3. Authentication (1.2.1-1.2.10)

### Sprint 2: Core Game Loop
1. Player Stats System (1.4.1-1.4.8)
2. XP Ledger System (1.6.1-1.6.8)
3. System Window UI (1.8.1-1.8.9)

### Sprint 3: Quest System
1. Daily Quest System (1.5.1-1.5.13)
2. Streak Tracking (1.7.1-1.7.5)
3. Core Pages (1.9.1-1.9.5)

### Sprint 3.5: Mobile & HealthKit (Can run parallel to Sprint 3)
1. Mobile Project Setup (1.10.1-1.10.2)
2. HealthKit Integration (1.10.3-1.10.5)
3. Health API & Auto-Evaluation (1.10.6-1.10.9)
4. Mobile UI Components (1.10.12-1.10.18)
5. Background Sync & Offline (1.10.10-1.10.11, 1.10.19-1.10.22)

### Sprint 3.6: Nutrition Tracking (Can run parallel to Sprint 3.5)
1. Nutrition Backend (1.11.1-1.11.3)
2. Nutrition API Endpoints (1.11.4-1.11.6)
3. Nutrition Quest Evaluation (1.11.7-1.11.8)
4. Mobile Nutrition UI (1.11.9-1.11.14)
5. Nutrition Quests & HealthKit Sync (1.11.15-1.11.16)

### Sprint 4: Enhanced Features
1. Debuff System (2.1.1-2.1.6)
2. Titles & Passives (2.2.1-2.2.12)
3. XP Breakdown (2.4.1-2.4.5)

### Sprint 5: Advanced Content
1. Weekly Quests (2.3.1-2.3.6)
2. Narrative Content (2.6.1-2.6.8)
3. Mastra Integration (2.5.1-2.5.10)

### Sprint 5.5: Quest Variety & Recovery
1. Quest Variety System (2.7.1-2.7.16)
2. Failure & Recovery System (2.8.1-2.8.12)
3. Mastra Narrative Agents (2.9.1-2.9.8)

### Sprint 6: Boss & Dungeon
1. Boss Fight System (3.1.1-3.1.16)
2. Dungeon System (3.2.1-3.2.16)

### Sprint 7: Seasons & Content
1. Season System (3.3.1-3.3.13)
2. Narrative Content (3.4.1-3.4.6)
3. Leaderboards (3.5.1-3.5.5)

### Sprint 7.5: Content Seeding
1. Content Seeding (3.6.1-3.6.15)
2. Content validation and review

### Sprint 8: Operations
1. Cron Jobs (4.1.1-4.1.7)
2. Game Config (4.2.1-4.2.5)
3. Error Handling (4.3.1-4.3.5)
4. Testing (4.4.1-4.4.7)
5. Deployment (4.5.1-4.5.7)

---

## Parallel Execution Analysis

This section identifies tasks that can be executed concurrently, organized by execution waves and workstreams.

### Workstream Definitions

| Workstream | Focus | Skills |
|------------|-------|--------|
| **BE** | Backend (Hono, Drizzle, Services) | TypeScript, API design, DB |
| **FE** | Frontend (React, Components) | React, CSS, Framer Motion |
| **MOBILE** | Mobile App (React Native, HealthKit) | React Native, iOS, HealthKit |
| **DB** | Database (Schema, Migrations, Seeds) | Drizzle, PostgreSQL |
| **INFRA** | Infrastructure (Setup, Config) | DevOps, Environment |
| **CONTENT** | Content Management (Database) | TypeScript, Narrative design |

---

### Phase 1: MVP — Parallel Execution Waves

#### Wave 1.0: Bootstrap (No Dependencies)
```
┌─────────────────────────────────────────────────────────────────┐
│  Can start immediately — no blockers                            │
├─────────────────────────────────────────────────────────────────┤
│  INFRA: 1.1.1  Initialize monorepo structure                    │
│  INFRA: 1.1.4  Configure PostgreSQL (Docker)                    │
└─────────────────────────────────────────────────────────────────┘
```

#### Wave 1.1: Core Setup (After 1.1.1)
```
┌─────────────────────────────────────────────────────────────────┐
│  Parallel Group A (Frontend)    │  Parallel Group B (Backend)   │
├─────────────────────────────────┼───────────────────────────────┤
│  1.1.2  Vite + React setup      │  1.1.3  Hono + TS backend     │
│  1.1.6  Environment variables   │                               │
│  1.1.7  ESLint + Prettier       │                               │
└─────────────────────────────────┴───────────────────────────────┘
```

#### Wave 1.2: Framework Config (After 1.1.2 / 1.1.3 / 1.1.4)
```
┌─────────────────────────────────────────────────────────────────┐
│  FE (after 1.1.2)               │  BE/DB (after 1.1.3 + 1.1.4)  │
├─────────────────────────────────┼───────────────────────────────┤
│  1.1.8  TanStack Query client   │  1.1.5  Drizzle ORM setup     │
│  1.1.9  Zustand store           │                               │
│  1.8.1  CSS variables           │                               │
│  1.8.2  JetBrains Mono font     │                               │
│  1.8.8  Framer Motion config    │                               │
│  1.9.1  React Router setup      │                               │
│  1.2.6  Login page UI           │                               │
│  1.2.7  Signup page UI          │                               │
│  1.4.6  StatBlock component     │                               │
│  1.5.10 QuestCard component     │                               │
└─────────────────────────────────┴───────────────────────────────┘
```

#### Wave 1.3: Database Schema (After 1.1.5)
```
┌─────────────────────────────────────────────────────────────────┐
│  All can run in parallel — no inter-dependencies                │
├─────────────────────────────────────────────────────────────────┤
│  DB: 1.3.1  User model                                          │
│  DB: 1.3.2  Session/Account/Verification models                 │
│  DB: 1.3.3  QuestTemplate model                                 │
│  DB: 1.3.5  DailyLog model                                      │
│  DB: 1.3.6  XPEvent model                                       │
│  DB: 1.3.8  Enums                                               │
└─────────────────────────────────────────────────────────────────┘
```

#### Wave 1.4: Auth & Services (After Wave 1.3)
```
┌─────────────────────────────────────────────────────────────────┐
│  BE (after 1.1.5)               │  FE (after 1.1.8)             │
├─────────────────────────────────┼───────────────────────────────┤
│  1.2.1  Better Auth setup       │  1.8.3  SystemWindow          │
│  1.4.3  Level calc service      │  1.8.9  Glow effects          │
│  1.5.1  Requirement DSL types   │                               │
└─────────────────────────────────┴───────────────────────────────┘
```

#### Wave 1.5: Core Features (After Wave 1.4)
```
┌──────────────────────────────────────────────────────────────────────────────┐
│  BE Auth (after 1.2.1)     │  BE Services (after 1.4.3)  │  FE (after 1.8.3) │
├────────────────────────────┼─────────────────────────────┼───────────────────┤
│  1.2.2  Drizzle adapter    │  1.4.4  xpToNextLevel       │  1.8.4  SystemMsg │
│  1.2.3  Email/pass auth    │  1.5.2  Requirement engine  │  1.8.6  AppShell  │
│  1.2.4  Google OAuth       │  1.6.1  XP event service    │                   │
│  1.2.5  Auth middleware    │  1.7.1  Streak calc         │                   │
│  1.2.10 Session refresh    │                             │                   │
└────────────────────────────┴─────────────────────────────┴───────────────────┘
```

#### Wave 1.6: API Endpoints (After Wave 1.5)
```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Player APIs (after 1.2.5) │  Quest APIs (after 1.2.5)   │  XP APIs          │
├────────────────────────────┼─────────────────────────────┼───────────────────┤
│  1.4.1  GET /player        │  1.5.4  GET /quests         │  1.6.4  XP timeline│
│  1.4.2  GET /player/stats  │  1.3.4  QuestLog model      │  1.6.2  SHA256 hash│
│  1.7.2  GET /player/streak │  1.3.9  Seed quests         │  1.6.3  Modifiers │
│                            │  1.5.3  Core quest templates │  1.6.7  Level-up  │
└────────────────────────────┴─────────────────────────────┴───────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│  FE Hooks (after 1.4.1)    │  FE Components (after 1.8.4) │  FE Continued    │
├────────────────────────────┼─────────────────────────────┼───────────────────┤
│  1.4.5  usePlayer          │  1.8.5  TypewriterText      │  1.5.11 QuestList │
│  1.2.8  useAuth            │  1.8.7  Navbar              │  1.5.12 QuestInput│
│  1.5.9  useQuests          │  1.7.4  StreakFire          │                   │
└────────────────────────────┴─────────────────────────────┴───────────────────┘
```

#### Wave 1.7: Integration (After Wave 1.6)
```
┌─────────────────────────────────────────────────────────────────┐
│  APIs (sequential deps)         │  FE Components               │
├─────────────────────────────────┼───────────────────────────────┤
│  1.5.5  GET /quests/:id         │  1.4.7  XPBar                 │
│  1.5.6  POST /quests/:id/complete│ 1.4.8  LevelBadge            │
│  1.6.5  GET /xp/:id/breakdown   │  1.6.8  XPTimeline            │
│  1.6.6  GET /xp/level-progress  │  1.2.9  Protected routes      │
│  1.7.3  Streak bonus modifier   │                               │
└─────────────────────────────────┴───────────────────────────────┘
```

#### Wave 1.8: Pages (After Wave 1.7)
```
┌─────────────────────────────────────────────────────────────────┐
│  All pages can be built in parallel                             │
├─────────────────────────────────────────────────────────────────┤
│  FE: 1.9.2  Dashboard page                                      │
│  FE: 1.9.3  Quests page                                         │
│  FE: 1.9.4  Profile page                                        │
│  FE: 1.9.5  Onboarding flow                                     │
│  BE: 1.5.7  Quest progress tracking                             │
│  BE: 1.5.8  Partial rewards                                     │
│  BE: 1.5.13 Daily quest generation                              │
│  BE: 1.7.5  Streak in dashboard                                 │
│  DB: 1.3.10 Migration scripts                                   │
└─────────────────────────────────────────────────────────────────┘
```

#### Wave 1.9: Mobile & HealthKit (Can run parallel to Waves 1.6-1.8)
```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Mobile Setup (after 1.1.1)  │  HealthKit (after 1.10.1)   │  BE Health APIs │
├──────────────────────────────┼─────────────────────────────┼─────────────────┤
│  1.10.1  RN + Expo init      │  1.10.2  react-native-health│  1.10.6  Health │
│  1.10.12 Mobile SystemWindow │  1.10.3  Permission flow    │         schema  │
│                              │  1.10.4  Data fetchers      │  1.10.7  /sync  │
│                              │  1.10.5  Snapshot service   │  1.10.8  /today │
└──────────────────────────────┴─────────────────────────────┴─────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│  Mobile UI (after 1.10.12)   │  Sync Logic (after 1.10.5)  │  Integration    │
├──────────────────────────────┼─────────────────────────────┼─────────────────┤
│  1.10.13 Mobile StatBlock    │  1.10.10 Background fetch   │  1.10.9  Quest  │
│  1.10.14 Mobile QuestCard    │  1.10.11 Offline queue      │         auto-   │
│  1.10.15 Mobile Dashboard    │  1.10.19 App-open sync      │         eval    │
│  1.10.16 Mobile Quests       │  1.10.20 Pull-to-refresh    │  1.10.21 Push   │
│  1.10.17 Mobile Profile      │                             │         notifs  │
│  1.10.18 HK Onboarding       │                             │  1.10.22 Build  │
└──────────────────────────────┴─────────────────────────────┴─────────────────┘
```

---

### Phase 2: V1 — Parallel Execution Waves

#### Wave 2.0: Foundation (After Phase 1)
```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Debuff (after 1.3.5)      │  Titles (after 1.1.5)       │  Other            │
├────────────────────────────┼─────────────────────────────┼───────────────────┤
│  2.1.1  Debuff trigger     │  2.2.1  Title model         │  2.3.1  Weekly tpl│
│                            │                             │  2.5.1  Mastra    │
│                            │                             │  2.6.1  Narrative │
└────────────────────────────┴─────────────────────────────┴───────────────────┘
```

#### Wave 2.1: Core Systems (After Wave 2.0)
```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Debuff (after 2.1.1)      │  Titles (after 2.2.1)       │  Content          │
├────────────────────────────┼─────────────────────────────┼───────────────────┤
│  2.1.2  Debuff XP modifier │  2.2.2  UserTitle model     │  2.6.2  Narrative │
│  2.1.3  Debuff expiration  │  2.2.3  Title evaluator     │         service   │
│  2.1.4  Debuff in player   │  2.2.5  Seed titles         │  2.6.3  Seed      │
│                            │                             │         content   │
├────────────────────────────┼─────────────────────────────┼───────────────────┤
│  Weekly (after 2.3.1)      │  Mastra (after 2.5.1)       │  XP UI            │
├────────────────────────────┼─────────────────────────────┼───────────────────┤
│  2.3.2  Weekly generation  │  2.5.2  player-stats tool   │  2.4.1  XP filter │
│                            │  2.5.3  quest-req tool      │  2.4.2  XP modal  │
│                            │  2.5.4  xp-ledger tool      │                   │
│                            │  2.5.5  streak-checker tool │                   │
└────────────────────────────┴─────────────────────────────┴───────────────────┘
```

#### Wave 2.2: Features (After Wave 2.1)
```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Debuff UI                 │  Title Features              │  APIs            │
├────────────────────────────┼─────────────────────────────┼───────────────────┤
│  2.1.5  Debuff notification│  2.2.4  Passive effects     │  2.6.4  Content   │
│  2.1.6  Debuff narrative   │  2.2.6  GET /titles         │         endpoint  │
│                            │  2.2.7  PUT /title/active   │  2.6.5  Category  │
│                            │  2.2.8  Title unlock detect │         endpoint  │
├────────────────────────────┼─────────────────────────────┼───────────────────┤
│  Weekly (after 2.3.2)      │  Mastra Agents              │  XP UI            │
├────────────────────────────┼─────────────────────────────┼───────────────────┤
│  2.3.3  Weekly tracking    │  2.5.6  title-conditions    │  2.4.3  Modifier  │
│                            │  2.5.7  quest-evaluator     │         viz       │
│                            │  2.5.8  xp-calculator       │  2.4.4  LevelUp   │
│                            │                             │         modal     │
└────────────────────────────┴─────────────────────────────┴───────────────────┘
```

#### Wave 2.3: Integration (After Wave 2.2)
```
┌─────────────────────────────────────────────────────────────────┐
│  All can run in parallel                                        │
├─────────────────────────────────────────────────────────────────┤
│  2.2.9   Title regression logic                                 │
│  2.2.10  TitleCard component                                    │
│  2.2.11  TitleUnlockModal                                       │
│  2.2.12  Titles in Profile                                      │
│  2.3.4   Weekly XP bonus                                        │
│  2.3.5   Weekly quests page                                     │
│  2.3.6   WeeklyQuestCard                                        │
│  2.4.5   XP gain animation                                      │
│  2.5.9   title-evaluator agent                                  │
│  2.5.10  Agent integration                                      │
│  2.6.6   useNarrative hook                                      │
│  2.6.7   Narrative in onboarding                                │
│  2.6.8   Narrative in quests                                    │
└─────────────────────────────────────────────────────────────────┘
```

---

### Phase 3: V2 — Parallel Execution Waves

#### Wave 3.0: Models (All independent after 1.1.5)
```
┌─────────────────────────────────────────────────────────────────┐
│  Boss System               │  Dungeon System  │  Season System  │
├────────────────────────────┼──────────────────┼─────────────────┤
│  3.1.1  Boss model         │  3.2.1  Dungeon  │  3.3.1  Season  │
│                            │         model    │         model   │
├────────────────────────────┼──────────────────┼─────────────────┤
│  Content (after 1.1.5)     │                  │                 │
├────────────────────────────┤                  │                 │
│  3.4.1  NarrativeService   │                  │                 │
└────────────────────────────┴──────────────────┴─────────────────┘
```

#### Wave 3.1: Sub-models (After Wave 3.0)
```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Boss (after 3.1.1)        │  Dungeon (after 3.2.1)      │  Season           │
├────────────────────────────┼─────────────────────────────┼───────────────────┤
│  3.1.2  BossPhase model    │  3.2.2  DungeonAttempt      │  3.3.2  Season    │
│  3.1.3  BossAttempt model  │  3.2.3  Challenge DSL       │         Particip. │
│                            │  3.2.4  Seed dungeons       │  3.3.3  Season    │
│                            │                             │         Leaderbd  │
│                            │                             │  3.3.4  Seed      │
├────────────────────────────┼─────────────────────────────┼───────────────────┤
│  Content (after 3.4.1)     │                             │                   │
├────────────────────────────┤                             │                   │
│  3.4.2  Content API        │                             │                   │
│  3.4.3  Category API       │                             │                   │
│  3.4.4  useNarrative hook  │                             │                   │
└────────────────────────────┴─────────────────────────────┴───────────────────┘
```

#### Wave 3.2: APIs & Seeds (After Wave 3.1)
```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Boss APIs                 │  Dungeon APIs               │  Season APIs      │
├────────────────────────────┼─────────────────────────────┼───────────────────┤
│  3.1.4  Seed bosses        │  3.2.5  GET /dungeons       │  3.3.5  Current   │
│  3.1.5  GET /bosses        │  3.2.6  GET /dungeons/:id   │  3.3.7  History   │
│  3.1.7  POST /start        │  3.2.7  POST /enter         │  3.3.8  XP mult   │
│  3.1.8  GET /attempt       │  3.2.8  POST /progress      │  3.3.9  Season XP │
│  3.1.9  POST /abandon      │                             │                   │
├────────────────────────────┼─────────────────────────────┼───────────────────┤
│  CMS Migration             │                             │                   │
├────────────────────────────┤                             │                   │
│  3.4.6  Migrate content    │                             │                   │
│  3.4.7  Update routes      │                             │                   │
└────────────────────────────┴─────────────────────────────┴───────────────────┘
```

#### Wave 3.3: Logic & Components (After Wave 3.2)
```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Boss Logic                │  Dungeon Logic              │  Season/Board     │
├────────────────────────────┼─────────────────────────────┼───────────────────┤
│  3.1.6  GET /bosses/:id    │  3.2.9  Timer logic         │  3.3.6  Leaderbd  │
│  3.1.10 Phase progression  │  3.2.10 Completion detect   │         API       │
│  3.1.13 BossArena comp     │  3.2.14 DungeonCard         │  3.3.10 Leaderbd  │
│  3.1.14 PhaseProgress      │  3.2.15 DungeonArena        │         job       │
│  3.1.15 BossMonologue      │                             │  3.3.11 Season    │
│                            │                             │         Banner    │
│                            │                             │  3.3.12 Leaderbd  │
│                            │                             │         Table     │
└────────────────────────────┴─────────────────────────────┴───────────────────┘
```

#### Wave 3.4: Final Integration (After Wave 3.3)
```
┌─────────────────────────────────────────────────────────────────┐
│  All can run in parallel                                        │
├─────────────────────────────────────────────────────────────────┤
│  3.1.11  Boss victory/defeat detection                          │
│  3.1.12  Boss XP rewards                                        │
│  3.1.16  Boss page                                              │
│  3.2.11  Dungeon XP multiplier                                  │
│  3.2.12  Dungeon cooldown                                       │
│  3.2.13  Block dungeon during debuff                            │
│  3.2.16  Dungeon page                                           │
│  3.3.13  Season page                                            │
│  3.5.1   Global leaderboard query                               │
│  3.5.2   Leaderboard pagination                                 │
│  3.5.3   "Your rank" indicator                                  │
│  3.5.4   LeaderboardPage                                        │
│  3.5.5   Leaderboard navbar link                                │
└─────────────────────────────────────────────────────────────────┘
```

---

### Phase 4: Operations — Parallel Execution

#### Wave 4.0: Independent Setup
```
┌─────────────────────────────────────────────────────────────────┐
│  All can start independently                                    │
├─────────────────────────────────────────────────────────────────┤
│  INFRA: 4.5.1  Production PostgreSQL                            │
│  INFRA: 4.5.3  CI/CD pipeline                                   │
│  BE:    4.1.1  Cron infrastructure                              │
│  BE:    4.3.1  Error handler middleware                         │
│  BE:    4.3.2  Structured logging                               │
│  BE:    4.4.1  Vitest backend setup                             │
│  FE:    4.4.2  Vitest frontend setup                            │
│  FE:    4.3.4  Error boundary                                   │
│  DB:    4.2.1  GameConfig model                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### Wave 4.1: Dependent Tasks
```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Cron (after 4.1.1)        │  Config (after 4.2.1)       │  Tests            │
├────────────────────────────┼─────────────────────────────┼───────────────────┤
│  4.1.2  evaluateDailyLogs  │  4.2.2  GameConfigService   │  4.4.3  XP tests  │
│  4.1.3  computeStreaks     │                             │  4.4.4  Streak    │
│  4.1.4  checkDebuffs       │                             │         tests     │
│  4.1.5  reconcileXP        │                             │  4.4.5  Req tests │
│  4.1.6  updateLeaderboard  │                             │  4.4.6  Integ     │
│  4.1.7  evaluateTitles     │                             │         tests     │
│                            │                             │  4.4.7  Comp tests│
├────────────────────────────┼─────────────────────────────┼───────────────────┤
│  Logging (after 4.3.2)     │  Deploy (after 4.5.1/4.5.3) │  FE Error         │
├────────────────────────────┼─────────────────────────────┼───────────────────┤
│  4.3.3  Request logging    │  4.5.2  Prod env vars       │  4.3.5  Toasts    │
│                            │  4.5.4  Deploy backend      │                   │
│                            │  4.5.5  Deploy frontend     │                   │
└────────────────────────────┴─────────────────────────────┴───────────────────┘
```

#### Wave 4.2: Final
```
┌─────────────────────────────────────────────────────────────────┐
│  Config (after 4.2.2)      │  Deploy (after 4.5.4)            │
├────────────────────────────┼───────────────────────────────────┤
│  4.2.3  XP in GameConfig   │  4.5.6  Monitoring/alerting      │
│  4.2.4  Modifiers in Config│  4.5.7  Backup strategy          │
│  4.2.5  Config versioning  │                                   │
└────────────────────────────┴───────────────────────────────────┘
```

---

### Parallel Execution Summary by Team Size

#### Solo Developer (1 person)
Execute waves sequentially, but within each wave, batch similar tasks:
- Do all DB models together
- Do all API endpoints together
- Do all FE components together

#### 2-Person Team (FE + BE split)
```
Developer 1 (FE):            Developer 2 (BE):
─────────────────            ─────────────────
1.1.2, 1.1.8, 1.1.9         1.1.3, 1.1.4, 1.1.5
1.2.6, 1.2.7                 1.3.1-1.3.8
1.8.1-1.8.9                  1.2.1-1.2.5
1.4.6, 1.5.10, 1.5.11        1.4.1-1.4.4, 1.5.1-1.5.8
1.9.1-1.9.5                  1.6.1-1.6.7, 1.7.1-1.7.3
```

#### 3-Person Team (FE + BE + DB/Infra split)
```
FE Dev:                 BE Dev:                 DB/Infra Dev:
───────                 ───────                 ─────────────
1.1.2 setup             1.1.3 setup             1.1.4 PostgreSQL
1.8.x UI system         1.2.x auth              1.1.5 Drizzle
1.4.6, 1.5.10 comps     1.4.x, 1.5.x services   1.3.x models
1.9.x pages             1.6.x, 1.7.x services   Seeds, migrations
```

#### 4+ Person Team
Add dedicated roles:
- **FE Components**: Focus on reusable UI (1.4.6, 1.5.10, 1.8.x)
- **FE Pages**: Focus on page composition (1.9.x)
- **BE APIs**: Focus on endpoints (1.4.1, 1.5.4, 1.6.4)
- **BE Services**: Focus on business logic (1.4.3, 1.5.2, 1.6.1, 1.7.1)

---

### Maximum Parallelization Points

These are moments where the most tasks can run simultaneously:

| Wave | Max Parallel Tasks | Tasks |
|------|-------------------|-------|
| 1.3 | 6 | All DB models (1.3.1, 1.3.2, 1.3.3, 1.3.5, 1.3.6, 1.3.8) |
| 1.6 | 12 | APIs + FE hooks + components split across workstreams |
| 1.8 | 9 | All pages + final integrations |
| 1.9 | 22 | Mobile + HealthKit (runs parallel to web development) |
| 1.10 | 16 | Nutrition tracking (runs parallel to Mobile/HealthKit) |
| 2.3 | 13 | Final Phase 2 integrations |
| 3.0 | 4 | All feature domain models |
| 3.4 | 15 | Final Phase 3 integrations |
| 4.0 | 9 | Independent infrastructure setup |

---

### Dependency-Free Tasks (Can Start Anytime)

These tasks have no dependencies on other tasks in the system:

```
1.1.1   Initialize monorepo structure
1.1.4   Configure PostgreSQL (Docker)
4.5.1   Set up production PostgreSQL
4.5.3   Set up CI/CD pipeline
```

---

## Critical Path

The following tasks are on the critical path and block significant downstream work:

1. **1.1.5** (Drizzle setup) → Blocks all database work
2. **1.2.1** (Better Auth setup) → Blocks all authenticated features
3. **1.6.1** (XP event creation) → Blocks all XP-related features
4. **1.5.2** (Requirement evaluation) → Blocks quest completion
5. **1.10.2** (HealthKit config) → Blocks all health data flow
6. **1.10.9** (Quest auto-evaluation) → Blocks automatic quest completion
7. **1.11.2** (LogMeal API service) → Blocks all nutrition tracking
8. **1.11.4** (Nutrition log endpoint) → Blocks meal logging flow
9. **2.2.3** (Title condition evaluator) → Blocks title system
10. **2.5.1** (Mastra framework setup) → Blocks all AI agent features
11. **2.7.5** (Rotating quest selection) → Blocks quest variety system
12. **2.8.2** (Lapsed player detection) → Blocks failure/recovery features
13. **2.9.1** (Narrator agent) → Blocks dynamic narrative generation
14. **3.1.10** (Boss phase progression) → Blocks boss features
15. **3.2.9** (Dungeon timer logic) → Blocks dungeon features
16. **3.4.1** (NarrativeService) → Blocks all content seeding

---

## Notes

- All UI tasks assume Framer Motion is configured (1.8.8)
- All authenticated endpoints depend on auth middleware (1.2.5)
- Content system (Phase 3) can run in parallel with other Phase 3 features
- Cron jobs require all their dependent features to be complete
- Testing tasks can begin as soon as their target features are complete
