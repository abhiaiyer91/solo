/**
 * FoodScanScreen - Complete food scanning experience
 * Polished UI with mode toggle, animations, and smooth transitions
 */

import React, { useState, useCallback } from 'react'
import {
  View,
  StyleSheet,
  StatusBar,
  Pressable,
  Text,
  SafeAreaView,
} from 'react-native'
import { CameraView, BarcodeScanningResult } from 'expo-camera'
import * as Haptics from 'expo-haptics'

import { useCamera, FOOD_BARCODE_TYPES } from '../hooks/useCamera'
import { useBarcodeScanner } from '../hooks/useBarcodeScanner'
import { useFoodRecognition } from '../hooks/useFoodRecognition'
import { CameraPermissionRequest, CameraPermissionDenied } from '../components/BarcodeScanner'
import { ScanModeToggle, type ScanMode } from '../components/ScanModeToggle'
import { ScanViewfinder } from '../components/ScanViewfinder'
import { ScanSuccess } from '../components/ScanSuccess'
import { ProductResult, ProductNotFound } from '../components/ProductResult'
import { type MealType } from '../components/MealTypeSelector'
import { RecentScansBar } from '../components/ScanHistory'
import {
  FoodDetectionResults,
  NoFoodsDetected,
  AnalyzingIndicator,
} from '../components/FoodDetectionResults'
import type { BarcodeProduct } from '../hooks/useBarcodeLookup'
import type { DetectedFood } from '../hooks/useFoodRecognition'

interface FoodScanScreenProps {
  onClose: () => void
  onLogSuccess?: () => void
}

/**
 * Main food scanning screen with polished UX
 */
export function FoodScanScreen({ onClose, onLogSuccess }: FoodScanScreenProps) {
  const {
    permissionStatus,
    isPermanentlyDenied,
    requestPermission,
    openAppSettings,
    facing,
    flash,
    toggleFacing,
    toggleFlash,
    setReady,
    isReady,
    cameraRef,
    takePicture,
  } = useCamera()

  const {
    state: scannerState,
    handleBarcodeScan,
    logProduct,
    resetScanner,
    isLogging,
  } = useBarcodeScanner()

  // Photo recognition state
  const {
    status: photoStatus,
    photoUri,
    foods,
    totals,
    analyzePhoto,
    updateFoodPortion,
    toggleFoodIncluded,
    removeFood,
    addManualFood,
    reset: resetPhotoRecognition,
    logMeal: logPhotoMeal,
    isLogging: isLoggingPhoto,
  } = useFoodRecognition()

  const [mode, setMode] = useState<ScanMode>('barcode')
  const [showSuccess, setShowSuccess] = useState(false)
  const [photoAnalysisState, setPhotoAnalysisState] = useState<
    'camera' | 'analyzing' | 'results' | 'no_foods'
  >('camera')

  // Handle barcode scan
  const handleBarcodeDetected = useCallback(async (result: BarcodeScanningResult) => {
    if (scannerState.status !== 'scanning') return

    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

    // Show success animation briefly
    setShowSuccess(true)

    // Process barcode
    await handleBarcodeScan(result.data)
  }, [scannerState.status, handleBarcodeScan])

  // Handle photo capture and analysis
  const handlePhotoCapture = useCallback(async () => {
    if (!isReady) return

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)

    const uri = await takePicture()
    if (uri) {
      setPhotoAnalysisState('analyzing')

      const result = await analyzePhoto(uri)

      if (!result || result.foods.length === 0) {
        setPhotoAnalysisState('no_foods')
      } else {
        setPhotoAnalysisState('results')
      }
    }
  }, [isReady, takePicture, analyzePhoto])

  // Handle logging photo-detected meal
  const handleLogPhotoMeal = useCallback(async (mealType: MealType) => {
    try {
      await logPhotoMeal({ mealType })
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      onLogSuccess?.()
      onClose()
    } catch (error) {
      console.error('Failed to log photo meal:', error)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    }
  }, [logPhotoMeal, onLogSuccess, onClose])

  // Handle adding manual food item
  const handleAddManualFood = useCallback((food: Omit<DetectedFood, 'id' | 'portion' | 'included'>) => {
    addManualFood(food)
    if (photoAnalysisState === 'no_foods') {
      setPhotoAnalysisState('results')
    }
  }, [addManualFood, photoAnalysisState])

  // Reset photo analysis and go back to camera
  const handleRetakePhoto = useCallback(() => {
    resetPhotoRecognition()
    setPhotoAnalysisState('camera')
  }, [resetPhotoRecognition])

  // Handle product log
  const handleLog = useCallback(async (mealType: MealType, servings: number) => {
    await logProduct(mealType, servings)
    onLogSuccess?.()

    // Haptic success
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)

    // Reset after brief delay
    setTimeout(() => {
      resetScanner()
      setShowSuccess(false)
    }, 500)
  }, [logProduct, onLogSuccess, resetScanner])

  // Reset to scanning
  const handleScanAnother = useCallback(() => {
    resetScanner()
    setShowSuccess(false)
    // Reset photo state when switching modes
    if (mode === 'photo') {
      resetPhotoRecognition()
      setPhotoAnalysisState('camera')
    }
  }, [resetScanner, mode, resetPhotoRecognition])

  // Handle mode change
  const handleModeChange = useCallback((newMode: ScanMode) => {
    setMode(newMode)
    // Reset photo state when switching to barcode mode
    if (newMode === 'barcode' && photoAnalysisState !== 'camera') {
      resetPhotoRecognition()
      setPhotoAnalysisState('camera')
    }
  }, [photoAnalysisState, resetPhotoRecognition])

  // Manual entry - navigate to manual food entry screen
  const handleManualEntry = useCallback(() => {
    // Navigate to manual food entry screen
    onClose()
    // Navigation is handled via expo-router in the parent
    // The parent component should navigate to /food/manual
  }, [onClose])

  // Select from history
  const handleSelectFromHistory = useCallback((product: BarcodeProduct) => {
    handleBarcodeScan(product.barcode)
  }, [handleBarcodeScan])

  // Permission states
  if (permissionStatus === 'undetermined') {
    return (
      <CameraPermissionRequest
        onRequestPermission={requestPermission}
        onSkip={onClose}
      />
    )
  }

  if (permissionStatus === 'denied') {
    return (
      <CameraPermissionDenied
        isPermanent={isPermanentlyDenied}
        onOpenSettings={openAppSettings}
        onSkip={onClose}
      />
    )
  }

  // Product result state
  if (scannerState.status === 'found') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <ProductResult
          product={scannerState.product}
          onLog={handleLog}
          onScanAnother={handleScanAnother}
          onManualEntry={handleManualEntry}
          isLogging={isLogging}
        />
      </SafeAreaView>
    )
  }

  // Not found state
  if (scannerState.status === 'not_found' || scannerState.status === 'error') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <ProductNotFound
          barcode={scannerState.barcode}
          onScanAnother={handleScanAnother}
          onManualEntry={handleManualEntry}
        />
      </SafeAreaView>
    )
  }

  // Photo mode: Analyzing state
  if (mode === 'photo' && photoAnalysisState === 'analyzing') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <AnalyzingIndicator />
      </SafeAreaView>
    )
  }

  // Photo mode: No foods detected
  if (mode === 'photo' && photoAnalysisState === 'no_foods') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <NoFoodsDetected
          onRetake={handleRetakePhoto}
          onManualEntry={() => {
            // Create empty placeholder and move to results
            setPhotoAnalysisState('results')
          }}
        />
      </SafeAreaView>
    )
  }

  // Photo mode: Results state - show detection results
  if (mode === 'photo' && photoAnalysisState === 'results') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <FoodDetectionResults
          photoUri={photoUri}
          foods={foods}
          totals={totals}
          onPortionChange={updateFoodPortion}
          onToggleInclude={toggleFoodIncluded}
          onRemove={removeFood}
          onAddManual={handleAddManualFood}
          onLogMeal={handleLogPhotoMeal}
          onRetake={handleRetakePhoto}
          isLogging={isLoggingPhoto}
        />
      </SafeAreaView>
    )
  }

  // Main scanning view
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Camera */}
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        flash={flash}
        onCameraReady={() => setReady(true)}
        barcodeScannerSettings={mode === 'barcode' ? {
          barcodeTypes: [...FOOD_BARCODE_TYPES],
        } : undefined}
        onBarcodeScanned={
          mode === 'barcode' && scannerState.status === 'scanning' && !showSuccess
            ? handleBarcodeDetected
            : undefined
        }
      >
        {/* Viewfinder Overlay */}
        <ScanViewfinder
          mode={mode}
          isScanning={scannerState.status === 'scanning' || scannerState.status === 'loading'}
          showSuccess={showSuccess}
        />

        {/* Success Animation - shows briefly during loading after barcode detected */}
        {showSuccess && scannerState.status === 'loading' && (
          <ScanSuccess
            visible={showSuccess}
            productName="Scanning..."
          />
        )}
      </CameraView>

      {/* Header */}
      <SafeAreaView style={styles.headerSafeArea}>
        <View style={styles.header}>
          <Pressable style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Scan Food</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Recent Scans */}
        <RecentScansBar onSelectProduct={handleSelectFromHistory} />
      </SafeAreaView>

      {/* Footer Controls */}
      <SafeAreaView style={styles.footerSafeArea}>
        <View style={styles.footer}>
          {/* Mode Toggle */}
          <ScanModeToggle
            mode={mode}
            onModeChange={handleModeChange}
            disabled={scannerState.status === 'loading' || photoStatus === 'analyzing'}
          />

          {/* Camera Controls */}
          <View style={styles.cameraControls}>
            <Pressable style={styles.controlButton} onPress={toggleFlash}>
              <Text style={styles.controlIcon}>{flash === 'on' ? '💡' : '🔦'}</Text>
              <Text style={styles.controlLabel}>Flash</Text>
            </Pressable>

            {mode === 'photo' && (
              <Pressable
                style={[styles.captureButton, !isReady && styles.captureButtonDisabled]}
                onPress={handlePhotoCapture}
                disabled={!isReady}
              >
                <View style={styles.captureButtonInner} />
              </Pressable>
            )}

            <Pressable style={styles.controlButton} onPress={toggleFacing}>
              <Text style={styles.controlIcon}>🔄</Text>
              <Text style={styles.controlLabel}>Flip</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    ...StyleSheet.absoluteFillObject,
  },
  headerSafeArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#FFF',
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#FFF',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  headerSpacer: {
    width: 44,
  },
  footerSafeArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  footer: {
    padding: 20,
    gap: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  cameraControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  controlButton: {
    alignItems: 'center',
    gap: 4,
  },
  controlIcon: {
    fontSize: 24,
  },
  controlLabel: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#888',
  },
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFF',
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  captureButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFF',
  },
})
