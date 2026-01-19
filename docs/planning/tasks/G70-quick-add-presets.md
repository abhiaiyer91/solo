# G70: Quick-Add Presets System

## Overview

Implement a system for quick-add food presets that allows users to log frequently eaten foods with a single tap. Users can customize their presets and save new foods from scanned items.

## Context

**Source:** Ideation loop --topic "nutrition tracking with open source scanning"
**Design Doc:** docs/mobile/nutrition-tracking.md
**Current State:** G69 provides UI with hardcoded quick-add. Need persistence.

## Acceptance Criteria

- [ ] Default quick-add presets provided
- [ ] User can save custom quick-add foods
- [ ] User can edit preset macros
- [ ] User can delete/reorder presets
- [ ] "Save as Quick-Add" option on scanned foods
- [ ] Presets sync to backend
- [ ] Presets work offline (cached locally)

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `server/src/db/schema/nutrition.ts` | Modify | Add food_presets table |
| `server/src/services/nutrition.ts` | Modify | Add preset CRUD |
| `server/src/routes/nutrition.ts` | Modify | Add preset endpoints |
| `mobile/src/hooks/usePresets.ts` | Create | Presets management hook |
| `mobile/src/components/QuickAddGrid.tsx` | Modify | Use persisted presets |
| `mobile/app/nutrition/presets.tsx` | Create | Presets management screen |
| `mobile/src/components/AddPresetModal.tsx` | Create | Create/edit preset form |

## Implementation Notes

### Database Schema Addition

```typescript
// Add to server/src/db/schema/nutrition.ts
export const foodPresets = pgTable('food_presets', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  
  // Food info
  name: text('name').notNull(),
  emoji: text('emoji').default('🍽️'),
  
  // Nutrition per serving
  calories: integer('calories').notNull().default(0),
  protein: real('protein').notNull().default(0),
  carbs: real('carbs').notNull().default(0),
  fat: real('fat').notNull().default(0),
  
  // Metadata
  servingSize: text('serving_size'),
  barcode: text('barcode'),  // If saved from scan
  sortOrder: integer('sort_order').notNull().default(0),
  usageCount: integer('usage_count').notNull().default(0),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
```

### Backend Endpoints

```typescript
// GET /api/nutrition/presets - List user's presets
nutritionRoutes.get('/nutrition/presets', requireAuth, async (c) => {
  const user = c.get('user')!;
  const presets = await getPresets(user.id);
  return c.json({ presets });
});

// POST /api/nutrition/presets - Create preset
nutritionRoutes.post('/nutrition/presets', requireAuth, async (c) => {
  const user = c.get('user')!;
  const body = await c.req.json<CreatePresetInput>();
  const preset = await createPreset(user.id, body);
  return c.json({ preset });
});

// PUT /api/nutrition/presets/:id - Update preset
nutritionRoutes.put('/nutrition/presets/:id', requireAuth, async (c) => {
  const user = c.get('user')!;
  const id = c.req.param('id');
  const body = await c.req.json<UpdatePresetInput>();
  const preset = await updatePreset(user.id, id, body);
  return c.json({ preset });
});

// DELETE /api/nutrition/presets/:id - Delete preset
nutritionRoutes.delete('/nutrition/presets/:id', requireAuth, async (c) => {
  const user = c.get('user')!;
  const id = c.req.param('id');
  await deletePreset(user.id, id);
  return c.json({ success: true });
});

// POST /api/nutrition/presets/reorder - Update sort order
nutritionRoutes.post('/nutrition/presets/reorder', requireAuth, async (c) => {
  const user = c.get('user')!;
  const { orderedIds } = await c.req.json<{ orderedIds: string[] }>();
  await reorderPresets(user.id, orderedIds);
  return c.json({ success: true });
});
```

### Mobile Presets Hook

```typescript
// mobile/src/hooks/usePresets.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export interface FoodPreset {
  id: string;
  name: string;
  emoji: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize?: string;
  barcode?: string;
  sortOrder: number;
  usageCount: number;
}

// Default presets for new users
const DEFAULT_PRESETS: Omit<FoodPreset, 'id' | 'sortOrder' | 'usageCount'>[] = [
  { name: 'Protein Shake', emoji: '🥤', protein: 25, calories: 150, carbs: 5, fat: 2 },
  { name: 'Chicken Breast', emoji: '🍗', protein: 31, calories: 165, carbs: 0, fat: 4 },
  { name: 'Eggs (2)', emoji: '🥚', protein: 12, calories: 140, carbs: 1, fat: 10 },
  { name: 'Greek Yogurt', emoji: '🥛', protein: 17, calories: 100, carbs: 6, fat: 1 },
];

export function usePresets() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['nutrition', 'presets'],
    queryFn: async () => {
      const response = await api.get<{ presets: FoodPreset[] }>('/api/nutrition/presets');
      // If no presets, return defaults
      if (response.presets.length === 0) {
        return DEFAULT_PRESETS.map((p, i) => ({
          ...p,
          id: `default-${i}`,
          sortOrder: i,
          usageCount: 0,
        }));
      }
      return response.presets;
    },
  });

  const createPreset = useMutation({
    mutationFn: (input: Omit<FoodPreset, 'id' | 'sortOrder' | 'usageCount'>) =>
      api.post<{ preset: FoodPreset }>('/api/nutrition/presets', input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nutrition', 'presets'] });
    },
  });

  const deletePreset = useMutation({
    mutationFn: (id: string) =>
      api.delete(`/api/nutrition/presets/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nutrition', 'presets'] });
    },
  });

  return {
    presets: query.data || [],
    isLoading: query.isLoading,
    createPreset: createPreset.mutate,
    deletePreset: deletePreset.mutate,
  };
}
```

### Save from Scan

```typescript
// In FoodPreview component, add save option
function FoodPreview({ product, onAdd, onCancel }: Props) {
  const { createPreset } = usePresets();
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const handleSaveAsPreset = () => {
    createPreset({
      name: product.name,
      emoji: '📦',  // Default for scanned items
      calories: product.calories,
      protein: product.protein,
      carbs: product.carbs,
      fat: product.fat,
      servingSize: product.servingSize,
      barcode: product.barcode,
    });
    Toast.show({ text1: 'Saved to Quick Add!' });
  };

  return (
    <View>
      {/* ... existing UI ... */}
      
      <Pressable onPress={handleSaveAsPreset} style={styles.savePresetButton}>
        <Text style={styles.savePresetText}>⭐ Save as Quick-Add</Text>
      </Pressable>
    </View>
  );
}
```

### Presets Management Screen

```typescript
// mobile/app/nutrition/presets.tsx
export default function PresetsScreen() {
  const { presets, deletePreset } = usePresets();
  const router = useRouter();

  return (
    <SystemWindow title="QUICK-ADD FOODS">
      <ScrollView>
        {presets.map((preset) => (
          <View key={preset.id} style={styles.presetRow}>
            <Text style={styles.emoji}>{preset.emoji}</Text>
            <View style={styles.info}>
              <Text style={styles.name}>{preset.name}</Text>
              <Text style={styles.macros}>
                {preset.protein}g protein · {preset.calories} cal
              </Text>
            </View>
            <Pressable 
              onPress={() => router.push(`/nutrition/presets/${preset.id}/edit`)}
            >
              <Text style={styles.editIcon}>✏️</Text>
            </Pressable>
            <Pressable onPress={() => deletePreset(preset.id)}>
              <Text style={styles.deleteIcon}>🗑️</Text>
            </Pressable>
          </View>
        ))}

        <Pressable 
          style={styles.addButton}
          onPress={() => router.push('/nutrition/presets/new')}
        >
          <Text style={styles.addButtonText}>+ Add Custom Food</Text>
        </Pressable>
      </ScrollView>
    </SystemWindow>
  );
}
```

## Definition of Done

- [ ] Presets stored in database
- [ ] Default presets for new users
- [ ] Custom preset creation works
- [ ] Edit/delete presets works
- [ ] "Save as Quick-Add" from scanned foods
- [ ] Presets sorted by usage/custom order
- [ ] No TypeScript errors
