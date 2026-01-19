# Nutrition Tracking System

## Overview

This document details the implementation plan for nutrition tracking in the Journey app. The primary goal is to get nutrition data (calories, protein, carbs, fat) into the database with minimal friction. We use **Open Food Facts** as the primary open-source data source with barcode scanning for easy food logging.

---

## Goals

- **Primary:** Get nutrition stats into the database
- **Secondary:** Enable protein quest completion tracking
- **Tertiary:** Support calorie tracking for body composition goals

---

## Current State

### Database Schema (Complete ✅)

The nutrition schema already exists:

```typescript
// server/src/db/schema/nutrition.ts
meal_logs: {
  id, userId, date, mealType,
  foods: DetectedFood[],
  calories, protein, carbs, fat, fiber,
  imageUrl, notes, isManualEntry
}

daily_nutrition: {
  id, userId, date,
  totalCalories, totalProtein, totalCarbs, totalFat,
  targetCalories, targetProtein,
  proteinGoalMet, calorieDeficitMet
}
```

### Backend (Not Implemented)

| Component | Status |
|-----------|--------|
| `nutrition.ts` service | ❌ |
| Nutrition routes | ❌ |
| Open Food Facts client | ❌ |
| Daily aggregation | ❌ |

### Mobile (Not Implemented)

| Component | Status |
|-----------|--------|
| Barcode scanner | ❌ |
| Food logging UI | ❌ |
| Quick-add buttons | ❌ |
| Daily summary | ❌ |

---

## Technical Design

### Data Source: Open Food Facts

**Why Open Food Facts?**
- Fully open source (ODbL license)
- Free API, no authentication required
- 3M+ products from 180+ countries
- Community-maintained and growing
- Returns complete nutrition data

**API Endpoint:**
```
GET https://world.openfoodfacts.org/api/v2/product/{barcode}
    ?fields=product_name,brands,nutrition_grades,nutriments,image_url,serving_size
```

**Response Structure:**
```json
{
  "status": 1,
  "product": {
    "product_name": "Greek Yogurt",
    "brands": "Fage",
    "serving_size": "170g",
    "nutrition_grades": "a",
    "nutriments": {
      "energy-kcal_100g": 97,
      "proteins_100g": 9,
      "carbohydrates_100g": 3.5,
      "fat_100g": 5,
      "fiber_100g": 0
    },
    "image_url": "https://..."
  }
}
```

### Mobile Barcode Scanning

**Library:** `expo-camera` (built-in barcode scanning since SDK 51)

```typescript
import { CameraView, useCameraPermissions } from 'expo-camera';

function BarcodeScanner({ onScan }) {
  const [permission, requestPermission] = useCameraPermissions();
  
  return (
    <CameraView
      style={{ flex: 1 }}
      barcodeScannerSettings={{
        barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e'],
      }}
      onBarcodeScanned={({ data }) => onScan(data)}
    />
  );
}
```

### Data Flow Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                         MOBILE APP                                │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────┐      ┌─────────────────────────────────┐   │
│  │  Barcode Scan   │─────▶│  Open Food Facts API            │   │
│  │  (expo-camera)  │      │  GET /api/v2/product/{barcode}  │   │
│  └─────────────────┘      └───────────────┬─────────────────┘   │
│                                            │                      │
│                                            ▼                      │
│                            ┌─────────────────────────────────┐   │
│                            │  Food Preview                    │   │
│                            │  • Name, Brand                   │   │
│                            │  • Serving size selector         │   │
│                            │  • Macros preview                │   │
│                            │  [ADD TO LOG]                    │   │
│                            └───────────────┬─────────────────┘   │
│                                            │                      │
└────────────────────────────────────────────┼──────────────────────┘
                                             │
                                             ▼
┌──────────────────────────────────────────────────────────────────┐
│                         BACKEND                                   │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────┐      ┌─────────────────────────────────┐   │
│  │  POST /api/     │─────▶│  Nutrition Service               │   │
│  │  nutrition/log  │      │  • Store meal log                │   │
│  └─────────────────┘      │  • Update daily aggregates       │   │
│                            │  • Check protein goal            │   │
│                            └───────────────┬─────────────────┘   │
│                                            │                      │
│                                            ▼                      │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                     DATABASE                                 │ │
│  │  ┌───────────────────┐   ┌───────────────────┐              │ │
│  │  │    meal_logs      │   │  daily_nutrition  │              │ │
│  │  │  • foods[]        │   │  • totalProtein   │              │ │
│  │  │  • calories       │──▶│  • proteinGoalMet │              │ │
│  │  │  • protein        │   │  • mealCount      │              │ │
│  │  └───────────────────┘   └───────────────────┘              │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

### Input Methods (Priority Order)

| Method | Priority | UX | Accuracy |
|--------|----------|-----|----------|
| Barcode scan | P0 | Fast, 2 taps | High |
| Quick-add buttons | P0 | Fastest, 1 tap | Medium |
| Search by name | P1 | Medium, 3+ taps | High |
| Manual entry | P1 | Slow, many taps | User-dependent |
| Photo recognition | P2 | Medium | Varies |

### Quick-Add Presets

Users can save frequently logged foods:

```typescript
const QUICK_ADD_DEFAULTS = [
  { name: 'Protein Shake', protein: 25, calories: 150, carbs: 5, fat: 2 },
  { name: 'Chicken Breast', protein: 31, calories: 165, carbs: 0, fat: 3.6 },
  { name: 'Eggs (2)', protein: 12, calories: 140, carbs: 1, fat: 10 },
  { name: 'Greek Yogurt', protein: 17, calories: 100, carbs: 6, fat: 0.7 },
];
```

---

## API Endpoints

### Log Food Entry

```typescript
// POST /api/nutrition/log
interface LogFoodRequest {
  date?: string;  // YYYY-MM-DD, defaults to today
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foods: Array<{
    name: string;
    servingSize?: string;
    servings?: number;  // Multiplier
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    barcode?: string;
  }>;
  imageUrl?: string;
  notes?: string;
}

// Response
interface LogFoodResponse {
  mealLog: MealLog;
  dailyTotals: DailyNutrition;
  proteinGoalMet: boolean;
  message: string;
}
```

### Get Daily Summary

```typescript
// GET /api/nutrition/today
interface DailyNutritionResponse {
  date: string;
  meals: MealLog[];
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  targets: {
    calories: number | null;
    protein: number | null;
  };
  progress: {
    proteinPercent: number;
    caloriesPercent: number;
    proteinGoalMet: boolean;
  };
}
```

### Barcode Lookup (Proxy to Open Food Facts)

```typescript
// GET /api/nutrition/barcode/{code}
// Proxies through backend to add caching and normalize response

interface BarcodeResponse {
  found: boolean;
  product?: {
    name: string;
    brand: string;
    servingSize: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    imageUrl: string;
    barcode: string;
    nutritionGrade: string;  // A, B, C, D, E
  };
}
```

---

## Mobile UI Screens

### 1. Food Logger (Tab in Quest Board)

```
┌─────────────────────────────────────────────────────────────────┐
│  FUEL                                               Today       │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Protein: 87g / 150g                                       │ │
│  │  ██████████████████░░░░░░░░░░░  58%                       │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  Quick Add:                                                     │
│  [🥤 Shake +25g] [🍗 Chicken +31g] [🥚 Eggs +12g] [➕]         │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  Today's Log:                                                   │
│                                                                  │
│  Breakfast  ·  32g protein  ·  420 cal                         │
│  └─ Greek Yogurt, Eggs, Toast                                   │
│                                                                  │
│  Lunch  ·  45g protein  ·  650 cal                              │
│  └─ Chicken Salad                                               │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  📷  SCAN BARCODE     🔍  SEARCH     ✏️  MANUAL           │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2. Barcode Scanner Screen

```
┌─────────────────────────────────────────────────────────────────┐
│  [✕]                SCAN FOOD                                   │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                                                             │ │
│  │                                                             │ │
│  │               [ CAMERA VIEWFINDER ]                         │ │
│  │                                                             │ │
│  │          ┌─────────────────────┐                           │ │
│  │          │ ▂▃▅▇█▇▅▃▂           │                           │ │
│  │          └─────────────────────┘                           │ │
│  │                                                             │ │
│  │                                                             │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  Point camera at barcode on food packaging                      │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  [💡 Toggle Flash]              [🔍 Search Instead]            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3. Food Preview (After Scan)

```
┌─────────────────────────────────────────────────────────────────┐
│  [←]                                                            │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  [🖼️ Product Image]                                        │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  Fage Total 0% Greek Yogurt                                     │
│  Serving: 170g                                                  │
│                                                                  │
│  ┌─────────┬─────────┬─────────┬─────────┐                     │
│  │  Cals   │ Protein │  Carbs  │   Fat   │                     │
│  │   100   │   17g   │   6g    │   0g    │                     │
│  └─────────┴─────────┴─────────┴─────────┘                     │
│                                                                  │
│  Servings:  [ - ]  1.0  [ + ]                                   │
│                                                                  │
│  Meal:  [Breakfast] [Lunch] [Dinner] [Snack]                    │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    ADD TO LOG                               │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  [⭐ Save as Quick-Add]                                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Fallback Handling

### Product Not Found

When a barcode isn't in Open Food Facts:

```
┌─────────────────────────────────────────────────────────────────┐
│  PRODUCT NOT FOUND                                               │
│                                                                  │
│  Barcode: 0123456789012                                         │
│                                                                  │
│  This product isn't in the database yet.                        │
│                                                                  │
│  Options:                                                       │
│  [📝 Enter Manually]    [🔍 Search by Name]                     │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│  [📷 Scan Different Item]                                       │
└─────────────────────────────────────────────────────────────────┘
```

### Offline Mode

Cache recent lookups locally:
- Store last 100 barcode results in AsyncStorage
- Allow logging from cache when offline
- Sync to backend when connectivity restored

---

## Quest Integration

The nutrition system integrates with quests:

### Protein Target Quest

```typescript
// Quest requirement
{
  type: 'threshold',
  metric: 'protein_grams',
  target: 150,
  comparison: 'gte'
}

// Evaluation from daily_nutrition
const proteinToday = dailyNutrition.totalProtein;
const questMet = proteinToday >= 150;
```

### Auto-Evaluation

When nutrition is logged:
1. Update `daily_nutrition` aggregates
2. Check if `proteinGoalMet` should flip to true
3. Call `autoEvaluateQuestsFromNutrition(userId)`
4. Award XP if protein quest completes

---

## Requirements

### Must Have (P0)

- [ ] Backend nutrition service with CRUD operations
- [ ] Open Food Facts barcode lookup (with caching)
- [ ] POST `/api/nutrition/log` endpoint
- [ ] GET `/api/nutrition/today` endpoint
- [ ] Daily aggregation on log
- [ ] Mobile barcode scanner with expo-camera
- [ ] Food preview and logging UI
- [ ] Quick-add preset buttons
- [ ] Protein quest auto-evaluation

### Should Have (P1)

- [ ] GET `/api/nutrition/barcode/{code}` proxy endpoint
- [ ] Food search by name
- [ ] Manual entry form
- [ ] Save custom foods
- [ ] Edit/delete logged meals
- [ ] Offline caching

### Nice to Have (P2)

- [ ] Photo-based food recognition (LogMeal or ML)
- [ ] Recipe builder
- [ ] Meal planning
- [ ] Import from MyFitnessPal/Cronometer

---

## Dependencies

| Package | Platform | Purpose |
|---------|----------|---------|
| `expo-camera` | Mobile | Barcode scanning |
| None | Backend | Open Food Facts is a public API |

---

## Open Questions

1. **Serving size handling**: Should we support custom serving sizes or just multipliers?
   - Recommendation: Start with multipliers (0.5x, 1x, 1.5x, 2x), add custom later

2. **Barcode caching**: Cache on backend or mobile?
   - Recommendation: Both - mobile for offline, backend for rate limiting

3. **Photo recognition priority**: Is LogMeal worth the cost?
   - Recommendation: P2 - barcode + quick-add covers 90% of use cases

4. **Multi-region support**: Open Food Facts has regional databases
   - Recommendation: Use `world.openfoodfacts.org` for broadest coverage

---

## Task Breakdown

See individual task files:
- G58-nutrition-backend.md (updated - use Open Food Facts)
- G68-barcode-scanner.md (new)
- G69-food-logging-ui.md (new)
- G70-quick-add-presets.md (new)
