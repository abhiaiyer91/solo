# G58: Nutrition Tracking Backend

## Overview

Implement the LogMeal API integration and nutrition tracking backend. This enables photo-based food recognition for protein tracking quests.

## Context

**Source:** Retrospection analysis - Nutrition tracking 0% built
**Design Doc:** MASTER_SPEC.md Section 11
**Current State:** Schema has NUTRITION category but no implementation

## Acceptance Criteria

- [ ] MealLog and DailyNutrition schemas in database
- [ ] LogMeal API service for image analysis
- [ ] POST `/api/nutrition/log` endpoint (image upload)
- [ ] GET `/api/nutrition/today` endpoint
- [ ] GET `/api/nutrition/history` endpoint
- [ ] Daily nutrition aggregation
- [ ] Nutrition quest evaluation integration

## Files to Create

| File | Description |
|------|-------------|
| `server/src/db/schema/nutrition.ts` | Nutrition database tables |
| `server/src/services/logmeal.ts` | LogMeal API client |
| `server/src/services/nutrition.ts` | Nutrition aggregation |
| `server/src/routes/nutrition.ts` | Nutrition API endpoints |
| `server/src/index.ts` | Mount nutrition routes |

## Implementation Notes

### Schema

```typescript
export const mealLogs = pgTable('meal_logs', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  date: text('date').notNull(),
  mealType: text('meal_type'), // breakfast, lunch, dinner, snack
  imageUrl: text('image_url'),
  
  // LogMeal results
  foods: json('foods'), // Detected foods array
  calories: integer('calories').notNull(),
  protein: real('protein').notNull(),
  carbs: real('carbs').notNull(),
  fat: real('fat').notNull(),
  fiber: real('fiber'),
  
  logmealResponse: json('logmeal_response'), // Raw response
  createdAt: timestamp('created_at').defaultNow(),
})

export const dailyNutrition = pgTable('daily_nutrition', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  date: text('date').notNull(),
  
  totalCalories: integer('total_calories').default(0),
  totalProtein: real('total_protein').default(0),
  totalCarbs: real('total_carbs').default(0),
  totalFat: real('total_fat').default(0),
  mealCount: integer('meal_count').default(0),
  
  // User targets
  targetCalories: integer('target_calories'),
  targetProtein: real('target_protein'),
})
```

### LogMeal Integration

```typescript
export async function analyzeFoodImage(imageBuffer: Buffer): Promise<{
  foods: FoodItem[]
  totals: NutritionTotals
}> {
  // 1. POST to LogMeal segmentation endpoint
  // 2. GET nutritional info for detected foods
  // 3. Return structured data
}
```

### Environment Variables

```
LOGMEAL_API_KEY=your_api_key
CLOUDFLARE_R2_ENDPOINT=for_image_storage
```

## Definition of Done

- [ ] Meal photos can be uploaded
- [ ] LogMeal returns food detection
- [ ] Nutrition data stored in database
- [ ] Daily aggregation works
- [ ] Protein quest evaluates correctly
