/**
 * BarcodeScanner - Real camera barcode scanner component
 * Uses expo-camera for scanning food product barcodes
 */

import React, { useState, useCallback } from 'react'
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native'
import { CameraView, BarcodeScanningResult } from 'expo-camera'
import { useCamera, FOOD_BARCODE_TYPES } from '../hooks/useCamera'

interface BarcodeScannerProps {
  onScan: (barcode: string) => void
  onClose: () => void
}

/**
 * Barcode Scanner Component
 * Uses expo-camera CameraView for real barcode scanning
 */
export function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const {
    permissionStatus,
    isPermanentlyDenied,
    requestPermission,
    openAppSettings,
    facing,
    flash,
    toggleFlash,
    setReady,
    cameraRef,
  } = useCamera()

  const [scanned, setScanned] = useState(false)

  // Handle barcode detection
  const handleBarcodeScanned = useCallback((result: BarcodeScanningResult) => {
    if (scanned) return

    setScanned(true)
    onScan(result.data)
  }, [scanned, onScan])

  // Reset scanner for another scan
  const resetScanner = useCallback(() => {
    setScanned(false)
  }, [])

  // Permission not determined - show request screen
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

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        flash={flash}
        onCameraReady={() => setReady(true)}
        barcodeScannerSettings={{
          barcodeTypes: [...FOOD_BARCODE_TYPES],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
      >
        {/* Viewfinder Overlay */}
        <View style={styles.overlay}>
          <View style={styles.viewfinder}>
            <View style={styles.cornerTL} />
            <View style={styles.cornerTR} />
            <View style={styles.cornerBL} />
            <View style={styles.cornerBR} />

            {!scanned && (
              <View style={styles.scanLineContainer}>
                <View style={styles.scanLine} />
              </View>
            )}
          </View>

          <Text style={styles.instruction}>
            {scanned ? 'Barcode detected!' : 'Position barcode within frame'}
          </Text>

          {scanned && (
            <Pressable style={styles.rescanButton} onPress={resetScanner}>
              <Text style={styles.rescanButtonText}>Scan Another</Text>
            </Pressable>
          )}
        </View>
      </CameraView>

      {/* Controls */}
      <View style={styles.controls}>
        <Pressable onPress={onClose} style={styles.controlButton}>
          <Text style={styles.controlText}>Cancel</Text>
        </Pressable>
        <Pressable onPress={toggleFlash} style={styles.controlButton}>
          <Text style={styles.controlText}>
            {flash === 'on' ? 'Flash On' : 'Flash Off'}
          </Text>
        </Pressable>
      </View>
    </View>
  )
}

/**
 * Camera permission request component
 */
export function CameraPermissionRequest({
  onRequestPermission,
  onSkip,
}: {
  onRequestPermission: () => void
  onSkip: () => void
}) {
  const [isRequesting, setIsRequesting] = useState(false)

  const handleRequest = async () => {
    setIsRequesting(true)
    await onRequestPermission()
    setIsRequesting(false)
  }

  return (
    <View style={styles.permissionContainer}>
      <Text style={styles.permissionIcon}>📷</Text>
      <Text style={styles.permissionTitle}>Camera Access Needed</Text>
      <Text style={styles.permissionText}>
        To scan food barcodes, Journey needs access to your camera.
        Your camera feed is processed locally and never stored.
      </Text>

      <Pressable
        style={styles.permissionButton}
        onPress={handleRequest}
        disabled={isRequesting}
      >
        {isRequesting ? (
          <ActivityIndicator size="small" color="#000" />
        ) : (
          <Text style={styles.permissionButtonText}>Grant Access</Text>
        )}
      </Pressable>

      <Pressable onPress={onSkip}>
        <Text style={styles.skipText}>Enter manually instead</Text>
      </Pressable>
    </View>
  )
}

/**
 * Camera permission denied component
 */
export function CameraPermissionDenied({
  isPermanent,
  onOpenSettings,
  onSkip,
}: {
  isPermanent: boolean
  onOpenSettings: () => void
  onSkip: () => void
}) {
  return (
    <View style={styles.permissionContainer}>
      <Text style={styles.permissionIcon}>🚫</Text>
      <Text style={styles.permissionTitle}>Camera Access Denied</Text>
      <Text style={styles.permissionText}>
        {isPermanent
          ? 'Camera access was denied. To scan barcodes, please enable camera access in Settings.'
          : 'Camera access is required to scan food barcodes.'}
      </Text>

      {isPermanent && (
        <Pressable style={styles.permissionButton} onPress={onOpenSettings}>
          <Text style={styles.permissionButtonText}>Open Settings</Text>
        </Pressable>
      )}

      <Pressable onPress={onSkip}>
        <Text style={styles.skipText}>Enter manually instead</Text>
      </Pressable>
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
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  viewfinder: {
    width: 280,
    height: 200,
    position: 'relative',
    backgroundColor: 'transparent',
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
  scanLineContainer: {
    position: 'absolute',
    top: 0,
    left: 10,
    right: 10,
    bottom: 0,
    justifyContent: 'center',
  },
  scanLine: {
    height: 2,
    backgroundColor: '#00FF00',
    opacity: 0.8,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  controlButton: {
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  controlText: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#FFF',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#0a0a0a',
  },
  permissionIcon: {
    fontSize: 60,
    marginBottom: 20,
  },
  permissionTitle: {
    fontSize: 20,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 12,
  },
  permissionText: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#888',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  permissionButton: {
    backgroundColor: '#00FF00',
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 20,
    minWidth: 160,
    alignItems: 'center',
  },
  permissionButtonText: {
    fontSize: 16,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#000',
  },
  skipText: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#666',
    textDecorationLine: 'underline',
  },
})
