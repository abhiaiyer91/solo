# G183: Mobile Manual Food Entry Screen

## Overview
Implement manual food entry screen for nutrition tracking when barcode/photo scanning isn't available.

## Context
**Source:** Ideation loop --focus retrospective
**Related TODO:** `mobile/src/screens/FoodScanScreen.tsx:189` - "Navigate to manual entry screen"
**Current State:** Food scanning exists but no fallback for manual entry

## Acceptance Criteria
- [ ] Manual food entry screen with calorie/protein/carbs/fat inputs
- [ ] Search integration with Open Food Facts API
- [ ] Recent foods list for quick re-entry
- [ ] Custom food saving for frequently eaten items
- [ ] Serving size selector (g, oz, cups, portions)
- [ ] Navigation from FoodScanScreen to manual entry

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| mobile/src/screens/ManualFoodEntryScreen.tsx | Create | Manual entry form |
| mobile/src/screens/FoodScanScreen.tsx | Modify | Add navigation to manual entry |
| mobile/src/hooks/useRecentFoods.ts | Create | Track recently logged foods |
| mobile/src/hooks/useFoodSearch.ts | Create | Search Open Food Facts by name |
| mobile/app/food/manual.tsx | Create | Expo router page |

## Implementation Notes
- Numeric inputs should support decimal values
- Search should debounce and show loading states
- Recent foods should persist to AsyncStorage
- Consider quick macros presets (200g chicken breast = 62g protein)

## Definition of Done
- [ ] All acceptance criteria met
- [ ] Can log food without scanner
- [ ] TODO removed from FoodScanScreen.tsx
- [ ] TypeScript errors resolved
