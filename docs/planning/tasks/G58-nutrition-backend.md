# G58: Nutrition Tracking Backend

## Overview

Implement the nutrition tracking backend using Open Food Facts as the primary data source. This enables food logging via barcode scanning and manual entry, with daily aggregation for protein quest tracking.

## Context

**Source:** Ideation loop --topic "nutrition tracking with open source scanning"
**Design Doc:** docs/mobile/nutrition-tracking.md
**Current State:** Database schema exists (`meal_logs`, `daily_nutrition`). No service or routes.

## Acceptance Criteria

- [ ] Nutrition service with CRUD operations
- [ ] Open Food Facts barcode lookup (with caching)
- [ ] POST `/api/nutrition/log` endpoint
- [ ] GET `/api/nutrition/today` endpoint
- [ ] GET `/api/nutrition/history?days=N` endpoint
- [ ] GET `/api/nutrition/barcode/:code` proxy endpoint
- [ ] Daily aggregation auto-updates on log
- [ ] Protein goal evaluation
- [ ] Quest auto-completion integration

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `server/src/services/nutrition.ts` | Create | Nutrition service |
| `server/src/services/open-food-facts.ts` | Create | OFF API client with caching |
| `server/src/routes/nutrition.ts` | Create | Nutrition API endpoints |
| `server/src/index.ts` | Modify | Mount nutrition routes |
| `server/src/db/schema/index.ts` | Modify | Export nutrition schema |
| `server/src/services/quest.ts` | Modify | Add nutrition quest evaluation |

## Implementation Notes

### Open Food Facts Client

```typescript
// server/src/services/open-food-facts.ts
const OFF_BASE_URL = 'https://world.openfoodfacts.org/api/v2';

interface OFFProduct {
  product_name: string;
  brands: string;
  serving_size: string;
  nutrition_grades: string;
  nutriments: {
    'energy-kcal_100g': number;
    proteins_100g: number;
    carbohydrates_100g: number;
    fat_100g: number;
    fiber_100g?: number;
  };
  image_url: string;
}

// Simple in-memory cache (upgrade to Redis later if needed)
const barcodeCache = new Map<string, { data: OFFProduct; timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

export async function lookupBarcode(barcode: string): Promise<Product | null> {
  // Check cache first
  const cached = barcodeCache.get(barcode);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return normalizeProduct(cached.data, barcode);
  }

  // Fetch from Open Food Facts
  const response = await fetch(
    `${OFF_BASE_URL}/product/${barcode}?fields=product_name,brands,serving_size,nutrition_grades,nutriments,image_url`
  );
  
  const json = await response.json();
  
  if (json.status !== 1 || !json.product) {
    return null;
  }

  // Cache the result
  barcodeCache.set(barcode, { data: json.product, timestamp: Date.now() });

  return normalizeProduct(json.product, barcode);
}

function normalizeProduct(off: OFFProduct, barcode: string): Product {
  const n = off.nutriments;
  return {
    name: off.product_name || 'Unknown Product',
    brand: off.brands || '',
    servingSize: off.serving_size || '100g',
    calories: Math.round(n['energy-kcal_100g'] || 0),
    protein: Math.round((n.proteins_100g || 0) * 10) / 10,
    carbs: Math.round((n.carbohydrates_100g || 0) * 10) / 10,
    fat: Math.round((n.fat_100g || 0) * 10) / 10,
    fiber: Math.round((n.fiber_100g || 0) * 10) / 10,
    imageUrl: off.image_url || '',
    barcode,
    nutritionGrade: off.nutrition_grades || '',
    per100g: true,  // OFF always returns per 100g
  };
}
```

### Nutrition Service

```typescript
// server/src/services/nutrition.ts
export async function logFood(
  userId: string,
  input: LogFoodInput
): Promise<{ mealLog: MealLog; dailyTotals: DailyNutrition }> {
  const date = input.date || getTodayDate();
  
  // Calculate totals from all foods
  const totals = input.foods.reduce(
    (acc, food) => ({
      calories: acc.calories + food.calories * (food.servings || 1),
      protein: acc.protein + food.protein * (food.servings || 1),
      carbs: acc.carbs + food.carbs * (food.servings || 1),
      fat: acc.fat + food.fat * (food.servings || 1),
      fiber: acc.fiber + (food.fiber || 0) * (food.servings || 1),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
  );

  // Insert meal log
  const [mealLog] = await db.insert(mealLogs).values({
    userId,
    date,
    mealType: input.mealType,
    foods: input.foods,
    calories: totals.calories,
    protein: totals.protein,
    carbs: totals.carbs,
    fat: totals.fat,
    fiber: totals.fiber,
    imageUrl: input.imageUrl,
    notes: input.notes,
  }).returning();

  // Update daily aggregates
  const dailyTotals = await updateDailyNutrition(userId, date);

  return { mealLog, dailyTotals };
}

async function updateDailyNutrition(
  userId: string,
  date: string
): Promise<DailyNutrition> {
  // Get all meals for the day
  const meals = await db
    .select()
    .from(mealLogs)
    .where(and(eq(mealLogs.userId, userId), eq(mealLogs.date, date)));

  // Aggregate totals
  const totals = meals.reduce(
    (acc, meal) => ({
      calories: acc.calories + meal.calories,
      protein: acc.protein + meal.protein,
      carbs: acc.carbs + meal.carbs,
      fat: acc.fat + meal.fat,
      fiber: acc.fiber + (meal.fiber || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
  );

  // Get user's protein target
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  const targetProtein = user?.targetProtein || 150;

  // Upsert daily nutrition
  const [daily] = await db
    .insert(dailyNutrition)
    .values({
      userId,
      date,
      totalCalories: totals.calories,
      totalProtein: totals.protein,
      totalCarbs: totals.carbs,
      totalFat: totals.fat,
      totalFiber: totals.fiber,
      mealCount: meals.length,
      targetProtein,
      proteinGoalMet: totals.protein >= targetProtein ? 1 : 0,
    })
    .onConflictDoUpdate({
      target: [dailyNutrition.userId, dailyNutrition.date],
      set: {
        totalCalories: totals.calories,
        totalProtein: totals.protein,
        totalCarbs: totals.carbs,
        totalFat: totals.fat,
        totalFiber: totals.fiber,
        mealCount: meals.length,
        proteinGoalMet: totals.protein >= targetProtein ? 1 : 0,
        updatedAt: new Date(),
      },
    })
    .returning();

  return daily;
}
```

### Routes

```typescript
// server/src/routes/nutrition.ts
const nutritionRoutes = new Hono();

// Log food entry
nutritionRoutes.post('/nutrition/log', requireAuth, async (c) => {
  const user = c.get('user')!;
  const body = await c.req.json<LogFoodInput>();
  
  const { mealLog, dailyTotals } = await logFood(user.id, body);
  
  // Check if protein quest should complete
  const questResults = await autoEvaluateNutritionQuests(user.id);
  
  return c.json({
    mealLog,
    dailyTotals,
    questsCompleted: questResults.completed,
    message: dailyTotals.proteinGoalMet 
      ? '[SYSTEM] Protein target achieved.'
      : `[SYSTEM] Food logged. ${Math.round(dailyTotals.totalProtein)}g / ${dailyTotals.targetProtein}g protein.`,
  });
});

// Get today's nutrition
nutritionRoutes.get('/nutrition/today', requireAuth, async (c) => {
  const user = c.get('user')!;
  const data = await getTodayNutrition(user.id);
  return c.json(data);
});

// Barcode lookup (proxy to Open Food Facts)
nutritionRoutes.get('/nutrition/barcode/:code', requireAuth, async (c) => {
  const barcode = c.req.param('code');
  const product = await lookupBarcode(barcode);
  
  if (!product) {
    return c.json({ found: false, barcode }, 404);
  }
  
  return c.json({ found: true, product });
});
```

### Quest Integration

Add to `quest.ts`:

```typescript
const NUTRITION_METRICS = ['protein_grams', 'calories', 'meals_logged'];

export async function autoEvaluateNutritionQuests(userId: string): Promise<EvalResult> {
  const daily = await getTodayDailyNutrition(userId);
  if (!daily) return { evaluated: 0, completed: 0, results: [] };

  const nutritionData = {
    protein_grams: daily.totalProtein,
    calories: daily.totalCalories,
    meals_logged: daily.mealCount,
  };

  // Find nutrition quests and evaluate
  // ... similar to health quest evaluation
}
```

## Definition of Done

- [ ] Barcode lookup returns product data
- [ ] Food logging stores in database
- [ ] Daily aggregation updates automatically
- [ ] Protein goal tracking works
- [ ] Quest auto-completes on goal met
- [ ] No TypeScript errors
- [ ] Existing tests pass
