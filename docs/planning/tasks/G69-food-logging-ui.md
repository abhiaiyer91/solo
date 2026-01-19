# G69: Food Logging UI

## Overview

Build the main food logging interface in the mobile app. This includes the daily nutrition summary, meal list, quick-add buttons, and navigation to barcode scanning/manual entry.

## Context

**Source:** Ideation loop --topic "nutrition tracking with open source scanning"
**Design Doc:** docs/mobile/nutrition-tracking.md
**Current State:** G58 provides backend. G68 provides barcode scanner. Need main UI.

## Acceptance Criteria

- [ ] Nutrition tab/screen in main navigation
- [ ] Daily protein progress bar
- [ ] Quick-add buttons for common foods
- [ ] List of today's logged meals
- [ ] Scan barcode button
- [ ] Manual entry button
- [ ] Search food button
- [ ] Pull-to-refresh for latest data
- [ ] Delete/edit logged meals

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `mobile/app/(tabs)/nutrition.tsx` | Create | Nutrition tab screen |
| `mobile/src/components/NutritionSummary.tsx` | Create | Daily progress display |
| `mobile/src/components/MealCard.tsx` | Create | Individual meal display |
| `mobile/src/components/QuickAddGrid.tsx` | Create | Quick-add buttons |
| `mobile/src/hooks/useNutrition.ts` | Create | Nutrition data hook |
| `mobile/src/hooks/useLogFood.ts` | Create | Food logging mutation |
| `mobile/app/(tabs)/_layout.tsx` | Modify | Add nutrition tab |

## Implementation Notes

### Nutrition Data Hook

```typescript
// mobile/src/hooks/useNutrition.ts
import { useQuery } from '@tanstack/react-query';
import { api, queryKeys } from '../lib/api';

interface DailyNutritionResponse {
  date: string;
  meals: MealLog[];
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  targets: {
    calories: number | null;
    protein: number | null;
  };
  progress: {
    proteinPercent: number;
    proteinGoalMet: boolean;
  };
}

export function useNutrition() {
  return useQuery({
    queryKey: ['nutrition', 'today'],
    queryFn: () => api.get<DailyNutritionResponse>('/api/nutrition/today'),
  });
}
```

### Log Food Mutation

```typescript
// mobile/src/hooks/useLogFood.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

interface LogFoodInput {
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foods: Array<{
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    servings?: number;
    barcode?: string;
  }>;
}

export function useLogFood() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: LogFoodInput) => 
      api.post('/api/nutrition/log', input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nutrition'] });
      queryClient.invalidateQueries({ queryKey: ['quests'] });
    },
  });
}
```

### Nutrition Summary Component

```typescript
// mobile/src/components/NutritionSummary.tsx
interface Props {
  totals: { calories: number; protein: number; carbs: number; fat: number };
  targets: { calories: number | null; protein: number | null };
  progress: { proteinPercent: number; proteinGoalMet: boolean };
}

export function NutritionSummary({ totals, targets, progress }: Props) {
  const proteinTarget = targets.protein ?? 150;
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>FUEL</Text>
      
      {/* Main protein progress */}
      <View style={styles.proteinSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.label}>Protein</Text>
          <Text style={styles.value}>
            {Math.round(totals.protein)}g / {proteinTarget}g
          </Text>
        </View>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${Math.min(progress.proteinPercent, 100)}%` },
              progress.proteinGoalMet && styles.progressComplete,
            ]} 
          />
        </View>
        {progress.proteinGoalMet && (
          <Text style={styles.goalMet}>✓ Target achieved</Text>
        )}
      </View>

      {/* Macro summary */}
      <View style={styles.macroRow}>
        <MacroStat label="Cals" value={totals.calories} />
        <MacroStat label="Carbs" value={`${Math.round(totals.carbs)}g`} />
        <MacroStat label="Fat" value={`${Math.round(totals.fat)}g`} />
      </View>
    </View>
  );
}
```

### Quick Add Grid

```typescript
// mobile/src/components/QuickAddGrid.tsx
const QUICK_ADD_DEFAULTS = [
  { id: 'shake', name: 'Protein Shake', emoji: '🥤', protein: 25, calories: 150, carbs: 5, fat: 2 },
  { id: 'chicken', name: 'Chicken Breast', emoji: '🍗', protein: 31, calories: 165, carbs: 0, fat: 3.6 },
  { id: 'eggs', name: 'Eggs (2)', emoji: '🥚', protein: 12, calories: 140, carbs: 1, fat: 10 },
  { id: 'yogurt', name: 'Greek Yogurt', emoji: '🥛', protein: 17, calories: 100, carbs: 6, fat: 0.7 },
];

interface Props {
  onQuickAdd: (food: typeof QUICK_ADD_DEFAULTS[0]) => void;
}

export function QuickAddGrid({ onQuickAdd }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quick Add</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {QUICK_ADD_DEFAULTS.map((food) => (
          <Pressable
            key={food.id}
            style={styles.quickAddButton}
            onPress={() => onQuickAdd(food)}
          >
            <Text style={styles.emoji}>{food.emoji}</Text>
            <Text style={styles.name}>{food.name}</Text>
            <Text style={styles.protein}>+{food.protein}g</Text>
          </Pressable>
        ))}
        <Pressable style={styles.addCustomButton}>
          <Text style={styles.addIcon}>+</Text>
          <Text style={styles.addText}>Custom</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
```

### Meal Card Component

```typescript
// mobile/src/components/MealCard.tsx
interface Props {
  meal: MealLog;
  onDelete?: () => void;
}

export function MealCard({ meal, onDelete }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.mealType}>
          {meal.mealType?.charAt(0).toUpperCase() + meal.mealType?.slice(1) || 'Snack'}
        </Text>
        <Text style={styles.time}>
          {formatTime(meal.createdAt)}
        </Text>
      </View>
      
      <View style={styles.stats}>
        <Text style={styles.protein}>{Math.round(meal.protein)}g protein</Text>
        <Text style={styles.calories}>{meal.calories} cal</Text>
      </View>
      
      <Text style={styles.foods}>
        {meal.foods?.map(f => f.name).join(', ')}
      </Text>
      
      {onDelete && (
        <Pressable onPress={onDelete} style={styles.deleteButton}>
          <Text style={styles.deleteText}>✕</Text>
        </Pressable>
      )}
    </View>
  );
}
```

### Main Nutrition Screen

```typescript
// mobile/app/(tabs)/nutrition.tsx
import { View, ScrollView, RefreshControl, Pressable, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useNutrition } from '../../src/hooks/useNutrition';
import { useLogFood } from '../../src/hooks/useLogFood';
import { NutritionSummary } from '../../src/components/NutritionSummary';
import { QuickAddGrid } from '../../src/components/QuickAddGrid';
import { MealCard } from '../../src/components/MealCard';
import { SystemWindow } from '../../src/components/SystemWindow';

export default function NutritionScreen() {
  const router = useRouter();
  const { data, isLoading, refetch, isRefetching } = useNutrition();
  const logFood = useLogFood();

  const handleQuickAdd = async (food: QuickAddFood) => {
    await logFood.mutateAsync({
      mealType: 'snack',
      foods: [{
        name: food.name,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
      }],
    });
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <SystemWindow title="FUEL">
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor="#00ff00"
          />
        }
      >
        {/* Progress summary */}
        <NutritionSummary
          totals={data.totals}
          targets={data.targets}
          progress={data.progress}
        />

        {/* Quick add */}
        <QuickAddGrid onQuickAdd={handleQuickAdd} />

        {/* Today's meals */}
        <View style={styles.mealsSection}>
          <Text style={styles.sectionTitle}>Today's Log</Text>
          {data.meals.length === 0 ? (
            <Text style={styles.emptyText}>No meals logged yet</Text>
          ) : (
            data.meals.map((meal) => (
              <MealCard key={meal.id} meal={meal} />
            ))
          )}
        </View>

        {/* Action buttons */}
        <View style={styles.actionRow}>
          <Pressable 
            style={styles.actionButton}
            onPress={() => router.push('/nutrition/scan')}
          >
            <Text style={styles.actionIcon}>📷</Text>
            <Text style={styles.actionText}>SCAN</Text>
          </Pressable>
          
          <Pressable 
            style={styles.actionButton}
            onPress={() => router.push('/nutrition/search')}
          >
            <Text style={styles.actionIcon}>🔍</Text>
            <Text style={styles.actionText}>SEARCH</Text>
          </Pressable>
          
          <Pressable 
            style={styles.actionButton}
            onPress={() => router.push('/nutrition/manual')}
          >
            <Text style={styles.actionIcon}>✏️</Text>
            <Text style={styles.actionText}>MANUAL</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SystemWindow>
  );
}
```

## Definition of Done

- [ ] Nutrition tab appears in navigation
- [ ] Daily summary shows protein progress
- [ ] Quick-add buttons log food instantly
- [ ] Meal list shows today's entries
- [ ] Scan/Search/Manual buttons navigate correctly
- [ ] Pull-to-refresh updates data
- [ ] Delete meal removes entry
- [ ] No TypeScript errors
