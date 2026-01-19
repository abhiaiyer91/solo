# G156: Mobile Camera Integration

## Overview
Set up real expo-camera integration for the mobile app to enable barcode scanning and food photo capture. Currently only a UI stub exists.

## Context
**Source:** Ideation loop --topic "food scanning with photo recognition and barcode detection"
**Design Doc:** `docs/mobile/food-scanning.md`
**Current State:** BarcodeScanner.tsx is a UI stub with simulated scanning

## Acceptance Criteria
- [ ] expo-camera installed and configured
- [ ] Camera permissions properly requested
- [ ] CameraView component with barcode scanning enabled
- [ ] Flash toggle functionality
- [ ] Camera flip (front/back) functionality
- [ ] Photo capture capability
- [ ] Proper handling of permission denied state
- [ ] Works on physical iOS device via EAS build

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| mobile/package.json | Modify | Add expo-camera dependency |
| mobile/app.json | Modify | Add camera plugin config |
| mobile/src/components/BarcodeScanner.tsx | Modify | Real camera implementation |
| mobile/src/components/FoodCamera.tsx | Create | Full food scanning camera |
| mobile/src/hooks/useCamera.ts | Create | Camera permission and state hook |
| mobile/src/lib/permissions.ts | Create | Permission request utilities |

## Implementation Notes

### expo-camera Setup
```bash
npx expo install expo-camera
```

### app.json Plugin Config
```json
{
  "expo": {
    "plugins": [
      [
        "expo-camera",
        {
          "cameraPermission": "Journey needs camera access to scan barcodes and food photos for nutrition tracking."
        }
      ]
    ]
  }
}
```

### Camera Component Pattern
```typescript
import { CameraView, useCameraPermissions } from 'expo-camera'

export function FoodCamera({ onCapture, onBarcodeScanned }) {
  const [permission, requestPermission] = useCameraPermissions()
  const [facing, setFacing] = useState<'front' | 'back'>('back')
  const [flash, setFlash] = useState<'off' | 'on'>('off')

  if (!permission?.granted) {
    return <PermissionRequest onRequest={requestPermission} />
  }

  return (
    <CameraView
      style={{ flex: 1 }}
      facing={facing}
      flash={flash}
      barcodeScannerSettings={{
        barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'qr']
      }}
      onBarcodeScanned={onBarcodeScanned}
    >
      {/* Overlay UI */}
    </CameraView>
  )
}
```

### Supported Barcode Types
- EAN-13 (most common for food)
- EAN-8
- UPC-A (US products)
- UPC-E
- QR codes (some products use these)

### Permission Handling
1. Check permission status on mount
2. Show explanation screen if not determined
3. Request permission with clear purpose
4. Handle "denied" gracefully with settings link
5. Cache permission state to avoid repeated requests

## Testing Notes
- Camera cannot be tested in simulator - requires physical device
- Use EAS build: `eas build --profile development --platform ios`
- Test permission flows on fresh install
- Test barcode scanning with various product types

## Definition of Done
- [ ] All acceptance criteria met
- [ ] No TypeScript errors
- [ ] Camera works on physical iOS device
- [ ] Barcode scanning detects products
- [ ] Photo capture saves image correctly
- [ ] Permission handling is smooth
