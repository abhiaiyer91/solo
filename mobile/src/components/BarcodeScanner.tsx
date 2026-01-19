/**
 * BarcodeScanner - Camera barcode scanner component
 * Note: Requires expo-camera to be installed
 */

import React, { useState } from 'react'
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native'

interface BarcodeScannerProps {
  onScan: (barcode: string) => void
  onClose: () => void
}

/**
 * Barcode Scanner Component
 * 
 * Note: This is a UI stub until expo-camera is configured.
 * Real implementation uses CameraView from expo-camera.
 */
export function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const [isSimulating, setIsSimulating] = useState(false)
  const [flashEnabled, setFlashEnabled] = useState(false)

  // Simulate a barcode scan for development
  const simulateScan = () => {
    setIsSimulating(true)
    setTimeout(() => {
      // Example barcode (Cheerios)
      onScan('016000275287')
      setIsSimulating(false)
    }, 1500)
  }

  return (
    <View style={styles.container}>
      {/* Camera Placeholder */}
      <View style={styles.cameraPlaceholder}>
        <View style={styles.viewfinder}>
          <View style={styles.cornerTL} />
          <View style={styles.cornerTR} />
          <View style={styles.cornerBL} />
          <View style={styles.cornerBR} />
          
          {isSimulating && (
            <View style={styles.scanLine} />
          )}
        </View>

        <Text style={styles.instruction}>
          Position barcode within frame
        </Text>

        {/* Development mode note */}
        <View style={styles.devNote}>
          <Text style={styles.devNoteText}>
            Camera requires expo-camera module
          </Text>
          <Pressable 
            style={styles.simulateButton}
            onPress={simulateScan}
            disabled={isSimulating}
          >
            {isSimulating ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <Text style={styles.simulateButtonText}>
                Simulate Scan (Dev)
              </Text>
            )}
          </Pressable>
        </View>
      </View>

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
  return (
    <View style={styles.permissionContainer}>
      <Text style={styles.permissionIcon}>📷</Text>
      <Text style={styles.permissionTitle}>Camera Access Needed</Text>
      <Text style={styles.permissionText}>
        To scan barcodes, we need access to your camera.
      </Text>
      
      <Pressable 
        style={styles.permissionButton}
        onPress={onRequestPermission}
      >
        <Text style={styles.permissionButtonText}>Grant Access</Text>
      </Pressable>
      
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
  cameraPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  viewfinder: {
    width: 280,
    height: 200,
    borderWidth: 2,
    borderColor: 'transparent',
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
    height: 2,
    backgroundColor: '#00FF00',
    top: '50%',
  },
  instruction: {
    marginTop: 20,
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#888',
  },
  devNote: {
    marginTop: 40,
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
  },
  devNoteText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#666',
    marginBottom: 12,
  },
  simulateButton: {
    backgroundColor: '#00FF00',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
    minWidth: 140,
    alignItems: 'center',
  },
  simulateButtonText: {
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#000',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  controlButton: {
    padding: 12,
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
  },
  permissionButton: {
    backgroundColor: '#00FF00',
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 20,
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
