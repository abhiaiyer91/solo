/**
 * PhotoCapture - Photo capture component for food analysis
 * Camera with flash, grid overlay, and capture button
 */

import React, { useCallback, useState } from 'react'
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native'
import { CameraView } from 'expo-camera'
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  withSequence,
  withTiming,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { useCamera } from '../hooks/useCamera'
import { CameraPermissionRequest, CameraPermissionDenied } from './BarcodeScanner'

interface PhotoCaptureProps {
  onCapture: (uri: string) => void
  onClose: () => void
  isAnalyzing?: boolean
}

/**
 * Main photo capture component
 */
export function PhotoCapture({
  onCapture,
  onClose,
  isAnalyzing = false,
}: PhotoCaptureProps) {
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

  const [capturedUri, setCapturedUri] = useState<string | null>(null)
  const buttonScale = useSharedValue(1)
  const flashOpacity = useSharedValue(0)

  // Handle photo capture
  const handleCapture = useCallback(async () => {
    if (!isReady || isAnalyzing) return

    // Button animation
    buttonScale.value = withSequence(
      withTiming(0.9, { duration: 100 }),
      withSpring(1)
    )

    // Flash effect
    flashOpacity.value = withSequence(
      withTiming(1, { duration: 50 }),
      withTiming(0, { duration: 200 })
    )

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)

    const uri = await takePicture()
    if (uri) {
      setCapturedUri(uri)
    }
  }, [isReady, isAnalyzing, takePicture, buttonScale, flashOpacity])

  // Confirm captured photo
  const handleConfirm = useCallback(() => {
    if (capturedUri) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      onCapture(capturedUri)
    }
  }, [capturedUri, onCapture])

  // Retake photo
  const handleRetake = useCallback(() => {
    Haptics.selectionAsync()
    setCapturedUri(null)
  }, [])

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }))

  const flashAnimatedStyle = useAnimatedStyle(() => ({
    opacity: flashOpacity.value,
  }))

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

  // Preview captured photo
  if (capturedUri) {
    return (
      <PhotoPreview
        uri={capturedUri}
        onConfirm={handleConfirm}
        onRetake={handleRetake}
        isAnalyzing={isAnalyzing}
      />
    )
  }

  // Camera view
  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        flash={flash}
        onCameraReady={() => setReady(true)}
      >
        {/* Flash effect overlay */}
        <Animated.View
          style={[styles.flashOverlay, flashAnimatedStyle]}
          pointerEvents="none"
        />

        {/* Grid overlay */}
        <PhotoGridOverlay />

        {/* Header controls */}
        <View style={styles.header}>
          <Pressable style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Take Photo</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Hint text */}
        <View style={styles.hintContainer}>
          <Text style={styles.hintText}>
            Center your meal in the frame
          </Text>
        </View>

        {/* Footer controls */}
        <View style={styles.footer}>
          {/* Flash toggle */}
          <Pressable style={styles.controlButton} onPress={toggleFlash}>
            <Text style={styles.controlIcon}>{flash === 'on' ? '💡' : '🔦'}</Text>
            <Text style={styles.controlLabel}>Flash</Text>
          </Pressable>

          {/* Capture button */}
          <Animated.View style={buttonAnimatedStyle}>
            <Pressable
              style={[styles.captureButton, !isReady && styles.captureButtonDisabled]}
              onPress={handleCapture}
              disabled={!isReady}
            >
              <View style={styles.captureButtonInner} />
            </Pressable>
          </Animated.View>

          {/* Flip camera */}
          <Pressable style={styles.controlButton} onPress={toggleFacing}>
            <Text style={styles.controlIcon}>🔄</Text>
            <Text style={styles.controlLabel}>Flip</Text>
          </Pressable>
        </View>
      </CameraView>
    </View>
  )
}

/**
 * Grid overlay for photo composition
 */
function PhotoGridOverlay() {
  return (
    <View style={styles.gridContainer} pointerEvents="none">
      {/* Vertical lines */}
      <View style={[styles.gridLine, styles.gridLineVertical, { left: '33.3%' }]} />
      <View style={[styles.gridLine, styles.gridLineVertical, { left: '66.6%' }]} />
      {/* Horizontal lines */}
      <View style={[styles.gridLine, styles.gridLineHorizontal, { top: '33.3%' }]} />
      <View style={[styles.gridLine, styles.gridLineHorizontal, { top: '66.6%' }]} />
    </View>
  )
}

/**
 * Photo preview with confirm/retake options
 */
function PhotoPreview({
  uri,
  onConfirm,
  onRetake,
  isAnalyzing,
}: {
  uri: string
  onConfirm: () => void
  onRetake: () => void
  isAnalyzing: boolean
}) {
  return (
    <Animated.View
      entering={FadeIn}
      style={styles.previewContainer}
    >
      <Image source={{ uri }} style={styles.previewImage} />

      {/* Analyzing overlay */}
      {isAnalyzing && (
        <Animated.View
          entering={FadeIn}
          style={styles.analyzingOverlay}
        >
          <ActivityIndicator size="large" color="#00FF00" />
          <Text style={styles.analyzingText}>Analyzing your meal...</Text>
        </Animated.View>
      )}

      {/* Action buttons */}
      {!isAnalyzing && (
        <View style={styles.previewActions}>
          <Pressable style={styles.retakeButtonLarge} onPress={onRetake}>
            <Text style={styles.retakeButtonText}>Retake</Text>
          </Pressable>
          <Pressable style={styles.confirmButton} onPress={onConfirm}>
            <Text style={styles.confirmButtonText}>Use Photo</Text>
          </Pressable>
        </View>
      )}
    </Animated.View>
  )
}

/**
 * Compact camera capture for inline use
 */
export function PhotoCaptureCompact({
  onCapture,
  disabled = false,
}: {
  onCapture: (uri: string) => void
  disabled?: boolean
}) {
  const { permissionStatus, requestPermission, isReady, cameraRef, takePicture, setReady } = useCamera()

  const handleCapture = async () => {
    if (!isReady || disabled) return
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    const uri = await takePicture()
    if (uri) {
      onCapture(uri)
    }
  }

  if (permissionStatus !== 'granted') {
    return (
      <Pressable style={styles.compactPermission} onPress={requestPermission}>
        <Text style={styles.compactPermissionIcon}>📷</Text>
        <Text style={styles.compactPermissionText}>Enable Camera</Text>
      </Pressable>
    )
  }

  return (
    <View style={styles.compactContainer}>
      <CameraView
        ref={cameraRef}
        style={styles.compactCamera}
        onCameraReady={() => setReady(true)}
      />
      <Pressable
        style={[styles.compactCaptureButton, disabled && styles.compactCaptureDisabled]}
        onPress={handleCapture}
        disabled={disabled || !isReady}
      >
        <Text style={styles.compactCaptureText}>📸</Text>
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
  flashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFF',
  },
  gridContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  gridLineVertical: {
    width: 1,
    height: '100%',
  },
  gridLineHorizontal: {
    height: 1,
    width: '100%',
  },
  header: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
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
  hintContainer: {
    position: 'absolute',
    top: 130,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  hintText: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: 'rgba(255, 255, 255, 0.8)',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 40,
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
    width: 80,
    height: 80,
    borderRadius: 40,
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
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFF',
  },
  previewContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  previewImage: {
    flex: 1,
    resizeMode: 'contain',
  },
  analyzingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  analyzingText: {
    fontSize: 16,
    fontFamily: 'monospace',
    color: '#FFF',
  },
  previewActions: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    gap: 12,
  },
  retakeButtonLarge: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
  },
  retakeButtonText: {
    fontSize: 16,
    fontFamily: 'monospace',
    color: '#FFF',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#00FF00',
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#000',
  },
  compactContainer: {
    width: 120,
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
  },
  compactCamera: {
    ...StyleSheet.absoluteFillObject,
  },
  compactCaptureButton: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
  },
  compactCaptureDisabled: {
    opacity: 0.5,
  },
  compactCaptureText: {
    fontSize: 20,
  },
  compactPermission: {
    width: 120,
    height: 120,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  compactPermissionIcon: {
    fontSize: 32,
  },
  compactPermissionText: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#888',
  },
})
