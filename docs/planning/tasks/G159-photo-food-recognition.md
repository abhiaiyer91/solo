# G159: AI Photo Food Recognition

## Overview
Enable users to take photos of any food (not just barcoded products) and get AI-powered macro estimates using the LogMeal API integration.

## Context
**Source:** Ideation loop --topic "food scanning with photo recognition and barcode detection"
**Design Doc:** `docs/mobile/food-scanning.md`
**Current State:** LogMeal backend integration exists, needs mobile UI

## Acceptance Criteria
- [ ] Photo capture with preview
- [ ] Upload to /api/nutrition/log-image endpoint
- [ ] Display detected foods with confidence levels
- [ ] Show macro breakdown per detected item
- [ ] Allow adjustment of portions
- [ ] Allow removal of incorrectly detected items
- [ ] Allow manual addition of missed items
- [ ] Total nutrition summary
- [ ] Log all items as single meal
- [ ] Handle low confidence gracefully

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| mobile/src/components/PhotoCapture.tsx | Create | Photo capture and preview |
| mobile/src/components/FoodDetectionResults.tsx | Create | AI detection results display |
| mobile/src/components/DetectedFoodItem.tsx | Create | Single detected food card |
| mobile/src/components/ConfidenceIndicator.tsx | Create | Visual confidence display |
| mobile/src/components/PortionAdjuster.tsx | Create | Portion size control |
| mobile/src/hooks/useFoodRecognition.ts | Create | Photo upload and analysis |
| mobile/src/screens/PhotoAnalysisScreen.tsx | Create | Full analysis flow |

## Implementation Notes

### Photo Capture Flow
```typescript
const capturePhoto = async () => {
  if (!cameraRef.current) return

  const photo = await cameraRef.current.takePictureAsync({
    quality: 0.8,
    base64: false,
    skipProcessing: true, // Faster
  })

  setPhotoUri(photo.uri)
  setShowPreview(true)
}
```

### Photo Upload
```typescript
const analyzePhoto = async (uri: string) => {
  const formData = new FormData()
  formData.append('image', {
    uri,
    type: 'image/jpeg',
    name: 'meal.jpg',
  } as any)
  formData.append('mealType', selectedMealType)

  const response = await fetch(`${API_URL}/api/nutrition/log-image`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  })

  return response.json()
}
```

### Detection Results UI
```
┌─────────────────────────────────┐
│  ← Back       Meal Analysis     │
├─────────────────────────────────┤
│  ┌─────────────────────────┐    │
│  │ [Photo Preview]         │    │
│  │                         │    │
│  └─────────────────────────┘    │
│                                 │
│  Detected Foods:                │
│  ─────────────────────────────  │
│  ┌─────────────────────────┐    │
│  │ 🍗 Grilled Chicken      │    │
│  │ ████████████░░░ 92%     │    │
│  │ 231 cal | 43g protein   │    │
│  │ [1 serving ▼] [×]       │    │
│  └─────────────────────────┘    │
│  ┌─────────────────────────┐    │
│  │ 🍚 Brown Rice           │    │
│  │ ███████████░░░░ 88%     │    │
│  │ 216 cal | 5g protein    │    │
│  │ [1 cup ▼] [×]           │    │
│  └─────────────────────────┘    │
│  ┌─────────────────────────┐    │
│  │ 🥦 Steamed Broccoli     │    │
│  │ ████████████████ 95%    │    │
│  │ 55 cal | 4g protein     │    │
│  │ [1 cup ▼] [×]           │    │
│  └─────────────────────────┘    │
│                                 │
│  [+ Add Missing Item]           │
│                                 │
│  ─────────────────────────────  │
│  Meal Total:                    │
│  502 cal | 52g P | 56g C | 7g F │
│                                 │
│  [  Log as Lunch  ]             │
└─────────────────────────────────┘
```

### Confidence Handling
- High (>85%): Green indicator, auto-include
- Medium (60-85%): Yellow indicator, ask confirmation
- Low (<60%): Red indicator, suggest alternatives

### Portion Adjustment
Common portion options:
- 0.5x, 1x, 1.5x, 2x servings
- Custom grams input
- "Large/Medium/Small" quick options

### Error Handling
1. **No foods detected**: Offer manual entry or retake
2. **Low confidence all items**: Suggest better photo tips
3. **Network error**: Cache photo, retry later
4. **API quota exceeded**: Fall back to manual entry

## Definition of Done
- [ ] All acceptance criteria met
- [ ] No TypeScript errors
- [ ] Photo analysis completes in <5 seconds
- [ ] Confidence indicators are clear
- [ ] Users can correct all AI mistakes
- [ ] Final logged data is accurate
