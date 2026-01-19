/**
 * FoodCamera - Full camera component for food scanning
 * Supports both barcode scanning and photo capture for AI recognition
 */

import React, { useState, useCallback } from 'react'
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Image,
} from 'react-native'
import { CameraView, BarcodeScanningResult } from 'expo-camera'
import { useCamera, FOOD_BARCODE_TYPES } from '../hooks/useCamera'
import { CameraPermissionRequest, CameraPermissionDenied } from './BarcodeScanner'

type CameraMode = 'barcode' | 'photo'

interface FoodCameraProps {
  /** Called when a barcode is scanned */
  onBarcodeScanned?: (barcode: string) => void
  /** Called when a photo is captured */
  onPhotoCapture?: (uri: string) => void
  /** Called when the camera is closed */
  onClose: () => void
  /** Initial mode: 'barcode' or 'photo' */
  initialMode?: CameraMode
  /** Show mode toggle */
  showModeToggle?: boolean
}

/**
 * Full Food Camera Component
 * Supports barcode scanning and photo capture modes
 */
export function FoodCamera({
  onBarcodeScanned,
  onPhotoCapture,
  onClose,
  initialMode = 'barcode',
  showModeToggle = true,
}: FoodCameraProps) {
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

  const [mode, setMode] = useState<CameraMode>(initialMode)
  const [scanned, setScanned] = useState(false)
  const [capturing, setCapturing] = useState(false)
  const [capturedUri, setCapturedUri] = useState<string | null>(null)

  // Handle barcode detection
  const handleBarcodeScanned = useCallback((result: BarcodeScanningResult) => {
    if (scanned || mode !== 'barcode') return

    setScanned(true)
    onBarcodeScanned?.(result.data)
  }, [scanned, mode, onBarcodeScanned])

  // Handle photo capture
  const handleCapture = useCallback(async () => {
    if (capturing || !isReady) return

    setCapturing(true)
    const uri = await takePicture()
    setCapturing(false)

    if (uri) {
      setCapturedUri(uri)
    }
  }, [capturing, isReady, takePicture])

  // Confirm captured photo
  const confirmPhoto = useCallback(() => {
    if (capturedUri && onPhotoCapture) {
      onPhotoCapture(capturedUri)
    }
    setCapturedUri(null)
  }, [capturedUri, onPhotoCapture])

  // Retake photo
  const retakePhoto = useCallback(() => {
    setCapturedUri(null)
  }, [])

  // Reset barcode scanner
  const resetScanner = useCallback(() => {
    setScanned(false)
  }, [])

  // Toggle camera mode
  const toggleMode = useCallback(() => {
    setMode(current => current === 'barcode' ? 'photo' : 'barcode')
    setScanned(false)
    setCapturedUri(null)
  }, [])

  // Permission not determined
  if (permissionStatus === 'undetermined') {
    return (
      <CameraPermissionRequest
        onRequestPermission={requestPermission}
        onSkip={onClose}
      />
    )
  }

  // Permission denied
  if (permissionStatus === 'denied') {
    return (
      <CameraPermissionDenied
        isPermanent={isPermanentlyDenied}
        onOpenSettings={openAppSettings}
        onSkip={onClose}
      />
    )
  }

  // Show captured photo preview
  if (capturedUri) {
    return (
      <View style={styles.container}>
        <Image source={{ uri: capturedUri }} style={styles.preview} />
        <View style={styles.previewControls}>
          <Pressable style={styles.retakeButton} onPress={retakePhoto}>
            <Text style={styles.retakeButtonText}>Retake</Text>
          </Pressable>
          <Pressable style={styles.confirmButton} onPress={confirmPhoto}>
            <Text style={styles.confirmButtonText}>Use Photo</Text>
          </Pressable>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        flash={flash}
        onCameraReady={() => setReady(true)}
        barcodeScannerSettings={mode === 'barcode' ? {
          barcodeTypes: [...FOOD_BARCODE_TYPES],
        } : undefined}
        onBarcodeScanned={mode === 'barcode' && !scanned ? handleBarcodeScanned : undefined}
      >
        {/* Overlay */}
        <View style={styles.overlay}>
          {/* Mode indicator */}
          {showModeToggle && (
            <View style={styles.modeIndicator}>
              <Text style={styles.modeText}>
                {mode === 'barcode' ? 'Scan Barcode' : 'Take Photo'}
              </Text>
            </View>
          )}

          {/* Barcode viewfinder */}
          {mode === 'barcode' && (
            <View style={styles.viewfinder}>
              <View style={styles.cornerTL} />
              <View style={styles.cornerTR} />
              <View style={styles.cornerBL} />
              <View style={styles.cornerBR} />
              {!scanned && <View style={styles.scanLine} />}
            </View>
          )}

          {/* Photo crosshair */}
          {mode === 'photo' && (
            <View style={styles.photoGuide}>
              <Text style={styles.photoGuideText}>Center food in frame</Text>
            </View>
          )}

          {/* Status text */}
          <Text style={styles.instruction}>
            {mode === 'barcode'
              ? scanned ? 'Barcode detected!' : 'Position barcode within frame'
              : 'Take a photo of your food'}
          </Text>

          {scanned && mode === 'barcode' && (
            <Pressable style={styles.rescanButton} onPress={resetScanner}>
              <Text style={styles.rescanButtonText}>Scan Another</Text>
            </Pressable>
          )}
        </View>
      </CameraView>

      {/* Controls */}
      <View style={styles.controls}>
        <View style={styles.controlRow}>
          <Pressable onPress={onClose} style={styles.controlButton}>
            <Text style={styles.controlText}>Cancel</Text>
          </Pressable>

          {mode === 'photo' && (
            <Pressable
              style={[styles.captureButton, !isReady && styles.captureButtonDisabled]}
              onPress={handleCapture}
              disabled={!isReady || capturing}
            >
              {capturing ? (
                <ActivityIndicator size="small" color="#000" />
              ) : (
                <View style={styles.captureButtonInner} />
              )}
            </Pressable>
          )}

          <View style={styles.secondaryControls}>
            <Pressable onPress={toggleFlash} style={styles.iconButton}>
              <Text style={styles.iconText}>{flash === 'on' ? '💡' : '🔦'}</Text>
            </Pressable>
            <Pressable onPress={toggleFacing} style={styles.iconButton}>
              <Text style={styles.iconText}>🔄</Text>
            </Pressable>
          </View>
        </View>

        {showModeToggle && (
          <Pressable style={styles.modeToggle} onPress={toggleMode}>
            <Text style={styles.modeToggleText}>
              {mode === 'barcode' ? 'Switch to Photo' : 'Switch to Barcode'}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  modeIndicator: {
    position: 'absolute',
    top: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  modeText: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#00FF00',
    fontWeight: 'bold',
  },
  viewfinder: {
    width: 280,
    height: 200,
    position: 'relative',
  },
  cornerTL: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 30,
    height: 30,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#00FF00',
  },
  cornerTR: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 30,
    height: 30,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: '#00FF00',
  },
  cornerBL: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 30,
    height: 30,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#00FF00',
  },
  cornerBR: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: '#00FF00',
  },
  scanLine: {
    position: 'absolute',
    left: 10,
    right: 10,
    top: '50%',
    height: 2,
    backgroundColor: '#00FF00',
    opacity: 0.8,
  },
  photoGuide: {
    width: 200,
    height: 200,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 20,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 10,
  },
  photoGuideText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  instruction: {
    marginTop: 20,
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#FFF',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  rescanButton: {
    marginTop: 20,
    backgroundColor: '#00FF00',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  rescanButtonText: {
    fontSize: 14,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#000',
  },
  controls: {
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  controlButton: {
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  controlText: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#FFF',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  captureButtonInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#000',
  },
  secondaryControls: {
    flexDirection: 'row',
    gap: 10,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 20,
  },
  modeToggle: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  modeToggleText: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#00FF00',
    textDecorationLine: 'underline',
  },
  preview: {
    flex: 1,
    resizeMode: 'contain',
  },
  previewControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  retakeButton: {
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  retakeButtonText: {
    fontSize: 16,
    fontFamily: 'monospace',
    color: '#FFF',
  },
  confirmButton: {
    padding: 16,
    backgroundColor: '#00FF00',
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#000',
  },
})
