# G158: Food Scanning UX Polish

## Overview
Create a polished, intuitive food scanning experience with smooth transitions, clear feedback, and easy correction flows.

## Context
**Source:** Ideation loop --topic "food scanning with photo recognition and barcode detection"
**Design Doc:** `docs/mobile/food-scanning.md`
**Current State:** Camera and barcode scanner implemented (G156, G157)

## Acceptance Criteria
- [ ] Mode toggle between Barcode/Photo scanning
- [ ] Smooth transition animations between states
- [ ] Viewfinder overlay with scan guidelines
- [ ] Success animation on barcode detection
- [ ] Loading states during API calls
- [ ] Error states with retry options
- [ ] Quick-add to recent meal type
- [ ] Nutrition summary before confirming
- [ ] Edit detected items before logging
- [ ] Accessibility support (VoiceOver)

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| mobile/src/screens/FoodScanScreen.tsx | Create | Main scanning screen |
| mobile/src/components/ScanModeToggle.tsx | Create | Barcode/Photo mode switch |
| mobile/src/components/ScanViewfinder.tsx | Create | Camera overlay with guides |
| mobile/src/components/ScanSuccess.tsx | Create | Success animation component |
| mobile/src/components/NutritionPreview.tsx | Create | Pre-log nutrition summary |
| mobile/src/components/FoodItemEditor.tsx | Create | Edit detected food items |
| mobile/src/components/MealTypeSelector.tsx | Create | Quick meal type picker |

## Implementation Notes

### Screen Structure
```
┌─────────────────────────────────┐
│  ← Back        Food Scan        │
├─────────────────────────────────┤
│                                 │
│     ┌───────────────────┐       │
│     │                   │       │
│     │   Camera View     │       │
│     │                   │       │
│     │  ┌─────────────┐  │       │
│     │  │ Viewfinder  │  │       │
│     │  │   [||||]    │  │       │
│     │  └─────────────┘  │       │
│     │                   │       │
│     └───────────────────┘       │
│                                 │
│    Point at barcode or food     │
│                                 │
├─────────────────────────────────┤
│  [📷 Photo]      [▮▯ Barcode]   │
├─────────────────────────────────┤
│  💡 Flash    🔄 Flip    ⚡ Quick │
└─────────────────────────────────┘
```

### Mode Toggle Animation
```typescript
const ModeToggle = ({ mode, onModeChange }) => {
  const translateX = useSharedValue(mode === 'barcode' ? 0 : 1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: withSpring(translateX.value * 100) }]
  }))

  return (
    <View style={styles.toggleContainer}>
      <Animated.View style={[styles.indicator, animatedStyle]} />
      <Pressable onPress={() => onModeChange('photo')}>
        <Text>📷 Photo</Text>
      </Pressable>
      <Pressable onPress={() => onModeChange('barcode')}>
        <Text>▮▯ Barcode</Text>
      </Pressable>
    </View>
  )
}
```

### Success Animation
- Green checkmark appears in viewfinder
- Product card slides up from bottom
- Haptic feedback (success pattern)
- Optional sound effect

### Nutrition Preview
Before logging, show:
- Detected items list
- Total macros for the meal
- Edit button for each item
- Clear "Log to [Meal Type]" CTA

### Quick Add Flow
1. Scan barcode
2. Auto-select last meal type (or time-based guess)
3. Show 1-tap "Add 1 serving" button
4. Swipe up for more options

## Definition of Done
- [ ] All acceptance criteria met
- [ ] No TypeScript errors
- [ ] Smooth 60fps animations
- [ ] VoiceOver announces scan results
- [ ] User can complete scan→log in <5 seconds
