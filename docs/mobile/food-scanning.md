# Food Scanning System

## Overview
Enable users to quickly log nutrition data by taking photos of their food. The system supports two primary input methods:

1. **AI Food Recognition** - Take a photo of any food, get instant macro estimates
2. **Barcode Detection** - Detect barcodes in photos for packaged food lookup

## Goals
- Minimize friction in nutrition tracking (< 10 seconds to log a meal)
- Provide accurate macro estimates from photos
- Support both packaged foods (barcode) and prepared meals (AI)
- Work offline with cached data

## User Stories
- As a user, I want to take a photo of my meal and get instant macro estimates
- As a user, I want to scan a barcode and see nutrition info without typing
- As a user, I want to adjust serving sizes after scanning
- As a user, I want to see confidence levels for AI-detected foods
- As a user, I want to manually correct AI estimates if they're wrong

## Technical Design

### Input Methods Comparison

| Method | Speed | Accuracy | Best For |
|--------|-------|----------|----------|
| AI Photo Recognition | 2-3s | 80-95% | Prepared meals, restaurants |
| Barcode Scan | <1s | 99%+ | Packaged foods |
| Barcode Detection in Photo | 1-2s | 95%+ | Multiple products at once |
| Manual Entry | 30s+ | User-dependent | Fallback |

### Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      Mobile App                              │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐     ┌──────────────┐     ┌─────────────┐  │
│  │ Camera View  │────▶│ Mode Select  │◀────│ Quick Add   │  │
│  └──────────────┘     └──────────────┘     └─────────────┘  │
│         │                    │                    │          │
│         ▼                    ▼                    ▼          │
│  ┌──────────────┐     ┌──────────────┐     ┌─────────────┐  │
│  │Capture Photo │     │ Scan Barcode │     │ Search/Log  │  │
│  └──────────────┘     └──────────────┘     └─────────────┘  │
│         │                    │                    │          │
└─────────│────────────────────│────────────────────│──────────┘
          │                    │                    │
          ▼                    ▼                    ▼
┌─────────────────────────────────────────────────────────────┐
│                      Backend API                             │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐     ┌──────────────┐     ┌─────────────┐  │
│  │ POST /log-   │     │GET /barcode/ │     │POST /log    │  │
│  │   image      │     │    :code     │     │   (manual)  │  │
│  └──────────────┘     └──────────────┘     └─────────────┘  │
│         │                    │                               │
│         ▼                    ▼                               │
│  ┌──────────────┐     ┌──────────────┐                      │
│  │   LogMeal    │     │ Open Food    │                      │
│  │     API      │     │   Facts      │                      │
│  └──────────────┘     └──────────────┘                      │
└─────────────────────────────────────────────────────────────┘
```

### API Endpoints (Existing)

| Endpoint | Method | Description |
|----------|--------|-------------|
| /api/nutrition/log-image | POST | Analyze food photo with AI |
| /api/nutrition/barcode/:code | GET | Look up barcode in Open Food Facts |
| /api/nutrition/log | POST | Log meal manually |
| /api/nutrition/search | GET | Search foods by name |
| /api/nutrition/calculate | POST | Calculate macros for serving size |

### API Endpoints (New)

| Endpoint | Method | Description |
|----------|--------|-------------|
| /api/nutrition/analyze-photo | POST | Return detected foods without logging |
| /api/nutrition/detect-barcodes | POST | Extract barcodes from photo |

### Mobile Components Needed

1. **FoodCamera** - Full-screen camera with mode toggle (Photo/Barcode)
2. **PhotoPreview** - Show captured photo with detected foods overlay
3. **FoodDetectionResult** - Display AI-detected foods with confidence
4. **PortionSelector** - Adjust serving sizes
5. **BarcodeResult** - Show scanned product with quick log button
6. **NutritionSummary** - Show meal totals before confirming

### External Services

#### LogMeal API (Current)
- Used for AI food recognition
- Requires paid API key
- Processes: Segmentation → Food detection → Nutrition lookup
- Accuracy: ~80-90% for common foods

#### Open Food Facts (Current)
- Free, open-source barcode database
- 3M+ products
- Per-100g and per-serving nutrition data

#### Alternative/Enhancement Options

1. **[Spike Nutrition API](https://www.spikeapi.com/nutrition-ai-api)** - Best-in-class accuracy (97%)
2. **[FatSecret Platform API](https://platform.fatsecret.com/platform-api)** - Large database, image recognition
3. **[Calorie Mama](https://caloriemama.ai/api)** - Fast, good for mobile
4. **On-device ML** - TensorFlow Lite for offline barcode detection

### Barcode Detection Approaches

#### Option A: Real-time Camera Scanning (Current Direction)
- Use `expo-camera` with `onBarcodeScanned`
- Instant detection as user points camera
- Supported formats: EAN-13, EAN-8, UPC-A, UPC-E, QR codes

#### Option B: Photo Analysis for Barcodes
- User takes photo, system extracts barcodes
- Good for photos with multiple products
- Can use on-device ML or cloud service
- Supports batch scanning

#### Recommended: Hybrid Approach
1. Primary: Real-time camera scanning (fast, user expectation)
2. Secondary: Photo barcode extraction (batch, receipts)

## Requirements

### Must Have (P0)
- [ ] Real camera integration with expo-camera
- [ ] Real-time barcode scanning
- [ ] Product lookup from Open Food Facts
- [ ] Serving size adjustment
- [ ] Quick log to daily nutrition

### Should Have (P1)
- [ ] AI food photo analysis (LogMeal)
- [ ] Confidence display for detected foods
- [ ] Edit/correct detected items
- [ ] Recent scans history
- [ ] Offline barcode cache

### Nice to Have (P2)
- [ ] Batch barcode detection from photos
- [ ] Receipt scanning with OCR
- [ ] Meal suggestions based on history
- [ ] Custom food database entries
- [ ] Share nutrition data

## Open Questions
1. Should we explore Spike API as LogMeal alternative for better accuracy?
2. How to handle foods not in any database?
3. Should we allow users to contribute to Open Food Facts?
4. Privacy: Should food photos be stored or discarded after analysis?

## Dependencies
- expo-camera module (requires EAS build for physical device)
- LogMeal API key for AI features
- Open Food Facts API (free, no key needed)

## Implementation Order

1. **G156-camera-integration** - Real expo-camera setup
2. **G157-barcode-scanner-real** - Working barcode scanner
3. **G158-food-scan-ui** - Complete food scanning UX
4. **G159-photo-food-recognition** - AI food photo feature
5. **G160-offline-food-cache** - Offline support

## Sources
- [Spike Nutrition API](https://www.spikeapi.com/nutrition-ai-api)
- [FatSecret Platform API](https://platform.fatsecret.com/platform-api)
- [LogMeal Food AI API](https://logmeal.com/api/)
- [Calorie Mama API](https://caloriemama.ai/api)
- [AI food scanner research - NYU](https://www.sciencedaily.com/releases/2025/03/250318141833.htm)
- [Best AI calorie trackers 2026](https://www.jotform.com/ai/best-ai-calorie-tracker/)
