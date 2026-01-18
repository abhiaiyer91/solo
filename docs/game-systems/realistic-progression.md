# Realistic Progression System

## Overview

This system grounds the game's leveling and stats in real-world fitness achievements. Rather than arbitrary XP curves, progression represents actual physiological adaptation. Stats map to measurable capabilities, and onboarding establishes a personalized baseline through questionnaires and AI-assisted psychology conversations.

The philosophy: **Your in-game level should mean something in the real world.**

---

## Goals

- Make stats represent real-world capabilities players can verify
- Personalize starting points and scaling based on onboarding assessment
- Track body composition changes (weight, calorie deficit) as progression
- Use AI psychology conversations to understand motivation and set appropriate challenges
- Create milestones that correspond to fitness certifications and achievements

---

## User Stories

- As a user, I want my STR stat to reflect my actual strength so I can see real progress
- As a user, I want onboarding to ask about my current fitness level so the game starts appropriately
- As a user, I want to track weight loss as part of my XP/progression
- As a user, I want AI coaching that understands my psychology and barriers
- As a user, I want to earn real-world comparable achievements (e.g., "can do 10 push-ups" = STR milestone)

---

## Technical Design

### 1. Enhanced Onboarding Assessment

The current onboarding is narrative-only. We enhance it with a **baseline assessment** phase:

#### A. Fitness Questionnaire (Quantitative)

```typescript
interface BaselineAssessment {
  // Physical baselines
  currentWeight: number           // in kg or lbs
  targetWeight?: number           // optional goal
  height: number                  // for BMI calculation
  pushUpsMax: number              // max in one set (STR baseline)
  plankHoldSeconds: number        // core strength (VIT indicator)
  mileTime?: number               // minutes (AGI baseline)
  dailySteps: number              // typical daily steps
  workoutsPerWeek: number         // current activity level
  
  // Lifestyle
  sleepHours: number              // average per night
  proteinGramsDaily: number       // estimated intake
  alcoholDrinksPerWeek: number    // recovery factor
  
  // Experience level
  fitnessExperience: 'beginner' | 'intermediate' | 'advanced'
  hasGymAccess: boolean
  hasHomeEquipment: boolean
}
```

#### B. Psychology Assessment (AI-Powered)

An AI-guided conversation (using Mastra narrator agent) to understand:

- **Motivation type**: Intrinsic vs extrinsic, achievement vs social vs mastery
- **Barrier patterns**: What's stopped them before? Time? Motivation? Injury?
- **Consistency history**: How long have past fitness attempts lasted?
- **Pressure response**: Do they perform better under pressure or with flexibility?
- **Accountability needs**: Solo, partner, or group dynamics?

Example AI conversation flow:

```
System: "Before we proceed, I need to understand your history.

        Tell me: What has stopped you before?
        
        Not the excuses. The actual reason.
        
        Was it time? Energy? Interest fading?"

[User types response]

System: "So time constraints were the barrier.
        
        When you had time, did you use it?
        Or did the time exist but the action didn't happen?"
```

The AI extracts patterns and stores them for personalization:

```typescript
interface PsychologyProfile {
  motivationType: 'achievement' | 'social' | 'mastery' | 'health'
  primaryBarrier: 'time' | 'motivation' | 'knowledge' | 'injury' | 'other'
  consistencyRisk: 'low' | 'medium' | 'high'
  pressureResponse: 'positive' | 'neutral' | 'negative'
  accountabilityPreference: 'solo' | 'partner' | 'group'
  
  // AI-generated insights
  insights: string[]
  recommendedApproach: string
}
```

---

### 2. Stats Grounded in Reality

Stats should represent real capabilities:

#### STR (Strength)
| Stat Value | Real-World Equivalent | Benchmark |
|------------|----------------------|-----------|
| 10 | Cannot do push-up | Baseline |
| 15 | 5-10 push-ups | Beginner |
| 25 | 20-30 push-ups | Intermediate |
| 40 | 50+ push-ups, bodyweight pull-ups | Advanced |
| 60 | Bench press bodyweight | Athletic |
| 80 | 1.5x bodyweight bench | Competitive |
| 100 | 2x bodyweight bench | Elite |

How STR increases:
- Strength-focused workouts
- Progressive overload tracking
- Push-up/pull-up counts from HealthKit or manual entry

#### AGI (Agility/Cardio)
| Stat Value | Real-World Equivalent | Benchmark |
|------------|----------------------|-----------|
| 10 | <5,000 steps typical | Sedentary |
| 15 | 5,000-7,500 steps | Below average |
| 25 | 10,000 steps, 30min cardio | Active |
| 40 | 5K runner (<30 min) | Intermediate |
| 60 | Half marathon capable | Athletic |
| 80 | Marathon capable | Competitive |
| 100 | Ultra-endurance athlete | Elite |

How AGI increases:
- Steps (weighted by intensity from HealthKit)
- Running/cycling workouts
- Heart rate zone training

#### VIT (Vitality/Recovery)
| Stat Value | Real-World Equivalent | Benchmark |
|------------|----------------------|-----------|
| 10 | Poor sleep, poor diet | Baseline |
| 15 | Occasional good choices | Trying |
| 25 | Regular sleep, protein target | Foundation |
| 40 | Optimized recovery, low inflammation | Solid |
| 60 | Athletic-level recovery metrics | Athletic |
| 80 | Professional athlete recovery | Competitive |
| 100 | Peak human recovery capacity | Elite |

How VIT increases:
- Sleep quality (7-9 hours)
- Protein targets hit
- Hydration
- Alcohol-free days
- Body composition improvement

#### DISC (Discipline)
| Stat Value | Real-World Equivalent | Benchmark |
|------------|----------------------|-----------|
| 10 | No consistency history | New |
| 15 | 1-week streaks | Starting |
| 25 | 2-4 week streaks | Building |
| 40 | 30+ day streaks | Habit forming |
| 60 | 90+ day streaks | Established |
| 80 | 180+ day streaks | Lifestyle |
| 100 | 365+ days, never broken | Identity |

How DISC increases:
- Streak maintenance
- Showing up regardless of results
- Completing quests even on hard days

---

### 3. Body Composition & Calorie Tracking

#### The 3500 Calorie Rule

Scientific principle: ~3,500 calorie deficit = ~1 lb of fat loss

We track this as a progression mechanic:

```typescript
interface BodyCompositionProgress {
  startingWeight: number
  currentWeight: number
  targetWeight?: number
  
  // Rolling 7-day tracking
  caloriesConsumed: number[]    // Last 7 days
  caloriesBurned: number[]      // From HealthKit active calories
  netDeficit: number            // Running total
  
  // Milestones
  poundsLost: number
  poundsToMilestone: number     // e.g., next 5-lb milestone
}
```

#### XP from Weight Loss

Weight loss (when appropriate for the user's goals) grants XP:

| Achievement | XP Award | Stat Affected |
|-------------|----------|---------------|
| 1 lb lost (3,500 cal deficit) | 100 XP | +1 VIT |
| 5 lb milestone | 500 bonus XP | +5 VIT |
| 10 lb milestone | 1,000 bonus XP | +10 VIT |
| Goal weight reached | 5,000 XP | Title unlock |

**Important**: This is opt-in and only for users who set a weight loss goal. The System does not assume everyone should lose weight.

---

### 4. XP Tied to Real Achievement

#### Quest Completion XP Scaling

XP isn't flat—it scales based on actual achievement:

```typescript
interface QuestXPCalculation {
  baseXP: number                    // Minimum for completion
  performanceMultiplier: number     // Based on how well they did
  difficultyModifier: number        // Based on their baseline
  consistencyBonus: number          // Streak multiplier
  
  // Example: Steps quest
  // Target: 10,000 steps
  // User does 15,000 steps
  // performanceMultiplier = 15000/10000 = 1.5
  // XP = 25 * 1.5 = 37.5 → 37 XP
}
```

#### Difficulty Auto-Scaling

Quests adjust to the user's baseline:

- Beginner (first 2 weeks): Easier targets, same XP
- Normal: Standard targets
- Adapted: After 30 days, system adjusts based on performance history

```typescript
function getAdaptedTarget(userId: string, questType: string): number {
  // Get user's recent performance
  const recentCompletions = getRecentQuestCompletions(userId, questType, 14)
  const avgPerformance = average(recentCompletions.map(c => c.actualValue))
  const avgTarget = average(recentCompletions.map(c => c.targetValue))
  
  // If consistently exceeding by >20%, increase target
  if (avgPerformance > avgTarget * 1.2) {
    return Math.ceil(avgTarget * 1.1) // Bump up 10%
  }
  
  // If consistently failing by >20%, decrease target
  if (avgPerformance < avgTarget * 0.8) {
    return Math.floor(avgTarget * 0.9) // Reduce 10%
  }
  
  return avgTarget // Keep same
}
```

---

### 5. Level Milestones as Real Achievements

Levels should correspond to real certifications/capabilities:

| Level | Title | Real-World Equivalent |
|-------|-------|----------------------|
| 1 | Dormant | Starting point |
| 5 | Awakened | Can complete a full week of activity |
| 10 | E-Rank Hunter | Gym newbie level (3 months consistency) |
| 15 | D-Rank Hunter | Regular gym-goer (6 months) |
| 20 | C-Rank Hunter | Could pass military fitness test |
| 30 | B-Rank Hunter | Personal trainer level fitness |
| 40 | A-Rank Hunter | Amateur athlete capability |
| 50 | S-Rank Hunter | Competitive athlete level |
| 75 | National Level | Could compete regionally |
| 100 | Monarch | Elite athlete tier |

---

## Data Models

### New Tables

```typescript
// Baseline assessment from onboarding
export const baselineAssessments = pgTable('baseline_assessments', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  
  // Physical baselines
  startingWeight: real('starting_weight'),      // kg
  targetWeight: real('target_weight'),          // kg
  height: real('height'),                       // cm
  pushUpsMax: integer('push_ups_max'),
  plankHoldSeconds: integer('plank_hold_seconds'),
  mileTimeMinutes: real('mile_time_minutes'),
  dailyStepsBaseline: integer('daily_steps_baseline'),
  workoutsPerWeek: integer('workouts_per_week'),
  
  // Lifestyle
  sleepHoursBaseline: real('sleep_hours_baseline'),
  proteinGramsBaseline: integer('protein_grams_baseline'),
  alcoholDrinksPerWeek: integer('alcohol_drinks_per_week'),
  
  // Experience
  fitnessExperience: text('fitness_experience'),  // beginner|intermediate|advanced
  hasGymAccess: boolean('has_gym_access'),
  hasHomeEquipment: boolean('has_home_equipment'),
  
  assessedAt: timestamp('assessed_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// AI psychology profile
export const psychologyProfiles = pgTable('psychology_profiles', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  
  motivationType: text('motivation_type'),
  primaryBarrier: text('primary_barrier'),
  consistencyRisk: text('consistency_risk'),
  pressureResponse: text('pressure_response'),
  accountabilityPreference: text('accountability_preference'),
  
  // AI conversation transcript (for context)
  conversationLog: json('conversation_log'),
  
  // AI-generated
  insights: json('insights'),                   // string[]
  recommendedApproach: text('recommended_approach'),
  
  assessedAt: timestamp('assessed_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// Body composition tracking
export const bodyCompositionLogs = pgTable('body_composition_logs', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  
  date: text('date').notNull(),                 // YYYY-MM-DD
  weight: real('weight'),                       // kg
  caloriesConsumed: integer('calories_consumed'),
  caloriesBurned: integer('calories_burned'),   // Active calories from HealthKit
  netCalories: integer('net_calories'),         // Surplus (+) or deficit (-)
  
  // Optional detailed tracking
  bodyFatPercent: real('body_fat_percent'),
  muscleMass: real('muscle_mass'),              // kg
  
  recordedAt: timestamp('recorded_at').defaultNow(),
})

// User's adapted quest targets
export const adaptedTargets = pgTable('adapted_targets', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  questTemplateId: text('quest_template_id').notNull(),
  
  baseTarget: integer('base_target'),           // Standard target
  adaptedTarget: integer('adapted_target'),     // Personalized target
  lastAdaptedAt: timestamp('last_adapted_at'),
  
  // Performance history
  recentCompletionRate: real('recent_completion_rate'),
  recentAverageValue: real('recent_average_value'),
})
```

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/onboarding/baseline` | POST | Submit baseline assessment |
| `/api/onboarding/psychology/start` | POST | Start AI psychology conversation |
| `/api/onboarding/psychology/respond` | POST | Send response to AI, get next question |
| `/api/onboarding/psychology/complete` | POST | Finalize psychology profile |
| `/api/player/baseline` | GET | Get user's baseline assessment |
| `/api/player/psychology` | GET | Get psychology profile |
| `/api/body-composition` | POST | Log weight/body composition |
| `/api/body-composition/progress` | GET | Get body composition progress |
| `/api/stats/breakdown` | GET | Get detailed stat explanation |
| `/api/stats/milestones` | GET | Get stat milestones and progress |

### Frontend Components

- `OnboardingBaselineForm` - Multi-step form for fitness baseline
- `OnboardingPsychologyChat` - AI conversation interface
- `StatExplainer` - Shows what each stat means and how to improve
- `StatMilestoneCard` - Shows next milestone and progress
- `BodyCompositionWidget` - Weight/calorie tracking on dashboard
- `BodyCompositionChart` - Trend visualization
- `RealisticLevelDisplay` - Shows level with real-world equivalent

---

## Requirements

### Must Have (P0)
- [ ] Baseline assessment questionnaire in onboarding
- [ ] Stats displayed with real-world equivalents
- [ ] Quest targets adapt based on baseline
- [ ] Weight tracking opt-in for those with weight goals

### Should Have (P1)
- [ ] AI psychology conversation during onboarding
- [ ] Body composition tracking (beyond just weight)
- [ ] Calorie deficit → XP conversion
- [ ] Performance-based XP scaling
- [ ] Stat milestone progression display

### Nice to Have (P2)
- [ ] Integration with smart scales (via HealthKit)
- [ ] Periodic re-assessment (monthly check-ins)
- [ ] AI-powered quest recommendations based on psychology
- [ ] Comparative benchmarks ("You're stronger than 60% of users at your level")

---

## Open Questions

1. **Weight sensitivity**: How do we handle users who don't want to track weight? (Answer: Make it opt-in, emphasize other VIT metrics)

2. **Stat regression**: Should stats decrease if someone stops training? (Suggestion: Slow decay after 14+ days of inactivity, matches real physiology)

3. **Validation**: How do we verify self-reported baselines? (HealthKit where possible, but trust the user otherwise)

4. **AI conversation depth**: How many questions should the psychology assessment be? (Suggestion: 5-8 key questions, ~3-5 minutes)

5. **Recalibration**: When should baselines be re-assessed? (Suggestion: Prompt after 90 days or significant life change)

---

## Dependencies

- Mastra narrator agent (G22) for psychology conversations
- HealthKit integration (G17) for calorie burn data
- Onboarding flow (G25) as foundation to enhance
- User profile storage for baseline data

---

## Implementation Notes

### Stat Calculation Formula

```typescript
function calculateStat(
  baseline: BaselineAssessment,
  activityHistory: ActivityData[],
  statType: 'STR' | 'AGI' | 'VIT' | 'DISC'
): number {
  // Start from baseline
  let stat = getBaselineStat(baseline, statType)
  
  // Add progression from activities
  const progression = calculateProgression(activityHistory, statType)
  stat += progression
  
  // Cap at 100
  return Math.min(100, stat)
}

function getBaselineStat(baseline: BaselineAssessment, type: string): number {
  switch (type) {
    case 'STR':
      // Based on push-ups
      if (baseline.pushUpsMax >= 50) return 40
      if (baseline.pushUpsMax >= 20) return 25
      if (baseline.pushUpsMax >= 5) return 15
      return 10
    
    case 'AGI':
      // Based on daily steps
      if (baseline.dailySteps >= 12000) return 30
      if (baseline.dailySteps >= 10000) return 25
      if (baseline.dailySteps >= 7500) return 20
      if (baseline.dailySteps >= 5000) return 15
      return 10
    
    // ... etc
  }
}
```

### Calorie Tracking Integration

```typescript
interface DailyCalorieData {
  consumed: number      // From food logging (LogMeal or manual)
  burned: number        // From HealthKit active calories
  bmr: number          // Estimated basal metabolic rate
  
  netCalories: number   // consumed - (burned + bmr)
  // Negative = deficit, positive = surplus
}

function calculateWeeklyDeficit(logs: BodyCompositionLog[]): {
  totalDeficit: number
  projectedLoss: number   // lbs
  xpEarned: number
} {
  const totalDeficit = logs.reduce((sum, log) => {
    return sum + (log.netCalories < 0 ? Math.abs(log.netCalories) : 0)
  }, 0)
  
  const projectedLoss = totalDeficit / 3500  // lbs
  const xpEarned = Math.floor(projectedLoss * 100)  // 100 XP per lb
  
  return { totalDeficit, projectedLoss, xpEarned }
}
```
