# G157: Real Barcode Scanner Implementation

## Overview
Implement working barcode scanner that detects product barcodes in real-time, looks them up in Open Food Facts, and enables quick nutrition logging.

## Context
**Source:** Ideation loop --topic "food scanning with photo recognition and barcode detection"
**Design Doc:** `docs/mobile/food-scanning.md`
**Current State:** UI stub exists, useBarcodeLookup hook exists, needs real camera

## Acceptance Criteria
- [ ] Real-time barcode detection using camera
- [ ] Visual feedback when barcode detected (highlight, sound)
- [ ] Automatic lookup in Open Food Facts on detection
- [ ] Display product name, image, and macros
- [ ] Serving size selector (1 serving, custom grams)
- [ ] Quick log button to add to daily nutrition
- [ ] Handle "not found" gracefully with manual entry option
- [ ] Scan history (last 10 products)

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| mobile/src/components/BarcodeScanner.tsx | Modify | Real scanning implementation |
| mobile/src/components/ProductResult.tsx | Create | Scanned product display |
| mobile/src/components/ServingSelector.tsx | Create | Serving size picker |
| mobile/src/components/ScanHistory.tsx | Create | Recent scans list |
| mobile/src/hooks/useBarcodeScanner.ts | Create | Scanner state management |
| mobile/src/hooks/useScanHistory.ts | Create | Persist scan history |
| mobile/src/screens/ScanScreen.tsx | Create | Full scanning screen |

## Implementation Notes

### Barcode Detection Flow
```typescript
const handleBarcodeScanned = async ({ type, data }: BarcodeScanningResult) => {
  // Prevent duplicate scans
  if (lastScanned.current === data) return
  lastScanned.current = data

  // Haptic feedback
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

  // Lookup product
  const result = await lookupBarcode(data)

  if (result.found) {
    setProduct(result.product)
    setShowResult(true)
  } else {
    setNotFound(data)
  }
}
```

### Product Result UI
```
┌─────────────────────────────────┐
│ [Product Image]                 │
│                                 │
│ Cheerios Original               │
│ General Mills                   │
│                                 │
│ Per 100g:                       │
│   Calories: 357                 │
│   Protein: 11.1g                │
│   Carbs: 73.2g                  │
│   Fat: 4.8g                     │
│                                 │
│ ────────────────────────────── │
│                                 │
│ Serving: [1 serving ▼]  [39g]   │
│                                 │
│ This serving:                   │
│   139 cal | 4.3g protein        │
│                                 │
│ [  Log to Breakfast  ]          │
│                                 │
│ [Scan Another] [Manual Entry]   │
└─────────────────────────────────┘
```

### Scan History Storage
Use AsyncStorage with LRU eviction:
```typescript
const HISTORY_KEY = 'barcode_scan_history'
const MAX_HISTORY = 20

interface ScanHistoryItem {
  barcode: string
  product: BarcodeProduct
  scannedAt: string
}
```

### Not Found Handling
1. Show barcode number
2. Offer to search Open Food Facts by name
3. Offer manual entry
4. Option to contribute to Open Food Facts

## Definition of Done
- [ ] All acceptance criteria met
- [ ] No TypeScript errors
- [ ] Barcode detection is fast (<1s)
- [ ] Product lookup shows correct data
- [ ] Serving calculations are accurate
- [ ] Meal logs appear in daily nutrition
