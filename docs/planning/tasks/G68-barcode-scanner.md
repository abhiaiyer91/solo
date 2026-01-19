# G68: Mobile Barcode Scanner

## Overview

Implement barcode scanning in the mobile app using `expo-camera`. When a barcode is scanned, look up the product via the backend (which proxies to Open Food Facts) and display nutrition information for logging.

## Context

**Source:** Ideation loop --topic "nutrition tracking with open source scanning"
**Design Doc:** docs/mobile/nutrition-tracking.md
**Current State:** No barcode scanning. Backend barcode endpoint ready (G58).

## Acceptance Criteria

- [ ] Camera permission request with explanation
- [ ] Barcode scanner screen using expo-camera
- [ ] Support for EAN-13, EAN-8, UPC-A, UPC-E barcodes
- [ ] Call backend `/api/nutrition/barcode/:code` on scan
- [ ] Display product preview with nutrition info
- [ ] "Add to Log" button to save food
- [ ] Handle product not found gracefully
- [ ] Flash toggle for low-light scanning

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `mobile/src/components/BarcodeScanner.tsx` | Create | Camera barcode scanner |
| `mobile/src/components/FoodPreview.tsx` | Create | Scanned food display |
| `mobile/app/nutrition/scan.tsx` | Create | Scanner screen |
| `mobile/src/hooks/useBarcodeLookup.ts` | Create | API lookup hook |
| `mobile/package.json` | Modify | Ensure expo-camera installed |

## Implementation Notes

### Camera Permissions

```typescript
// mobile/src/hooks/useCameraPermission.ts
import { useCameraPermissions } from 'expo-camera';

export function useCameraPermission() {
  const [permission, requestPermission] = useCameraPermissions();

  return {
    hasPermission: permission?.granted ?? false,
    canAskAgain: permission?.canAskAgain ?? true,
    isLoading: !permission,
    requestPermission,
  };
}
```

### Barcode Scanner Component

```typescript
// mobile/src/components/BarcodeScanner.tsx
import { useState } from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

interface Props {
  onScan: (barcode: string) => void;
  onClose: () => void;
}

export function BarcodeScanner({ onScan, onClose }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [scanned, setScanned] = useState(false);

  if (!permission?.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.text}>Camera access needed to scan barcodes</Text>
        <Pressable onPress={requestPermission} style={styles.button}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </Pressable>
      </View>
    );
  }

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned) return; // Prevent multiple scans
    setScanned(true);
    onScan(data);
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        enableTorch={flashEnabled}
        barcodeScannerSettings={{
          barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e'],
        }}
        onBarcodeScanned={handleBarCodeScanned}
      >
        {/* Viewfinder overlay */}
        <View style={styles.overlay}>
          <View style={styles.viewfinder} />
        </View>
      </CameraView>

      {/* Controls */}
      <View style={styles.controls}>
        <Pressable onPress={onClose} style={styles.controlButton}>
          <Text style={styles.controlText}>✕ Cancel</Text>
        </Pressable>
        <Pressable 
          onPress={() => setFlashEnabled(!flashEnabled)} 
          style={styles.controlButton}
        >
          <Text style={styles.controlText}>
            {flashEnabled ? '💡 Flash On' : '🔦 Flash Off'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
```

### Barcode Lookup Hook

```typescript
// mobile/src/hooks/useBarcodeLookup.ts
import { useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';

interface Product {
  name: string;
  brand: string;
  servingSize: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  imageUrl: string;
  barcode: string;
  nutritionGrade: string;
}

interface BarcodeResponse {
  found: boolean;
  product?: Product;
  barcode?: string;
}

export function useBarcodeLookup() {
  return useMutation({
    mutationFn: async (barcode: string) => {
      const response = await api.get<BarcodeResponse>(
        `/api/nutrition/barcode/${barcode}`
      );
      return response;
    },
  });
}
```

### Food Preview Component

```typescript
// mobile/src/components/FoodPreview.tsx
interface Props {
  product: Product;
  onAdd: (servings: number, mealType: MealType) => void;
  onCancel: () => void;
}

export function FoodPreview({ product, onAdd, onCancel }: Props) {
  const [servings, setServings] = useState(1);
  const [mealType, setMealType] = useState<MealType>('snack');

  const scaledNutrition = {
    calories: Math.round(product.calories * servings),
    protein: Math.round(product.protein * servings * 10) / 10,
    carbs: Math.round(product.carbs * servings * 10) / 10,
    fat: Math.round(product.fat * servings * 10) / 10,
  };

  return (
    <View style={styles.container}>
      {product.imageUrl && (
        <Image source={{ uri: product.imageUrl }} style={styles.image} />
      )}
      
      <Text style={styles.name}>{product.name}</Text>
      <Text style={styles.brand}>{product.brand}</Text>
      <Text style={styles.serving}>Serving: {product.servingSize}</Text>

      {/* Macro grid */}
      <View style={styles.macroGrid}>
        <MacroBox label="Cals" value={scaledNutrition.calories} />
        <MacroBox label="Protein" value={`${scaledNutrition.protein}g`} />
        <MacroBox label="Carbs" value={`${scaledNutrition.carbs}g`} />
        <MacroBox label="Fat" value={`${scaledNutrition.fat}g`} />
      </View>

      {/* Servings selector */}
      <View style={styles.servingsRow}>
        <Text style={styles.label}>Servings:</Text>
        <Pressable onPress={() => setServings(Math.max(0.5, servings - 0.5))}>
          <Text style={styles.stepButton}>−</Text>
        </Pressable>
        <Text style={styles.servingsValue}>{servings}</Text>
        <Pressable onPress={() => setServings(servings + 0.5)}>
          <Text style={styles.stepButton}>+</Text>
        </Pressable>
      </View>

      {/* Meal type selector */}
      <View style={styles.mealTypeRow}>
        {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((type) => (
          <Pressable
            key={type}
            onPress={() => setMealType(type)}
            style={[
              styles.mealTypeButton,
              mealType === type && styles.mealTypeActive,
            ]}
          >
            <Text style={styles.mealTypeText}>{type}</Text>
          </Pressable>
        ))}
      </View>

      {/* Actions */}
      <Pressable 
        onPress={() => onAdd(servings, mealType)} 
        style={styles.addButton}
      >
        <Text style={styles.addButtonText}>ADD TO LOG</Text>
      </Pressable>
      
      <Pressable onPress={onCancel} style={styles.cancelButton}>
        <Text style={styles.cancelText}>Scan Different Item</Text>
      </Pressable>
    </View>
  );
}
```

### Scanner Screen

```typescript
// mobile/app/nutrition/scan.tsx
import { useState } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { BarcodeScanner } from '../../src/components/BarcodeScanner';
import { FoodPreview } from '../../src/components/FoodPreview';
import { useBarcodeLookup } from '../../src/hooks/useBarcodeLookup';
import { useLogFood } from '../../src/hooks/useLogFood';

export default function ScanScreen() {
  const router = useRouter();
  const [scannedProduct, setScannedProduct] = useState(null);
  const barcodeLookup = useBarcodeLookup();
  const logFood = useLogFood();

  const handleScan = async (barcode: string) => {
    const result = await barcodeLookup.mutateAsync(barcode);
    if (result.found && result.product) {
      setScannedProduct(result.product);
    } else {
      // Show not found UI
      Alert.alert(
        'Product Not Found',
        `Barcode ${barcode} not in database. Would you like to enter manually?`,
        [
          { text: 'Scan Again', onPress: () => setScannedProduct(null) },
          { text: 'Enter Manually', onPress: () => router.push('/nutrition/manual') },
        ]
      );
    }
  };

  const handleAdd = async (servings: number, mealType: MealType) => {
    await logFood.mutateAsync({
      mealType,
      foods: [{
        name: scannedProduct.name,
        servingSize: scannedProduct.servingSize,
        servings,
        calories: scannedProduct.calories * servings,
        protein: scannedProduct.protein * servings,
        carbs: scannedProduct.carbs * servings,
        fat: scannedProduct.fat * servings,
        barcode: scannedProduct.barcode,
      }],
    });
    router.back();
  };

  if (barcodeLookup.isPending) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#00ff00" />
        <Text style={styles.loadingText}>Looking up product...</Text>
      </View>
    );
  }

  if (scannedProduct) {
    return (
      <FoodPreview
        product={scannedProduct}
        onAdd={handleAdd}
        onCancel={() => setScannedProduct(null)}
      />
    );
  }

  return (
    <BarcodeScanner
      onScan={handleScan}
      onClose={() => router.back()}
    />
  );
}
```

## Testing Notes

- Test with real products (any packaged food with barcode)
- Test not-found case with invalid barcode
- Test in low light (flash should help)
- Test rapid scanning (should debounce)

## Definition of Done

- [ ] Camera permission requested properly
- [ ] Barcode scanner opens and scans
- [ ] Product lookup returns data
- [ ] Food preview shows macros
- [ ] Serving size adjustment works
- [ ] Add to Log saves to backend
- [ ] Not found case handled
- [ ] No TypeScript errors
